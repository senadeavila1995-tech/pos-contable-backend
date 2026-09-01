export interface CartItem {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface CreateSale {
  usuario_id: number;
  empresa_id: number;
  cliente_id: number;
  caja_id?: number;

  // Forma de pago DIAN:
  // CONTADO / CREDITO
  forma_pago?: "CONTADO" | "CREDITO";

  // Medio de pago del POS:
  // EFECTIVO / TARJETA / TRANSFERENCIA / NEQUI / DAVIPLATA
  medio_pago?:
    | "EFECTIVO"
    | "TARJETA"
    | "TRANSFERENCIA"
    | "NEQUI"
    | "DAVIPLATA";

  // Se conserva por compatibilidad con el backend actual.
  metodo_pago:
    | "EFECTIVO"
    | "TARJETA"
    | "TRANSFERENCIA"
    | "NEQUI"
    | "DAVIPLATA";

  // Obligatorio cuando forma_pago = CREDITO.
  plazo_pago?: number | null;

  moneda?: string;

  detalles: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}



export interface Sale {
id: number;
usuario_id: number;
total: number;
metodo_pago: string;
estado: string;
creado_en: string;
empresa_id:number;
caja_id: number;
}


export interface SaleDetail {
  id: number;
  producto_id: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
}

