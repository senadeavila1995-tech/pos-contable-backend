import { pool } from "../../config/database";

export interface Proveedor {
  id: number;
  nombre: string;
  documento: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  estado: number;
  creado_en: Date;
  id_empresa: number;
}

export const listar = async (empresa_id: number): Promise<Proveedor[]> => {
  const [rows]: any = await pool.query(
    `SELECT
       id,
       nombre,
       documento,
       telefono,
       email,
       direccion,
       estado,
       creado_en,
       id_empresa
     FROM proveedores
     WHERE id_empresa = ?
     ORDER BY creado_en DESC`,
    [empresa_id]
  );

  return rows;
};

export const obtenerPorId = async (
  id: number,
  empresa_id: number
): Promise<Proveedor | null> => {
  const [rows]: any = await pool.query(
    `SELECT
       id,
       nombre,
       documento,
       telefono,
       email,
       direccion,
       estado,
       creado_en,
       id_empresa
     FROM proveedores
     WHERE id = ?
       AND id_empresa = ?
     LIMIT 1`,
    [id, empresa_id]
  );

  return rows.length ? rows[0] : null;
};

export const crear = async (
  data: {
    nombre: string;
    documento?: string | null;
    telefono?: string | null;
    email?: string | null;
    direccion?: string | null;
  },
  empresa_id: number
): Promise<Proveedor> => {
  if (!data.nombre?.trim()) {
    throw new Error("El nombre del proveedor es obligatorio");
  }

  const [result]: any = await pool.query(
    `INSERT INTO proveedores
      (nombre, documento, telefono, email, direccion, estado, creado_en, id_empresa)
     VALUES (?, ?, ?, ?, ?, 1, NOW(), ?)`,
    [
      data.nombre.trim(),
      data.documento ?? null,
      data.telefono ?? null,
      data.email ?? null,
      data.direccion ?? null,
      empresa_id
    ]
  );

  const proveedor = await obtenerPorId(result.insertId, empresa_id);

  if (!proveedor) {
    throw new Error("No se pudo recuperar el proveedor creado");
  }

  return proveedor;
};

export const actualizar = async (
  id: number,
  data: Partial<{
    nombre: string;
    documento: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    estado: number;
  }>,
  empresa_id: number
): Promise<Proveedor> => {
  const actual = await obtenerPorId(id, empresa_id);

  if (!actual) {
    throw new Error("Proveedor no encontrado");
  }

  const fields: string[] = [];
  const values: any[] = [];

  if (data.nombre !== undefined) {
    if (!data.nombre.trim()) {
      throw new Error("El nombre del proveedor no puede estar vacío");
    }

    fields.push("nombre = ?");
    values.push(data.nombre.trim());
  }

  if (data.documento !== undefined) {
    fields.push("documento = ?");
    values.push(data.documento);
  }

  if (data.telefono !== undefined) {
    fields.push("telefono = ?");
    values.push(data.telefono);
  }

  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email);
  }

  if (data.direccion !== undefined) {
    fields.push("direccion = ?");
    values.push(data.direccion);
  }

  if (data.estado !== undefined) {
    fields.push("estado = ?");
    values.push(data.estado ? 1 : 0);
  }

  if (!fields.length) {
    return actual;
  }

  values.push(id, empresa_id);

  await pool.query(
    `UPDATE proveedores
     SET ${fields.join(", ")}
     WHERE id = ?
       AND id_empresa = ?`,
    values
  );

  const actualizado = await obtenerPorId(id, empresa_id);

  if (!actualizado) {
    throw new Error("No se pudo recuperar el proveedor actualizado");
  }

  return actualizado;
};

export const eliminar = async (
  id: number,
  empresa_id: number
): Promise<void> => {
  const [result]: any = await pool.query(
    `UPDATE proveedores
     SET estado = 0
     WHERE id = ?
       AND id_empresa = ?`,
    [id, empresa_id]
  );

  if (!result.affectedRows) {
    throw new Error("Proveedor no encontrado");
  }
};
