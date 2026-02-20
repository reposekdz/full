@echo off
echo ========================================
echo Teacher Global Sheets Setup
echo ========================================
echo.

echo [1/3] Running database migrations...
mysql -u root -p -e "USE school_management; SOURCE backend/migrations/teacher-marks-tables.sql;"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Database migration failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Verifying tables...
mysql -u root -p -e "USE school_management; SHOW TABLES LIKE 'teacher_%';"

echo.
echo [3/3] Testing API endpoints...
echo Starting backend server...
cd backend
start cmd /k "npm start"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Backend is running on http://localhost:5000
echo 2. Start frontend: cd .. ^&^& npm run dev
echo 3. Login as teacher and access Modern Teacher Dashboard
echo 4. Navigate to "All Students" or "Marks Sheet" tabs
echo.
echo API Endpoints:
echo - GET  /api/global-sheets/students
echo - GET  /api/global-sheets/trades
echo - GET  /api/global-sheets/levels
echo - POST /api/teacher-marks/save
echo - GET  /api/teacher-marks/marks
echo.
pause
