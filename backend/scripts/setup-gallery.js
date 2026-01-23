const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupGallery() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Connected to database');

    // Create gallery_images table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL DEFAULT 'Campus Image',
        title_rw VARCHAR(255) DEFAULT 'Ifoto y Ikigo',
        description TEXT,
        description_rw TEXT,
        image_url VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_sort (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Gallery table created successfully');

    // Insert sample images
    await connection.execute(`
      INSERT IGNORE INTO gallery_images (id, title, title_rw, description, description_rw, image_url, sort_order) VALUES
      (1, 'Main Campus Building', 'Inyubako Nkuru', 'Our modern main building', 'Inyubako yacu nshya', '/uploads/gallery/image1.jpg', 1),
      (2, 'Computer Lab', 'Laboratoire ya Mudasobwa', 'State-of-the-art computer lab', 'Laboratoire igezweho', '/uploads/gallery/image2.jpg', 2),
      (3, 'Library', 'Isomero', 'Well-stocked library', 'Isomero ryuzuye ibitabo', '/uploads/gallery/image3.jpg', 3),
      (4, 'Sports Field', 'Terrain ya Siporo', 'Modern sports facilities', 'Ibikoresho bya siporo bigezweho', '/uploads/gallery/image4.jpg', 4)
    `);

    console.log('✅ Sample gallery images inserted');
    console.log('\n🎉 Gallery setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Admin can upload images via Admin Dashboard');
    console.log('   2. Images will appear on homepage gallery section');
    console.log('   3. Gallery section: "Itegereze Ikigo cya Garden TVET School"');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupGallery();
