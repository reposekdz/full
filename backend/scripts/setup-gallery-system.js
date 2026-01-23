const mysql = require('mysql2/promise');

async function setupGallerySystem() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Creating gallery_images table...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        title_rw VARCHAR(255),
        description TEXT,
        description_rw TEXT,
        category ENUM('campus', 'classroom', 'lab', 'sports', 'events', 'other') DEFAULT 'campus',
        image_url VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active),
        INDEX idx_sort (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Gallery system setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupGallerySystem().catch(console.error);
