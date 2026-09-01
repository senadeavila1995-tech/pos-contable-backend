import { pool } from "../../config/database";
import { FacturacionService } from "../facturacion/facturacion.service";

interface DetalleVenta {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
}

interface CreateSale {
  usuario_id: number;
  empresa_id: number;
  cliente_id: number;
  metodo_pago: string;
  forma_pago?: string;
  medio_pago?: string;
  plazo_pago?: number | null;
  moneda?: string;
  detalles: DetalleVenta[];
}

export const VentasService = {

  async crearVenta(payload: CreateSale) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      if (!payload.detalles || payload.detalles.length === 0) {
        throw new Error("La venta debe tener al menos un producto");
      }

      const usuarioId = Number(payload.usuario_id);
      const empresaId = Number(payload.empresa_id);
      const clienteId = Number(payload.cliente_id);

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        throw new Error("Usuario inválido");
      }

      if (!Number.isInteger(empresaId) || empresaId <= 0) {
        throw new Error("Empresa inválida");
      }

      if (!Number.isInteger(clienteId) || clienteId <= 0) {
        throw new Error("Cliente inválido");
      }

      /*
       * ============================================================
       * CAJA
       * ============================================================
       */

      const [caja]: any = await connection.query(
        `SELECT id
         FROM caja
         WHERE usuario_id = ?
           AND estado = 'ABIERTA'
         ORDER BY id DESC
         LIMIT 1
         FOR UPDATE`,
        [usuarioId]
      );

      if (!caja.length) {
        throw new Error("No hay caja abierta para el usuario");
      }

      const cajaId = caja[0].id;

      /*
       * ============================================================
       * CLIENTE
       *
       * clientes no tiene empresa_id en el esquema actual.
       * Por eso solamente validamos que exista.
       * ============================================================
       */

      const [clientes]: any = await connection.query(
        `SELECT id, nombre
         FROM clientes
         WHERE id = ?
           AND empresa_id = ?
         LIMIT 1`,
        [clienteId, empresaId]
      );

      if (!clientes.length) {
        throw new Error(`El cliente ${clienteId} no existe`);
      }

      /*
       * ============================================================
       * FORMA DE PAGO
       * ============================================================
       */

      const formaPago =
        String(payload.forma_pago || "CONTADO").toUpperCase();

      if (!["CONTADO", "CREDITO"].includes(formaPago)) {
        throw new Error(
          "forma_pago inválida. Valores permitidos: CONTADO o CREDITO"
        );
      }

      const medioPago =
        String(
          payload.medio_pago ||
          payload.metodo_pago ||
          "EFECTIVO"
        ).toUpperCase();

      const mediosPagoPermitidos = [
        "EFECTIVO",
        "TARJETA",
        "TRANSFERENCIA",
        "NEQUI",
        "DAVIPLATA"
      ];

      if (!mediosPagoPermitidos.includes(medioPago)) {
        throw new Error(
          "medio_pago inválido. Valores permitidos: " +
          mediosPagoPermitidos.join(", ")
        );
      }

      const formaPagoCodigo =
        formaPago === "CREDITO" ? "2" : "1";

      const medioPagoCodigoMap: Record<string, string> = {
        EFECTIVO: "10",
        TARJETA: "48",
        TRANSFERENCIA: "42",
        NEQUI: "42",
        DAVIPLATA: "42"
      };

      const medioPagoCodigo =
        medioPagoCodigoMap[medioPago];

      if (!medioPagoCodigo) {
        throw new Error(
          `No existe código DIAN para el medio de pago ${medioPago}`
        );
      }

      const plazoPago =
        formaPago === "CREDITO"
          ? payload.plazo_pago ?? null
          : null;

      if (
        formaPago === "CREDITO" &&
        (!Number.isInteger(Number(plazoPago)) ||
          Number(plazoPago) <= 0)
      ) {
        throw new Error(
          "Una venta a CREDITO debe tener un plazo_pago mayor que cero"
        );
      }

      /*
       * ============================================================
       * DETALLES Y STOCK
       * ============================================================
       */

      const detallesFiscales: Array<{
        producto_id: number;
        cantidad: number;
        precio_unitario: number;
        descuento: number;
        base_imponible: number;
        porcentaje_iva: number;
        valor_iva: number;
        total_linea: number;
        codigo_producto: string | null;
        descripcion_fiscal: string | null;
        unidad_medida: string | null;
        codigo_unidad_dian: string | null;
        tipo_impuesto: string | null;
        precio_sin_impuesto: number;
      }> = [];

      let totalVenta = 0;
      let subtotalVenta = 0;
      let totalDescuentos = 0;
      let totalImpuestos = 0;
      let totalIva = 0;

      for (const item of payload.detalles) {

        const productoId = Number(item.producto_id);
        const cantidad = Number(item.cantidad);
        const precioUnitario = Number(item.precio_unitario);
        const descuento = Number(item.descuento || 0);

        if (!Number.isInteger(productoId) || productoId <= 0) {
          throw new Error("Producto inválido en el detalle de venta");
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
          throw new Error(
            `Cantidad inválida para producto ${productoId}`
          );
        }

        if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
          throw new Error(
            `Precio inválido para producto ${productoId}`
          );
        }

        if (!Number.isFinite(descuento) || descuento < 0) {
          throw new Error(
            `Descuento inválido para producto ${productoId}`
          );
        }

        /*
         * Bloqueamos el producto.
         * Esto evita que dos ventas concurrentes
         * consuman el mismo stock disponible.
         */
        const [productos]: any = await connection.query(
          `SELECT
             id,
             nombre,
             codigo,
             precio,
             unidad_medida,
             tipo_impuesto,
             porcentaje_iva,
             stock_unidades,
             estado,
             codigo_unidad_dian,
             descripcion_fiscal
           FROM productos
           WHERE id = ?
             AND empresa_id = ?
           FOR UPDATE`,
          [productoId, empresaId]
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

        const stockActual = Number(producto.stock_unidades);

        if (stockActual < cantidad) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}". ` +
            `Disponible: ${stockActual}, solicitado: ${cantidad}`
          );
        }

        const ivaPorcentaje =
          Number(producto.porcentaje_iva || 0);

        if (
          !Number.isFinite(ivaPorcentaje) ||
          ivaPorcentaje < 0
        ) {
          throw new Error(
            `IVA inválido para "${producto.nombre}"`
          );
        }

        const brutoLinea = Number(
          (cantidad * precioUnitario).toFixed(2)
        );

        if (descuento > brutoLinea) {
          throw new Error(
            `El descuento no puede superar el valor de la línea para "${producto.nombre}"`
          );
        }

        const totalLinea = Number(
          (brutoLinea - descuento).toFixed(2)
        );

        /*
         * Si IVA = 0:
         * base = total.
         *
         * Si existe IVA:
         * base = total / (1 + IVA)
         */
        const factorIva =
          1 + (ivaPorcentaje / 100);

        const baseImponible = Number(
          (totalLinea / factorIva).toFixed(2)
        );

        const valorIva = Number(
          (totalLinea - baseImponible).toFixed(2)
        );

        detallesFiscales.push({
          producto_id: productoId,
          cantidad,
          precio_unitario: precioUnitario,
          descuento,
          base_imponible: baseImponible,
          porcentaje_iva: ivaPorcentaje,
          valor_iva: valorIva,
          total_linea: totalLinea,
          codigo_producto: producto.codigo ?? null,
          descripcion_fiscal:
            producto.descripcion_fiscal ??
            producto.nombre ??
            null,
          unidad_medida:
            producto.unidad_medida ?? null,
          codigo_unidad_dian:
            producto.codigo_unidad_dian ?? null,
          tipo_impuesto:
            producto.tipo_impuesto ?? null,
          precio_sin_impuesto: baseImponible
        });

        totalVenta = Number(
          (totalVenta + totalLinea).toFixed(2)
        );

        subtotalVenta = Number(
          (subtotalVenta + baseImponible).toFixed(2)
        );

        totalDescuentos = Number(
          (totalDescuentos + descuento).toFixed(2)
        );

        totalImpuestos = Number(
          (totalImpuestos + valorIva).toFixed(2)
        );

        totalIva = Number(
          (totalIva + valorIva).toFixed(2)
        );
      }

      /*
       * ============================================================
       * VALIDACIÓN DE TOTALES
       * ============================================================
       */

      if (
        !Number.isFinite(totalVenta) ||
        totalVenta < 0
      ) {
        throw new Error("Total de venta inválido");
      }

      /*
       * ============================================================
       * ENCABEZADO
       * ============================================================
       */

      const moneda =
        String(payload.moneda || "COP").toUpperCase();

      if (moneda.length > 10) {
        throw new Error("La moneda es inválida");
      }

      const [ventaResult]: any = await connection.query(
        `INSERT INTO ventas
        (
          usuario_id,
          empresa_id,
          cliente_id,
          total,
          subtotal,
          total_descuentos,
          total_impuestos,
          total_iva,
          moneda,
          forma_pago,
          medio_pago,
          plazo_pago,
          metodo_pago,
          forma_pago_codigo,
          medio_pago_codigo,
          estado,
          fecha_emision,
          fecha_vencimiento,
          creado_en,
          caja_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAGADA', NOW(), ?, NOW(), ?)`,
        [
          usuarioId,
          empresaId,
          clienteId,
          totalVenta,
          subtotalVenta,
          totalDescuentos,
          totalImpuestos,
          totalIva,
          moneda,
          formaPago,
          medioPago,
          plazoPago,
          medioPago,
          formaPagoCodigo,
          medioPagoCodigo,
          formaPago === "CREDITO"
            ? new Date(
                Date.now() +
                Number(plazoPago) * 86400000
              )
            : null,
          cajaId
        ]
      );

      const ventaId = ventaResult.insertId;

      /*
       * ============================================================
       * DETALLES + STOCK
       * ============================================================
       */

      for (const item of detallesFiscales) {

        await connection.query(
          `INSERT INTO venta_detalle
          (
            venta_id,
            producto_id,
            cantidad,
            precio_unitario,
            descuento,
            base_imponible,
            porcentaje_iva,
            valor_iva,
            total_linea,
            subtotal,
            codigo_producto,
            descripcion_fiscal,
            unidad_medida,
            codigo_unidad_dian,
            tipo_impuesto,
            precio_sin_impuesto,
            porcentaje_descuento,
            creado_en
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            ventaId,
            item.producto_id,
            item.cantidad,
            item.precio_unitario,
            item.descuento,
            item.base_imponible,
            item.porcentaje_iva,
            item.valor_iva,
            item.total_linea,
            item.total_linea,
            item.codigo_producto,
            item.descripcion_fiscal,
            item.unidad_medida,
            item.codigo_unidad_dian,
            item.tipo_impuesto,
            item.precio_sin_impuesto,
            item.descuento > 0 && item.total_linea > 0
              ? Number(
                  (
                    item.descuento /
                    (item.total_linea + item.descuento) *
                    100
                  ).toFixed(2)
                )
              : 0
          ]
        );

        /*
         * El producto ya está bloqueado por FOR UPDATE.
         * El UPDATE ocurre dentro de la misma transacción.
         */
        const [stockResult]: any = await connection.query(
          `UPDATE productos
           SET stock_unidades = stock_unidades - ?
           WHERE id = ?
             AND stock_unidades >= ?`,
          [
            item.cantidad,
            item.producto_id,
            item.cantidad
          ]
        );

        if (stockResult.affectedRows !== 1) {
          throw new Error(
            `No fue posible descontar el stock del producto ${item.producto_id}`
          );
        }
      }

      await connection.commit();

      return {
        ok: true,
        message: "Venta creada correctamente",
        venta_id: ventaId,
        total: totalVenta,
        moneda,
        forma_pago: formaPago,
        medio_pago: medioPago,
        plazo_pago: plazoPago
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async facturarVenta({
    venta_id,
    empresa_id
  }: {
    venta_id: number;
    empresa_id: number;
  }) {
    return FacturacionService.facturarVenta({
      venta_id,
      empresa_id
    });
  },

  /*
   * ================================================================
   * LISTAR VENTAS
   * ================================================================
   */

  async listarVentas(empresa_id: number) {
    const connection = await pool.getConnection();

    try {
      const empresaId = Number(empresa_id);

      if (!Number.isInteger(empresaId) || empresaId <= 0) {
        throw new Error("Empresa inválida");
      }

      const [ventas]: any = await connection.query(
        `SELECT
           v.*,
           c.nombre AS cliente_nombre
         FROM ventas v
         LEFT JOIN clientes c
           ON v.cliente_id = c.id
         WHERE v.empresa_id = ?
         ORDER BY v.creado_en DESC`,
        [empresaId]
      );

      return ventas;
    } finally {
      connection.release();
    }
  },

  /*
   * ================================================================
   * DETALLE
   * ================================================================
   */

  async detalleVenta(
    venta_id: number,
    empresa_id: number
  ) {
    const connection = await pool.getConnection();

    try {
      const ventaId = Number(venta_id);
      const empresaId = Number(empresa_id);

      const [ventas]: any = await connection.query(
        `SELECT
           v.*,
           c.nombre AS cliente_nombre
         FROM ventas v
         LEFT JOIN clientes c
           ON v.cliente_id = c.id
         WHERE v.id = ?
           AND v.empresa_id = ?
         LIMIT 1`,
        [ventaId, empresaId]
      );

      if (!ventas.length) {
        throw new Error("Venta no encontrada");
      }

      const venta = ventas[0];

      const [detalles]: any = await connection.query(
        `SELECT
           vd.*,
           p.nombre AS producto_nombre,
           p.codigo AS producto_codigo
         FROM venta_detalle vd
         INNER JOIN ventas v
           ON v.id = vd.venta_id
         LEFT JOIN productos p
           ON vd.producto_id = p.id
         WHERE vd.venta_id = ?
           AND v.empresa_id = ?
         ORDER BY vd.id`,
        [ventaId, empresaId]
      );

      venta.detalles = detalles;

      return venta;
    } finally {
      connection.release();
    }
  },

  /*
   * ================================================================
   * ANULAR VENTA
   * ================================================================
   */

  async anularVenta(
    venta_id: number,
    empresa_id: number
  ) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const ventaId = Number(venta_id);
      const empresaId = Number(empresa_id);

      /*
       * Bloqueamos la venta.
       */
      const [ventas]: any = await connection.query(
        `SELECT
           id,
           empresa_id,
           estado
         FROM ventas
         WHERE id = ?
           AND empresa_id = ?
         FOR UPDATE`,
        [ventaId, empresaId]
      );

      if (!ventas.length) {
        throw new Error("Venta no encontrada");
      }

      if (ventas[0].estado === "ANULADA") {
        throw new Error("La venta ya está anulada");
      }

      if (ventas[0].estado !== "PAGADA") {
        throw new Error(
          `La venta no se puede anular porque su estado es ${ventas[0].estado}`
        );
      }

      const [detalles]: any = await connection.query(
        `SELECT
           producto_id,
           cantidad
         FROM venta_detalle
         WHERE venta_id = ?
         ORDER BY id`,
        [ventaId]
      );

      if (!detalles.length) {
        throw new Error("La venta no tiene detalles");
      }

      /*
       * Bloquear todos los productos y validar
       * antes de modificar cualquier stock.
       */
      for (const item of detalles) {

        const productoId = Number(item.producto_id);
        const cantidad = Number(item.cantidad);

        if (
          !Number.isInteger(productoId) ||
          productoId <= 0
        ) {
          throw new Error(
            "Producto inválido en el detalle de la venta"
          );
        }

        if (
          !Number.isInteger(cantidad) ||
          cantidad <= 0
        ) {
          throw new Error(
            `Cantidad inválida para producto ${productoId}`
          );
        }

        const [productos]: any = await connection.query(
          `SELECT
             id,
             nombre,
             stock_unidades,
             estado
           FROM productos
           WHERE id = ?
             AND empresa_id = ?
           FOR UPDATE`,
          [productoId, empresaId]
        );

        if (!productos.length) {
          throw new Error(
            `El producto ${productoId} asociado a la venta no existe`
          );
        }
      }

      /*
       * Devolver mercancía al inventario.
       */
      for (const item of detalles) {

        const [stockResult]: any = await connection.query(
          `UPDATE productos
           SET stock_unidades = stock_unidades + ?
           WHERE id = ?
             AND empresa_id = ?`,
          [
            Number(item.cantidad),
            Number(item.producto_id),
            empresaId
          ]
        );

        if (stockResult.affectedRows !== 1) {
          throw new Error(
            `No fue posible devolver stock del producto ${item.producto_id}`
          );
        }
      }

      /*
       * Marcar la venta como anulada.
       */
      const [result]: any = await connection.query(
        `UPDATE ventas
         SET estado = 'ANULADA'
         WHERE id = ?
           AND empresa_id = ?
           AND estado = 'PAGADA'`,
        [ventaId, empresaId]
      );

      if (result.affectedRows !== 1) {
        throw new Error(
          "No fue posible marcar la venta como anulada"
        );
      }

      await connection.commit();

      return {
        ok: true,
        message: "Venta anulada correctamente",
        venta_id: ventaId
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /*
   * ================================================================
   * DASHBOARD
   * ================================================================
   */

  async dashboardResumen(empresa_id: number) {
    const connection = await pool.getConnection();

    try {
      const empresaId = Number(empresa_id);

      const [data]: any = await connection.query(
        `SELECT
          COUNT(*) AS cantidad_ventas,
          COALESCE(SUM(total), 0) AS total_ventas
         FROM ventas
         WHERE empresa_id = ?
           AND estado <> 'ANULADA'`,
        [empresaId]
      );

      return {
        cantidad_ventas: Number(data[0]?.cantidad_ventas || 0),
        total_ventas: Number(data[0]?.total_ventas || 0)
      };
    } finally {
      connection.release();
    }
  },

  async dashboardTopProducts(empresa_id: number) {
    const connection = await pool.getConnection();

    try {
      const empresaId = Number(empresa_id);

      const [data]: any = await connection.query(
        `SELECT
          p.id,
          p.nombre,
          SUM(vd.cantidad) AS total_vendido,
          SUM(COALESCE(vd.total_linea, vd.precio_unitario * vd.cantidad)) AS total_ingresos
         FROM venta_detalle vd
         INNER JOIN ventas v
           ON v.id = vd.venta_id
         INNER JOIN productos p
           ON p.id = vd.producto_id
         WHERE v.empresa_id = ?
           AND v.estado <> 'ANULADA'
         GROUP BY p.id, p.nombre
         ORDER BY total_vendido DESC
         LIMIT 10`,
        [empresaId]
      );

      return data;
    } finally {
      connection.release();
    }
  },

  async dashboardVentasPorDia(empresa_id: number) {
    const connection = await pool.getConnection();

    try {
      const empresaId = Number(empresa_id);

      const [data]: any = await connection.query(
        `SELECT
          DATE(v.creado_en) AS fecha,
          SUM(v.total) AS total_ventas
         FROM ventas v
         WHERE v.empresa_id = ?
           AND v.estado <> 'ANULADA'
         GROUP BY DATE(v.creado_en)
         ORDER BY fecha DESC
         LIMIT 30`,
        [empresaId]
      );

      return data;
    } finally {
      connection.release();
    }
  }
};
