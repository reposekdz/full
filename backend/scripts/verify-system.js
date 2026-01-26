const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

async function verifySystem() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 SYSTEM VERIFICATION - DEPLOYMENT READINESS CHECK');
  console.log('='.repeat(80) + '\n');

  let connection;
  const results = {
    database: { passed: 0, failed: 0 },
    apis: { passed: 0, failed: 0 }
  };

  try {
    // 1. DATABASE VERIFICATION
    console.log('📊 DATABASE VERIFICATION\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Database connection successful\n');

    const tables = [
      'hero_slides', 'news_articles', 'sports', 'sport_teams', 'sport_players',
      'sport_coaches', 'sport_achievements', 'leadership', 'trades', 'developers',
      'courses', 'gallery_images', 'events', 'testimonials', 'users', 'admin_users'
    ];

    console.log('Checking tables...\n');
    for (const table of tables) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ??`, [table]);
        console.log(`✅ ${table.padEnd(25)} - ${rows[0].count} records`);
        results.database.passed++;
      } catch (error) {
        console.log(`❌ ${table.padEnd(25)} - NOT FOUND`);
        results.database.failed++;
      }
    }

    // 2. API VERIFICATION
    console.log('\n\n🔌 API ENDPOINTS VERIFICATION\n');
    console.log('Testing API endpoints...\n');

    const endpoints = [
      { name: 'Health Check', url: '/health' },
      { name: 'Hero Slides', url: '/sports-hero/hero-slides' },
      { name: 'News Articles', url: '/news' },
      { name: 'Sports', url: '/content-management/sports' },
      { name: 'Teams', url: '/sports-hero/teams' },
      { name: 'Players', url: '/sports-hero/players' },
      { name: 'Coaches', url: '/sports-hero/coaches' },
      { name: 'Achievements', url: '/sports-hero/achievements' },
      { name: 'Leadership', url: '/content-management/leadership' },
      { name: 'Trades', url: '/content-management/trades' },
      { name: 'Developers', url: '/content-management/developers' },
      { name: 'Courses', url: '/unified-content/courses' },
      { name: 'Gallery', url: '/unified-content/gallery' },
      { name: 'Events', url: '/unified-content/events' },
      { name: 'Testimonials', url: '/unified-content/testimonials' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint.url}`, { timeout: 5000 });
        const count = Array.isArray(response.data) ? response.data.length : 'OK';
        console.log(`✅ ${endpoint.name.padEnd(25)} - ${count} items`);
        results.apis.passed++;
      } catch (error) {
        console.log(`❌ ${endpoint.name.padEnd(25)} - ${error.message}`);
        results.apis.failed++;
      }
    }

    // 3. FILE SYSTEM VERIFICATION
    console.log('\n\n📁 FILE SYSTEM VERIFICATION\n');
    const fs = require('fs');
    const path = require('path');

    const uploadDirs = [
      'uploads/content',
      'uploads/news',
      'uploads/sports',
      'uploads/hero',
      'uploads/profiles'
    ];

    console.log('Checking upload directories...\n');
    for (const dir of uploadDirs) {
      const dirPath = path.join(__dirname, '..', dir);
      if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}`);
      } else {
        console.log(`⚠️  ${dir} - Creating...`);
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ ${dir} - Created`);
      }
    }

    // 4. SUMMARY
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(80) + '\n');

    console.log(`Database Tables: ${results.database.passed}/${results.database.passed + results.database.failed} passed`);
    console.log(`API Endpoints:   ${results.apis.passed}/${results.apis.passed + results.apis.failed} passed`);

    const totalPassed = results.database.passed + results.apis.passed;
    const totalTests = results.database.passed + results.database.failed + results.apis.passed + results.apis.failed;
    const percentage = ((totalPassed / totalTests) * 100).toFixed(1);

    console.log(`\nOverall:         ${totalPassed}/${totalTests} (${percentage}%)`);

    if (percentage >= 90) {
      console.log('\n✅ SYSTEM STATUS: PRODUCTION READY 🚀');
    } else if (percentage >= 70) {
      console.log('\n⚠️  SYSTEM STATUS: NEEDS ATTENTION');
    } else {
      console.log('\n❌ SYSTEM STATUS: NOT READY');
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    console.log('\nMake sure:');
    console.log('1. MySQL server is running');
    console.log('2. Database credentials are correct in .env');
    console.log('3. Backend server is running (npm start)');
    console.log('4. All setup scripts have been run\n');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifySystem();
