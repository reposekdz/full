const { pool } = require('./config/database');
const fs = require('fs');

async function runOptimization() {
  try {
    console.log('Starting database optimization...\n');
    console.log('='.repeat(70));
    
    const sql = fs.readFileSync('./optimize-database.sql', 'utf8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (statement.includes('ALTER TABLE')) {
        const tableName = statement.match(/ALTER TABLE (\w+)/)?.[1];
        try {
          await pool.execute(statement);
          console.log(`✅ Optimized table: ${tableName}`);
          successCount++;
        } catch (error) {
          if (error.message.includes('Duplicate key name') || error.message.includes('already exists')) {
            console.log(`⏭️  Skipped (already exists): ${tableName}`);
            skipCount++;
          } else if (error.message.includes("doesn't exist")) {
            console.log(`⚠️  Table not found: ${tableName}`);
            errorCount++;
          } else {
            console.log(`⚠️  Error optimizing ${tableName}: ${error.message}`);
            errorCount++;
          }
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('Optimization Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    console.log(`⚠️  Errors: ${errorCount}`);
    console.log('='.repeat(70));
    
    // Show table statistics
    console.log('\n📊 Table Statistics:\n');
    
    const tables = [
      'users', 'grades', 'attendance', 'messages', 'assignments',
      'payments', 'enrollments', 'discipline_cases', 'support_tickets',
      'contact_submissions', 'leadership', 'library_books', 'stock_items',
      'teams', 'testimonials', 'exam_schedules', 'cafeteria_menu',
      'forum_topics', 'knowledge_base_articles', 'clubs', 'certificates', 'alumni'
    ];
    
    for (const table of tables) {
      try {
        const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const [indexInfo] = await pool.execute(`SHOW INDEX FROM ${table}`);
        const uniqueIndexes = [...new Set(indexInfo.map(idx => idx.Key_name))].length;
        
        console.log(`${table.padEnd(30)} | ${String(rows[0].count).padStart(6)} rows | ${uniqueIndexes} indexes`);
      } catch (error) {
        // Table doesn't exist, skip
      }
    }
    
    console.log('\n✅ Database optimization completed!\n');
    
  } catch (error) {
    console.error('Optimization error:', error.message);
  } finally {
    process.exit();
  }
}

runOptimization();
