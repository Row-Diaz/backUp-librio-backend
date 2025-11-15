import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const railwayPool = new Pool({
  host: 'hopper.proxy.rlwy.net',
  user: 'postgres',
  password: 'MidfbyGGjyZltIntpnnhCjYYVErTRnro',
  database: 'railway',
  port: 44238,
  ssl: false
});

function fixDate(dateStr) {
  if (!dateStr) return null;
  if (/^\d{4}$/.test(dateStr)) {
    return `${dateStr}-01-01`;
  }
  return dateStr;
}

async function migrate() {
  try {
    console.log('Ì≥¶ Conectando a Railway PostgreSQL...\n');
    
    const backup = JSON.parse(fs.readFileSync('backup_render.json', 'utf8'));
    console.log(`Ì≥ä Backup cargado:`);
    console.log(`   - ${backup.usuarios.length} usuarios`);
    console.log(`   - ${backup.libros.length} libros`);
    console.log(`   - ${backup.pedidos.length} pedidos\n`);
    
    console.log('Ì¥® Creando tablas...');
    const schema = fs.readFileSync('create_schema.sql', 'utf8');
    await railwayPool.query(schema);
    console.log('‚úÖ Tablas creadas\n');
    
    console.log('Ì∑π Limpiando tablas existentes...');
    await railwayPool.query('TRUNCATE TABLE pedido_libros, pedido, libros, usuarios RESTART IDENTITY CASCADE');
    console.log('‚úÖ Tablas limpiadas\n');
    
    console.log('Ì±• Migrando usuarios...');
    for (const usuario of backup.usuarios) {
      await railwayPool.query(
        `INSERT INTO usuarios (id_usuarios, email, password, nombre, apellido, admin, foto_perfil) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [usuario.id_usuarios, usuario.email, usuario.password, usuario.nombre, 
         usuario.apellido, usuario.admin, usuario.foto_perfil]
      );
    }
    await railwayPool.query(
      `SELECT setval('usuarios_id_usuarios_seq', (SELECT MAX(id_usuarios) FROM usuarios))`
    );
    console.log(`‚úÖ ${backup.usuarios.length} usuarios migrados\n`);
    
    console.log('Ì≥ö Migrando libros...');
    for (const libro of backup.libros) {
      const fechaArreglada = fixDate(libro.anio_publicacion);
      await railwayPool.query(
        `INSERT INTO libros (id_libros, titulo, autor, editorial, anio_publicacion, genero, descripcion, precio, url_img, estado, usuario_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [libro.id_libros, libro.titulo, libro.autor, libro.editorial, 
         fechaArreglada, libro.genero, libro.descripcion, 
         libro.precio, libro.url_img, libro.estado, libro.usuario_id]
      );
    }
    await railwayPool.query(
      `SELECT setval('libros_id_libros_seq', (SELECT MAX(id_libros) FROM libros))`
    );
    console.log(`‚úÖ ${backup.libros.length} libros migrados\n`);
    
    console.log('Ìªí Migrando pedidos...');
    for (const pedido of backup.pedidos) {
      await railwayPool.query(
        `INSERT INTO pedido (id_pedido, fecha_pedido, estado, monto_total, usuario_id) 
         VALUES ($1, $2, $3, $4, $5)`,
        [pedido.id_pedido, pedido.fecha_pedido, pedido.estado, pedido.monto_total, pedido.usuario_id]
      );
    }
    if (backup.pedidos.length > 0) {
      await railwayPool.query(
        `SELECT setval('pedido_id_pedido_seq', (SELECT MAX(id_pedido) FROM pedido))`
      );
    }
    console.log(`‚úÖ ${backup.pedidos.length} pedidos migrados\n`);
    
    console.log('Ì≥¶ Migrando items de pedido...');
    for (const item of backup.pedido_libros) {
      await railwayPool.query(
        `INSERT INTO pedido_libros (pedido_id, libro_id, cantidad, precio_unitario) 
         VALUES ($1, $2, $3, $4)`,
        [item.pedido_id, item.libro_id, item.cantidad, item.precio_unitario]
      );
    }
    console.log(`‚úÖ ${backup.pedido_libros.length} items migrados\n`);
    
    const countUsuarios = await railwayPool.query('SELECT COUNT(*) FROM usuarios');
    const countLibros = await railwayPool.query('SELECT COUNT(*) FROM libros');
    const countPedidos = await railwayPool.query('SELECT COUNT(*) FROM pedido');
    
    console.log('Ì≥ä Verificaci√≥n final:');
    console.log(`   ‚úì Usuarios: ${countUsuarios.rows[0].count}`);
    console.log(`   ‚úì Libros: ${countLibros.rows[0].count}`);
    console.log(`   ‚úì Pedidos: ${countPedidos.rows[0].count}`);
    console.log('\nÌæâ ¬°Migraci√≥n completada exitosamente!');
    
    await railwayPool.end();
  } catch (error) {
    console.error('‚ùå Error:', error.message);
  }
}

migrate();
