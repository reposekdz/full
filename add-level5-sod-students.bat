@echo off
echo ========================================
echo ADD 37 LEVEL 5 SOD STUDENTS
echo ========================================
echo.

echo Running migration to add Level 5 SOD students...
mysql -u root -p school_management < backend\migrations\add_level5_sod_students.sql

echo.
echo ========================================
echo MIGRATION COMPLETE!
echo ========================================
echo.
echo 37 Level 5 SOD students have been added to global_student_sheets
echo.
echo Trade: Software Development (SOD)
echo Level: 5
echo Students: 37 total
echo.
echo Now restart your backend server:
echo   cd backend
echo   npm start
echo.
pause
