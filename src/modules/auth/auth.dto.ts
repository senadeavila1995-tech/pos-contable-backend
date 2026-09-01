export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
  rol_id: number;
  empresa_id: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}
