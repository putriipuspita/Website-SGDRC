import mysql from 'mysql2/promise';

// Gunakan global agar pool tidak dibuat ulang saat hot reload di Next.js
let pool = global.dbPool;

export const hubungkanDB = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'db_sgdrc',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    global.dbPool = pool;
  }
  return pool;
};
