import { pool } from '../database/pool.js';

/**
 * Crear un nuevo pedido SIN transacciones (para debugging)
 */
const crearPedido = async (usuario_id, carrito) => {
    try {
        console.log('1. Iniciando crearPedido');
        
        // Validar que el carrito no esté vacío
        if (!carrito || carrito.length === 0) {
            throw new Error('El carrito está vacío');
        }

        console.log('2. Carrito validado, items:', carrito.length);

        // Validar datos
        for (const item of carrito) {
            if (!item.id || !item.precio || !item.count) {
                throw new Error(`Item inválido: ${JSON.stringify(item)}`);
            }
        }

        console.log('3. Items validados');

        // Calcular monto total
        const monto_total = carrito.reduce((total, item) => {
            return total + (parseFloat(item.precio) * parseInt(item.count));
        }, 0);

        console.log('4. Monto total calculado:', monto_total);

        // Insertar pedido
        const pedidoQuery = `
            INSERT INTO pedido (fecha_pedido, estado, monto_total, usuario_id)
            VALUES (CURRENT_DATE, true, $1, $2)
            RETURNING id_pedido
        `;
        
        console.log('5. Ejecutando INSERT pedido...');
        const pedidoResult = await pool.query(pedidoQuery, [monto_total, usuario_id]);
        const pedido_id = pedidoResult.rows[0].id_pedido;
        
        console.log('6. Pedido insertado, ID:', pedido_id);

        // Insertar libros uno por uno con manejo de errores individual
        console.log('7. Insertando libros...');
        for (let i = 0; i < carrito.length; i++) {
            const item = carrito[i];
            try {
                const libroQuery = `
                    INSERT INTO pedido_libros (pedido_id, libro_id, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4)
                `;
                await pool.query(libroQuery, [
                    pedido_id,
                    item.id,
                    parseInt(item.count),
                    parseFloat(item.precio)
                ]);
                console.log(`8.${i}. Libro ${item.id} insertado`);
            } catch (libroError) {
                console.error(`Error insertando libro ${item.id}:`, libroError.message);
                // Continuar con los demás libros
            }
        }

        console.log('9. Pedido completado');

        return {
            id_pedido: pedido_id,
            monto_total,
            fecha_pedido: new Date()
        };

    } catch (error) {
        console.error('ERROR en crearPedido:', error.message);
        console.error('ERROR stack:', error.stack);
        throw new Error('Error al crear el pedido: ' + error.message);
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
        console.error('Error al obtener pedidos:', error.message);
        throw new Error('Error al obtener pedidos: ' + error.message);
    }
};

/**
 * Obtener detalle de un pedido específico
 */
const obtenerDetallePedido = async (pedido_id, usuario_id) => {
    try {
        const pedidoQuery = `
            SELECT * FROM pedido 
            WHERE id_pedido = $1 AND usuario_id = $2
        `;
        const pedidoResult = await pool.query(pedidoQuery, [pedido_id, usuario_id]);
        
        if (pedidoResult.rows.length === 0) {
            throw new Error('Pedido no encontrado');
        }

        const librosQuery = `
            SELECT 
                pl.*,
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
