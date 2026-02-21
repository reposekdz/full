@echo off
echo ========================================
echo PARENT LINKING TABLES - QUICK SETUP
echo ========================================
echo.
echo This will create the parent linking tables in your database.
echo.
pause

echo.
echo Running setup script...
node backend\migrations\run-parent-linking-setup-simple.js

echo.
echo ========================================
echo Press any key to exit...
echo ========================================
pause > nul
