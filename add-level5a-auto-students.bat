@echo off
echo ========================================
echo ADD 45 LEVEL 5A AUTO STUDENTS
echo ========================================
echo.

echo Running migration to add Level 5A AUTO students...
mysql -u root -p school_management < backend\migrations\add_level5a_auto_students.sql

echo.
echo ========================================
echo MIGRATION COMPLETE!
echo ========================================
echo.
echo 45 Level 5A AUTO students have been added to global_student_sheets
echo.
echo Trade: Automobile Technology (AUTO)
echo Level: 5A
echo Students: 45 total
echo.
echo Now restart your backend server:
echo   cd backend
echo   npm start
echo.
pause
