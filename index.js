import express from 'express';
import cors from 'cors';
import { addUser , loginUser , getUserById , deleteUser, actualizarFotoPerfil } from './queries/queriesUsuarios.js';
import { addBook , getBookById , deleteBook, getAllBooks} from './queries/queriesLibros.js';
import dotenv from 'dotenv';
import { crearPedido, obtenerPedidosUsuario, obtenerDetallePedido } from './queries/queriesPedidos.js';
import { authenticateJWT , checkAdmin } from './middlewares/middleware.js';

// dotenv.config(); // Comentado - se carga en pool.js
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Manejar preflight requests
app.options('/*', cors());

app.listen(PORT, async () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log('✅ CORS configurado para permitir todos los orígenes');
});


// RUTA POST

app.post('/usuarios', async (req, res) => {
  const { email, password, nombre, apellido } = req.body;
  try {
    await addUser(email, password, nombre, apellido);
    res.status(201).json({ message: 'Usuario agregado con éxito' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta POST para login

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await loginUser(email, password); // Usar la función de login
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta GET

app.get('/usuarios', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.user; // El userId viene del JWT

    // Obtener el usuario de la base de datos por el ID

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Responder con los datos del usuario
    res.json({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta GET por ID

app.get('/usuarios/:id', authenticateJWT, async (req, res) => {
  const userId = req.params.id;
  const loggedUserId = req.user.userId;


  //validar que el userId del token sea igual al userId de la ruta
  if (userId !== loggedUserId) {
    return res.status(403).json({ message: 'No tienes permiso para acceder a este usuario' }); 
  }

  try {
      const user = await getUserById(userId);
      if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Ruta DELETE

app.delete('/usuarios/:id', authenticateJWT, checkAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const result = await deleteUser(id);

    if (result === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado con éxito' });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

//-------------------------------------------------------------------------------------------------------------
// rutas para libros

app.post('/libros', authenticateJWT, checkAdmin, async (req, res) => {
    const { titulo, autor, editorial, anio_publicacion, genero, descripcion, precio, url_img } = req.body;
    const usuario_id = req.user.id_usuarios;
    try {
        await addBook(titulo, autor, editorial, anio_publicacion, genero, descripcion, precio, url_img, usuario_id);
        res.status(201).json({ message: 'Libro agregado con éxito' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/libros', authenticateJWT, async (req, res) => {
    try {
        const books = await getAllBooks();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/libros/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const book = await getBookById(id);
        if (!book) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/libros/:id', authenticateJWT, checkAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de libro inválido' });
    }

    const result = await deleteBook(id);

    if (result === 0) {
      return res.status(404).json({ message: 'libro no encontrado' });
    }

    res.status(200).json({ message: 'libro eliminado con éxito' });

  } catch (error) {
    console.error('Error al eliminar libro:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// ---------------------------------------------------------------------------------------------------------------



// TEST ENDPOINT
app.get('/test', (req, res) => {
  res.json({ message: 'Backend funcionando OK', env: { user: process.env.DB_USER, host: process.env.DB_HOST } });
});

app.post('/test-db', async (req, res) => {
  const { pool } = await import('./database/pool.js');
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});


// Crear nuevo pedido
app.post('/pedidos', authenticateJWT, async (req, res) => {
  const { carrito } = req.body;
  const usuario_id = req.user.id_usuarios;
  
  try {
    const pedido = await crearPedido(usuario_id, carrito);
    res.status(201).json({ message: 'Pedido creado exitosamente', pedido });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener pedidos del usuario autenticado
app.get('/pedidos/usuario', authenticateJWT, async (req, res) => {
  const usuario_id = req.user.id_usuarios;
  
  try {
    const pedidos = await obtenerPedidosUsuario(usuario_id);
    res.json({ pedidos });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener detalle de un pedido específico
app.get('/pedidos/:id', authenticateJWT, async (req, res) => {
  const pedido_id = req.params.id;
  const usuario_id = req.user.id_usuarios;
  
  try {
    const detalle = await obtenerDetallePedido(pedido_id, usuario_id);
    res.json(detalle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar foto de perfil del usuario autenticado
app.put('/usuarios/foto-perfil', authenticateJWT, async (req, res) => {
  const { foto_perfil } = req.body;
  const usuario_id = req.user.id_usuarios;

  try {
    if (!foto_perfil) {
      return res.status(400).json({ error: 'La imagen es requerida' });
    }

    const usuarioActualizado = await actualizarFotoPerfil(usuario_id, foto_perfil);
    res.json({ 
      message: 'Foto de perfil actualizada exitosamente', 
      usuario: usuarioActualizado 
    });
  } catch (error) {
    console.error('Error al actualizar foto:', error.message);
    res.status(500).json({ error: error.message });
  }
});
