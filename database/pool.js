import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

let poolConfig;

if (DATABASE_URL) {
  // Railway genera DATABASE_URL con postgres.railway.internal
  // Necesitamos usar la URL pÃºblica para conexiones externas
  let connectionString = DATABASE_URL;
  
  // Si estamos en Railway, usar la URL tal cual (internal)
  // Si no, intentar conectar con credenciales separadas
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log('íº‚ Entorno Railway detectado, usando DATABASE_URL interna');
    poolConfig = {
      connectionString: DATABASE_URL,
      max: 5,
      min: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 30000,
      statement_timeout: 15000
    };
  } else {
    // Fuera de Railway, usar credenciales manuales
    console.log('í´§ Fuera de Railway, usando credenciales manuales');
    poolConfig = {
      host: process.env.DB_HOST || 'hopper.proxy.rlwy.net',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'MidfbyGGjyZltIntpnnhCjYYVErTRnro',
      database: process.env.DB_NAME || 'railway',
      port: process.env.DB_PORT || 44238,
      max: 5,
      min: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 30000,
      statement_timeout: 15000,
      ssl: false
    };
  }
} else {
  // ConfiguraciÃ³n manual completa
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
  console.log('í³ Usando configuraciÃ³n manual de variables individuales');
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('âŒ Error inesperado en el pool:', err);
});

pool.on('connect', () => {
  console.log('âœ… ConexiÃ³n al pool establecida');
});

export { pool };
