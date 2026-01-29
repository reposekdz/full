const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupPaymentProofs() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Connected to database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'migrations', 'payment_proofs_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schema);
    console.log('✅ Payment proofs table created successfully');

    // Create upload directory
    const uploadDir = path.join(__dirname, 'uploads', 'payment-proofs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Upload directory created');
    }

    console.log('\n🎉 Payment Proof System setup completed successfully!');
    console.log('\n📝 Features:');
    console.log('  - Parents can submit payment proofs with images');
    console.log('  - Accountants can view and verify submissions');
    console.log('  - Automatic notifications');
    console.log('  - Status tracking (pending, verified, rejected, processed)');
    console.log('  - Statistics and analytics');

  } catch (error) {
    console.error('❌ Error setting up payment proofs:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupPaymentProofs();
