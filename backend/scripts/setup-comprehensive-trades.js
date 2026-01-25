const mysql = require('mysql2/promise');
require('dotenv').config();

const tradesData = [
  {
    code: 'L4SOD',
    name: 'Level 4 Software Development',
    name_rw: 'Urwego rwa 4 mu Iterambere rya Software',
    description: 'Advanced software development program focusing on data structures, databases, and backend technologies',
    description_rw: 'Porogaramu y\'iterambere rya software yibanda ku miterere y\'amakuru, ububiko bw\'amakuru, n\'ikoranabuhanga rya backend',
    level: 'L4',
    duration_years: 2,
    courses: [
      { code: 'L4SOD-01', name: 'Data Structure and Algorithm', name_rw: 'Imiterere y\'Amakuru na Algorithm', credits: 6, hours: 120 },
      { code: 'L4SOD-02', name: 'Database Development', name_rw: 'Iterambere ry\'Ububiko bw\'Amakuru', credits: 6, hours: 120 },
      { code: 'L4SOD-03', name: 'Backend Design', name_rw: 'Igishushanyo cya Backend', credits: 5, hours: 100 },
      { code: 'L4SOD-04', name: 'Backend Application', name_rw: 'Porogaramu ya Backend', credits: 6, hours: 120 },
      { code: 'L4SOD-05', name: 'Window Server', name_rw: 'Seriveri ya Windows', credits: 5, hours: 100 },
      { code: 'L4SOD-06', name: 'PHP Programming', name_rw: 'Porogaramu ya PHP', credits: 6, hours: 120 },
      { code: 'L4SOD-07', name: 'Networking', name_rw: 'Umuyoboro', credits: 5, hours: 100 },
      { code: 'L4SOD-08', name: 'Computer Skills', name_rw: 'Ubumenyi bwa Mudasobwa', credits: 4, hours: 80 }
    ]
  },
  {
    code: 'L5BDC',
    name: 'Level 5 Building and Construction',
    name_rw: 'Urwego rwa 5 mu Kubaka',
    description: 'Advanced building and construction program covering site management, roofing, and architectural design',
    description_rw: 'Porogaramu y\'ubwubatsi yibanda ku micungire y\'urubuga, igisenge, n\'igishushanyo cy\'inyubako',
    level: 'L5',
    duration_years: 2,
    courses: [
      { code: 'L5BDC-01', name: 'Construction Site Management', name_rw: 'Imicungire y\'Urubuga rw\'Ubwubatsi', credits: 6, hours: 120 },
      { code: 'L5BDC-02', name: 'Ceiling Work', name_rw: 'Akazi k\'Igisenge', credits: 5, hours: 100 },
      { code: 'L5BDC-03', name: 'Scaffolding Operation', name_rw: 'Imikorere ya Scaffolding', credits: 5, hours: 100 },
      { code: 'L5BDC-04', name: 'Ornamental Finishing Work', name_rw: 'Akazi ko Kurangiza Imitako', credits: 5, hours: 100 },
      { code: 'L5BDC-05', name: 'Construct Roof Structure', name_rw: 'Kubaka Imiterere y\'Igisenge', credits: 6, hours: 120 },
      { code: 'L5BDC-06', name: 'ArchiCAD Software', name_rw: 'Software ya ArchiCAD', credits: 5, hours: 100 },
      { code: 'L5BDC-07', name: 'Acoustic and Thermal Insulation', name_rw: 'Gukumira Amajwi n\'Ubushyuhe', credits: 5, hours: 100 },
      { code: 'L5BDC-08', name: 'Basic Reinforced Concrete Design', name_rw: 'Igishushanyo cy\'ibanze cya Beto Yashyizweho Ibyuma', credits: 6, hours: 120 }
    ]
  },
  {
    code: 'L3SOD',
    name: 'Level 3 Software Development',
    name_rw: 'Urwego rwa 3 mu Iterambere rya Software',
    description: 'Foundation software development program covering web development, UI/UX design, and game development',
    description_rw: 'Porogaramu y\'ibanze y\'iterambere rya software yibanda ku iterambere rya website, igishushanyo cya UI/UX, n\'iterambere ry\'imikino',
    level: 'L3',
    duration_years: 2,
    courses: [
      { code: 'L3SOD-01', name: 'Apply JavaScript', name_rw: 'Gukoresha JavaScript', credits: 6, hours: 120 },
      { code: 'L3SOD-02', name: 'Design UI/UX', name_rw: 'Igishushanyo cya UI/UX', credits: 5, hours: 100 },
      { code: 'L3SOD-03', name: 'Computer Literacy', name_rw: 'Ubumenyi bwa Mudasobwa', credits: 4, hours: 80 },
      { code: 'L3SOD-04', name: 'Graphic Design', name_rw: 'Igishushanyo cy\'Amashusho', credits: 5, hours: 100 },
      { code: 'L3SOD-05', name: 'Develop Website', name_rw: 'Gukora Website', credits: 6, hours: 120 },
      { code: 'L3SOD-06', name: 'Conduct Version Control', name_rw: 'Gukora Version Control', credits: 4, hours: 80 },
      { code: 'L3SOD-07', name: 'Develop Game in Vue', name_rw: 'Gukora Umukino muri Vue', credits: 6, hours: 120 },
      { code: 'L3SOD-08', name: 'Analyse Project Requirement', name_rw: 'Gusesengura Ibisabwa n\'Umushinga', credits: 5, hours: 100 }
    ]
  },
  {
    code: 'L3BDC',
    name: 'Level 3 Building and Construction',
    name_rw: 'Urwego rwa 3 mu Kubaka',
    description: 'Foundation building and construction program covering essential construction skills and techniques',
    description_rw: 'Porogaramu y\'ibanze y\'ubwubatsi yibanda ku bumenyi bw\'ibanze bwo kubaka',
    level: 'L3',
    duration_years: 2,
    courses: [
      { code: 'L3BDC-01', name: 'Construct Stone', name_rw: 'Kubaka Amabuye', credits: 6, hours: 120 },
      { code: 'L3BDC-02', name: 'Opening Fixation', name_rw: 'Gushyiraho Ibyuho', credits: 5, hours: 100 },
      { code: 'L3BDC-03', name: 'Fundamental of Building Material', name_rw: 'Ibanze by\'Ibikoresho byo Kubaka', credits: 5, hours: 100 },
      { code: 'L3BDC-04', name: 'Drawing', name_rw: 'Igishushanyo', credits: 5, hours: 100 },
      { code: 'L3BDC-05', name: 'Soil Based Brick and Block', name_rw: 'Amatafari n\'Amabuye y\'Ubutaka', credits: 6, hours: 120 },
      { code: 'L3BDC-06', name: 'Setting Out', name_rw: 'Gushyiraho Imiterere', credits: 5, hours: 100 },
      { code: 'L3BDC-07', name: 'Cement Flooring', name_rw: 'Hasi ya Sima', credits: 5, hours: 100 },
      { code: 'L3BDC-08', name: 'Plumbing', name_rw: 'Gushyiraho Imiyoboro', credits: 6, hours: 120 },
      { code: 'L3BDC-09', name: 'Erect Bricks and Blocks', name_rw: 'Gushyiraho Amatafari n\'Amabuye', credits: 6, hours: 120 },
      { code: 'L3BDC-10', name: 'Basic Knowledge of Domestic Electricity', name_rw: 'Ubumenyi bw\'Ibanze bw\'Amashanyarazi yo mu Rugo', credits: 5, hours: 100 },
      { code: 'L3BDC-11', name: 'Plastering Structure', name_rw: 'Gusiga Imiterere', credits: 5, hours: 100 },
      { code: 'L3BDC-12', name: 'Kiswahili', name_rw: 'Igiswahili', credits: 4, hours: 80 }
    ]
  },
  {
    code: 'L4BDC',
    name: 'Level 4 Building and Construction',
    name_rw: 'Urwego rwa 4 mu Kubaka',
    description: 'Intermediate building and construction program focusing on concrete work, tiling, and technical drawing',
    description_rw: 'Porogaramu yo hagati y\'ubwubatsi yibanda ku kazi ka beto, amatafari, n\'igishushanyo cy\'ikoranabuhanga',
    level: 'L4',
    duration_years: 2,
    courses: [
      { code: 'L4BDC-01', name: 'Cement Base Block Pavers Work', name_rw: 'Akazi k\'Amabuye ya Sima', credits: 5, hours: 100 },
      { code: 'L4BDC-02', name: 'Quantify Construction Work', name_rw: 'Gupima Akazi k\'Ubwubatsi', credits: 5, hours: 100 },
      { code: 'L4BDC-03', name: 'Performing Tile Work', name_rw: 'Gukora Amatafari', credits: 5, hours: 100 },
      { code: 'L4BDC-04', name: 'Drawing', name_rw: 'Igishushanyo', credits: 5, hours: 100 },
      { code: 'L4BDC-05', name: 'Perform Concrete Work', name_rw: 'Gukora Akazi ka Beto', credits: 6, hours: 120 },
      { code: 'L4BDC-06', name: 'AutoCAD', name_rw: 'AutoCAD', credits: 5, hours: 100 },
      { code: 'L4BDC-07', name: 'Steel Bars', name_rw: 'Ibyuma', credits: 5, hours: 100 },
      { code: 'L4BDC-08', name: 'Welding', name_rw: 'Gusudira', credits: 5, hours: 100 },
      { code: 'L4BDC-09', name: 'Treezer', name_rw: 'Treezer', credits: 4, hours: 80 }
    ]
  },
  {
    code: 'L3AUTO',
    name: 'Level 3 Automotive Technology',
    name_rw: 'Urwego rwa 3 mu Ikoranabuhanga ry\'Ibinyabiziga',
    description: 'Foundation automotive program covering engine systems, electrical systems, and vehicle maintenance',
    description_rw: 'Porogaramu y\'ibanze y\'ibinyabiziga yibanda ku sisitemu ya moteri, sisitemu y\'amashanyarazi, n\'isana ry\'ibinyabiziga',
    level: 'L3',
    duration_years: 2,
    courses: [
      { code: 'L3AUTO-01', name: 'Cooling System', name_rw: 'Sisitemu yo Gukonjesha', credits: 5, hours: 100 },
      { code: 'L3AUTO-02', name: 'Lubrication System', name_rw: 'Sisitemu yo Gusiga Amavuta', credits: 5, hours: 100 },
      { code: 'L3AUTO-03', name: 'Electricity', name_rw: 'Amashanyarazi', credits: 5, hours: 100 },
      { code: 'L3AUTO-04', name: 'Super Charging', name_rw: 'Super Charging', credits: 5, hours: 100 },
      { code: 'L3AUTO-05', name: 'Bench Work', name_rw: 'Akazi ku Ntebe', credits: 4, hours: 80 },
      { code: 'L3AUTO-06', name: 'Engine Repair', name_rw: 'Gusana Moteri', credits: 6, hours: 120 },
      { code: 'L3AUTO-07', name: 'Welding', name_rw: 'Gusudira', credits: 5, hours: 100 },
      { code: 'L3AUTO-08', name: 'Fuel Supply System', name_rw: 'Sisitemu yo Gutanga Lisansi', credits: 5, hours: 100 },
      { code: 'L3AUTO-09', name: 'Exhaust', name_rw: 'Exhaust', credits: 4, hours: 80 },
      { code: 'L3AUTO-10', name: 'Technical Drawing', name_rw: 'Igishushanyo cy\'Ikoranabuhanga', credits: 5, hours: 100 },
      { code: 'L3AUTO-11', name: 'Wheel and Tyre', name_rw: 'Uruziga n\'Ipine', credits: 5, hours: 100 },
      { code: 'L3AUTO-12', name: 'Car Body', name_rw: 'Umubiri w\'Imodoka', credits: 5, hours: 100 }
    ]
  },
  {
    code: 'L5SOD',
    name: 'Level 5 Software Development',
    name_rw: 'Urwego rwa 5 mu Iterambere rya Software',
    description: 'Expert software development program covering advanced technologies like AI, blockchain, and mobile development',
    description_rw: 'Porogaramu y\'inzobere mu iterambere rya software yibanda ku ikoranabuhanga rigezweho nka AI, blockchain, n\'iterambere rya mobile',
    level: 'L5',
    duration_years: 2,
    courses: [
      { code: 'L5SOD-01', name: 'Python Programming', name_rw: 'Porogaramu ya Python', credits: 6, hours: 120 },
      { code: 'L5SOD-02', name: 'Apply Quality Assurance', name_rw: 'Gukoresha Ubwiza bw\'Ibikorwa', credits: 5, hours: 100 },
      { code: 'L5SOD-03', name: 'React JS', name_rw: 'React JS', credits: 6, hours: 120 },
      { code: 'L5SOD-04', name: 'Blockchain', name_rw: 'Blockchain', credits: 6, hours: 120 },
      { code: 'L5SOD-05', name: 'Machine Learning', name_rw: 'Kwiga kwa Mashini', credits: 6, hours: 120 },
      { code: 'L5SOD-06', name: 'Mobile Application', name_rw: 'Porogaramu ya Telefoni', credits: 6, hours: 120 },
      { code: 'L5SOD-07', name: 'Use ICT at Workplace', name_rw: 'Gukoresha ICT ku Kazi', credits: 4, hours: 80 },
      { code: 'L5SOD-08', name: 'Apply DevOps Techniques', name_rw: 'Gukoresha Tekinike za DevOps', credits: 5, hours: 100 },
      { code: 'L5SOD-09', name: 'Develop NoSQL Database', name_rw: 'Gukora Ububiko bwa NoSQL', credits: 5, hours: 100 },
      { code: 'L5SOD-10', name: 'Business Organisation', name_rw: 'Imitunganyirize y\'Ubucuruzi', credits: 4, hours: 80 }
    ]
  },
  {
    code: 'L4AUTO',
    name: 'Level 4 Automotive Technology',
    name_rw: 'Urwego rwa 4 mu Ikoranabuhanga ry\'Ibinyabiziga',
    description: 'Advanced automotive program focusing on diesel engines, transmission systems, and vehicle electronics',
    description_rw: 'Porogaramu y\'ibinyabiziga yibanda ku moteri za mazutu, sisitemu zo kohereza ingufu, n\'elektronike y\'ibinyabiziga',
    level: 'L4',
    duration_years: 2,
    courses: [
      { code: 'L4AUTO-01', name: 'Repair Diesel Engine', name_rw: 'Gusana Moteri ya Mazutu', credits: 6, hours: 120 },
      { code: 'L4AUTO-02', name: 'Vehicle Control System', name_rw: 'Sisitemu yo Kugenzura Imodoka', credits: 5, hours: 100 },
      { code: 'L4AUTO-03', name: 'Automotive Electricity', name_rw: 'Amashanyarazi y\'Ibinyabiziga', credits: 5, hours: 100 },
      { code: 'L4AUTO-04', name: 'Manual Transmission', name_rw: 'Transmission Ikora n\'Ukuboko', credits: 6, hours: 120 },
      { code: 'L4AUTO-05', name: 'Material', name_rw: 'Ibikoresho', credits: 4, hours: 80 },
      { code: 'L4AUTO-06', name: 'Air Condition System', name_rw: 'Sisitemu yo Gukonjesha Umwuka', credits: 5, hours: 100 },
      { code: 'L4AUTO-07', name: 'Engine Auxiliary System', name_rw: 'Sisitemu Ifasha Moteri', credits: 5, hours: 100 },
      { code: 'L4AUTO-08', name: 'Digital and Power Electronic', name_rw: 'Elektronike Digitale n\'Ingufu', credits: 5, hours: 100 },
      { code: 'L4AUTO-09', name: 'Overhaul Design', name_rw: 'Igishushanyo cyo Gusana Byuzuye', credits: 5, hours: 100 }
    ]
  },
  {
    code: 'L5AUTO',
    name: 'Level 5 Automotive Technology',
    name_rw: 'Urwego rwa 5 mu Ikoranabuhanga ry\'Ibinyabiziga',
    description: 'Expert automotive program covering hydraulic systems, diesel injection, and hybrid vehicle technology',
    description_rw: 'Porogaramu y\'inzobere mu binyabiziga yibanda ku sisitemu ya hydraulic, injection ya mazutu, n\'ikoranabuhanga ry\'ibinyabiziga hybrid',
    level: 'L5',
    duration_years: 2,
    courses: [
      { code: 'L5AUTO-01', name: 'Apply Hydraulic and Pneumatic System', name_rw: 'Gukoresha Sisitemu ya Hydraulic na Pneumatic', credits: 6, hours: 120 },
      { code: 'L5AUTO-02', name: 'Repair Diesel Injection System', name_rw: 'Gusana Sisitemu ya Injection ya Mazutu', credits: 6, hours: 120 },
      { code: 'L5AUTO-03', name: 'Auto Spare Parts Repair', name_rw: 'Gusana Ibice by\'Ibinyabiziga', credits: 5, hours: 100 },
      { code: 'L5AUTO-04', name: 'Business Organisation', name_rw: 'Imitunganyirize y\'Ubucuruzi', credits: 4, hours: 80 },
      { code: 'L5AUTO-05', name: 'Vehicle Electronic', name_rw: 'Elektronike y\'Ibinyabiziga', credits: 6, hours: 120 },
      { code: 'L5AUTO-06', name: 'Engine Auxiliary System', name_rw: 'Sisitemu Ifasha Moteri', credits: 5, hours: 100 },
      { code: 'L5AUTO-07', name: 'Automatic Gear Box', name_rw: 'Gear Box Ikora Yonyine', credits: 6, hours: 120 },
      { code: 'L5AUTO-08', name: 'Hybrid Vehicle', name_rw: 'Imodoka Hybrid', credits: 6, hours: 120 }
    ]
  }
];

