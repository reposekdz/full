const mysql = require('mysql2/promise');
const rwandaData = require('../data/rwanda-locations-complete');

// Import frontend data structure for cells and villages
const {
  RWANDA_PROVINCES_LIST,
  RWANDA_DISTRICTS_BY_PROVINCE,
  RWANDA_SECTORS_BY_DISTRICT,
  RWANDA_CELLS_BY_SECTOR,
  RWANDA_VILLAGES_BY_CELL
} = require('../../src/app/data/rwandaLocations');

async function seedRwandaLocations() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('Connected to database');
    console.log('Starting Rwanda locations seed...\n');

    // Clear existing data
    console.log('Clearing existing location data...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE villages');
    await connection.execute('TRUNCATE TABLE cells');
    await connection.execute('TRUNCATE TABLE sectors');
    await connection.execute('TRUNCATE TABLE districts');
    await connection.execute('TRUNCATE TABLE provinces');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Cleared existing data\n');

    // Insert Provinces
    console.log('Inserting provinces...');
    const provinceMap = {};
    const provinces = [
      { name_en: 'Kigali City', name_rw: 'Umujyi wa Kigali', code: 'KG' },
      { name_en: 'Eastern Province', name_rw: 'Intara y\'Iburasirazuba', code: 'EA' },
      { name_en: 'Northern Province', name_rw: 'Intara y\'Amajyaruguru', code: 'NO' },
      { name_en: 'Southern Province', name_rw: 'Intara y\'Amajyepfo', code: 'SO' },
      { name_en: 'Western Province', name_rw: 'Intara y\'Iburengerazuba', code: 'WE' }
    ];

    for (const province of provinces) {
      const [result] = await connection.execute(
        'INSERT INTO provinces (name_en, name_rw, code) VALUES (?, ?, ?)',
        [province.name_en, province.name_rw, province.code]
      );
      provinceMap[province.name_en] = result.insertId;
      console.log(`  ✓ ${province.name_en}`);
    }
    console.log(`✓ Inserted ${provinces.length} provinces\n`);

    // Insert Districts
    console.log('Inserting districts...');
    const districtMap = {};
    let districtCount = 0;

    for (const [provinceName, districts] of Object.entries(RWANDA_DISTRICTS_BY_PROVINCE)) {
      const provinceId = provinceMap[provinceName];
      if (!provinceId) continue;

      for (const districtName of districts) {
        const [result] = await connection.execute(
          'INSERT INTO districts (province_id, name_en, name_rw, code) VALUES (?, ?, ?, ?)',
          [provinceId, districtName, districtName, districtName.substring(0, 3).toUpperCase()]
        );
        districtMap[districtName] = result.insertId;
        districtCount++;
      }
      console.log(`  ✓ ${provinceName}: ${districts.length} districts`);
    }
    console.log(`✓ Inserted ${districtCount} districts\n`);

    // Insert Sectors
    console.log('Inserting sectors...');
    const sectorMap = {};
    let sectorCount = 0;

    for (const [districtName, sectors] of Object.entries(RWANDA_SECTORS_BY_DISTRICT)) {
      const districtId = districtMap[districtName];
      if (!districtId) continue;

      for (const sectorName of sectors) {
        const [result] = await connection.execute(
          'INSERT INTO sectors (district_id, name_en, name_rw, code) VALUES (?, ?, ?, ?)',
          [districtId, sectorName, sectorName, `${districtName.substring(0, 2)}${sectorName.substring(0, 2)}`.toUpperCase()]
        );
        sectorMap[`${districtName}|${sectorName}`] = result.insertId;
        sectorCount++;
      }
      console.log(`  ✓ ${districtName}: ${sectors.length} sectors`);
    }
    console.log(`✓ Inserted ${sectorCount} sectors\n`);

    // Insert Cells
    console.log('Inserting cells...');
    const cellMap = {};
    let cellCount = 0;

    for (const [sectorKey, cells] of Object.entries(RWANDA_CELLS_BY_SECTOR)) {
      const sectorId = sectorMap[sectorKey];
      if (!sectorId) continue;

      for (const cellName of cells) {
        const [result] = await connection.execute(
          'INSERT INTO cells (sector_id, name_en, name_rw, code) VALUES (?, ?, ?, ?)',
          [sectorId, cellName, cellName, `${sectorKey.split('|')[0].substring(0, 1)}${cellName.substring(0, 3)}`.toUpperCase()]
        );
        cellMap[`${sectorKey}|${cellName}`] = result.insertId;
        cellCount++;
      }
    }
    console.log(`✓ Inserted ${cellCount} cells\n`);

    // Insert Villages
    console.log('Inserting villages...');
    let villageCount = 0;

    for (const [cellKey, villages] of Object.entries(RWANDA_VILLAGES_BY_CELL)) {
      const cellId = cellMap[cellKey];
      if (!cellId) continue;

      for (const villageName of villages) {
        await connection.execute(
          'INSERT INTO villages (cell_id, name_en, name_rw, code) VALUES (?, ?, ?, ?)',
          [cellId, villageName, villageName, `${cellKey.split('|')[0].substring(0, 1)}${villageName.substring(0, 3)}`.toUpperCase()]
        );
        villageCount++;
      }
    }
    console.log(`✓ Inserted ${villageCount} villages\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('Rwanda Locations Seed Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`Provinces: ${provinces.length}`);
    console.log(`Districts: ${districtCount}`);
    console.log(`Sectors: ${sectorCount}`);
    console.log(`Cells: ${cellCount}`);
    console.log(`Villages: ${villageCount}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('Error seeding Rwanda locations:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  seedRwandaLocations()
    .then(() => {
      console.log('\n✓ Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Seed failed:', error);
      process.exit(1);
    });
}

module.exports = seedRwandaLocations;
