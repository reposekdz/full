const { pool } = require('./config/database');

async function setupTradesAndLevels() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔧 Setting up Trades and Levels tables...\n');

    // Create trades_levels table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trades_levels (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_code VARCHAR(10) NOT NULL,
        level_number INT NOT NULL,
        level_suffix VARCHAR(5) DEFAULT '',
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_trade_level (trade_code, level_number, level_suffix),
        INDEX idx_trade_code (trade_code),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ trades_levels table created/verified');

    // Check if courses table exists, if not create it
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration_months INT DEFAULT 36,
        fee_amount DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ courses table created/verified');

    // Insert sample trades if table is empty
    const [existingCourses] = await connection.query('SELECT COUNT(*) as count FROM courses');
    if (existingCourses[0].count === 0) {
      console.log('\n📝 Inserting sample trades...');
      
      const sampleTrades = [
        ['ELE', 'Electrical Installation', 'Training in electrical systems, wiring, and installations', 36, 500000],
        ['MCT', 'Mechanical Technology', 'Training in mechanical systems, engines, and machinery', 36, 500000],
        ['CON', 'Construction', 'Training in building construction and masonry', 36, 450000],
        ['PLU', 'Plumbing', 'Training in water systems and plumbing installations', 36, 450000],
        ['WEL', 'Welding', 'Training in metal welding and fabrication', 36, 480000],
        ['CAR', 'Carpentry', 'Training in woodworking and furniture making', 36, 420000],
        ['AUT', 'Automotive', 'Training in vehicle mechanics and repair', 36, 550000],
        ['ICT', 'Information Technology', 'Training in computer systems and networking', 36, 600000]
      ];

      for (const trade of sampleTrades) {
        await connection.query(
          'INSERT INTO courses (code, name, description, duration_months, fee_amount) VALUES (?, ?, ?, ?, ?)',
          trade
        );
        console.log(`   ✓ Added trade: ${trade[0]} - ${trade[1]}`);
      }
    } else {
      console.log(`\n✅ Found ${existingCourses[0].count} existing trades`);
    }

    // Insert sample levels if table is empty
    const [existingLevels] = await connection.query('SELECT COUNT(*) as count FROM trades_levels');
    if (existingLevels[0].count === 0) {
      console.log('\n📝 Inserting sample levels for all trades...');
      
      const [allTrades] = await connection.query('SELECT code FROM courses WHERE is_active = true');
      
      for (const trade of allTrades) {
        for (let level = 1; level <= 4; level++) {
          await connection.query(
            'INSERT INTO trades_levels (trade_code, level_number, level_suffix, description) VALUES (?, ?, ?, ?)',
            [trade.code, level, '', `Level ${level} for ${trade.code}`]
          );
        }
        console.log(`   ✓ Added levels 1-4 for trade: ${trade.code}`);
      }
    } else {
      console.log(`\n✅ Found ${existingLevels[0].count} existing levels`);
    }

    // Display summary
    console.log('\n📊 Database Summary:');
    const [tradeCount] = await connection.query('SELECT COUNT(*) as count FROM courses WHERE is_active = true');
    const [levelCount] = await connection.query('SELECT COUNT(*) as count FROM trades_levels WHERE is_active = true');
    console.log(`   Trades: ${tradeCount[0].count}`);
    console.log(`   Levels: ${levelCount[0].count}`);

    console.log('\n✅ Setup completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run setup
setupTradesAndLevels()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
