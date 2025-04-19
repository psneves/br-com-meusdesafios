// web-backend/lib/db.ts

import { Pool } from 'pg';

// Use the DATABASE_URL from your .env.local file
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Create a new Pool instance
const pool = new Pool({
  connectionString,
  // Optional: Add SSL configuration if connecting to a remote database that requires it
  // ssl: {
  //   rejectUnauthorized: false, // Adjust based on your SSL certificate setup
  // },
});

// Test the connection (optional, but good for debugging)
pool.on('connect', () => {
  console.log('Database connected successfully!');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err.message, err.stack);
});

// Export the pool to be used in API routes
export { pool };