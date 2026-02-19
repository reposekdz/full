# 📴 Offline Mode - Quick Reference

## 🚀 Quick Setup
```bash
setup-offline-mode.bat
```

## ✅ What Works Offline
- ✅ View students, grades, attendance
- ✅ Read messages and notifications
- ✅ Check fee payments and balance
- ✅ View timetables and schedules
- ✅ Browse teacher information
- ✅ See exam schedules

## 🔄 What Syncs Later
- 💰 Fee payments
- 📧 Messages to teachers
- 🔗 Student link requests
- ✓ Message read status

## 🧪 Test Offline Mode
1. Open DevTools (F12)
2. Application → Service Workers
3. Check "Offline"
4. Reload page

## 📊 Storage
- **IndexedDB**: Student data, grades, messages
- **Service Worker**: Pages, images, assets
- **Total**: ~5-10MB per user

## 🔧 Troubleshooting
```javascript
// Clear cache
caches.keys().then(keys => keys.forEach(k => caches.delete(k)));

// Unregister service worker
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(r => r.unregister()));
```

## 📱 User Experience
- **Red Banner**: Offline mode active
- **Green Banner**: Back online, syncing
- **Auto-sync**: Happens automatically

## 🎯 Key Files
- `src/utils/offlineStorage.ts` - IndexedDB
- `src/utils/offlineApi.ts` - API wrapper
- `src/hooks/useOfflineStatus.ts` - Status hook
- `src/components/OfflineBanner.tsx` - UI banner
- `vite.config.ts` - PWA config

## 📖 Full Documentation
See `OFFLINE_MODE_GUIDE.md` for complete details.
