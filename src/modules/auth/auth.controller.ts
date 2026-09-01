import { Request, Response } from "express";
import { AuthService } from "./auth.service";

// Listar empresas activas para el registro
export const getEmpresasRegistro = async (
  _req: Request,
  res: Response
) => {
  try {
    const empresas = await AuthService.getEmpresasActivas();

    res.json(empresas);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener empresas"
    });
  }
};

// Registro de usuario
export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      nombre,
      email,
      password,
      rol_id,
      empresa_id
    } = req.body;

    if (
      !nombre ||
      !email ||
      !password ||
      !rol_id ||
      !empresa_id
    ) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    const result = await AuthService.register({
      nombre: String(nombre).trim(),
      email: String(email).trim().toLowerCase(),
      password,
      rol_id: Number(rol_id),
      empresa_id: Number(empresa_id)
    });

    res.status(201).json(result);

  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      message: error.message
    });
  }
};

// Login
export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y password son obligatorios"
      });
    }

    const result = await AuthService.login(
      email,
      password
    );

    res.json(result);

  } catch (error: any) {
    res.status(401).json({
      message:
        error.message ||
        "Credenciales inválidas"
    });
  }
};
