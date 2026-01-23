const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupGardenSports() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Create players table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_players (
        id INT PRIMARY KEY AUTO_INCREMENT,
        team_id INT,
        name VARCHAR(255) NOT NULL,
        jersey_number INT,
        position VARCHAR(100),
        age INT,
        class VARCHAR(50),
        image_url VARCHAR(500),
        goals_scored INT DEFAULT 0,
        assists INT DEFAULT 0,
        matches_played INT DEFAULT 0,
        is_captain BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES sports_teams(id)
      )
    `);

    // Create goals table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_goals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        match_id INT,
        player_id INT,
        team_id INT,
        minute INT,
        goal_type VARCHAR(50),
        assisted_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES sports_matches(id),
        FOREIGN KEY (player_id) REFERENCES sports_players(id),
        FOREIGN KEY (team_id) REFERENCES sports_teams(id)
      )
    `);

    // Update coach name to Tuyisabe Chance Jotham
    await connection.query(`
      UPDATE sports_coaches 
      SET name = 'Tuyisabe Chance Jotham',
          sport = 'Football',
          title = 'Head Football Coach - Garden TVET School',
          bio_rw = 'Tuyisabe Chance Jotham ni umutoza w\'ubuziranenge mu siporo ya umupira w\'amaguru muri Garden TVET School. Afite uburambe bw\'imyaka 12 mu gutoza abanyeshuri, kandi yakoze cyane mu guteza imbere ubushobozi bw\'abakinnyi bato. Yize Sports Science na Coaching kaminuza, kandi afite impamyabumenyi nyinshi zo mu rwego mpuzamahanga harimo CAF B License na UEFA Grassroots Certificate. Yatangiye umwuga we nk\'umukinnyi w\'umupira w\'amaguru mu makipe y\'amashuri, hanyuma yimukiye mu gutoza aho yagaragaje ubushobozi bukomeye bwo gufasha abakinnyi gutera imbere. Mu myaka 5 ishize, yatumye ikipe ya Garden TVET Football iba imwe mu makipe akomeye mu ntara, atsinze ibikombe 2 no gutanga abakinnyi 8 mu makipe y\'intara. Tuyisabe ni umutoza ukunda cyane gufasha abakinnyi bateze imbere mu mukino no mu buzima, akabafasha kwiga indangagaciro nk\'ubufatanye, kwihangana, no kwiyemeza.',
          bio_en = 'Tuyisabe Chance Jotham is an exceptional football coach at Garden TVET School. He has 12 years of experience training students and has worked extensively in developing young players\' abilities. He studied Sports Science and Coaching at university and holds multiple international certifications including CAF B License and UEFA Grassroots Certificate. He started his career as a school football player before transitioning to coaching, where he demonstrated remarkable ability in helping players develop. Over the past 5 years, he has made Garden TVET Football team one of the strongest teams in the region, winning 2 championships and producing 8 regional team players. Tuyisabe is passionate about helping players develop in sports and life, teaching them values like teamwork, perseverance, and determination.',
          experience_years = 12,
          qualifications = JSON_ARRAY(
            'CAF B Coaching License',
            'UEFA Grassroots Certificate',
            'Bachelor Degree in Sports Science',
            'Youth Development Specialist',
            'First Aid & Sports Medicine',
            'Tactical Analysis Certification'
          ),
          achievements = JSON_ARRAY(
            'Led Garden TVET to 2 Regional Championships (2021, 2023)',
            'Produced 8 players for Regional Youth Teams',
            'Best Coach Award - District Sports Federation (2022)',
            'Undefeated home record for 2 seasons',
            'Developed training program used by 5+ schools',
            'Coached team to Provincial Tournament Finals 3 times'
          ),
          specializations = JSON_ARRAY(
            'Youth Player Development',
            'Tactical Training',
            'Physical Fitness',
            'Team Building',
            'Match Strategy',
            'Player Motivation'
          )
      WHERE name LIKE '%Jotham%'
    `);

    // Insert Football team players
    const [footballTeam] = await connection.query('SELECT id FROM sports_teams WHERE sport = "Football" LIMIT 1');
    if (footballTeam.length > 0) {
      const teamId = footballTeam[0].id;
      
      await connection.query(`
        INSERT INTO sports_players (team_id, name, jersey_number, position, age, class, goals_scored, assists, matches_played, is_captain) VALUES
        (?, 'Mugisha Eric', 10, 'Forward', 19, 'S6 MCE', 15, 8, 20, true),
        (?, 'Niyonzima Patrick', 7, 'Midfielder', 18, 'S6 MCE', 8, 12, 20, false),
        (?, 'Habimana Jean', 9, 'Forward', 20, 'S6 ELE', 12, 5, 18, false),
        (?, 'Uwimana Claude', 5, 'Defender', 19, 'S5 MCE', 2, 3, 20, false),
        (?, 'Kalisa David', 1, 'Goalkeeper', 21, 'S6 ELE', 0, 0, 20, false),
        (?, 'Bizimana Alex', 8, 'Midfielder', 18, 'S5 MCE', 6, 9, 19, false),
        (?, 'Nsengimana Frank', 11, 'Forward', 19, 'S6 MCE', 10, 4, 18, false),
        (?, 'Mutabazi Kevin', 4, 'Defender', 20, 'S6 ELE', 1, 2, 20, false),
        (?, 'Hakizimana Prince', 6, 'Midfielder', 18, 'S5 ELE', 5, 7, 17, false),
        (?, 'Nshimiyimana Yves', 3, 'Defender', 19, 'S5 MCE', 0, 1, 19, false),
        (?, 'Tuyishime Samuel', 2, 'Defender', 20, 'S6 ELE', 1, 0, 20, false),
        (?, 'Manzi Christian', 15, 'Midfielder', 18, 'S5 MCE', 4, 6, 15, false),
        (?, 'Ishimwe Daniel', 14, 'Forward', 19, 'S6 MCE', 7, 3, 16, false),
        (?, 'Nkurunziza Emmanuel', 13, 'Goalkeeper', 20, 'S6 ELE', 0, 0, 8, false),
        (?, 'Byiringiro Pacifique', 12, 'Defender', 18, 'S5 ELE', 0, 2, 14, false)
      `, Array(15).fill(teamId));
    }

    // Insert Volleyball team players
    const [volleyballTeam] = await connection.query('SELECT id FROM sports_teams WHERE sport = "Volleyball" LIMIT 1');
    if (volleyballTeam.length > 0) {
      const teamId = volleyballTeam[0].id;
      
      await connection.query(`
        INSERT INTO sports_players (team_id, name, jersey_number, position, age, class, matches_played, is_captain) VALUES
        (?, 'Uwase Grace', 5, 'Setter', 19, 'S6 MCE', 18, true),
        (?, 'Mukamana Alice', 7, 'Outside Hitter', 18, 'S5 MCE', 18, false),
        (?, 'Ingabire Sarah', 9, 'Middle Blocker', 20, 'S6 ELE', 17, false),
        (?, 'Umutoni Peace', 3, 'Libero', 19, 'S5 ELE', 18, false),
        (?, 'Nyirahabimana Claire', 11, 'Outside Hitter', 18, 'S5 MCE', 16, false),
        (?, 'Mukandayisenga Divine', 1, 'Setter', 20, 'S6 ELE', 15, false),
        (?, 'Uwineza Ange', 8, 'Middle Blocker', 19, 'S6 MCE', 17, false),
        (?, 'Ishimwe Claudine', 4, 'Opposite Hitter', 18, 'S5 ELE', 18, false),
        (?, 'Mutesi Joselyne', 6, 'Outside Hitter', 19, 'S6 MCE', 16, false),
        (?, 'Uwera Sandrine', 2, 'Libero', 20, 'S6 ELE', 14, false),
        (?, 'Iradukunda Bella', 10, 'Middle Blocker', 18, 'S5 MCE', 15, false),
        (?, 'Niyonsenga Esther', 12, 'Setter', 19, 'S5 ELE', 13, false)
      `, Array(12).fill(teamId));
    }

    console.log('✅ Garden TVET Sports system setup complete!');
    console.log('✅ Players table created');
    console.log('✅ Goals table created');
    console.log('✅ Coach updated to Tuyisabe Chance Jotham');
    console.log('✅ 15 Football players added');
    console.log('✅ 12 Volleyball players added');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupGardenSports();
