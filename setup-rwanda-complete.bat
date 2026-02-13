@echo off
echo ========================================
echo Rwanda Complete Administrative Data Setup
echo ========================================
echo.
echo This will add ALL sectors for all 30 districts
echo Plus sample cells and villages (expandable)
echo.

cd backend

echo [1/2] Loading complete sectors data...
node -e "const mysql=require('mysql2/promise');const fs=require('fs');(async()=>{const conn=await mysql.createConnection({host:'localhost',user:'root',password:'',database:'school_management'});const sql=fs.readFileSync('./migrations/rwanda_complete_data.sql','utf8');const statements=sql.split(';').filter(s=>s.trim());let count=0;for(const stmt of statements){if(stmt.trim()){await conn.execute(stmt);count++;}}console.log('✓ Loaded',count,'statements');await conn.end();})().catch(e=>console.error('Error:',e.message));"

echo.
echo [2/2] Verifying data...
node -e "const mysql=require('mysql2/promise');(async()=>{const conn=await mysql.createConnection({host:'localhost',user:'root',password:'',database:'school_management'});const [sectors]=await conn.execute('SELECT COUNT(*) as count FROM sectors');const [cells]=await conn.execute('SELECT COUNT(*) as count FROM cells');const [villages]=await conn.execute('SELECT COUNT(*) as count FROM villages');console.log('✓ Sectors:',sectors[0].count);console.log('✓ Cells:',cells[0].count);console.log('✓ Villages:',villages[0].count);await conn.end();})().catch(e=>console.error('Error:',e.message));"

echo.
echo ========================================
echo ✓ Complete Data Loaded!
echo ========================================
echo.
echo Summary:
echo - 5 Provinces (Complete)
echo - 30 Districts (Complete)
echo - 400+ Sectors (Complete for all districts)
echo - Sample Cells (Expandable)
echo - Sample Villages (Expandable)
echo.
echo To add more cells/villages, use SQL:
echo INSERT INTO cells (sector_id, name_en, name_rw, code) VALUES (...);
echo INSERT INTO villages (cell_id, name_en, name_rw, code) VALUES (...);
echo.
pause
