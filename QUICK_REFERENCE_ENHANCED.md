# ⚡ QUICK REFERENCE - Enhanced Features

## 🚀 One Command Setup
```bash
ENHANCE-ALL-FEATURES.bat
```

## 📦 Install Dependencies
```bash
cd backend
npm install express-rate-limit helmet
```

## 🔌 Socket.IO Client Setup
```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});
```

## 🔔 Notifications
```javascript
// Get notifications
GET /api/notifications?page=1&limit=20&unread_only=true

// Mark as read
POST /api/notifications/:id/read

// Mark all as read
POST /api/notifications/read-all
```

## 📊 Analytics
```javascript
// Track event
POST /api/analytics/track
{ event_type: 'page_view', event_data: {...} }

// Get dashboard
GET /api/analytics/dashboard?start_date=2024-01-01
```

## 💬 Comments
```javascript
// Get comments
GET /api/comments/:entity_type/:entity_id

// Post comment
POST /api/comments
{ entity_type: 'student', entity_id: 123, comment: 'text' }
```

## ⭐ Favorites
```javascript
// Add favorite
POST /api/favorites
{ entity_type: 'course', entity_id: 456 }

// Remove favorite
DELETE /api/favorites/:entity_type/:entity_id

// Get all favorites
GET /api/favorites
```

## ⚙️ Settings
```javascript
// Get settings
GET /api/settings

// Update settings
PUT /api/settings
{ theme: 'dark', language: 'en', notifications_enabled: true }
```

## 🔴 Real-Time Events

### Notifications
```javascript
socket.on('notification:new', (data) => {});
```

### Live Updates
```javascript
socket.emit('subscribe:entity', { entity_type: 'student', entity_id: 123 });
socket.on('entity:updated', (data) => {});
```

### Messaging
```javascript
socket.emit('message:send', { recipient_id: 456, message: 'Hi' });
socket.on('message:new', (data) => {});
```

### Presence
```javascript
socket.emit('presence:update', 'online');
socket.on('presence:changed', (data) => {});
```

### Dashboard
```javascript
socket.emit('dashboard:subscribe', 'admin');
socket.on('dashboard:stats', (stats) => {});
```

## 🎨 UI Components
```tsx
import { NotificationBell } from '@/components/enhanced/NotificationBell';
import { LiveIndicator } from '@/components/enhanced/LiveIndicator';

<NotificationBell />
<LiveIndicator isOnline={true} />
```

## 🛡️ Security
- Rate limit: 100 req/15min
- Auth limit: 5 attempts/15min
- JWT required for Socket.IO

## 📈 Performance
- Cache TTL: 3600s (1 hour)
- Dashboard updates: Every 5s
- API response: < 100ms

## 🎯 Quick Tips
1. Always authenticate Socket.IO with JWT token
2. Use caching for frequently accessed data
3. Subscribe only to needed entities
4. Unsubscribe when component unmounts
5. Handle Socket.IO reconnection

## 🔧 Troubleshooting
- **No real-time updates?** Check Socket.IO connection
- **Slow API?** Enable caching
- **Too many notifications?** Adjust priority filters
- **Rate limited?** Wait 15 minutes or increase limits

## 📚 Full Documentation
See `ALL_FEATURES_ENHANCED.md` for complete guide
