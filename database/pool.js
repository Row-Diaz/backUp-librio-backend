import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  max: 5,
  min: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
  statement_timeout: 30000
};

// SSL solo si es necesario (Render.com lo necesita, Railway NO)
if (process.env.DB_HOST && process.env.DB_HOST.includes('render.com')) {
  poolConfig.ssl = { rejectUnauthorized: false };
  console.log('✅ SSL habilitado para Render');
} else {
  console.log('✅ SSL deshabilitado (Railway)');
}

console.log('✅ Conectando a BD:', process.env.DB_HOST);

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('❌ Error en pool:', err);
});

pool.on('connect', () => {
  console.log('✅ Conexión establecida con la base de datos');
});

export { pool };
