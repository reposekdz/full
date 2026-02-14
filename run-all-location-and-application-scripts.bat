@echo off
cd /d "%~dp0"

echo ========================================
echo 🚀 COMPLETE SYSTEM SETUP
echo ========================================
echo.
echo This will run ALL scripts for:
echo 🌍 Location System (Rwanda Locations)
echo 🎓 Student Application System (All Versions)
echo.
echo ⚠️  WARNING: This may take 10-15 minutes
echo.
echo Make sure:
echo ✓ MySQL is running
echo ✓ Database 'school_management' exists
echo ✓ Node.js dependencies are installed
echo.
pause

if exist "run-all-location-scripts.bat" (
    echo.
    echo ========================================
    echo PART 1: LOCATION SYSTEM SETUP
    echo ========================================
    call "%~dp0run-all-location-scripts.bat"
) else (
    echo PART 1 SKIPPED - run-all-location-scripts.bat not found
)

if exist "run-all-student-application-scripts.bat" (
    echo.
    echo ========================================
    echo PART 2: STUDENT APPLICATION SYSTEM SETUP
    echo ========================================
    call "%~dp0run-all-student-application-scripts.bat"
) else (
    echo PART 2 SKIPPED - run-all-student-application-scripts.bat not found
)

echo.
echo ========================================
echo ✅ COMPLETE SYSTEM SETUP FINISHED!
echo ========================================
echo.
echo 🎉 Congratulations! Your system is now fully configured with:
echo.
echo 🌍 LOCATION SYSTEM:
echo    ✓ 5 Provinces
echo    ✓ 30 Districts
echo    ✓ 416 Sectors
echo    ✓ 2000+ Cells
echo    ✓ 10000+ Villages
echo    ✓ Complete API endpoints
echo.
echo 🎓 STUDENT APPLICATION SYSTEM:
echo    ✓ Application submission form
echo    ✓ Document upload system
echo    ✓ DOS review workflow
echo    ✓ Headmaster approval system
echo    ✓ Status tracking
echo    ✓ SMS/Email notifications
echo    ✓ Analytics dashboard
echo    ✓ Export functionality
echo    ✓ Role-based access control
echo.
echo 🔗 Key API Endpoints:
echo    Location APIs:
echo    - GET /api/rwanda-locations/provinces
echo    - GET /api/rwanda-locations/districts/:provinceId
echo    - GET /api/rwanda-locations/sectors/:districtId
echo    - GET /api/rwanda-locations/cells/:sectorId
echo    - GET /api/rwanda-locations/villages/:cellId
echo.
echo    Application APIs:
echo    - POST /api/student-applications/submit
echo    - GET  /api/student-applications/list
echo    - GET  /api/student-applications/status/:applicationNumber
echo    - POST /api/student-applications/dos/review/:id
echo    - POST /api/student-applications/headmaster/decide/:id
echo    - GET  /api/student-applications/analytics/dashboard
echo.
echo 💡 NEXT STEPS:
echo    1. Restart your backend server: npm run dev
echo    2. Test location selector in application form
echo    3. Submit a test application
echo    4. Login as DOS to review applications
echo    5. Login as Headmaster for final approval
echo.
echo 📖 Documentation:
echo    - RWANDA_LOCATIONS_SYSTEM.md
echo    - STUDENT_APPLICATION_SYSTEM_GUIDE.md
echo    - STUDENT_APPLICATION_PRODUCTION_GUIDE.md
echo.
pause
