import { pool } from '../database/pool.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Función para agregar un usuario

// CREATE TABLE usuarios (
//   id_usuarios SERIAL PRIMARY KEY, 
//   email VARCHAR(75) NOT NULL, 
//   password VARCHAR(50) NOT NULL, 
//   nombre VARCHAR(50) NOT NULL, 
//   apellido VARCHAR(50) NOT NULL,
//   admin BOOLEAN DEFAULT false
// );

const addUser = async (email, password, nombre, apellido) => {

    // Validar que se proporcionen todos los campos requeridos

    if (!email || !password || !nombre || !apellido) {
        throw new Error('Todos los campos son requeridos');
    }

    // Verificar si el correo electrónico ya está registrado se agrega esto por que estaba registrando usuarios con el mismo email

    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = $1';
    try {
        const result = await pool.query(checkEmailQuery, [email]);

        // verificacion de correo
        if (result.rows.length > 0) {
            throw new Error('El correo electrónico ya está registrado');
        }

        // Hasheo de contraseña

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar el nuevo usuario en la base de datos en caso de que no exista el email

        const insertUserQuery = 'INSERT INTO usuarios (email, password, nombre, apellido) VALUES ($1, $2, $3, $4)';
        const values = [email, hashedPassword, nombre, apellido];
        await pool.query(insertUserQuery, values);

        // console.log('Usuario agregado con éxito');

    } catch (error) {
        throw new Error('Error al agregar usuario: ' + error.message);
    }
};

//-------------------------------------------------------------------------------------------------------------

// Función para autenticar un usuario y generar un token JWT

const loginUser = async (email, password) => {

    // Validar que se proporcionen email y password

    if (!email || !password) {
        throw new Error('El correo electrónico y la contraseña son requeridos');
    }

    // Buscar el usuario por email

    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const values = [email];

    try {
        const result = await pool.query(query, values);
        const user = result.rows[0]; // Obtener usuario encontrado (ya que el email es único)

        // Verificar si el usuario existe

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Comparar la contraseña proporcionada con la almacenada (usando bcrypt)

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }

        // Generar el token JWT

        const token = jwt.sign(
        { id_usuarios: user.id_usuarios, 
            email: user.email, 
            nombre: user.nombre, 
            admin: user.admin 
        },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return token; // Devuelve el token JWT generado

    } catch (error) {
        throw new Error('Error al iniciar sesión: ' + error.message);
    }
};

//-------------------------------------------------------------------------------------------------------------
// Función rapida para obtener los datos del usuario por su ID

const getUserById = async (userId) => {
    const query = 'SELECT id, email, nombre, apellido FROM usuarios WHERE id = $1';
    const values = [userId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0]; // Retorna el usuario encontrado
    } catch (error) {
        throw new Error('Error al obtener los datos del usuario: ' + error.message);
    }
};

//-------------------------------------------------------------------------------------------------------------

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