@echo off
echo 🔧 Fixing Windows Build Issues...

echo.
echo 📦 Installing cross-env for Windows environment variables...
npm install --save-dev cross-env

echo.
echo 🧹 Cleaning previous builds...
npm run clean

echo.
echo 📦 Installing dependencies...
npm install

echo.
echo 🏗️ Building for production...
npm run build

echo.
echo ✅ Build complete! Check dist/ folder
pause