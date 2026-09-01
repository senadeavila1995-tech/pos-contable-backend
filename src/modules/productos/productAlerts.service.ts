import api from "../../shared/api/axios";

/* ================== TIPOS ================== */
export interface ProductoAlerta {
  id: number;
  nombre: string;
  stock_unidades: number;
}

export interface AlertResponse {
  total: number;
  productos: ProductoAlerta[];
}

/* ================== REQUESTS ================== */
export const getStockBajo = async (): Promise<AlertResponse> => {
  const { data } = await api.get<AlertResponse>(
    "/products/alertas/stock-bajo"
  );
  return data;
};

export const getProductosInactivos = async (): Promise<AlertResponse> => {
  const { data } = await api.get<AlertResponse>(
    "/products/alertas/inactivos"
  );
  return data;
};
