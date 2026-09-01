export interface Caja {
  id: number;
  fecha: string; // YYYY-MM-DD
  monto_inicial: number;
  estado: "ABIERTA" | "CERRADA";
  usuario_apertura_id: number;
  creado_en: string;
}
