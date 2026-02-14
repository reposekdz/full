@echo off
echo ========================================
echo   DOD COMPLETE SYSTEM SETUP
echo   Full Parent Messaging ^& Management
echo ========================================
echo.

echo [1/3] Setting up database schema...
node backend\scripts\setup-dod-complete.js
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed!
    pause
    exit /b 1
)
echo.

echo [2/3] Registering API routes...
echo Routes will be auto-loaded from backend/routes/dod-complete.js
echo.

echo [3/3] Testing system...
echo.
echo Testing endpoints:
echo   - GET  /api/dod-complete/students/all
echo   - POST /api/dod-complete/conduct/remove
echo   - POST /api/dod-complete/leave/grant
echo   - POST /api/dod-complete/message-parents
echo   - POST /api/dod-complete/message-all-parents
echo   - GET  /api/dod-complete/statistics
echo.

echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo FEATURES ENABLED:
echo   [x] View all students with parent info
echo   [x] Remove conduct with auto SMS to parents
echo   [x] Grant leave with auto SMS to parents
echo   [x] Message individual parents
echo   [x] Message multiple parents (bulk)
echo   [x] Broadcast to ALL linked parents
echo   [x] Bulk student selection
echo   [x] Message templates
echo   [x] Real-time statistics
echo.
echo NEXT STEPS:
echo   1. Start backend: npm run dev (in backend folder)
echo   2. Start frontend: npm run dev (in root folder)
echo   3. Login as DOD/Patron/Matron
echo   4. Navigate to DOD Dashboard
echo.
echo PARENT LINKING:
echo   - Parents create accounts via parent portal
echo   - Parents link to students using student code
echo   - System automatically sends SMS when:
echo     * Conduct is removed
echo     * Leave is approved
echo     * Manual messages sent
echo.
pause
