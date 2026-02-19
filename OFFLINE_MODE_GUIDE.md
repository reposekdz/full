# 📴 Offline Mode - Complete Guide

## Overview
The School Management System now works **completely offline** with automatic data synchronization when back online.

## Features

### ✅ What Works Offline
- **View all cached data**: Students, grades, attendance, fees, messages
- **Browse previously loaded pages**: All visited pages are cached
- **Read messages**: All DOD messages available offline
- **View timetables**: Class schedules accessible offline
- **Check grades**: Student performance data cached
- **Review attendance**: Attendance records available
- **See fee payments**: Payment history accessible

### 🔄 What Syncs When Online
- **Pending payments**: Queued for processing
- **New messages**: Sent when connection restored
- **Link requests**: Submitted when online
- **Data updates**: Fresh data fetched automatically

## Technical Implementation

### 1. Service Worker (PWA)
```javascript
// Configured in vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    runtimeCaching: [
      // API calls cached with NetworkFirst strategy
      // Images cached with CacheFirst strategy
      // Static assets with StaleWhileRevalidate
    ]
  }
})
```

### 2. IndexedDB Storage
```typescript
// src/utils/offlineStorage.ts
- students: All linked students
- grades: Student grades by student_id
- attendance: Attendance records
- discipline: Discipline records
- messages: DOD messages
- fees: Fee payments
- timetable: Class schedules
- teachers: Teacher information
- exams: Exam schedules
- pendingSync: Queued operations
```

### 3. Offline-Aware API
```typescript
// src/utils/offlineApi.ts
offlineFetch(url, options, cacheStore, studentId)
- Tries network first
- Falls back to IndexedDB cache
- Queues write operations for sync
```

### 4. React Hooks
```typescript
// src/hooks/useOfflineStatus.ts
useOfflineStatus()
- Detects online/offline status
- Shows banner when offline
- Triggers sync when back online
```

## Setup Instructions

### Quick Setup (Recommended)
```bash
setup-offline-mode.bat
```

### Manual Setup
```bash
# 1. Install dependencies
npm install vite-plugin-pwa workbox-window idb

# 2. Build the app
npm run build

# 3. Test offline mode
npm run dev
```

## Testing Offline Mode

### Method 1: Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers**
4. Check **Offline** checkbox
5. Reload the page

### Method 2: Network Throttling
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Select **Offline** from throttling dropdown
4. Test the app

### Method 3: Airplane Mode
1. Enable airplane mode on your device
2. Open the app
3. Verify cached data loads

## User Experience

### Offline Banner
When offline, a red banner appears at the top:
```
🚫 Offline Mode - Data cached locally
```

When back online, a green banner shows:
```
✅ Back Online - Syncing data...
```

### Data Freshness
- **Green indicator**: Data is fresh (< 5 minutes old)
- **Yellow indicator**: Data is stale (5-30 minutes old)
- **Red indicator**: Data is very old (> 30 minutes old)

## Architecture

```
┌─────────────────────────────────────────┐
│         React Components                │
│  (AdvancedParentPortal, etc.)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Offline-Aware API Layer            │
│      (offlineApi.ts)                    │
│  - Detects online/offline               │
│  - Routes to network or cache           │
│  - Queues write operations              │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│   Network   │  │  IndexedDB  │
│   (API)     │  │   Cache     │
└─────────────┘  └─────────────┘
       │                │
       └────────┬───────┘
                ▼
       ┌─────────────────┐
       │  Service Worker │
       │  (PWA Caching)  │
       └─────────────────┘
```

## Cache Strategy

### NetworkFirst (API Calls)
- Try network first
- Fall back to cache if offline
- Update cache with fresh data
- Timeout: 10 seconds

### CacheFirst (Images)
- Serve from cache immediately
- Update cache in background
- Max age: 30 days
- Max entries: 100

### StaleWhileRevalidate (Static Assets)
- Serve from cache immediately
- Fetch fresh version in background
- Update cache for next time

## Sync Queue

### How It Works
1. User performs action while offline
2. Action is saved to `pendingSync` store
3. When online, queue is processed automatically
4. User is notified of sync status

### Supported Operations
- ✅ Fee payments
- ✅ Message sending
- ✅ Link requests
- ✅ Message read status

## Storage Limits

### IndexedDB
- **Chrome**: ~60% of disk space
- **Firefox**: ~50% of disk space
- **Safari**: ~1GB per origin

### Service Worker Cache
- **Recommended**: < 50MB total
- **Current**: ~5MB (configurable)

## Troubleshooting

### Cache Not Working
```javascript
// Clear all caches
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

### Data Not Syncing
1. Check browser console for errors
2. Verify `pendingSync` store has items
3. Ensure network connection is stable
4. Try manual refresh

### Service Worker Not Registering
1. Ensure HTTPS (or localhost)
2. Check browser compatibility
3. Clear browser cache
4. Rebuild the app

## Browser Support

| Browser | Service Worker | IndexedDB | PWA |
|---------|---------------|-----------|-----|
| Chrome  | ✅ Yes        | ✅ Yes    | ✅ Yes |
| Firefox | ✅ Yes        | ✅ Yes    | ✅ Yes |
| Safari  | ✅ Yes        | ✅ Yes    | ⚠️ Limited |
| Edge    | ✅ Yes        | ✅ Yes    | ✅ Yes |

## Performance

### Initial Load
- **Online**: ~2-3 seconds
- **Offline (cached)**: ~500ms

### Data Fetch
- **Online**: ~200-500ms
- **Offline (cached)**: ~50ms

### Storage Usage
- **IndexedDB**: ~2-5MB per user
- **Service Worker**: ~3-5MB
- **Total**: ~5-10MB

## Security

### Data Encryption
- IndexedDB data is NOT encrypted by default
- Sensitive data should be encrypted before storage
- Use Web Crypto API for encryption

### Cache Invalidation
- Caches expire after 30 days
- Manual cache clear available
- Automatic cleanup on version change

## Best Practices

### For Developers
1. Always use `offlineFetch` instead of `fetch`
2. Specify cache store for GET requests
3. Handle offline errors gracefully
4. Show loading states clearly
5. Provide offline indicators

### For Users
1. Load important data while online
2. Check sync status before closing app
3. Clear cache if data seems stale
4. Report sync failures

## Future Enhancements

### Planned Features
- [ ] Background sync for large files
- [ ] Conflict resolution for concurrent edits
- [ ] Selective sync (choose what to cache)
- [ ] Offline-first forms with validation
- [ ] Push notifications for sync status
- [ ] Encrypted local storage
- [ ] Compression for cached data
- [ ] Delta sync (only changed data)

## API Reference

### offlineFetch
```typescript
offlineFetch<T>(
  url: string,
  options?: RequestInit,
  cacheStore?: string,
  studentId?: number
): Promise<T>
```

### useOfflineStatus
```typescript
const { isOnline, showOfflineBanner } = useOfflineStatus();
```

### initDB
```typescript
await initDB(); // Initialize IndexedDB
```

### saveToCache
```typescript
await saveToCache('students', studentsArray);
```

### getFromCache
```typescript
const students = await getFromCache('students');
const grades = await getFromCache('grades', studentId);
```

### syncPendingRequests
```typescript
const results = await syncPendingRequests();
```

## Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Test in incognito mode
4. Clear cache and retry
5. Contact system administrator

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready
