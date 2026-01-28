const { pool } = require('./config/database');

async function fixCafeteriaTable() {
  try {
    // Drop and recreate cafeteria_menu table with correct structure
    console.log('Fixing cafeteria_menu table...\n');
    
    await pool.execute('DROP TABLE IF EXISTS cafeteria_menu');
    
    await pool.execute(`
      CREATE TABLE cafeteria_menu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        category ENUM('breakfast', 'lunch', 'dinner', 'snacks', 'beverages') NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2),
        image_url VARCHAR(500),
        ingredients JSON,
        allergens JSON,
        nutritional_info JSON,
        is_available BOOLEAN DEFAULT TRUE,
        is_vegetarian BOOLEAN DEFAULT FALSE,
        is_halal BOOLEAN DEFAULT TRUE,
        preparation_time_minutes INT,
        serving_size VARCHAR(100),
        stock_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_available (is_available)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ cafeteria_menu table recreated');
    
    // Insert sample data
    await pool.execute(`
      INSERT INTO cafeteria_menu (item_name, category, description, price, is_available) VALUES
      ('Breakfast Combo', 'breakfast', 'Eggs, bread, and tea', 1500.00, TRUE),
      ('Rice and Beans', 'lunch', 'Traditional Rwandan meal', 2000.00, TRUE),
      ('Chapati and Beef', 'lunch', 'Chapati with beef stew', 2500.00, TRUE),
      ('Fruit Juice', 'beverages', 'Fresh fruit juice', 500.00, TRUE),
      ('Samosa', 'snacks', 'Vegetable samosa', 300.00, TRUE)
    `);
    
    console.log('✅ Sample menu items inserted\n');
    
    const [rows] = await pool.execute('SELECT * FROM cafeteria_menu');
    console.log(`Total menu items: ${rows.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

fixCafeteriaTable();