async function setupComprehensiveTrades() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Connected to database');

    // Create trades table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_rw VARCHAR(255),
        description TEXT,
        description_rw TEXT,
        level VARCHAR(10),
        duration_years INT DEFAULT 2,
        total_students INT DEFAULT 0,
        total_instructors INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Trades table created');

    // Create trade_courses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trade_courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_id INT NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_rw VARCHAR(255),
        description TEXT,
        description_rw TEXT,
        level VARCHAR(10),
        credits INT DEFAULT 0,
        hours INT DEFAULT 0,
        semester INT DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Trade courses table created');

    // Create trade_instructors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trade_instructors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_rw VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        specialization VARCHAR(255),
        qualification VARCHAR(255),
        experience_years INT DEFAULT 0,
        photo_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Trade instructors table created');

    // Clear existing data
    await connection.query('DELETE FROM trade_courses');
    await connection.query('DELETE FROM trades');
    console.log('✅ Cleared existing data');

    // Insert trades and courses
    for (const trade of tradesData) {
      const [result] = await connection.query(
        `INSERT INTO trades (code, name, name_rw, description, description_rw, duration_years) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [trade.code, trade.name, trade.name_rw, trade.description, trade.description_rw, trade.duration_years]
      );

      const tradeId = result.insertId;
      console.log(`✅ Inserted trade: ${trade.name}`);

      // Insert courses for this trade
      for (const course of trade.courses) {
        await connection.query(
          `INSERT INTO trade_courses (trade_id, code, name, name_rw) 
           VALUES (?, ?, ?, ?)`,
          [tradeId, course.code, course.name, course.name_rw]
        );
      }
      console.log(`   ✅ Inserted ${trade.courses.length} courses for ${trade.name}`);
    }

    console.log('\n🎉 Successfully setup comprehensive trades system!');
    console.log(`📊 Total Trades: ${tradesData.length}`);
    console.log(`📚 Total Courses: ${tradesData.reduce((sum, t) => sum + t.courses.length, 0)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

setupComprehensiveTrades();
