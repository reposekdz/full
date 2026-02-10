@echo off
echo ========================================
echo Enhanced Student Applications System Setup
echo ========================================
echo.

cd /d "%~dp0backend"

echo Installing dependencies...
call npm install multer mysql2 express

echo.
echo Setting up Enhanced Student Applications System...
node setup-student-applications-enhanced.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo The Enhanced Student Applications System is now ready!
echo.
echo Features included:
echo - Comprehensive application management
echo - Advanced filtering and search
echo - Real-time status tracking  
echo - Document management
echo - SMS notifications integration
echo - Analytics and reporting
echo - Bulk operations
echo - Export functionality
echo - Interview scheduling
echo - Communication logging
echo.
echo Next steps:
echo 1. Add routes to your server.js
echo 2. Import React components
echo 3. Configure authentication
echo.
pause