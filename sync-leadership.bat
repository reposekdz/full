@echo off
echo ========================================
echo   SYNCING LEADERSHIP WITH IMAGES
echo ========================================
echo.

cd /d "%~dp0backend"
node scripts\sync-leadership-with-images.js

echo.
echo ========================================
echo   SYNC COMPLETE!
echo ========================================
echo.
echo Press any key to exit...
pause >nul
