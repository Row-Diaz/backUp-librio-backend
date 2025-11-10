import { pool } from '../database/pool.js';

const newOrder = async (monto_total, usuario_id, libros, estado = false) => {
  try {
    const queryPedido = `INSERT INTO pedidos (fecha_pedido, estado, monto_total, usuario_id)VALUES (NOW(), $1, $2, $3) RETURNING id_pedido;`;

    const pedidoValues = [estado, monto_total, usuario_id];
    const pedidoResult = await pool.query(queryPedido, pedidoValues);
    const pedidoId = pedidoResult.rows[0].id_pedido;

    const queryLibro = `INSERT INTO pedidos_libros (pedido_id, libro_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4);`;

    for (const libro of libros) {
      const values = [pedidoId, libro.libro_id, libro.cantidad, libro.precio_unitario];
      await pool.query(queryLibro, values);
    }

    return { id_pedido: pedidoId, mensaje: 'Pedido creado correctamente' };

  } catch (error) {
    throw new Error('Error al crear el pedido: ' + error.message);
  }
};

//funcion para traer todos los pedidos

const getAllOrders = async () => {
    try {
        const query = 'SELECT * FROM pedidos ORDER BY id_pedido DESC';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw new Error('Error al obtener libros: ' + error.message);
    }
};

//te devuelve un pedido por id con el pedido de sus libros

const getOrderById = async (id) => {
  try {
    const queryPedido = 'SELECT * FROM pedidos WHERE id_pedido = $1';
    const queryLibros = 'SELECT * FROM pedidos_libros WHERE pedido_id = $1';

    const resultPedido = await pool.query(queryPedido, [id]);

    if (resultPedido.rows.length === 0) {
      return null;
    }
    const resultLibros = await pool.query(queryLibros, [id]);

    return {
      pedido: resultPedido.rows[0],
      libros: resultLibros.rows
    };

  } catch (error) {
    throw new Error('Error al obtener el pedido: ' + error.message);
  }
};

const getOrderByUser = async (id) => {
  try {
    const query = 'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY id_pedido DESC';
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al obtener pedidos del usuario: ' + error.message);
  }
};

const deleteOrder = async (id_pedido) => {
    const query = 'DELETE FROM pedidos WHERE id_pedido = $1';
    const values = [id_pedido];
    try {
        const result = await pool.query(query, values);
        return result.rowCount;
    } catch (error) {
        throw new Error('Error al eliminar el pedido: ' + error.message);
    }
};

export { newOrder, getOrderById, getAllOrders, getOrderByUser, deleteOrder };