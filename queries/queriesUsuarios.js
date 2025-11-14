import { pool } from '../database/pool.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const addUser = async (email, password, nombre, apellido) => {
    if (!email || !password || !nombre || !apellido) {
        throw new Error('Todos los campos son requeridos');
    }

    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = $1';
    try {
        const result = await pool.query(checkEmailQuery, [email]);

        if (result.rows.length > 0) {
            throw new Error('El correo electrónico ya está registrado');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertUserQuery = 'INSERT INTO usuarios (email, password, nombre, apellido) VALUES ($1, $2, $3, $4)';
        const values = [email, hashedPassword, nombre, apellido];
        await pool.query(insertUserQuery, values);

    } catch (error) {
        throw new Error('Error al agregar usuario: ' + error.message);
    }
};

const loginUser = async (email, password) => {
    if (!email || !password) {
        throw new Error('El correo electrónico y la contraseña son requeridos');
    }

    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const values = [email];

    try {
        const result = await pool.query(query, values);
        const user = result.rows[0];

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }

        const token = jwt.sign(
            {
                id_usuarios: user.id_usuarios,
                email: user.email,
                nombre: user.nombre,
                admin: user.admin
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return token;

    } catch (error) {
        throw new Error('Error al iniciar sesión: ' + error.message);
    }
};

const getUserById = async (userId) => {
    const query = 'SELECT id_usuarios, email, nombre, apellido FROM usuarios WHERE id_usuarios = $1';
    const values = [userId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw new Error('Error al obtener los datos del usuario: ' + error.message);
    }
};

const deleteUser = async (id_usuarios) => {
    const query = 'DELETE FROM usuarios WHERE id_usuarios = $1';
    const values = [id_usuarios];

    try {
        const result = await pool.query(query, values);
        return result.rowCount;
    } catch (error) {
        throw new Error('Error al eliminar el usuario: ' + error.message);
    }
};

export { addUser, loginUser, getUserById, deleteUser };

/**
 * Actualizar foto de perfil del usuario
 */
const actualizarFotoPerfil = async (usuario_id, foto_perfil) => {
    try {
        const query = 'UPDATE usuarios SET foto_perfil = $1 WHERE id_usuarios = $2 RETURNING id_usuarios, nombre, email, foto_perfil';
        const result = await pool.query(query, [foto_perfil, usuario_id]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Error al actualizar foto de perfil: ' + error.message);
    }
};

export { addUser, loginUser, getUserById, deleteUser, actualizarFotoPerfil };
