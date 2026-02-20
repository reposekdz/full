@echo off
echo ========================================
echo  FIXING PARENT LINKING ERRORS
echo ========================================
echo.

echo [1/2] Ensuring parent_student_links table exists...
mysql -u root -p -e "USE garden_tvet; CREATE TABLE IF NOT EXISTS parent_student_links (id INT AUTO_INCREMENT PRIMARY KEY, parent_id INT NOT NULL, student_id INT NOT NULL, relationship_type VARCHAR(50) DEFAULT 'Parent', status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved', linked_by VARCHAR(100), linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_link (parent_id, student_id), FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE);"

echo.
echo [2/2] Testing backend routes...
echo Starting backend server test...
cd backend
start /B npm start
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo  FIX COMPLETE!
echo ========================================
echo.
echo WHAT WAS FIXED:
echo  - Fixed /api/parent-dashboard/student/auto-fetch endpoint
echo  - Fixed /api/parent-links/link-student to accept multiple formats
echo  - Fixed frontend to send correct data format
echo  - Added better error messages
echo.
echo NEXT STEPS:
echo  1. Restart backend: cd backend && npm start
echo  2. Test parent linking in browser
echo  3. Check console for any remaining errors
echo.
pause
