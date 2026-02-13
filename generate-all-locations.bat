@echo off
echo ========================================
echo Generate ALL Cells and Villages
echo ========================================
echo.
echo This will generate:
echo - 2000+ Cells (3-7 per sector)
echo - 10000+ Villages (3-8 per cell)
echo.
echo WARNING: This may take 2-5 minutes
echo.
pause

cd backend

echo.
echo 🔄 Generating data...
node generate-cells-villages.js

echo.
echo ========================================
echo ✓ Complete!
echo ========================================
echo.
pause
