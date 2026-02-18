@echo off
echo ========================================
echo GARDEN TVET - SYSTEM STATUS CHECK
echo ========================================
echo.

echo [1] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js installed
    node --version
) else (
    echo ❌ Node.js NOT installed
)
echo.

echo [2] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ npm installed
    npm --version
) else (
    echo ❌ npm NOT installed
)
echo.

echo [3] Checking Backend Dependencies...
cd /d "%~dp0backend"
if exist "node_modules\" (
    echo ✅ Backend dependencies installed
) else (
    echo ❌ Backend dependencies NOT installed
    echo    Run: cd backend && npm install
)
echo.

echo [4] Checking Frontend Dependencies...
cd /d "%~dp0"
if exist "node_modules\" (
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ Frontend dependencies NOT installed
    echo    Run: npm install
)
echo.

echo [5] Checking Backend Configuration...
cd /d "%~dp0backend"
if exist ".env" (
    echo ✅ Backend .env file exists
) else (
    echo ⚠️  Backend .env file NOT found
    echo    Copy .env.example to .env and configure
)
echo.

echo [6] Checking Database Connection...
cd /d "%~dp0backend"
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });
    console.log('✅ Database connection successful');
    console.log('   Database:', process.env.DB_NAME || 'school_management');
    await connection.end();
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('   Error:', error.message);
  }
}

checkDB();
" 2>nul
echo.

echo [7] Checking Key Files...
cd /d "%~dp0backend"
if exist "server.js" (
    echo ✅ Backend server.js exists
) else (
    echo ❌ Backend server.js NOT found
)

cd /d "%~dp0"
if exist "index.html" (
    echo ✅ Frontend index.html exists
) else (
    echo ❌ Frontend index.html NOT found
)

if exist "vite.config.ts" (
    echo ✅ Vite config exists
) else (
    echo ❌ Vite config NOT found
)
echo.

echo [8] Checking Port Availability...
netstat -ano | findstr ":5000" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Port 5000 (Backend) is IN USE
) else (
    echo ✅ Port 5000 (Backend) is available
)

netstat -ano | findstr ":5173" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Port 5173 (Frontend) is IN USE
) else (
    echo ✅ Port 5173 (Frontend) is available
)
echo.

echo ========================================
echo SYSTEM STATUS CHECK COMPLETE
echo ========================================
echo.
echo Next Steps:
echo 1. If dependencies missing: Run BUILD-AND-RUN-ALL.bat
echo 2. If everything ready: Run QUICK-START-SERVERS.bat
echo 3. To test APIs: Run TEST-ALL-APIS.bat
echo.
pause
