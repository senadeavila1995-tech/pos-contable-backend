import { pool } from "../../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface Category {
  id: number;
  nombre: string;
  estado: number;
  empresa_id: number;
  creado_en: Date;
  actualizado_en: Date;
}

// Obtener categorías de la empresa autenticada
export const getCategories = async (
  empresa_id: number
): Promise<Category[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      id,
      nombre,
      estado,
      empresa_id,
      creado_en,
      actualizado_en
     FROM categorias
     WHERE empresa_id = ?
     ORDER BY creado_en DESC`,
    [empresa_id]
  );

  return rows as Category[];
};

// Obtener una categoría únicamente si pertenece a la empresa
export const getCategoryById = async (
  id: number,
  empresa_id: number
): Promise<Category | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      id,
      nombre,
      estado,
      empresa_id,
      creado_en,
      actualizado_en
     FROM categorias
     WHERE id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [id, empresa_id]
  );

  return rows.length ? (rows[0] as Category) : null;
};

// Crear categoría dentro de la empresa autenticada
export const createCategory = async (
  data: {
    nombre: string;
    empresa_id: number;
  }
): Promise<Category> => {
  const nombre = String(data.nombre).trim();

  if (!nombre) {
    throw new Error("El nombre de la categoría es requerido");
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO categorias (
      nombre,
      empresa_id,
      creado_en,
      actualizado_en
    )
    VALUES (?, ?, NOW(), NOW())`,
    [
      nombre,
      data.empresa_id
    ]
  );

  const category = await getCategoryById(
    result.insertId,
    data.empresa_id
  );

  if (!category) {
    throw new Error("No fue posible recuperar la categoría creada");
  }

  return category;
};

// Actualizar categoría únicamente dentro de la empresa
export const updateCategory = async (
  id: number,
  empresa_id: number,
  data: {
    nombre?: string;
    estado?: number;
  }
): Promise<Category> => {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.nombre !== undefined) {
    const nombre = String(data.nombre).trim();

    if (!nombre) {
      throw new Error("El nombre de la categoría es requerido");
    }

    fields.push("nombre = ?");
    values.push(nombre);
  }

  if (data.estado !== undefined) {
    const estadoNum = Number(data.estado) === 1 ? 1 : 0;

    fields.push("estado = ?");
    values.push(estadoNum);
  }

  if (fields.length === 0) {
    throw new Error("No hay campos válidos para actualizar");
  }

  values.push(id);
  values.push(empresa_id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE categorias
     SET ${fields.join(", ")},
         actualizado_en = NOW()
     WHERE id = ?
       AND empresa_id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw new Error("Categoría no encontrada");
  }

  const category = await getCategoryById(id, empresa_id);

  if (!category) {
    throw new Error("Categoría no encontrada");
  }

  return category;
};

// Eliminación lógica únicamente dentro de la empresa
export const deleteCategory = async (
  id: number,
  empresa_id: number
): Promise<void> => {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE categorias
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
    throw new Error("Categoría no encontrada");
  }
};
