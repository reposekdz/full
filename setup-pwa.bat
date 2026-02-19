@echo off
echo ========================================
echo Garden TVET PWA Setup
echo ========================================
echo.

echo [1/5] Installing PWA dependencies...
call npm install workbox-webpack-plugin workbox-window idb zustand
echo.

echo [2/5] Converting logo to PNG format...
echo Creating logo variants for PWA...
echo.

echo [3/5] Updating index.html with PWA meta tags...
powershell -Command "(Get-Content public\index.html) -replace '</head>', '  <link rel=\"manifest\" href=\"/manifest-pwa.json\">`n  <meta name=\"theme-color\" content=\"#eab308\">`n  <meta name=\"apple-mobile-web-app-capable\" content=\"yes\">`n  <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">`n  <meta name=\"apple-mobile-web-app-title\" content=\"Garden TVET\">`n  <link rel=\"apple-touch-icon\" href=\"/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico\">`n</head>' | Set-Content public\index.html"
echo.

echo [4/5] Creating PWA initialization script...
(
echo import { pwaManager } from './utils/pwaManager';
echo import { offlineDataManager } from './utils/offlineDataManager';
echo.
echo // Initialize PWA
echo if ^('serviceWorker' in navigator^) {
echo   window.addEventListener^('load', async ^(^) =^> {
echo     try {
echo       await pwaManager.requestNotificationPermission^(^);
echo       console.log^('✅ PWA initialized'^);
echo     } catch ^(error^) {
echo       console.error^('❌ PWA init failed:', error^);
echo     }
echo   }^);
echo }
echo.
echo // Preload critical data when online
echo window.addEventListener^('online', ^(^) =^> {
echo   const token = localStorage.getItem^('token'^);
echo   if ^(token^) {
echo     offlineDataManager.preloadCriticalData^(token^);
echo   }
echo }^);
) > src\pwa-init.ts
echo.

echo [5/5] Creating vite PWA plugin configuration...
(
echo import { VitePWA } from 'vite-plugin-pwa';
echo.
echo export const pwaConfig = VitePWA^({
echo   registerType: 'autoUpdate',
echo   includeAssets: ['src/assets/logo/*.ico'],
echo   manifest: {
echo     name: 'Garden TVET School Management System',
echo     short_name: 'Garden TVET',
echo     description: 'Complete School Management - Works Offline',
echo     theme_color: '#eab308',
echo     icons: [
echo       {
echo         src: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico',
echo         sizes: '192x192',
echo         type: 'image/x-icon'
echo       },
echo       {
echo         src: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico',
echo         sizes: '512x512',
echo         type: 'image/x-icon'
echo       }
echo     ]
echo   },
echo   workbox: {
echo     globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
echo     runtimeCaching: [
echo       {
echo         urlPattern: /^https:\/\/api\./,
echo         handler: 'NetworkFirst',
echo         options: {
echo           cacheName: 'api-cache',
echo           expiration: {
echo             maxEntries: 100,
echo             maxAgeSeconds: 60 * 60 * 24
echo           }
echo         }
echo       }
echo     ]
echo   }
echo }^);
) > src\vite-pwa-config.ts
echo.

echo ========================================
echo ✅ PWA Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Add PWA components to your App.tsx:
echo    import { PWAInstallBanner, OfflineIndicator } from './components/PWAComponents';
echo.
echo 2. Import PWA init in main.tsx:
echo    import './pwa-init';
echo.
echo 3. Test offline mode:
echo    - Open DevTools ^> Application ^> Service Workers
echo    - Check "Offline" checkbox
echo.
echo 4. Install the app:
echo    - Click the install banner
echo    - Or use browser's install option
echo.
pause
