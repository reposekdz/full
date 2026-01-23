@echo off
echo ========================================
echo   Database Initialization Script
echo   School Management System
echo ========================================
echo.

cd backend

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo [2/3] Checking database connection...
node scripts/test-db-connection.js
if errorlevel 1 (
    echo ERROR: Cannot connect to database!
    echo Please check your .env file configuration
    pause
    exit /b 1
)
echo.

echo [3/3] Initializing homepage data...
node scripts/init-homepage-data.js
if errorlevel 1 (
    echo ERROR: Failed to initialize data!
    pause
    exit /b 1
)
echo.

echo ========================================
echo   ✓ Database initialization complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: npm start
echo 2. Start frontend: npm run dev
echo 3. Open browser: http://localhost:5173
echo.
pause
