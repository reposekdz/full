const mysql = require('mysql2/promise');

async function setupLeadership() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Creating school_leadership table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS school_leadership (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        bio TEXT,
        image_url VARCHAR(500),
        email VARCHAR(255),
        phone VARCHAR(20),
        office_location VARCHAR(255),
        responsibilities JSON,
        qualifications JSON,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sort (sort_order),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Inserting leadership data...');
    await connection.query(`
      INSERT INTO school_leadership (name, role, department, bio, sort_order, responsibilities, qualifications) VALUES
      ('Dr. Mugisha Jean Claude', 'Umuyobozi Mukuru w\\'Ishuri', 'Ubuyobozi Bukuru', 
       'Umuyobozi mukuru w\\'ishuri afite uburambe bw\\'imyaka 15 mu buyobozi bw\\'amashuri. Yize kugeza kuri Doctorate mu buyobozi bw\\'uburezi kandi afite ubushobozi bukomeye mu guteza imbere amashuri.',
       1,
       '["Kuyobora ishuri muri rusange", "Gushyira mu bikorwa politiki z\\'ishuri", "Guhuza abakozi bose", "Gufatanya n\\'abafatanyabikorwa"]',
       '["PhD mu Buyobozi bw\\'Uburezi", "Master\\'s mu Pedagogy", "Bachelor\\'s mu Education Management"]'),
      
      ('Mukamana Grace', 'Umuyobozi w\\'Amasomo (DOS)', 'Amasomo', 
       'Umuyobozi w\\'amasomo ushinzwe gukurikirana amasomo yose y\\'ishuri, gushyiraho amategeko y\\'amasomo, no gufasha abarimu mu kazi kabo. Afite uburambe bw\\'imyaka 12 mu buyobozi bw\\'amasomo.',
       2,
       '["Gukurikirana amasomo yose", "Gukora amategeko y\\'amasomo", "Gufasha abarimu", "Gukurikirana iterambere ry\\'abanyeshuri"]',
       '["Master\\'s mu Curriculum Development", "Bachelor\\'s mu Education", "Certificate mu School Management"]'),
      
      ('Nkusi Patrick', 'Umuyobozi w\\'Imyigire (DOD)', 'Imyigire', 
       'Umuyobozi w\\'imyigire ushinzwe gukurikirana imyigire y\\'abanyeshuri mu by\\'umukoro, gufasha abanyeshuri kubona amahugurwa, no guhuza n\\'ibigo bitanga akazi.',
       3,
       '["Gukurikirana imyigire y\\'abanyeshuri", "Gufasha abanyeshuri kubona amahugurwa", "Guhuza n\\'ibigo bitanga akazi", "Gukora raporo z\\'imyigire"]',
       '["Master\\'s mu Technical Education", "Bachelor\\'s mu Engineering", "Certificate mu Vocational Training"]'),
      
      ('Uwase Marie', 'Umuyobozi w\\'Amafaranga', 'Amafaranga', 
       'Umuyobozi w\\'amafaranga ushinzwe gucunga amafaranga y\\'ishuri, gukora ingengo y\\'imari, no kwishyura abakozi. Afite uburambe bw\\'imyaka 10 mu bucuruzi n\\'ibaruramari.',
       4,
       '["Gucunga amafaranga y\\'ishuri", "Gukora ingengo y\\'imari", "Kwishyura abakozi", "Gukora raporo z\\'amafaranga"]',
       '["Master\\'s mu Accounting", "Bachelor\\'s mu Finance", "CPA Certification"]'),
      
      ('Habimana Joseph', 'Umuyobozi w\\'Abanyeshuri', 'Imyifatire y\\'Abanyeshuri', 
       'Umuyobozi w\\'abanyeshuri ushinzwe gukurikirana imyifatire y\\'abanyeshuri, gukemura ibibazo byabo, no kubafasha mu buzima bwabo bwa buri munsi.',
       5,
       '["Gukurikirana imyifatire y\\'abanyeshuri", "Gukemura ibibazo by\\'abanyeshuri", "Gufasha abanyeshuri", "Gukora ibikorwa by\\'abanyeshuri"]',
       '["Master\\'s mu Student Affairs", "Bachelor\\'s mu Psychology", "Certificate mu Counseling"]'),
      
      ('Uwera Christine', 'Umuyobozi w\\'Ubuzima', 'Ubuzima', 
       'Umuyobozi w\\'ubuzima ushinzwe gukurikirana ubuzima bw\\'abanyeshuri n\\'abakozi, gutanga ubufasha bw\\'ubuzima, no gufasha mu bibazo by\\'ubuzima.',
       6,
       '["Gukurikirana ubuzima bw\\'abanyeshuri", "Gutanga ubufasha bw\\'ubuzima", "Gufasha mu bibazo by\\'ubuzima", "Gukora raporo z\\'ubuzima"]',
       '["Bachelor\\'s mu Nursing", "Diploma mu Public Health", "Certificate mu First Aid"]'),
      
      ('Kalisa Emmanuel', 'Umuyobozi w\\'Ikoranabuhanga', 'IT & Ikoranabuhanga', 
       'Umuyobozi w\\'ikoranabuhanga ushinzwe gukurikirana sisitemu z\\'ishuri, gufasha abakozi mu bibazo bya tekinoloji, no guteza imbere ikoranabuhanga mu ishuri.',
       7,
       '["Gukurikirana sisitemu z\\'ishuri", "Gufasha mu bibazo bya tekinoloji", "Guteza imbere ikoranabuhanga", "Gukora raporo za IT"]',
       '["Bachelor\\'s mu Computer Science", "Certificate mu Network Administration", "Certificate mu Cybersecurity"]'),
      
      ('Nyiramana Alice', 'Umuyobozi w\\'Ububiko', 'Ububiko n\\'Ibikoresho', 
       'Umuyobozi w\\'ububiko ushinzwe gucunga ibikoresho by\\'ishuri, gukora raporo z\\'ibikoresho, no kwemeza ko ibikoresho bikoreshwa neza.',
       8,
       '["Gucunga ibikoresho by\\'ishuri", "Gukora raporo z\\'ibikoresho", "Kwemeza ko ibikoresho bikoreshwa neza", "Gukora inventory"]',
       '["Bachelor\\'s mu Business Administration", "Diploma mu Supply Chain Management", "Certificate mu Inventory Management"]')
    `);

    console.log('✓ Leadership setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupLeadership().catch(console.error);
