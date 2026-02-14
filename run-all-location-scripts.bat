@echo off
cd /d "%~dp0"

echo ========================================
echo 🌍 ALL LOCATION SCRIPTS RUNNER
echo ========================================
echo.
echo This will run ALL location-related scripts:
echo 1. Rwanda Locations System Setup
echo 2. Generate All Locations (Cells & Villages)
echo.
echo ⚠️  WARNING: This may take 5-10 minutes
echo.
pause

if exist "setup-rwanda-locations.bat" (
    echo.
    echo ========================================
    echo [1/2] Setting up Rwanda Locations System
    echo ========================================
    call "%~dp0setup-rwanda-locations.bat"
) else (
    echo [1/2] SKIPPED - setup-rwanda-locations.bat not found
)

if exist "generate-all-locations.bat" (
    echo.
    echo ========================================
    echo [2/2] Generating All Cells and Villages
    echo ========================================
    call "%~dp0generate-all-locations.bat"
) else (
    echo [2/2] SKIPPED - generate-all-locations.bat not found
)

echo.
echo ========================================
echo ✅ ALL LOCATION SCRIPTS COMPLETED!
echo ========================================
echo.
echo 📊 Database Tables Created:
echo    ✓ rwanda_provinces (5 provinces)
echo    ✓ rwanda_districts (30 districts)
echo    ✓ rwanda_sectors (416 sectors)
echo    ✓ rwanda_cells (2000+ cells)
echo    ✓ rwanda_villages (10000+ villages)
echo.
echo 🔗 API Endpoints Available:
echo    GET /api/rwanda-locations/provinces
echo    GET /api/rwanda-locations/districts/:provinceId
echo    GET /api/rwanda-locations/sectors/:districtId
echo    GET /api/rwanda-locations/cells/:sectorId
echo    GET /api/rwanda-locations/villages/:cellId
echo.
echo 💡 Next Steps:
echo    1. Restart your backend server
echo    2. Test the location APIs
echo    3. Use RwandaLocationSelector component in forms
echo.
pause
