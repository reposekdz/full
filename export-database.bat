@echo off
echo ========================================
echo  Export Database for InfinityFree
echo ========================================
echo.

cd backend

echo [1/3] Exporting database...
mysqldump -u root -p school_management > ../school_management_export.sql

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Database exported!
    echo.
    echo [2/3] Optimizing SQL file...
    
    REM Add compatibility headers
    echo SET NAMES utf8mb4; > ../school_management_optimized.sql
    echo SET CHARACTER SET utf8mb4; >> ../school_management_optimized.sql
    echo SET FOREIGN_KEY_CHECKS=0; >> ../school_management_optimized.sql
    echo. >> ../school_management_optimized.sql
    type ../school_management_export.sql >> ../school_management_optimized.sql
    echo. >> ../school_management_optimized.sql
    echo SET FOREIGN_KEY_CHECKS=1; >> ../school_management_optimized.sql
    
    echo [SUCCESS] SQL file optimized!
    echo.
    echo [3/3] File ready for upload:
    echo Location: school_management_optimized.sql
    dir ..\school_management_optimized.sql | find "school_management"
    echo.
    echo ========================================
    echo  NEXT STEPS:
    echo ========================================
    echo 1. Go to: https://php-myadmin.net/
    echo 2. Login with your credentials
    echo 3. Click Import tab
    echo 4. Upload: school_management_optimized.sql
    echo 5. Click Go
    echo.
    echo Then run: update-infinityfree-config.bat
    echo ========================================
) else (
    echo [ERROR] Export failed!
    echo.
    echo Make sure:
    echo - MySQL is running
    echo - Database 'school_management' exists
    echo - You entered correct password
)

pause
