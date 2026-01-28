const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function fixAllTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'school_management',
    multipleStatements: true
  });

  console.log('✅ Connected to database\n');

  try {
    // Fix testimonials
    console.log('📝 Fixing testimonials table...');
    const testimonialsSql = fs.readFileSync(
      path.join(__dirname, '../migrations/fix_testimonials.sql'),
      'utf8'
    );
    await connection.query(testimonialsSql);
    console.log('✅ Testimonials table fixed\n');

    // Fix admission and sports
    console.log('📝 Fixing admission and sports tables...');
    const admissionSportsSql = fs.readFileSync(
      path.join(__dirname, '../migrations/fix_admission_sports.sql'),
      'utf8'
    );
    await connection.query(admissionSportsSql);
    console.log('✅ Admission and sports tables fixed\n');

    console.log('✅ All tables fixed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixAllTables();
