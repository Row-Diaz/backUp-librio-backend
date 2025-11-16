import pkg from 'pg';
const { Client } = pkg;

const config = {
  host: 'shortline.proxy.rlwy.net',
  user: 'postgres',
  password: 'xMcxJtiSlCYrCjHtbCSOjMJiwXOkBflM',
  database: 'railway',
  port: 47721,
  ssl: { rejectUnauthorized: false }
};

async function deleteUser() {
  const client = new Client(config);
  try {
    await client.connect();
    
    console.log('Buscando libros del usuario...');
    const libros = await client.query(
      "SELECT * FROM libros WHERE usuario_id = 7"
    );
    console.log(`Encontrados ${libros.rows.length} libros`);
    
    // Primero eliminar los libros
    if (libros.rows.length > 0) {
      await client.query("DELETE FROM libros WHERE usuario_id = 7");
      console.log('✅ Libros eliminados');
    }
    
    // Luego eliminar el usuario
    const result = await client.query(
      "DELETE FROM usuarios WHERE id_usuarios = 7 RETURNING email, nombre"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Usuario eliminado:', result.rows[0]);
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

deleteUser();
