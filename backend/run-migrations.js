const { pool } = require('./config/database');
const fs = require('fs');

async function runMigrations() {
  try {
    console.log('Starting database migrations...\n');
    
    const sql = fs.readFileSync('./create-missing-tables.sql', 'utf8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE IF NOT EXISTS `(\w+)`/)?.[1];
        try {
          await pool.execute(statement);
          console.log(`✅ Created/verified table: ${tableName}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Error creating table ${tableName}:`, error.message);
          errorCount++;
        }
      } else if (statement.includes('INSERT')) {
        try {
          await pool.execute(statement);
          console.log(`✅ Inserted sample data`);
          successCount++;
        } catch (error) {
          if (!error.message.includes('Duplicate')) {
            console.error(`❌ Error inserting data:`, error.message);
            errorCount++;
          }
        }
      } else if (statement.includes('ALTER TABLE')) {
        const tableName = statement.match(/ALTER TABLE `(\w+)`/)?.[1];
        try {
          await pool.execute(statement);
          console.log(`✅ Added index to table: ${tableName}`);
          successCount++;
        } catch (error) {
          if (!error.message.includes('Duplicate')) {
            console.error(`⚠️  Warning for ${tableName}:`, error.message);
          }
        }
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Migration Summary:`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Verify created tables
    console.log('Verifying created tables...\n');
    const tables = [
      'teams', 'players', 'matches', 'tournaments',
      'testimonials', 'exam_schedules',
      'cafeteria_menu', 'cafeteria_orders',
      'knowledge_base_categories', 'knowledge_base_articles',
      'forum_categories', 'forum_topics', 'forum_replies',
      'clubs', 'club_members',
      'certificates', 'alumni', 'admissions'
    ];
    
    for (const table of tables) {
      try {
        const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ Table '${table}' exists with ${rows[0].count} rows`);
      } catch (error) {
        console.error(`❌ Table '${table}' not found or error:`, error.message);
      }
    }
    
    console.log('\n✅ All migrations completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    process.exit();
  }
}

runMigrations();
