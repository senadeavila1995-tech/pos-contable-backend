import { pool } from "../../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const AuthService = {
  // Listar empresas activas para el registro
  async getEmpresasActivas() {
    const [rows]: any = await pool.query(
      `SELECT id, nombre, razon_social, nombre_comercial
       FROM empresas
       WHERE estado = 1
       ORDER BY nombre ASC`
    );

    return rows;
  },

  // Buscar usuario por email
  async findByEmail(email: string) {
    const [rows]: any = await pool.query(
      "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    return rows.length ? rows[0] : null;
  },

  // Registro
  async register(data: {
    nombre: string;
    email: string;
    password: string;
    rol_id: number;
    empresa_id: number;
  }) {
    const exists = await this.findByEmail(data.email);

    if (exists) {
      throw new Error("El correo ya está registrado");
    }

    // Verificar que la empresa exista y esté activa
    const [empresas]: any = await pool.query(
      `SELECT id
       FROM empresas
       WHERE id = ?
         AND estado = 1
       LIMIT 1`,
      [data.empresa_id]
    );

    if (empresas.length === 0) {
      throw new Error("La empresa seleccionada no existe o está inactiva");
    }

    const password_hash = await bcrypt.hash(data.password, 10);

    await pool.query(
      `INSERT INTO usuarios
       (nombre, email, password, rol_id, empresa_id, estado)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        data.nombre,
        data.email,
        password_hash,
        data.rol_id,
        data.empresa_id
      ]
    );

    return {
      message: "Usuario creado correctamente"
    };
  },

  // Login
  async login(email: string, password: string) {
    const [rows]: any = await pool.query(
      `SELECT
        id,
        nombre,
        email,
        password,
        rol_id,
        empresa_id,
        estado
       FROM usuarios
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      throw new Error("Credenciales inválidas");
    }

    const user = rows[0];

    if (user.estado !== 1) {
      throw new Error("Usuario inactivo");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign(
      {
        id: user.id,
        empresa_id: user.empresa_id,
        rol_id: user.rol_id,
        estado: user.estado
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "8h"
      }
    );

    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol_id: user.rol_id,
        empresa_id: user.empresa_id
      }
    };
  }
};
