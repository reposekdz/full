const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupAdminSystem() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✓ Connected to database');

    // Ensure all required tables exist
    const tables = [
      'users', 'admin_users', 'content_items', 'sports', 'leadership', 
      'trades', 'developers', 'notifications', 'security_logs', 'news_articles'
    ];

    for (const table of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`✓ Table ${table} exists`);
      } else {
        console.log(`⚠ Table ${table} missing - run migrations`);
      }
    }

    // Add profile_image columns if missing
    try {
      await connection.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500)');
      await connection.query('ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500)');
      console.log('✓ Profile image columns added');
    } catch (error) {
      console.log('✓ Profile image columns already exist');
    }

    // Create sample admin if not exists
    const [admins] = await connection.query('SELECT id FROM admin_users WHERE role = "admin" LIMIT 1');
    if (admins.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO admin_users (username, email, password, role, name) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@school.rw', hashedPassword, 'admin', 'System Administrator']
      );
      console.log('✓ Sample admin created (username: admin, password: admin123)');
    }

    console.log('\n✅ Admin System Setup Complete!');
    console.log('\nYou can now:');
    console.log('- Login as admin');
    console.log('- Manage all users (students, teachers, parents, staff)');
    console.log('- View analytics and reports');
    console.log('- Manage content (sports, leadership, trades, developers)');
    console.log('- Handle notifications');
    console.log('- Access security logs');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupAdminSystem();
