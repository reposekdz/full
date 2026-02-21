@echo off
echo ========================================
echo PARENT LINKING SYSTEM - QUICK SETUP
echo ========================================
echo.

cd backend

echo Running migration...
node run-parent-linking-migration.js

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo The system is ready to use:
echo.
echo 1. Restart backend: npm start
echo 2. Login as DOD
echo 3. Click "Parent Applications" tab
echo 4. Approve/reject parent linking requests
echo.
echo Components:
echo - GlobalSheetsParentLinkingIntegration (Full management)
echo - StudentParentLinkingButton (Quick approve from student view)
echo - DODParentApplicationLinking (Existing component)
echo.
pause
