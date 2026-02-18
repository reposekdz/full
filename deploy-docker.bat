@echo off
echo ========================================
echo Garden TVET - Docker Deployment
echo ========================================
echo.

echo [1/4] Building Docker image...
docker build -t garden-tvet-api .
if errorlevel 1 (
    echo ERROR: Docker build failed
    pause
    exit /b 1
)

echo.
echo [2/4] Stopping existing containers...
docker-compose down

echo.
echo [3/4] Starting containers...
docker-compose up -d

echo.
echo [4/4] Checking status...
timeout /t 5 /nobreak >nul
docker-compose ps

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo API: http://localhost:5000
echo Health: http://localhost:5000/api/health
echo.
echo Commands:
echo   docker-compose logs -f api    - View logs
echo   docker-compose ps             - Check status
echo   docker-compose down           - Stop all
echo   docker-compose restart api    - Restart API
echo ========================================
pause
