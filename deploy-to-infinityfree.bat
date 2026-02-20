@echo off
echo ==========================================
echo   DEPLOY TO INFINITYFREE - SIMPLE
echo ==========================================
echo.
echo This will export your database for upload.
echo.
pause

REM Export Database
echo.
echo [1/2] Exporting database...
echo.

cd backend
mysqldump -u root -p school_management > ../school_management_infinityfree.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Export failed!
    echo.
    echo Make sure:
    echo - MySQL is running
    echo - You entered the correct password
    echo.
    pause
    exit /b 1
)

cd ..

REM Add compatibility headers
echo.
echo [2/2] Adding InfinityFree compatibility...
echo.

(
echo SET NAMES utf8mb4;
echo SET CHARACTER SET utf8mb4;
echo SET FOREIGN_KEY_CHECKS=0;
echo.
) > temp_header.sql

copy /b temp_header.sql + school_management_infinityfree.sql school_management_final.sql > nul
del temp_header.sql
del school_management_infinityfree.sql
ren school_management_final.sql school_management_infinityfree.sql

echo SET FOREIGN_KEY_CHECKS=1; >> school_management_infinityfree.sql

echo.
echo ==========================================
echo   SUCCESS! File ready for upload
echo ==========================================
echo.
echo File: school_management_infinityfree.sql
echo Location: %cd%
echo.
dir school_management_infinityfree.sql | find ".sql"
echo.
echo ==========================================
echo   NEXT: UPLOAD TO INFINITYFREE
echo ==========================================
echo.
echo 1. Go to: https://php-myadmin.net/
echo.
echo 2. Login with:
echo    Database: if0_41208136_school_managements
echo    Username: if0_41208136
echo    Password: [your password]
echo.
echo 3. Click "Import" tab
echo.
echo 4. Click "Choose File" button
echo.
echo 5. Select: school_management_infinityfree.sql
echo.
echo 6. Click "Go" button at bottom
echo.
echo 7. Wait for success message
echo.
echo ==========================================
echo.
echo Press any key to open phpMyAdmin...
pause
start https://php-myadmin.net/
echo.
echo Good luck! 🚀
pause
