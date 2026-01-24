const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupTrades() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DROP TABLE IF EXISTS trade_instructors');
    await connection.query('DROP TABLE IF EXISTS trade_students');
    await connection.query('DROP TABLE IF EXISTS trade_courses');
    await connection.query('DROP TABLE IF EXISTS trades');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Old tables dropped');

    await connection.query(`
      CREATE TABLE trades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        name_rw VARCHAR(200),
        description TEXT,
        description_rw TEXT,
        icon VARCHAR(10),
        image_url VARCHAR(500),
        duration_years INT,
        total_students INT DEFAULT 0,
        total_instructors INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE trade_instructors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        name_rw VARCHAR(100),
        role VARCHAR(100),
        role_rw VARCHAR(100),
        image_url VARCHAR(500),
        email VARCHAR(100),
        phone VARCHAR(20),
        specialization TEXT,
        specialization_rw TEXT,
        experience_years INT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE trade_courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_id INT NOT NULL,
        code VARCHAR(20) NOT NULL,
        name VARCHAR(200) NOT NULL,
        name_rw VARCHAR(200),
        description TEXT,
        description_rw TEXT,
        level INT,
        credits INT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE trade_students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        student_code VARCHAR(50),
        level INT,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tables created');

    await connection.query(`
      INSERT INTO trades (code, name, name_rw, description, description_rw, icon, image_url, duration_years, total_students, total_instructors) VALUES
      ('SOD', 'Software Development', 'Iterambere rya Porogaramu', 
       'Learn programming, web development, mobile apps, and software engineering. Become a professional software developer.',
       'Wiga gukora porogaramu, urubuga, aplikasiyo za terefone, na software engineering. Uba umukozi w\\'ubuhanga mu iterambere rya software.',
       '💻', '/uploads/trades/software-dev.jpg', 3, 45, 5),
       
      ('BDC', 'Building Construction', 'Kubaka Amazu', 
       'Master construction techniques, architecture, civil engineering, and project management. Build your future in construction.',
       'Wiga uburyo bwo kubaka, architecture, civil engineering, na project management. Ubake ejo hazaza hawe mu kubaka.',
       '🏗️', '/uploads/trades/building-construction.jpg', 3, 38, 4),
       
      ('AUT', 'Automobile Technology', 'Tekinolojiya y\\'Imodoka', 
       'Study automotive mechanics, electrical systems, diagnostics, and repair. Become an expert automotive technician.',
       'Wiga mekaniki y\\'imodoka, sisitemu z\\'amashanyarazi, diagnostics, na gusana. Uba inzobere mu tekinolojiya y\\'imodoka.',
       '🚗', '/uploads/trades/automobile-tech.jpg', 3, 42, 4)
    `);

    console.log('✅ Trades inserted');

    await connection.query(`
      INSERT INTO trade_instructors (trade_id, name, name_rw, role, role_rw, image_url, email, phone, specialization, specialization_rw, experience_years) VALUES
      (1, 'Mr. Kamanzi Eric', 'Bwana Kamanzi Eric', 'Head of Department', 'Umuyobozi w\\'Ishami', '/uploads/trades/instructor-sod-1.jpg', 'kamanzi@garden-tvet.rw', '+250 788 111 111', 'Full-Stack Development, Database Design', 'Iterambere rya Software, Gushushanya Database', 12),
      (1, 'Ms. Uwera Grace', 'Madamu Uwera Grace', 'Senior Instructor', 'Umwarimu Mukuru', '/uploads/trades/instructor-sod-2.jpg', 'uwera@garden-tvet.rw', '+250 788 222 222', 'Web Development, UI/UX Design', 'Iterambere rya Website, UI/UX Design', 8),
      
      (2, 'Eng. Mugabo Jean', 'Injeniyeri Mugabo Jean', 'Head of Department', 'Umuyobozi w\\'Ishami', '/uploads/trades/instructor-bdc-1.jpg', 'mugabo@garden-tvet.rw', '+250 788 333 333', 'Civil Engineering, Construction Management', 'Civil Engineering, Gucunga Imishinga yo Kubaka', 15),
      (2, 'Mr. Nkusi Patrick', 'Bwana Nkusi Patrick', 'Senior Instructor', 'Umwarimu Mukuru', '/uploads/trades/instructor-bdc-2.jpg', 'nkusi@garden-tvet.rw', '+250 788 444 444', 'Architecture, Building Design', 'Architecture, Gushushanya Amazu', 10),
      
      (3, 'Mr. Habimana Claude', 'Bwana Habimana Claude', 'Head of Department', 'Umuyobozi w\\'Ishami', '/uploads/trades/instructor-aut-1.jpg', 'habimana@garden-tvet.rw', '+250 788 555 555', 'Automotive Mechanics, Engine Diagnostics', 'Mekaniki y\\'Imodoka, Diagnostics ya Moteri', 14),
      (3, 'Mr. Kalisa David', 'Bwana Kalisa David', 'Senior Instructor', 'Umwarimu Mukuru', '/uploads/trades/instructor-aut-2.jpg', 'kalisa@garden-tvet.rw', '+250 788 666 666', 'Electrical Systems, Auto Electronics', 'Sisitemu z\\'Amashanyarazi, Electronics y\\'Imodoka', 9)
    `);

    console.log('✅ Instructors inserted');

    await connection.query(`
      INSERT INTO trade_courses (trade_id, code, name, name_rw, description_rw, level, credits) VALUES
      (1, 'SOD101', 'Programming Fundamentals', 'Ibanze rya Porogaramu', 'Wiga ibanze rya programming: variables, loops, functions', 1, 6),
      (1, 'SOD201', 'Web Development', 'Iterambere rya Website', 'Wiga HTML, CSS, JavaScript, React', 2, 8),
      (1, 'SOD301', 'Database Management', 'Gucunga Database', 'Wiga MySQL, MongoDB, Database Design', 3, 6),
      (1, 'SOD401', 'Mobile App Development', 'Iterambere rya Aplikasiyo', 'Wiga React Native, Flutter', 4, 8),
      
      (2, 'BDC101', 'Construction Basics', 'Ibanze ryo Kubaka', 'Wiga ibanze ryo kubaka: materials, tools, safety', 1, 6),
      (2, 'BDC201', 'Building Design', 'Gushushanya Amazu', 'Wiga architecture, design principles', 2, 8),
      (2, 'BDC301', 'Civil Engineering', 'Civil Engineering', 'Wiga structural engineering, foundations', 3, 8),
      (2, 'BDC401', 'Project Management', 'Gucunga Imishinga', 'Wiga project planning, budgeting, supervision', 4, 6),
      
      (3, 'AUT101', 'Automotive Basics', 'Ibanze rya Mekaniki', 'Wiga ibanze rya mekaniki: engine parts, tools', 1, 6),
      (3, 'AUT201', 'Engine Systems', 'Sisitemu za Moteri', 'Wiga engine operation, maintenance, repair', 2, 8),
      (3, 'AUT301', 'Electrical Systems', 'Sisitemu z\\'Amashanyarazi', 'Wiga electrical circuits, diagnostics', 3, 8),
      (3, 'AUT401', 'Advanced Diagnostics', 'Diagnostics Zidasanzwe', 'Wiga computer diagnostics, troubleshooting', 4, 6)
    `);

    console.log('✅ Courses inserted');
    console.log('\n🎉 Trades system setup completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupTrades();
