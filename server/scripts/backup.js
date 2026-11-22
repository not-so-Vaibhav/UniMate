import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function performBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `unimate_backup_${timestamp}.json`);
  console.log(`[Backup] Starting UniMate database backup from ${env.DB.HOST}:${env.DB.PORT}...`);

  const connection = await mysql.createConnection({
    host: env.DB.HOST,
    port: env.DB.PORT,
    user: env.DB.USER,
    password: env.DB.PASSWORD,
    database: env.DB.NAME,
  });

  try {
    const [tables] = await connection.query('SHOW FULL TABLES WHERE Table_Type = "BASE TABLE"');
    const tableNames = tables.map((row) => Object.values(row)[0]);

    console.log(`[Backup] Found ${tableNames.length} tables to dump.`);

    const backupData = {
      meta: {
        timestamp: new Date().toISOString(),
        database: env.DB.NAME,
        host: env.DB.HOST,
        version: '1.0.0',
        tableCount: tableNames.length,
      },
      tables: {},
    };

    for (const table of tableNames) {
      const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
      backupData.tables[table] = rows;
      console.log(`  ✔ Exported table '${table}': ${rows.length} records`);
    }

    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
    console.log(`[Backup] Backup successfully written to: ${backupFilePath}`);
    console.log(`[Backup] File size: ${(fs.statSync(backupFilePath).size / 1024).toFixed(2)} KB`);
  } catch (err) {
    console.error('[Backup] Backup failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

performBackup();
