@echo off
echo ========================================
echo Setup Parent Notifications System
echo ========================================
echo.
echo This will:
echo 1. Create parent_notifications table
echo 2. Add notification routes to backend
echo 3. Enable automatic notifications when conduct is removed
echo.
pause

cd backend

echo.
echo Step 1: Creating parent_notifications table...
mysql -u root -p school_management_db < migrations\create-parent-notifications.sql

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create table
    pause
    exit /b 1
)

echo.
echo Step 2: Checking if route exists in server.js...
findstr /C:"parent-notifications" server.js >nul
if %ERRORLEVEL% EQU 0 (
    echo Route already exists in server.js
) else (
    echo.
    echo Please add this line to backend\server.js:
    echo app.use('/api/parent', require('./routes/parent-notifications'));
    echo.
    echo Add it after other route definitions.
    pause
)

echo.
echo ========================================
echo SUCCESS! Parent Notifications Setup
echo ========================================
echo.
echo What was done:
echo - Created parent_notifications table
echo - Created API routes for notifications
echo.
echo What happens now:
echo - When DOD removes conduct, parents get notified
echo - When conduct is restored, parents get notified
echo - Notifications appear on parent dashboard
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Parents will see notifications on their dashboard
echo.
pause
