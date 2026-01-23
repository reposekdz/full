const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

async function setupCompetitionSystem() {
  const connection = await dbConfig.pool.getConnection();

  try {
    console.log('Creating competition system tables...');

    // Competition categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS competition_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Competitions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS competitions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INT,
        trade_id INT,
        level VARCHAR(10),
        competition_type ENUM('individual', 'team', 'trade_based') DEFAULT 'individual',
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        points_reward INT DEFAULT 100,
        medal_type ENUM('diamond', 'gold', 'silver', 'bronze') DEFAULT 'bronze',
        max_participants INT DEFAULT 100,
        rules TEXT,
        status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES competition_categories(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Student competition participation
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS competition_participants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        competition_id INT NOT NULL,
        student_id INT NOT NULL,
        trade_id INT,
        score DECIMAL(10,2) DEFAULT 0,
        rank INT,
        points_earned INT DEFAULT 0,
        medal_earned ENUM('diamond', 'gold', 'silver', 'bronze', 'none') DEFAULT 'none',
        completion_status ENUM('registered', 'in_progress', 'completed', 'disqualified') DEFAULT 'registered',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_participation (competition_id, student_id)
      )
    `);

    // Student points ledger
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_points (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        points INT NOT NULL,
        source ENUM('competition', 'achievement', 'bonus', 'penalty') DEFAULT 'competition',
        source_id INT,
        description TEXT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Student medals collection
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_medals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        medal_type ENUM('diamond', 'gold', 'silver', 'bronze') NOT NULL,
        competition_id INT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE SET NULL
      )
    `);

    // Trade leaderboard
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trade_leaderboard (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_id INT NOT NULL,
        student_id INT NOT NULL,
        total_points INT DEFAULT 0,
        total_competitions INT DEFAULT 0,
        diamond_medals INT DEFAULT 0,
        gold_medals INT DEFAULT 0,
        silver_medals INT DEFAULT 0,
        bronze_medals INT DEFAULT 0,
        rank_in_trade INT,
        overall_rank INT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_trade_student (trade_id, student_id)
      )
    `);

    // Competition achievements
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS competition_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        requirement_type ENUM('points', 'medals', 'competitions', 'streak') NOT NULL,
        requirement_value INT NOT NULL,
        medal_type ENUM('diamond', 'gold', 'silver', 'bronze'),
        points_reward INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Student achievements
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        achievement_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES competition_achievements(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_achievement (student_id, achievement_id)
      )
    `);

    // Insert default competition categories
    await connection.execute(`
      INSERT IGNORE INTO competition_categories (id, name, description, icon, color) VALUES
      (1, 'Academic Excellence', 'Competitions based on academic performance', 'BookOpen', 'blue'),
      (2, 'Skills Challenge', 'Practical skills and hands-on competitions', 'Wrench', 'green'),
      (3, 'Innovation Contest', 'Creative and innovative project competitions', 'Lightbulb', 'purple'),
      (4, 'Speed Challenge', 'Time-based skill competitions', 'Zap', 'yellow'),
      (5, 'Team Projects', 'Collaborative team-based competitions', 'Users', 'pink'),
      (6, 'Trade Mastery', 'Trade-specific skill competitions', 'Award', 'orange')
    `);

    // Insert default achievements
    await connection.execute(`
      INSERT IGNORE INTO competition_achievements (id, name, description, icon, requirement_type, requirement_value, points_reward) VALUES
      (1, 'First Steps', 'Complete your first competition', 'Star', 'competitions', 1, 50),
      (2, 'Point Collector', 'Earn 1000 points', 'Target', 'points', 1000, 100),
      (3, 'Medal Hunter', 'Win 5 medals of any type', 'Award', 'medals', 5, 200),
      (4, 'Gold Standard', 'Win 3 gold medals', 'Medal', 'medals', 3, 300),
      (5, 'Diamond Elite', 'Win 1 diamond medal', 'Gem', 'medals', 1, 500),
      (6, 'Competition Master', 'Complete 10 competitions', 'Trophy', 'competitions', 10, 250)
    `);

    console.log('Competition system tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

setupCompetitionSystem();
