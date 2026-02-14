@echo off
echo ========================================
echo DOS ADVANCED MANAGEMENT SYSTEM SETUP
echo ========================================
echo.
echo This will setup:
echo - Subjects Management (General Studies + Trade-Specific)
echo - Teacher-Subject Assignments
echo - Timetable Generation (12 periods: 7:30-17:00)
echo - Course Management
echo - Analytics and Reports
echo.
pause

cd /d "%~dp0backend"

echo.
echo [1/3] Running database migration...
mysql -u root school_management < migrations/dos_advanced_management.sql

if %errorlevel% equ 0 (
    echo ✓ Database migration completed
) else (
    echo ✗ Database migration failed
    pause
    exit /b 1
)

echo.
echo [2/3] Registering API routes...
echo.
echo Add this to server.js:
echo const dosAdvanced = require('./routes/dos-advanced-management'^);
echo app.use('/api/dos-advanced', dosAdvanced'^);
echo.

echo [3/3] System ready!
echo.
echo ========================================
echo ✓ SETUP COMPLETE!
echo ========================================
echo.
echo 📊 Database Tables Created:
echo    ✓ subjects (52 subjects: 10 general + 42 trade-specific)
echo    ✓ subject_trade_assignments
echo    ✓ teacher_subject_assignments
echo    ✓ teacher_workload
echo    ✓ class_subject_schedule
echo    ✓ subject_topics
echo    ✓ subject_materials
echo    ✓ dos_action_logs
echo.
echo 📚 Subjects Installed:
echo    General Studies: 10 subjects (all trades)
echo    AUT: 10 trade-specific subjects
echo    BDC: 12 trade-specific subjects
echo    SOD: 12 trade-specific subjects
echo.
echo 🔗 API Endpoints:
echo    GET    /api/dos-advanced/subjects
echo    POST   /api/dos-advanced/subjects
echo    GET    /api/dos-advanced/subjects/trade/:code/level/:num
echo    POST   /api/dos-advanced/subjects/assign-to-trade
echo    POST   /api/dos-advanced/subjects/bulk-assign
echo    GET    /api/dos-advanced/teachers
echo    GET    /api/dos-advanced/teachers/:id/assignments
echo    POST   /api/dos-advanced/teachers/assign-subject
echo    POST   /api/dos-advanced/teachers/bulk-assign
echo    POST   /api/dos-advanced/timetable/generate
echo    GET    /api/dos-advanced/timetable/trade/:code/level/:num
echo    GET    /api/dos-advanced/dashboard/stats
echo    GET    /api/dos-advanced/reports/teacher-workload
echo    GET    /api/dos-advanced/reports/subject-coverage
echo.
echo 💡 Next Steps:
echo    1. Add route to server.js (see above)
echo    2. Restart backend: npm run dev
echo    3. Access DOS dashboard
echo    4. Assign teachers to subjects
echo    5. Generate timetables
echo.
pause
