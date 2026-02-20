@echo off
echo ========================================
echo PARENT AUTO-CONNECT SYSTEM - VERIFICATION
echo ========================================
echo.

echo [1/3] Checking database tables...
mysql -u root -p -e "USE garden_tvet; SHOW TABLES LIKE 'parent_student_links'; SHOW TABLES LIKE 'global_student_sheets';"

echo.
echo [2/3] Checking parent_student_links structure...
mysql -u root -p -e "USE garden_tvet; DESCRIBE parent_student_links;"

echo.
echo [3/3] Testing sample query...
mysql -u root -p -e "USE garden_tvet; SELECT COUNT(*) as total_links FROM parent_student_links WHERE status = 'approved';"

echo.
echo ========================================
echo VERIFICATION COMPLETE!
echo ========================================
echo.
echo Next Steps:
echo 1. Start backend: cd backend ^&^& npm start
echo 2. Start frontend: npm run dev
echo 3. Login as parent
echo 4. Go to Link Child page
echo 5. Enter: Name, Trade, Level
echo 6. Click "Huza Umwana"
echo 7. Instant access!
echo.
pause
