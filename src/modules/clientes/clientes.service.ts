import { pool } from "../../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface Cliente {
  id: number;
  nombre: string;
  tipo_documento: string | null;
  numero_documento: string | null;
  digito_verificacion: string | null;
  tipo_persona: "NATURAL" | "JURIDICA" | null;
  cc: string | null;
  documento: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  municipio: string | null;
  departamento: string | null;
  codigo_municipio: string | null;
  pais: string | null;
  codigo_pais: string | null;
  regimen_fiscal: string | null;
  responsabilidad_fiscal: string | null;
  creado_en: Date;
  razon_social: string | null;
  nombre_comercial: string | null;
  primer_nombre: string | null;
  segundo_nombre: string | null;
  primer_apellido: string | null;
  segundo_apellido: string | null;
  codigo_postal: string | null;
  responsabilidad_tributaria: string | null;
  empresa_id: number;
}

export type ClienteInput = Omit<Cliente, "id" | "creado_en" | "empresa_id">;

const SELECT_CLIENTE = `
  SELECT
    id,
    nombre,
    tipo_documento,
    numero_documento,
    digito_verificacion,
    tipo_persona,
    cc,
    documento,
    telefono,
    email,
    direccion,
    municipio,
    departamento,
    codigo_municipio,
    pais,
    codigo_pais,
    regimen_fiscal,
    responsabilidad_fiscal,
    creado_en,
    razon_social,
    nombre_comercial,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    codigo_postal,
    responsabilidad_tributaria,
    empresa_id
  FROM clientes
`;

export const getClientes = async (
  empresa_id: number
): Promise<Cliente[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_CLIENTE}
     WHERE empresa_id = ?
     ORDER BY creado_en DESC`,
    [empresa_id]
  );

  return rows as Cliente[];
};

export const getClienteById = async (
  id: number,
  empresa_id: number
): Promise<Cliente | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_CLIENTE}
     WHERE id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [id, empresa_id]
  );

  return rows.length ? (rows[0] as Cliente) : null;
};

export const getClienteByDocumento = async (
  documento: string,
  empresa_id: number
): Promise<Cliente | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_CLIENTE}
     WHERE empresa_id = ?
       AND (
         numero_documento = ?
         OR documento = ?
         OR cc = ?
       )
     LIMIT 1`,
    [empresa_id, documento, documento, documento]
  );

  return rows.length ? (rows[0] as Cliente) : null;
};

export const createCliente = async (
  data: ClienteInput,
  empresa_id: number
): Promise<Cliente> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO clientes (
      nombre,
      tipo_documento,
      numero_documento,
      digito_verificacion,
      tipo_persona,
      cc,
      documento,
      telefono,
      email,
      direccion,
      municipio,
      departamento,
      codigo_municipio,
      pais,
      codigo_pais,
      regimen_fiscal,
      responsabilidad_fiscal,
      razon_social,
      nombre_comercial,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      codigo_postal,
      responsabilidad_tributaria,
      empresa_id,
      creado_en
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      NOW()
    )`,
    [
      data.nombre,
      data.tipo_documento,
      data.numero_documento,
      data.digito_verificacion,
      data.tipo_persona,
      data.cc,
      data.documento,
      data.telefono,
      data.email,
      data.direccion,
      data.municipio,
      data.departamento,
      data.codigo_municipio,
      data.pais,
      data.codigo_pais,
      data.regimen_fiscal,
      data.responsabilidad_fiscal,
      data.razon_social,
      data.nombre_comercial,
      data.primer_nombre,
      data.segundo_nombre,
      data.primer_apellido,
      data.segundo_apellido,
      data.codigo_postal,
      data.responsabilidad_tributaria,
      empresa_id
    ]
  );

  const cliente = await getClienteById(
    result.insertId,
    empresa_id
  );

  if (!cliente) {
    throw new Error("No fue posible recuperar el cliente creado");
  }

  return cliente;
};

export const updateCliente = async (
  id: number,
  data: Partial<ClienteInput>,
  empresa_id: number
): Promise<Cliente> => {
  const allowedFields = new Set([
    "nombre",
    "tipo_documento",
    "numero_documento",
    "digito_verificacion",
    "tipo_persona",
    "cc",
    "documento",
    "telefono",
    "email",
    "direccion",
    "municipio",
    "departamento",
    "codigo_municipio",
    "pais",
    "codigo_pais",
    "regimen_fiscal",
    "responsabilidad_fiscal",
    "razon_social",
    "nombre_comercial",
    "primer_nombre",
    "segundo_nombre",
    "primer_apellido",
    "segundo_apellido",
    "codigo_postal",
    "responsabilidad_tributaria"
  ]);

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.has(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new Error("No hay campos válidos para actualizar");
  }

  values.push(id, empresa_id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE clientes
     SET ${fields.join(", ")}
     WHERE id = ?
       AND empresa_id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw new Error("Cliente no encontrado");
  }

  const cliente = await getClienteById(
    id,
    empresa_id
  );

  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  return cliente;
};
