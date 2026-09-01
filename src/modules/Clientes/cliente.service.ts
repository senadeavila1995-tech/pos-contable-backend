import api from "../../shared/api/axios";
import type { Cliente } from "../../shared/types/Cliente";

/* ===============================
   LISTAR CLIENTES
   =============================== */
export const getClientes = () => {
  return api.get<Cliente[]>("/clientes");
};

/* ===============================
   OBTENER CLIENTE POR ID
   =============================== */
export const getClienteById = (id: number) => {
  return api.get<Cliente>(`/clientes/${id}`);
};

/* ===============================
   CREAR CLIENTE
   =============================== */
export const createCliente = (data: Partial<Cliente>) => {
  return api.post("/clientes", data);
};





export const getClienteByDocumento = (documento: string) =>
  api.get<Cliente>(`/clientes/documento/${documento}`);



