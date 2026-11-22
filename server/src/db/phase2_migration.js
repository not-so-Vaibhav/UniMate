import pool from '../config/db.js';

async function runPhase2Migration() {
  console.log('[Migration] Starting Phase 2 Schema Extension...');
  const connection = await pool.getConnection();

  try {
    // 1. Assistant Conversations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assistant_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT 'New Campus Inquiry',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_assistant_conv_user (user_id),
        CONSTRAINT fk_assistant_conv_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ Table `assistant_conversations` ensured.');

    // 2. Assistant Messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assistant_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender ENUM('user', 'assistant') NOT NULL,
        content TEXT NOT NULL,
        sources JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_assistant_msg_conv (conversation_id),
        CONSTRAINT fk_assistant_msg_conv FOREIGN KEY (conversation_id) REFERENCES assistant_conversations (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ Table `assistant_messages` ensured.');

    // 3. Ensure canteen_orders status enum includes 'rejected'
    await connection.query(`
      ALTER TABLE canteen_orders 
      MODIFY COLUMN status ENUM('placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected') 
      NOT NULL DEFAULT 'placed';
    `);
    console.log('✔ `canteen_orders.status` enum updated with rejected state.');

    // 4. Ensure print_requests status enum includes 'accepted', 'completed', 'rejected'
    await connection.query(`
      ALTER TABLE print_requests 
      MODIFY COLUMN status ENUM('submitted', 'accepted', 'in_progress', 'ready', 'collected', 'completed', 'cancelled', 'rejected') 
      NOT NULL DEFAULT 'submitted';
    `);
    console.log('✔ `print_requests.status` enum updated with full lifecycle states.');

    // 5. Ensure lost_found_items status enum includes 'under_review'
    await connection.query(`
      ALTER TABLE lost_found_items 
      MODIFY COLUMN status ENUM('reported', 'under_review', 'claimed', 'resolved', 'closed') 
      NOT NULL DEFAULT 'reported';
    `);
    console.log('✔ `lost_found_items.status` enum updated.');

    // 6. Ensure uploads directory exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      ORDER BY TABLE_NAME;
    `);
    console.log('Current Database Tables in MySQL:');
    tables.forEach((t) => console.log(` - ${t.TABLE_NAME}`));

    console.log('[Migration] Phase 2 Schema Extension completed successfully.');
  } catch (error) {
    console.error('[Migration] Phase 2 Schema Extension failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('phase2_migration.js')) {
  runPhase2Migration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default runPhase2Migration;
