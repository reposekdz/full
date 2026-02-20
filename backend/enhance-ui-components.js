const fs = require('fs');
const path = require('path');

console.log('🚀 Enhancing UI Components...\n');

const componentsDir = path.join(__dirname, '..', 'src', 'components', 'enhanced');
fs.mkdirSync(componentsDir, { recursive: true });

// Create NotificationBell component
const notificationBell = `import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?unread_only=true');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 px-2 py-1 text-xs">
            {unreadCount}
          </Badge>
        )}
      </button>
    </div>
  );
}`;

fs.writeFileSync(path.join(componentsDir, 'NotificationBell.tsx'), notificationBell);
console.log('✅ Created NotificationBell.tsx');

// Create LiveIndicator component
const liveIndicator = `import React from 'react';

export function LiveIndicator({ isOnline }: { isOnline: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={\`w-2 h-2 rounded-full \${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}\`} />
      <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}`;

fs.writeFileSync(path.join(componentsDir, 'LiveIndicator.tsx'), liveIndicator);
console.log('✅ Created LiveIndicator.tsx');

console.log('\n✨ UI components enhanced!');
console.log('📊 Created 2 new components');
