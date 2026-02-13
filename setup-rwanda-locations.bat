@echo off
echo ========================================
echo Rwanda Locations System Setup
echo ========================================
echo.

echo [0/4] Checking dependencies...
if not exist "node_modules\mysql2" (
    echo Installing dependencies...
    npm install
) else (
    echo ✓ Dependencies already installed
)
echo.

echo [1/4] Creating database schema...
node -e "const mysql=require('mysql2/promise');(async()=>{const c=await mysql.createConnection({host:'localhost',user:'root',password:'',database:'school_management'});await c.execute('CREATE TABLE IF NOT EXISTS rwanda_provinces(id INT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(100) NOT NULL UNIQUE,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');await c.execute('CREATE TABLE IF NOT EXISTS rwanda_districts(id INT PRIMARY KEY AUTO_INCREMENT,province_id INT NOT NULL,name VARCHAR(100) NOT NULL,FOREIGN KEY(province_id)REFERENCES rwanda_provinces(id),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');await c.execute('CREATE TABLE IF NOT EXISTS rwanda_sectors(id INT PRIMARY KEY AUTO_INCREMENT,district_id INT NOT NULL,name VARCHAR(100) NOT NULL,FOREIGN KEY(district_id)REFERENCES rwanda_districts(id),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');await c.execute('CREATE TABLE IF NOT EXISTS rwanda_cells(id INT PRIMARY KEY AUTO_INCREMENT,sector_id INT NOT NULL,name VARCHAR(100) NOT NULL,FOREIGN KEY(sector_id)REFERENCES rwanda_sectors(id),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');await c.execute('CREATE TABLE IF NOT EXISTS rwanda_villages(id INT PRIMARY KEY AUTO_INCREMENT,cell_id INT NOT NULL,name VARCHAR(100) NOT NULL,FOREIGN KEY(cell_id)REFERENCES rwanda_cells(id),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');console.log('✓ Tables created');await c.end()})();"

echo [2/4] Inserting provinces and districts...
node -e "const mysql=require('mysql2/promise');(async()=>{const c=await mysql.createConnection({host:'localhost',user:'root',password:'',database:'school_management'});await c.execute('INSERT IGNORE INTO rwanda_provinces(name)VALUES(\"Kigali\"),(\"Eastern\"),(\"Northern\"),(\"Southern\"),(\"Western\")');const districts=[['Kigali',['Gasabo','Kicukiro','Nyarugenge']],['Eastern',['Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Nyagatare','Rwamagana']],['Northern',['Burera','Gakenke','Gicumbi','Musanze','Rulindo']],['Southern',['Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango']],['Western',['Karongi','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rusizi','Rutsiro']]];for(const[p,d]of districts){const[r]=await c.execute('SELECT id FROM rwanda_provinces WHERE name=?',[p]);const pid=r[0].id;for(const n of d)await c.execute('INSERT IGNORE INTO rwanda_districts(province_id,name)VALUES(?,?)',[pid,n])}console.log('✓ Provinces and districts inserted');await c.end()})();"

echo [2.5/4] Inserting ALL sectors (416 sectors)...
node backend\scripts\import-sectors.js

echo [2.6/4] Inserting sample cells and villages...
node backend\scripts\import-cells-villages.js

echo [3/4] Creating import scripts...
node -e "const fs=require('fs');fs.mkdirSync('backend/scripts',{recursive:true});"

echo [3.5/4] Creating API endpoints...
(
echo const express = require^('express'^);
echo const router = express.Router^(^);
echo const db = require^('../config/database'^);
echo.
echo router.get^('/provinces', async ^(req, res^) =^> {
echo   try {
echo     const [provinces] = await db.execute^('SELECT * FROM rwanda_provinces ORDER BY name'^);
echo     res.json^({ success: true, data: provinces }^);
echo   } catch ^(error^) {
echo     res.status^(500^).json^({ success: false, message: error.message }^);
echo   }
echo }^);
echo.
echo router.get^('/districts/:provinceId', async ^(req, res^) =^> {
echo   try {
echo     const [districts] = await db.execute^('SELECT * FROM rwanda_districts WHERE province_id=? ORDER BY name', [req.params.provinceId]^);
echo     res.json^({ success: true, data: districts }^);
echo   } catch ^(error^) {
echo     res.status^(500^).json^({ success: false, message: error.message }^);
echo   }
echo }^);
echo.
echo router.get^('/sectors/:districtId', async ^(req, res^) =^> {
echo   try {
echo     const [sectors] = await db.execute^('SELECT * FROM rwanda_sectors WHERE district_id=? ORDER BY name', [req.params.districtId]^);
echo     res.json^({ success: true, data: sectors }^);
echo   } catch ^(error^) {
echo     res.status^(500^).json^({ success: false, message: error.message }^);
echo   }
echo }^);
echo.
echo router.get^('/cells/:sectorId', async ^(req, res^) =^> {
echo   try {
echo     const [cells] = await db.execute^('SELECT * FROM rwanda_cells WHERE sector_id=? ORDER BY name', [req.params.sectorId]^);
echo     res.json^({ success: true, data: cells }^);
echo   } catch ^(error^) {
echo     res.status^(500^).json^({ success: false, message: error.message }^);
echo   }
echo }^);
echo.
echo router.get^('/villages/:cellId', async ^(req, res^) =^> {
echo   try {
echo     const [villages] = await db.execute^('SELECT * FROM rwanda_villages WHERE cell_id=? ORDER BY name', [req.params.cellId]^);
echo     res.json^({ success: true, data: villages }^);
echo   } catch ^(error^) {
echo     res.status^(500^).json^({ success: false, message: error.message }^);
echo   }
echo }^);
echo.
echo module.exports = router;
) > backend\routes\rwanda-locations.js

echo [4/4] Registering routes in server.js...
echo.
echo ✓ Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Add to server.js:
echo    const rwandaLocations = require^('./routes/rwanda-locations'^);
echo    app.use^('/api/rwanda-locations', rwandaLocations^);
echo.
echo 2. Use in forms:
echo    GET /api/rwanda-locations/provinces
echo    GET /api/rwanda-locations/districts/:provinceId
echo    GET /api/rwanda-locations/sectors/:districtId
echo    GET /api/rwanda-locations/cells/:sectorId
echo    GET /api/rwanda-locations/villages/:cellId
echo.
echo 3. Restart server: npm run dev
echo ========================================
pause
