import { Router } from "express";
import {
  listarCompras,
  obtenerCompra,
  crearCompra,
  anularCompra,
  comprasPorDia
} from "./compras.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listarCompras);
router.get("/dashboard/por-dia", comprasPorDia);
router.get("/:id", obtenerCompra);
router.post("/", crearCompra);
router.put("/:id/anular", anularCompra);

export default router;
