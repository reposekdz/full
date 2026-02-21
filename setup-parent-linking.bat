@echo off
echo ========================================
echo Parent Linking System Setup
echo ========================================
echo.

cd backend

echo [1/2] Running database migrations...
node setup-parent-linking-system.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Database setup failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Restarting backend server...
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Features Enabled:
echo   - Parents submit linking requests by name/gender/level/trade
echo   - Staff approve/reject requests
echo   - Approved parents get full child access
echo   - Parents can view grades, attendance, conduct, fees
echo   - Parents can pay fees online
echo   - Real-time notifications
echo.
echo API Endpoints:
echo   POST /api/parent-linking-requests/submit-request
echo   GET  /api/parent-linking-requests/my-requests
echo   GET  /api/parent-linking-requests/pending (staff)
echo   POST /api/parent-linking-requests/approve/:id (staff)
echo   POST /api/parent-linking-requests/reject/:id (staff)
echo.
echo Please restart the backend server:
echo   cd backend
echo   npm start
echo.
pause
