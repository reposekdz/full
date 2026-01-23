const db = require('../config/database');

async function initializeHomepageData() {
  console.log('🚀 Initializing homepage data...\n');

  try {
    // Create tables if they don't exist
    console.log('📋 Creating tables...');
    
    // Slides table
    await db.query(`
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

    // News articles table
    await db.query(`
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

    // Testimonials table
    await db.query(`
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

    // School stats table
    await db.query(`
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

    // Achievements table
    await db.query(`
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

    // Events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        title_rw VARCHAR(255),
        description TEXT,
        description_rw TEXT,
        event_date DATE NOT NULL,
        event_time TIME,
        location VARCHAR(200),
        event_type VARCHAR(50),
        priority VARCHAR(20),
        organizer VARCHAR(100),
        organizer_rw VARCHAR(100),
        contact_info VARCHAR(100),
        max_attendees INT,
        current_attendees INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'upcoming',
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Home features table
    await db.query(`
      CREATE TABLE IF NOT EXISTS home_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        title_rw VARCHAR(255),
        description TEXT,
        description_rw TEXT,
        icon VARCHAR(50),
        color VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables created successfully\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.query('DELETE FROM slides');
    await db.query('DELETE FROM news_articles');
    await db.query('DELETE FROM testimonials');
    await db.query('DELETE FROM school_stats');
    await db.query('DELETE FROM achievements');
    await db.query('DELETE FROM events');
    await db.query('DELETE FROM home_features');
    console.log('✅ Data cleared\n');

    // Insert slides
    console.log('📸 Inserting slides...');
    await db.query(`
      INSERT INTO slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES
      ('EMPOWERING FUTURE SKILLS', 'Building Tomorrow\\'s Professionals Today', 'Join thousands of students who have transformed their careers through our comprehensive technical programs.', 'https://images.unsplash.com/photo-1758270704524-596810e891b5?w=1080', 'Get Started', '/register', 1),
      ('SOFTWARE DEVELOPMENT', 'Master Coding & Technology', 'Master practical skills with our modern facilities and expert instructors in Software Development, Construction, and Automotive Technology.', 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=1080', 'Learn More', '/trades', 2),
      ('BUILDING CONSTRUCTION', 'Create Tomorrow\\'s Infrastructure', 'Learn construction techniques, project management, and safety protocols with modern tools and sustainable building practices.', 'https://images.unsplash.com/photo-1672072830247-85ac23671e96?w=1080', 'Explore', '/trades', 3),
      ('AUTOMOBILE TECHNOLOGY', 'Drive Your Future Forward', 'Comprehensive automotive training covering diagnostics, repair, and modern vehicle technologies including hybrid and electric systems.', 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1080', 'Discover', '/trades', 4)
    `);
    console.log('✅ Slides inserted\n');

    // Insert news articles
    console.log('📰 Inserting news articles...');
    await db.query(`
      INSERT INTO news_articles (title, description, content, image_url, author, category, date_published, sort_order) VALUES
      ('Abanyeshuri bacu batsinze amahugurwa y\\'ubuhanga', 'Ikipe y\\'abanyeshuri muri Software Development yatsindiye igihembo cya mbere mu mahugurwa y\\'igihugu.', 'Ikipe y\\'abanyeshuri muri Software Development yatsindiye igihembo cya mbere mu mahugurwa y\\'igihugu. Ibi ni bimwe mu bintu byiza tutanga abanyeshuri bacu.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'Jean Mugisha', 'Ibihembo', '2026-01-15', 1),
      ('Ishuri ryacu ryitabiriye ibirori bya siporo', 'Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\\'ishuri ry\\'igihugu.', 'Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\\'ishuri ry\\'igihugu. Ni ishuri ryiza cyane.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', 'Sarah Uwase', 'Siporo', '2026-01-12', 2),
      ('Amashuri mashya azatangira mu kwezi gutaha', 'Kwiyandikisha kw\\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026.', 'Kwiyandikisha kw\\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026. Abanyeshuri bashya bagomba gutegura inyandiko zose.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800', 'Grace Ingabire', 'Amakuru', '2026-01-10', 3),
      ('Ubufatanye bushya n\\'amasosiyete', 'Ishuri ryacu ryasinyeho amasezerano y\\'ubufatanye n\\'amasosiyete 5 mu bikorwa.', 'Ishuri ryacu ryasinyeho amasezerano y\\'ubufatanye n\\'amasosiyete 5 mu bikorwa. Ibi bizagira ingaruka nziza ku banyeshuri.', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800', 'Peter Karenzi', 'Ubufatanye', '2026-01-08', 4)
    `);
    console.log('✅ News articles inserted\n');

    // Insert testimonials
    console.log('💬 Inserting testimonials...');
    await db.query(`
      INSERT INTO testimonials (name, role, avatar, quote, rating, sort_order) VALUES
      ('Jean Claude Mugisha', 'Umunyeshuri - Software Development', 'JM', 'Ishuri ryacu ryampaye amahirwe menshi yo kwiga ubuhanga bw\\'ikoranabuhanga. Abarimu bacu barahebuje kandi bagashoboye.', 5, 1),
      ('Marie Uwase', 'Umubyeyi', 'MU', 'Umwana wanjye yarahindutse cyane kuva atangiye kwiga muri iri shuri. Amasomo ni meza kandi abanyeshuri bagenzurwa neza.', 5, 2),
      ('Patrick Nkurunziza', 'Warangije - Building Construction', 'PN', 'Nyuma yo kurangiza amashuri yanjye, nabonye akazi kahambaye mu kigo cy\\'ubwubatsi. Murakoze ishuri!', 5, 3),
      ('Alice Mukandori', 'Umwarimu', 'AM', 'Ni ishuri ryiza cyane rifite ibikoresho byiza by\\'amashuri. Abanyeshuri bacu bagera kuri byinshi.', 5, 4)
    `);
    console.log('✅ Testimonials inserted\n');

    // Insert school stats
    console.log('📊 Inserting school stats...');
    await db.query(`
      INSERT INTO school_stats (stat_key, value, label, icon, color, sort_order) VALUES
      ('students', '1,248', 'Abanyeshuri', 'Users', 'from-blue-500 to-indigo-500', 1),
      ('teachers', '84', 'Abarimu', 'GraduationCap', 'from-green-500 to-teal-500', 2),
      ('employment', '95%', 'Gushirwa mu kazi', 'Briefcase', 'from-yellow-500 to-orange-500', 3),
      ('awards', '25+', 'Ibihembo', 'Trophy', 'from-orange-500 to-red-500', 4)
    `);
    console.log('✅ School stats inserted\n');

    // Insert achievements
    console.log('🏆 Inserting achievements...');
    await db.query(`
      INSERT INTO achievements (title, description, year, sort_order) VALUES
      ('Ishuri ry\\'Umwaka', 'Twatoranijwe nk\\'ishuri ry\\'umwaka mu mahugurwa y\\'ubuhanga', '2025', 1),
      ('Igihembo cya Mbere - Siporo', 'Abanyeshuri bacu batsinze igihembo cya mbere mu mikino y\\'ishuri', '2025', 2),
      ('Ubuhanga bw\\'Ikoranabuhanga', 'Ikipe yacu yatsinze amahugurwa y\\'igihugu y\\'ubuhanga bw\\'ikoranabuhanga', '2024', 3),
      ('Ubufatanye Mpuzamahanga', 'Twashyizeho ubufatanye n\\'amashuri menshi mu mahanga', '2024', 4)
    `);
    console.log('✅ Achievements inserted\n');

    // Insert events
    console.log('📅 Inserting events...');
    await db.query(`
      INSERT INTO events (title, title_rw, description, description_rw, event_date, event_time, location, event_type, priority, organizer, organizer_rw, contact_info, max_attendees, status, sort_order) VALUES
      ('Parent-Teacher Meeting', 'Inama y\\'Ababyeyi n\\'Abarimu', 'Monthly meeting between parents and teachers', 'Inama y\\'ukwezi ihuza ababyeyi n\\'abarimu', '2026-01-25', '14:00:00', 'Main Hall', 'academic', 'high', 'School Administration', 'Abayobozi b\\'Ishuri', 'admin@school.rw', 200, 'upcoming', 1),
      ('Mid-term Exams', 'Imirimo y\\'Icyiciro cya Kabiri', 'Mid-term examinations for all classes', 'Imirimo y\\'icyiciro cya kabiri ku mashuri yose', '2026-01-28', '08:00:00', 'All Classrooms', 'academic', 'high', 'Academic Department', 'Ishami ry\\'Amashuri', 'academic@school.rw', NULL, 'upcoming', 2),
      ('Basketball Championship', 'Igikombe cya Basketball', 'Regional basketball championship finals', 'Impera z\\'igikombe cya basketball cy\\'akarere', '2026-02-01', '14:00:00', 'Kibagabaga Stadium', 'sports', 'medium', 'Sports Department', 'Ishami ry\\'Imikino', 'sports@school.rw', 500, 'upcoming', 3),
      ('Athletics Competition', 'Marushanwa y\\'Imikino Ngororamubiri', 'Inter-school athletics competition', 'Marushanwa y\\'imikino ngororamubiri hagati y\\'amashuri', '2026-02-05', '08:00:00', 'Nyamirambo Stadium', 'sports', 'medium', 'PE Department', 'Ishami ry\\'Imikino Ngororamubiri', 'pe@school.rw', 300, 'upcoming', 4)
    `);
    console.log('✅ Events inserted\n');

    // Insert home features
    console.log('⭐ Inserting home features...');
    await db.query(`
      INSERT INTO home_features (title, title_rw, description, description_rw, icon, color, sort_order) VALUES
      ('Experienced Teachers', 'Abarimu Babizi', 'Our teachers have extensive experience and expertise', 'Abarimu bacu bafite uburambe bwinshi n\\'ubuhanga', 'GraduationCap', 'from-blue-500 to-indigo-600', 1),
      ('Modern Facilities', 'Ibikoresho By\\'Igihe', 'State-of-the-art facilities and equipment', 'Ibikoresho bigezweho by\\'igihe', 'Building', 'from-green-500 to-teal-500', 2),
      ('High Employment Rate', 'Gushirwa mu Kazi Cyinshi', '95% of our graduates find employment', '95% y\\'abanyeshuri bacu babona akazi', 'Briefcase', 'from-yellow-500 to-orange-500', 3),
      ('Many Trophies', 'Ibihembo Byinshi', '25+ trophies won in various competitions', 'Ibihembo 25+ byatsindwe mu marushanwa', 'Trophy', 'from-orange-500 to-red-500', 4),
      ('International Partnerships', 'Ubufatanye Mpuzamahanga', 'Partnerships with international institutions', 'Ubufatanye n\\'amashuri mpuzamahanga', 'Globe', 'from-pink-500 to-rose-500', 5),
      ('Extracurricular Activities', 'Ibikorwa by\\'Inyongera', 'Sports, clubs, and other activities', 'Siporo, amakoperative n\\'ibindi bikorwa', 'Target', 'from-purple-500 to-indigo-500', 6)
    `);
    console.log('✅ Home features inserted\n');

    console.log('✅ Homepage data initialization completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - 4 Hero Slides');
    console.log('   - 4 News Articles');
    console.log('   - 4 Testimonials');
    console.log('   - 4 School Stats');
    console.log('   - 4 Achievements');
    console.log('   - 4 Events');
    console.log('   - 6 Home Features\n');

  } catch (error) {
    console.error('❌ Error initializing homepage data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeHomepageData()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = initializeHomepageData;
