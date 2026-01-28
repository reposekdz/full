const { pool } = require('./config/database');

async function fixRemainingTables() {
  try {
    console.log('Creating remaining tables...\n');
    
    // Create knowledge base categories first (parent table)
    console.log('Creating knowledge_base_categories table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS knowledge_base_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        parent_id INT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ knowledge_base_categories created\n');
    
    // Then create knowledge base articles
    console.log('Creating knowledge_base_articles table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS knowledge_base_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        author_id INT,
        featured_image VARCHAR(500),
        tags JSON,
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        views_count INT DEFAULT 0,
        helpful_count INT DEFAULT 0,
        not_helpful_count INT DEFAULT 0,
        search_keywords TEXT,
        meta_description TEXT,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES knowledge_base_categories(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_category (category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ knowledge_base_articles created\n');
    
    // Create forum categories first (parent table)
    console.log('Creating forum_categories table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS forum_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ forum_categories created\n');
    
    // Then create forum topics
    console.log('Creating forum_topics table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS forum_topics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        author_id INT NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_locked BOOLEAN DEFAULT FALSE,
        is_solved BOOLEAN DEFAULT FALSE,
        views_count INT DEFAULT 0,
        replies_count INT DEFAULT 0,
        last_reply_at TIMESTAMP NULL,
        last_reply_by INT,
        tags JSON,
        status ENUM('active', 'closed', 'archived') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
        INDEX idx_category (category_id),
        INDEX idx_author (author_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ forum_topics created\n');
    
    // Then create forum replies
    console.log('Creating forum_replies table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        topic_id INT NOT NULL,
        parent_id INT,
        content TEXT NOT NULL,
        author_id INT NOT NULL,
        is_solution BOOLEAN DEFAULT FALSE,
        upvotes INT DEFAULT 0,
        downvotes INT DEFAULT 0,
        is_edited BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE,
        INDEX idx_topic (topic_id),
        INDEX idx_author (author_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ forum_replies created\n');
    
    // Create admissions table
    console.log('Creating admissions table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_number VARCHAR(100) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM('male', 'female', 'other') NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        parent_phone VARCHAR(20),
        parent_email VARCHAR(255),
        address TEXT,
        previous_school VARCHAR(255),
        previous_grade VARCHAR(50),
        desired_trade VARCHAR(255) NOT NULL,
        desired_level VARCHAR(100),
        academic_year VARCHAR(50) NOT NULL,
        documents JSON,
        transcript_url VARCHAR(500),
        id_card_url VARCHAR(500),
        photo_url VARCHAR(500),
        application_status ENUM('submitted', 'under_review', 'approved', 'rejected', 'enrolled') DEFAULT 'submitted',
        payment_status ENUM('pending', 'partial', 'full') DEFAULT 'pending',
        interview_date DATETIME,
        interview_notes TEXT,
        rejection_reason TEXT,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_application_number (application_number),
        INDEX idx_status (application_status),
        INDEX idx_academic_year (academic_year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ admissions created\n');
    
    // Insert sample data
    console.log('Inserting sample data...\n');
    
    await pool.execute(`
      INSERT IGNORE INTO forum_categories (name, slug, description, display_order) VALUES
      ('General Discussion', 'general', 'General school-related discussions', 1),
      ('Academic Help', 'academic-help', 'Get help with your studies', 2),
      ('Technical Support', 'tech-support', 'Technical and IT support', 3),
      ('Announcements', 'announcements', 'Official school announcements', 4)
    `);
    console.log('✅ Forum categories inserted');
    
    await pool.execute(`
      INSERT IGNORE INTO knowledge_base_categories (name, slug, description, icon, display_order) VALUES
      ('Getting Started', 'getting-started', 'New student orientation', 'book-open', 1),
      ('Academic Policies', 'academic-policies', 'School academic policies and procedures', 'file-text', 2),
      ('Student Life', 'student-life', 'Student life and activities', 'users', 3),
      ('FAQs', 'faqs', 'Frequently asked questions', 'help-circle', 4)
    `);
    console.log('✅ Knowledge base categories inserted');
    
    await pool.execute(`
      INSERT IGNORE INTO cafeteria_menu (item_name, category, description, price, is_available) VALUES
      ('Breakfast Combo', 'breakfast', 'Eggs, bread, and tea', 1500.00, TRUE),
      ('Rice and Beans', 'lunch', 'Traditional Rwandan meal', 2000.00, TRUE),
      ('Chapati and Beef', 'lunch', 'Chapati with beef stew', 2500.00, TRUE),
      ('Fruit Juice', 'beverages', 'Fresh fruit juice', 500.00, TRUE),
      ('Samosa', 'snacks', 'Vegetable samosa', 300.00, TRUE)
    `);
    console.log('✅ Cafeteria menu items inserted\n');
    
    // Verify all tables
    console.log('Verifying all tables...\n');
    const tables = [
      'teams', 'players', 'matches', 'tournaments',
      'testimonials', 'exam_schedules',
      'cafeteria_menu', 'cafeteria_orders',
      'knowledge_base_categories', 'knowledge_base_articles',
      'forum_categories', 'forum_topics', 'forum_replies',
      'clubs', 'club_members',
      'certificates', 'alumni', 'admissions'
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    for (const table of tables) {
      try {
        const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table.padEnd(30)} - ${rows[0].count} rows`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${table.padEnd(30)} - ERROR`);
        failCount++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Database Setup Complete!`);
    console.log(`Tables created: ${successCount}/${tables.length}`);
    console.log(`Failed: ${failCount}`);
    console.log(`${'='.repeat(60)}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

fixRemainingTables();
