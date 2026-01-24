const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function cleanDevelopers() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Check current records
    const [current] = await connection.query('SELECT id, name, image_url FROM developer_team ORDER BY id');
    console.log('\n📋 Current Records:');
    current.forEach(dev => console.log(`  ID ${dev.id}: ${dev.name} - ${dev.image_url || 'NO IMAGE'}`));

    // Delete all records
    await connection.query('DELETE FROM developer_team');
    console.log('\n🗑️  All records deleted');

    // Insert clean records with correct images
    await connection.query(`
      INSERT INTO developer_team (name, name_rw, role, role_rw, description_rw, image_url, email, phone, github_url, linkedin_url, skills, achievements, sort_order) VALUES
      (
        'Niyonkuru Reponse', 'Niyonkuru Reponse',
        'Team Owner & System Development Manager', 'Umuyobozi w''Itsinda & Umuyobozi w''Iterambere rya Sisitemu',
        'Niyonkuru Reponse ni umuyobozi mukuru w''itsinda ry''abatunganyije sisitemu ikomeye yo gucunga ishuri.',
        '/uploads/developers/niyonkuru reponse.jpg',
        'reponse@garden-tvet.rw', '+250 788 123 456',
        'https://github.com/niyonkuru-reponse', 'https://linkedin.com/in/niyonkuru-reponse',
        '["React","TypeScript","Node.js","MySQL"]', '["Best Developer 2025"]', 1
      ),
      (
        'Musoni Mugisha Yves', 'Musoni Mugisha Yves',
        'Asset Tracker & Innovation Specialist', 'Umukurikirana w''Umutungo & Inzobere mu Guhanga Udushya',
        'Musoni Mugisha Yves ni inzobere mu gukurikirana umutungo n''uguhanga udushya.',
        '/uploads/developers/musoni mugisha yves.jpg',
        'yves@garden-tvet.rw', '+250 788 234 567',
        'https://github.com/musoni-yves', 'https://linkedin.com/in/musoni-yves',
        '["Innovation","Testing","Documentation"]', '["Innovation Award 2025"]', 2
      ),
      (
        'Zamilu Yazid Surayman', 'Zamilu Yazid Surayman',
        'Secretary & Data Gathering Specialist', 'Umunyamabanga & Inzobere mu Gukusanya Amakuru',
        'Zamilu Yazid Surayman ni umunyamabanga w''itsinda kandi ni inzobere mu gukusanya amakuru.',
        '/uploads/developers/zamiru yazid surayiman.JPG',
        'yazid@garden-tvet.rw', '+250 788 345 678',
        'https://github.com/zamilu-yazid', 'https://linkedin.com/in/zamilu-yazid',
        '["Data Analysis","Research","Documentation"]', '["Best Analyst 2025"]', 3
      ),
      (
        'Niyonsenga Frank', 'Niyonsenga Frank',
        'Team Representative & Advisor', 'Uhagarariye Itsinda & Umujyanama',
        'Niyonsenga Frank ni uhagarariye itsinda kandi ni umujyanama.',
        '/uploads/developers/niyonsenga frank.JPG',
        'frank@garden-tvet.rw', '+250 788 456 789',
        'https://github.com/niyonsenga-frank', 'https://linkedin.com/in/niyonsenga-frank',
        '["Leadership","Communication","Advisory"]', '["Leadership Award 2025"]', 4
      )
    `);

    console.log('\n✅ Clean records inserted');

    // Verify
    const [final] = await connection.query('SELECT id, name, image_url FROM developer_team ORDER BY sort_order');
    console.log('\n📋 Final Records:');
    final.forEach(dev => console.log(`  ID ${dev.id}: ${dev.name} - ${dev.image_url}`));

    console.log('\n🎉 Database cleaned successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

cleanDevelopers();
