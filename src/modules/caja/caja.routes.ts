import { Router } from "express";
import { CajaController } from "./caja.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/abrir", authMiddleware, CajaController.abrir);
router.post("/cerrar", authMiddleware, CajaController.cerrar);
router.get("/actual", authMiddleware, CajaController.actual);

export default router;
