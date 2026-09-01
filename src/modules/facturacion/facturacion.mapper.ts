import { FacturaDIAN } from './facturacion.types';

export class FacturacionMapper {

  /**
   * Convierte una venta del POS en la estructura interna
   * utilizada para generar la factura electrónica.
   *
   * Este flujo corresponde actualmente a modo de pruebas.
   */
  static mapVentaToFacturaDIAN(
    venta: any,
    empresa: any,
    config: any,
    numeroFactura: string
  ): FacturaDIAN {

    if (!venta.detalles || venta.detalles.length === 0) {
      throw new Error('La venta no tiene detalles');
    }

    // ============================================================
    // METADATOS UBL 2.1
    // ============================================================

    const ubl = {
      version: '2.1',
      customization_id: '10',
      profile_id: 'DIAN 2.1',
      profile_execution_id: '2'
    };

    // ============================================================
    // TOTALES FISCALES
    // ============================================================
    //
    // Los totales fiscales se construyen a partir de las líneas
    // fiscales que realmente serán enviadas al XML.
    //
    // Esto evita que el redondeo del documento sea diferente al
    // redondeo aplicado a cada InvoiceLine.
    // ============================================================

    const items = venta.detalles.map((item: any) => {
      const cantidad = Number(item.cantidad);

      const baseImponible = Number(
        item.base_imponible ?? item.subtotal ?? 0
      );

      const porcentajeIva = Number(
        item.porcentaje_iva ?? 0
      );

      const valorIva = Number(
        item.valor_iva ?? 0
      );

      const totalLinea = Number(
        item.total_linea ?? item.subtotal ?? 0
      );

      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw new Error(
          `Cantidad inválida para producto ${item.producto_id}`
        );
      }

      if (!Number.isFinite(baseImponible) || baseImponible < 0) {
        throw new Error(
          `Base imponible inválida para producto ${item.producto_id}`
        );
      }

      if (!Number.isFinite(porcentajeIva) || porcentajeIva < 0) {
        throw new Error(
          `Porcentaje de IVA inválido para producto ${item.producto_id}`
        );
      }

      if (!Number.isFinite(valorIva) || valorIva < 0) {
        throw new Error(
          `Valor de IVA inválido para producto ${item.producto_id}`
        );
      }

      if (!Number.isFinite(totalLinea) || totalLinea < 0) {
        throw new Error(
          `Total de línea inválido para producto ${item.producto_id}`
        );
      }

      return {
        codigo: Number(item.producto_id),

        descripcion:
          item.nombre ||
          item.descripcion ||
          'Producto',

        cantidad,

        precio_unitario: Number(
          (baseImponible / cantidad).toFixed(2)
        ),

        subtotal: Number(
          baseImponible.toFixed(2)
        ),

        impuesto: {
          tipo: item.tipo_impuesto || 'IVA',
          porcentaje: Number(
            porcentajeIva.toFixed(2)
          ),
          valor: Number(
            valorIva.toFixed(2)
          )
        },

        total_linea: Number(
          totalLinea.toFixed(2)
        )
      };
    });

    const total = Number(venta.total);

    if (!Number.isFinite(total)) {
      throw new Error('Total de venta inválido');
    }

    // Los totales del documento se obtienen de las mismas líneas
    // que serán escritas en InvoiceLine.
    const subtotalFiscal = Number(
      items
        .reduce((sum: number, item: any) => sum + item.subtotal, 0)
        .toFixed(2)
    );

    const totalIva = Number(
      items
        .reduce(
          (sum: number, item: any) => sum + item.impuesto.valor,
          0
        )
        .toFixed(2)
    );

    return {
      prefijo: config.prefijo || 'FAC',

      ubl,

      empresa: {
        nit: empresa.nit || '',
        razon_social:
          empresa.razon_social ||
          empresa.nombre ||
          'EMPRESA',

        nombre: empresa.nombre || '',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email: empresa.email || ''
      },

      cliente: {
        identificacion:
          venta.cliente_documento ||
          venta.cliente_cc ||
          '2222222222',

        nombre:
          venta.cliente_nombre ||
          'CONSUMIDOR FINAL',

        email:
          venta.cliente_email || '',

        telefono:
          venta.cliente_telefono || '',

        direccion:
          venta.cliente_direccion || ''
      },

      factura: {
        numero: numeroFactura,

        fecha_emision:
          new Date().toISOString(),

        moneda: 'COP',

        forma_pago:
          venta.forma_pago ||
          'CONTADO',

        forma_pago_codigo:
          String(
            venta.forma_pago_codigo ||
            (venta.forma_pago === 'CREDITO' ? '2' : '1')
          ),

        medio_pago:
          venta.medio_pago ||
          venta.metodo_pago ||
          'EFECTIVO',

        medio_pago_codigo:
          String(
            venta.medio_pago_codigo ||
            '10'
          ),

        plazo_pago:
          venta.plazo_pago ?? null,

        total,

        subtotal:
          subtotalFiscal,

        total_iva:
          Number(totalIva.toFixed(2)),

        resolucion:
          config.resolucion || '',

        fecha_resolucion:
          config.fecha_resolucion
            ? new Date(config.fecha_resolucion)
                .toLocaleDateString('es-CO')
            : '',

        estado_dian: 'PENDIENTE'
      },

      items
    };
  }
}
