import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import categoriesRoutes from "../modules/categories/categories.routes";
import productsRoutes from "../modules/products/products.routes";
import ventasRoutes from "../modules/sales/sales.routes";
import comprasRoutes from "../modules/compras/compras.routes";
import proveedoresRoutes from "../modules/proveedores/proveedores.routes";
import clientesRoutes from "../modules/clientes/clientes.routes";

import cajaRoutes from "../modules/caja/caja.routes";

const router = Router();

// =====================
// Rutas de cada módulo
// =====================

router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);

router.use("/ventas", ventasRoutes);
router.use("/compras", comprasRoutes);

router.use("/proveedores", proveedoresRoutes);
router.use("/clientes", clientesRoutes);

// 🧾 Caja
router.use("/caja", cajaRoutes);

// =====================
// Ruta de salud
// =====================
router.get("/health", (_, res) => {
  res.json({ ok: true });
});

export default router;
