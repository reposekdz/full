const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function fixDOS() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.query('DELETE FROM school_leadership WHERE name = ?', ['MASEZERANO Isaac']);
    console.log('✅ Old record deleted');

    const bio = `MASEZERANO Isaac ni Umuyobozi w'Amasomo (Director of Studies - DOS) muri Garden TVET School. Afite uburambe bukomeye mu gucunga amasomo n'iterambere ry'abanyeshuri mu by'ubumenyi.

INSHINGANO ZE: Gucunga amasomo yose, Gukora gahunda y'amasomo, Gukurikirana abarimu, Gukurikirana iterambere ry'abanyeshuri, Gutegura ibizamini, Gukora raporo z'amasomo.

UBUMENYI: Master's Degree in Education Management, Bachelor's Degree in Education, 18 years experience.`;

    await connection.query(`
      INSERT INTO school_leadership (name, role, department, bio, image_url, email, phone, office_location, responsibilities, qualifications, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'MASEZERANO Isaac',
      'Umuyobozi w\'Amasomo (DOS)',
      'Academic Affairs',
      bio,
      '/uploads/leadership/masezerano-isaac.jpeg',
      'masezerano.isaac@garden-tvet.rw',
      '+250 788 567 890',
      'DOS Office, Administration Block',
      JSON.stringify(['Gucunga amasomo', 'Gukora gahunda', 'Gukurikirana abarimu', 'Gutegura ibizamini']),
      JSON.stringify(['Masters in Education', 'Bachelors in Education', '18 years experience']),
      3,
      true
    ]);

    console.log('✅ DOS record created successfully');
    console.log('Name: MASEZERANO Isaac');
    console.log('Role: Umuyobozi w\'Amasomo (Director of Studies - DOS)');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixDOS();
