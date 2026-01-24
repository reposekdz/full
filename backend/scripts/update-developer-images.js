const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function updateDeveloperImages() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Update each developer with their real image path
    await connection.query(`
      UPDATE developer_team SET image_url = '/uploads/developers/niyonkuru reponse.jpg'
      WHERE name = 'Niyonkuru Reponse'
    `);

    await connection.query(`
      UPDATE developer_team SET image_url = '/uploads/developers/musoni mugisha yves.jpg'
      WHERE name = 'Musoni Mugisha Yves'
    `);

    await connection.query(`
      UPDATE developer_team SET image_url = '/uploads/developers/zamiru yazid surayiman.JPG'
      WHERE name = 'Zamilu Yazid Surayman'
    `);

    await connection.query(`
      UPDATE developer_team SET image_url = '/uploads/developers/niyonsenga frank.JPG'
      WHERE name = 'Niyonsenga Frank'
    `);

    console.log('✅ Developer images updated successfully!');
    console.log('\nUpdated images:');
    console.log('- Niyonkuru Reponse: /uploads/developers/niyonkuru reponse.jpg');
    console.log('- Musoni Mugisha Yves: /uploads/developers/musoni mugisha yves.jpg');
    console.log('- Zamilu Yazid Surayman: /uploads/developers/zamiru yazid surayiman.JPG');
    console.log('- Niyonsenga Frank: /uploads/developers/niyonsenga frank.JPG');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

updateDeveloperImages();
