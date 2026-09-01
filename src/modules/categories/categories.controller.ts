import { Request, Response } from "express";
import * as CategoryService from "./categories.service";

// Obtener categoría por ID
export const getCategoryById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const empresa_id = req.user.empresa_id;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido"
      });
    }

    const category = await CategoryService.getCategoryById(
      id,
      empresa_id
    );

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada"
      });
    }

    res.json(category);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener categoría"
    });
  }
};

// Obtener todas las categorías de la empresa
export const getAllCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const empresa_id = req.user.empresa_id;

    const categories = await CategoryService.getCategories(
      empresa_id
    );

    res.json(categories);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener categorías"
    });
  }
};

// Crear categoría dentro de la empresa
export const createCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { nombre } = req.body;
    const empresa_id = req.user.empresa_id;

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({
        message: "Nombre es requerido"
      });
    }

    const category = await CategoryService.createCategory({
      nombre: String(nombre).trim(),
      empresa_id
    });

    res.status(201).json(category);
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      message: error.message || "Error al crear categoría"
    });
  }
};

// Actualizar categoría
export const updateCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const empresa_id = req.user.empresa_id;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido"
      });
    }

    const { nombre, estado } = req.body;

    const category = await CategoryService.updateCategory(
      id,
      empresa_id,
      {
        nombre,
        estado
      }
    );

    res.json(category);
  } catch (error: any) {
    console.error(error);

    res.status(404).json({
      message: error.message || "Categoría no encontrada"
    });
  }
};

// Eliminar categoría
export const deleteCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const empresa_id = req.user.empresa_id;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido"
      });
    }

    await CategoryService.deleteCategory(
      id,
      empresa_id
    );

    res.json({
      message: "Categoría eliminada"
    });
  } catch (error: any) {
    console.error(error);

    res.status(404).json({
      message: error.message || "Categoría no encontrada"
    });
  }
};
