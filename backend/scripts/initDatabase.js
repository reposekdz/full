const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    // Create connection without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('✅ Database created successfully');

    // Close and reconnect with database selected
    await connection.end();
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    // Create admin users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create home page slides table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS home_slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        button_text VARCHAR(100),
        button_link VARCHAR(300),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create home page sections table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS home_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_name VARCHAR(100) NOT NULL,
        title VARCHAR(255),
        subtitle VARCHAR(255),
        description TEXT,
        image_url VARCHAR(500),
        background_color VARCHAR(20),
        text_color VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create dynamic content table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dynamic_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page VARCHAR(50) NOT NULL,
        section VARCHAR(50) NOT NULL,
        content_key VARCHAR(100) NOT NULL,
        content_value TEXT NOT NULL,
        content_type ENUM('text', 'image', 'html', 'json') DEFAULT 'text',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_content (page, section, content_key)
      )
    `);

    // Create trade programs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trade_programs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        total_students INT DEFAULT 0,
        graduation_rate DECIMAL(5,2) DEFAULT 0,
        employment_rate DECIMAL(5,2) DEFAULT 0,
        average_salary VARCHAR(50),
        industry_partners INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create uploaded files table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL
      )
    `);

    // Insert default admin user (password: admin123)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.execute(`
      INSERT IGNORE INTO admin_users (username, email, password, role) 
      VALUES ('admin', 'admin@school.com', ?, 'super_admin')
    `, [hashedPassword]);

    // Insert default home sections
    await connection.execute(`
      INSERT IGNORE INTO home_sections (section_name, title, subtitle, description, sort_order) VALUES
      ('hero', 'POWERFUL SCHOOL MANAGEMENT SYSTEM', 'Excellence in Education', 'Empowering students with world-class technical education and modern learning facilities.', 1),
      ('about', 'About Our Institution', 'Leading Technical Education', 'We provide comprehensive technical education programs that prepare students for successful careers in today''s competitive job market.', 2),
      ('programs', 'Our Programs', 'Technical Education Excellence', 'Discover our range of professional technical education programs designed for industry success.', 3),
      ('stats', 'Our Achievements', 'Numbers That Matter', 'See the impact we''ve made in technical education over the years.', 4)
    `);

    // Insert default slides
    await connection.execute(`
      INSERT IGNORE INTO home_slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES
      ('Welcome to Excellence', 'TVET Education at its Best', 'Join thousands of students who have transformed their careers through our comprehensive technical programs.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', 'Explore Programs', '/trades', 1),
      ('Build Your Future', 'Hands-On Learning', 'Master practical skills with our modern facilities and expert instructors in Software Development, Construction, and Automotive Technology.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80', 'Get Started', '/register', 2),
      ('Industry Ready', '94% Success Rate', 'Our graduates are highly sought after by employers. Join our community of successful professionals.', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80', 'View Success Stories', '/testimonials', 3)
    `);

    // Insert default trade programs
    await connection.execute(`
      INSERT IGNORE INTO trade_programs (code, title, description, image_url, total_students, graduation_rate, employment_rate, average_salary, industry_partners) VALUES
      ('SOD', 'Software Development', 'Master modern programming languages, frameworks, and development methodologies. Build web applications, mobile apps, and enterprise software solutions.', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80', 420, 96.5, 94.2, '$85,000', 25),
      ('BDC', 'Building & Construction', 'Learn construction techniques, project management, and safety protocols. Work with modern tools and sustainable building practices.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', 380, 92.8, 89.5, '$72,000', 18),
      ('AUT', 'Automobile Technology', 'Comprehensive automotive training covering diagnostics, repair, and modern vehicle technologies including hybrid and electric systems.', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', 290, 94.1, 91.8, '$68,000', 22)
    `);

    console.log('✅ Database tables created successfully');
    console.log('✅ Default data inserted successfully');
    console.log('📧 Admin credentials: admin@school.com / admin123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();