const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function fixLocationTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    // Check provinces structure
    const [provinceColumns] = await connection.execute('DESCRIBE provinces');
    console.log('Current provinces columns:', provinceColumns.map(c => c.Field).join(', '));
    
    // Add missing columns to provinces if needed
    const hasNameEn = provinceColumns.some(c => c.Field === 'name_en');
    if (!hasNameEn) {
      console.log('\nAdding name_en and name_rw columns to provinces...');
      await connection.execute('ALTER TABLE provinces ADD COLUMN name_en VARCHAR(100)');
      await connection.execute('ALTER TABLE provinces ADD COLUMN name_rw VARCHAR(100)');
      
      // Copy data from name column if it exists
      await connection.execute('UPDATE provinces SET name_en = name, name_rw = name WHERE name_en IS NULL');
      console.log('✅ Columns added\n');
    }
    
    // Check districts structure
    const [districtColumns] = await connection.execute('DESCRIBE districts');
    const hasDistrictNameEn = districtColumns.some(c => c.Field === 'name_en');
    if (!hasDistrictNameEn) {
      console.log('Adding name_en and name_rw columns to districts...');
      await connection.execute('ALTER TABLE districts ADD COLUMN name_en VARCHAR(100)');
      await connection.execute('ALTER TABLE districts ADD COLUMN name_rw VARCHAR(100)');
      await connection.execute('UPDATE districts SET name_en = name, name_rw = name WHERE name_en IS NULL');
      console.log('✅ Columns added\n');
    }
    
    // Check sectors structure
    const [sectorColumns] = await connection.execute('DESCRIBE sectors');
    const hasSectorNameEn = sectorColumns.some(c => c.Field === 'name_en');
    if (!hasSectorNameEn) {
      console.log('Adding name_en and name_rw columns to sectors...');
      await connection.execute('ALTER TABLE sectors ADD COLUMN name_en VARCHAR(100)');
      await connection.execute('ALTER TABLE sectors ADD COLUMN name_rw VARCHAR(100)');
      await connection.execute('UPDATE sectors SET name_en = name, name_rw = name WHERE name_en IS NULL');
      console.log('✅ Columns added\n');
    }
    
    console.log('========================================');
    console.log('✅ Location tables fixed successfully!');
    console.log('========================================');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
  }
}

fixLocationTables();
