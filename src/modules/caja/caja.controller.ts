import { Request, Response } from "express";
import { abrirCaja, cerrarCaja, obtenerCajaAbierta } from "./caja.service";

export const CajaController = {
  /* ========= ABRIR ========= */
  async abrir(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.id || !user?.empresa_id) {
        return res.status(400).json({
          ok: false,
          message: "Usuario o empresa_id no encontrado en el token"
        });
      }

      const caja = await abrirCaja({
        monto_inicial: req.body.monto_inicial,
        usuario_apertura_id: user.id,
        empresa_id: user.empresa_id,
      });

      res.json({ message: "Caja abierta correctamente", caja });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  /* ========= CERRAR ========= */
  async cerrar(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.id || !user?.empresa_id) {
        return res.status(400).json({
          ok: false,
          message: "Usuario o empresa_id no encontrado en el token"
        });
      }

      const caja = await cerrarCaja({
        caja_id: req.body.caja_id,
        monto_final_real: req.body.monto_final_real,
        usuario_cierre_id: user.id,
        empresa_id: user.empresa_id,
      });

      res.json({ message: "Caja cerrada correctamente", caja });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  /* ========= CAJA ACTUAL ========= */
  async actual(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.id || !user?.empresa_id) {
        return res.status(400).json({
          ok: false,
          message: "Usuario o empresa_id no encontrado en el token"
        });
      }

      const caja = await obtenerCajaAbierta(
        user.id,
        user.empresa_id
      );
      res.json(caja);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
