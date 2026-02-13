const mysql = require('mysql2/promise');

async function generateCellsAndVillages() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  console.log('🔄 Generating cells and villages for all sectors...\n');

  // Get all sectors
  const [sectors] = await conn.execute('SELECT id, name_rw, code FROM sectors ORDER BY id');
  
  let totalCells = 0;
  let totalVillages = 0;

  for (const sector of sectors) {
    // Generate 3-7 cells per sector (average 5)
    const cellCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 1; i <= cellCount; i++) {
      const cellName = `${sector.name_rw} ${i}`;
      const cellCode = `${sector.code}-C${i}`;
      
      const [cellResult] = await conn.execute(
        'INSERT INTO cells (sector_id, name_en, name_rw, code) VALUES (?, ?, ?, ?)',
        [sector.id, cellName, cellName, cellCode]
      );
      
      totalCells++;
      const cellId = cellResult.insertId;
      
      // Generate 3-8 villages per cell (average 5-6)
      const villageCount = Math.floor(Math.random() * 6) + 3;
      
      for (let j = 1; j <= villageCount; j++) {
        const villageName = `${cellName} - Umudugudu ${j}`;
        const villageCode = `${cellCode}-V${j}`;
        
        await conn.execute(
          'INSERT INTO villages (cell_id, name_en, name_rw, code) VALUES (?, ?, ?, ?)',
          [cellId, villageName, villageName, villageCode]
        );
        
        totalVillages++;
      }
    }
    
    if (sector.id % 50 === 0) {
      console.log(`✓ Processed ${sector.id} sectors...`);
    }
  }

  console.log('\n✅ Generation Complete!');
  console.log(`📊 Total Cells: ${totalCells}`);
  console.log(`📊 Total Villages: ${totalVillages}`);
  
  await conn.end();
}

generateCellsAndVillages().catch(console.error);
