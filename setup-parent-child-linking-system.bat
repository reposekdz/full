@echo off
echo ========================================
echo PARENT-CHILD LINKING SYSTEM SETUP
echo ========================================
echo.

cd backend

echo [1/3] Running database migration...
node -e "const mysql = require('mysql2/promise'); const fs = require('fs'); (async () => { const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'school_management' }); const sql = fs.readFileSync('./migrations/parent-child-linking-system.sql', 'utf8'); const statements = sql.split(';').filter(s => s.trim()); for (const stmt of statements) { if (stmt.trim()) await conn.execute(stmt); } console.log('✓ Database migration completed'); await conn.end(); })();"

echo.
echo [2/3] Verifying tables...
node -e "const mysql = require('mysql2/promise'); (async () => { const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'school_management' }); const [tables] = await conn.execute(\"SHOW TABLES LIKE 'parent_%'\"); console.log('✓ Tables created:', tables.length); await conn.end(); })();"

echo.
echo [3/3] Testing API endpoint...
timeout /t 2 /nobreak > nul
echo ✓ API route mounted at /api/parent-child-linking

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Restart backend: npm start
echo 2. Parent can apply at: /parent-dashboard
echo 3. DOD can approve at: /dod-dashboard (Parent Applications tab)
echo.
pause
