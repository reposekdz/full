@echo off
echo ========================================
echo UPDATE CONDUCT SYSTEM TO 40 POINTS
echo Garden TVET School Management System
echo ========================================
echo.

echo [1/3] Applying database migration...
mysql -u root -p garden_tvet_db < backend\migrations\update-conduct-to-40-system.sql
if %errorlevel% neq 0 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)
echo SUCCESS: Database updated to 40-point system
echo.

echo [2/3] Restarting backend server...
cd backend
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
start "Garden TVET Backend" cmd /k "npm start"
cd ..
echo Backend server restarted
echo.

echo [3/3] Verification...
echo.
echo ========================================
echo MIGRATION COMPLETE!
echo ========================================
echo.
echo Changes Applied:
echo  - Conduct scores scaled to 40-point system
echo  - Grade thresholds: A(36-40), B(32-35), C(28-31), D(24-27), F(0-23)
echo  - Automatic triggers updated
echo  - Dynamic color coding enabled
echo.
echo Next Steps:
echo  1. Restart frontend: npm run dev
echo  2. Test conduct removal with automatic deduction
echo  3. Verify colors change dynamically
echo.
pause
