import { pool } from "../../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { ESTADO_PRODUCTO } from "../../shared/constants/estado-producto";

export interface ProductoInactivo {
  id: number;
  nombre: string;
  stock_unidades: number;
}

export interface ProductoStockBajo {
  id: number;
  nombre: string;
  stock_unidades: number;
}

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
  empresa_id: number;
  creado_en: Date;
  actualizado_en: Date;
  codigo_estandar: string | null;
  tipo_codigo_estandar: string | null;
  codigo_unidad_dian: string | null;
  descripcion_fiscal: string | null;
  es_servicio: number;
}

export type ProductInput = Omit<
  Product,
  "id" | "estado" | "creado_en" | "actualizado_en"
>;

// ==============================
// PRODUCTOS INACTIVOS
// ==============================
export const getProductosInactivos = async (
  empresa_id: number
): Promise<ProductoInactivo[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      id,
      nombre,
      stock_unidades
     FROM productos
     WHERE empresa_id = ?
       AND (
         estado = 0
         OR stock_unidades < 1
       )
     ORDER BY actualizado_en DESC
     LIMIT 10`,
    [empresa_id]
  );

  return rows as ProductoInactivo[];
};

// ==============================
// STOCK BAJO
// ==============================
export const getProductosStockBajo = async (
  empresa_id: number
): Promise<ProductoStockBajo[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      id,
      nombre,
      stock_unidades
     FROM productos
     WHERE empresa_id = ?
       AND estado = ?
       AND stock_unidades < ?
     ORDER BY stock_unidades ASC
     LIMIT 10`,
    [
      empresa_id,
      ESTADO_PRODUCTO.ACTIVO,
      15
    ]
  );

  return rows as ProductoStockBajo[];
};

