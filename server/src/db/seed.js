import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

async function seedData() {
  console.log('[Seed] Connecting to MySQL database:', env.DB.NAME);
  const connection = await mysql.createConnection({
    host: env.DB.HOST,
    port: env.DB.PORT,
    user: env.DB.USER,
    password: env.DB.PASSWORD,
    database: env.DB.NAME,
  });

  try {
    console.log('[Seed] Seeding development/demo baseline accounts...');

    // Standard salt rounds for development
    const salt = await bcrypt.genSalt(10);
    const studentPass = await bcrypt.hash('StudentPass123!', salt);
    const operatorPass = await bcrypt.hash('OperatorPass123!', salt);
    const adminPass = await bcrypt.hash('AdminPass123!', salt);

    // 1. Seed demo accounts (clearly identified as Demo/Dev accounts)
    const users = [
      ['demo.student@campus.edu', studentPass, 'Arjun Sharma (Demo Student)', 'student', null, 'STU-2026-0842', '+91 98765 43210'],
      ['demo.canteen@campus.edu', operatorPass, 'Ramesh Canteen Desk (Demo Operator)', 'operator', 'canteen', null, '+91 98765 43211'],
      ['demo.xerox@campus.edu', operatorPass, 'Anita Xerox Desk (Demo Operator)', 'operator', 'printing', null, '+91 98765 43212'],
      ['demo.admin@campus.edu', adminPass, 'Campus Administration (Demo Admin)', 'admin', null, null, '+91 98765 43213'],
    ];

    for (const user of users) {
      await connection.query(
        `INSERT INTO users (email, password_hash, full_name, role, operator_service, student_id, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role = VALUES(role), operator_service = VALUES(operator_service)`,
        user
      );
    }
    console.log('[Seed] Baseline demo users verified (Student, Canteen Operator, Xerox Operator, Admin).');

    // 2. Seed development campus locations
    const locations = [
      ['Main Academic Block - Sector A', 'MAB-A', 'academic', 'Main Academic Building', 'Ground Floor', 'Primary lecture halls A1-A10 and department offices.'],
      ['Central Library', 'LIB-01', 'facility', 'Library Complex', '1st Floor', 'Central university reading halls, reference sections, and digital catalogue.'],
      ['Student Activity Center', 'SAC-01', 'facility', 'SAC Building', 'Ground Floor', 'Student union hall, club rooms, and indoor sports desk.'],
      ['North Canteen', 'CNT-NORTH', 'canteen', 'Dining Block', 'Ground Floor', 'Main campus cafeteria and food counter.'],
      ['Digital Xerox Center', 'XRX-01', 'facility', 'Main Academic Building', 'Ground Floor', 'Central photocopying, spiral binding, and document printing hub.'],
    ];

    for (const loc of locations) {
      await connection.query(
        `INSERT INTO campus_locations (name, code, category, building, floor, description)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
        loc
      );
    }
    console.log('[Seed] Verified campus locations seeded for development.');

    // 3. Seed development canteen menu items
    const menuItems = [
      ['Veg Sandwich (Toasted)', 'breakfast', 45.00, 'Whole wheat bread with fresh cucumbers, tomatoes, and mint chutney.'],
      ['Masala Dosa', 'breakfast', 60.00, 'Crispy fermented crepe served with sambar and fresh coconut chutney.'],
      ['Paneer Butter Masala Thali', 'meals', 120.00, 'Paneer curry, yellow dal, rice, two rotis, salad and curd.'],
      ['Cold Coffee', 'beverages', 40.00, 'Chilled brewed coffee blended with milk and cocoa powder.'],
      ['Hot Masala Chai', 'beverages', 15.00, 'Freshly brewed spiced milk tea with ginger and cardamom.'],
    ];

    for (const item of menuItems) {
      const [existing] = await connection.query('SELECT id FROM canteen_menu_items WHERE name = ?', [item[0]]);
      if (existing.length === 0) {
        await connection.query(
          `INSERT INTO canteen_menu_items (name, category, price, description) VALUES (?, ?, ?, ?)`,
          item
        );
      }
    }
    console.log('[Seed] Baseline canteen menu items seeded.');

    console.log('[Seed] Database seeding completed successfully.');
  } catch (error) {
    console.error('[Seed] Seeding error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedData();
