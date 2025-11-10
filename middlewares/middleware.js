import jwt from 'jsonwebtoken';
import { pool } from '../database/pool.js';

//middleware para verificar el JWT

const authenticateJWT = (req, res, next) => {

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'Token requerido' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido', error: err.message });
    }

    req.user = decoded;
    next();
  });

};


// Middleware para verificar si el usuario es admin

const checkAdmin = async (req, res, next) => {
  try {
    const { id_usuarios } = req.user; // viene del token

    if (!id_usuarios) {
      return res.status(400).json({ message: 'Token inválido: falta el ID del usuario' });
    }

    const result = await pool.query(
      'SELECT admin FROM usuarios WHERE id_usuarios = $1',
      [id_usuarios]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { admin } = result.rows[0];

    if (!admin) {
      return res.status(403).json({ message: 'Acceso denegado: se requieren privilegios de administrador' });
    }

    next();

  } catch (err) {
    console.error('Error en checkAdmin:', err);
    return res.status(500).json({ message: 'Error interno en autenticación', error: err.message });
  }
};

export { authenticateJWT, checkAdmin };