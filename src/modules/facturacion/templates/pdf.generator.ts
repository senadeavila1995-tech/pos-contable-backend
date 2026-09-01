import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { FacturaDIAN } from '../facturacion.types';

export class PDFGenerator {

  static async generarFacturaPDF(
    factura: FacturaDIAN,
    venta_id: number
  ): Promise<string> {

    const dir = path.resolve('public/facturas');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const pdfPath = path.join(
      dir,
      `factura_${venta_id}.pdf`
    );

    const doc = new PDFDocument({
      size: 'A4',
      margin: 45
    });

    doc.pipe(fs.createWriteStream(pdfPath));

    const money = (value: number) =>
      `$${Number(value || 0).toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    const fechaEmision =
      new Date(factura.factura.fecha_emision)
        .toLocaleString('es-CO');

    // ============================================================
    // ENCABEZADO
    // ============================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(
        factura.empresa.razon_social || 'EMPRESA',
        { align: 'center' }
      );

    doc
      .font('Helvetica')
      .fontSize(10)
      .text(
        `NIT: ${factura.empresa.nit || '-'}`,
        { align: 'center' }
      );

    if (factura.empresa.direccion) {
      doc.text(
        factura.empresa.direccion,
        { align: 'center' }
      );
    }

    if (factura.empresa.telefono) {
      doc.text(
        `Teléfono: ${factura.empresa.telefono}`,
        { align: 'center' }
      );
    }

    if (factura.empresa.email) {
      doc.text(
        `Correo: ${factura.empresa.email}`,
        { align: 'center' }
      );
    }

    doc.moveDown();

    // ============================================================
    // TÍTULO
    // ============================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(15)
      .text(
        'FACTURA ELECTRÓNICA DE VENTA',
        { align: 'center' }
      );

    doc.moveDown(0.7);

    // ============================================================
    // INFORMACIÓN DE FACTURA
    // ============================================================

    const infoTop = doc.y;

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('DATOS DE LA FACTURA');

    doc
      .font('Helvetica')
      .fontSize(9)
      .text(`Número: ${factura.factura.numero}`)
      .text(`Prefijo: ${factura.prefijo}`)
      .text(`Fecha de emisión: ${fechaEmision}`)
      .text(`Moneda: ${factura.factura.moneda}`)
      .text(`Forma de pago: ${factura.factura.forma_pago}`)
      .text(`Medio de pago: ${factura.factura.medio_pago}`);

    if (factura.factura.resolucion) {
      doc.text(
        `Resolución: ${factura.factura.resolucion}`
      );
    }

    if (factura.factura.fecha_resolucion) {
      doc.text(
        `Fecha resolución: ${factura.factura.fecha_resolucion}`
      );
    }

    const infoBottom = doc.y;

    doc.y = infoTop;

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('ESTADO DEL DOCUMENTO', 320);

    doc
      .font('Helvetica')
      .fontSize(9)
      .text(
        factura.factura.estado_dian || 'PENDIENTE',
        320
      );

    doc.y = Math.max(infoBottom, doc.y);

    doc.moveDown();

    // ============================================================
    // CLIENTE
    // ============================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('DATOS DEL CLIENTE');

    doc
      .font('Helvetica')
      .fontSize(9)
      .text(
        `Nombre: ${factura.cliente.nombre}`
      )
      .text(
        `Identificación: ${factura.cliente.identificacion}`
      );

    if (factura.cliente.email) {
      doc.text(
        `Correo: ${factura.cliente.email}`
      );
    }

    if (factura.cliente.telefono) {
      doc.text(
        `Teléfono: ${factura.cliente.telefono}`
      );
    }

    if (factura.cliente.direccion) {
      doc.text(
        `Dirección: ${factura.cliente.direccion}`
      );
    }

    doc.moveDown();

    // ============================================================
    // DETALLE
    // ============================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('DETALLE DE LA VENTA');

    doc.moveDown(0.4);

    const tableTop = doc.y;

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('CÓDIGO', 45, tableTop, { width: 55 })
      .text('DESCRIPCIÓN', 100, tableTop, { width: 170 })
      .text('CANT.', 270, tableTop, { width: 45, align: 'right' })
      .text('V. UNITARIO', 315, tableTop, { width: 90, align: 'right' })
      .text('SUBTOTAL', 405, tableTop, { width: 105, align: 'right' });

    doc.moveTo(45, tableTop + 15)
      .lineTo(510, tableTop + 15)
      .stroke();

    let y = tableTop + 22;

    factura.items.forEach((item) => {

      if (y > 730) {
        doc.addPage();
        y = 50;
      }

      doc
        .font('Helvetica')
        .fontSize(8)
        .text(
          String(item.codigo),
          45,
          y,
          { width: 55 }
        )
        .text(
          item.descripcion,
          100,
          y,
          { width: 170 }
        )
        .text(
          String(item.cantidad),
          270,
          y,
          { width: 45, align: 'right' }
        )
        .text(
          money(item.precio_unitario),
          315,
          y,
          { width: 90, align: 'right' }
        )
        .text(
          money(item.subtotal),
          405,
          y,
          { width: 105, align: 'right' }
        );

      y += 22;
    });

    doc.y = y;

    doc.moveTo(300, doc.y)
      .lineTo(510, doc.y)
      .stroke();

    doc.moveDown(0.6);

    // ============================================================
    // TOTALES
    // ============================================================

    const subtotal = factura.items.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0
    );

    const total = Number(factura.factura.total || 0);

    const iva = Math.max(
      0,
      total - subtotal
    );

    doc
      .font('Helvetica')
      .fontSize(9)
      .text(
        `Subtotal: ${money(subtotal)}`,
        { align: 'right' }
      );

    doc.text(
      `IVA: ${money(iva)}`,
      { align: 'right' }
    );

    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(
        `TOTAL: ${money(total)}`,
        { align: 'right' }
      );

    // ============================================================
    // IDENTIFICACIÓN DE PRUEBAS
    // ============================================================

    doc.moveDown(1.5);

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('INFORMACIÓN DE FACTURACIÓN');

    doc
      .font('Helvetica')
      .fontSize(8);

    if (factura.factura.cufe) {
      doc.text(
        `CUFE: ${factura.factura.cufe}`
      );
    }

    doc.text(
      `Estado: ${factura.factura.estado_dian || 'PENDIENTE'}`
    );

    doc.moveDown(0.8);

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(
        'DOCUMENTO GENERADO EN MODO DE PRUEBAS'
      );

    doc
      .font('Helvetica')
      .fontSize(7)
      .text(
        'Este documento es una representación de prueba del sistema POS Contable. '
        + 'No constituye una factura electrónica validada ni transmitida a la DIAN.'
      );

    doc.end();

    return pdfPath;
  }
}
