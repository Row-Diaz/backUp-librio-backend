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
    
    const result = await client.query(
      "DELETE FROM usuarios WHERE email = 'axl@invalid.com' RETURNING *"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Usuario eliminado:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ Usuario no encontrado');
    }
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

deleteUser();
