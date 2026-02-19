const { pool } = require('../config/database');

async function checkServices() {
  try {
    console.log('Checking services in database...\n');
    
    const [services] = await pool.query('SELECT * FROM school_services WHERE is_active = true');
    
    console.log(`Found ${services.length} active services:\n`);
    
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name || service.name_rw}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   ID: ${service.id}`);
      console.log('');
    });
    
    if (services.length === 0) {
      console.log('⚠️  No services found in database!');
      console.log('Run setup-services.js or add-education-service.js to add services.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkServices();
