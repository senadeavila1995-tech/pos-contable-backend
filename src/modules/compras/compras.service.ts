// src/modules/compras/compras.service.ts
import { pool } from "../../config/database";

/* ================== TIPOS ================== */

export interface CompraDetalle {
  id?: number;
  producto_id: number;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
  nombre?: string;
}

export interface Compra {
  id?: number;
  id_empresa: number;
  proveedor_id: number;
  numero_factura: string;
  fecha_compra: string;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: "REGISTRADA" | "ANULADA";
  proveedor?: string;
  detalles?: CompraDetalle[];
}

/* ================== LISTAR ================== */

export const listar = async (empresa_id: number) => {
  const [rows]: any = await pool.query(
    `SELECT
       c.*,
       p.nombre AS proveedor
     FROM compras c
     INNER JOIN proveedores p ON p.id = c.proveedor_id
     WHERE c.id_empresa = ?
     ORDER BY c.fecha_compra DESC`,
    [empresa_id]
  );

  return rows;
};

/* ================== OBTENER ================== */

export const obtenerPorId = async (
  id: number,
  empresa_id: number
): Promise<Compra | null> => {
  const [compraRows]: any = await pool.query(
    `SELECT *
     FROM compras
     WHERE id = ?
       AND id_empresa = ?
     LIMIT 1`,
    [id, empresa_id]
  );

  if (!compraRows.length) {
    return null;
  }

  const [detalles]: any = await pool.query(
    `SELECT
       d.*,
       pr.nombre
     FROM compra_detalle d
     INNER JOIN productos pr
       ON pr.id = d.producto_id
     WHERE d.compra_id = ?
     ORDER BY d.id`,
    [id]
  );

  return {
    ...compraRows[0],
    detalles,
  };
};

/* ================== DASHBOARD ================== */

export const comprasPorDia = async (
  empresa_id: number,
  mes?: number,
  anio?: number
) => {
  const empresaId = Number(empresa_id);

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    throw new Error("Empresa inválida");
  }

  const params: any[] = [empresaId];

  let sql = `
    SELECT
      DATE(c.fecha_compra) AS dia,
      COALESCE(SUM(c.total), 0) AS total_dia
    FROM compras c
    WHERE c.id_empresa = ?
      AND c.estado = 'REGISTRADA'
  `;

  if (
    Number.isInteger(Number(mes)) &&
    Number(mes) >= 1 &&
    Number(mes) <= 12
  ) {
    sql += ` AND MONTH(c.fecha_compra) = ?`;
    params.push(Number(mes));
  }

  if (
    Number.isInteger(Number(anio)) &&
    Number(anio) >= 2000 &&
    Number(anio) <= 2100
  ) {
    sql += ` AND YEAR(c.fecha_compra) = ?`;
    params.push(Number(anio));
  }

  sql += `
    GROUP BY DATE(c.fecha_compra)
    ORDER BY dia DESC
  `;

  const [rows]: any = await pool.query(sql, params);

  return rows;
};

/* ================== CREAR ================== */

