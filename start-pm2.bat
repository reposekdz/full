@echo off
echo ========================================
echo Starting with PM2 (Cluster Mode)
echo ========================================
echo.

echo Installing PM2 globally (if needed)...
call npm list -g pm2 >nul 2>&1
if errorlevel 1 (
    echo Installing PM2...
    call npm install -g pm2
)

echo.
echo Starting server with PM2...
call pm2 start ecosystem.config.js

echo.
echo Saving PM2 configuration...
call pm2 save

echo.
echo ========================================
echo Server Started Successfully!
echo ========================================
echo.
echo Commands:
echo   pm2 status              - Check status
echo   pm2 logs garden-tvet-api - View logs
echo   pm2 monit               - Monitor
echo   pm2 restart garden-tvet-api - Restart
echo   pm2 stop garden-tvet-api    - Stop
echo ========================================
pause
