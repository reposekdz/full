@echo off
echo.
echo ========================================================================
echo   GARDEN TVET SCHOOL MANAGEMENT SYSTEM - PRODUCTION SERVER
echo ========================================================================
echo.

cd /d "%~dp0backend"

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo    Node.js: OK

echo.
echo [2/5] Checking dependencies...
if not exist "node_modules\" (
    echo    Installing dependencies...
    call npm install
) else (
    echo    Dependencies: OK
)

echo.
echo [3/5] Testing database connection...
node -e "const {pool}=require('./config/database');pool.getConnection().then(c=>{console.log('   Database: OK');c.release();pool.end();}).catch(e=>{console.log('   ERROR:',e.message);process.exit(1);})"
if errorlevel 1 (
    echo.
    echo ERROR: Database connection failed!
    echo Please check your .env file and MySQL server.
    pause
    exit /b 1
)

echo.
echo [4/5] Running JWT authentication test...
node test-jwt-standalone.js
if errorlevel 1 (
    echo.
    echo WARNING: JWT tests failed, but continuing...
)

echo.
echo [5/5] Starting production server...
echo.
echo ========================================================================
echo   SERVER STARTING - Press Ctrl+C to stop
echo ========================================================================
echo.

node server.js
