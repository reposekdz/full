@echo off
echo ========================================
echo Garden TVET - Enhanced Application System Setup
echo ========================================
echo.

cd backend

echo [1/3] Setting up enhanced application system...
node scripts/setup-enhanced-applications.js
if errorlevel 1 (
    echo ERROR: Application system setup failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Restarting backend server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
start "Garden TVET Backend" cmd /k "node server.js"

echo.
echo [3/3] Setup complete!
echo.
echo ========================================
echo ENHANCED APPLICATION SYSTEM READY!
echo ========================================
echo.
echo 🎯 Features Available:
echo   ✓ 4-step application form
echo   ✓ Document upload support
echo   ✓ Dynamic level selection
echo   ✓ Status management workflow
echo   ✓ DOS and Headmaster management
echo   ✓ Automatic notifications
echo   ✓ Interview scheduling
echo   ✓ Comprehensive reporting
echo.
echo 🔗 Access Points:
echo   📝 Application Form: Click "Saba Kwiga muri Garden TVET" button
echo   👨💼 DOS Management: Dashboard > Applications tab
echo   🎓 Headmaster Management: Dashboard > Applications tab
echo.
echo 📊 API Base: http://localhost:5000/api/student-applications
echo.
echo ========================================
pause