@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo   Trade Gallery Setup
echo ========================================
echo.
echo This script will help you set up the trade gallery images.
echo.
echo Current Status:
echo - AUTO folder: backend\uploads\trades\AUTO\
echo - AUTO tools folder: backend\uploads\trades\AUTO\tools\
echo.
echo To add images:
echo 1. Place general automotive images in: backend\uploads\trades\AUTO\
echo 2. Place tools/equipment images in: backend\uploads\trades\AUTO\tools\
echo.
echo Supported formats: JPG, JPEG, JFIF, PNG, WebP
echo Recommended size: 800x600 pixels
echo Max file size: 2MB per image
echo.
echo Example image names:
echo   - automotive-workshop.jpg
echo   - engine-repair.jpg
echo   - diagnostic-tools.jpg
echo   - brake-system.jpg
echo   - electrical-tools.jpg
echo.
echo Press any key to open the folders...
pause >nul

start "" "%cd%\backend\uploads\trades\AUTO"
start "" "%cd%\backend\uploads\trades\AUTO\tools"

echo.
echo Folders opened! Add your images and restart the server.
echo.
pause
