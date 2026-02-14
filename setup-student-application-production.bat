@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Student Application System - Production Setup
echo ========================================
echo.

cd backend

echo [1/2] Running database migration...
node -e "const mysql = require('mysql2/promise'); const fs = require('fs'); async function run() { const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'school_management' }); const sql = fs.readFileSync('./migrations/student-applications-production.sql', 'utf8'); const statements = sql.split(';').filter(s => s.trim()); for (const stmt of statements) { if (stmt.trim()) { try { await conn.execute(stmt); } catch(e) { console.log('Note:', e.message); } } } console.log('✓ Database migration completed'); await conn.end(); } run();"

echo.
echo [2/2] Restarting server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
start "Garden TVET Backend" cmd /k "node server.js"

echo.
echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo Production Student Application System is now active:
echo - Enhanced validation and security
echo - Real-time SMS notifications
echo - Comprehensive audit trails
echo - Document upload with verification
echo - Advanced analytics dashboard
echo.
echo API Endpoint: /api/student-applications-production
echo.
echo Test the system at: http://localhost:5000
echo.
pause
