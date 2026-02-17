@echo off
echo ========================================
echo Rwanda Real Locations Database Seed
echo ========================================
echo.
echo This will populate the database with:
echo - 5 Provinces
echo - 30 Districts
echo - 400+ Sectors
echo - Real Cells for each Sector
echo - Real Villages for each Cell
echo.
echo WARNING: This will clear existing location data!
echo.
pause
echo.
echo ========================================
echo Starting seed process...
echo ========================================
cd /d "%~dp0"
node backend\migrations\seed-rwanda-locations.js
echo.
echo ========================================
echo Seed complete!
echo ========================================
pause
