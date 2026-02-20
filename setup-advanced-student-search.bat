@echo off
REM ========================================
REM Advanced Student Search System - Setup
REM ========================================

echo.
echo ========================================
echo  Advanced Student Search System Setup
echo ========================================
echo.

echo [1/5] Checking system requirements...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm is installed
npm --version

echo.
echo [2/5] Verifying database connection...
echo.

REM Check if MySQL is running
netstat -an | find "3306" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MySQL might not be running on port 3306
    echo Please ensure MySQL is running before continuing
    pause
)

echo [OK] MySQL appears to be running

echo.
echo [3/5] Installing dependencies (if needed)...
echo.

if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies already installed
)

echo.
echo [4/5] Verifying database tables...
echo.

echo Please ensure these tables exist in your database:
echo   - users
echo   - student_profiles
echo   - enrollments
echo   - trades
echo   - course_marks
echo   - attendances
echo.

echo Press any key to continue if tables exist...
pause >nul

echo.
echo [5/5] Creating database indexes (recommended)...
echo.

echo Creating SQL file for indexes...

(
echo -- Advanced Student Search System - Database Indexes
echo -- Run this in your MySQL database
echo.
echo USE school_management;
echo.
echo -- Create indexes for better performance
echo CREATE INDEX IF NOT EXISTS idx_users_role ON users^(role^);
echo CREATE INDEX IF NOT EXISTS idx_users_gender ON users^(gender^);
echo CREATE INDEX IF NOT EXISTS idx_users_active ON users^(is_active^);
echo CREATE INDEX IF NOT EXISTS idx_users_name ON users^(first_name, last_name^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_student_profiles_admission ON student_profiles^(admission_number^);
echo CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles^(user_id^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments^(student_id^);
echo CREATE INDEX IF NOT EXISTS idx_enrollments_trade ON enrollments^(trade_code^);
echo CREATE INDEX IF NOT EXISTS idx_enrollments_level ON enrollments^(level_number^);
echo CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments^(status^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_trades_code ON trades^(code^);
echo CREATE INDEX IF NOT EXISTS idx_trades_active ON trades^(is_active^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_course_marks_student ON course_marks^(student_id^);
echo CREATE INDEX IF NOT EXISTS idx_course_marks_status ON course_marks^(status^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_attendances_student ON attendances^(student_id^);
echo CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances^(date^);
echo CREATE INDEX IF NOT EXISTS idx_attendances_status ON attendances^(status^);
echo.
echo -- Verify indexes
echo SHOW INDEX FROM users;
echo SHOW INDEX FROM student_profiles;
echo SHOW INDEX FROM enrollments;
echo SHOW INDEX FROM trades;
echo SHOW INDEX FROM course_marks;
echo SHOW INDEX FROM attendances;
echo.
echo SELECT 'Indexes created successfully!' as Status;
) > setup-student-search-indexes.sql

echo [OK] SQL file created: setup-student-search-indexes.sql
echo.
echo Please run this SQL file in your MySQL database:
echo   mysql -u root -p school_management ^< setup-student-search-indexes.sql
echo.

echo Press any key to continue...
pause >nul

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.

echo [SUCCESS] Advanced Student Search System is ready!
echo.
echo Next steps:
echo   1. Run the SQL file to create indexes (recommended)
echo   2. Start the backend server: cd backend ^&^& npm start
echo   3. Start the frontend: npm run dev
echo   4. Navigate to Director of Studies Dashboard
echo   5. Click "Abanyeshuri" tab to use the search
echo   6. Click "L4 SOD" button for quick access
echo   7. Use "SOD" tab for dedicated SOD management
echo.

echo Features available:
echo   [x] Advanced student search
echo   [x] Level 4 SOD quick access
echo   [x] Gender filtering
echo   [x] Trade and level filters
echo   [x] Dedicated SOD tab
echo   [x] Real-time search
echo   [x] Role-based access
echo   [x] SQL error fixes
echo.

echo Documentation:
echo   - ADVANCED_STUDENT_SEARCH_FIX.md
echo   - QUICK_REFERENCE_STUDENT_SEARCH.md
echo   - VISUAL_FLOW_STUDENT_SEARCH.md
echo   - COMPLETE_SUMMARY_STUDENT_SEARCH.md
echo.

echo ========================================
echo  Ready to use! Press any key to exit
echo ========================================
pause >nul
