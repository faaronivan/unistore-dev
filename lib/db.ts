import { Pool } from 'pg';

const isProduction = process.env.DATABASE_URL?.includes('neon.tech');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});