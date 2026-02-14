@echo off
echo ============================================
echo INTEGRATE GLOBAL STUDENT SHEETS - ALL ROLES
echo ============================================
echo.
echo This script will ensure Global Student Sheets
echo is accessible to ALL staff roles:
echo - Accountant
echo - DOS (Director of Studies)
echo - DOD (Director of Discipline)
echo - Headmaster
echo - Teacher
echo - Advisor
echo - Stock Manager
echo - All other staff roles
echo.
echo ============================================
echo.

cd backend
node integrate-global-sheets-now.js

echo.
echo ============================================
echo INTEGRATION COMPLETE!
echo ============================================
echo.
echo All staff roles now have access to:
echo - Global Student Sheets
echo - Student data by Trade and Level
echo - Search and filter capabilities
echo - Export functionality
echo - Role-based permissions
echo.
pause
