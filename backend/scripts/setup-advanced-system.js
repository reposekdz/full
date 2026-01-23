const mysql = require('mysql2/promise');

async function setupAdvancedSystem() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Creating support_tickets table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        user_id INT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        category ENUM('technical', 'academic', 'financial', 'general', 'complaint') DEFAULT 'general',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        assigned_to INT,
        attachments JSON,
        response TEXT,
        resolved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Creating contact_messages table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        category ENUM('inquiry', 'admission', 'partnership', 'feedback', 'other') DEFAULT 'inquiry',
        status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
        ip_address VARCHAR(50),
        user_agent TEXT,
        replied_at TIMESTAMP NULL,
        reply_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Creating search_logs table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS search_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        search_query VARCHAR(500) NOT NULL,
        search_type ENUM('global', 'students', 'teachers', 'courses', 'news', 'gallery') DEFAULT 'global',
        results_count INT DEFAULT 0,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_query (search_query(255)),
        INDEX idx_type (search_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Creating developer_team table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS developer_team (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        name_rw VARCHAR(255),
        role VARCHAR(255) NOT NULL,
        role_rw VARCHAR(255),
        description TEXT,
        description_rw TEXT,
        full_bio LONGTEXT,
        full_bio_rw LONGTEXT,
        image_url VARCHAR(500),
        email VARCHAR(255),
        phone VARCHAR(20),
        location VARCHAR(255),
        github_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        skills JSON,
        achievements JSON,
        projects JSON,
        education JSON,
        experience JSON,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sort (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Inserting developer team data...');
    await connection.query(`
      INSERT INTO developer_team (name, name_rw, role, role_rw, description, description_rw, sort_order) VALUES
      ('Niyonkuru Reponse', 'Niyonkuru Reponse', 'Team Owner & System Development Manager', 'Umuyobozi w\\'Itsinda & Umuyobozi w\\'Iterambere rya Sisitemu', 
       'Lead developer and project manager responsible for system architecture, database design, and overall project coordination. Specializes in full-stack development and team leadership.',
       'Umutungamirije w\\'iterambere n\\'umuyobozi w\\'umushinga ushinzwe imyubakire ya sisitemu, igishushanyo cya database, n\\'guhuza umushinga muri rusange. Inzobere mu iterambere rya full-stack n\\'ubuyobozi bw\\'itsinda.',
       1),
      ('Musoni Mugisha Yves', 'Musoni Mugisha Yves', 'Asset Tracker & Innovation Specialist', 'Umukurikirana w\\'Umutungo & Inzobere mu Guhanga Udushya',
       'Responsible for tracking project assets, implementing innovative solutions, and ensuring quality assurance. Expert in modern development tools and creative problem-solving.',
       'Ushinzwe gukurikirana umutungo w\\'umushinga, gushyira mu bikorwa ibisubizo bishya, no kwemeza ubuziranenge. Inzobere mu bikoresho bigezweho byo gutunganya no gukemura ibibazo mu buryo bw\\'ubuhanga.',
       2),
      ('Zamilu Yazid Surayman', 'Zamilu Yazid Surayman', 'Secretary & Data Gathering Specialist', 'Umunyamabanga & Inzobere mu Gukusanya Amakuru',
       'Manages project documentation, data collection, and information organization. Ensures all project data is properly recorded and accessible to the team.',
       'Ayobora inyandiko z\\'umushinga, gukusanya amakuru, no gutunganya amakuru. Yemeza ko amakuru yose y\\'umushinga yanditswe neza kandi abonetse n\\'itsinda.',
       3),
      ('Niyonsenga Frank', 'Niyonsenga Frank', 'Team Representative & Advisor', 'Uhagarariye Itsinda & Umujyanama',
       'Serves as team spokesperson and provides strategic guidance. Coordinates communication between team members and stakeholders, ensuring project alignment with goals.',
       'Akora nk\\'umuvugizi w\\'itsinda kandi atanga ubuyobozi bw\\'ingenzi. Ahuza itumanaho hagati y\\'abagize itsinda n\\'abafatanyabikorwa, yemeza ko umushinga uhuye n\\'intego.',
       4)
    `);

    console.log('✓ Advanced system setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupAdvancedSystem().catch(console.error);
