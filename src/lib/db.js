import mysql from 'mysql2/promise';

let pool = global.dbPool;

// Fungsi Mengubungkan Ke Database
export const hubungkanDB = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
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
