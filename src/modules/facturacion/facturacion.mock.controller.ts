// facturacion.mock.controller.ts
import { Request, Response } from 'express';

export class FacturacionMockController {   // <-- export obligatorio
  static async generarFacturaMock(req: Request, res: Response) {
    const facturaId = Number(req.params.id);
    if (!facturaId || facturaId <= 0) {
      return res.status(400).json({ ok: false, message: 'ID inválido' });
    }

    const facturaSimulada = {
      id: facturaId,
      numero: `MOCK-${String(facturaId).padStart(6, '0')}`,
      cufe: `CUFE-MOCK-${String(facturaId).padStart(9, '0')}`,
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      xml_url: 'https://www.w3.org/TR/PNG/iso_8859-1.txt',
    };

    return res.status(200).json({ ok: true, factura: facturaSimulada });
  }
}
