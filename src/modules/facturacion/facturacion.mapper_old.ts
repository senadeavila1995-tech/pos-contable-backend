export class FacturacionMapper {

  // =====================================
  // MAPEAR VENTA → FACTURA DIAN
  // =====================================
  static mapVentaToFacturaDIAN(venta: any, config: any) {

    return {
      prefijo: config.prefijo,
      numero: null, // el proveedor lo asigna

      empresa: {
        nit: config.nit_empresa,
        razon_social: config.razon_social,
        direccion: config.direccion,
        telefono: config.telefono,
        email: config.email
      },

      cliente: {
        identificacion: venta.cliente_identificacion || '222222222222',
        nombre: venta.cliente_nombre || 'CONSUMIDOR FINAL',
        email: venta.cliente_email || null
      },

      factura: {
        fecha_emision: new Date().toISOString(),
        moneda: 'COP',
        metodo_pago: venta.metodo_pago,
        total: venta.total
      },

      items: venta.detalles.map((item: any) => ({
        codigo: item.producto_id,
        descripcion: item.descripcion || 'Producto',
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario,
        impuestos: [
          {
            tipo: 'IVA',
            porcentaje: 19
          }
        ]
      }))
    };
  }
}
