const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupSystemUpdates() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // System images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        component_name VARCHAR(255) NOT NULL,
        image_key VARCHAR(255) NOT NULL,
        image_url VARCHAR(500),
        alt_text VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_component_key (component_name, image_key)
      )
    `);

    // System content table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_content (
        id INT PRIMARY KEY AUTO_INCREMENT,
        component_name VARCHAR(255) NOT NULL,
        content_key VARCHAR(255) NOT NULL,
        content_rw TEXT,
        content_en TEXT,
        content_type VARCHAR(50),
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_component_content (component_name, content_key)
      )
    `);

    // System components table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_components (
        id INT PRIMARY KEY AUTO_INCREMENT,
        component_name VARCHAR(255) NOT NULL UNIQUE,
        display_name VARCHAR(255),
        category VARCHAR(100),
        description TEXT,
        config JSON,
        is_active BOOLEAN DEFAULT true,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // System settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value TEXT,
        setting_type VARCHAR(50),
        category VARCHAR(100),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Update history table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_update_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        update_type VARCHAR(100),
        component_name VARCHAR(255),
        update_description TEXT,
        updated_by VARCHAR(255),
        old_value TEXT,
        new_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default components
    await connection.query(`
      INSERT IGNORE INTO system_components (component_name, display_name, category, description) VALUES
      ('HomePage', 'Home Page', 'Pages', 'Main landing page'),
      ('Header', 'Header Navigation', 'Layout', 'Top navigation bar'),
      ('Footer', 'Footer', 'Layout', 'Bottom footer section'),
      ('HeroSection', 'Hero Section', 'Components', 'Main hero banner'),
      ('AboutPage', 'About Page', 'Pages', 'About school page'),
      ('ServicesPage', 'Services Page', 'Pages', 'Services listing'),
      ('SportsPage', 'Sports Page', 'Pages', 'Sports and teams'),
      ('LeadershipPage', 'Leadership Page', 'Pages', 'School leadership'),
      ('ContactPage', 'Contact Page', 'Pages', 'Contact information'),
      ('StudentDashboard', 'Student Dashboard', 'Dashboards', 'Student portal'),
      ('TeacherDashboard', 'Teacher Dashboard', 'Dashboards', 'Teacher portal'),
      ('ParentDashboard', 'Parent Dashboard', 'Dashboards', 'Parent portal')
    `);

    // Insert default settings
    await connection.query(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_type, category, description) VALUES
      ('school_name', 'Garden TVET School', 'text', 'General', 'School name'),
      ('school_motto', 'Excellence in Education', 'text', 'General', 'School motto'),
      ('primary_color', '#10b981', 'color', 'Theme', 'Primary brand color'),
      ('secondary_color', '#eab308', 'color', 'Theme', 'Secondary brand color'),
      ('contact_email', 'info@gardentvet.ac.rw', 'email', 'Contact', 'Main contact email'),
      ('contact_phone', '+250 788 123 456', 'phone', 'Contact', 'Main contact phone'),
      ('address', 'Kigali, Rwanda', 'text', 'Contact', 'School address'),
      ('facebook_url', 'https://facebook.com/gardentvet', 'url', 'Social', 'Facebook page'),
      ('twitter_url', 'https://twitter.com/gardentvet', 'url', 'Social', 'Twitter handle'),
      ('instagram_url', 'https://instagram.com/gardentvet', 'url', 'Social', 'Instagram profile')
    `);

    console.log('✅ System updates tables created successfully!');
    console.log('✅ Default components added');
    console.log('✅ Default settings added');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupSystemUpdates();
