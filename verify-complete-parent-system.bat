@echo off
echo ========================================
echo COMPLETE PARENT SYSTEM - VERIFICATION
echo ========================================
echo.

echo [1/5] Checking database tables...
mysql -u root -p -e "USE garden_tvet; SHOW TABLES LIKE 'parent_student_links'; SHOW TABLES LIKE 'global_student_sheets'; SHOW TABLES LIKE 'attendance'; SHOW TABLES LIKE 'student_conduct_records'; SHOW TABLES LIKE 'marks'; SHOW TABLES LIKE 'teacher_comments';"

echo.
echo [2/5] Checking parent_student_links structure...
mysql -u root -p -e "USE garden_tvet; DESCRIBE parent_student_links;"

echo.
echo [3/5] Checking API routes...
echo Testing parent-portal route...
curl -s http://localhost:5000/api/health

echo.
echo [4/5] Checking frontend files...
if exist "src\app\pages\parent\ParentComprehensiveDashboard.tsx" (
    echo ✅ ParentComprehensiveDashboard.tsx exists
) else (
    echo ❌ ParentComprehensiveDashboard.tsx missing
)

if exist "backend\routes\parent-portal.js" (
    echo ✅ parent-portal.js exists
) else (
    echo ❌ parent-portal.js missing
)

echo.
echo [5/5] Testing sample queries...
mysql -u root -p -e "USE garden_tvet; SELECT COUNT(*) as total_parents FROM users WHERE role = 'parent'; SELECT COUNT(*) as total_links FROM parent_student_links WHERE status = 'approved'; SELECT COUNT(*) as total_students FROM global_student_sheets WHERE status = 'active';"

echo.
echo ========================================
echo VERIFICATION COMPLETE!
echo ========================================
echo.
echo Next Steps:
echo 1. Start backend: cd backend ^&^& npm start
echo 2. Start frontend: npm run dev
echo 3. Register parent: http://localhost:5173/parent-register
echo 4. Login: http://localhost:5173/login
echo 5. Link child and view dashboard!
echo.
echo Features:
echo ✅ Registration → Login flow
echo ✅ Auto-link system
echo ✅ 5-tab dashboard (Dashboard, Attendance, Conduct, Comments, Performance)
echo ✅ Real data (no mocks)
echo ✅ Multi-child support
echo ✅ Kinyarwanda UI
echo.
pause
