@echo off
cd /d "%~dp0"

echo ========================================
echo 🎓 ALL STUDENT APPLICATION SCRIPTS RUNNER
echo ========================================
echo.
echo This will run ALL student application scripts:
echo 1. Application System (Complete Setup)
echo 2. Basic Application System
echo 3. Enhanced Applications
echo 4. Enhanced Applications V2
echo 5. Production Application System
echo.
echo ⚠️  WARNING: This may take 5-10 minutes
echo.
pause

if exist "setup-application-system.bat" (
    echo.
    echo ========================================
    echo [1/5] Setting up Application System (Complete)
    echo ========================================
    call "%~dp0setup-application-system.bat"
) else (
    echo [1/5] SKIPPED - setup-application-system.bat not found
)

if exist "setup-student-applications.bat" (
    echo.
    echo ========================================
    echo [2/5] Setting up Basic Application System
    echo ========================================
    call "%~dp0setup-student-applications.bat"
) else (
    echo [2/5] SKIPPED - setup-student-applications.bat not found
)

if exist "setup-enhanced-applications.bat" (
    echo.
    echo ========================================
    echo [3/5] Setting up Enhanced Applications
    echo ========================================
    call "%~dp0setup-enhanced-applications.bat"
) else (
    echo [3/5] SKIPPED - setup-enhanced-applications.bat not found
)

if exist "setup-enhanced-applications-v2.bat" (
    echo.
    echo ========================================
    echo [4/5] Setting up Enhanced Applications V2
    echo ========================================
    call "%~dp0setup-enhanced-applications-v2.bat"
) else (
    echo [4/5] SKIPPED - setup-enhanced-applications-v2.bat not found
)

if exist "setup-student-application-production.bat" (
    echo.
    echo ========================================
    echo [5/5] Setting up Production Application System
    echo ========================================
    call "%~dp0setup-student-application-production.bat"
) else (
    echo [5/5] SKIPPED - setup-student-application-production.bat not found
)

echo.
echo ========================================
echo ✅ ALL STUDENT APPLICATION SCRIPTS COMPLETED!
echo ========================================
echo.
echo 📊 Features Installed:
echo    ✓ Modern Interactive UI
echo    ✓ Advanced Application Management
echo    ✓ Real-time Status Tracking
echo    ✓ Document Upload System
echo    ✓ SMS Notifications
echo    ✓ Analytics Dashboard
echo    ✓ Bulk Operations
echo    ✓ Export Functionality
echo    ✓ Trade-specific Levels
echo    ✓ DOS Review Workflow
echo    ✓ Headmaster Approval System
echo    ✓ Application Status History
echo    ✓ Role-based Access Control
echo.
echo 🔗 API Endpoints Available:
echo    POST /api/student-applications/submit
echo    GET  /api/student-applications/list
echo    GET  /api/student-applications/status/:applicationNumber
echo    PUT  /api/student-applications/:id/status
echo    GET  /api/student-applications/dos/pending
echo    POST /api/student-applications/dos/review/:id
echo    GET  /api/student-applications/headmaster/pending
echo    POST /api/student-applications/headmaster/decide/:id
echo    GET  /api/student-applications/analytics/dashboard
echo    GET  /api/student-applications/statistics
echo    GET  /api/student-applications/export/csv
echo.
echo 💡 React Components Available:
echo    - AdvancedApplicationsManagement.tsx
echo    - ApplicationStatusChecker.tsx
echo    - StudentApplicationForm.tsx
echo    - DOSApplicationsManagement.tsx
echo    - HeadmasterApplicationsManagement.tsx
echo.
echo 📊 Trade Levels Configured:
echo    AUT (Automotive): Levels 4, 5
echo    BDC (Building ^& Construction): Levels 3, 4, 5
echo    SOD (Software Development): Levels 3, 4, 5
echo.
echo 💡 Next Steps:
echo    1. Restart your backend server
echo    2. Test the application form from hero section
echo    3. Login as DOS to review applications
echo    4. Login as Headmaster for final approval
echo.
pause
