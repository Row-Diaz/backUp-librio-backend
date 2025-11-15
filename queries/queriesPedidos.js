import { pool } from '../database/pool.js';

const crearPedido = async (usuario_id, carrito) => {
    try {
        if (!carrito?.length) throw new Error('Carrito vacío');
        
        const monto_total = carrito.reduce((t, i) => t + (i.precio * i.count), 0);
        
        const { rows } = await pool.query(
            'INSERT INTO pedido (fecha_pedido, estado, monto_total, usuario_id) VALUES (CURRENT_DATE, true, $1, $2) RETURNING id_pedido',
            [monto_total, usuario_id]
        );
        
        const pedido_id = rows[0].id_pedido;
        const values = [];
        const placeholders = [];
        
        carrito.forEach((item, i) => {
            const offset = i * 4;
            placeholders.push(`($${offset+1},$${offset+2},$${offset+3},$${offset+4})`);
            values.push(pedido_id, item.id, item.count, item.precio);
        });

        await pool.query(
            `INSERT INTO pedido_libros (pedido_id, libro_id, cantidad, precio_unitario) VALUES ${placeholders.join(',')}`,
            values
        );

        return { id_pedido: pedido_id, monto_total, fecha_pedido: new Date() };
    } catch (error) {
        throw new Error(error.message);
    }
};

const obtenerPedidosUsuario = async (usuario_id) => {
    const { rows } = await pool.query(
        `SELECT p.id_pedido, p.fecha_pedido, p.estado, p.monto_total, COUNT(pl.libro_id) as cantidad_libros 
         FROM pedido p LEFT JOIN pedido_libros pl ON p.id_pedido = pl.pedido_id 
         WHERE p.usuario_id = $1 GROUP BY p.id_pedido ORDER BY p.fecha_pedido DESC`,
        [usuario_id]
    );
    return rows;
};

const obtenerDetallePedido = async (pedido_id, usuario_id) => {
    const pedido = await pool.query('SELECT * FROM pedido WHERE id_pedido = $1 AND usuario_id = $2', [pedido_id, usuario_id]);
    if (!pedido.rows.length) throw new Error('Pedido no encontrado');
    
    const libros = await pool.query(
        'SELECT pl.*, l.titulo, l.autor, l.url_img FROM pedido_libros pl JOIN libros l ON pl.libro_id = l.id_libros WHERE pl.pedido_id = $1',
        [pedido_id]
    );
    
    return { pedido: pedido.rows[0], libros: libros.rows };
};

export { crearPedido, obtenerPedidosUsuario, obtenerDetallePedido };
