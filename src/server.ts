import app from "./app";
import { env } from "./config/env";
import { pool } from "./config/database";

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL conectado correctamente");

    app.listen(env.PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Error conectando a MySQL:", error);
  }
};

startServer();