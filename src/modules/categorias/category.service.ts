import api from "../../shared/api/axios";
import type { AxiosResponse } from "axios";
import type { Category } from "../../shared/types/Category";

/**
 * Obtener todas las categorías
 */
export const getCategories = (): Promise<AxiosResponse<Category[]>> => {
  return api.get<Category[]>("/categories");
};

/**
 * Crear categoría
 */
export const createCategory = (
  data: { nombre: string }
): Promise<AxiosResponse<Category>> => {
  return api.post<Category>("/categories", data);
};

/**
 * Actualizar categoría
 */
export const updateCategory = (
  id: number,
  data: { nombre?: string; estado?: boolean }
): Promise<AxiosResponse<Category>> => {
  return api.put<Category>(`/categories/${id}`, data);
};

/**
 * Eliminar categoría
 */
export const deleteCategory = (id: number): Promise<AxiosResponse<void>> => {
  return api.delete(`/categories/${id}`);
};
