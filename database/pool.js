import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Si estamos en Railway, usar la URL interna
const DATABASE_URL = process.env.DATABASE_URL;
const isRailway = process.env.RAILWAY_ENVIRONMENT || DATABASE_URL;

let poolConfig;

if (DATABASE_URL) {
  // Usar DATABASE_URL si estÃ¡ disponible (Railway la genera automÃ¡ticamente)
  poolConfig = {
    connectionString: DATABASE_URL,
    max: 5,
    min: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 30000,
    statement_timeout: 15000
  };
  console.log('íº‚ Usando DATABASE_URL de Railway');
} else {
  // ConfiguraciÃ³n manual
  poolConfig = {
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
    ssl: {
      rejectUnauthorized: false
    }
  };
  console.log('í´§ Usando configuraciÃ³n manual de DB');
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('âŒ Error inesperado en el pool:', err);
});

pool.on('connect', () => {
  console.log('âœ… ConexiÃ³n al pool establecida');
});

export { pool };
