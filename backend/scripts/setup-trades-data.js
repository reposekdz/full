const mysql = require('mysql2/promise');

async function setupTradesData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Checking trades table...');
    
    // Check if data exists
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM trades');
    
    if (existing[0].count === 0) {
      console.log('Inserting trades data...');
      
      const trades = [
        {
          code: 'SOD',
          name: 'Software Development',
          description_rw: 'Kwiga gukora software, website n\'application zitandukanye. Ushobora kuba software developer, web developer cyangwa mobile app developer.',
          description_en: 'Learn to create software, websites and various applications. You can become a software developer, web developer or mobile app developer.',
          description_fr: 'Apprenez à créer des logiciels, des sites Web et diverses applications. Vous pouvez devenir développeur de logiciels, développeur Web ou développeur d\'applications mobiles.',
          duration: '24 months',
          requirements_rw: 'Diploma y\'amashuri yisumbuye, Ubumenyi bw\'ikoranabuhanga, Gukunda gukora software',
          requirements_en: 'High school diploma, Technology knowledge, Passion for software development',
          requirements_fr: 'Diplôme d\'études secondaires, Connaissances technologiques, Passion pour le développement de logiciels',
          career_prospects_rw: 'Software Developer, Web Developer, Mobile App Developer, Database Administrator, System Analyst',
          career_prospects_en: 'Software Developer, Web Developer, Mobile App Developer, Database Administrator, System Analyst',
          career_prospects_fr: 'Développeur de logiciels, Développeur Web, Développeur d\'applications mobiles, Administrateur de base de données, Analyste de systèmes',
          image_url: 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=1080'
        },
        {
          code: 'BDC',
          name: 'Building Construction',
          description_rw: 'Kwiga kubaka inzu, amazu n\'ibindi byubakwa. Ushobora kuba mason, carpenter, plumber cyangwa electrician.',
          description_en: 'Learn to build houses, buildings and other structures. You can become a mason, carpenter, plumber or electrician.',
          description_fr: 'Apprenez à construire des maisons, des bâtiments et d\'autres structures. Vous pouvez devenir maçon, charpentier, plombier ou électricien.',
          duration: '24 months',
          requirements_rw: 'Diploma y\'amashuri yisumbuye, Imbaraga z\'umubiri, Gukunda kubaka',
          requirements_en: 'High school diploma, Physical strength, Passion for construction',
          requirements_fr: 'Diplôme d\'études secondaires, Force physique, Passion pour la construction',
          career_prospects_rw: 'Mason, Carpenter, Plumber, Electrician, Construction Manager',
          career_prospects_en: 'Mason, Carpenter, Plumber, Electrician, Construction Manager',
          career_prospects_fr: 'Maçon, Charpentier, Plombier, Électricien, Gestionnaire de construction',
          image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1080'
        },
        {
          code: 'AUTO',
          name: 'Automotive Technology',
          description_rw: 'Kwiga gusana imodoka, amapikipiki n\'ibindi bikoresho. Ushobora kuba mechanic, auto electrician cyangwa diagnostic technician.',
          description_en: 'Learn to repair cars, motorcycles and other vehicles. You can become a mechanic, auto electrician or diagnostic technician.',
          description_fr: 'Apprenez à réparer des voitures, des motos et d\'autres véhicules. Vous pouvez devenir mécanicien, électricien automobile ou technicien en diagnostic.',
          duration: '24 months',
          requirements_rw: 'Diploma y\'amashuri yisumbuye, Ubumenyi bw\'ikoranabuhanga, Gukunda imodoka',
          requirements_en: 'High school diploma, Technology knowledge, Passion for automobiles',
          requirements_fr: 'Diplôme d\'études secondaires, Connaissances technologiques, Passion pour les automobiles',
          career_prospects_rw: 'Auto Mechanic, Auto Electrician, Diagnostic Technician, Service Manager, Workshop Owner',
          career_prospects_en: 'Auto Mechanic, Auto Electrician, Diagnostic Technician, Service Manager, Workshop Owner',
          career_prospects_fr: 'Mécanicien automobile, Électricien automobile, Technicien en diagnostic, Gestionnaire de service, Propriétaire d\'atelier',
          image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1080'
        }
      ];

      for (const trade of trades) {
        await connection.query(
          `INSERT INTO trades (code, name, description_rw, description_en, description_fr, 
           duration, requirements_rw, requirements_en, requirements_fr, 
           career_prospects_rw, career_prospects_en, career_prospects_fr, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            trade.code, trade.name, trade.description_rw, trade.description_en, trade.description_fr,
            trade.duration, trade.requirements_rw, trade.requirements_en, trade.requirements_fr,
            trade.career_prospects_rw, trade.career_prospects_en, trade.career_prospects_fr, trade.image_url
          ]
        );
      }
      
      console.log('✓ Trades data inserted successfully!');
    } else {
      console.log('✓ Trades data already exists');
    }

    console.log('✓ Trades setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupTradesData().catch(console.error);
