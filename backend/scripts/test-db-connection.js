#!/usr/bin/env node

const mysql = require('mysql2');
require('dotenv').config();

const testConnection = async () => {
  console.log('Testing database connection...');
  console.log('Configuration:');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Password: ${process.env.DB_PASSWORD ? '[SET]' : '[EMPTY]'}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`Port: ${process.env.DB_PORT}`);

  try {
    // First try to connect without database to create it if needed
    const connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
    });

    const promiseConnection = connection.promise();
    
    // Test basic connection
    await promiseConnection.execute('SELECT 1');
    console.log('✅ Basic connection successful');

    // Create database if it doesn't exist
    await promiseConnection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('✅ Database created/verified');

    // Now connect to the specific database
    const dbConnection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    const promiseDbConnection = dbConnection.promise();
    await promiseDbConnection.execute('SELECT 1');
    console.log('✅ Database connection successful');

    await promiseConnection.end();
    await promiseDbConnection.end();
    
    console.log('✅ All database connections working properly');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    
    // Suggest solutions
    console.log('\n🔧 Possible solutions:');
    console.log('1. Make sure MySQL is installed and running');
    console.log('2. Check if the MySQL service is started');
    console.log('3. Verify the database credentials in .env file');
    console.log('4. Try running: npm run setup-db (if available)');
    
    process.exit(1);
  }
};

testConnection();