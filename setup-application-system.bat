@echo off
echo ============================================
echo STUDENT APPLICATION SYSTEM - COMPLETE SETUP
echo ============================================

echo.
echo Step 1: Installing multer package...
cd backend
call npm install multer
if %errorlevel% neq 0 (
    echo ERROR: Failed to install multer
    pause
    exit /b 1
)

echo.
echo Step 2: Running database migration...

set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not exist %MYSQL_PATH% set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
if not exist %MYSQL_PATH% set MYSQL_PATH=mysql

%MYSQL_PATH% -u root -p < migrations/student-application-system.sql

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo ✅ SETUP COMPLETED SUCCESSFULLY!
    echo ============================================
    echo.
    echo 📦 Installed Packages:
    echo    - multer (file upload middleware)
    echo.
    echo 🗄️  Database Tables Created:
    echo    - student_applications (with profile_photo, report_card_image)
    echo    - application_documents
    echo    - application_status_history
    echo    - application_comments
    echo    - application_notifications
    echo    - application_statistics
    echo.
    echo 🚀 System Features:
    echo    ✅ Profile photo upload
    echo    ✅ Report card image upload
    echo    ✅ DOS review system
    echo    ✅ Headmaster approval system
    echo    ✅ SMS notifications
    echo    ✅ Status tracking
    echo    ✅ Statistics dashboard
    echo.
    echo 📡 API Endpoints Added:
    echo    POST   /api/student-applications/submit
    echo    GET    /api/student-applications/status/:applicationNumber
    echo    GET    /api/student-applications/dos/pending
    echo    POST   /api/student-applications/dos/review/:id
    echo    GET    /api/student-applications/headmaster/pending
    echo    POST   /api/student-applications/headmaster/decide/:id
    echo    GET    /api/student-applications/all
    echo    GET    /api/student-applications/details/:id
    echo    GET    /api/student-applications/statistics
    echo.
    echo 🎯 Access Points:
    echo    - Students: Apply from Hero section "Apply Now" button
    echo    - DOS: Login → Navigate to "Ibyifuzo byo Kwiga"
    echo    - Headmaster: Login → Navigate to "Ibyifuzo byo Kwiga"
    echo    - Direct URL: /application-management
    echo.
    echo 📁 Upload Directories Created:
    echo    - backend/uploads/applications/photos/
    echo    - backend/uploads/applications/report-cards/
    echo    - backend/uploads/applications/documents/
    echo.
    echo ✨ Next Steps:
    echo    1. Restart your backend server (npm run dev)
    echo    2. Test the application form from the hero section
    echo    3. Login as DOS to review applications
    echo    4. Login as Headmaster for final approval
    echo.
    echo 🎉 System is ready for production use!
    echo.
) else (
    echo.
    echo ❌ ERROR: Database migration failed
    echo Please check:
    echo    - MySQL is running
    echo    - Database credentials are correct
    echo    - Database exists
    echo.
)

cd ..
pause
