export interface Product {
  id: number;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  precio: number;
  unidad_medida: string | null;
  tipo_impuesto: string | null;
  porcentaje_iva: number;
  stock_unidades: number;
  peso_unitario: number | null;
  unidad_peso: string | null;
  talla: string | null;
  imagen_url: string | null;
  estado: number;
  categoria_id: number;
  creado_en: string;
  actualizado_en: string;
  codigo_estandar: string | null;
  tipo_codigo_estandar: string | null;
  codigo_unidad_dian: string | null;
  descripcion_fiscal: string | null;
  es_servicio: number;
}

export type ProductDto = Omit<
  Product,
  "id" | "estado" | "creado_en" | "actualizado_en"
>;
