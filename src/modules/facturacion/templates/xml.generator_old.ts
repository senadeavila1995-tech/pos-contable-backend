import fs from 'fs';
import path from 'path';
import { FacturaDIAN } from '../facturacion.types';

export class XMLGenerator {
  static generarFacturaXML(factura: FacturaDIAN, ventaId: number) {
    const dir = path.resolve('public/facturas');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const xmlContent = `
<Factura>
  <Numero>${factura.prefijo}-000001</Numero>
  <Cliente>
    <Nombre>${factura.cliente.nombre}</Nombre>
    <Identificacion>${factura.cliente.identificacion}</Identificacion>
    <Email>${factura.cliente.email}</Email>
  </Cliente>
  <Items>
    ${factura.items.map(item => `
    <Item>
      <Descripcion>${item.descripcion}</Descripcion>
      <Cantidad>${item.cantidad}</Cantidad>
      <PrecioUnitario>${item.precio_unitario}</PrecioUnitario>
      <Subtotal>${item.subtotal}</Subtotal>
    </Item>`).join('')}
  </Items>
  <Total>${factura.factura.total}</Total>
</Factura>
    `;
    const xmlPath = path.join(dir, `factura-${ventaId}.xml`);
    fs.writeFileSync(xmlPath, xmlContent);
    return xmlPath;
  }
}
