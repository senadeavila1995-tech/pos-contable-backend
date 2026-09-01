import "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        empresa_id: number;
        rolId?: number;
      };
    }
  }
}
