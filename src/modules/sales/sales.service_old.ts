import { pool } from "../../config/database";

interface DetalleVenta {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
}

export const VentasService = {

  async dashboardTopProducts() {
    const [rows] = await pool.execute(
      `SELECT p.nombre, SUM(vd.cantidad) AS total_vendido, SUM(vd.subtotal) AS total_ingresos
       FROM venta_detalle vd
       JOIN productos p ON p.id = vd.producto_id
       JOIN ventas v ON v.id = vd.venta_id
       WHERE MONTH(v.creado_en) = MONTH(CURRENT_DATE())
         AND YEAR(v.creado_en) = YEAR(CURRENT_DATE())
         AND v.estado = 'COMPLETADA'
       GROUP BY vd.producto_id
       ORDER BY total_vendido DESC
       LIMIT 10`
    );
    return rows;
  },

  async dashboardVentasPorDia() {
    const [rows] = await pool.execute(
      `SELECT DAY(creado_en) AS dia, SUM(total) AS total_dia
       FROM ventas
       WHERE MONTH(creado_en) = MONTH(CURRENT_DATE())
         AND YEAR(creado_en) = YEAR(CURRENT_DATE())
         AND estado = 'COMPLETADA'
       GROUP BY DAY(creado_en)
       ORDER BY dia ASC`
    );
    return rows;
  },





  async crearVenta(
    usuario_id: number,
    cliente_id: number,
    metodo_pago: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA",
    detalles: DetalleVenta[]
  ) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const total = detalles.reduce(
        (sum, d) => sum + d.cantidad * d.precio_unitario,
        0
      );

      const [ventaResult]: any = await conn.execute(
        `INSERT INTO ventas (usuario_id, cliente_id, total, metodo_pago, estado)
       VALUES (?, ?, ?, ?, 'COMPLETADA')`,
        [usuario_id, cliente_id, total, metodo_pago]
      );

      const ventaId = ventaResult.insertId;

      for (const item of detalles) {
        const subtotal = item.cantidad * item.precio_unitario;

        await conn.execute(
          `INSERT INTO venta_detalle
         (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
          [
            ventaId,
            item.producto_id,
            item.cantidad,
            item.precio_unitario,
            subtotal
          ]
        );

        const [stockResult]: any = await conn.execute(
          `UPDATE productos
   SET stock_unidades = stock_unidades - ?
   WHERE id = ?
     AND estado = 'ACTIVO'
     AND stock_unidades >= ?`,
          [item.cantidad, item.producto_id, item.cantidad]
        );


        if (stockResult.affectedRows === 0) {
          throw new Error("Stock insuficiente");
        }

        await conn.execute(
          `UPDATE productos
   SET estado = 'INACTIVO'
   WHERE id = ?
     AND stock_unidades < 1`,
          [item.producto_id]
        );



      }

      await conn.commit();

      return {
        message: "Venta registrada correctamente",
        venta_id: ventaId,
        total
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },


  async listarVentas() {
    const [rows] = await pool.execute(
      `SELECT id, usuario_id, total, metodo_pago, creado_en, estado
       FROM ventas
       ORDER BY creado_en DESC`
    );
    return rows;
  },

  async obtenerDetalle(ventaId: number) {
    const [rows] = await pool.execute(
      `SELECT vd.*, p.nombre
       FROM venta_detalle vd
       JOIN productos p ON p.id = vd.producto_id
       WHERE vd.venta_id = ?`,
      [ventaId]
    );
    return rows;
  },

  async anularVenta(ventaId: number) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [detalles]: any = await conn.execute(
        `SELECT producto_id, cantidad
         FROM venta_detalle
         WHERE venta_id = ?`,
        [ventaId]
      );

      for (const item of detalles) {
        await conn.execute(
          `UPDATE productos
           SET stock_unidades = stock_unidades + ?
           WHERE id = ?`,
          [item.cantidad, item.producto_id]
        );
      }

      await conn.execute(
        `UPDATE ventas SET estado = 'ANULADA' WHERE id = ?`,
        [ventaId]
      );

      await conn.commit();
      return { message: "Venta anulada correctamente" };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
};
