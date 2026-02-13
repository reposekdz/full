const mysql = require('mysql2/promise');
const data = require('../data/rwanda-locations-complete');

async function importSectors() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    let totalSectors = 0;
    
    for (const [districtName, sectors] of Object.entries(data.sectors)) {
      const [districtRows] = await connection.execute(
        'SELECT id FROM rwanda_districts WHERE name = ?',
        [districtName]
      );

      if (districtRows.length > 0) {
        const districtId = districtRows[0].id;
        
        for (const sectorName of sectors) {
          await connection.execute(
            'INSERT IGNORE INTO rwanda_sectors (district_id, name) VALUES (?, ?)',
            [districtId, sectorName]
          );
          totalSectors++;
        }
      }
    }

    console.log(`✓ ${totalSectors} sectors inserted successfully`);
  } catch (error) {
    console.error('Error importing sectors:', error.message);
  } finally {
    await connection.end();
  }
}

importSectors();