export const crear = async (
  data: Compra,
  usuario_id: number,
  empresa_id: number
): Promise<number> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      proveedor_id,
      numero_factura,
      fecha_compra,
      subtotal,
      impuestos,
      total,
      detalles,
    } = data;

    if (!Number.isInteger(Number(proveedor_id)) || Number(proveedor_id) <= 0) {
      throw new Error("El proveedor es inválido");
    }

    if (!detalles || detalles.length === 0) {
      throw new Error("La compra debe tener al menos un producto");
    }

    /*
     * El proveedor debe pertenecer a la empresa
     * y estar activo.
     */
    const [proveedores]: any = await connection.query(
      `SELECT id
       FROM proveedores
       WHERE id = ?
         AND id_empresa = ?
         AND estado = 1
       LIMIT 1`,
      [proveedor_id, empresa_id]
    );

    if (!proveedores.length) {
      throw new Error(
        "El proveedor no pertenece a la empresa o está inactivo"
      );
    }

    /*
     * Validar y bloquear los productos durante
     * toda la transacción.
     */
    for (const item of detalles) {
      const productoId = Number(item.producto_id);
      const cantidad = Number(item.cantidad);
      const costoUnitario = Number(item.costo_unitario);
      const subtotalDetalle = Number(item.subtotal);

      if (!Number.isInteger(productoId) || productoId <= 0) {
        throw new Error("Producto inválido en el detalle de compra");
      }

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new Error(
          `Cantidad inválida para producto ${productoId}`
        );
      }

      if (!Number.isFinite(costoUnitario) || costoUnitario < 0) {
        throw new Error(
          `Costo unitario inválido para producto ${productoId}`
        );
      }

      if (!Number.isFinite(subtotalDetalle) || subtotalDetalle < 0) {
        throw new Error(
          `Subtotal inválido para producto ${productoId}`
        );
      }

      const [productos]: any = await connection.query(
        `SELECT
           id,
           nombre,
           estado,
           stock_unidades
         FROM productos
         WHERE id = ?
         FOR UPDATE`,
        [productoId]
      );

      if (!productos.length) {
        throw new Error(
          `El producto ${productoId} no existe`
        );
      }

      const producto = productos[0];

      if (Number(producto.estado) !== 1) {
        throw new Error(
          `El producto "${producto.nombre}" está inactivo`
        );
      }
    }

    /*
     * Los totales deben ser números válidos.
     */
    const subtotalCompra = Number(subtotal);
    const impuestosCompra = Number(impuestos);
    const totalCompra = Number(total);

    if (!Number.isFinite(subtotalCompra) || subtotalCompra < 0) {
      throw new Error("El subtotal de la compra es inválido");
    }

    if (!Number.isFinite(impuestosCompra) || impuestosCompra < 0) {
      throw new Error("Los impuestos de la compra son inválidos");
    }

    if (!Number.isFinite(totalCompra) || totalCompra < 0) {
      throw new Error("El total de la compra es inválido");
    }

    /*
     * Caja abierta del usuario.
     */
    const [caja]: any = await connection.query(
      `SELECT id
       FROM caja
       WHERE usuario_id = ?
         AND estado = 'ABIERTA'
       ORDER BY id DESC
       LIMIT 1`,
      [usuario_id]
    );

    if (!caja.length) {
      throw new Error("No hay caja abierta");
    }

    const cajaId = caja[0].id;

    /*
     * Registrar encabezado de compra.
     */
    const [compraResult]: any = await connection.query(
      `INSERT INTO compras
       (
         id_empresa,
         usuario_id,
         proveedor_id,
         numero_factura,
         fecha_compra,
         subtotal,
         impuestos,
         total,
         caja_id
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empresa_id,
        usuario_id,
        proveedor_id,
        numero_factura,
        fecha_compra,
        subtotalCompra,
        impuestosCompra,
        totalCompra,
        cajaId,
      ]
    );

    const compraId = compraResult.insertId;

    /*
     * Registrar detalles y aumentar inventario.
     */
    for (const item of detalles) {
      const productoId = Number(item.producto_id);
      const cantidad = Number(item.cantidad);
      const costoUnitario = Number(item.costo_unitario);
      const subtotalDetalle = Number(item.subtotal);

      await connection.query(
        `INSERT INTO compra_detalle
         (
           compra_id,
           producto_id,
           cantidad,
           costo_unitario,
           subtotal
         )
         VALUES (?, ?, ?, ?, ?)`,
        [
          compraId,
          productoId,
          cantidad,
          costoUnitario,
          subtotalDetalle,
        ]
      );

      await connection.query(
        `UPDATE productos
         SET stock_unidades = stock_unidades + ?
         WHERE id = ?`,
        [cantidad, productoId]
      );
    }

    await connection.commit();

    return compraId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/* ================== ANULAR ================== */

export const anular = async (
  id: number,
  empresa_id: number
): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
     * Bloquear la compra y verificar empresa/estado.
     */
    const [rows]: any = await connection.query(
      `SELECT
         id,
         estado
       FROM compras
       WHERE id = ?
         AND id_empresa = ?
       FOR UPDATE`,
      [id, empresa_id]
    );

    if (!rows.length) {
      throw new Error("Compra no encontrada");
    }

    if (rows[0].estado !== "REGISTRADA") {
      throw new Error("La compra no es válida para anulación");
    }

    /*
     * Obtener los detalles.
     */
    const [detalles]: any = await connection.query(
      `SELECT
         producto_id,
         cantidad
       FROM compra_detalle
       WHERE compra_id = ?
       ORDER BY id`,
      [id]
    );

    if (!detalles.length) {
      throw new Error("La compra no tiene detalles");
    }

    /*
     * Primero verificar todos los productos y bloquear
     * sus filas. Si uno no tiene stock suficiente,
     * no se modifica absolutamente nada.
     */
    for (const item of detalles) {
      const productoId = Number(item.producto_id);
      const cantidad = Number(item.cantidad);

      const [productos]: any = await connection.query(
        `SELECT
           id,
           nombre,
           stock_unidades,
           estado
         FROM productos
         WHERE id = ?
         FOR UPDATE`,
        [productoId]
      );

      if (!productos.length) {
        throw new Error(
          `El producto ${productoId} asociado a la compra no existe`
        );
      }

      const producto = productos[0];
      const stockActual = Number(producto.stock_unidades);

      /*
       * Una anulación de compra devuelve la mercancía
       * al proveedor, por lo tanto debemos retirar del
       * inventario la cantidad que originalmente entró.
       *
       * Nunca permitimos que el stock quede negativo.
       */
      if (stockActual < cantidad) {
        throw new Error(
          `No se puede anular la compra. Stock insuficiente para "${producto.nombre}". ` +
          `Disponible: ${stockActual}, necesario retirar: ${cantidad}`
        );
      }
    }

    /*
     * Todas las validaciones pasaron.
     * Ahora sí modificar inventario.
     */
    for (const item of detalles) {
      await connection.query(
        `UPDATE productos
         SET stock_unidades = stock_unidades - ?
         WHERE id = ?`,
        [Number(item.cantidad), Number(item.producto_id)]
      );
    }

    /*
     * Marcar compra como anulada.
     */
    await connection.query(
      `UPDATE compras
       SET estado = 'ANULADA'
       WHERE id = ?
         AND id_empresa = ?`,
      [id, empresa_id]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
