const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupStockSystem() {
  console.log('🚀 Setting up Advanced Stock Management System...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'garden_tvet_db',
    multipleStatements: true
  });

  try {
    console.log('📊 Running database migrations...');
    const sqlPath = path.join(__dirname, 'migrations', 'stock-ultra-comprehensive.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await connection.query(sql);
    console.log('✅ Database tables created successfully');
    console.log('✅ Sample data inserted');

    console.log('\n📝 Registering API routes...');
    const serverPath = path.join(__dirname, 'server.js');
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (!serverContent.includes('stock-advanced-api')) {
      const routeImport = "const stockAdvancedApi = require('./routes/stock-advanced-api');\n";
      const routeUse = "app.use('/api/stock-advanced-api', stockAdvancedApi);\n";
      
      serverContent = serverContent.replace(
        /(const.*require.*routes.*\n)/,
        `$1${routeImport}`
      );
      
      serverContent = serverContent.replace(
        /(app\.use\('\/api\/.*\n)/,
        `$1${routeUse}`
      );
      
      fs.writeFileSync(serverPath, serverContent);
      console.log('✅ API routes registered in server.js');
    } else {
      console.log('ℹ️  API routes already registered');
    }

    console.log('\n✅ Stock Management System setup complete!');
    console.log('\n📋 Summary:');
    console.log('   - 8 Categories created');
    console.log('   - 5 Locations created');
    console.log('   - 4 Suppliers created');
    console.log('   - 10 Sample items added');
    console.log('\n🌐 API Endpoint: http://localhost:5000/api/stock-advanced-api');
    console.log('📱 Frontend: /dashboards/advanced-stock');
    console.log('\n⚠️  Please restart the backend server: cd backend && npm start');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupStockSystem().catch(console.error);
