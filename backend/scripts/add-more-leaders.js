const mysql = require('mysql2/promise');
require('dotenv').config();

async function addMoreLeaders() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('🔧 Adding more leaders...');

    const newLeaders = [
      {
        name: 'Habimana Emmanuel',
        role: 'Patron w\'Ishuri',
        department: 'Ubuyobozi Bukuru',
        biography_rw: `Habimana Emmanuel ni Patron w'Ishuri rya Garden TVET School, umuyobozi ukomeye ufite uburambe bw'imyaka 20+ mu kuyobora amashuri n'amashyirahamwe mu Rwanda. Afite inshingano zo gufasha umuyobozi mukuru mu kuyobora ishuri, gutanga ubujyanama, no gufatanya n'abafatanyabikorwa.`,
        email: 'patron@garden-tvet.rw',
        phone: '+250 788 567 890',
        office_location: 'Ibiro bya Patron, Ikibanza 1',
        qualifications: JSON.stringify(['PhD mu Buyobozi', 'Masters mu Uburezi', 'Bachelor mu Economics']),
        experience_years: 20,
        specialization: 'Ubuyobozi n\'Ubujyanama',
        achievements: JSON.stringify(['Yafashe ishuri 10+ guteza imbere', 'Yaronse ibihembo 15+ by\'ubuyobozi']),
        responsibilities: JSON.stringify(['Gufasha umuyobozi mukuru', 'Gutanga ubujyanama', 'Gufatanya n\'abafatanyabikorwa']),
        office_hours: 'Ku wa mbere - Ku wa gatanu: 9:00 - 16:00'
      },
      {
        name: 'Uwera Claudine',
        role: 'Umujyanama w\'Ishuri',
        department: 'Ubujyanama',
        biography_rw: `Uwera Claudine ni Umujyanama w'Ishuri muri Garden TVET School, umujyanama ukomeye ufite uburambe bw'imyaka 10+ mu gutanga ubujyanama ku bayobozi b'amashuri. Afite inshingano zo gutanga ubujyanama ku bayobozi, gufasha mu gukemura ibibazo, no guteza imbere ishuri.`,
        email: 'advisor@garden-tvet.rw',
        phone: '+250 788 678 901',
        office_location: 'Ibiro by\'Ubujyanama, Ikibanza 2',
        qualifications: JSON.stringify(['Masters mu Counseling', 'Bachelor mu Psychology', 'Icyemezo cy\'Ubujyanama']),
        experience_years: 10,
        specialization: 'Ubujyanama bw\'Amashuri',
        achievements: JSON.stringify(['Yafashe amashuri 20+ guteza imbere', 'Yaronse ibihembo by\'ubujyanama']),
        responsibilities: JSON.stringify(['Gutanga ubujyanama', 'Gufasha mu gukemura ibibazo', 'Guteza imbere ishuri']),
        office_hours: 'Ku wa mbere - Ku wa gatanu: 8:00 - 17:00'
      }
    ];

    for (const leader of newLeaders) {
      await connection.query(
        `INSERT INTO leadership (name, role, department, biography_rw, email, phone, 
         office_location, qualifications, experience_years, specialization, 
         achievements, responsibilities, office_hours) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leader.name, leader.role, leader.department, leader.biography_rw,
          leader.email, leader.phone, leader.office_location, leader.qualifications,
          leader.experience_years, leader.specialization, leader.achievements,
          leader.responsibilities, leader.office_hours
        ]
      );
    }

    console.log('✅ New leaders added successfully!');

  } catch (error) {
    console.error('❌ Error adding leaders:', error);
  } finally {
    await connection.end();
  }
}

addMoreLeaders();
