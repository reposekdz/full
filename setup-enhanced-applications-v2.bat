@echo off
echo ========================================
echo Enhanced Student Application System Setup
echo ========================================
echo.

echo Starting enhanced application system setup...
echo.

cd /d "%~dp0.."

echo Running database setup...
node scripts/setup-enhanced-applications-v2.js

echo.
echo Setup complete! 
echo.
echo Don't forget to:
echo 1. Add location routes to app.js
echo 2. Restart your backend server
echo 3. Test the application form
echo.

pause