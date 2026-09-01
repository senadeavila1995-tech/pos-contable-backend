export interface Proveedor {
  id: number;
  nombre: string;
  documento: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  estado: number;
  creado_en: string | null;
  id_empresa: number;
}
