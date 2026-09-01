import { Request, Response } from "express";
import * as comprasService from "./compras.service";

/* ================== DASHBOARD ================== */

export const comprasPorDia = async (req: Request, res: Response) => {
  try {
    const empresa_id = req.user.empresa_id;

    const mes =
      req.query.mes !== undefined
        ? Number(req.query.mes)
        : undefined;

    const anio =
      req.query.anio !== undefined
        ? Number(req.query.anio)
        : undefined;

    const compras = await comprasService.comprasPorDia(
      empresa_id,
      mes,
      anio
    );

    res.json(compras);
  } catch (error: any) {
    console.error("🔥 ERROR DASHBOARD COMPRAS:", error);

    res.status(500).json({
      message: "Error al obtener compras por día",
      error: error.message,
    });
  }
};

/* ================== LISTAR ================== */
export const listarCompras = async (req: Request, res: Response) => {
  try {
    const empresa_id = req.user.empresa_id;

    const compras = await comprasService.listar(empresa_id);
    res.json(compras);
  } catch (error: any) {
    console.error("🔥 ERROR LISTAR COMPRAS:", error);

    res.status(500).json({
      message: "Error al listar compras",
      error: error.message,
    });
  }
};

/* ================== OBTENER ================== */
export const obtenerCompra = async (req: Request, res: Response) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    const compra = await comprasService.obtenerPorId(
      Number(id),
      empresa_id
    );

    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    res.json(compra);
  } catch (error: any) {
    console.error("🔥 ERROR OBTENER COMPRA:", error);

    res.status(500).json({
      message: "Error al obtener compra",
      error: error.message,
    });
  }
};

/* ================== CREAR ================== */

export const crearCompra = async (req: Request, res: Response) => {
  try {
    const empresa_id = req.user.empresa_id;
    const usuario_id = req.user.id;
    const data = req.body;

    const compraId = await comprasService.crear(
      data,
      usuario_id,
      empresa_id
    );

    res.status(201).json({
      message: "Compra registrada correctamente",
      id: compraId,
    });
  } catch (error: any) {
    console.error("🔥 ERROR CREAR COMPRA:", error);

    res.status(500).json({
      message: "Error al registrar compra",
      error: error.message,
    });
  }
};

/* ================== ANULAR ================== */
export const anularCompra = async (req: Request, res: Response) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    await comprasService.anular(Number(id), empresa_id);

    res.json({ message: "Compra anulada correctamente" });
  } catch (error: any) {
    console.error("🔥 ERROR ANULAR COMPRA:", error);

    res.status(500).json({
      message: "Error al anular compra",
      error: error.message,
    });
  }
};