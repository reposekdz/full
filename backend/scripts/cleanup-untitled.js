const mysql = require('mysql2/promise');

async function cleanupUntitledArticles() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management'
    });

    console.log('Connected to database...');

    const [result] = await connection.execute(
      'DELETE FROM news_articles WHERE title IS NULL OR title = "" OR title = "Untitled"'
    );

    console.log(`✅ Deleted ${result.affectedRows} untitled articles`);

    const [count] = await connection.execute('SELECT COUNT(*) as total FROM news_articles');
    console.log(`📰 Remaining articles: ${count[0].total}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

cleanupUntitledArticles();
