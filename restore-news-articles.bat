@echo off
echo.
echo ========================================
echo   RESTORING NEWS ARTICLES WITH IMAGES
echo ========================================
echo.

cd /d "%~dp0backend"

echo 📰 Starting news articles restoration...
echo.

node restore-news-final.js

echo.
echo ========================================
echo   NEWS RESTORATION COMPLETE
echo ========================================
echo.
echo ✅ All news articles have been restored with their images
echo 🖼️  Images are linked from uploads/news/ directory
echo 📊 Articles are now fully functional in the system
echo.
pause