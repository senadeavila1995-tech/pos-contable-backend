// src/shared/types/Compra.ts
export interface CompraDetalle {
  producto_id: number;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
}

export interface Compra {
  id: number;
  proveedor_id: number;
  numero_factura?: string;
  fecha_compra: string;
  subtotal: number;
  impuestos: number;
 
  total: number;
  estado: string;
  creado_en: string;
  proveedor_nombre?: string; // para mostrar en tabla
  caja_id: number;
  detalles?: CompraDetalle[];
}