// ==============================
// LISTAR PRODUCTOS
// ==============================
export const getProducts = async (
  empresa_id: number
): Promise<Product[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT *
     FROM productos
     WHERE empresa_id = ?
       AND estado = 1
     ORDER BY creado_en DESC`,
    [empresa_id]
  );

  return rows as Product[];
};

// ==============================
// VALIDAR CATEGORÍA DE EMPRESA
// ==============================
const validarCategoriaEmpresa = async (
  categoria_id: number,
  empresa_id: number
): Promise<void> => {
  const [categorias] = await pool.query<RowDataPacket[]>(
    `SELECT id
     FROM categorias
     WHERE id = ?
       AND empresa_id = ?
       AND estado = 1
     LIMIT 1`,
    [
      categoria_id,
      empresa_id
    ]
  );

  if (!categorias.length) {
    throw new Error(
      "La categoría seleccionada no existe, está inactiva o no pertenece a la empresa"
    );
  }
};

// ==============================
// CREAR PRODUCTO
// ==============================
export const createProduct = async (
  data: ProductInput
): Promise<Product> => {
  if (!data.nombre || !data.nombre.trim()) {
    throw new Error("El nombre del producto es requerido");
  }

  if (
    !Number.isFinite(Number(data.precio)) ||
    Number(data.precio) < 0
  ) {
    throw new Error("El precio del producto es inválido");
  }

  if (
    !Number.isInteger(Number(data.stock_unidades)) ||
    Number(data.stock_unidades) < 0
  ) {
    throw new Error("El stock del producto es inválido");
  }

  if (
    !Number.isInteger(Number(data.categoria_id)) ||
    Number(data.categoria_id) <= 0
  ) {
    throw new Error("La categoría del producto es inválida");
  }

  await validarCategoriaEmpresa(
    Number(data.categoria_id),
    Number(data.empresa_id)
  );

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO productos (
      nombre,
      codigo,
      descripcion,
      precio,
      unidad_medida,
      tipo_impuesto,
      porcentaje_iva,
      stock_unidades,
      peso_unitario,
      unidad_peso,
      talla,
      imagen_url,
      estado,
      categoria_id,
      codigo_estandar,
      tipo_codigo_estandar,
      codigo_unidad_dian,
      descripcion_fiscal,
      es_servicio,
      empresa_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre.trim(),
      data.codigo ?? null,
      data.descripcion ?? null,
      Number(data.precio),
      data.unidad_medida ?? null,
      data.tipo_impuesto ?? null,
      Number(data.porcentaje_iva ?? 0),
      Number(data.stock_unidades ?? 0),
      data.peso_unitario ?? null,
      data.unidad_peso ?? null,
      data.talla ?? null,
      data.imagen_url ?? null,
      Number(data.categoria_id),
      data.codigo_estandar ?? null,
      data.tipo_codigo_estandar ?? null,
      data.codigo_unidad_dian ?? null,
      data.descripcion_fiscal ?? null,
      Number(data.es_servicio ?? 0),
      Number(data.empresa_id)
    ]
  );

  const product = await getById(
    result.insertId,
    Number(data.empresa_id),
    true
  );

  if (!product) {
    throw new Error(
      "No fue posible recuperar el producto creado"
    );
  }

  return product;
};

// ==============================
// ACTUALIZAR PRODUCTO
// ==============================
export const updateProduct = async (
  id: number,
  empresa_id: number,
  data: Partial<Product>
): Promise<Product> => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID de producto inválido");
  }

  const existing = await getById(
    id,
    empresa_id,
    true
  );

  if (!existing) {
    throw new Error("Producto no encontrado");
  }

  const allowedFields = new Set([
    "nombre",
    "codigo",
    "descripcion",
    "precio",
    "unidad_medida",
    "tipo_impuesto",
    "porcentaje_iva",
    "stock_unidades",
    "peso_unitario",
    "unidad_peso",
    "talla",
    "imagen_url",
    "estado",
    "categoria_id",
    "codigo_estandar",
    "tipo_codigo_estandar",
    "codigo_unidad_dian",
    "descripcion_fiscal",
    "es_servicio"
  ]);

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (
      allowedFields.has(key) &&
      value !== undefined
    ) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new Error(
      "No hay campos válidos para actualizar"
    );
  }

  if (data.categoria_id !== undefined) {
    const categoriaId = Number(
      data.categoria_id
    );

    if (
      !Number.isInteger(categoriaId) ||
      categoriaId <= 0
    ) {
      throw new Error(
        "La categoría del producto es inválida"
      );
    }

    await validarCategoriaEmpresa(
      categoriaId,
      empresa_id
    );
  }

  values.push(id);
  values.push(empresa_id);

  const [result] =
    await pool.query<ResultSetHeader>(
      `UPDATE productos
       SET ${fields.join(", ")},
           actualizado_en = NOW()
       WHERE id = ?
         AND empresa_id = ?`,
      values
    );

  if (result.affectedRows === 0) {
    throw new Error(
      "Producto no encontrado"
    );
  }

  const product = await getById(
    id,
    empresa_id,
    true
  );

  if (!product) {
    throw new Error(
      "Producto no encontrado"
    );
  }

  return product;
};

// ==============================
// ELIMINACIÓN LÓGICA
// ==============================
export const deleteProduct = async (
  id: number,
  empresa_id: number
): Promise<void> => {
  const [result] =
    await pool.query<ResultSetHeader>(
      `UPDATE productos
       SET estado = 0,
           actualizado_en = NOW()
       WHERE id = ?
         AND empresa_id = ?`,
      [
        id,
        empresa_id
      ]
    );

  if (result.affectedRows === 0) {
    throw new Error(
      "Producto no encontrado"
    );
  }
};

// ==============================
// OBTENER PRODUCTO
// ==============================
export const getById = async (
  id: number,
  empresa_id: number,
  includeInactive = false
): Promise<Product | null> => {
  const [rows] =
    await pool.query<RowDataPacket[]>(
      `SELECT *
       FROM productos
       WHERE id = ?
         AND empresa_id = ?
         ${includeInactive ? "" : "AND estado = 1"}
       LIMIT 1`,
      [
        id,
        empresa_id
      ]
    );

  return rows.length
    ? (rows[0] as Product)
    : null;
};
