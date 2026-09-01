import { Request, Response } from "express";
import { VentasService } from "./sales.service";

export const VentasController = {

  async crearVenta(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.empresa_id) {
        return res.status(400).json({
          ok: false,
          message: "empresa_id no encontrado en el token"
        });
      }

      const payload = {
        ...req.body,
        usuario_id: user.id,
        empresa_id: user.empresa_id
      };

      const result = await VentasService.crearVenta(payload);
      return res.status(201).json(result);

    } catch (error: any) {
      const message = error.message || "Error creando venta";

      if (message === "No hay caja abierta para el usuario") {
        return res.status(409).json({
          ok: false,
          message
        });
      }

      if (
        message.startsWith("El cliente ") &&
        message.endsWith(" no existe")
      ) {
        return res.status(404).json({
          ok: false,
          message
        });
      }

      if (
        message.startsWith("El producto ") &&
        message.endsWith(" no existe")
      ) {
        return res.status(404).json({
          ok: false,
          message
        });
      }

      return res.status(500).json({
        ok: false,
        message
      });
    }
  },

  async listarVentas(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.empresa_id) {
        return res.status(400).json({
          ok: false,
          message: "empresa_id no encontrado en el token"
        });
      }

      const ventas = await VentasService.listarVentas(user.empresa_id);
      return res.status(200).json(ventas);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  },

  async detalleVenta(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = (req as any).user;

      if (!user?.empresa_id) {
        return res.status(400).json({
          ok: false,
          message: "empresa_id no encontrado en el token"
        });
      }

      const data = await VentasService.detalleVenta(
        id,
        user.empresa_id
      );

      return res.status(200).json(data);

    } catch (error: any) {
      const message = error.message || "Error obteniendo venta";

      if (message === "Venta no encontrada") {
        return res.status(404).json({
          ok: false,
          message
        });
      }

      return res.status(500).json({
        ok: false,
        message
      });
    }
  },

  async anularVenta(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = (req as any).user;

      if (!user?.empresa_id) {
        return res.status(400).json({
          ok: false,
          message: "empresa_id no encontrado en el token"
        });
      }

      const result = await VentasService.anularVenta(
        id,
        user.empresa_id
      );
      return res.status(200).json({ ok: true, result });
    } catch (error: any) {
      const message = error.message || "Error anulando venta";

      if (message === "Venta no encontrada") {
        return res.status(404).json({
          ok: false,
          message
        });
      }

      if (message === "La venta ya está anulada") {
        return res.status(409).json({
          ok: false,
          message
        });
      }

      return res.status(500).json({
        ok: false,
        message
      });
    }
  },

  async dashboardResumen(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.empresa_id) {
        return res.status(400).json({
          ok: false,
          message: "empresa_id no encontrado en el token"
        });
      }

      const data = await VentasService.dashboardResumen(
        user.empresa_id
      );

      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({
        ok: false,
        message: error.message
      });
    }
  },

  async dashboardTopProducts(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const data = await VentasService.dashboardTopProducts(user.empresa_id);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  },

  async dashboardVentasPorDia(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const data = await VentasService.dashboardVentasPorDia(user.empresa_id);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }
};