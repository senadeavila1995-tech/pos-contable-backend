import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { VentasController } from "./sales.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", VentasController.crearVenta);
router.get("/", VentasController.listarVentas);

router.get("/dashboard/resumen", VentasController.dashboardResumen);
router.get("/dashboard/top-productos", VentasController.dashboardTopProducts);
router.get("/dashboard/ventas-dia", VentasController.dashboardVentasPorDia);

router.get("/:id", VentasController.detalleVenta);
router.put("/:id/anular", VentasController.anularVenta);

export default router;
