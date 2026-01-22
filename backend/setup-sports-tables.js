const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAllTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  // Drop tables in correct order (child tables first)
  console.log('🗑️  Dropping existing tables...');
  await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);
  await connection.query(`DROP TABLE IF EXISTS player_stats`);
  await connection.query(`DROP TABLE IF EXISTS players`);
  await connection.query(`DROP TABLE IF EXISTS matches`);
  await connection.query(`DROP TABLE IF EXISTS teams`);
  await connection.query(`DROP TABLE IF EXISTS trophies`);
  await connection.query(`DROP TABLE IF EXISTS sports_gallery`);
  await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);
  console.log('✅ Tables dropped');

  console.log('📋 Creating teams table...');
  await connection.query(`
    CREATE TABLE teams (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      sport_type VARCHAR(50) NOT NULL,
      coach VARCHAR(100),
      captain VARCHAR(100),
      description TEXT,
      logo VARCHAR(255),
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Teams table created');

  console.log('📋 Creating players table...');
  await connection.query(`
    CREATE TABLE players (
      id INT PRIMARY KEY AUTO_INCREMENT,
      team_id INT,
      name VARCHAR(100) NOT NULL,
      jersey_number INT,
      position VARCHAR(50),
      sport_type VARCHAR(50),
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Players table created');

  console.log('📋 Creating matches table...');
  await connection.query(`
    CREATE TABLE matches (
      id INT PRIMARY KEY AUTO_INCREMENT,
      home_team_id INT,
      away_team_id INT,
      sport_type VARCHAR(50),
      match_date DATE,
      start_time TIME,
      venue VARCHAR(100),
      home_score INT DEFAULT 0,
      away_score INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Matches table created');

  console.log('📋 Creating player_stats table...');
  await connection.query(`
    CREATE TABLE player_stats (
      id INT PRIMARY KEY AUTO_INCREMENT,
      player_id INT,
      match_id INT,
      goals INT DEFAULT 0,
      assists INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Player stats table created');

  console.log('📋 Creating trophies table...');
  await connection.query(`
    CREATE TABLE trophies (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(100) NOT NULL,
      sport_type VARCHAR(50),
      year INT,
      date_won DATE,
      description TEXT,
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Trophies table created');

  console.log('📋 Creating sports_gallery table...');
  await connection.query(`
    CREATE TABLE sports_gallery (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(200),
      sport_type VARCHAR(50),
      image_url VARCHAR(255),
      event_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Sports gallery table created');

  // Insert sample data
  console.log('📝 Inserting sample data...');
  await connection.query(`
    INSERT INTO teams (name, sport_type, coach, captain, description, status) VALUES
    ('Football Team', 'Football', 'Coach John', 'Player A', 'School football team', 'active'),
    ('Basketball Team', 'Basketball', 'Coach Mary', 'Player B', 'School basketball team', 'active'),
    ('Volleyball Team', 'Volleyball', 'Coach Peter', 'Player C', 'School volleyball team', 'active')
  `);
  console.log('✅ Sample data inserted');
  console.log('\n🎉 All sports tables created and populated successfully!');
  await connection.end();
}

setupAllTables().catch(console.error);
