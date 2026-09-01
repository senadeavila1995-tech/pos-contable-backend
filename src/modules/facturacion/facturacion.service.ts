import { pool } from '../../config/database';
import fs from 'fs';
import crypto from 'crypto';
import { FacturarVentaInput } from './facturacion.types';
import { FacturacionMapper } from './facturacion.mapper';
import { PDFGenerator } from './templates/pdf.generator';
import { XMLGenerator } from './templates/xml.generator';
import { DianFacturacionProvider } from './facturacion.provider.dian';

export class FacturacionService {
  /**
   * Genera una factura en modo de pruebas.
   *
   * IMPORTANTE:
   * Este flujo genera PDF/XML y registra la factura en la BD,
   * pero todavía NO transmite la factura a DIAN.
   */
  static async facturarVenta({
    venta_id,
    empresa_id
  }: FacturarVentaInput) {

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // ============================================================
      // 1. Obtener venta
      // ============================================================

      const [ventas]: any = await connection.query(
        `SELECT
           v.*,
           c.nombre AS cliente_nombre,
           c.cc AS cliente_cc,
           c.documento AS cliente_documento,
           c.email AS cliente_email,
           c.telefono AS cliente_telefono,
           c.direccion AS cliente_direccion
         FROM ventas v
         LEFT JOIN clientes c
           ON c.id = v.cliente_id
         WHERE v.id = ?
           AND v.empresa_id = ?`,
        [venta_id, empresa_id]
      );

      if (!ventas.length) {
        throw new Error('La venta no existe para esta empresa');
      }

      const venta = ventas[0];

      // ============================================================
      // 2. Obtener detalle
      // ============================================================

      const [detalles]: any = await connection.query(
        `SELECT
           d.*,
           p.nombre AS producto_nombre,
           p.descripcion AS producto_descripcion
         FROM venta_detalle d
         INNER JOIN productos p
           ON p.id = d.producto_id
         WHERE d.venta_id = ?`,
        [venta_id]
      );

      if (!detalles.length) {
        throw new Error('La venta no tiene detalles');
      }

      venta.detalles = detalles.map((detalle: any) => ({
        ...detalle,
        nombre: detalle.producto_nombre,
        descripcion:
          detalle.producto_descripcion ||
          detalle.producto_nombre
      }));

      // ============================================================
      // 3. Verificar si ya está facturada
      // ============================================================

      const [existente]: any = await connection.query(
        `SELECT id, numero, estado_dian
         FROM facturas
         WHERE venta_id = ?`,
        [venta_id]
      );

      if (existente.length) {
        throw new Error(
          `La venta ya está facturada con ${existente[0].numero}`
        );
      }

      // ============================================================
      // 4. Obtener empresa real
      // ============================================================

      const [empresas]: any = await connection.query(
        `SELECT
           id,
           nombre,
           razon_social,
           nit,
           direccion,
           telefono,
           email,
           logo,
           estado
         FROM empresas
         WHERE id = ?
           AND estado = 1
         LIMIT 1`,
        [empresa_id]
      );

      if (!empresas.length) {
        throw new Error('La empresa no existe o está inactiva');
      }

      const empresa = empresas[0];

      // ============================================================
      // 5. Obtener configuración de facturación
      //    Bloqueamos la fila para evitar números duplicados.
      // ============================================================

      const [configs]: any = await connection.query(
        `SELECT
           id,
           empresa_id,
           resolucion,
           prefijo,
           numero_actual,
           fecha_resolucion,
           activo
         FROM configuracion_facturacion
         WHERE empresa_id = ?
           AND activo = 1
         LIMIT 1
         FOR UPDATE`,
        [empresa_id]
      );

      if (!configs.length) {
        throw new Error(
          'No hay configuración de facturación activa'
        );
      }

      const config = configs[0];

      // ============================================================
      // 6. Obtener plan activo
      // ============================================================

      const [planes]: any = await connection.query(
        `SELECT
           id,
           empresa_id,
           nombre,
           facturas_incluidas,
           facturas_usadas,
           activo
         FROM planes_facturacion
         WHERE empresa_id = ?
           AND activo = 1
           AND facturas_usadas < facturas_incluidas
         ORDER BY id ASC
         LIMIT 1
         FOR UPDATE`,
        [empresa_id]
      );

      if (!planes.length) {
        throw new Error(
          'No hay plan de facturación activo o se agotaron las facturas'
        );
      }

      const plan = planes[0];

      // ============================================================
      // 7. Generar número formal a partir de la configuración
      // ============================================================

      const prefijo = config.prefijo || 'FAC';

      const numeroActual = Number(config.numero_actual || 1);

      const numeroFacturaFinal =
        `${prefijo}-${String(numeroActual).padStart(6, '0')}`;

      // ============================================================
      // 8. Mapear factura
      // ============================================================

      const facturaDIAN =
        FacturacionMapper.mapVentaToFacturaDIAN(
          venta,
          empresa,
          config,
          numeroFacturaFinal
        );

      // ============================================================
      // 9. Enviar al proveedor DIAN
      //
      // En modo TEST se genera un CUFE simulado.
      // En modo DIAN posteriormente se conectará con DIAN real.
      // ============================================================

      const respuestaDIAN =
        await DianFacturacionProvider.enviarFactura(
          facturaDIAN
        );

      const cufeFinal = respuestaDIAN.cufe;
      const estadoDian = respuestaDIAN.estado_dian;

      // El CUFE y estado devueltos por el proveedor pasan a formar
      // parte del documento antes de generar XML y PDF.
      facturaDIAN.factura.cufe = cufeFinal;
      facturaDIAN.factura.estado_dian = estadoDian;

      // ============================================================
      // 10. Generar XML
      // ============================================================

      const xmlPath =
        XMLGenerator.generarFacturaXML(
          facturaDIAN,
          venta_id
        );

      // ============================================================
      // 11. Generar PDF
      // ============================================================

      // Los mismos datos deben aparecer en PDF, XML y BD.

      const pdfPath =
        await PDFGenerator.generarFacturaPDF(
          facturaDIAN,
          venta_id
        );

      // ============================================================
      // DEBUG: verificar datos de pago antes del INSERT
      // ============================================================

      console.log("========== FACTURA ANTES DEL INSERT ==========");
      console.log({
        venta_id,
        forma_pago: facturaDIAN.factura.forma_pago,
        forma_pago_codigo: facturaDIAN.factura.forma_pago_codigo,
        medio_pago: facturaDIAN.factura.medio_pago,
        medio_pago_codigo: facturaDIAN.factura.medio_pago_codigo,
        plazo_pago: facturaDIAN.factura.plazo_pago
      });
      console.log("==============================================");

      // ============================================================
      // 12. Insertar factura
      // ============================================================

      const [result]: any = await connection.query(
        `INSERT INTO facturas
          (
            venta_id,
            empresa_id,
            numero,
            prefijo,
            consecutivo,
            fecha_emision,
            fecha_validacion,
            subtotal,
            total_descuentos,
            total_iva,
            total,
            moneda,
            forma_pago,
            medio_pago,
            ambiente,
            tipo_documento,
            cufe,
            estado_dian,
            xml_url,
            pdf_url,
            creado_en
          )
         VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            NULL,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            NOW()
         )`,
        [
          venta_id,
          empresa_id,
          numeroFacturaFinal,
          prefijo,
          numeroActual,
          new Date(facturaDIAN.factura.fecha_emision),
          facturaDIAN.factura.subtotal,
          0,
          facturaDIAN.factura.total_iva,
          facturaDIAN.factura.total,
          facturaDIAN.factura.moneda,
          facturaDIAN.factura.forma_pago,
          facturaDIAN.factura.medio_pago,
          config.ambiente || "PRUEBAS",
          config.tipo_documento || "FACTURA_VENTA",
          cufeFinal,
          estadoDian,
          xmlPath,
          pdfPath
        ]
      );

      const facturaId = result.insertId;

      // ============================================================
      // 12.1 Registrar impuestos de la factura
      // ============================================================
      //
      // Los impuestos se agrupan por porcentaje para soportar
      // correctamente facturas con IVA 19%, 5% y 0%.
      //
      // No se registra una fila para IVA 0%, ya que no existe
      // impuesto causado.
      // ============================================================

      const impuestosAgrupados = new Map<
        number,
        {
          base_imponible: number;
          valor: number;
        }
      >();

      for (const item of facturaDIAN.items) {
        const porcentaje = Number(
          item.impuesto?.porcentaje || 0
        );

        const baseImponible = Number(
          item.subtotal || 0
        );

        const valor = Number(
          item.impuesto?.valor || 0
        );

        if (
          !Number.isFinite(porcentaje) ||
          porcentaje < 0
        ) {
          throw new Error(
            `Porcentaje de IVA inválido: ${porcentaje}`
          );
        }

        if (
          !Number.isFinite(baseImponible) ||
          baseImponible < 0
        ) {
          throw new Error(
            `Base imponible inválida para producto ${item.codigo}`
          );
        }

        if (
          !Number.isFinite(valor) ||
          valor < 0
        ) {
          throw new Error(
            `Valor de IVA inválido para producto ${item.codigo}`
          );
        }

        if (porcentaje === 0 || valor === 0) {
          continue;
        }

        const actual =
          impuestosAgrupados.get(porcentaje) || {
            base_imponible: 0,
            valor: 0
          };

        actual.base_imponible = Number(
          (
            actual.base_imponible +
            baseImponible
          ).toFixed(2)
        );

        actual.valor = Number(
          (
            actual.valor +
            valor
          ).toFixed(2)
        );

        impuestosAgrupados.set(
          porcentaje,
          actual
        );
      }

      for (const [
        porcentaje,
        impuesto
      ] of impuestosAgrupados.entries()) {

        await connection.query(
          `INSERT INTO factura_impuestos
            (
              factura_id,
              tipo_impuesto,
              base_imponible,
              porcentaje,
              valor,
              creado_en
            )
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            facturaId,
            'IVA',
            impuesto.base_imponible,
            porcentaje,
            impuesto.valor
          ]
        );
      }

      // ============================================================
      // 12.2 Registrar documentos generados
      // ============================================================

      const calcularHash = (ruta: string): string =>
        crypto
          .createHash('sha256')
          .update(fs.readFileSync(ruta))
          .digest('hex');

      await connection.query(
        `INSERT INTO factura_documentos
          (
            factura_id,
            tipo_documento,
            nombre_archivo,
            ruta_archivo,
            contenido_hash,
            creado_en
          )
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          facturaId,
          'XML',
          `factura_${venta_id}.xml`,
          xmlPath,
          calcularHash(xmlPath)
        ]
      );

      await connection.query(
        `INSERT INTO factura_documentos
          (
            factura_id,
            tipo_documento,
            nombre_archivo,
            ruta_archivo,
            contenido_hash,
            creado_en
          )
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          facturaId,
          'PDF',
          `factura_${venta_id}.pdf`,
          pdfPath,
          calcularHash(pdfPath)
        ]
      );

      // ============================================================
      // 13. Incrementar numeración real de configuración
      // ============================================================

      await connection.query(
        `UPDATE configuracion_facturacion
         SET numero_actual = numero_actual + 1
         WHERE id = ?`,
        [config.id]
      );

      // ============================================================
      // 14. Incrementar uso del plan
      // ============================================================

      await connection.query(
        `UPDATE planes_facturacion
         SET facturas_usadas = facturas_usadas + 1
         WHERE id = ?`,
        [plan.id]
      );

      await connection.commit();

      return {
        ok: true,
        factura_id: result.insertId,
        venta_id,
        numero: numeroFacturaFinal,
        prefijo,
        cufe: cufeFinal,
        estado_dian: estadoDian,
        pdf_url: pdfPath,
        xml_url: xmlPath
      };

    } catch (error) {
      await connection.rollback();
      throw error;

    } finally {
      connection.release();
    }
  }

  static async obtenerPDFPorVenta(ventaId: number) {
    const [rows]: any = await pool.query(
      `SELECT pdf_url
       FROM facturas
       WHERE venta_id = ?`,
      [ventaId]
    );

    if (!rows.length || !rows[0].pdf_url) {
      throw new Error('PDF no disponible');
    }

    return rows[0].pdf_url;
  }

  static async obtenerXMLPorVenta(ventaId: number) {
    const [rows]: any = await pool.query(
      `SELECT xml_url
       FROM facturas
       WHERE venta_id = ?`,
      [ventaId]
    );

    if (!rows.length || !rows[0].xml_url) {
      throw new Error('XML no disponible');
    }

    return rows[0].xml_url;
  }
}
