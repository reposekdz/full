const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAutoClassesOnly() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Connected to database');

    // Check existing structure
    const [existingCols] = await connection.query('DESCRIBE classes');
    const hasTradeId = existingCols.some(col => col.Field === 'trade_id');
    
    if (!hasTradeId) {
      // Add columns to existing table
      await connection.query('ALTER TABLE classes ADD COLUMN IF NOT EXISTS trade_code VARCHAR(20)');
      await connection.query('ALTER TABLE classes ADD COLUMN IF NOT EXISTS level VARCHAR(10)');
      await connection.query('ALTER TABLE classes ADD COLUMN IF NOT EXISTS section VARCHAR(10)');
      await connection.query('ALTER TABLE classes ADD COLUMN IF NOT EXISTS name_rw VARCHAR(255)');
      console.log('✅ Updated classes table structure');
    }

    // Get all trades
    const [trades] = await connection.query('SELECT * FROM trades WHERE is_active = true ORDER BY code');

    // Clear existing AUTO classes only
    await connection.query("DELETE FROM classes WHERE name LIKE '%AUTO%' OR name LIKE '%Automotive%'");
    console.log('✅ Cleared existing AUTO classes');

    const classesData = [];

    for (const trade of trades) {
      const tradeCode = trade.code;
      
      // Only AUTO L4 and L5 have A/B sections
      if (tradeCode === 'L4AUTO' || tradeCode === 'L5AUTO') {
        classesData.push({
          name: `${trade.name} - Section A`,
          name_rw: `${trade.name_rw} - Icyiciro A`,
          trade_code: `${tradeCode}-A`,
          level: tradeCode.substring(0, 2),
          section: 'A',
          capacity: 30
        });
        
        classesData.push({
          name: `${trade.name} - Section B`,
          name_rw: `${trade.name_rw} - Icyiciro B`,
          trade_code: `${tradeCode}-B`,
          level: tradeCode.substring(0, 2),
          section: 'B',
          capacity: 30
        });
      } else {
        classesData.push({
          name: trade.name,
          name_rw: trade.name_rw,
          trade_code: tradeCode,
          level: tradeCode.substring(0, 2),
          section: '',
          capacity: 30
        });
      }
    }

    // Insert classes
    for (const classData of classesData) {
      await connection.query(
        `INSERT INTO classes (name, name_rw, trade_code, level, section, capacity, current_enrollment) 
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [classData.name, classData.name_rw, classData.trade_code, classData.level, classData.section, classData.capacity]
      );
      console.log(`✅ Created class: ${classData.trade_code}`);
    }

    console.log('\n🎉 Successfully setup classes system!');
    console.log(`📊 Total Classes: ${classesData.length}`);
    console.log('\n📚 Structure:');
    console.log('   - SOD (L3, L4, L5): Single class each');
    console.log('   - BDC (L3, L4, L5): Single class each');
    console.log('   - AUTO L3: Single class');
    console.log('   - AUTO L4: Section A and B');
    console.log('   - AUTO L5: Section A and B');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

setupAutoClassesOnly();
