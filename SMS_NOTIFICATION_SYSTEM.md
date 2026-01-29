# 📱 SMS Notification System - Complete Guide

## 🎯 Overview

The **SMS Notification System** is a comprehensive, production-ready messaging solution that automatically sends SMS and WhatsApp notifications to parents when discipline actions occur. It supports multiple SMS providers, smart delivery routing, and includes a full queue management interface.

## ✨ Key Features

### 🔔 Automatic Notifications
- **Conduct Removal**: Parents receive SMS when student conduct is removed
- **Leave Approval**: Parents receive SMS when student leave is approved
- **Smart Delivery**: WhatsApp for smartphones, SMS for basic phones
- **Dual Delivery**: Send via both WhatsApp AND SMS for critical messages

### 📱 Multi-Provider Support
- **Africa's Talking**: Primary SMS and WhatsApp provider
- **Twilio**: Alternative SMS provider
- **Generic HTTP Gateway**: Support for any SMS gateway
- **Manual Queue**: Fallback for manual sending

### 🌐 Full Kinyarwanda Support
- All UI text in Kinyarwanda
- SMS messages in Kinyarwanda
- Date/time formatting in Rwandan locale

### 🎛️ Queue Management
- View pending, sent, and failed messages
- Retry failed messages
- Mark messages as sent manually
- Real-time status tracking

### 📊 Advanced Features
- Message history and statistics
- Role-based permissions
- Message templates
- Bulk messaging
- Class-based messaging
- School-wide broadcasts

## 🚀 Quick Setup

### 1. Run Setup Script
```bash
setup-sms-notifications.bat
```

### 2. Configure SMS Provider

Edit `backend/.env` and add your credentials:

#### Option A: Africa's Talking (Recommended for Rwanda)
```env
ENABLE_SMS_NOTIFICATIONS=true
AFRICATALKING_API_KEY=your_api_key_here
AFRICATALKING_USERNAME=your_username_here
AFRICATALKING_SHORTCODE=SCHOOL
AFRICATALKING_WHATSAPP_CHANNEL=GARDEN_TSS
```

#### Option B: Twilio
```env
ENABLE_SMS_NOTIFICATIONS=true
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+250788000000
```

#### Option C: Generic HTTP Gateway
```env
ENABLE_SMS_NOTIFICATIONS=true
SMS_GATEWAY_URL=https://your-gateway.com/api/send
SMS_GATEWAY_API_KEY=your_api_key_here
```

### 3. Restart Backend
```bash
cd backend
npm run dev
```

## 📖 How It Works

### Automatic Discipline Notifications

When a DOD/Patron/Matron removes conduct or approves leave:

1. **In-App Notification**: Sent via Socket.IO to parent's app
2. **SMS/WhatsApp Check**: System checks parent's contact preferences
3. **Smart Delivery**:
   - If parent has smartphone → Send via WhatsApp + SMS (dual)
   - If parent has no smartphone → Send via SMS only
4. **Queue Management**: Failed messages go to queue for retry
5. **Tracking**: All messages logged with status and timestamps

### Message Format (Kinyarwanda)

**Conduct Removal:**
```
ISHURI: Umwana wawe [Student Name] yakiriye igihano cya [Type] (severity). 
Impamvu: [Reason]. 
Igikorwa: [Action]. 
Hamagara ishuri kuri 0788000000.
```

**Leave Approval:**
```
ISHURI: Umwana wawe [Student Name] yahawe uruhushya rwo [Type]. 
Impamvu: [Reason]. 
Kuva [Start] kugeza [End]. 
Hamagara ishuri kuri 0788000000.
```

## 🎨 UI Components

### 1. SMS Queue Management (`SMSQueueManagement.tsx`)

**Location**: Discipline Dashboard → SMS Queue

**Features**:
- View all pending, sent, and failed messages
- Search by phone number or message content
- Filter by status (pending/sent/failed)
- Retry failed messages
- Mark messages as sent manually
- Real-time statistics

**Access**: DOD, Patron, Matron, Admin

### 2. SMS Messaging System (`SMSMessagingPage.tsx`)

**Location**: Main Menu → SMS Messaging

**Features**:
- Send to single parent
- Send to multiple parents (bulk)
- Send to entire class
- Send to all parents (admin only)
- Message templates
- Message history
- Statistics dashboard
- Real-time delivery status

**Access**: Admin, Director, DOS, DOD, Teachers, Accountant

## 🔧 API Endpoints

### Discipline SMS Endpoints

```javascript
// Get SMS queue
GET /api/discipline/sms-queue?status=pending
Authorization: Bearer {token}

// Mark SMS as sent
PUT /api/discipline/sms-queue/:id/mark-sent
Authorization: Bearer {token}

// Retry failed SMS
POST /api/discipline/sms-queue/:id/retry
Authorization: Bearer {token}
```

### General SMS Endpoints

