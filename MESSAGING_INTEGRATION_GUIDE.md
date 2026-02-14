# Unified Messaging Integration Guide

## ✅ Already Integrated
- **Headmaster Dashboard** (`ModernHeadmasterDashboard.tsx`) - ✅ DONE

## 🚀 Quick Integration for Other Dashboards

### 1. Import the Component
```tsx
import { UnifiedMessaging } from '@/app/components/messaging/UnifiedMessaging';
import { MessageSquare } from 'lucide-react';
```

### 2. Add Messaging Tab
```tsx
// In your tabs array, add:
const tabs = ['overview', 'messaging', 'other-tabs'];

// In your tab buttons:
{tab === 'messaging' && <MessageSquare className="inline h-4 w-4 mr-2" />}
```

### 3. Render Component
```tsx
{activeTab === 'messaging' && (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <UnifiedMessaging userRole="dod" /> {/* Change role: dod, dos, accountant */}
  </motion.div>
)}
```

## 📋 Integration Examples

### DOD Dashboard
```tsx
// In DODDashboardAdvanced.tsx
import { UnifiedMessaging } from '@/app/components/messaging/UnifiedMessaging';

// Add to tabs
const [activeTab, setActiveTab] = useState('students');
// Change to: ['students', 'messaging', 'conduct', 'reports']

// Render
{activeTab === 'messaging' && <UnifiedMessaging userRole="dod" />}
```

### DOS Dashboard
```tsx
// In DOSDashboard.tsx
import { UnifiedMessaging } from '@/app/components/messaging/UnifiedMessaging';

// Add messaging tab
{activeTab === 'messaging' && <UnifiedMessaging userRole="dos" />}
```

### Accountant Dashboard
```tsx
// In AccountantDashboard.tsx
import { UnifiedMessaging } from '@/app/components/messaging/UnifiedMessaging';

// Add messaging tab
{activeTab === 'messaging' && <UnifiedMessaging userRole="accountant" />}
```

## 🎯 Features Available

### All Roles Get:
1. ✅ **Compose Messages** - Send to individual or bulk
2. ✅ **Fee Reminders** - Automated & manual fee reminders
3. ✅ **Message History** - Track all sent messages
4. ✅ **Templates** - Quick message templates
5. ✅ **Smart Filters** - Filter by trade, level, class
6. ✅ **Statistics** - Real-time messaging stats
7. ✅ **Auto-Reminders** - Configure automated fee reminders

### Fee Reminder Features:
- View all students with pending fees
- Send individual reminders
- Bulk send to all with pending fees
- Configure auto-reminder settings:
  - Enable/disable automation
  - Set minimum balance threshold
  - Set daily send time
  - Runs automatically via cron job

## 🔧 Backend APIs (Already Created)

### Messaging APIs
- `POST /api/messaging/send` - Send individual message
- `POST /api/messaging/send-bulk` - Bulk send
- `GET /api/messaging/contacts` - Get parent contacts
- `GET /api/messaging/templates` - Get templates
- `GET /api/messaging/history` - Message history
- `GET /api/messaging/stats` - Statistics

### Fee Reminder APIs
- `GET /api/fee-reminders/pending-fees` - Get students with pending fees
- `POST /api/fee-reminders/send-reminder/:id` - Send to one student
- `POST /api/fee-reminders/send-bulk-reminders` - Send to all
- `GET/POST /api/fee-reminders/auto-reminder-settings` - Configure automation
- `GET /api/fee-reminders/reminder-history` - View history

## 🤖 Automated Fee Reminders

### How It Works:
1. Cron job runs daily at configured time (default 9 AM)
2. Checks all students with pending fees > minimum balance
3. Sends SMS to parents automatically
4. Logs all attempts in database
5. Can be enabled/disabled via settings

### Configuration:
```env
# In .env file
ENABLE_CRON_JOBS=true
AFRICATALKING_API_KEY=your_key
AFRICATALKING_USERNAME=your_username
AFRICATALKING_SENDER_ID=GARDENTVET
```

## 📱 SMS Integration

### Current Status:
- ✅ Africa's Talking API integrated
- ✅ SMS service configured
- ✅ Message logging enabled
- ⚠️ Requires account credit to send

### To Enable SMS:
1. Add credit to Africa's Talking account
2. Register sender ID "GARDENTVET" (optional)
3. Messages will show as "GARDENTVET" instead of phone number

## 🎨 UI Features

### Modern Design:
- Real-time statistics cards
- Tabbed interface (Compose, Fee Reminders, History, Templates)
- Contact selection with checkboxes
- Smart filters (trade, level, class, search)
- Template quick-insert
- Character counter & SMS calculator
- Loading states & animations
- Success/error notifications

### Fee Reminder Tab:
- List of all students with pending fees
- Shows balance amount in RWF
- Individual "Send Reminder" buttons
- "Send All Reminders" bulk action
- Auto-reminder configuration panel

## 🔐 Security

- ✅ JWT authentication required
- ✅ Role-based access control
- ✅ User ID tracking for all messages
- ✅ Audit logs in database

## 📊 Database Tables

### Created Tables:
- `message_templates` - Reusable message templates
- `scheduled_messages` - Scheduled messages queue
- `fee_reminders` - Fee reminder history
- `sms_messages` - All SMS logs (from smsService)

## 🚀 Next Steps

1. **Integrate into remaining dashboards:**
   - DODDashboardAdvanced.tsx
   - DOSDashboard.tsx
   - AccountantDashboard.tsx
   - Any other staff dashboards

2. **Add message templates:**
   ```sql
   INSERT INTO message_templates (name, category, content, role) VALUES
   ('Fee Reminder', 'finance', 'Dear parent, your child has pending fees...', 'all'),
   ('Conduct Warning', 'discipline', 'Dear parent, regarding your child conduct...', 'dod'),
   ('Academic Progress', 'academic', 'Dear parent, your child academic progress...', 'dos');
   ```

3. **Test the system:**
   - Add credit to Africa's Talking
   - Send test messages
   - Configure auto-reminders
   - Monitor logs

## 💡 Tips

- Use templates for common messages
- Filter contacts before bulk sending
- Check message history regularly
- Monitor SMS statistics
- Configure auto-reminders during off-peak hours
- Keep minimum balance threshold reasonable

## 🆘 Troubleshooting

### Messages not sending?
- Check Africa's Talking account balance
- Verify API credentials in .env
- Check parent phone numbers format (+250...)
- Review sms_messages table for errors

### Auto-reminders not working?
- Verify ENABLE_CRON_JOBS=true in .env
- Check cron job is running (console logs)
- Verify auto-reminder settings are enabled
- Check system_settings table

### No contacts showing?
- Verify students have parent_phone filled
- Check database connection
- Review API authentication token
