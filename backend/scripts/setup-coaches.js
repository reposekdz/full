const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupCoaches() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Create coaches table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_coaches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        sport VARCHAR(100) NOT NULL,
        title VARCHAR(255),
        bio_rw TEXT,
        bio_en TEXT,
        experience_years INT,
        qualifications JSON,
        achievements JSON,
        specializations JSON,
        image_url VARCHAR(500),
        email VARCHAR(255),
        phone VARCHAR(50),
        office_location VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert Jotham's profile
    await connection.query(`
      INSERT INTO sports_coaches (name, sport, title, bio_rw, bio_en, experience_years, qualifications, achievements, specializations, image_url, email, phone, office_location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Jotham Niyonzima',
      'Football',
      'Umutoza Mukuru wa Siporo - Garden TVET School',
      'Jotham Niyonzima ni umutoza w\'ubuziranenge mu siporo ya umupira w\'amaguru, afite uburambe bw\'imyaka irenga 15 mu gutoza amakipe y\'abanyeshuri. Yize kaminuza muri Sports Science and Coaching, kandi afite impamyabumenyi nyinshi zo mu rwego mpuzamahanga. Yatangiye umwuga we nk\'umukinnyi w\'umupira w\'amaguru mu makipe akomeye y\'u Rwanda, hanyuma yimukiye mu gutoza aho yagaragaje ubushobozi bukomeye bwo guteza imbere abakinnyi bato. Mu myaka 8 ishize, yatumye Garden TVET School iba umwe mu mashuri akomeye mu siporo mu Rwanda, atsinze ibikombe byinshi no gutanga abakinnyi benshi mu makipe y\'igihugu. Jotham ni umutoza ukunda cyane guteza imbere ubushobozi bw\'abakinnyi, atitaye gusa ku gutsinda ahubwo n\'uko bateza imbere nk\'abantu. Afite uburambe bw\'ibiganiro byo mu mutwe (sports psychology), imyitozo y\'umubiri (physical conditioning), n\'imyigishirize y\'amategeko y\'umukino (tactical training). Yigisha abakinnyi indangagaciro nk\'ubufatanye, kwihangana, no kwiyemeza - indangagaciro zibafasha mu mukino no mu buzima busanzwe.',
      'Jotham Niyonzima is an exceptional football coach with over 15 years of experience training student teams. He studied Sports Science and Coaching at university and holds multiple international certifications. He started his career as a professional football player in Rwanda\'s top leagues before transitioning to coaching, where he demonstrated remarkable ability in developing young talent. Over the past 8 years, he has made Garden TVET School one of Rwanda\'s strongest sports schools, winning numerous championships and producing many national team players. Jotham is passionate about developing players\' abilities, focusing not just on winning but on their growth as individuals. He has expertise in sports psychology, physical conditioning, and tactical training. He teaches players values like teamwork, perseverance, and determination - values that help them in sports and in life.',
      15,
      JSON.stringify([
        'Bachelor\'s Degree in Sports Science and Coaching',
        'CAF A License (Confederation of African Football)',
        'UEFA B Coaching License',
        'Sports Psychology Certification',
        'Youth Development Specialist Certificate',
        'First Aid and Sports Medicine Training'
      ]),
      JSON.stringify([
        'Led Garden TVET to 3 Regional Championships (2019, 2021, 2023)',
        'Produced 12 players for Rwanda National Youth Teams',
        'Won Best Coach Award - Rwanda Schools Sports Federation (2022)',
        'Developed training program adopted by 15+ schools nationwide',
        'Coached team to National Schools Tournament Finals 5 times',
        'Mentored 8 assistant coaches who now lead their own teams'
      ]),
      JSON.stringify([
        'Youth Player Development',
        'Tactical Analysis and Game Strategy',
        'Physical Conditioning and Fitness',
        'Sports Psychology and Mental Training',
        'Team Building and Leadership',
        'Injury Prevention and Recovery'
      ]),
      '/images/coaches/jotham.jpg',
      'jotham.niyonzima@gardentvet.ac.rw',
      '+250 788 123 456',
      'Sports Complex - Office 101'
    ]);

    console.log('✅ Coaches table created and Jotham profile added successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupCoaches();
