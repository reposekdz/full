const mysql = require('mysql2/promise');

async function importCellsAndVillages() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Sample cells for each sector (you can expand this with full data)
    const sampleCells = ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4'];
    const sampleVillages = ['Village A', 'Village B', 'Village C', 'Village D', 'Village E'];

    const [sectors] = await connection.execute('SELECT id, name FROM rwanda_sectors');
    
    let totalCells = 0;
    let totalVillages = 0;

    for (const sector of sectors) {
      // Insert cells for each sector
      for (let i = 0; i < sampleCells.length; i++) {
        const cellName = `${sampleCells[i]}`;
        const [result] = await connection.execute(
          'INSERT IGNORE INTO rwanda_cells (sector_id, name) VALUES (?, ?)',
          [sector.id, cellName]
        );
        
        if (result.affectedRows > 0) {
          totalCells++;
          const cellId = result.insertId;

          // Insert villages for each cell
          for (const villageName of sampleVillages) {
            await connection.execute(
              'INSERT IGNORE INTO rwanda_villages (cell_id, name) VALUES (?, ?)',
              [cellId, villageName]
            );
            totalVillages++;
          }
        }
      }
    }

    console.log(`✓ ${totalCells} cells and ${totalVillages} villages inserted`);
    console.log('Note: This is sample data. Add complete cell/village data to rwanda-locations-complete.js');
  } catch (error) {
    console.error('Error importing cells/villages:', error.message);
  } finally {
    await connection.end();
  }
}

importCellsAndVillages();
