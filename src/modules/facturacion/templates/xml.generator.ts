import fs from 'fs';
import path from 'path';
import { FacturaDIAN } from '../facturacion.types';

export class XMLGenerator {

  static generarFacturaXML(
    factura: FacturaDIAN,
    venta_id: number
  ): string {

    const dir = path.resolve('public/facturas');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const xmlPath = path.join(
      dir,
      `factura_${venta_id}.xml`
    );

    const escapeXml = (value: any): string => {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const money = (value: number): string =>
      Number(value || 0).toFixed(2);

    const fecha = new Date(factura.factura.fecha_emision);

    const issueDate = fecha.toISOString().substring(0, 10);
    const issueTime = fecha.toISOString().substring(11, 19);

    const subtotal = Number(
      factura.factura.subtotal || 0
    );

    const totalIva = Number(
      factura.factura.total_iva || 0
    );

    const total = Number(
      factura.factura.total || 0
    );

    let xml = '';

    // ============================================================
    // UBL 2.1
    // ============================================================

    xml += '<?xml version="1.0" encoding="UTF-8"?>\n';

    xml += '<Invoice ';
    xml += 'xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" ';
    xml += 'xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" ';
    xml += 'xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" ';
    xml += 'xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2" ';
    xml += 'xmlns:sts="dian:gov:co:facturaelectronica:Structures-2-1"';
    xml += '>\n';

    // ============================================================
    // METADATOS UBL
    // ============================================================

    xml += `  <cbc:UBLVersionID>${escapeXml(
      factura.ubl.version
    )}</cbc:UBLVersionID>\n`;

    xml += `  <cbc:CustomizationID>${escapeXml(
      factura.ubl.customization_id
    )}</cbc:CustomizationID>\n`;

    xml += `  <cbc:ProfileID>${escapeXml(
      factura.ubl.profile_id
    )}</cbc:ProfileID>\n`;

    xml += `  <cbc:ProfileExecutionID>${escapeXml(
      factura.ubl.profile_execution_id
    )}</cbc:ProfileExecutionID>\n`;

    // ============================================================
    // IDENTIFICACIÓN DE FACTURA
    // ============================================================

    xml += `  <cbc:ID>${escapeXml(
      factura.factura.numero
    )}</cbc:ID>\n`;

    xml += `  <cbc:IssueDate>${issueDate}</cbc:IssueDate>\n`;

    xml += `  <cbc:IssueTime>${issueTime}</cbc:IssueTime>\n`;

    xml += `  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>\n`;

    xml += `  <cbc:DocumentCurrencyCode>${escapeXml(
      factura.factura.moneda
    )}</cbc:DocumentCurrencyCode>\n`;

    // ============================================================
    // EMISOR
    // ============================================================

    xml += '  <cac:AccountingSupplierParty>\n';

    xml += '    <cac:Party>\n';

    xml += '      <cac:PartyIdentification>\n';

    xml += `        <cbc:ID schemeID="31">${escapeXml(
      factura.empresa.nit
    )}</cbc:ID>\n`;

    xml += '      </cac:PartyIdentification>\n';

    xml += '      <cac:PartyName>\n';

    xml += `        <cbc:Name>${escapeXml(
      factura.empresa.nombre ||
      factura.empresa.razon_social
    )}</cbc:Name>\n`;

    xml += '      </cac:PartyName>\n';

    xml += '      <cac:PhysicalLocation>\n';

    xml += '        <cac:Address>\n';

    xml += `          <cbc:AddressLine>${escapeXml(
      factura.empresa.direccion
    )}</cbc:AddressLine>\n`;

    xml += '          <cac:Country>\n';

    xml += '            <cbc:IdentificationCode>CO</cbc:IdentificationCode>\n';

    xml += '          </cac:Country>\n';

    xml += '        </cac:Address>\n';

    xml += '      </cac:PhysicalLocation>\n';

    xml += '      <cac:PartyTaxScheme>\n';

    xml += `        <cbc:CompanyID schemeID="31">${escapeXml(
      factura.empresa.nit
    )}</cbc:CompanyID>\n`;

    xml += '        <cac:TaxScheme>\n';

    xml += '          <cbc:ID>01</cbc:ID>\n';

    xml += '          <cbc:Name>IVA</cbc:Name>\n';

    xml += '        </cac:TaxScheme>\n';

    xml += '      </cac:PartyTaxScheme>\n';

    xml += '      <cac:PartyLegalEntity>\n';

    xml += `        <cbc:RegistrationName>${escapeXml(
      factura.empresa.razon_social
    )}</cbc:RegistrationName>\n`;

    xml += `        <cbc:CompanyID schemeID="31">${escapeXml(
      factura.empresa.nit
    )}</cbc:CompanyID>\n`;

    xml += '      </cac:PartyLegalEntity>\n';

    xml += '    </cac:Party>\n';

    xml += '  </cac:AccountingSupplierParty>\n';

    // ============================================================
    // CLIENTE / ADQUIRENTE
    // ============================================================

    xml += '  <cac:AccountingCustomerParty>\n';

    xml += '    <cac:Party>\n';

    xml += '      <cac:PartyIdentification>\n';

    xml += `        <cbc:ID schemeID="13">${escapeXml(
      factura.cliente.identificacion
    )}</cbc:ID>\n`;

    xml += '      </cac:PartyIdentification>\n';

    xml += '      <cac:PartyName>\n';

    xml += `        <cbc:Name>${escapeXml(
      factura.cliente.nombre
    )}</cbc:Name>\n`;

    xml += '      </cac:PartyName>\n';

    xml += '      <cac:PhysicalLocation>\n';

    xml += '        <cac:Address>\n';

    if (factura.cliente.direccion) {
      xml += `          <cbc:AddressLine>${escapeXml(
        factura.cliente.direccion
      )}</cbc:AddressLine>\n`;
    }

    xml += '          <cac:Country>\n';

    xml += '            <cbc:IdentificationCode>CO</cbc:IdentificationCode>\n';

    xml += '          </cac:Country>\n';

    xml += '        </cac:Address>\n';

    xml += '      </cac:PhysicalLocation>\n';

    xml += '    </cac:Party>\n';

    xml += '  </cac:AccountingCustomerParty>\n';

    // ============================================================
    // FORMA Y MEDIO DE PAGO
    // ============================================================
    //
    // DIAN:
    // ID = forma de pago
    //   1 = Contado
    //   2 = Crédito
    //
    // PaymentMeansCode = medio de pago
    //   10 = Efectivo
    //   42 = Transferencia / cuenta
    //   48 = Tarjeta débito
    //   49 = Tarjeta crédito
    //
    // Para crédito se informa además la fecha de vencimiento.
    // ============================================================

    const formaPagoCodigo =
      factura.factura.forma_pago_codigo ||
      (factura.factura.forma_pago === 'CREDITO' ? '2' : '1');

    const medioPagoCodigo =
      factura.factura.medio_pago_codigo || '10';

    xml += '  <cac:PaymentMeans>\n';

    xml += `    <cbc:ID>${escapeXml(
      formaPagoCodigo
    )}</cbc:ID>\n`;

    xml += `    <cbc:PaymentMeansCode>${escapeXml(
      medioPagoCodigo
    )}</cbc:PaymentMeansCode>\n`;

    if (
      formaPagoCodigo === '2' &&
      factura.factura.plazo_pago
    ) {
      const fechaVencimiento = new Date();

      fechaVencimiento.setDate(
        fechaVencimiento.getDate() +
        Number(factura.factura.plazo_pago)
      );

      const dueDate =
        fechaVencimiento.toISOString().substring(0, 10);

      xml += `    <cbc:PaymentDueDate>${dueDate}</cbc:PaymentDueDate>\n`;
    }

    xml += '  </cac:PaymentMeans>\n';

    // ============================================================
    // IMPUESTOS
    // ============================================================
    //
    // Los impuestos se construyen agrupando las líneas por
    // porcentaje de IVA. Esto permite manejar correctamente:
    //
    //   IVA 19%
    //   IVA 5%
    //   IVA 0%
    //
    // sin asumir que todas las líneas tienen IVA 19%.
    // ============================================================

    const impuestos = new Map<number, {
      base: number;
      valor: number;
    }>();

    factura.items.forEach((item) => {
      const porcentaje = Number(
        item.impuesto?.porcentaje || 0
      );

      const base = Number(
        item.subtotal || 0
      );

      const valor = Number(
        item.impuesto?.valor || 0
      );

      const actual = impuestos.get(porcentaje) || {
        base: 0,
        valor: 0
      };

      actual.base = Number(
        (actual.base + base).toFixed(2)
      );

      actual.valor = Number(
        (actual.valor + valor).toFixed(2)
      );

      impuestos.set(porcentaje, actual);
    });

    if (impuestos.size > 0) {
      xml += '  <cac:TaxTotal>\n';

      xml += `    <cbc:TaxAmount currencyID="COP">${money(
        totalIva
      )}</cbc:TaxAmount>\n`;

      for (const [porcentaje, impuesto] of impuestos) {

        xml += '    <cac:TaxSubtotal>\n';

        xml += `      <cbc:TaxableAmount currencyID="COP">${money(
          impuesto.base
        )}</cbc:TaxableAmount>\n`;

        xml += `      <cbc:TaxAmount currencyID="COP">${money(
          impuesto.valor
        )}</cbc:TaxAmount>\n`;

        xml += '      <cac:TaxCategory>\n';

        xml += `        <cbc:Percent>${money(
          porcentaje
        )}</cbc:Percent>\n`;

        xml += '        <cac:TaxScheme>\n';

        if (porcentaje === 0) {
          xml += '          <cbc:ID>ZZ</cbc:ID>\n';
          xml += '          <cbc:Name>No objeto de impuesto</cbc:Name>\n';
        } else {
          xml += '          <cbc:ID>01</cbc:ID>\n';
          xml += '          <cbc:Name>IVA</cbc:Name>\n';
        }

        xml += '        </cac:TaxScheme>\n';

        xml += '      </cac:TaxCategory>\n';

        xml += '    </cac:TaxSubtotal>\n';
      }

      xml += '  </cac:TaxTotal>\n';
    }

    // ============================================================
    // TOTALES MONETARIOS
    // ============================================================

    xml += '  <cac:LegalMonetaryTotal>\n';

    xml += `    <cbc:LineExtensionAmount currencyID="COP">${money(
      subtotal
    )}</cbc:LineExtensionAmount>\n`;

    xml += `    <cbc:TaxExclusiveAmount currencyID="COP">${money(
      subtotal
    )}</cbc:TaxExclusiveAmount>\n`;

    xml += `    <cbc:TaxInclusiveAmount currencyID="COP">${money(
      total
    )}</cbc:TaxInclusiveAmount>\n`;

    xml += `    <cbc:PayableAmount currencyID="COP">${money(
      total
    )}</cbc:PayableAmount>\n`;

    xml += '  </cac:LegalMonetaryTotal>\n';

    // ============================================================
    // LÍNEAS DE FACTURA
    // ============================================================

    factura.items.forEach((item, index) => {

      xml += '  <cac:InvoiceLine>\n';

      xml += `    <cbc:ID>${index + 1}</cbc:ID>\n`;

      xml += `    <cbc:InvoicedQuantity unitCode="NIU">${item.cantidad}</cbc:InvoicedQuantity>\n`;

      xml += `    <cbc:LineExtensionAmount currencyID="COP">${money(
        item.subtotal
      )}</cbc:LineExtensionAmount>\n`;

      xml += '    <cac:Item>\n';

      xml += `      <cbc:Description>${escapeXml(
        item.descripcion
      )}</cbc:Description>\n`;

      xml += '      <cac:SellersItemIdentification>\n';

      xml += `        <cbc:ID>${escapeXml(
        item.codigo
      )}</cbc:ID>\n`;

      xml += '      </cac:SellersItemIdentification>\n';

      xml += '      <cac:ClassifiedTaxCategory>\n';

      const porcentajeIva = Number(
        item.impuesto?.porcentaje || 0
      );

      xml += `        <cbc:Percent>${money(
        porcentajeIva
      )}</cbc:Percent>\n`;

      xml += '        <cac:TaxScheme>\n';

      if (porcentajeIva === 0) {
        xml += '          <cbc:ID>ZZ</cbc:ID>\n';
        xml += '          <cbc:Name>No objeto de impuesto</cbc:Name>\n';
      } else {
        xml += '          <cbc:ID>01</cbc:ID>\n';
        xml += '          <cbc:Name>IVA</cbc:Name>\n';
      }

      xml += '        </cac:TaxScheme>\n';

      xml += '      </cac:ClassifiedTaxCategory>\n';

      xml += '    </cac:Item>\n';

      xml += '    <cac:Price>\n';

      xml += `      <cbc:PriceAmount currencyID="COP">${money(
        item.precio_unitario
      )}</cbc:PriceAmount>\n`;

      xml += '      <cbc:BaseQuantity unitCode="NIU">1</cbc:BaseQuantity>\n';

      xml += '    </cac:Price>\n';

      xml += '  </cac:InvoiceLine>\n';
    });

    // ============================================================
    // INFORMACIÓN DE PRUEBAS
    // ============================================================

    xml += '  <!-- DOCUMENTO GENERADO EN MODO DE PRUEBAS -->\n';

    xml += '  <!-- No ha sido transmitido ni validado por la DIAN. -->\n';

    if (factura.factura.cufe) {
      xml += `  <!-- CUFE-TEST: ${escapeXml(
        factura.factura.cufe
      )} -->\n`;
    }

    xml += '</Invoice>\n';

    fs.writeFileSync(
      xmlPath,
      xml,
      'utf8'
    );

    return xmlPath;
  }
}
