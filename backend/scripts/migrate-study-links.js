const { pool } = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Running study_links table enhancement migration...');
    
    // Add new columns
    await pool.query(`
      ALTER TABLE study_links 
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general'
    `);
    
    await pool.query(`
      ALTER TABLE study_links 
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE
    `);
    
    await pool.query(`
      ALTER TABLE study_links 
      ADD COLUMN IF NOT EXISTS tags TEXT
    `);
    
    await pool.query(`
      ALTER TABLE study_links 
      ADD COLUMN IF NOT EXISTS click_count INT DEFAULT 0
    `);
    
    await pool.query(`
      ALTER TABLE study_links 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    
    await pool.query(`
      ALTER TABLE study_links 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
    
    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_study_links_category ON study_links(category)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_study_links_featured ON study_links(is_featured)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_study_links_teacher ON study_links(teacher_id)`);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();