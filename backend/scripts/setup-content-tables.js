const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupContentTables() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // 1. Slides Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS slides (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        subtitle VARCHAR(200),
        description TEXT,
        image_url VARCHAR(500),
        button_text VARCHAR(100),
        button_link VARCHAR(500),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. News Articles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        content LONGTEXT,
        image_url VARCHAR(500),
        author VARCHAR(100),
        category VARCHAR(50),
        date_published DATE,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Testimonials Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        content TEXT NOT NULL,
        image_url VARCHAR(500),
        rating INT DEFAULT 5,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 4. School Stats Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS school_stats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        label VARCHAR(100) NOT NULL,
        value VARCHAR(50) NOT NULL,
        icon VARCHAR(50),
        description TEXT,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 5. Achievements Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        date_achieved DATE,
        image_url VARCHAR(500),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All content tables created successfully');

    // Insert sample data
    await connection.query(`
      INSERT INTO slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES
      ('Murakaza Neza kuri Garden TVET', 'Ishuri Rikomeye ryUbumenyi Bukoreshwa', 'Twiga ubumenyi bukomeye mu myuga itandukanye', '/images/slide1.jpg', 'Menya Byinshi', '/about', 1),
      ('Ubumenyi Bukomeye', 'Twiga Tekinoloji Zigezweho', 'Dufite abarimu bafite ubumenyi bukomeye', '/images/slide2.jpg', 'Reba Amashami', '/courses', 2),
      ('Ejo Hazaza Heza', 'Tegura Umwuga Wawe', 'Twiga kandi ukore akazi', '/images/slide3.jpg', 'Iyandikishe', '/register', 3)
    `);

    await connection.query(`
      INSERT INTO school_stats (label, value, icon, description, sort_order) VALUES
      ('Abanyeshuri', '500+', 'users', 'Abanyeshuri biga muri Garden TVET', 1),
      ('Abarimu', '50+', 'award', 'Abarimu bafite ubumenyi bukomeye', 2),
      ('Amashami', '6', 'book', 'Amashami atandukanye yubumenyi', 3),
      ('Intsinzi', '95%', 'trophy', 'Abanyeshuri barangije neza', 4)
    `);

    await connection.query(`
      INSERT INTO testimonials (name, role, content, rating) VALUES
      ('Jean MUGABO', 'Umunyeshuri wa Software Development', 'Garden TVET School yampaye ubumenyi bukomeye. Ubu nkora neza cyane!', 5),
      ('Marie UWASE', 'Umunyeshuri wa Electrical Installation', 'Abarimu bafite ubumenyi bukomeye kandi batwigisha neza.', 5),
      ('Pierre NKURUNZIZA', 'Umunyeshuri wa Plumbing', 'Nashimye kwiga muri iyi shuri. Ubumenyi bwiza cyane!', 5)
    `);

    console.log('✅ Sample data inserted');

    console.log('\n🎉 Content tables setup completed successfully!');
    console.log('\n📊 Tables created:');
    console.log('   1. slides - Homepage slides');
    console.log('   2. news_articles - News and articles');
    console.log('   3. testimonials - Student testimonials');
    console.log('   4. school_stats - School statistics');
    console.log('   5. achievements - School achievements');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupContentTables();
