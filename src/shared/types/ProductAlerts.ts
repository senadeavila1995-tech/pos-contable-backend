export interface ProductoAlerta {
  id: number;
  nombre: string;
  stock_unidades: number;
}

export interface AlertResponse {
  total: number;
  productos: ProductoAlerta[];
}
