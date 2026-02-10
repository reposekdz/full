const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function updateAUTLevels() {
  let connection;
  
  try {
    console.log('🚀 Updating AUT trade levels...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Remove existing AUT levels
    await connection.execute('DELETE FROM trade_levels WHERE trade_code = "AUT"');
    console.log('✅ Cleared existing AUT levels');
    
    // Insert updated AUT levels with sub-levels
    const autLevels = [
      // Level 3
      { 
        trade_code: 'AUT', 
        level_number: 3, 
        sub_level: null,
        name: 'Certificate Level 3', 
        description: 'Basic automotive maintenance and repair fundamentals', 
        duration_months: 12, 
        prerequisites: 'Secondary education certificate' 
      },
      
      // Level 4 with sub-levels
      { 
        trade_code: 'AUT', 
        level_number: 4, 
        sub_level: 'A',
        name: 'Certificate Level 4A', 
        description: 'Advanced automotive diagnostics and engine systems', 
        duration_months: 12, 
        prerequisites: 'Level 3 or equivalent experience' 
      },
      { 
        trade_code: 'AUT', 
        level_number: 4, 
        sub_level: 'B',
        name: 'Certificate Level 4B', 
        description: 'Advanced automotive electrical and electronic systems', 
        duration_months: 12, 
        prerequisites: 'Level 3 or equivalent experience' 
      },
      
      // Level 5 with sub-levels
      { 
        trade_code: 'AUT', 
        level_number: 5, 
        sub_level: 'A',
        name: 'Diploma Level 5A', 
        description: 'Automotive technology management and business operations', 
        duration_months: 12, 
        prerequisites: 'Level 4A or 4B completion' 
      },
      { 
        trade_code: 'AUT', 
        level_number: 5, 
        sub_level: 'B',
        name: 'Diploma Level 5B', 
        description: 'Advanced automotive engineering and innovation', 
        duration_months: 12, 
        prerequisites: 'Level 4A or 4B completion' 
      }
    ];
    
    // Add sub_level column if it doesn't exist
    try {
      await connection.execute('ALTER TABLE trade_levels ADD COLUMN sub_level VARCHAR(5) NULL AFTER level_number');
      console.log('✅ Added sub_level column');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Sub_level column may already exist');
      }
    }
    
    // Insert new AUT levels
    for (const level of autLevels) {
      await connection.execute(`
        INSERT INTO trade_levels (trade_code, level_number, sub_level, name, description, duration_months, prerequisites, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [level.trade_code, level.level_number, level.sub_level, level.name, level.description, level.duration_months, level.prerequisites]);
    }
    
    console.log('✅ Inserted updated AUT levels');
    
    // Update unique constraint to include sub_level
    try {
      await connection.execute('ALTER TABLE trade_levels DROP INDEX unique_trade_level');
      await connection.execute('ALTER TABLE trade_levels ADD UNIQUE KEY unique_trade_level (trade_code, level_number, sub_level)');
      console.log('✅ Updated unique constraint');
    } catch (error) {
      console.log('⚠️ Constraint update may have failed:', error.message);
    }
    
    // Verify the levels
    const [levels] = await connection.execute(`
      SELECT trade_code, level_number, sub_level, name, description
      FROM trade_levels 
      WHERE trade_code = 'AUT' 
      ORDER BY level_number, sub_level
    `);
    
    console.log('\n📊 Updated AUT Trade Levels:');
    levels.forEach(level => {
      const levelDisplay = level.sub_level ? `${level.level_number}${level.sub_level}` : level.level_number;
      console.log(`   Level ${levelDisplay}: ${level.name}`);
      console.log(`      ${level.description}`);
    });
    
    // Update sample applications to use new level format
    console.log('\n🔄 Updating sample applications...');
    
    // Add sub_level column to student_applications if it doesn't exist
    try {
      await connection.execute('ALTER TABLE student_applications ADD COLUMN sub_level VARCHAR(5) NULL AFTER level_number');
      console.log('✅ Added sub_level column to applications');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Sub_level column may already exist in applications');
      }
    }
    
    // Update existing AUT applications with sub-levels
    await connection.execute(`
      UPDATE student_applications 
      SET sub_level = CASE 
        WHEN level_number = 4 THEN 'A'
        WHEN level_number = 5 THEN 'A'
        ELSE NULL
      END
      WHERE trade_code = 'AUT' AND level_number IN (4, 5)
    `);
    
    // Add some new sample applications with different sub-levels
    const newApplications = [
      {
        application_number: 'APP2024007',
        first_name: 'David',
        last_name: 'Nkurunziza',
        date_of_birth: '2001-09-12',
        gender: 'Male',
        phone: '+250788777888',
        email: 'david.nkurunziza@email.com',
        address: 'Kigali, Gasabo',
        parent_name: 'Rose Nkurunziza',
        parent_phone: '+250788999000',
        previous_school: 'APACOPE Kigali',
        trade_code: 'AUT',
        level_number: 4,
        sub_level: 'B',
        reason_for_applying: 'I want to specialize in automotive electrical systems',
        status: 'pending'
      },
      {
        application_number: 'APP2024008',
        first_name: 'Sarah',
        last_name: 'Uwimana',
        date_of_birth: '2000-03-25',
        gender: 'Female',
        phone: '+250788111222',
        email: 'sarah.uwimana@email.com',
        address: 'Kigali, Kicukiro',
        parent_name: 'John Uwimana',
        parent_phone: '+250788333444',
        previous_school: 'Lycee Notre Dame',
        trade_code: 'AUT',
        level_number: 5,
        sub_level: 'B',
        reason_for_applying: 'I want to become an automotive engineer and innovator',
        status: 'under_review'
      }
    ];
    
    for (const app of newApplications) {
      await connection.execute(`
        INSERT IGNORE INTO student_applications (
          application_number, first_name, last_name, date_of_birth, gender, phone, email,
          address, parent_name, parent_phone, previous_school,
          trade_code, level_number, sub_level, reason_for_applying, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        app.application_number, app.first_name, app.last_name, app.date_of_birth, app.gender,
        app.phone, app.email, app.address, app.parent_name, app.parent_phone,
        app.previous_school, app.trade_code, app.level_number, app.sub_level, 
        app.reason_for_applying, app.status
      ]);
    }
    
    console.log('✅ Added sample applications with sub-levels');
    
    // Show final distribution
    const [appDist] = await connection.execute(`
      SELECT 
        trade_code, 
        level_number, 
        sub_level,
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT status) as statuses
      FROM student_applications
      WHERE trade_code = 'AUT'
      GROUP BY trade_code, level_number, sub_level
      ORDER BY level_number, sub_level
    `);
    
    console.log('\n📋 AUT Application Distribution:');
    appDist.forEach(row => {
      const levelDisplay = row.sub_level ? `${row.level_number}${row.sub_level}` : row.level_number;
      console.log(`   AUT Level ${levelDisplay}: ${row.count} applications (${row.statuses})`);
    });
    
    console.log('\n🎉 AUT levels updated successfully!');
    console.log('\n📚 AUT Trade Structure:');
    console.log('   Level 3: Basic automotive maintenance');
    console.log('   Level 4A: Advanced diagnostics and engines');
    console.log('   Level 4B: Advanced electrical systems');
    console.log('   Level 5A: Management and business');
    console.log('   Level 5B: Engineering and innovation');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

if (require.main === module) {
  updateAUTLevels()
    .then(() => {
      console.log('\n🎯 AUT levels update completed!');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = { updateAUTLevels };