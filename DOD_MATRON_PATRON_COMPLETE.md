# DOD/Matron/Patron Management System - Complete

## ✅ System Overview

A **fully functional, Kinyarwanda-first** discipline management system shared between DOD (Director of Discipline), Matron, and Patron with real database integration.

## 🎯 Shared Access

### Roles with Full Access:
- ✅ **DOD (Director of Discipline)** - Full management access
- ✅ **Matron** - Full management access (female students focus)
- ✅ **Patron** - Full management access (male students focus)

All three roles share the same dashboard and functionality.

## 🇷🇼 Pure Kinyarwanda Interface

### Navigation (Kinyarwanda):
- **Ikibaho** - Dashboard/Overview
- **Umwirondoro** - Profile
- **Amakosa** - Discipline/Conduct
- **Ibizamini** - Exams
- **Abanyeshuri** - Students
- **Imbonerahamwe** - Student Sheets
- **Raporo** - Reports
- **Ibihano** - Punishments
- **Ababyeyi** - Parents

### Action Tracking:
- Shows "Byakozwe na: [Staff Name]" (Performed by: [Staff Name])
- Tracks who removed conduct, granted leave, or punished students
- Full audit trail in Kinyarwanda

## 📊 Key Features

### 1. **Student Sheets Access**
- Navigate to `/student-sheets`
- Select Trade (SOD/BDC/AUT)
- Select Level (3, 4, 4A, 4B, 5, 5A, 5B)
- View all students in that class
- Add custom columns for discipline tracking
- Real-time database updates

### 2. **Conduct Removal (Gukuraho Imyitwarire)**
- Select student
- Choose conduct type (warning, suspension, etc.)
- Set severity (low, medium, high, critical)
- Add description in Kinyarwanda
- Specify action taken
- Auto-notifies parents via SMS/WhatsApp
- Tracks who performed the action

### 3. **Leave Management (Gucunga Uruhushya)**
- Grant student leave
- Types: Sick, Home Visit, Emergency, Family Matter
- Set start/end times
- Specify lessons missed
- Auto-notifies parents
- Tracks approval by DOD/Matron/Patron

### 4. **Punishment System (Ibihano)**
- Record punishments
- Track severity
- Monitor repeat offenders
- Generate reports
- Parent notifications

### 5. **Parent Communication (Itumanaho n'Ababyeyi)**
- Message individual parents
- Bulk messaging
- SMS/WhatsApp integration
- Priority levels
- Delivery tracking

## 🔌 Real Database APIs

### Student Management
```
GET    /api/management/students              - Get all students
GET    /api/management/sheets/:trade/:level  - Get student sheet
POST   /api/management/columns               - Add discipline column
PUT    /api/management/students/:id/columns/:colId  - Update values
```

### Discipline Actions
```
POST   /api/discipline-management/conduct/remove  - Remove conduct
POST   /api/discipline-management/leave/grant     - Grant leave
POST   /api/discipline-management/incidents/create - Record incident
POST   /api/discipline-management/message-parents  - Message parents
```

### Authorization
All endpoints check for roles: `dod`, `director_discipline`, `matron`, `patron`

## 🎨 Features by Action

### Conduct Removal (Gukuraho Imyitwarire)
**Who can do it:** DOD, Matron, Patron
**Process:**
1. Select student from dropdown
2. Choose conduct type
3. Set severity level
4. Write description in Kinyarwanda
5. Specify action taken
6. System auto-notifies parents
7. Records who performed action

**Kinyarwanda Labels:**
- Hitamo Umunyeshuri - Select Student
- Ubwoko bw'Ikosa - Conduct Type
- Urwego rw'Ikosa - Severity
- Ibisobanuro - Description
- Icyakozwe - Action Taken

### Leave Granting (Gutanga Uruhushya)
**Who can do it:** DOD, Matron, Patron
**Process:**
1. Select student
2. Choose leave type
3. Enter reason in Kinyarwanda
4. Set start/end times
5. Note lessons to be missed
6. System auto-notifies parents
7. Tracks who approved

**Kinyarwanda Labels:**
- Ubwoko bw'Uruhushya - Leave Type
- Impamvu - Reason
- Igihe cyo Gutangira - Start Time
- Igihe cyo Kurangiza - End Time
- Amasomo Azaburizwa - Lessons to Miss

### Punishment Recording (Kwandika Igihano)
**Who can do it:** DOD, Matron, Patron
**Process:**
1. Select student
2. Choose punishment type
3. Set duration
4. Write details in Kinyarwanda
5. Assign follow-up actions
6. Notify parents
7. Track completion

