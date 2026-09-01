import api from "../../shared/api/axios";
import type { Product, ProductDto } from "../../shared/types/Product";


export const getProductById = (id: number) =>
  api.get<Product>(`/products/${id}`);


export const getProducts = () =>
  api.get<Product[]>("/products");

export const createProduct = (data: ProductDto) =>
  api.post<Product>("/products", data);

export const updateProduct = (id: number, data: Partial<ProductDto>) =>
  api.put<Product>(`/products/${id}`, data);

export const deleteProduct = (id: number) =>
  api.delete(`/products/${id}`);
