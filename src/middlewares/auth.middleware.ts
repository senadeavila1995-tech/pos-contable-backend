import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token no enviado"
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      message: "Formato de token inválido"
    });
  }

  const token = parts[1];

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    if (
      !decoded.id ||
      !decoded.empresa_id
    ) {
      return res.status(401).json({
        message: "Token sin información de empresa"
      });
    }

    req.user = {
      id: Number(decoded.id),
      empresa_id: Number(decoded.empresa_id),
      rolId: decoded.rol_id !== undefined
        ? Number(decoded.rol_id)
        : undefined
    };

    console.log("JWT decoded:", decoded);

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido"
    });
  }
};
