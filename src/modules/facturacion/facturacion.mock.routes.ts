import { Router } from 'express';
import { FacturacionMockController } from './facturacion.mock.controller';

const router = Router();

// Endpoint de prueba: genera factura simulada
router.get('/mock/:id', FacturacionMockController.generarFacturaMock);

export default router;
