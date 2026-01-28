const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
  });

  console.log('🚀 Starting Unified Advanced Features Migration...');

  try {
    // 1. DOD - Expulsions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_expulsions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        reason TEXT NOT NULL,
        effective_date DATE NOT NULL,
        notes TEXT,
        status ENUM('active', 'revoked', 'completed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table student_expulsions ensured');

    // 2. DOD - Punishments (Add student_id)
    const [punishmentCols] = await connection.query('DESCRIBE punishments');
    if (!punishmentCols.find(c => c.Field === 'student_id')) {
      await connection.query('ALTER TABLE punishments ADD COLUMN student_id INT AFTER case_id, ADD FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE');
      console.log('✅ Added student_id to punishments');
    }

    // 3. DOD - Leaves (Sync ENUMs and columns)
    await connection.query(`
      ALTER TABLE student_leaves 
      MODIFY COLUMN leave_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS start_date DATE,
      ADD COLUMN IF NOT EXISTS end_date DATE
    `);
    console.log('✅ Updated student_leaves schema');

    // 4. Student - Achievements (Add points and date_earned)
    const [achCol] = await connection.query('DESCRIBE student_achievements');
    if (!achCol.find(c => c.Field === 'points')) {
      await connection.query('ALTER TABLE student_achievements ADD COLUMN points INT DEFAULT 0 AFTER description');
    }
    if (!achCol.find(c => c.Field === 'date_earned')) {
      await connection.query('ALTER TABLE student_achievements ADD COLUMN date_earned TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER achievement_date');
    }
    console.log('✅ Updated student_achievements schema');

    // 5. Student - Points (Ensure consistency)
    await connection.query(`
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
    console.log('✅ Table student_points ensured');

    // 6. Accountant - Fee Payments (Sync with accountant-advanced.js)
    const [feeCols] = await connection.query('DESCRIBE fee_payments');
    if (!feeCols.find(c => c.Field === 'academic_year_id')) {
      await connection.query('ALTER TABLE fee_payments ADD COLUMN academic_year_id INT AFTER student_id');
    }
    if (!feeCols.find(c => c.Field === 'term')) {
      await connection.query('ALTER TABLE fee_payments ADD COLUMN term VARCHAR(20) AFTER academic_year_id');
    }
    if (!feeCols.find(c => c.Field === 'total_amount')) {
      await connection.query('ALTER TABLE fee_payments ADD COLUMN total_amount DECIMAL(15,2) DEFAULT 0 AFTER term');
    }
    if (!feeCols.find(c => c.Field === 'paid_amount')) {
      await connection.query('ALTER TABLE fee_payments ADD COLUMN paid_amount DECIMAL(15,2) DEFAULT 0 AFTER total_amount');
    }
    if (!feeCols.find(c => c.Field === 'remaining_amount')) {
      await connection.query('ALTER TABLE fee_payments ADD COLUMN remaining_amount DECIMAL(15,2) DEFAULT 0 AFTER paid_amount');
    }
    if (!feeCols.find(c => c.Field === 'transaction_code')) {
      await connection.query('ALTER TABLE fee_payments ADD COLUMN transaction_code VARCHAR(100) AFTER remaining_amount');
    }
    console.log('✅ Updated fee_payments schema for Advanced Accountant features');

    // 7. Teacher Materials - Ensure file_type exists
    const [matCols] = await connection.query('DESCRIBE teacher_materials');
    if (!matCols.find(c => c.Field === 'file_type')) {
      await connection.query('ALTER TABLE teacher_materials ADD COLUMN file_type VARCHAR(100) AFTER file_path');
      console.log('✅ Added file_type to teacher_materials');
    }

    console.log('\n✨ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
