import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Usar siempre variables individuales para evitar problemas con .internal
const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  max: 5,
  min: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
  statement_timeout: 15000,
  ssl: false
};

console.log('í´§ Conectando a:', process.env.DB_HOST);

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('âŒ Error inesperado en el pool:', err);
});

pool.on('connect', () => {
  console.log('âœ… ConexiÃ³n al pool establecida');
});

export { pool };
