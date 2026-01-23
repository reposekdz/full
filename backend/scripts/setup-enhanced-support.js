const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupEnhancedSupport() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Support categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name_rw VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        description_rw TEXT,
        description_en TEXT,
        icon VARCHAR(100),
        color VARCHAR(50),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Support tickets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        category_id INT,
        user_id INT,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        user_phone VARCHAR(50),
        subject VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        assigned_to INT,
        attachments JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        FOREIGN KEY (category_id) REFERENCES support_categories(id)
      )
    `);

    // Support responses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_responses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ticket_id INT NOT NULL,
        responder_id INT,
        responder_name VARCHAR(255),
        response_text TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT false,
        attachments JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id)
      )
    `);

    // FAQ table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_faqs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT,
        question_rw TEXT NOT NULL,
        question_en TEXT NOT NULL,
        answer_rw TEXT NOT NULL,
        answer_en TEXT NOT NULL,
        views INT DEFAULT 0,
        helpful_count INT DEFAULT 0,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES support_categories(id)
      )
    `);

    // Knowledge base articles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT,
        title_rw VARCHAR(500) NOT NULL,
        title_en VARCHAR(500) NOT NULL,
        content_rw TEXT NOT NULL,
        content_en TEXT NOT NULL,
        author_id INT,
        author_name VARCHAR(255),
        views INT DEFAULT 0,
        helpful_count INT DEFAULT 0,
        tags JSON,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES support_categories(id)
      )
    `);

    // Insert default categories
    await connection.query(`
      INSERT INTO support_categories (name_rw, name_en, description_rw, description_en, icon, color, sort_order) VALUES
      ('Ibibazo bya Tekiniki', 'Technical Issues', 'Ibibazo bijyanye na sisitemu', 'System and technical problems', 'Settings', 'green', 1),
      ('Kwiyandikisha', 'Registration', 'Ibibazo byo kwiyandikisha', 'Registration related issues', 'UserPlus', 'yellow', 2),
      ('Amanota', 'Grades', 'Ibibazo ku manota', 'Grade related questions', 'Award', 'emerald', 3),
      ('Kwishyura', 'Payments', 'Ibibazo ryo kwishyura', 'Payment issues', 'CreditCard', 'lime', 4),
      ('Amakuru Rusange', 'General Info', 'Amakuru rusange', 'General information', 'Info', 'teal', 5),
      ('Ibindi', 'Other', 'Ibindi bibazo', 'Other issues', 'HelpCircle', 'cyan', 6)
    `);

    // Insert sample FAQs
    await connection.query(`
      INSERT INTO support_faqs (category_id, question_rw, question_en, answer_rw, answer_en, sort_order) VALUES
      (1, 'Nigute ninjira muri sisitemu?', 'How do I login to the system?', 'Koresha kode yawe nka SOD202611234 hamwe nijambo ryibanga. Niba wibagiye ijambo ryibanga, kanda "Wibagiye Ijambo ryibanga" kugirango urisubize.', 'Use your serial code like SOD202611234 with your password. If you forgot your password, click "Forgot Password" to reset it.', 1),
      (2, 'Nigute niyandikisha?', 'How do I register?', 'Saba kode yo kwiyandikisha kuri DOS cyangwa Admin. Uzahabwa kode idasanzwe nka SOD202611234. Koresha iyi kode kugirango wiyandikishe.', 'Request a registration code from DOS or Admin. You will receive a unique code like SOD202611234. Use this code to register.', 1),
      (3, 'Nigute nreba amanota yanjye?', 'How do I view my grades?', 'Injira muri dashboard yawe, kanda "Amanota" cyangwa "Grades". Uzabona amanota yawe yose hamwe na raporo.', 'Login to your dashboard, click "Grades" or "Amanota". You will see all your grades with reports.', 1),
      (4, 'Nigute nishyura amafaranga?', 'How do I make payments?', 'Jya ku rupapuro rwo kwishyura, hitamo uburyo bwo kwishyura (Mobile Money, Bank, Cash), uzuzemo amakuru akenewe.', 'Go to payments page, select payment method (Mobile Money, Bank, Cash), fill in required information.', 1)
    `);

    console.log('✅ Enhanced support system setup complete!');
    console.log('✅ Categories, tickets, FAQs, and knowledge base tables created');
    console.log('✅ Default categories and FAQs added');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupEnhancedSupport();
