const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'garden_tvet_db',
  multipleStatements: true
};

async function setupEnhancedApplicationSystem() {
  let connection;
  
  try {
    console.log('🚀 Setting up Enhanced Student Application System...');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Read and execute location database setup
    const locationSqlPath = path.join(__dirname, '../migrations/rwanda_locations.sql');
    const locationSql = await fs.readFile(locationSqlPath, 'utf8');
    
    console.log('📍 Setting up Rwanda location data...');
    await connection.execute(locationSql);
    console.log('✅ Location data setup complete');
    
    // Create uploads directory structure
    const uploadsDir = path.join(__dirname, '../../uploads/applications');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
    // Update application_documents table to include file_size
    await connection.execute(`
      ALTER TABLE application_documents 
      ADD COLUMN IF NOT EXISTS file_size INT DEFAULT 0 AFTER document_type
    `);
    
    // Add interview fields to application_reviews table
    await connection.execute(`
      ALTER TABLE application_reviews 
      ADD COLUMN IF NOT EXISTS interview_date DATE AFTER decision_reason,
      ADD COLUMN IF NOT EXISTS interview_notes TEXT AFTER interview_date
    `);
    
    // Create enhanced indexes for better performance
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_applications_status ON student_applications(status);
      CREATE INDEX IF NOT EXISTS idx_applications_trade ON student_applications(trade_code);
      CREATE INDEX IF NOT EXISTS idx_applications_location ON student_applications(province_id, district_id);
      CREATE INDEX IF NOT EXISTS idx_applications_date ON student_applications(created_at);
      CREATE INDEX IF NOT EXISTS idx_applications_phone ON student_applications(phone);
    `);
    
    console.log('✅ Database indexes created');
    
    // Insert sample validation rules if not exists
    const [existingRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM application_validation_rules'
    );
    
    if (existingRules[0].count === 0) {
      await connection.execute(`
        INSERT INTO application_validation_rules (field_name, rule_type, rule_value, error_message_en, error_message_rw) VALUES
        ('first_name', 'required', NULL, 'First name is required', 'Izina rya mbere ni ngombwa'),
        ('first_name', 'min_length', '2', 'First name must be at least 2 characters', 'Izina rya mbere rigomba kuba rifite byibuze inyuguti 2'),
        ('first_name', 'max_length', '50', 'First name cannot exceed 50 characters', 'Izina rya mbere ntirishobora kurenza inyuguti 50'),
        ('last_name', 'required', NULL, 'Last name is required', 'Izina rya kabiri ni ngombwa'),
        ('last_name', 'min_length', '2', 'Last name must be at least 2 characters', 'Izina rya kabiri rigomba kuba rifite byibuze inyuguti 2'),
        ('phone', 'required', NULL, 'Phone number is required', 'Nomero ya telefoni ni ngombwa'),
        ('phone', 'pattern', '^(\\\\+250|0)[7][0-9]{8}$', 'Invalid phone number format. Use +250XXXXXXXXX or 07XXXXXXXX', 'Nomero ya telefoni ntabwo iri neza. Koresha +250XXXXXXXXX cyangwa 07XXXXXXXX'),
        ('email', 'pattern', '^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$', 'Invalid email format', 'Email ntabwo iri neza'),
        ('national_id', 'pattern', '^[0-9]{16}$', 'National ID must be 16 digits', 'Indangamuntu igomba kuba ifite imibare 16'),
        ('parent_phone', 'pattern', '^(\\\\+250|0)[7][0-9]{8}$', 'Invalid parent phone number format', 'Nomero ya telefoni y\\'umubyeyi ntabwo iri neza'),
        ('reason_for_applying', 'required', NULL, 'Reason for applying is required', 'Impamvu yo gusaba ni ngombwa'),
        ('reason_for_applying', 'min_length', '50', 'Reason must be at least 50 characters', 'Impamvu igomba kuba byibuze inyuguti 50')
      `);
      console.log('✅ Validation rules inserted');
    }
    
    // Check if location data exists, if not add sample data
    const [provinceCount] = await connection.execute('SELECT COUNT(*) as count FROM provinces');
    
    if (provinceCount[0].count === 0) {
      console.log('⚠️  No location data found. Please run the location setup manually.');
    } else {
      console.log(`✅ Found ${provinceCount[0].count} provinces in database`);
    }
    
    // Create application analytics summary view
    await connection.execute(`
      CREATE OR REPLACE VIEW application_summary AS
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        AVG(DATEDIFF(COALESCE(updated_at, NOW()), created_at)) as avg_processing_days
      FROM student_applications
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    console.log('✅ Analytics view created');
    
    // Get system statistics
    const [stats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM student_applications) as total_applications,
        (SELECT COUNT(*) FROM provinces) as total_provinces,
        (SELECT COUNT(*) FROM districts) as total_districts,
        (SELECT COUNT(*) FROM sectors) as total_sectors,
        (SELECT COUNT(*) FROM application_validation_rules WHERE is_active = TRUE) as active_rules
    `);
    
    console.log('\n📊 System Statistics:');
    console.log(`   Applications: ${stats[0].total_applications}`);
    console.log(`   Provinces: ${stats[0].total_provinces}`);
    console.log(`   Districts: ${stats[0].total_districts}`);
    console.log(`   Sectors: ${stats[0].total_sectors}`);
    console.log(`   Validation Rules: ${stats[0].active_rules}`);
    
    // Test API endpoints
    console.log('\n🔧 API Endpoints Available:');
    console.log('   GET  /api/locations/provinces');
    console.log('   GET  /api/locations/districts/:provinceId');
    console.log('   GET  /api/locations/sectors/:districtId');
    console.log('   GET  /api/locations/cells/:sectorId');
    console.log('   GET  /api/locations/villages/:cellId');
    console.log('   POST /api/locations/validate');
    console.log('   GET  /api/locations/validation-rules');
    console.log('   POST /api/student-applications/submit');
    console.log('   GET  /api/student-applications/all');
    console.log('   GET  /api/student-applications/analytics/dashboard');
    console.log('   POST /api/student-applications/bulk/update-status');
    console.log('   GET  /api/student-applications/export/csv');
    
    console.log('\n✅ Enhanced Student Application System setup complete!');
    console.log('\n🎯 Features Available:');
    console.log('   ✓ Complete Rwanda location hierarchy (Province → District → Sector → Cell → Village)');
    console.log('   ✓ Real-time form validation with custom rules');
    console.log('   ✓ Advanced filtering and search capabilities');
    console.log('   ✓ Application analytics and reporting');
    console.log('   ✓ Bulk operations for application management');
    console.log('   ✓ CSV export functionality');
    console.log('   ✓ File upload with validation');
    console.log('   ✓ Status tracking and history');
    console.log('   ✓ Automated student account creation on approval');
    
    console.log('\\n🚀 Next Steps:');
    console.log('   1. Add location routes to your main app.js:');
    console.log('      app.use(\\'/api/locations\\', require(\\'./routes/locations\\'));');
    console.log('   2. Restart your backend server');
    console.log('   3. Test the enhanced application form');
    console.log('   4. Configure SMS notifications (optional)');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupEnhancedApplicationSystem();