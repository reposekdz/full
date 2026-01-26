const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    multipleStatements: true
  });

  try {
    console.log('Running migrations...');
    
    // Read and execute migration
    const fs = require('fs');
    const path = require('path');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'create_search_and_news_tables.sql'),
      'utf8'
    );
    
    await connection.query(migrationSQL);
    console.log('✓ Tables created/updated successfully');

    // Insert sample news articles if table is empty
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM news_articles');
    if (existing[0].count === 0) {
      console.log('Inserting sample news articles...');
      await connection.query(`
        INSERT INTO news_articles (title, description, content, image_url, author, category, date_published, is_featured, views, likes) VALUES
        ('Team Yikigo Celebrates Victory', 'Our sports team achieved remarkable success in the regional championship', 
         '<p>In an outstanding display of teamwork and dedication, our school sports team has secured first place in the regional championship...</p>', 
         '/uploads/news/team yikigo.jpg', 'Sports Department', 'Sports', CURDATE(), true, 245, 89),
        
        ('Ibiganiro Hagati - Community Dialogue', 'Important community meeting discussing school development', 
         '<p>The school community gathered for an important dialogue session to discuss future development plans and student welfare...</p>', 
         '/uploads/news/ibiganiro hagati.jpg', 'Administration', 'Events', CURDATE(), false, 156, 42),
        
        ('Inama Nyishi - Leadership Council Meeting', 'Strategic planning session with school leadership', 
         '<p>The leadership council convened to discuss strategic initiatives for the upcoming academic year...</p>', 
         '/uploads/news/inama nyishi.jpg', 'Leadership Team', 'Administration', CURDATE(), false, 198, 67),
        
        ('Kuganirizwa Nabayobozi - Guidance from Leaders', 'Inspirational session with school administrators', 
         '<p>Students received valuable guidance and mentorship from school leaders in a special assembly...</p>', 
         '/uploads/news/kuganirizwa nabayobozi.jpg', 'Student Affairs', 'Education', CURDATE(), true, 312, 124),
        
        ('Mubihe Byogukora Ibizamin - Exam Preparation', 'Important information about upcoming examinations', 
         '<p>As we approach the examination period, here are important guidelines and tips for students...</p>', 
         '/uploads/news/mubihe byogukora ibizamin.jpg', 'Academic Department', 'Education', CURDATE(), false, 421, 156)
      `);
      console.log('✓ Sample news articles inserted');
    }

    console.log('✓ All migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await connection.end();
  }
}

runMigrations();
