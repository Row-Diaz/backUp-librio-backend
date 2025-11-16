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

async function checkUser() {
  const client = new Client(config);
  try {
    await client.connect();
    
    const result = await client.query(
      "SELECT id_usuarios, email, nombre FROM usuarios WHERE email = 'axl@invalid.com'"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Usuario encontrado en Railway:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ Usuario NO existe en Railway');
    }
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUser();
