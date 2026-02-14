@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Force Credential Change System Setup
echo ========================================
echo.

cd backend

echo [1/2] Setting up database...
node -e "const fetch = require('node-fetch'); async function run() { try { const res = await fetch('http://localhost:5000/api/auth/setup-force-change', { method: 'POST' }); const data = await res.json(); console.log(data.success ? '✓ Database setup complete' : '✗ Setup failed: ' + data.message); } catch(e) { console.log('✗ Error:', e.message); console.log('Note: Make sure server is running'); } } run();"

echo.
echo [2/2] System ready!
echo.
echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo Force Credential Change System is now active:
echo - All staff with @reponsekdz06.com email must change
echo - All staff with password "2026" must change
echo - Modal appears on dashboard login
echo - Cannot skip or close modal
echo - Secure password requirements enforced
echo.
echo Affected Roles:
echo - Accountant
echo - Headmaster
echo - DOD (Director of Discipline)
echo - DOS (Director of Studies)
echo - Stock Manager
echo - Admin
echo - Advisor
echo - Teachers
echo.
echo Next Steps:
echo 1. Staff login with default credentials
echo 2. Modal appears automatically
echo 3. Staff must enter new email and password
echo 4. System validates and updates credentials
echo 5. Staff can now access dashboard
echo.
pause
