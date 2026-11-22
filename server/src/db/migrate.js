import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('[Migration] Connecting to MySQL server at', `${env.DB.HOST}:${env.DB.PORT}...`);
  
  // Connect without database first to ensure database existence
  const connection = await mysql.createConnection({
    host: env.DB.HOST,
    port: env.DB.PORT,
    user: env.DB.USER,
    password: env.DB.PASSWORD,
    multipleStatements: true,
  });

  try {
    console.log('[Migration] Ensuring database exists:', env.DB.NAME);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB.NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${env.DB.NAME}\`;`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[Migration] Executing schema.sql statements...');
    await connection.query(sql);

    console.log('[Migration] Schema migration completed successfully.');
  } catch (error) {
    console.error('[Migration] Migration error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
