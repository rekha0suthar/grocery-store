import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'grocery_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'grocery_store',
  password: process.env.DB_PASSWORD || 'grocery_password',
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;