## 📱 Student Sheets Integration

### Access for DOD/Matron/Patron:
1. Click "Imbonerahamwe" in sidebar
2. Or navigate to `/student-sheets`
3. Select Trade: SOD, BDC, or AUT
4. Select Level: 3, 4, 4A, 4B, 5, 5A, 5B
5. View all students in that class

### Add Discipline Columns:
- **Amanota y'Imyitwarire** - Behavior Points
- **Amakosa** - Conduct Violations
- **Ibihano** - Punishments
- **Uruhushya** - Leave Days
- **Ibyitonderwa** - Warnings

### Real-Time Updates:
- When DOS/Headmaster adds student → Auto-appears in sheets
- When DOD removes conduct → Updates in real-time
- When Matron/Patron grants leave → Reflects immediately
- All staff see same data

## 🔒 Role-Based Access

### DOD (Director of Discipline):
- ✅ Full access to all features
- ✅ Can remove conduct
- ✅ Can grant leave
- ✅ Can punish students
- ✅ Can message parents
- ✅ Can view/edit student sheets
- ✅ Can generate reports

### Matron:
- ✅ Same access as DOD
- ✅ Typically manages female students
- ✅ Can perform all discipline actions
- ✅ Shares same dashboard

### Patron:
- ✅ Same access as DOD
- ✅ Typically manages male students
- ✅ Can perform all discipline actions
- ✅ Shares same dashboard

## 📊 Dashboard Statistics (Kinyarwanda)

- **Amakosa (30 iminsi)** - Incidents (30 days)
- **Iburira Bikora** - Active Warnings
- **Guhagarikwa** - Suspensions
- **Abanyeshuri** - Students with Records

## 🚀 How to Use

### For DOD/Matron/Patron:

**1. Remove Conduct:**
```
Dashboard → "Gukuraho Imyitwarire" button
→ Select student
→ Fill form in Kinyarwanda
→ Submit
→ Parents auto-notified
```

**2. Grant Leave:**
```
Dashboard → "Gutanga Uruhushya" button
→ Select student
→ Choose leave type
→ Set dates/times
→ Submit
→ Parents auto-notified
```

**3. View Student Sheets:**
```
Sidebar → "Imbonerahamwe"
→ Select Trade (SOD/BDC/AUT)
→ Select Level
→ View/Edit student data
→ Add discipline columns
```

**4. Message Parents:**
```
Dashboard → "Itumanaho n'Ababyeyi" button
→ Select students (or all)
→ Write message in Kinyarwanda
→ Set priority
→ Send
→ SMS/WhatsApp delivered
```

## 🎯 Action Attribution

Every action shows who performed it:
- "Byakozwe na: Mukamana (DOD)" - Performed by: Mukamana (DOD)
- "Byakozwe na: Uwase (Matron)" - Performed by: Uwase (Matron)
- "Byakozwe na: Nkusi (Patron)" - Performed by: Nkusi (Patron)

This ensures accountability and transparency.

## 📝 Kinyarwanda Terminology

| English | Kinyarwanda |
|---------|-------------|
| Dashboard | Ikibaho |
| Profile | Umwirondoro |
| Discipline | Imyitwarire |
| Conduct | Imyitwarire |
| Punishment | Igihano |
| Leave | Uruhushya |
| Student | Umunyeshuri |
| Students | Abanyeshuri |
| Parents | Ababyeyi |
| Reports | Raporo |
| Exams | Ibizamini |
| Sheets | Imbonerahamwe |
| Warning | Iburira |
| Suspension | Guhagarikwa |
| Performed by | Byakozwe na |
| View All | Reba Byose |

## ✅ Complete Features

1. ✅ Shared access for DOD/Matron/Patron
2. ✅ Pure Kinyarwanda interface
3. ✅ Real database integration
4. ✅ Student sheets access
5. ✅ Conduct removal with tracking
6. ✅ Leave management
7. ✅ Punishment system
8. ✅ Parent notifications (SMS/WhatsApp)
9. ✅ Action attribution
10. ✅ Real-time updates
11. ✅ Export to CSV
12. ✅ Bulk operations
13. ✅ Statistics dashboard
14. ✅ Activity logs

## 🔐 Security

- Role-based authorization
- Action tracking
- Audit trails
- Parent notification logs
- Data encryption

**Everything is fully functional with real database APIs!**
