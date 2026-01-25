@echo off
echo ========================================
echo Setting up Classes System
echo ========================================
echo.

cd backend
node scripts/setup-classes-system.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Classes created:
echo - Level 3 SOD: Section A and B
echo - Level 4 SOD: Section A and B
echo - Level 5 SOD: Section A and B
echo.
echo Each section studies the same courses
echo but in different classrooms.
echo.
pause
