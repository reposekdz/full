const mysql = require('mysql2/promise');

async function createSportsTeams() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Create sports_teams table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sports_teams (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        sport_type ENUM('football', 'volleyball', 'basketball') NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        icon VARCHAR(10),
        total_players INT DEFAULT 0,
        total_achievements INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Sports teams table created');

    // Check if teams already exist
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM sports_teams');
    if (existing[0].count > 0) {
      console.log('✅ Sports teams already exist');
      await connection.end();
      return;
    }

    // Insert football and volleyball teams
    const teams = [
      {
        name: 'Ikipe ya Football',
        name_en: 'Football Team',
        sport_type: 'football',
        description: 'Ikipe ya football ya Garden TVET School ikina mu mikino myinshi kandi ifite abakinnyi beza cyane.',
        image_url: 'http://localhost:5000/uploads/sports/full teamof football.jpg',
        icon: '⚽',
        total_players: 25,
        total_achievements: 8
      },
      {
        name: 'Ikipe ya Volleyball',
        name_en: 'Volleyball Team',
        sport_type: 'volleyball',
        description: 'Ikipe ya volleyball ya Garden TVET School ikina neza cyane kandi ifite abakinnyi beza mu Rwanda.',
        image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
        icon: '🏐',
        total_players: 18,
        total_achievements: 6
      }
    ];

    for (const team of teams) {
      await connection.execute(`
        INSERT INTO sports_teams (name, name_en, sport_type, description, image_url, icon, total_players, total_achievements)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [team.name, team.name_en, team.sport_type, team.description, team.image_url, team.icon, team.total_players, team.total_achievements]);
      
      console.log(`✅ Added ${team.name}`);
    }

    console.log('✅ All sports teams created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createSportsTeams();