// src/modules/products/products.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getStockBajo,
  getProductosInactivos,
} from "./products.controller";

const router = Router();

// Todas las rutas de productos requieren autenticación
router.use(authMiddleware);

/* ================== ALERTAS ================== */
router.get("/alertas/stock-bajo", getStockBajo);
router.get("/alertas/inactivos", getProductosInactivos);

/* ================== CRUD ================== */
router.get("/", getAllProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/:id", getProductById);

export default router;
