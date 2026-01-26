# SMS Messaging System Documentation

## Overview

A comprehensive SMS messaging system that allows authorized school staff to send messages to parents via SMS (Africa's Talking API) and in-app notifications (Socket.IO). The system intelligently routes messages based on whether parents have smartphones.

## Features

### 🎯 Core Features
- **Dual Delivery System**: Messages sent via both app and SMS for smartphone users
- **SMS-Only Delivery**: For parents without smartphones
- **Real-time Status**: Live delivery status via Socket.IO
- **Role-Based Access**: Only authorized staff can send messages
- **Bulk Messaging**: Send to multiple parents at once
- **Class Messaging**: Send to all parents of a specific class
- **Broadcast Messaging**: Send to all parents (admin/director only)
- **Message Templates**: Pre-defined templates for common scenarios
- **Message History**: Track all sent messages
- **Statistics Dashboard**: View sending statistics
- **Balance Tracking**: Monitor Africa's Talking balance

### 👥 Authorized Roles
- Admin
- Director
- Director of Studies (DOS)
- Director of Discipline (DOD)
- Teacher
- Class Teacher
- Accountant
- Secretary
- Advisor

## Architecture

### Backend Components

#### 1. SMS Service (`backend/services/smsService.js`)
- Integrates with Africa's Talking API
- Handles SMS sending and delivery
- Phone number formatting
- Balance checking
- Message logging
- Statistics generation

#### 2. SMS Routes (`backend/routes/sms.js`)
- `/api/sms/send` - Send to single parent
- `/api/sms/bulk` - Send to multiple parents
- `/api/sms/send-to-class` - Send to class parents
- `/api/sms/send-to-all` - Send to all parents (admin/director only)
- `/api/sms/history` - Get message history
- `/api/sms/stats` - Get statistics
- `/api/sms/balance` - Check Africa's Talking balance
- `/api/sms/parent/:parentId/preferences` - Get parent preferences
- `/api/sms/parent/:parentId/smartphone` - Update smartphone status

#### 3. Database Schema

**sms_messages**
```sql
- id (INT, PRIMARY KEY)
- recipient (VARCHAR(20))
- message (TEXT)
- sender_id (INT, FOREIGN KEY -> staff.id)
- status (ENUM: pending, sent, failed, delivered)
- provider (VARCHAR(50))
- metadata (JSON)
- response (TEXT)
- error (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**parents (updated)**
```sql
- has_smartphone (BOOLEAN)
- preferred_contact_method (ENUM: sms, app, dual)
- last_sms_received (TIMESTAMP)
- sms_opt_out (BOOLEAN)
```

**sms_templates**
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR(100))
- category (ENUM: academic, discipline, finance, general, emergency)
- message_template (TEXT)
- variables (JSON)
- created_by (INT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

**sms_campaigns**
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR(200))
- message (TEXT)
- target_audience (ENUM: all, class, grade, custom)
- target_filter (JSON)
- total_recipients (INT)
- sent_count (INT)
- failed_count (INT)
- created_by (INT)
- status (ENUM: draft, scheduled, sending, completed, cancelled)
- scheduled_at (TIMESTAMP)
```

### Frontend Components

#### SMSMessagingPage (`src/app/pages/SMSMessagingPage.tsx`)
Full-featured messaging interface with:
- Single parent messaging
- Bulk parent selection
- Class-based messaging
- Broadcast messaging
- Message templates
- Real-time status updates
- Message history
- Statistics dashboard

## Setup Instructions

### 1. Run Setup Script
```bash
setup-sms-system.bat
```

This will:
- Install Africa's Talking SDK
- Create database tables
- Insert default templates

### 2. Manual Setup (Alternative)

#### Install Dependencies
```bash
cd backend
npm install africastalking
```

#### Setup Database
```bash
node scripts/setup-sms-system.js
```

### 3. Configuration

The Africa's Talking API key is already configured:
```javascript
apiKey: 'atsk_d53924f3401f197002d867a93dd86ac7404952e2062869c26090eebd4e09955ffd1a8013'
username: 'sandbox' // Change to your username in production
```

## Usage

### Sending to Single Parent

**Request:**
```javascript
POST /api/sms/send
{
  "parentId": 123,
  "message": "Your child was absent today",
  "staffId": 1
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Message sent via app and SMS",
  "method": "dual",
  "data": { ... }
}
```

### Sending to Multiple Parents

**Request:**
```javascript
POST /api/sms/bulk
{
  "parentIds": [123, 456, 789],
  "message": "Parent meeting tomorrow at 2 PM",
  "staffId": 1,
  "filterBySmartphone": null // or "smartphone-only" or "non-smartphone-only"
}
```

**Response:**
```javascript
{
  "success": true,
  "results": {
    "total": 3,
    "sent": 2,
    "failed": 1,
    "details": [...]
  }
}
```

### Sending to Class

**Request:**
```javascript
POST /api/sms/send-to-class
{
  "classId": 5,
  "message": "Class trip next week",
  "staffId": 1
}
```

### Sending to All Parents

**Request:**
```javascript
POST /api/sms/send-to-all
{
  "message": "School closed tomorrow due to holiday",
  "staffId": 1
}
```

**Note:** Only admin and director roles can use this endpoint.

## Socket.IO Events

### Client Listens To:
- `sms:sending` - Message is being sent
- `sms:sent` - Message sent successfully
- `sms:failed` - Message failed to send
- `sms:partial` - Message sent via app only (SMS failed)
- `parent:message` - In-app message for smartphone users

### Event Data Structure:
```javascript
{
  parentId: number,
  parentName: string,
  phone: string,
  status: 'sending' | 'success' | 'failed',
  method: 'sms-only' | 'dual' | 'app-only',
  error?: string,
  timestamp: Date
}
```

## Message Flow

### For Parents WITH Smartphones:
1. Staff sends message
2. System sends in-app notification via Socket.IO
3. System sends SMS via Africa's Talking (backup)
4. Parent receives message in app AND via SMS
5. Status: "dual"

### For Parents WITHOUT Smartphones:
1. Staff sends message
2. System sends SMS via Africa's Talking
3. Parent receives message via SMS only
4. Status: "sms-only"

## Default Message Templates

1. **Student Absence** (Academic)
   - "Dear Parent, your child {student_name} was absent from school on {date}..."

2. **Fee Reminder** (Finance)
   - "Dear Parent, this is a reminder that school fees of {amount} RWF..."

3. **Exam Results** (Academic)
   - "Dear Parent, {student_name} scored {marks}% in {subject} exam..."

4. **Discipline Notice** (Discipline)
   - "Dear Parent, we need to discuss {student_name} behavior..."

5. **Emergency Alert** (Emergency)
   - "URGENT: {message}. Please contact the school immediately."

6. **Meeting Invitation** (General)
   - "Dear Parent, you are invited to a parents meeting on {date}..."

7. **Achievement Notification** (Academic)
   - "Congratulations! {student_name} has achieved {achievement}..."

## Security & Permissions

### Role-Based Access Control
- Middleware checks staff role before allowing SMS operations
- Only authorized roles can access SMS endpoints
- Admin and director have additional privileges (send to all)

### Permission Check:
```javascript
const ALLOWED_ROLES = [
  'admin', 'director', 'dos', 'dod', 
  'teacher', 'class_teacher', 'accountant', 
  'secretary', 'advisor'
];
```

## Monitoring & Analytics

### Statistics Available:
- Total messages sent
- Success rate
- Failed messages
- Unique recipients
- Unique senders
- Messages by date range

### Message History:
- Filter by sender
- Filter by recipient
- Filter by status
- Filter by date range
- Limit results

## Best Practices

1. **Message Length**: Keep messages under 160 characters
2. **Phone Format**: Use international format (+250...)
3. **Balance Monitoring**: Check balance regularly
4. **Template Usage**: Use templates for consistency
5. **Bulk Sending**: Add small delays between messages
6. **Error Handling**: Always check response status
7. **Parent Preferences**: Respect opt-out preferences

## Troubleshooting

### Common Issues:

**1. SMS Not Sending**
- Check Africa's Talking balance
- Verify phone number format
- Check API key validity
- Review error logs

**2. Socket.IO Not Working**
- Verify Socket.IO server is running
- Check client connection
- Review browser console for errors

**3. Permission Denied**
- Verify staff role is in ALLOWED_ROLES
- Check staffId is valid
- Review middleware logs

## API Reference

### Check Balance
```javascript
GET /api/sms/balance
Response: { success: true, balance: "USD 10.50" }
```

### Get Statistics
```javascript
GET /api/sms/stats?dateFrom=2024-01-01&dateTo=2024-12-31
Response: {
  success: true,
  stats: {
    total_messages: 1500,
    sent_count: 1450,
    failed_count: 50,
    unique_recipients: 300
  }
}
```

### Get Message History
```javascript
GET /api/sms/history?senderId=1&limit=50
Response: {
  success: true,
  messages: [...]
}
```

## Production Deployment

### Before Going Live:

1. **Update API Credentials**
   ```javascript
   username: 'YOUR_ACTUAL_USERNAME' // Change from 'sandbox'
   ```

2. **Add Environment Variables**
   ```env
   AFRICASTALKING_API_KEY=your_api_key
   AFRICASTALKING_USERNAME=your_username
   ```

3. **Enable SSL/TLS**
   - Use HTTPS for API calls
   - Secure Socket.IO connections

4. **Set Up Monitoring**
   - Track delivery rates
   - Monitor API usage
   - Set up alerts for failures

5. **Configure Rate Limiting**
   - Prevent API abuse
   - Implement request throttling

## Support

For issues or questions:
- Check Africa's Talking documentation: https://developers.africastalking.com/
- Review server logs: `backend/server.log`
- Test API endpoints using Postman or similar tools

## License

MIT License - See LICENSE file for details
