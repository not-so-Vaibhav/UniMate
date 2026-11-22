import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function performRestore() {
  const args = process.argv.slice(2);
  let targetFile = args[0];

  const backupDir = path.resolve(__dirname, '../backups');

  if (!targetFile) {
    // If no argument, find latest backup in backups directory
    if (!fs.existsSync(backupDir)) {
      console.error('[Restore] No backups directory found at', backupDir);
      process.exit(1);
    }
    const files = fs.readdirSync(backupDir).filter((f) => f.endsWith('.json')).sort().reverse();
    if (files.length === 0) {
      console.error('[Restore] No JSON backup files found in', backupDir);
      process.exit(1);
    }
    targetFile = path.join(backupDir, files[0]);
  } else if (!path.isAbsolute(targetFile)) {
    targetFile = path.resolve(process.cwd(), targetFile);
  }

  if (!fs.existsSync(targetFile)) {
    console.error(`[Restore] Target backup file not found: ${targetFile}`);
    process.exit(1);
  }

  console.log(`[Restore] Reading backup file: ${targetFile}`);
  const backupContent = JSON.parse(fs.readFileSync(targetFile, 'utf8'));

  console.log(`[Restore] Backup metadata:`, backupContent.meta);

  const connection = await mysql.createConnection({
    host: env.DB.HOST,
    port: env.DB.PORT,
    user: env.DB.USER,
    password: env.DB.PASSWORD,
    database: env.DB.NAME,
    multipleStatements: true,
  });

  try {
    // Disable foreign key checks for restore sequence
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    const tableNames = Object.keys(backupContent.tables);
    for (const table of tableNames) {
      const rows = backupContent.tables[table];
      await connection.query(`TRUNCATE TABLE \`${table}\``);

      if (rows && rows.length > 0) {
        for (const row of rows) {
          const keys = Object.keys(row);
          const values = Object.values(row).map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : v));
          const placeholders = keys.map(() => '?').join(', ');
          const colList = keys.map((k) => `\`${k}\``).join(', ');

          await connection.query(
            `INSERT INTO \`${table}\` (${colList}) VALUES (${placeholders})`,
            values
          );
        }
      }
      console.log(`  ✔ Restored table '${table}': ${rows.length} rows`);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('[Restore] Database restore completed successfully.');
  } catch (err) {
    console.error('[Restore] Restore error:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

performRestore();
