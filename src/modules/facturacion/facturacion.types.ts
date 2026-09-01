export interface FacturarVentaInput {
  venta_id: number;
  empresa_id: number;
}

export interface FacturaDIAN {
  prefijo: string;

  // Metadatos UBL 2.1 / factura electrónica
  ubl: {
    version: string;
    customization_id: string;
    profile_id: string;
    profile_execution_id: string;
  };

  empresa: {
    nit: string;
    razon_social: string;
    nombre?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };

  cliente: {
    identificacion: string;
    nombre: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  };

  factura: {
    numero: string;
    fecha_emision: string;
    moneda: string;

    // Forma de pago:
    // CONTADO / CREDITO
    forma_pago: string;

    // Código DIAN de forma de pago:
    // 1 = Contado
    // 2 = Crédito
    forma_pago_codigo: string;

    // Medio de pago interno del POS:
    // EFECTIVO / TARJETA / TRANSFERENCIA / NEQUI / DAVIPLATA
    medio_pago: string;

    // Código DIAN del medio de pago.
    medio_pago_codigo: string;

    // Plazo en días cuando la forma de pago es CREDITO.
    plazo_pago?: number | null;

    total: number;

    resolucion?: string;
    fecha_resolucion?: string;

    cufe?: string;
    estado_dian?: string;

    // Totales calculados a partir de los valores
    // almacenados en la venta, donde el precio ya incluye IVA.
    subtotal: number;
    total_iva: number;

  };

  items: {
    codigo: number;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;

    impuesto: {
      tipo: string;
      porcentaje: number;
      valor?: number;
    };
  }[];
}

export interface RespuestaDIAN {
  numero: string;
  cufe: string;
  estado_dian: "PENDIENTE" | "ENVIANDO" | "ACEPTADA" | "RECHAZADA" | "ERROR";
  mensaje: string;
  codigo?: string;
}
