@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Advanced Features Setup
echo ========================================
echo.

cd backend

echo [1/3] Setting up database tables...
node scripts/setup-advanced-features.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Database setup failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Creating upload directories...
if not exist "uploads\knowledge" mkdir uploads\knowledge
if not exist "uploads\admissions" mkdir uploads\admissions
if not exist "uploads\certificates" mkdir uploads\certificates
if not exist "uploads\alumni" mkdir uploads\alumni

echo.
echo [3/3] Starting backend server...
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo New Features Available:
echo   - Knowledge Base Management
echo   - Real-time Notifications
echo   - Admission Workflows
echo   - Examination Scheduling
echo   - Certificate Generation
echo   - Alumni Management
echo   - SMS/Email Integration
echo   - Advanced Reporting
echo   - Dashboard Analytics
echo.
echo Backend Server: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Starting server...
echo.

start cmd /k "npm start"

cd ..
timeout /t 3 /nobreak > nul

echo Starting frontend...
npm run dev

pause
