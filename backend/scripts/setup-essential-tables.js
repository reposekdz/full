const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupEssentialTables() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('📋 Setting up essential tables...');
    
    // Drop and create tables one by one
    const tableCreationQueries = [
      // Roles table first
      `DROP TABLE IF EXISTS roles`,
      `CREATE TABLE roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Users table
      `DROP TABLE IF EXISTS users`,
      `CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'student',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Fix news_articles table
      `DROP TABLE IF EXISTS news_articles`,
      `CREATE TABLE news_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        image_url VARCHAR(500),
        author VARCHAR(100),
        category VARCHAR(50),
        date_published DATE,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Keep existing content tables but ensure they exist
      `CREATE TABLE IF NOT EXISTS slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_url VARCHAR(500),
        button_text VARCHAR(100),
        button_link VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        avatar VARCHAR(10),
        quote TEXT NOT NULL,
        rating INT DEFAULT 5,
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS school_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        stat_key VARCHAR(50) NOT NULL UNIQUE,
        value VARCHAR(20) NOT NULL,
        label VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        year VARCHAR(4),
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Academic tables
      `CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        code VARCHAR(20) UNIQUE NOT NULL,
        duration_months INT NOT NULL,
        fee_amount DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        course_id INT NOT NULL,
        teacher_id INT,
        capacity INT DEFAULT 30,
        current_enrollment INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        course_id INT NOT NULL,
        credits INT DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        enrollment_date DATE NOT NULL,
        status ENUM('active', 'completed', 'dropped', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
        marked_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        class_id INT NOT NULL,
        assessment_type ENUM('quiz', 'exam', 'assignment', 'project', 'final') NOT NULL,
        assessment_name VARCHAR(200) NOT NULL,
        max_marks DECIMAL(5,2) NOT NULL,
        obtained_marks DECIMAL(5,2) NOT NULL,
        assessment_date DATE NOT NULL,
        teacher_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Financial tables
      `CREATE TABLE IF NOT EXISTS fee_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        is_recurring BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS fee_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        fee_type_id INT NOT NULL,
        amount_paid DECIMAL(10,2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method ENUM('cash', 'bank_transfer', 'mobile_money', 'card') NOT NULL,
        receipt_number VARCHAR(100) UNIQUE,
        status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
        received_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Stock management
      `CREATE TABLE IF NOT EXISTS stock_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS stock_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INT NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        current_quantity INT DEFAULT 0,
        minimum_quantity INT DEFAULT 10,
        unit_price DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Communication
      `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        subject VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        message_type ENUM('message', 'notice', 'alert') DEFAULT 'message',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    // Execute each query
    for (let i = 0; i < tableCreationQueries.length; i++) {
      const query = tableCreationQueries[i];
      try {
        await connection.execute(query);
        if (query.includes('CREATE TABLE')) {
          const tableName = query.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/)?.[1];
          console.log(`✅ Created table: ${tableName}`);
        }
      } catch (error) {
        console.log(`⚠️ Query ${i + 1} warning: ${error.message}`);
      }
    }
    
    // Insert default data
    console.log('📋 Inserting default data...');
    
    const defaultDataQueries = [
      // Default roles
      `INSERT IGNORE INTO roles (name, description) VALUES
        ('super_admin', 'Super Administrator with full system access'),
        ('admin', 'Administrator with most system access'),
        ('teacher', 'Teaching staff'),
        ('student', 'Student user'),
        ('parent', 'Parent/Guardian user')`,
        
      // Default courses
      `INSERT IGNORE INTO courses (name, description, code, duration_months, fee_amount) VALUES
        ('Software Development', 'Comprehensive software development program', 'SOD', 24, 500000),
        ('Building Construction', 'Construction techniques and project management', 'BDC', 18, 400000),
        ('Automobile Technology', 'Automotive training and diagnostics', 'AUTO', 20, 450000)`,
        
      // Default news articles
      `INSERT IGNORE INTO news_articles (title, description, content, image_url, author, category, date_published, sort_order) VALUES
        ('School News Update', 'Latest updates from our school', 'Detailed content here...', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'Admin', 'News', '2026-01-15', 1)`,
        
      // Default testimonials
      `INSERT IGNORE INTO testimonials (name, role, avatar, quote, rating, sort_order) VALUES
        ('John Doe', 'Student - Software Development', 'JD', 'Great school with excellent facilities.', 5, 1)`,
        
      // Default school stats
      `INSERT IGNORE INTO school_stats (stat_key, value, label, icon, color, sort_order) VALUES
        ('students', '1,248', 'Students', 'Users', 'from-blue-500 to-indigo-500', 1),
        ('teachers', '84', 'Teachers', 'GraduationCap', 'from-green-500 to-teal-500', 2)`,
        
      // Default achievements
      `INSERT IGNORE INTO achievements (title, description, year, sort_order) VALUES
        ('School of the Year', 'Awarded as the best technical school', '2025', 1)`
    ];
    
    for (const query of defaultDataQueries) {
      try {
        await connection.execute(query);
      } catch (error) {
        console.log(`⚠️ Data insert warning: ${error.message}`);
      }
    }
    
    console.log('✅ Essential tables setup completed!');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupEssentialTables();