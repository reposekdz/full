@echo off
echo ========================================
echo Testing Parent Portal Interactive
echo ========================================
echo.

cd backend

echo Running system tests...
node scripts/test-parent-portal.js

echo.
pause
