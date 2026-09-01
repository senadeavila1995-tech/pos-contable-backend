import { Router } from 'express';
import { FacturacionController } from './facturacion.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Todas las operaciones de facturación requieren JWT.
// El empresa_id se obtiene de req.user.empresa_id.
// Facturar venta
router.post('/:venta_id', authMiddleware, FacturacionController.facturarVenta);

// Obtener PDF
router.get('/:venta_id/pdf', authMiddleware, FacturacionController.obtenerPDF);

// Obtener XML
router.get('/:venta_id/xml', authMiddleware, FacturacionController.obtenerXML);

export default router;
