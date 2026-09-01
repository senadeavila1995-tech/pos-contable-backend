import { Router } from "express";

import {
  login,
  register,
  getEmpresasRegistro
} from "./auth.controller";

const router = Router();

// Empresas disponibles para el select del registro
router.get("/empresas", getEmpresasRegistro);

// Registro
router.post("/register", register);

// Login
router.post("/login", login);

export default router;
