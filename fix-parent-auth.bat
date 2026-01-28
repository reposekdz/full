@echo off
echo ========================================
echo Parent Authentication Fix
echo ========================================
echo.

echo Step 1: Running database migrations...
cd backend
node scripts/run-migrations.js
if errorlevel 1 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)
echo.

echo Step 2: Testing parent authentication setup...
node scripts/test-parent-auth.js
if errorlevel 1 (
    echo ERROR: Parent auth test failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo What was fixed:
echo   1. Parents table structure verified
echo   2. Parent login endpoint configured
echo   3. Parent registration endpoint configured
echo   4. Test parent account created
echo.
echo Next Steps:
echo   1. Start the backend: npm run dev (in backend folder)
echo   2. Start the frontend: npm run dev (in root folder)
echo   3. Test parent registration at /register
echo   4. Test parent login at /login (use Phone method)
echo.
echo Common Issues Fixed:
echo   - Parent not redirecting after registration
echo   - Parent login with phone not working
echo   - Token not being stored properly
echo   - Dashboard redirect not working
echo.
pause
