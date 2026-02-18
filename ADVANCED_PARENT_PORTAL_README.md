# 🎓 Advanced Parent Portal - Complete Guide

## 🌟 Overview

A comprehensive, feature-rich parent portal system with **real payment processing**, **SMS notifications**, **real-time student data**, and **DOD (Director of Discipline) messaging**.

---

## ✨ Features Implemented

### 1. **Real Student Data Integration** 📊
- ✅ Real grades from `student_grades` table
- ✅ Real attendance from `student_attendance` table
- ✅ Real discipline records from `discipline_records` table
- ✅ Live GPA and attendance percentage
- ✅ Real fee balance tracking

### 2. **Real Payment System** 💳
**Mobile Money Integration:**
- ✅ MTN Mobile Money (Rwanda)
- ✅ Airtel Money (Rwanda)
- ✅ Payment processing via API
- ✅ Transaction tracking
- ✅ Payment history
- ✅ Real-time balance updates

**API Endpoints:**
- `POST /api/payments/process` - Process payment
- `GET /api/payments/history/:student_id` - Get payment history

### 3. **SMS Notification System** 📱
**Africa's Talking Integration:**
- ✅ Payment confirmation SMS
- ✅ Grade notification SMS
- ✅ Discipline notification SMS
- ✅ Leave request SMS
- ✅ General announcements

**API Endpoints:**
- `POST /api/sms/send-payment-confirmation`
- `POST /api/sms/send-dod-notification`
- `POST /api/sms/send-grade-notification`

### 4. **DOD Messaging System** 📬
**Automated Notifications:**
- ✅ Student leave requests
- ✅ Conduct/discipline issues
- ✅ Sick leave notifications
- ✅ General announcements
- ✅ Real-time message delivery
- ✅ Read/unread tracking

**API Endpoints:**
- `GET /api/parent-dashboard/dod-messages` - Get all messages
- `PUT /api/parent-dashboard/dod-messages/:id/read` - Mark as read

### 5. **Level 4 SOD Students** 🎯
**Database Population:**
- ✅ 20 Level 4 Software Development students added
- ✅ Complete student profiles
- ✅ Realistic GPAs (60-80 range)
- ✅ Attendance rates (75-95%)
- ✅ Fee balances (50k-250k RWF)

### 6. **Staff Management Integration** 👥
**All staff roles can manage Level 4 SOD students:**
- ✅ DOD (Director of Discipline)
- ✅ DOS (Director of Studies)
- ✅ Headmaster
- ✅ Teachers
- ✅ Advisors
- ✅ Accountants

---

## 🚀 Setup Instructions

### 1. Database Setup

```bash
# Run SQL migration
cd backend
mysql -u root -p garden_tvet_db < migrations/create-enhanced-parent-tables.sql
```

### 2. Add Level 4 SOD Students

**Option A - Windows:**
```bash
cd backend
run-add-sod-students.bat
```

**Option B - Command Line:**
```bash
cd backend
node migrations/add-level-4-sod-students.js
```

### 3. Environment Variables

Copy `.env.advanced.example` to `.env` and configure:

```env
# Mobile Money
PAYMENT_API_URL=https://api.mtn.com/collection/v1_0/requesttopay
PAYMENT_API_KEY=your_mtn_api_key

# SMS (Africa's Talking)
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_USERNAME=your_username
SMS_SENDER_ID=GARDEN_TVET
```

### 4. Start Server

```bash
cd backend
npm start
```

---

## 📱 Parent Portal Features

### Dashboard Sections

#### 1. **Student Overview**
- All linked children
- Quick stats (GPA, Attendance, Balance)
- Student selector

#### 2. **Grades Tab**
- Subject-wise performance
- Exam types (Final, Mid-term, Projects)
- Grade letters (A+, A, B+, etc.)
- Score percentages
- Color-coded badges

#### 3. **Discipline Tab**
- Incident records
- Action taken
- Status tracking
- Clean record recognition

#### 4. **DOD Messages Tab**
- Leave notifications
- Conduct issues
- Sick leave alerts
- Unread badges
- Message categories

#### 5. **Attendance Tab**
- Overall attendance percentage
- Present/Absent/Late tracking
- Date-wise records

#### 6. **Payment Section**
- Current balance
- One-click payment
- Mobile Money integration
- Payment history
- SMS confirmations

---

## 🔐 API Authentication

All endpoints require JWT authentication:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 📊 Database Schema

### New Tables Created:

1. **student_grades** - Academic records
2. **discipline_records** - Discipline tracking
3. **parent_messages** - DOD communications
4. **student_attendance** - Attendance tracking
5. **payment_logs** - Payment history
6. **sms_logs** - SMS delivery tracking

---

## 🎨 UI Features

### Design Elements:
- ✅ Green-Yellow gradient theme
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animations (Framer Motion)
- ✅ Real-time updates
- ✅ Badge notifications
- ✅ Color-coded statuses
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

---

## 🧪 Testing

### Test Payment Flow:

1. Login as parent
2. Select linked student
3. Click "Pay Fees"
4. Enter amount and phone number
5. Confirm payment
6. Receive SMS confirmation

### Test DOD Messages:

1. Login as DOD
2. Create discipline/leave record
3. Parent automatically receives message
4. Parent gets SMS notification
5. View in Messages tab

---

## 🔄 Workflow

### Parent Registration → Dashboard Flow:

1. **Register** → `POST /api/parent-registration/register`
2. **Link Student** → Form with student details
3. **Auto-Search** → Finds student in database
4. **Dashboard** → Shows all student data
5. **Real-time Updates** → Live grades, attendance, fees

---

## 📞 Support

### SMS Provider Setup:
**Africa's Talking:** https://africastalking.com
1. Create account
2. Get API key
3. Add to `.env`
4. Test with sandbox

### Payment Provider Setup:
**MTN Mobile Money:** Contact MTN Rwanda
**Airtel Money:** Contact Airtel Rwanda

---

## 🎯 Key Benefits

1. **Real Data** - No mock data, everything from database
2. **Real Payments** - Actual mobile money integration
3. **Real SMS** - SMS gateway integration
4. **Real-time** - Live updates and notifications
5. **Secure** - JWT authentication, role-based access
6. **Scalable** - Built for production use
7. **Feature-Rich** - Comprehensive functionality

---

## 📝 Notes

- All Level 4 SOD students are manageable by all staff roles
- Payment processing requires valid API credentials
- SMS sending requires Africa's Talking account
- DOD messages are automatically sent on discipline/leave events
- Parents receive SMS for all important events

---

## 🚨 Important

**Before Going Live:**
1. ✅ Configure production API keys
2. ✅ Set up SSL/HTTPS
3. ✅ Test payment webhooks
4. ✅ Verify SMS delivery
5. ✅ Backup database
6. ✅ Enable error logging

---

**Created by:** Garden TVET Development Team
**Version:** 2.0
**Last Updated:** 2026
