import { Request, Response } from "express";
import * as ProductService from "./products.service";

// Productos inactivos
export const getProductosInactivos = async (
  req: Request,
  res: Response
) => {
  try {
    const empresa_id = req.user.empresa_id;

    const productos =
      await ProductService.getProductosInactivos(
        empresa_id
      );

    res.json({
      total: productos.length,
      productos
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Error al obtener productos inactivos"
    });
  }
};

// Stock bajo
export const getStockBajo = async (
  req: Request,
  res: Response
) => {
  try {
    const empresa_id = req.user.empresa_id;

    const productos =
      await ProductService.getProductosStockBajo(
        empresa_id
      );

    res.json({
      total: productos.length,
      productos
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Error al obtener stock bajo"
    });
  }
};

// Listar productos
export const getAllProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const empresa_id = req.user.empresa_id;

    const products =
      await ProductService.getProducts(
        empresa_id
      );

    res.json(products);
  } catch (error: any) {
    console.error("ERROR REAL GET PRODUCTS:", error);

    res.status(500).json({
      message: "Error al obtener productos",
      error: error?.message || String(error),
      code: error?.code || null,
      sqlMessage: error?.sqlMessage || null
    });
  }
};

// Crear producto
export const createProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const empresa_id =
      req.user.empresa_id;

    const product =
      await ProductService.createProduct({
        ...req.body,
        empresa_id
      });

    res.status(201).json(product);
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      message:
        error.message ||
        "Error al crear producto"
    });
  }
};

// Obtener producto
export const getProductById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(
      req.params.id
    );

    const empresa_id =
      req.user.empresa_id;

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        message: "ID inválido"
      });
    }

    const product =
      await ProductService.getById(
        id,
        empresa_id
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Producto no encontrado"
      });
    }

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Error al obtener producto"
    });
  }
};

// Actualizar producto
export const updateProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(
      req.params.id
    );

    const empresa_id =
      req.user.empresa_id;

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        message: "ID inválido"
      });
    }

    const product =
      await ProductService.updateProduct(
        id,
        empresa_id,
        req.body
      );

    res.json(product);
  } catch (error: any) {
    console.error(error);

    res.status(404).json({
      message:
        error.message ||
        "Error al actualizar producto"
    });
  }
};

// Eliminar producto
export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(
      req.params.id
    );

    const empresa_id =
      req.user.empresa_id;

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        message: "ID inválido"
      });
    }

    await ProductService.deleteProduct(
      id,
      empresa_id
    );

    res.json({
      message:
        "Producto eliminado"
    });
  } catch (error: any) {
    console.error(error);

    res.status(404).json({
      message:
        error.message ||
        "Error al eliminar producto"
    });
  }
};
