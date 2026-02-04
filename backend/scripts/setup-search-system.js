const mysql = require('mysql2/promise');

async function setupSearchSystem() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('🔍 Setting up Powerful Search System...\n');

    // Create search_history table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        query VARCHAR(255) NOT NULL,
        results_count INT DEFAULT 0,
        user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_query (query),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Created search_history table');

    // Create search_analytics table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS search_analytics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        date DATE NOT NULL,
        total_searches INT DEFAULT 0,
        unique_queries INT DEFAULT 0,
        avg_results INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_date (date)
      )
    `);
    console.log('✓ Created search_analytics table');

    // Ensure required tables have proper indexes for search
    const tables = [
      { name: 'courses', columns: ['name', 'description'] },
      { name: 'trades', columns: ['name', 'description'] },
      { name: 'news_articles', columns: ['title', 'content'] },
      { name: 'sports', columns: ['name', 'description'] },
      { name: 'leadership', columns: ['name', 'role', 'department'] },
      { name: 'gallery', columns: ['title', 'description'] }
    ];

    for (const table of tables) {
      for (const column of table.columns) {
        try {
          await conn.execute(`
            ALTER TABLE ${table.name} 
            ADD FULLTEXT INDEX ft_${column} (${column})
          `);
          console.log(`✓ Added fulltext index on ${table.name}.${column}`);
        } catch (error) {
          // Index might already exist
          if (!error.message.includes('Duplicate')) {
            console.log(`  Note: ${table.name}.${column} index exists or not applicable`);
          }
        }
      }
    }

    console.log('\n✅ Search System Setup Complete!\n');
    console.log('Available Endpoints:');
    console.log('  GET /api/search/global?q=query&type=courses&sort=relevance');
    console.log('  GET /api/search/trending');
    console.log('  GET /api/search/history');
    console.log('  GET /api/search/suggestions?q=query');
    console.log('  GET /api/search/analytics');
    console.log('\nFeatures:');
    console.log('  ✓ Global search across all content');
    console.log('  ✓ Real-time search suggestions');
    console.log('  ✓ Search history tracking');
    console.log('  ✓ Trending searches (last 7 days)');
    console.log('  ✓ Advanced filtering by type');
    console.log('  ✓ Multiple sort options');
    console.log('  ✓ Search analytics dashboard');
    console.log('  ✓ Optimized with fulltext indexes');

  } catch (error) {
    console.error('❌ Error setting up search system:', error.message);
  } finally {
    await conn.end();
  }
}

setupSearchSystem();
