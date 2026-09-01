export interface CierreCaja {
  id: number;
  caja_id: number;
  monto_final_real: number;
  diferencia: number;
  observaciones?: string;
  usuario_cierre_id: number;
  cerrado_en: string;
}
