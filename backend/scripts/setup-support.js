const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupSupport() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DROP TABLE IF EXISTS support_tickets');
    await connection.query('DROP TABLE IF EXISTS support_faqs');
    await connection.query('DROP TABLE IF EXISTS support_categories');
    await connection.query('DROP TABLE IF EXISTS support_resources');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Old tables dropped');

    await connection.query(`
      CREATE TABLE support_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        name_rw VARCHAR(100),
        description TEXT,
        description_rw TEXT,
        icon VARCHAR(50),
        color VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE support_faqs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT NOT NULL,
        question TEXT NOT NULL,
        question_rw TEXT,
        answer TEXT NOT NULL,
        answer_rw TEXT,
        views INT DEFAULT 0,
        helpful_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES support_categories(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE support_tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        category_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        assigned_to VARCHAR(100),
        response TEXT,
        resolved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES support_categories(id)
      )
    `);

    await connection.query(`
      CREATE TABLE support_resources (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        title_rw VARCHAR(200),
        description TEXT,
        description_rw TEXT,
        resource_type ENUM('guide', 'video', 'document', 'link') NOT NULL,
        resource_url VARCHAR(500),
        file_url VARCHAR(500),
        downloads INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES support_categories(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tables created');

    await connection.query(`
      INSERT INTO support_categories (name, name_rw, description, description_rw, icon, color, sort_order) VALUES
      ('Technical Support', 'Ubufasha bwa Tekiniki', 'Get help with technical issues, system errors, and troubleshooting', 'Ubufasha mu bibazo bya tekiniki, amakosa ya sisitemu, no gukemura ibibazo', 'Settings', 'yellow', 1),
      ('Academic Support', 'Ubufasha bw\\'Amasomo', 'Questions about courses, grades, assignments, and academic matters', 'Ibibazo ku masomo, amanota, ibikorwa, n\\'ibijyanye n\\'amasomo', 'BookOpen', 'green', 2),
      ('Financial Support', 'Ubufasha bw\\'Amafaranga', 'Help with fees, payments, scholarships, and financial aid', 'Ubufasha ku mafaranga y\\'ishuri, kwishyura, buruse, n\\'ubufasha bw\\'amafaranga', 'DollarSign', 'yellow', 3),
      ('Account Issues', 'Ibibazo by\\'Konti', 'Login problems, password reset, account access issues', 'Ibibazo byo kwinjira, gusubiza ijambo ry\\'ibanga, ibibazo byo kwinjira muri konti', 'User', 'green', 4),
      ('General Inquiry', 'Ibibazo Rusange', 'General questions and information requests', 'Ibibazo rusange n\\'ibisabwa by\\'amakuru', 'MessageCircle', 'yellow', 5)
    `);

    console.log('✅ Categories inserted');

    await connection.query(`
      INSERT INTO support_faqs (category_id, question, question_rw, answer, answer_rw, views, helpful_count, sort_order) VALUES
      (1, 'How do I reset my password?', 'Nsubiza nte ijambo ryanjye ryibanga?', 'Click on "Forgot Password" on the login page, enter your email, and follow the instructions sent to your email.', 'Kanda kuri "Wibagiwe Ijambo ryibanga" ku rupapuro rwo kwinjira, wandike imeri yawe, ukurikize amabwiriza yoherejwe kuri imeri yawe.', 150, 45, 1),
      (1, 'Why can\\'t I access my dashboard?', 'Kuki ntashobora kugera kuri dashboard yanjye?', 'Make sure you are using the correct login credentials. Clear your browser cache and try again. If the problem persists, contact support.', 'Emeza ko ukoresha amazina yo kwinjira akwiye. Siba cache ya browser yawe ugerageze. Niba ikibazo gikomeje, vugana n\\'ubufasha.', 120, 38, 2),
      (2, 'How do I check my grades?', 'Nreba nte amanota yanjye?', 'Login to your student dashboard, navigate to "Academics" section, and click on "My Grades" to view all your grades.', 'Injira muri dashboard yawe y\\'umunyeshuri, jya ku gice cya "Amasomo", kanda kuri "Amanota yanjye" urebe amanota yawe yose.', 200, 60, 1),
      (2, 'Where can I find my class schedule?', 'Nshobora kubona he gahunda y\\'amasomo yanjye?', 'Your class schedule is available in the "Academics" section under "My Schedule" or "Timetable".', 'Gahunda y\\'amasomo yawe iraboneka mu gice cya "Amasomo" munsi ya "Gahunda yanjye" cyangwa "Timetable".', 180, 55, 2),
      (3, 'How do I pay my school fees?', 'Nishyura nte amafaranga y\\'ishuri?', 'You can pay through Mobile Money, Bank Transfer, or at the school accountant office. Payment details are in your dashboard.', 'Urashobora kwishyura ukoresheje Mobile Money, Bank Transfer, cyangwa ku biro by\\'umubare w\\'ishuri. Amakuru yo kwishyura ari muri dashboard yawe.', 250, 75, 1),
      (3, 'Can I get a scholarship?', 'Nshobora kubona buruse?', 'Yes, scholarships are available based on academic performance and financial need. Contact the DOS office for more information.', 'Yego, buruse zirahari zishingiye ku myigire n\\'ibikenewe by\\'amafaranga. Vugana na biro ya DOS kugira ngo ubone amakuru yimbitse.', 100, 30, 2),
      (4, 'I forgot my student code, what should I do?', 'Nwibagiwe kode yanjye y\\'umunyeshuri, nkore iki?', 'Contact your class teacher or visit the DOS office with your ID to retrieve your student code.', 'Vugana n\\'umwarimu w\\'ishuri cyangwa sura biro ya DOS ufite indangamuntu yawe kugira ngo ubone kode yawe y\\'umunyeshuri.', 90, 25, 1),
      (5, 'What are the school operating hours?', 'Ni izihe masaha ishuri rikora?', 'School operates Monday to Friday, 7:00 AM to 5:00 PM. Office hours are 8:00 AM to 4:00 PM.', 'Ishuri rikora Kuwa mbere kugeza Kuwa gatanu, saa 1 z\\'igitondo kugeza saa 11 z\\'umugoroba. Amasaha ya biro ni saa 2 z\\'igitondo kugeza saa 10 z\\'umugoroba.', 80, 20, 1)
    `);

    console.log('✅ FAQs inserted');

    await connection.query(`
      INSERT INTO support_resources (category_id, title, title_rw, description, description_rw, resource_type, resource_url, downloads) VALUES
      (1, 'Student Portal User Guide', 'Umuyobozi wo Gukoresha Portal y\\'Abanyeshuri', 'Complete guide on how to use the student portal', 'Umuyobozi wuzuye ku buryo bwo gukoresha portal y\\'abanyeshuri', 'guide', '/resources/student-portal-guide.pdf', 150),
      (2, 'Academic Calendar 2024-2026', 'Kalendari y\\'Amasomo 2024-2026', 'Full academic calendar with important dates', 'Kalendari yuzuye y\\'amasomo hamwe n\\'italiki z\\'ingenzi', 'document', '/resources/academic-calendar.pdf', 200),
      (3, 'Fee Payment Instructions', 'Amabwiriza yo Kwishyura Amafaranga', 'Step by step guide for paying school fees', 'Umuyobozi w\\'intambwe ku ntambwe yo kwishyura amafaranga y\\'ishuri', 'guide', '/resources/fee-payment-guide.pdf', 180),
      (1, 'How to Reset Password Video', 'Video yo Gusubiza Ijambo ryibanga', 'Video tutorial on resetting your password', 'Inyigisho ya video ku gusubiza ijambo ryibanga', 'video', 'https://youtube.com/watch?v=example', 120)
    `);

    console.log('✅ Resources inserted');
    console.log('\n🎉 Support system setup completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupSupport();