```javascript
// Send to single parent
POST /api/sms/send
Body: { parentId, message, staffId }

// Send bulk
POST /api/sms/bulk
Body: { parentIds[], message, staffId }

// Send to class
POST /api/sms/send-to-class
Body: { classId, message, staffId }

// Send to all (admin only)
POST /api/sms/send-to-all
Body: { message, staffId }

// Get templates
GET /api/sms/templates

// Get history
GET /api/sms/history?senderId={id}&limit=100

// Get statistics
GET /api/sms/stats

// Check balance
GET /api/sms/balance
```

## 🗄️ Database Schema

### `sms_queue` Table
```sql
- id: INT (Primary Key)
- phone_number: VARCHAR(20)
- message: TEXT
- status: ENUM('pending', 'sent', 'failed')
- error_message: TEXT
- sent_at: TIMESTAMP
- created_at: TIMESTAMP
```

### `sms_messages` Table
```sql
- id: INT (Primary Key)
- recipient: VARCHAR(20)
- message: TEXT
- sender_id: INT
- status: ENUM('pending', 'sent', 'failed')
- provider: VARCHAR(50)
- metadata: JSON
- response: TEXT
- error: TEXT
- created_at: TIMESTAMP
```

### `sms_templates` Table
```sql
- id: INT (Primary Key)
- name: VARCHAR(100)
- template_category: VARCHAR(50)
- message_template: TEXT
- variables: JSON
- is_active: BOOLEAN
- created_by: INT
- created_at: TIMESTAMP
```

### `sms_role_permissions` Table
```sql
- id: INT (Primary Key)
- role: VARCHAR(50) UNIQUE
- can_send_single: BOOLEAN
- can_send_bulk: BOOLEAN
- can_send_class: BOOLEAN
- can_send_all: BOOLEAN
- can_view_history: BOOLEAN
- can_view_stats: BOOLEAN
- can_create_templates: BOOLEAN
```

## 🔐 Role Permissions

| Role | Single | Bulk | Class | All | History | Stats | Templates |
|------|--------|------|-------|-----|---------|-------|-----------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Director | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DOS | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| DOD | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Patron/Matron | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Teacher | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Accountant | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |

## 🧪 Testing

### Test Automatic Notifications

1. Login as DOD/Patron/Matron
2. Go to Discipline Management
3. Remove conduct for a student with connected parent
4. Check SMS Queue Management to see message status
5. Parent should receive SMS on registered phone

### Test Manual Messaging

1. Login as Admin/Director
2. Go to SMS Messaging System
3. Select "Single Parent" tab
4. Choose a parent and type message
5. Click "Send Message"
6. Check message history for delivery status

### Test Queue Management

1. Go to SMS Queue Management
2. View pending messages
3. Click "Retry" on failed message
4. Mark pending message as sent manually
5. Filter by status and search

## 🐛 Troubleshooting

### Messages Not Sending

**Check**:
1. `.env` file has correct SMS provider credentials
2. `ENABLE_SMS_NOTIFICATIONS=true` in `.env`
3. Parent has valid phone number in database
4. SMS provider account has sufficient balance
5. Backend server is running

**Solution**:
```bash
# Check backend logs
cd backend
npm run dev

# Look for SMS errors in console
```

### Messages Stuck in Queue

**Check**:
1. SMS provider API is accessible
2. Phone numbers are in correct format (+250...)
3. No rate limiting from provider

**Solution**:
- Use "Retry" button in SMS Queue Management
- Or mark as sent manually if sent via other means

### WhatsApp Not Working

**Check**:
1. Africa's Talking WhatsApp channel is configured
2. `AFRICATALKING_WHATSAPP_CHANNEL` is set in `.env`
3. Parent's phone number is WhatsApp-enabled

**Solution**:
- System will automatically fallback to SMS if WhatsApp fails

## 📊 Monitoring

### Check SMS Balance
```javascript
GET /api/sms/balance
```

### View Statistics
```javascript
GET /api/sms/stats
```

### View Message History
```javascript
GET /api/sms/history?limit=100
```

## 🔄 Integration Points

### Discipline System
- `backend/routes/discipline.js` - Automatic notifications on conduct removal and leave approval
- Uses `sendUniversalMessage()` from `backend/services/smsService.js`

### Parent Connection System
- Requires approved parent-student connection
- Fetches parent phone from `users` table via `parent_student_connections`

### Socket.IO
- Real-time delivery status updates
- In-app notifications alongside SMS

## 🎯 Best Practices

1. **Always test with test numbers first**
2. **Monitor SMS balance regularly**
3. **Use message templates for consistency**
4. **Review failed messages daily**
5. **Keep parent phone numbers updated**
6. **Use dual delivery for critical messages**
7. **Set up multiple SMS providers for redundancy**

## 📞 Support

For issues or questions:
- Check backend console logs
- Review SMS queue for failed messages
- Verify SMS provider credentials
- Contact SMS provider support if needed

## 🚀 Future Enhancements

- [ ] Scheduled messaging
- [ ] Message personalization with variables
- [ ] SMS delivery reports
- [ ] Cost tracking per message
- [ ] Multi-language support (English, French, Swahili)
- [ ] SMS campaigns
- [ ] Parent reply handling
- [ ] SMS analytics dashboard

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
