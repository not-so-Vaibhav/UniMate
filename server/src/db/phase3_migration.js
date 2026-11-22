import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPhase3Migration() {
  console.log('[Migration] Starting Phase 3 Schema Extension: Hybrid Campus Data & Provenance...');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Create table knowledge_documents
    await connection.query(`
      CREATE TABLE IF NOT EXISTS knowledge_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        source_reference VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        key_points JSON NULL,
        keywords JSON NULL,
        classification ENUM('DEVELOPMENT_SAMPLE', 'PENDING_VERIFICATION', 'OFFICIAL_VERIFIED', 'RETIRED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        verified_by_user_id INT NULL,
        verified_at TIMESTAMP NULL,
        version INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_kb_category (category),
        INDEX idx_kb_classification (classification),
        INDEX idx_kb_published (is_published),
        CONSTRAINT fk_kb_verifier FOREIGN KEY (verified_by_user_id) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ Table `knowledge_documents` ensured.');

    // 2. Create table knowledge_document_revisions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS knowledge_document_revisions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_id INT NOT NULL,
        version INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        key_points JSON NULL,
        changed_by_user_id INT NOT NULL,
        change_reason VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_kbr_doc (document_id),
        CONSTRAINT fk_kbr_doc FOREIGN KEY (document_id) REFERENCES knowledge_documents (id) ON DELETE CASCADE,
        CONSTRAINT fk_kbr_user FOREIGN KEY (changed_by_user_id) REFERENCES users (id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ Table `knowledge_document_revisions` ensured.');

    // 3. Add provenance columns to campus_locations if not exists
    const [locColumns] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campus_locations' AND COLUMN_NAME = 'classification';
    `);

    if (locColumns.length === 0) {
      await connection.query(`
        ALTER TABLE campus_locations
        ADD COLUMN classification ENUM('DEVELOPMENT_SAMPLE', 'PENDING_VERIFICATION', 'OFFICIAL_VERIFIED') NOT NULL DEFAULT 'DEVELOPMENT_SAMPLE',
        ADD COLUMN source_reference VARCHAR(255) NULL,
        ADD COLUMN verified_by_user_id INT NULL,
        ADD COLUMN verified_at TIMESTAMP NULL,
        ADD CONSTRAINT fk_loc_verifier FOREIGN KEY (verified_by_user_id) REFERENCES users (id) ON DELETE SET NULL;
      `);
      console.log('✔ Provenance columns added to `campus_locations`.');
    }

    // 4. Add provenance columns to canteen_menu_items if not exists
    const [menuColumns] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'canteen_menu_items' AND COLUMN_NAME = 'classification';
    `);

    if (menuColumns.length === 0) {
      await connection.query(`
        ALTER TABLE canteen_menu_items
        ADD COLUMN classification ENUM('DEVELOPMENT_SAMPLE', 'PENDING_VERIFICATION', 'OFFICIAL_VERIFIED') NOT NULL DEFAULT 'DEVELOPMENT_SAMPLE',
        ADD COLUMN source_reference VARCHAR(255) NULL,
        ADD COLUMN verified_by_user_id INT NULL,
        ADD COLUMN verified_at TIMESTAMP NULL,
        ADD CONSTRAINT fk_menu_verifier FOREIGN KEY (verified_by_user_id) REFERENCES users (id) ON DELETE SET NULL;
      `);
      console.log('✔ Provenance columns added to `canteen_menu_items`.');
    }

    // 5. Seed baseline baseline knowledge documents from corpus if knowledge_documents is empty
    const [existingDocs] = await connection.query(`SELECT COUNT(*) as cnt FROM knowledge_documents`);
    if (existingDocs[0].cnt === 0) {
      const corpusPath = path.resolve(__dirname, '../../../ai-service/app/knowledge/campus_corpus.json');
      if (fs.existsSync(corpusPath)) {
        const rawCorpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
        console.log(`[Migration] Seeding ${rawCorpus.length} baseline documents into knowledge_documents...`);

        for (const item of rawCorpus) {
          await connection.query(`
            INSERT INTO knowledge_documents (
              title, category, source_reference, summary, key_points, keywords,
              classification, is_published, version
            ) VALUES (?, ?, ?, ?, ?, ?, 'DEVELOPMENT_SAMPLE', TRUE, 1)
          `, [
            item.title,
            item.category,
            item.source,
            item.summary,
            JSON.stringify(item.key_points || []),
            JSON.stringify(item.keywords || []),
          ]);
        }
        console.log('✔ Baseline knowledge documents seeded and classified as DEVELOPMENT_SAMPLE.');
      }
    }

    await connection.commit();
    console.log('[Migration] Phase 3 Schema Extension completed successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('[Migration] Phase 3 Schema Extension failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('phase3_migration.js')) {
  runPhase3Migration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default runPhase3Migration;
