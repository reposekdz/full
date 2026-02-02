@echo off
echo ========================================
echo  INITIALIZING FULL HOMEPAGE DATABASE
echo ========================================
echo.

cd /d "%~dp0"
cd backend

echo Installing dependencies...
call npm install

echo.
echo Initializing homepage database with full content...
node scripts/init-full-homepage-data.js

echo.
echo ========================================
echo  HOMEPAGE DATABASE SETUP COMPLETE!
echo ========================================
echo.
echo ✅ All homepage content has been populated:
echo    - Hero slides with real images
echo    - News articles from database
echo    - Testimonials from real users
echo    - School statistics (live data)
echo    - Achievements and awards
echo    - Upcoming events
echo    - Course/trade information
echo    - Homepage features
echo.
echo 🚀 Your homepage is now fully functional with database integration!
echo.
pause