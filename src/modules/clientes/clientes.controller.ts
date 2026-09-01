import { Request, Response } from "express";
import * as ClienteService from "./clientes.service";

export const listarClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await ClienteService.getClientes(
      req.user.empresa_id
    );

    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al listar clientes" });
  }
};

export const obtenerCliente = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const cliente = await ClienteService.getClienteById(
      id,
      req.user.empresa_id
    );

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener cliente" });
  }
};

export const buscarPorDocumento = async (req: Request, res: Response) => {
  try {
    const documentoParam = req.params.documento;

    if (typeof documentoParam !== "string" || !documentoParam.trim()) {
      return res.status(400).json({ message: "Documento inválido" });
    }

    const documento = documentoParam.trim();

    const cliente = await ClienteService.getClienteByDocumento(
      documento,
      req.user.empresa_id
    );

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al buscar cliente" });
  }
};

export const crearCliente = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      tipo_documento = null,
      numero_documento = null,
      digito_verificacion = null,
      tipo_persona = null,
      cc = null,
      documento = null,
      telefono = null,
      email = null,
      direccion = null,
      municipio = null,
      departamento = null,
      codigo_municipio = null,
      pais = null,
      codigo_pais = null,
      regimen_fiscal = null,
      responsabilidad_fiscal = null,
      razon_social = null,
      nombre_comercial = null,
      primer_nombre = null,
      segundo_nombre = null,
      primer_apellido = null,
      segundo_apellido = null,
      codigo_postal = null,
      responsabilidad_tributaria = null
    } = req.body;

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({
        message: "El nombre del cliente es obligatorio"
      });
    }

    const documentoBusqueda =
      numero_documento || documento || cc || null;

    if (documentoBusqueda) {
      const existente =
        await ClienteService.getClienteByDocumento(
          String(documentoBusqueda),
          req.user.empresa_id
        );

      if (existente) {
        return res.status(409).json({
          message: "Ya existe un cliente con ese documento"
        });
      }
    }

    const cliente = await ClienteService.createCliente(
      {
        nombre: String(nombre).trim(),
        tipo_documento,
        numero_documento,
        digito_verificacion,
        tipo_persona,
        cc,
        documento,
        telefono,
        email,
        direccion,
        municipio,
        departamento,
        codigo_municipio,
        pais,
        codigo_pais,
        regimen_fiscal,
        responsabilidad_fiscal,
        razon_social,
        nombre_comercial,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        codigo_postal,
        responsabilidad_tributaria
      },
      req.user.empresa_id
    );

    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

export const actualizarCliente = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const cliente = await ClienteService.updateCliente(
      id,
      req.body,
      req.user.empresa_id
    );

    res.json(cliente);
  } catch (error: any) {
    console.error(error);

    if (error.message === "Cliente no encontrado") {
      return res.status(404).json({
        message: "Cliente no encontrado"
      });
    }

    res.status(500).json({
      message: error.message || "Error al actualizar cliente"
    });
  }
};
