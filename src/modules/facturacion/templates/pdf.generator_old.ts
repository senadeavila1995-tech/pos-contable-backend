import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { FacturaDIAN } from '../facturacion.types';

export class PDFGenerator {
  static async generarFacturaPDF(factura: FacturaDIAN, ventaId: number) {
    const dir = path.resolve('public/facturas');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const pdfPath = path.join(dir, `factura-${ventaId}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.pipe(fs.createWriteStream(pdfPath));

    // Header
    doc.fontSize(20).text('FACTURA ELECTRÓNICA', { align: 'center' });
    doc.moveDown();

    // Empresa
    doc.fontSize(12).text(`Empresa: ${factura.empresa.razon_social}`);
    doc.text(`NIT: ${factura.empresa.nit}`);
    if (factura.empresa.direccion) doc.text(`Dirección: ${factura.empresa.direccion}`);
    if (factura.empresa.telefono) doc.text(`Teléfono: ${factura.empresa.telefono}`);
    if (factura.empresa.email) doc.text(`Email: ${factura.empresa.email}`);
    doc.moveDown();

    // Cliente
    doc.text(`Cliente: ${factura.cliente.nombre}`);
    doc.text(`Identificación: ${factura.cliente.identificacion}`);
    doc.text(`Email: ${factura.cliente.email}`);
    doc.text(`Fecha: ${factura.factura.fecha_emision}`);
    doc.text(`Medio de pago: ${factura.factura.medio_pago}`);
    doc.moveDown();

    // Items
    factura.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.descripcion} - ${item.cantidad} x ${item.precio_unitario} = ${item.subtotal}`);
    });

    doc.moveDown();
    doc.text(`TOTAL: ${factura.factura.total}`, { align: 'right' });

    doc.end();
    return pdfPath;
  }
}
