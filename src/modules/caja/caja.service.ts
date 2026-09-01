import { pool } from "../../config/database";

export async function obtenerCajaAbierta(
  usuario_id?: number,
  empresa_id?: number
) {
  let query = `
    SELECT c.*
    FROM caja c
    INNER JOIN usuarios u
      ON u.id = c.usuario_id
    WHERE c.estado = 'ABIERTA'
  `;

  const params: any[] = [];

  if (usuario_id !== undefined) {
    query += ` AND c.usuario_id = ?`;
    params.push(usuario_id);
  }

  if (empresa_id !== undefined) {
    query += ` AND u.empresa_id = ?`;
    params.push(empresa_id);
  }

  query += `
    ORDER BY c.id DESC
    LIMIT 1
  `;

  const [rows]: any = await pool.query(query, params);

  return rows.length ? rows[0] : null;
}

export async function abrirCaja(data: {
  monto_inicial: number;
  usuario_apertura_id: number;
  empresa_id: number;
}) {
  const montoInicial = Number(data.monto_inicial);
  const empresaId = Number(data.empresa_id);
  const usuarioId = Number(data.usuario_apertura_id);

  if (!Number.isFinite(montoInicial) || montoInicial < 0) {
    throw new Error("El monto inicial no es válido");
  }

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    throw new Error("empresa_id no es válido");
  }

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("usuario_id no es válido");
  }

  /*
   * Verificar que el usuario realmente pertenece
   * a la empresa indicada por el token.
   */
  const [usuarios]: any = await pool.query(
    `SELECT id, empresa_id
     FROM usuarios
     WHERE id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [usuarioId, empresaId]
  );

  if (!usuarios.length) {
    throw new Error(
      "El usuario no pertenece a la empresa indicada"
    );
  }

  /*
   * Un usuario puede tener solamente una caja abierta.
   * Una empresa puede tener varias cajas abiertas,
   * siempre que correspondan a usuarios diferentes.
   */
  const cajaUsuario = await obtenerCajaAbierta(
    usuarioId,
    empresaId
  );

  if (cajaUsuario) {
    throw new Error("El usuario ya tiene una caja abierta");
  }

  const [result]: any = await pool.query(
    `INSERT INTO caja (
      usuario_id,
      monto_inicial,
      fecha_apertura,
      estado
    )
    VALUES (?, ?, NOW(), 'ABIERTA')`,
    [
      usuarioId,
      montoInicial
    ]
  );

  const caja = await obtenerCajaAbierta(
    usuarioId,
    empresaId
  );

  return {
    id: result.insertId,
    fecha: caja?.fecha_apertura ?? new Date(),
    monto_inicial: montoInicial,
    usuario_apertura_id: usuarioId,
    empresa_id: empresaId,
    estado: "ABIERTA",
  };
}

export async function cerrarCaja(data: {
  caja_id: number;
  monto_final_real: number;
  usuario_cierre_id: number;
  empresa_id: number;
}) {
  const montoFinalReal = Number(data.monto_final_real);
  const cajaId = Number(data.caja_id);
  const usuarioId = Number(data.usuario_cierre_id);
  const empresaId = Number(data.empresa_id);

  if (!Number.isFinite(montoFinalReal) || montoFinalReal < 0) {
    throw new Error("El monto final real no es válido");
  }

  if (!Number.isInteger(cajaId) || cajaId <= 0) {
    throw new Error("caja_id no es válido");
  }

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("usuario_id no es válido");
  }

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    throw new Error("empresa_id no es válido");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
     * La caja debe:
     * 1. Existir.
     * 2. Pertenecer al usuario autenticado.
     * 3. Pertenecer a la empresa del token.
     * 4. Estar abierta.
     */
    const [cajaRows]: any = await connection.query(
      `SELECT
         c.*
       FROM caja c
       INNER JOIN usuarios u
         ON u.id = c.usuario_id
       WHERE c.id = ?
         AND c.usuario_id = ?
         AND u.empresa_id = ?
         AND c.estado = 'ABIERTA'
       LIMIT 1
       FOR UPDATE`,
      [
        cajaId,
        usuarioId,
        empresaId
      ]
    );

    if (!cajaRows.length) {
      throw new Error(
        "Caja no encontrada, no pertenece al usuario, no pertenece a la empresa o ya está cerrada"
      );
    }

    const caja = cajaRows[0];

    const [ventasRows]: any = await connection.query(
      `SELECT
         COALESCE(SUM(total), 0) AS total_ventas,
         COALESCE(
           SUM(
             CASE
               WHEN metodo_pago = 'EFECTIVO'
               THEN total
               ELSE 0
             END
           ),
           0
         ) AS total_efectivo
       FROM ventas
       WHERE caja_id = ?
         AND empresa_id = ?
         AND estado <> 'ANULADA'`,
      [
        cajaId,
        empresaId
      ]
    );

    const [comprasRows]: any = await connection.query(
      `SELECT
         COALESCE(SUM(total), 0) AS total_compras
       FROM compras
       WHERE caja_id = ?
         AND estado = 'REGISTRADA'`,
      [cajaId]
    );

    const totalVentas = Number(
      ventasRows[0]?.total_ventas || 0
    );

    const totalEfectivo = Number(
      ventasRows[0]?.total_efectivo || 0
    );

    const totalCompras = Number(
      comprasRows[0]?.total_compras || 0
    );

    const montoInicial = Number(
      caja.monto_inicial || 0
    );

    const efectivoEsperado =
      montoInicial +
      totalEfectivo -
      totalCompras;

    const diferencia =
      montoFinalReal -
      efectivoEsperado;

    await connection.query(
      `INSERT INTO cierre_caja (
        caja_id,
        total_ventas,
        total_efectivo,
        diferencia,
        fecha_cierre
      )
      VALUES (?, ?, ?, ?, NOW())`,
      [
        cajaId,
        totalVentas,
        totalEfectivo,
        diferencia
      ]
    );

    await connection.query(
      `UPDATE caja
       SET estado = 'CERRADA'
       WHERE id = ?
         AND usuario_id = ?
         AND estado = 'ABIERTA'`,
      [
        cajaId,
        usuarioId
      ]
    );

    await connection.commit();

    return {
      id: cajaId,
      estado: "CERRADA",
      monto_inicial: montoInicial,
      total_ventas: totalVentas,
      total_efectivo: totalEfectivo,
      total_compras: totalCompras,
      efectivo_esperado: Number(
        efectivoEsperado.toFixed(2)
      ),
      monto_final_real: Number(
        montoFinalReal.toFixed(2)
      ),
      diferencia: Number(
        diferencia.toFixed(2)
      ),
      fecha_cierre: new Date(),
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
