import { Request, Response } from "express";
import * as proveedoresService from "./proveedores.service";

export const listarProveedores = async (req: Request, res: Response) => {
  try {
    const proveedores = await proveedoresService.listar(req.user.empresa_id);
    res.json(proveedores);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Error al listar proveedores"
    });
  }
};

export const obtenerProveedor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const proveedor = await proveedoresService.obtenerPorId(
      id,
      req.user.empresa_id
    );

    if (!proveedor) {
      return res.status(404).json({
        message: "Proveedor no encontrado"
      });
    }

    res.json(proveedor);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Error al obtener proveedor"
    });
  }
};

export const crearProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await proveedoresService.crear(
      req.body,
      req.user.empresa_id
    );

    res.status(201).json(proveedor);
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      message: error.message || "Error al crear proveedor"
    });
  }
};

export const actualizarProveedor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const proveedor = await proveedoresService.actualizar(
      id,
      req.body,
      req.user.empresa_id
    );

    res.json(proveedor);
  } catch (error: any) {
    console.error(error);

    const status = error.message === "Proveedor no encontrado"
      ? 404
      : 400;

    res.status(status).json({
      message: error.message || "Error al actualizar proveedor"
    });
  }
};

export const eliminarProveedor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    await proveedoresService.eliminar(
      id,
      req.user.empresa_id
    );

    res.json({
      message: "Proveedor eliminado correctamente"
    });
  } catch (error: any) {
    console.error(error);

    const status = error.message === "Proveedor no encontrado"
      ? 404
      : 400;

    res.status(status).json({
      message: error.message || "Error al eliminar proveedor"
    });
  }
};
