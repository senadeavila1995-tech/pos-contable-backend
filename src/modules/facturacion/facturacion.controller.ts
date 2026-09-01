import { Request, Response } from 'express';
import { FacturacionService } from './facturacion.service';

export class FacturacionController {
  static async facturarVenta(req: Request, res: Response) {
    try {
      const venta_id = Number(req.params.venta_id);
      const empresa_id = req.user?.empresa_id;
      if (!empresa_id) return res.status(400).json({ ok: false, message: 'empresa_id inválido' });

      const result = await FacturacionService.facturarVenta({ venta_id, empresa_id });
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  static async obtenerPDF(req: Request, res: Response) {
    try {
      const ventaId = Number(req.params.venta_id);
      const pdfPath = await FacturacionService.obtenerPDFPorVenta(ventaId);
      res.setHeader('Content-Type', 'application/pdf');
      return res.sendFile(pdfPath);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }

  static async obtenerXML(req: Request, res: Response) {
    try {
      const ventaId = Number(req.params.venta_id);
      const xmlPath = await FacturacionService.obtenerXMLPorVenta(ventaId);
      res.setHeader('Content-Type', 'application/xml');
      return res.sendFile(xmlPath);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }
}
