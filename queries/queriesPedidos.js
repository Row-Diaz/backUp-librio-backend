import { pool } from '../database/pool.js';

const crearPedido = async (usuario_id, carrito) => {
    try {
        if (!carrito || carrito.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // Validar datos
        for (const item of carrito) {
            if (!item.id || !item.precio || !item.count) {
                throw new Error(`Item inválido`);
            }
        }

        // Calcular monto total
        const monto_total = carrito.reduce((total, item) => 
            total + (parseFloat(item.precio) * parseInt(item.count)), 0
        );

        // Insertar pedido
        const pedidoResult = await pool.query(
            'INSERT INTO pedido (fecha_pedido, estado, monto_total, usuario_id) VALUES (CURRENT_DATE, true, $1, $2) RETURNING id_pedido',
            [monto_total, usuario_id]
        );
        
        const pedido_id = pedidoResult.rows[0].id_pedido;

        // Insertar todos los libros en una sola query
        if (carrito.length > 0) {
            const values = [];
            const placeholders = [];
            
            carrito.forEach((item, index) => {
                const offset = index * 4;
                placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
                values.push(pedido_id, item.id, parseInt(item.count), parseFloat(item.precio));
            });

            await pool.query(
                `INSERT INTO pedido_libros (pedido_id, libro_id, cantidad, precio_unitario) VALUES ${placeholders.join(', ')}`,
                values
            );
        }

        return {
            id_pedido: pedido_id,
            monto_total,
            fecha_pedido: new Date()
        };

    } catch (error) {
        console.error('ERROR crearPedido:', error.message);
        throw new Error('Error al crear el pedido: ' + error.message);
    }
};

const obtenerPedidosUsuario = async (usuario_id) => {
    try {
        const query = `
            SELECT 
                p.id_pedido,
                p.fecha_pedido,
                p.estado,
                p.monto_total,
                COUNT(pl.libro_id) as cantidad_libros
            FROM pedido p
            LEFT JOIN pedido_libros pl ON p.id_pedido = pl.pedido_id
            WHERE p.usuario_id = $1
            GROUP BY p.id_pedido
            ORDER BY p.fecha_pedido DESC
        `;
        
        const result = await pool.query(query, [usuario_id]);
        return result.rows;
    } catch (error) {
        throw new Error('Error al obtener pedidos: ' + error.message);
    }
};

const obtenerDetallePedido = async (pedido_id, usuario_id) => {
    try {
        const pedidoResult = await pool.query(
            'SELECT * FROM pedido WHERE id_pedido = $1 AND usuario_id = $2',
            [pedido_id, usuario_id]
        );
        
        if (pedidoResult.rows.length === 0) {
            throw new Error('Pedido no encontrado');
        }

        const librosResult = await pool.query(
            `SELECT pl.*, l.titulo, l.autor, l.url_img 
             FROM pedido_libros pl 
             JOIN libros l ON pl.libro_id = l.id_libros 
             WHERE pl.pedido_id = $1`,
            [pedido_id]
        );

        return {
            pedido: pedidoResult.rows[0],
            libros: librosResult.rows
        };
    } catch (error) {
        throw new Error('Error al obtener detalle del pedido: ' + error.message);
    }
};

export { crearPedido, obtenerPedidosUsuario, obtenerDetallePedido };
