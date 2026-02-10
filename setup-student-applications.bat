@echo off
echo ========================================
echo 🎓 ADVANCED STUDENT APPLICATIONS SYSTEM
echo ========================================
echo.

cd /d "%~dp0backend"

echo 🚀 Setting up the system...
node setup-minimal.js

echo.
echo ========================================
echo 🎉 SYSTEM READY!
echo ========================================
echo.
echo ✅ Features Available:
echo    🔥 Modern Interactive UI
echo    🔥 Advanced Application Management
echo    🔥 Real-time Status Tracking
echo    🔥 Document Upload System
echo    🔥 SMS Notifications
echo    🔥 Analytics Dashboard
echo    🔥 Bulk Operations
echo    🔥 Export Functionality
echo    🔥 Trade-specific Levels
echo.
echo 📊 Trade Levels:
echo    AUT (Automotive): Levels 4, 5
echo    BDC (Building & Construction): Levels 3, 4, 5
echo    SOD (Software Development): Levels 3, 4, 5
echo.
echo 🔗 API Endpoints:
echo    POST /api/student-applications/submit
echo    GET  /api/student-applications/list
echo    PUT  /api/student-applications/:id/status
echo    GET  /api/student-applications/analytics/dashboard
echo    GET  /api/student-applications/export/csv
echo.
echo 💡 React Components:
echo    - AdvancedApplicationsManagement.tsx
echo    - ApplicationStatusChecker.tsx
echo.
echo 🚀 Start your server with: npm run dev
echo.
pause