@echo off
echo ========================================
echo Parent Linking ^& DOD System Setup
echo ========================================
echo.

echo [1/4] Checking database connection...
cd backend
node -e "const {pool} = require('./config/database'); pool.query('SELECT 1', (err) => { if(err) { console.log('ERROR: Database not connected!'); process.exit(1); } else { console.log('SUCCESS: Database connected!'); pool.end(); } });"
if errorlevel 1 (
    echo.
    echo ERROR: Cannot connect to database!
    echo Please check your database configuration in backend/.env
    pause
    exit /b 1
)

echo.
echo [2/4] Running database migration...
mysql -u root -p school_management < migrations/parent-linking-dod-system.sql
if errorlevel 1 (
    echo.
    echo WARNING: Migration may have failed. Check manually.
    echo You can run it manually: mysql -u root -p school_management ^< migrations/parent-linking-dod-system.sql
    pause
)

echo.
echo [3/4] Testing system integration...
node test-parent-linking-dod.js
if errorlevel 1 (
    echo.
    echo WARNING: Some tests failed. Check the output above.
    pause
)

echo.
echo [4/4] System ready!
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start the backend server: cd backend ^&^& npm run dev
echo 2. Start the frontend: npm run dev
echo 3. Open DOD Dashboard to test conduct removal and leave approval
echo 4. Open Parent Linking Management to approve parent requests
echo.
echo Documentation:
echo - PARENT_LINKING_DOD_SYSTEM.md - Complete guide
echo - QUICK_REFERENCE.md - Quick reference
echo.
pause
