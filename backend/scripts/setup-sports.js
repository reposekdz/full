const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupSportsDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop existing tables
    await connection.query('DROP TABLE IF EXISTS sports_achievements');
    await connection.query('DROP TABLE IF EXISTS sports_matches');
    await connection.query('DROP TABLE IF EXISTS sports_teams');
    console.log('Dropped existing tables');
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create sports_teams table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_teams (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        sport VARCHAR(100) NOT NULL,
        image_url VARCHAR(500),
        players_count INT DEFAULT 0,
        wins INT DEFAULT 0,
        losses INT DEFAULT 0,
        draws INT DEFAULT 0,
        founded_year VARCHAR(10),
        coach VARCHAR(255),
        captain VARCHAR(255),
        description_rw TEXT,
        description_en TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('sports_teams table created');

    // Create sports_matches table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_matches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        team_id INT,
        team_name VARCHAR(255) NOT NULL,
        opponent VARCHAR(255) NOT NULL,
        score VARCHAR(50),
        result ENUM('win', 'loss', 'draw', 'pending') DEFAULT 'pending',
        match_date DATE NOT NULL,
        match_time TIME,
        venue VARCHAR(255),
        sport VARCHAR(100) NOT NULL,
        is_upcoming BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE SET NULL
      )
    `);
    console.log('sports_matches table created');

    // Create sports_achievements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sports_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        team_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        year VARCHAR(10),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES sports_teams(id) ON DELETE CASCADE
      )
    `);
    console.log('sports_achievements table created');

    // Insert sample teams
    const teams = [
      {
        name: 'Garden TVET Football Club',
        sport: 'Football',
        players_count: 22,
        wins: 15,
        losses: 3,
        draws: 2,
        founded_year: '2020',
        coach: 'Coach Mugisha Jean',
        captain: 'Nkusi Patrick',
        description_rw: 'Ikipe yacu y\'umupira w\'amaguru ni imwe mu zikomeye mu karere. Dufite abakinnyi b\'ubushobozi bwinshi kandi twaratsinze ibitego byinshi.',
        description_en: 'Our football team is one of the strongest in the region. We have talented players and have won many championships.'
      },
      {
        name: 'Garden TVET Basketball Team',
        sport: 'Basketball',
        players_count: 15,
        wins: 12,
        losses: 5,
        draws: 0,
        founded_year: '2019',
        coach: 'Coach Uwase Marie',
        captain: 'Habimana Joseph',
        description_rw: 'Ikipe yacu ya Basketball irakomeye cyane. Abakinnyi bacu bafite ubushobozi bwo gukina neza kandi bakunze gutsinda.',
        description_en: 'Our basketball team is very strong. Our players are skilled and win frequently.'
      },
      {
        name: 'Garden TVET Volleyball Squad',
        sport: 'Volleyball',
        players_count: 12,
        wins: 10,
        losses: 4,
        draws: 1,
        founded_year: '2021',
        coach: 'Coach Mukamana Grace',
        captain: 'Uwimana Jean',
        description_rw: 'Ikipe yacu ya Volleyball ifite abakinnyi b\'ubushobozi bwinshi. Turakina neza kandi tukunze gutsinda imikino myinshi.',
        description_en: 'Our volleyball team has many talented players. We play well and win many games.'
      },
      {
        name: 'Garden TVET Athletics Team',
        sport: 'Athletics',
        players_count: 18,
        wins: 20,
        losses: 2,
        draws: 0,
        founded_year: '2018',
        coach: 'Coach Niyonzima Paul',
        captain: 'Uwera Alice',
        description_rw: 'Ikipe yacu y\'imikino ngororamubiri ifite abakinnyi bakomeye cyane. Twaratsinze ibitego byinshi mu mikino itandukanye.',
        description_en: 'Our athletics team has very strong athletes. We have won many championships in various events.'
      }
    ];

    for (const team of teams) {
      const [result] = await connection.query(
        'INSERT INTO sports_teams (name, sport, players_count, wins, losses, draws, founded_year, coach, captain, description_rw, description_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [team.name, team.sport, team.players_count, team.wins, team.losses, team.draws, team.founded_year, team.coach, team.captain, team.description_rw, team.description_en]
      );
    }
    console.log('Sample teams inserted');

    // Insert sample matches
    const matches = [
      { team_id: 1, team_name: 'Garden TVET FC', opponent: 'City College FC', score: '3-1', result: 'win', match_date: '2024-01-15', venue: 'Garden Stadium', sport: 'Football', is_upcoming: false },
      { team_id: 1, team_name: 'Garden TVET FC', opponent: 'Tech Institute', score: '2-2', result: 'draw', match_date: '2024-01-20', venue: 'Tech Ground', sport: 'Football', is_upcoming: false },
      { team_id: 1, team_name: 'Garden TVET FC', opponent: 'Rival School', score: '4-0', result: 'win', match_date: '2024-01-25', venue: 'Garden Stadium', sport: 'Football', is_upcoming: false },
      { team_id: 2, team_name: 'Garden TVET Basketball', opponent: 'City Ballers', score: '78-65', result: 'win', match_date: '2024-01-18', venue: 'Main Court', sport: 'Basketball', is_upcoming: false },
      { team_id: 2, team_name: 'Garden TVET Basketball', opponent: 'Tech Hoops', score: '70-75', result: 'loss', match_date: '2024-01-22', venue: 'Tech Arena', sport: 'Basketball', is_upcoming: false },
      { team_id: 3, team_name: 'Garden TVET Volleyball', opponent: 'Spike Masters', score: '3-1', result: 'win', match_date: '2024-01-19', venue: 'Sports Hall', sport: 'Volleyball', is_upcoming: false },
      { team_id: 1, team_name: 'Garden TVET FC', opponent: 'Elite FC', score: null, result: 'pending', match_date: '2024-02-15', match_time: '15:00', venue: 'Garden Stadium', sport: 'Football', is_upcoming: true },
      { team_id: 2, team_name: 'Garden TVET Basketball', opponent: 'Pro Ballers', score: null, result: 'pending', match_date: '2024-02-18', match_time: '16:00', venue: 'Main Court', sport: 'Basketball', is_upcoming: true },
    ];

    for (const match of matches) {
      await connection.query(
        'INSERT INTO sports_matches (team_id, team_name, opponent, score, result, match_date, match_time, venue, sport, is_upcoming) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [match.team_id, match.team_name, match.opponent, match.score, match.result, match.match_date, match.match_time || null, match.venue, match.sport, match.is_upcoming]
      );
    }
    console.log('Sample matches inserted');

    // Insert sample achievements
    const achievements = [
      { team_id: 1, title: 'Regional Champions 2024', year: '2024' },
      { team_id: 1, title: 'Fair Play Award 2023', year: '2023' },
      { team_id: 1, title: 'Best Team 2024', year: '2024' },
      { team_id: 2, title: 'District Champions 2024', year: '2024' },
      { team_id: 2, title: 'Best Defense 2023', year: '2023' },
      { team_id: 3, title: 'Regional Runners-up 2024', year: '2024' },
      { team_id: 3, title: 'Fair Play Award 2024', year: '2024' },
      { team_id: 4, title: 'National Champions 2024', year: '2024' },
      { team_id: 4, title: 'Best Athletes 2023', year: '2023' },
      { team_id: 4, title: 'Record Breakers 2024', year: '2024' }
    ];

    for (const achievement of achievements) {
      await connection.query(
        'INSERT INTO sports_achievements (team_id, title, year) VALUES (?, ?, ?)',
        [achievement.team_id, achievement.title, achievement.year]
      );
    }
    console.log('Sample achievements inserted');

    console.log('Sports database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up sports database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupSportsDatabase();
