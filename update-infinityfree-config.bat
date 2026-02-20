@echo off
echo ========================================
echo  Update Config for InfinityFree
echo ========================================
echo.

set /p DB_PASSWORD="Enter your InfinityFree database password: "

echo Creating .env file...

(
echo # InfinityFree Database Configuration
echo DB_HOST=sql108.infinityfree.com
echo DB_USER=if0_41208136
echo DB_PASSWORD=%DB_PASSWORD%
echo DB_NAME=if0_41208136_school_managements
echo DB_PORT=3306
echo.
echo # JWT Configuration
echo JWT_SECRET=garden_tvet_school_2024_super_secret_key_change_in_production
echo.
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=production
echo.
echo # SMS Configuration ^(Africa's Talking^)
echo SMS_API_KEY=your_africas_talking_api_key
echo SMS_USERNAME=sandbox
echo SMS_SENDER_ID=GARDEN_TVET
echo.
echo # File Upload
echo MAX_FILE_SIZE=10485760
echo UPLOAD_DIR=./uploads
) > backend\.env

echo.
echo [SUCCESS] Configuration updated!
echo.
echo ========================================
echo  Configuration Details:
echo ========================================
echo Host: sql108.infinityfree.com
echo User: if0_41208136
echo Database: if0_41208136_school_managements
echo ========================================
echo.
echo Testing connection...
cd backend
node -e "const mysql=require('mysql2');const pool=mysql.createPool({host:'sql108.infinityfree.com',user:'if0_41208136',password:'%DB_PASSWORD%',database:'if0_41208136_school_managements'});pool.query('SELECT 1',(err)=>{if(err){console.log('[ERROR] Connection failed:',err.message)}else{console.log('[SUCCESS] Database connected!')}process.exit()});"

echo.
echo ========================================
echo  NEXT STEPS:
echo ========================================
echo 1. Update frontend API URL
echo 2. Deploy backend to hosting
echo 3. Test login and features
echo ========================================

pause
