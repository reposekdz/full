@echo off
echo ========================================
echo ADD 28 LEVEL 5 BDC STUDENTS
echo ========================================
echo.

echo Running migration to add Level 5 BDC students...
mysql -u root -p school_management < backend\migrations\add_level5_bdc_students.sql

echo.
echo ========================================
echo MIGRATION COMPLETE!
echo ========================================
echo.
echo 28 Level 5 BDC students have been added to global_student_sheets
echo.
echo Trade: Building ^& Construction (BDC)
echo Level: 5
echo Students: 28 total
echo.
echo Now restart your backend server:
echo   cd backend
echo   npm start
echo.
pause
