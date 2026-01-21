#!/usr/bin/env node

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
  let connection;
  
  try {
    console.log('\n🔧 Setting up database schema...\n');
    
    // First connect without database to create it
    connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    const promiseConnection = connection.promise();
    
    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await promiseConnection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created/verified`);

    await promiseConnection.end();

    // Now connect directly to the database
    connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    const dbConnection = connection.promise();
    console.log(`✅ Connected to database '${process.env.DB_NAME}'`);

    // Read and execute the comprehensive schema
    const schemaPath = path.join(__dirname, 'comprehensive-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Applying comprehensive database schema...');
    await dbConnection.execute(schemaSQL);
    console.log('✅ Database schema applied successfully');

    await dbConnection.end();
    console.log('\n✅ Database setup complete!\n');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    if (connection) {
      try {
        await connection.promise().end();
      } catch (e) {
        // Connection might already be closed
      }
    }
    process.exit(1);
  }
};

setupDatabase();