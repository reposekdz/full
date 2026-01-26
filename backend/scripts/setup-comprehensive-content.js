const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupComprehensiveContent() {
  let connection;
  
  try {
    console.log('🚀 Starting Comprehensive Content Setup...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Connected to database\n');

    // Create courses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        duration VARCHAR(100),
        level VARCHAR(50),
        instructor VARCHAR(255),
        price DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT FALSE,
        \`order\` INT DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Courses table created');

    // Create gallery table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        category VARCHAR(100),
        photographer VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT FALSE,
        \`order\` INT DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Gallery table created');

    // Create events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        event_date DATETIME,
        location VARCHAR(255),
        organizer VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT FALSE,
        \`order\` INT DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Events table created');

    // Create testimonials table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        author VARCHAR(255),
        role VARCHAR(100),
        rating INT DEFAULT 5,
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT FALSE,
        \`order\` INT DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Testimonials table created');

    // Insert sample courses
    const [coursesCount] = await connection.query('SELECT COUNT(*) as count FROM courses');
    if (coursesCount[0].count === 0) {
      await connection.query(`
        INSERT INTO courses (title, description, duration, level, instructor, price, status, featured, \`order\`) VALUES
        ('Welding Technology', 'Amahugurwa yo gusudira - Learn professional welding techniques', '6 months', 'Beginner', 'Jean Claude', 150000, 'active', 1, 1),
        ('Electrical Installation', 'Amahugurwa yo gushyira amashanyarazi - Professional electrical training', '8 months', 'Intermediate', 'Marie Rose', 200000, 'active', 1, 2),
        ('Plumbing', 'Amahugurwa yo gushyira amazi - Complete plumbing course', '5 months', 'Beginner', 'Patrick', 120000, 'active', 0, 3),
        ('Carpentry', 'Amahugurwa yo kubaka - Woodworking and carpentry skills', '6 months', 'Beginner', 'Emmanuel', 130000, 'active', 0, 4),
        ('Masonry', 'Amahugurwa yo kubaka - Building and construction', '7 months', 'Intermediate', 'Joseph', 180000, 'active', 0, 5)
      `);
      console.log('✅ Sample courses inserted');
    }

    // Insert sample events
    const [eventsCount] = await connection.query('SELECT COUNT(*) as count FROM events');
    if (eventsCount[0].count === 0) {
      await connection.query(`
        INSERT INTO events (title, description, status) VALUES
        ('Graduation Ceremony 2024', 'Ibirori byo guhabwa impamyabumenyi - Annual graduation ceremony', 'active'),
        ('Sports Day', 'Umunsi wa siporo - Annual sports competition', 'active'),
        ('Parents Meeting', 'Inama y\\'ababyeyi - Quarterly parents meeting', 'active'),
        ('Skills Exhibition', 'Imurikagurisha ry\\'ubumenyi - Student skills showcase', 'active')
      `);
      console.log('✅ Sample events inserted');
    }

    // Insert sample testimonials
    const [testimonialsCount] = await connection.query('SELECT COUNT(*) as count FROM testimonials');
    if (testimonialsCount[0].count === 0) {
      await connection.query(`
        INSERT INTO testimonials (title, description, author, role, rating, status, featured, \`order\`) VALUES
        ('Best Training Ever', 'Amahugurwa meza cyane - This school changed my life completely', 'Jean Pierre', 'Graduate 2023', 5, 'active', 1, 1),
        ('Excellent Teachers', 'Abarimu beza - The instructors are very professional and helpful', 'Marie Claire', 'Current Student', 5, 'active', 1, 2),
        ('Great Facilities', 'Ibikoresho byiza - Modern equipment and good learning environment', 'Patrick Nkusi', 'Graduate 2022', 4, 'active', 0, 3),
        ('Highly Recommended', 'Ndabyemeza cyane - I recommend this school to everyone', 'Alice Uwase', 'Parent', 5, 'active', 1, 4)
      `);
      console.log('✅ Sample testimonials inserted');
    }

    console.log('\n✅ Comprehensive Content Setup Complete!\n');
    console.log('📊 Summary:');
    console.log('   - Courses table ready');
    console.log('   - Gallery table ready');
    console.log('   - Events table ready');
    console.log('   - Testimonials table ready');
    console.log('   - Sample data inserted\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupComprehensiveContent();
