const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupSports() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_teams (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        name_en VARCHAR(100),
        sport_type ENUM('football', 'volleyball') NOT NULL,
        description TEXT,
        description_en TEXT,
        icon VARCHAR(10),
        image_url VARCHAR(500),
        founded_year INT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_coaches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        team_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        name_rw VARCHAR(100),
        role VARCHAR(100),
        role_rw VARCHAR(100),
        image_url VARCHAR(500),
        email VARCHAR(100),
        phone VARCHAR(20),
        experience_years INT,
        bio TEXT,
        bio_rw TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_players (
        id INT PRIMARY KEY AUTO_INCREMENT,
        team_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        name_rw VARCHAR(100),
        jersey_number INT,
        position VARCHAR(50),
        position_rw VARCHAR(50),
        image_url VARCHAR(500),
        date_of_birth DATE,
        height INT,
        weight INT,
        class VARCHAR(50),
        is_captain BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        joined_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        team_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        title_rw VARCHAR(200),
        description TEXT,
        description_rw TEXT,
        achievement_date DATE,
        position INT,
        competition_name VARCHAR(200),
        competition_name_rw VARCHAR(200),
        icon VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_matches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        team_id INT NOT NULL,
        opponent VARCHAR(100) NOT NULL,
        match_date DATE NOT NULL,
        match_time TIME,
        location VARCHAR(200),
        location_rw VARCHAR(200),
        our_score INT,
        opponent_score INT,
        result ENUM('win', 'loss', 'draw', 'pending'),
        match_type VARCHAR(50),
        season VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tables created');

    // Insert teams
    await connection.query(`
      INSERT INTO sports_teams (name, name_en, sport_type, description, description_en, icon, image_url, founded_year) VALUES
      ('Umupira w''Amaguru', 'Football Team', 'football', 
       'Ikipe ya Garden TVET School mu mupira w''amaguru. Ikipe yacu ifite abakinnyi beza kandi ifite intsinzi nyinshi mu marushanwa atandukanye.',
       'Garden TVET School Football Team. Our team has excellent players and many victories in various competitions.',
       '⚽', '/uploads/sports/football-team.jpg', 2020),
       
      ('Umupira w''Amaboko', 'Volleyball Team', 'volleyball',
       'Ikipe ya Garden TVET School mu mupira w''amaboko. Ikipe yacu ifite abakinnyi beza kandi ifite intsinzi nyinshi mu marushanwa atandukanye.',
       'Garden TVET School Volleyball Team. Our team has excellent players and many victories in various competitions.',
       '🏐', '/uploads/sports/volleyball-team.jpg', 2020)
    `);

    console.log('✅ Teams inserted');

    // Insert coaches
    await connection.query(`
      INSERT INTO sports_coaches (team_id, name, name_rw, role, role_rw, image_url, email, phone, experience_years, bio_rw) VALUES
      (1, 'Coach Jean Pierre', 'Umutoza Jean Pierre', 'Head Coach', 'Umutoza Mukuru', '/uploads/sports/coach-football.jpg', 'coach.football@garden-tvet.rw', '+250 788 111 222', 10,
       'Umutoza Jean Pierre afite uburambe bw''imyaka 10 mu gutoza umupira w''amaguru. Yatoje amakipe menshi kandi yaronse ibihembo byinshi.'),
       
      (2, 'Coach Marie Claire', 'Umutoza Marie Claire', 'Head Coach', 'Umutoza Mukuru', '/uploads/sports/coach-volleyball.jpg', 'coach.volleyball@garden-tvet.rw', '+250 788 333 444', 8,
       'Umutoza Marie Claire afite uburambe bw''imyaka 8 mu gutoza umupira w''amaboko. Yatoje amakipe menshi kandi yaronse ibihembo byinshi.')
    `);

    console.log('✅ Coaches inserted');

    // Insert football players
    const footballPlayers = [
      [1, 'Mugisha Eric', 'Mugisha Eric', 1, 'Goalkeeper', 'Umurinzi w\'Urubuga', '/uploads/sports/player-f1.jpg', '2005-03-15', 180, 75, 'Level 4A', true, '2023-01-10'],
      [1, 'Niyonkuru Patrick', 'Niyonkuru Patrick', 5, 'Defender', 'Umurinzi', '/uploads/sports/player-f2.jpg', '2004-07-20', 178, 72, 'Level 4A', false, '2023-01-10'],
      [1, 'Habimana Claude', 'Habimana Claude', 7, 'Midfielder', 'Umukinnyi wo Hagati', '/uploads/sports/player-f3.jpg', '2005-01-12', 175, 70, 'Level 4B', false, '2023-01-10'],
      [1, 'Uwimana David', 'Uwimana David', 10, 'Forward', 'Umutera Ibitsindo', '/uploads/sports/player-f4.jpg', '2004-11-05', 177, 71, 'Level 4A', false, '2023-01-10'],
      [1, 'Kalisa Emmanuel', 'Kalisa Emmanuel', 9, 'Forward', 'Umutera Ibitsindo', '/uploads/sports/player-f5.jpg', '2005-05-18', 176, 69, 'Level 4B', false, '2023-01-10']
    ];

    for (const player of footballPlayers) {
      await connection.query(
        'INSERT INTO sports_players (team_id, name, name_rw, jersey_number, position, position_rw, image_url, date_of_birth, height, weight, class, is_captain, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        player
      );
    }

    console.log('✅ Football players inserted');

    // Insert volleyball players
    const volleyballPlayers = [
      [2, 'Uwase Grace', 'Uwase Grace', 1, 'Setter', 'Setter', '/uploads/sports/player-v1.jpg', '2005-02-10', 170, 60, 'Level 4A', true, '2023-01-10'],
      [2, 'Mukamana Alice', 'Mukamana Alice', 5, 'Outside Hitter', 'Outside Hitter', '/uploads/sports/player-v2.jpg', '2004-08-15', 172, 62, 'Level 4A', false, '2023-01-10'],
      [2, 'Ingabire Sarah', 'Ingabire Sarah', 7, 'Middle Blocker', 'Middle Blocker', '/uploads/sports/player-v3.jpg', '2005-04-20', 175, 65, 'Level 4B', false, '2023-01-10'],
      [2, 'Uwineza Diane', 'Uwineza Diane', 10, 'Libero', 'Libero', '/uploads/sports/player-v4.jpg', '2004-12-08', 168, 58, 'Level 4A', false, '2023-01-10'],
      [2, 'Mutesi Peace', 'Mutesi Peace', 9, 'Opposite Hitter', 'Opposite Hitter', '/uploads/sports/player-v5.jpg', '2005-06-25', 173, 63, 'Level 4B', false, '2023-01-10']
    ];

    for (const player of volleyballPlayers) {
      await connection.query(
        'INSERT INTO sports_players (team_id, name, name_rw, jersey_number, position, position_rw, image_url, date_of_birth, height, weight, class, is_captain, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        player
      );
    }

    console.log('✅ Volleyball players inserted');

    // Insert achievements
    await connection.query(`
      INSERT INTO sports_achievements (team_id, title, title_rw, description_rw, achievement_date, position, competition_name, competition_name_rw, icon) VALUES
      (1, 'Inter-School Championship', 'Igikombe cy''Amashuri', 'Twatsindiye igikombe cy''amashuri mu 2024', '2024-06-15', 1, 'Kigali Inter-School Tournament', 'Amarushanwa y''Amashuri ya Kigali', '🏆'),
      (1, 'Best Team Award', 'Ikipe Yiza Cyane', 'Twahawwe igihembo cy''ikipe yiza cyane', '2024-12-10', 1, 'TVET Schools Competition', 'Amarushanwa y''Amashuri ya TVET', '🥇'),
      (2, 'Regional Champions', 'Abatsindiye mu Karere', 'Twatsindiye amarushanwa y''akarere', '2024-05-20', 1, 'Regional Volleyball Championship', 'Igikombe cy''Akarere', '🏆'),
      (2, 'Fair Play Award', 'Igihembo cy''Imikino Myiza', 'Twahawwe igihembo cy''imikino myiza', '2024-11-15', 1, 'National School Games', 'Imikino y''Amashuri ku Rwego rw''Igihugu', '⭐')
    `);

    console.log('✅ Achievements inserted');

    // Insert recent matches
    await connection.query(`
      INSERT INTO sports_matches (team_id, opponent, match_date, match_time, location, location_rw, our_score, opponent_score, result, match_type, season) VALUES
      (1, 'IPRC Kigali', '2024-12-15', '14:00:00', 'Garden TVET Stadium', 'Stade ya Garden TVET', 3, 1, 'win', 'League', '2024'),
      (1, 'AUCA', '2024-12-08', '15:00:00', 'AUCA Stadium', 'Stade ya AUCA', 2, 2, 'draw', 'League', '2024'),
      (1, 'UR Huye', '2024-12-01', '14:30:00', 'Garden TVET Stadium', 'Stade ya Garden TVET', 4, 0, 'win', 'League', '2024'),
      (2, 'IPRC Musanze', '2024-12-10', '16:00:00', 'Garden TVET Court', 'Terrain ya Garden TVET', 3, 1, 'win', 'League', '2024'),
      (2, 'UR Nyagatare', '2024-12-03', '15:30:00', 'UR Nyagatare Court', 'Terrain ya UR Nyagatare', 2, 3, 'loss', 'League', '2024')
    `);

    console.log('✅ Matches inserted');
    console.log('\n🎉 Sports system setup completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupSports();
