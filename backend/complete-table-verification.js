const { pool } = require('./config/database');

async function completeVerification() {
  try {
    console.log('Final verification of all tables...\n');
    console.log('='.repeat(70));
    
    const tables = [
      'teams', 'players', 'matches', 'tournaments',
      'testimonials', 'exam_schedules',
      'cafeteria_menu', 'cafeteria_orders',
      'knowledge_base_categories', 'knowledge_base_articles',
      'forum_categories', 'forum_topics', 'forum_replies',
      'clubs', 'club_members',
      'certificates', 'alumni', 'admissions'
    ];
    
    const results = [];
    
    for (const table of tables) {
      try {
        const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        results.push({
          table: table,
          status: '✅ EXISTS',
          rows: rows[0].count
        });
      } catch (error) {
        results.push({
          table: table,
          status: '❌ MISSING',
          rows: 0
        });
      }
    }
    
    console.log('\n📊 DATABASE TABLES STATUS:\n');
    results.forEach(r => {
      console.log(`${r.status}  ${r.table.padEnd(35)} - ${r.rows} rows`);
    });
    
    const existingTables = results.filter(r => r.status === '✅ EXISTS').length;
    const totalTables = tables.length;
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ Database ready: ${existingTables}/${totalTables} tables (${((existingTables/totalTables)*100).toFixed(1)}%)`);
    console.log(`${'='.repeat(70)}\n`);
    
    if (existingTables === totalTables) {
      console.log('🎉 All required tables are created and ready!');
    } else {
      console.log(`⚠️  ${totalTables - existingTables} tables still need attention`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

completeVerification();
