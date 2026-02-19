@echo off
echo ========================================
echo Fixing Multiple React Instances Issue
echo ========================================
echo.

echo Step 1: Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo Step 2: Removing lock files...
if exist package-lock.json del /f /q package-lock.json
if exist pnpm-lock.yaml del /f /q pnpm-lock.yaml
if exist yarn.lock del /f /q yarn.lock

echo Step 3: Clearing npm cache...
call npm cache clean --force

echo Step 4: Installing dependencies with deduplication...
call npm install --legacy-peer-deps

echo.
echo ========================================
echo Fix Complete! Now run: npm run dev
echo ========================================
pause
