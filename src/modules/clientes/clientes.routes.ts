import { Router } from "express";

import {
  listarClientes,
  obtenerCliente,
  buscarPorDocumento,
  crearCliente,
  actualizarCliente
} from "./clientes.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, listarClientes);
router.get("/documento/:documento", authMiddleware, buscarPorDocumento);
router.get("/:id", authMiddleware, obtenerCliente);
router.post("/", authMiddleware, crearCliente);
router.put("/:id", authMiddleware, actualizarCliente);

export default router;
