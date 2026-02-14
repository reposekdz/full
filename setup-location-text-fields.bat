@echo off

REM Set working directory to script location
cd /d "%~dp0"

chcp 65001 >nul
echo ========================================
echo Database Migration: Add Location Text Fields
echo ========================================
echo.
echo This script will add text columns for location names to:
echo - student_applications table
echo - parents table
echo - global_student_sheets table
echo.
echo Creating backup before migration...
echo.
echo ========================================
echo Running Migration SQL...
echo ========================================
echo.
mysql -u root -p school_management < backend/migrations/add_location_text_columns.sql
echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo New columns added:
    echo - student_applications: province_name, district_name, sector_name, cell_name, village_name
    echo - parents: province, district, sector, cell, village
    echo - global_student_sheets: province_name, district_name, sector_name, cell_name, village_name
    echo.
    echo Restart your backend server to apply changes.
    echo ========================================
) else (
    echo ========================================
    echo Migration failed! Please check your database connection.
    echo ========================================
)
pause
