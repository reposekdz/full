const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupDevelopers() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS developer_team (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        name_rw VARCHAR(100),
        role VARCHAR(200) NOT NULL,
        role_rw VARCHAR(200),
        description TEXT,
        description_rw TEXT,
        image_url VARCHAR(500),
        email VARCHAR(100),
        phone VARCHAR(20),
        github_url VARCHAR(200),
        linkedin_url VARCHAR(200),
        skills JSON,
        achievements JSON,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ developer_team table created');

    // Insert developers
    await connection.query(`
      INSERT INTO developer_team (name, name_rw, role, role_rw, description_rw, email, phone, github_url, linkedin_url, skills, achievements, sort_order) VALUES
      (
        'Niyonkuru Reponse',
        'Niyonkuru Reponse',
        'Team Owner & System Development Manager',
        'Umuyobozi w''Itsinda & Umuyobozi w''Iterambere rya Sisitemu',
        'Niyonkuru Reponse ni umuyobozi mukuru w''itsinda ry''abatunganyije sisitemu ikomeye yo gucunga ishuri. Yize muri Garden TVET School mu ishami rya Software Development Level 4, aho yagaragaje ubushobozi bukomeye mu iterambere rya sisitemu n''ubuyobozi bw''imishinga. Yatunganye sisitemu ikomeye yo gucunga ishuri ifite ibiranga byinshi nko kwiyandikisha abanyeshuri, gucunga amaklasi, gukurikirana amanota, sisitemu yo kwishyura amafaranga, na sisitemu yo guhanahana.',
        'reponse@garden-tvet.rw',
        '+250 788 123 456',
        'https://github.com/niyonkuru-reponse',
        'https://linkedin.com/in/niyonkuru-reponse',
        '["React", "TypeScript", "Node.js", "Express", "MySQL", "System Architecture", "Team Leadership", "Project Management"]',
        '["Best Student Developer 2025", "Innovation Award 2025", "Best Graduation Project 2026", "Young Developer Award 2026"]',
        1
      ),
      (
        'Musoni Mugisha Yves',
        'Musoni Mugisha Yves',
        'Asset Tracker & Innovation Specialist',
        'Umukurikirana w''Umutungo & Inzobere mu Guhanga Udushya',
        'Musoni Mugisha Yves ni inzobere mu gukurikirana umutungo n''uguhanga udushya. Afite uruhare runini mu gushyira mu bikorwa ibitekerezo bishya no gufasha itsinda gukomeza gutera imbere. Yagize uruhare runini mu gushyira mu bikorwa tekinoloji zigezweho mu gukora sisitemu.',
        'yves@garden-tvet.rw',
        '+250 788 234 567',
        'https://github.com/musoni-yves',
        'https://linkedin.com/in/musoni-yves',
        '["Innovation", "Asset Management", "Quality Assurance", "Testing", "Documentation"]',
        '["Innovation Excellence Award", "Best Team Player 2025"]',
        2
      ),
      (
        'Zamilu Yazid Surayman',
        'Zamilu Yazid Surayman',
        'Secretary & Data Gathering Specialist',
        'Umunyamabanga & Inzobere mu Gukusanya Amakuru',
        'Zamilu Yazid Surayman ni umunyamabanga w''itsinda kandi ni inzobere mu gukusanya amakuru. Afite uruhare runini mu gukusanya no gutunganya amakuru akenewe mu gukora sisitemu. Yagize uruhare runini mu gukora ubushakashatsi no gukusanya ibikenewe n''abakoresha.',
        'yazid@garden-tvet.rw',
        '+250 788 345 678',
        'https://github.com/zamilu-yazid',
        'https://linkedin.com/in/zamilu-yazid',
        '["Data Analysis", "Research", "Documentation", "Communication", "Organization"]',
        '["Best Data Analyst 2025", "Excellence in Research"]',
        3
      ),
      (
        'Niyonsenga Frank',
        'Niyonsenga Frank',
        'Team Representative & Advisor',
        'Uhagarariye Itsinda & Umujyanama',
        'Niyonsenga Frank ni uhagarariye itsinda kandi ni umujyanama. Afite uruhare runini mu guhuza itsinda n''abayobozi b''ishuri no gutanga inama ku bijyanye n''umushinga. Yagize uruhare runini mu gushyira mu bikorwa imishinga no gufasha itsinda gukomeza gutera imbere.',
        'frank@garden-tvet.rw',
        '+250 788 456 789',
        'https://github.com/niyonsenga-frank',
        'https://linkedin.com/in/niyonsenga-frank',
        '["Leadership", "Communication", "Project Coordination", "Stakeholder Management", "Advisory"]',
        '["Best Team Representative 2025", "Leadership Excellence Award"]',
        4
      )
    `);

    console.log('✅ Developers inserted successfully');
    console.log('\n🎉 Developer team setup completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupDevelopers();
