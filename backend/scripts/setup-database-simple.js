#!/usr/bin/env node

const mysql = require('mysql2');
require('dotenv').config();

const setupDatabase = async () => {
  let connection;
  
  try {
    console.log('\n🔧 Setting up database schema...\n');
    
    // Connect to database
    connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    const promiseConnection = connection.promise();
    console.log('✅ Connected to database');

    // Create admin_users table first (for backward compatibility)
    console.log('📋 Creating admin_users table...');
    await promiseConnection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create levels table
    console.log('📋 Creating levels table...');
    await promiseConnection.execute(`
      CREATE TABLE IF NOT EXISTS levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create trades table
    console.log('📋 Creating trades table...');
    await promiseConnection.execute(`
      CREATE TABLE IF NOT EXISTS trades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create classes table
    console.log('📋 Creating classes table...');
    await promiseConnection.execute(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        level_id INT,
        capacity INT DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add foreign key constraint separately to avoid issues
    try {
      await promiseConnection.execute(`
        ALTER TABLE classes 
        ADD CONSTRAINT fk_classes_level_id 
        FOREIGN KEY (level_id) REFERENCES levels(id)
      `);
    } catch (e) {
      // Foreign key might already exist
      console.log('  ✓ Foreign key constraint already exists or level_id column exists');
    }

    // Create roles table
    console.log('📋 Creating roles table...');
    await promiseConnection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table (main users table)
    console.log('📋 Creating users table...');
    await promiseConnection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'student',
        student_id VARCHAR(50) UNIQUE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create conduct_records table
    console.log('📋 Creating conduct_records table...');
    await promiseConnection.execute(`
      CREATE TABLE IF NOT EXISTS conduct_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        severity VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id)
      )
    `);

    // Create class_teachers table
    console.log('📋 Creating class_teachers table...');
    await promiseConnection.execute(`
      CREATE TABLE IF NOT EXISTS class_teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        class_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (class_id) REFERENCES classes(id)
      )
    `);

    console.log('✅ All tables created successfully');

    await promiseConnection.end();
    console.log('\n✅ Database setup complete!\n');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    if (connection) {
      try {
        await connection.promise().end();
      } catch (e) {
        // Connection might already be closed
      }
    }
    process.exit(1);
  }
};

setupDatabase();