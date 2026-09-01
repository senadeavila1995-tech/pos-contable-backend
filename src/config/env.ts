import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || "",
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || "",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "",
  JWT_SECRET: process.env.JWT_SECRET || "",

  // Facturación electrónica
  // test = simulación local sin transmisión a DIAN
  // dian = reservado para integración real
  FACTURACION_MODO: process.env.FACTURACION_MODO || "test"
};
