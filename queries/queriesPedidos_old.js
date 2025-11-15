import { pool } from '../database/pool.js';

/**
 * Crear un nuevo pedido con sus libros
 */
const crearPedido = async (usuario_id, carrito) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Validar que el carrito no esté vacío
        if (!carrito || carrito.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // Validar que todos los items tengan los datos necesarios
        for (const item of carrito) {
            if (!item.id) {
                throw new Error(`Item sin ID: ${JSON.stringify(item)}`);
            }
            if (!item.precio || isNaN(parseFloat(item.precio))) {
                throw new Error(`Item ${item.id} sin precio válido: ${item.precio}`);
            }
            if (!item.count || item.count <= 0) {
                throw new Error(`Item ${item.id} sin cantidad válida: ${item.count}`);
            }
        }

        // Calcular el monto total
        const monto_total = carrito.reduce((total, item) => {
            return total + (parseFloat(item.precio) * parseInt(item.count));
        }, 0);

        console.log('Creando pedido:', { usuario_id, monto_total, items: carrito.length });

        // Insertar el pedido
        const pedidoQuery = `
            INSERT INTO pedido (fecha_pedido, estado, monto_total, usuario_id)
            VALUES (CURRENT_DATE, true, $1, $2)
            RETURNING id_pedido
        `;
        const pedidoResult = await client.query(pedidoQuery, [monto_total, usuario_id]);
        const pedido_id = pedidoResult.rows[0].id_pedido;

        console.log('Pedido creado con ID:', pedido_id);

        // Insertar los libros del pedido
        for (const item of carrito) {
            const libroQuery = `
                INSERT INTO pedido_libros (pedido_id, libro_id, cantidad, precio_unitario)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(libroQuery, [
                pedido_id,
                item.id,
                parseInt(item.count),
                parseFloat(item.precio)
            ]);
        }

        await client.query('COMMIT');

        console.log('Pedido completado exitosamente');

        return {
            id_pedido: pedido_id,
            monto_total,
            fecha_pedido: new Date()
        };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear pedido:', error.message);
        throw new Error('Error al crear el pedido: ' + error.message);
    } finally {
        client.release();
    }
};

/**
 * Obtener todos los pedidos de un usuario
 */
const obtenerPedidosUsuario = async (usuario_id) => {
    try {
        const query = `
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado,
                p.monto_total,
                COUNT(pl.id_pedido_libro) as cantidad_libros
            FROM pedido p
            LEFT JOIN pedido_libros pl ON p.id_pedido = pl.pedido_id
            WHERE p.usuario_id = $1
            GROUP BY p.id_pedido
            ORDER BY p.fecha_pedido DESC
        `;

        const result = await pool.query(query, [usuario_id]);
        return result.rows;
    } catch (error) {
        console.error('Error al obtener pedidos:', error.message);
        throw new Error('Error al obtener pedidos: ' + error.message);
    }
};

/**
 * Obtener detalles de un pedido específico
 */
const obtenerDetallePedido = async (pedido_id, usuario_id) => {
    try {
        // Verificar que el pedido pertenece al usuario
        const pedidoQuery = `
            SELECT * FROM pedido
            WHERE id_pedido = $1 AND usuario_id = $2
        `;
        const pedidoResult = await pool.query(pedidoQuery, [pedido_id, usuario_id]);

        if (pedidoResult.rows.length === 0) {
            throw new Error('Pedido no encontrado');
        }

        // Obtener los libros del pedido
        const librosQuery = `
            SELECT
                pl.cantidad,
                pl.precio_unitario,
                l.titulo,
                l.autor,
                l.url_img
            FROM pedido_libros pl
            JOIN libros l ON pl.libro_id = l.id_libros
            WHERE pl.pedido_id = $1
        `;
        const librosResult = await pool.query(librosQuery, [pedido_id]);

        return {
            pedido: pedidoResult.rows[0],
            libros: librosResult.rows
        };
    } catch (error) {
        console.error('Error al obtener detalle del pedido:', error.message);
        throw new Error('Error al obtener detalle del pedido: ' + error.message);
    }
};

export { crearPedido, obtenerPedidosUsuario, obtenerDetallePedido };
