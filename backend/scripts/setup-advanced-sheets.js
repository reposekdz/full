const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupAdvancedStudentSheets() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
    multipleStatements: true
  });

  try {
    console.log('Setting up advanced student sheets...');

    // Read and execute schema
    const schema = fs.readFileSync(
      path.join(__dirname, '../migrations/advanced_student_sheets.sql'),
      'utf8'
    );
    
    await connection.query(schema);
    console.log('✓ Tables created successfully');

    // Add sample columns for testing
    const sampleColumns = [
      { trade: 'SOD', level: 3, name: 'Math Marks', type: 'number', calc: 'none' },
      { trade: 'SOD', level: 3, name: 'Science Marks', type: 'number', calc: 'none' },
      { trade: 'SOD', level: 3, name: 'Total', type: 'number', calc: 'formula', formula: '{Math Marks} + {Science Marks}' },
      { trade: 'SOD', level: 3, name: 'Average', type: 'number', calc: 'formula', formula: '({Math Marks} + {Science Marks}) / 2' },
      { trade: 'BDC', level: 4, name: 'Attendance %', type: 'percentage', calc: 'none' },
      { trade: 'AUT', level: 5, name: 'Practical Score', type: 'number', calc: 'none' }
    ];

    for (const col of sampleColumns) {
      await connection.query(
        `INSERT INTO student_custom_columns 
         (trade_code, level_number, level_suffix, column_name, column_type, calculation_type, formula) 
         VALUES (?, ?, '', ?, ?, ?, ?)`,
        [col.trade, col.level, col.name, col.type, col.calc, col.formula || null]
      );
    }
    console.log('✓ Sample columns added');

    console.log('\n✅ Advanced Student Sheets setup complete!');
    console.log('\nFeatures enabled:');
    console.log('- Dynamic column creation');
    console.log('- Formula calculations (SUM, AVG, custom)');
    console.log('- Auto-calculations');
    console.log('- Action logging');
    console.log('- Bulk updates');

  } catch (error) {
    console.error('Error setting up:', error);
  } finally {
    await connection.end();
  }
}

setupAdvancedStudentSheets();
