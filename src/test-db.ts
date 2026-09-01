import { pool } from "./config/database";

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Conectado a MySQL correctamente");
    connection.release();
  } catch (error) {
    console.error("Error al conectar a MySQL:", error);
  }
}

testConnection();
