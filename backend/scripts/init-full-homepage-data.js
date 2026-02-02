const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management_system'
};

async function initializeHomepageData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Create tables if they don't exist
    await createTables(connection);
    
    // Insert sample data
    await insertSampleData(connection);
    
    console.log('✅ Homepage data initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing homepage data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function createTables(connection) {
  console.log('Creating tables...');

  // Create slides table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS slides (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      description TEXT,
      image_url VARCHAR(500),
      button_text VARCHAR(100),
      button_link VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create testimonials table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      avatar VARCHAR(10),
      quote TEXT NOT NULL,
      rating INT DEFAULT 5,
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create achievements table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INT PRIMARY KEY AUTO_INCREMENT,
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

  // Create events table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      title_rw VARCHAR(255),
      description TEXT,
      description_rw TEXT,
      event_date DATE NOT NULL,
      event_time TIME,
      location VARCHAR(255),
      event_type ENUM('academic', 'sports', 'cultural', 'social', 'other') DEFAULT 'other',
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      organizer VARCHAR(255),
      organizer_rw VARCHAR(255),
      contact_info VARCHAR(255),
      max_attendees INT,
      current_attendees INT DEFAULT 0,
      status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create home_features table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS home_features (
      id INT PRIMARY KEY AUTO_INCREMENT,
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

  // Create courses table if not exists
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(10) UNIQUE,
      description TEXT,
      duration_months INT DEFAULT 24,
      fee_amount DECIMAL(10,2),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tables created successfully');
}

async function insertSampleData(connection) {
  console.log('Inserting sample data...');

  // Clear existing data
  await connection.execute('DELETE FROM slides');
  await connection.execute('DELETE FROM testimonials');
  await connection.execute('DELETE FROM achievements');
  await connection.execute('DELETE FROM events');
  await connection.execute('DELETE FROM home_features');
  await connection.execute('DELETE FROM courses WHERE code IN ("SOD", "BDC", "AUT", "ELE", "WLD", "PLB")');

  // Insert hero slides
  const slides = [
    {
      title: 'Software Development Excellence',
      subtitle: 'Iterambere rya Porogaramu',
      description: 'Learn cutting-edge programming skills and build the future of technology',
      image_url: '/src/assets/image slides/SOD slides.png',
      button_text: 'Explore SOD',
      button_link: '/trade-sod',
      sort_order: 1
    },
    {
      title: 'Building Construction Mastery',
      subtitle: 'Ubwubatsi bw\'Inyubako',
      description: 'Master construction techniques and build Rwanda\'s infrastructure',
      image_url: '/src/assets/image slides/BDC slides.jpg',
      button_text: 'Explore BDC',
      button_link: '/trade-bdc',
      sort_order: 2
    },
    {
      title: 'Automotive Technology Innovation',
      subtitle: 'Ikoranabuhanga ry\'Imodoka',
      description: 'Become an expert in automotive technology and vehicle maintenance',
      image_url: '/src/assets/image slides/AUT slides.png',
      button_text: 'Explore AUT',
      button_link: '/trade-aut',
      sort_order: 3
    }
  ];

  for (const slide of slides) {
    await connection.execute(
      'INSERT INTO slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [slide.title, slide.subtitle, slide.description, slide.image_url, slide.button_text, slide.button_link, slide.sort_order]
    );
  }

  // Insert testimonials
  const testimonials = [
    {
      name: 'Jean Claude Mugisha',
      role: 'Umunyeshuri - Software Development',
      avatar: 'JM',
      quote: 'Ishuri ryacu ryampaye amahirwe menshi yo kwiga ubuhanga bw\'ikoranabuhanga. Abarimu bacu barahebuje kandi bagashoboye.',
      rating: 5,
      sort_order: 1
    },
    {
      name: 'Marie Uwase',
      role: 'Umubyeyi',
      avatar: 'MU',
      quote: 'Umwana wanjye yarahindutse cyane kuva atangiye kwiga muri iri shuri. Amasomo ni meza kandi abanyeshuri bagenzurwa neza.',
      rating: 5,
      sort_order: 2
    },
    {
      name: 'Patrick Nkurunziza',
      role: 'Warangije - Building Construction',
      avatar: 'PN',
      quote: 'Nyuma yo kurangiza amashuri yanjye, nabonye akazi kahambaye mu kigo cy\'ubwubatsi. Murakoze ishuri!',
      rating: 5,
      sort_order: 3
    },
    {
      name: 'Alice Mukandori',
      role: 'Umwarimu',
      avatar: 'AM',
      quote: 'Ni ishuri ryiza cyane rifite ibikoresho byiza by\'amashuri. Abanyeshuri bacu bagera kuri byinshi.',
      rating: 5,
      sort_order: 4
    },
    {
      name: 'Emmanuel Niyonzima',
      role: 'Warangije - Automobile Technology',
      avatar: 'EN',
      quote: 'Amahugurwa yo mu modoka yampaye ubuhanga bwiza. Ubu nkora mu kigo gikomeye cy\'imodoka.',
      rating: 5,
      sort_order: 5
    },
    {
      name: 'Grace Ingabire',
      role: 'Umubyeyi w\'Umunyeshuri',
      avatar: 'GI',
      quote: 'Ishuri ryacu rifite abarimu babizi cyane. Umwana wanjye yiga neza kandi afite ejo hazaza heza.',
      rating: 5,
      sort_order: 6
    }
  ];

  for (const testimonial of testimonials) {
    await connection.execute(
      'INSERT INTO testimonials (name, role, avatar, quote, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [testimonial.name, testimonial.role, testimonial.avatar, testimonial.quote, testimonial.rating, testimonial.sort_order]
    );
  }

  // Insert achievements
  const achievements = [
    {
      title: 'Ishuri ry\'Umwaka 2025',
      description: 'Twatoranijwe nk\'ishuri ry\'umwaka mu mahugurwa y\'ubuhanga',
      year: '2025',
      sort_order: 1
    },
    {
      title: 'Igihembo cya Mbere - Siporo',
      description: 'Abanyeshuri bacu batsinze igihembo cya mbere mu mikino y\'ishuri',
      year: '2025',
      sort_order: 2
    },
    {
      title: 'Ubuhanga bw\'Ikoranabuhanga',
      description: 'Ikipe yacu yatsinze amahugurwa y\'igihugu y\'ubuhanga bw\'ikoranabuhanga',
      year: '2024',
      sort_order: 3
    },
    {
      title: 'Ubufatanye Mpuzamahanga',
      description: 'Twashyizeho ubufatanye n\'amashuri menshi mu mahanga',
      year: '2024',
      sort_order: 4
    },
    {
      title: 'Excellence in TVET',
      description: 'Recognized as the leading TVET institution in the region',
      year: '2024',
      sort_order: 5
    },
    {
      title: 'Innovation Award',
      description: 'Won the national innovation award for technical education',
      year: '2023',
      sort_order: 6
    }
  ];

  for (const achievement of achievements) {
    await connection.execute(
      'INSERT INTO achievements (title, description, year, sort_order) VALUES (?, ?, ?, ?)',
      [achievement.title, achievement.description, achievement.year, achievement.sort_order]
    );
  }

  // Insert upcoming events
  const events = [
    {
      title: 'Parent-Teacher Meeting',
      title_rw: 'Inama y\'Ababyeyi n\'Abarimu',
      description: 'Monthly meeting between parents and teachers to discuss student progress',
      description_rw: 'Inama y\'ukwezi ihuza ababyeyi n\'abarimu kugira ngo baganire ku terambere ry\'abanyeshuri',
      event_date: '2026-01-25',
      event_time: '14:00:00',
      location: 'Main Hall',
      event_type: 'academic',
      priority: 'high',
      organizer: 'School Administration',
      organizer_rw: 'Abayobozi b\'Ishuri',
      contact_info: 'admin@gardentvet.rw',
      max_attendees: 200,
      sort_order: 1
    },
    {
      title: 'Mid-term Examinations',
      title_rw: 'Imirimo y\'Icyiciro cya Kabiri',
      description: 'Mid-term examinations for all classes and trades',
      description_rw: 'Imirimo y\'icyiciro cya kabiri ku mashuri yose n\'amahugurwa yose',
      event_date: '2026-01-28',
      event_time: '08:00:00',
      location: 'All Classrooms',
      event_type: 'academic',
      priority: 'high',
      organizer: 'Academic Department',
      organizer_rw: 'Ishami ry\'Amashuri',
      contact_info: 'academic@gardentvet.rw',
      sort_order: 2
    },
    {
      title: 'Basketball Championship Finals',
      title_rw: 'Impera z\'Igikombe cya Basketball',
      description: 'Regional basketball championship finals featuring our school team',
      description_rw: 'Impera z\'igikombe cya basketball cy\'akarere zirimo ikipe y\'ishuri ryacu',
      event_date: '2026-02-01',
      event_time: '14:00:00',
      location: 'Kibagabaga Stadium',
      event_type: 'sports',
      priority: 'medium',
      organizer: 'Sports Department',
      organizer_rw: 'Ishami ry\'Imikino',
      contact_info: 'sports@gardentvet.rw',
      max_attendees: 500,
      sort_order: 3
    },
    {
      title: 'Technical Skills Competition',
      title_rw: 'Amarushanwa y\'Ubuhanga',
      description: 'Inter-school technical skills competition across all trades',
      description_rw: 'Amarushanwa y\'ubuhanga hagati y\'amashuri mu mahugurwa yose',
      event_date: '2026-02-05',
      event_time: '09:00:00',
      location: 'School Workshops',
      event_type: 'academic',
      priority: 'high',
      organizer: 'Technical Department',
      organizer_rw: 'Ishami ry\'Ubuhanga',
      contact_info: 'technical@gardentvet.rw',
      max_attendees: 300,
      sort_order: 4
    },
    {
      title: 'Career Fair 2026',
      title_rw: 'Ibirori by\'Imyuga 2026',
      description: 'Annual career fair connecting students with potential employers',
      description_rw: 'Ibirori by\'umwaka by\'imyuga bihuza abanyeshuri n\'abakoresha',
      event_date: '2026-02-10',
      event_time: '10:00:00',
      location: 'School Grounds',
      event_type: 'social',
      priority: 'high',
      organizer: 'Career Services',
      organizer_rw: 'Serivisi z\'Imyuga',
      contact_info: 'careers@gardentvet.rw',
      max_attendees: 1000,
      sort_order: 5
    }
  ];

  for (const event of events) {
    await connection.execute(
      'INSERT INTO events (title, title_rw, description, description_rw, event_date, event_time, location, event_type, priority, organizer, organizer_rw, contact_info, max_attendees, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [event.title, event.title_rw, event.description, event.description_rw, event.event_date, event.event_time, event.location, event.event_type, event.priority, event.organizer, event.organizer_rw, event.contact_info, event.max_attendees, event.sort_order]
    );
  }

  // Insert home features
  const features = [
    {
      title: 'Experienced Teachers',
      title_rw: 'Abarimu Babizi',
      description: 'Our teachers have extensive experience and expertise in their fields',
      description_rw: 'Abarimu bacu bafite uburambe bwinshi n\'ubuhanga mu nzego zabo',
      icon: 'GraduationCap',
      color: 'from-blue-500 to-indigo-600',
      sort_order: 1
    },
    {
      title: 'Modern Facilities',
      title_rw: 'Ibikoresho By\'Igihe',
      description: 'State-of-the-art facilities and equipment for hands-on learning',
      description_rw: 'Ibikoresho bigezweho by\'igihe byo kwiga mu bikorwa',
      icon: 'Building',
      color: 'from-green-500 to-teal-500',
      sort_order: 2
    },
    {
      title: 'High Employment Rate',
      title_rw: 'Gushirwa mu Kazi Cyinshi',
      description: '95% of our graduates find employment within 6 months',
      description_rw: '95% y\'abanyeshuri bacu babona akazi mu mezi 6',
      icon: 'Briefcase',
      color: 'from-yellow-500 to-orange-500',
      sort_order: 3
    },
    {
      title: 'Award-Winning Institution',
      title_rw: 'Ishuri Ryatsindiye Ibihembo',
      description: '25+ trophies won in various competitions and recognitions',
      description_rw: 'Ibihembo 25+ byatsindwe mu marushanwa n\'icyubahiro',
      icon: 'Trophy',
      color: 'from-orange-500 to-red-500',
      sort_order: 4
    },
    {
      title: 'International Partnerships',
      title_rw: 'Ubufatanye Mpuzamahanga',
      description: 'Partnerships with international institutions for exchange programs',
      description_rw: 'Ubufatanye n\'amashuri mpuzamahanga mu gahunda z\'ubucuruzi',
      icon: 'Globe',
      color: 'from-pink-500 to-rose-500',
      sort_order: 5
    },
    {
      title: 'Comprehensive Programs',
      title_rw: 'Gahunda Zuzuye',
      description: 'Wide range of technical and vocational programs to choose from',
      description_rw: 'Gahunda nyinshi z\'ubuhanga n\'imyuga zo guhitamo',
      icon: 'Target',
      color: 'from-purple-500 to-indigo-500',
      sort_order: 6
    }
  ];

  for (const feature of features) {
    await connection.execute(
      'INSERT INTO home_features (title, title_rw, description, description_rw, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [feature.title, feature.title_rw, feature.description, feature.description_rw, feature.icon, feature.color, feature.sort_order]
    );
  }

  // Insert courses/trades
  const courses = [
    {
      name: 'Software Development',
      code: 'SOD',
      description: 'Learn modern programming languages, web development, mobile app development, and software engineering principles.',
      duration_months: 24,
      fee_amount: 450000.00
    },
    {
      name: 'Building Construction',
      code: 'BDC',
      description: 'Master construction techniques, architectural drawing, project management, and building safety standards.',
      duration_months: 24,
      fee_amount: 380000.00
    },
    {
      name: 'Automobile Technology',
      code: 'AUT',
      description: 'Comprehensive training in vehicle maintenance, engine repair, electrical systems, and automotive diagnostics.',
      duration_months: 24,
      fee_amount: 420000.00
    },
    {
      name: 'Electrical Installation',
      code: 'ELE',
      description: 'Learn electrical wiring, power systems, renewable energy, and electrical safety protocols.',
      duration_months: 18,
      fee_amount: 350000.00
    },
    {
      name: 'Welding and Fabrication',
      code: 'WLD',
      description: 'Master various welding techniques, metal fabrication, and industrial manufacturing processes.',
      duration_months: 18,
      fee_amount: 320000.00
    },
    {
      name: 'Plumbing',
      code: 'PLB',
      description: 'Comprehensive plumbing training including pipe installation, water systems, and sanitation.',
      duration_months: 12,
      fee_amount: 280000.00
    }
  ];

  for (const course of courses) {
    await connection.execute(
      'INSERT INTO courses (name, code, description, duration_months, fee_amount) VALUES (?, ?, ?, ?, ?)',
      [course.name, course.code, course.description, course.duration_months, course.fee_amount]
    );
  }

  console.log('✅ Sample data inserted successfully');
}

// Run the initialization
initializeHomepageData();