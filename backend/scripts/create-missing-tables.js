const mysql = require('mysql2/promise');

async function createMissingTables() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management_system'
    });

    console.log('Connected to MySQL database');

    // Create slides table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS slides (
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
      )
    `);
    console.log('✅ Created slides table');

    // Create news_articles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS news_articles (
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
      )
    `);
    console.log('✅ Created news_articles table');

    // Create testimonials table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
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
      )
    `);
    console.log('✅ Created testimonials table');

    // Create school_stats table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS school_stats (
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
      )
    `);
    console.log('✅ Created school_stats table');

    // Create achievements table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        year VARCHAR(4),
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created achievements table');

    // Create home_content table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS home_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_key VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255),
        subtitle TEXT,
        content TEXT,
        additional_data JSON,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created home_content table');

    // Insert default data for slides
    await connection.execute(`
      INSERT IGNORE INTO slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES
      ('EMPOWERING FUTURE SKILLS', 'Building Tomorrow\\'s Professionals Today', 'Join thousands of students who have transformed their careers through our comprehensive technical programs.', 'https://images.unsplash.com/photo-1758270704524-596810e891b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2ODc2NTA2NXww&ixlib=rb-4.1.0&q=80&w=1080', 'Get Started', '/register', 1),
      ('SOFTWARE DEVELOPMENT', 'Master Coding & Technology', 'Master practical skills with our modern facilities and expert instructors in Software Development, Construction, and Automotive Technology.', 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc2ODcxODI3MXww&ixlib=rb-4.1.0&q=80&w=1080', 'Learn More', '/trades', 2),
      ('BUILDING CONSTRUCTION', 'Create Tomorrow\\'s Infrastructure', 'Learn construction techniques, project management, and safety protocols with modern tools and sustainable building practices.', 'https://images.unsplash.com/photo-1672072830247-85ac23671e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzY4NzMwNzQ0fDA', 'Explore', '/trades', 3),
      ('AUTOMOBILE TECHNOLOGY', 'Drive Your Future Forward', 'Comprehensive automotive training covering diagnostics, repair, and modern vehicle technologies including hybrid and electric systems.', 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW9iaWxlJTIwbWVjaGFuaWMlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3Njg4MDYyMTl8MA', 'Discover', '/trades', 4)
    `);
    console.log('✅ Inserted default slides data');

    // Insert default data for news articles
    await connection.execute(`
      INSERT IGNORE INTO news_articles (title, description, content, image_url, author, category, date_published, sort_order) VALUES
      ('Abanyeshuri bacu batsinze amahugurwa y\\'ubuhanga', 'Ikipe y\\'abanyeshuri muri Software Development yatsindiye igihembo cya mbere mu mahugurwa y\\'igihugu.', 'Ikipe y\\'abanyeshuri muri Software Development yatsindiye igihembo cya mbere mu mahugurwa y\\'igihugu. Ibi ni bimwe mu bintu byiza tutanga abanyeshuri bacu.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'Jean Mugisha', 'Ibihembo', '2026-01-15', 1),
      ('Ishuri ryacu ryitabiriye ibirori bya siporo', 'Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\\'ishuri ry\\'igihugu.', 'Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\\'ishuri ry\\'igihugu. Ni ishuri ryiza cyane.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', 'Sarah Uwase', 'Siporo', '2026-01-12', 2),
      ('Amashuri mashya azatangira mu kwezi gutaha', 'Kwiyandikisha kw\\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026.', 'Kwiyandikisha kw\\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026. Abanyeshuri bashya bagomba gutegura inyandiko zose.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800', 'Grace Ingabire', 'Amakuru', '2026-01-10', 3)
    `);
    console.log('✅ Inserted default news articles data');

    // Insert default data for testimonials
    await connection.execute(`
      INSERT IGNORE INTO testimonials (name, role, avatar, quote, rating, sort_order) VALUES
      ('Jean Claude Mugisha', 'Umunyeshuri - Software Development', 'JM', 'Ishuri ryacu ryampaye amahirwe menshi yo kwiga ubuhanga bw\\'ikoranabuhanga. Abarimu bacu barahebuje kandi bagashoboye.', 5, 1),
      ('Marie Uwase', 'Umubyeyi', 'MU', 'Umwana wanjye yarahindutse cyane kuva atangiye kwiga muri iri shuri. Amasomo ni meza kandi abanyeshuri bagenzurwa neza.', 5, 2),
      ('Patrick Nkurunziza', 'Warangije - Building Construction', 'PN', 'Nyuma yo kurangiza amashuri yanjye, nabonye akazi kahambaye mu kigo cy\\'ubwubatsi. Murakoze ishuri!', 5, 3)
    `);
    console.log('✅ Inserted default testimonials data');

    // Insert default data for school stats
    await connection.execute(`
      INSERT IGNORE INTO school_stats (stat_key, value, label, icon, color, sort_order) VALUES
      ('students', '1,248', 'Abanyeshuri', 'Users', 'from-blue-500 to-indigo-500', 1),
      ('teachers', '84', 'Abarimu', 'GraduationCap', 'from-green-500 to-teal-500', 2),
      ('employment', '95%', 'Gushirwa mu kazi', 'Briefcase', 'from-yellow-500 to-orange-500', 3),
      ('awards', '25+', 'Ibihembo', 'Trophy', 'from-orange-500 to-red-500', 4)
    `);
    console.log('✅ Inserted default school stats data');

    // Insert default data for achievements
    await connection.execute(`
      INSERT IGNORE INTO achievements (title, description, year, sort_order) VALUES
      ('Ishuri ry\\'Umwaka', 'Twatoranijwe nk\\'ishuri ry\\'umwaka mu mahugurwa y\\'ubuhanga', '2025', 1),
      ('Igihembo cya Mbere - Siporo', 'Abanyeshuri bacu batsinze igihembo cya mbere mu mikino y\\'ishuri', '2025', 2),
      ('Ubuhanga bw\\'Ikoranabuhanga', 'Ikipe yacu yatsinze amahugurwa y\\'igihugu y\\'ubuhanga bw\\'ikoranabuhanga', '2024', 3)
    `);
    console.log('✅ Inserted default achievements data');

    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Current tables in database:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔐 Database connection closed');
    }
  }
}

createMissingTables();