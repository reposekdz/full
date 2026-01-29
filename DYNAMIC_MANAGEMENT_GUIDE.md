# 🎯 Dynamic Management System - Complete Guide

## Overview
A powerful, real-time management system with dynamic column creation, advanced student management, and parent connection features. All data is stored in the database with full API integration.

---

## 🚀 Quick Setup

```bash
# Run the setup script
setup-dynamic-columns.bat
```

This will:
- Create database tables for dynamic columns
- Create student column values table
- Create parent-student connections table
- Setup all necessary indexes

---

## 📊 Features

### 1. **Accountant: Dynamic Column Management**
Create custom columns for level sheets based on trade and level.

**Features:**
- ✅ Create columns by trade and level
- ✅ Column types: text, number, date, currency, percentage
- ✅ Set default values and required fields
- ✅ Edit student values in real-time
- ✅ Full CRUD operations
- ✅ Automatic data persistence

**Usage:**
1. Navigate to Accountant Dashboard
2. Click "Inkingi z'Imbonerahamwe" tab
3. Select Trade and Level
4. Click "Ongeraho Inkingi Nshya"
5. Fill column details and save
6. Edit student values directly in the table

### 2. **DOS/Headmaster: Advanced Student Management**
Comprehensive student management with trade/level selection.

**Features:**
- ✅ Add students with full details
- ✅ Select trade and level during creation
- ✅ Search and filter by trade/level
- ✅ View full student details (financial, custom values, payments)
- ✅ Update and delete students
- ✅ Guardian information management
- ✅ Real-time notifications

**Usage:**
1. Navigate to DOS Dashboard
2. Click "Ongeraho Umunyeshuri"
3. Fill all required fields
4. Select trade and level
5. Add guardian information
6. Click "Bika Umunyeshuri"

**Student Details Modal:**
- Personal information
- Financial summary (paid, invoiced, balance)
- Custom column values
- Recent payment history

### 3. **Parent: Student Connection System**
Parents can search and connect to their students.

**Features:**
- ✅ Search students by name, code, trade, level
- ✅ Request connection with relationship type
- ✅ View connection status (pending/approved/rejected)
- ✅ Real-time notifications
- ✅ Admin approval workflow

**Usage:**
1. Navigate to Parent Dashboard
2. Search for student by name or code
3. Filter by trade and level (optional)
4. Click "Huza" on the student
5. Select relationship type
6. Submit request
7. Wait for admin approval

### 4. **DOS/Headmaster: Connection Approval**
Approve or reject parent connection requests.

**Features:**
- ✅ View all pending requests
- ✅ See parent and student details
- ✅ One-click approve/reject
- ✅ Automatic notifications to parents
- ✅ Audit trail

**Usage:**
1. Navigate to DOS Dashboard
2. View pending connection requests
3. Review parent and student information
4. Click "Emeza" to approve or "Anga" to reject

---

## 🗄️ Database Schema

### `level_sheet_columns`
```sql
- id (INT, PRIMARY KEY)
- trade_id (INT, FOREIGN KEY)
- level_id (INT, FOREIGN KEY)
- column_name (VARCHAR)
- column_type (ENUM: text, number, date, currency, percentage)
- is_required (BOOLEAN)
- default_value (VARCHAR)
- display_order (INT)
- created_by (INT, FOREIGN KEY)
- created_at, updated_at (TIMESTAMP)
```

### `student_column_values`
```sql
- id (INT, PRIMARY KEY)
- student_id (INT, FOREIGN KEY)
- column_id (INT, FOREIGN KEY)
- column_value (TEXT)
- updated_by (INT, FOREIGN KEY)
- updated_at (TIMESTAMP)
```

### `parent_student_connections`
```sql
- id (INT, PRIMARY KEY)
- parent_id (INT, FOREIGN KEY)
- student_id (INT, FOREIGN KEY)
- relationship (VARCHAR: parent, guardian, relative)
- status (ENUM: pending, approved, rejected)
- requested_at (TIMESTAMP)
- approved_by (INT, FOREIGN KEY)
- approved_at (TIMESTAMP)
```

---

## 🔌 API Endpoints

### Dynamic Columns
```
GET    /api/management/trades
GET    /api/management/levels
GET    /api/management/columns/:tradeId/:levelId
POST   /api/management/columns
PUT    /api/management/columns/:id
DELETE /api/management/columns/:id
GET    /api/management/students/:tradeId/:levelId
PUT    /api/management/students/:studentId/columns/:columnId
```

### Student Management
```
POST   /api/management/students
PUT    /api/management/students/:id
GET    /api/management/students/:id/details
GET    /api/management/students/search
```

### Parent Connections
```
POST   /api/management/parent/connect
GET    /api/management/parent/connections
PUT    /api/management/parent/connections/:id
```

---

## 📱 Components

### Frontend Components
1. **AccountantDynamicColumns.tsx** - Column management interface
2. **DOSStudentManagement.tsx** - Student management interface
3. **ParentStudentConnection.tsx** - Parent connection interface
4. **ParentConnectionApproval.tsx** - Admin approval interface

### Backend Routes
1. **student-management.js** - All management APIs

---

## 🎨 UI Features

### Accountant Dashboard
- **Tab: "Inkingi z'Imbonerahamwe"**
  - Trade and level selectors
  - Column creation modal
  - Live student data table
  - Inline value editing

### DOS Dashboard
- **Student Management**
  - Advanced search and filters
  - Add student modal with full form
  - Student details modal with:
    - Personal info
    - Financial summary
    - Custom values
    - Payment history

### Parent Dashboard
- **Connection Tab**
  - Search interface
  - Trade/level filters
  - Connection request modal
  - Status tracking

---

## 🔐 Security & Permissions

### Role-Based Access
- **Accountant**: Create/edit columns, view all students
- **DOS/Headmaster**: Add/edit/delete students, approve connections
- **Admin/Super Admin**: Full access to all features
- **Parent**: Search students, request connections

### Data Validation
- Required fields enforced
- Email validation
- Phone number formatting
- Date validation
- Unique constraints on student IDs

---

## 🔔 Notifications

### Automatic Notifications
1. **Student Added**: Notifies accountants and admins
2. **Connection Requested**: Notifies DOS/Headmaster
3. **Connection Approved**: Notifies parent
4. **Connection Rejected**: Notifies parent

---

## 🌐 Language Support

All interfaces use **Kinyarwanda** language:
- Umwuga (Trade)
- Urwego (Level)
- Umunyeshuri (Student)
- Umubyeyi (Parent)
- Emeza (Approve)
- Anga (Reject)

---

## 📊 Data Flow

### Column Creation Flow
```
Accountant → Select Trade/Level → Create Column → 
Students Auto-Load → Edit Values → Save to DB
```

### Student Addition Flow
```
DOS → Fill Form → Select Trade/Level → Add Guardian Info → 
Save → Notify Accountant → Update Financial Records
```

### Parent Connection Flow
```
Parent → Search Student → Request Connection → 
DOS Receives Notification → Review → Approve/Reject → 
Parent Receives Notification → Access Granted
```

---

## 🎯 Best Practices

1. **Column Naming**: Use clear, descriptive names
2. **Default Values**: Set sensible defaults for required fields
3. **Student Search**: Use specific filters for better results
4. **Connection Approval**: Verify parent identity before approval
5. **Data Backup**: Regular backups of custom column data

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Columns not showing
- **Solution**: Ensure trade and level are selected

**Issue**: Student not found in search
- **Solution**: Check trade/level filters, try broader search

**Issue**: Connection request not appearing
- **Solution**: Refresh page, check notification system

**Issue**: Cannot edit student values
- **Solution**: Verify accountant role permissions

---

## 📈 Future Enhancements

- [ ] Bulk column operations
- [ ] Column templates
- [ ] Export custom data to Excel
- [ ] Student import from CSV
- [ ] Parent mobile app
- [ ] SMS notifications
- [ ] Advanced analytics on custom columns

---

## 🎉 Success Metrics

- ✅ Real database integration
- ✅ Full CRUD operations
- ✅ Role-based access control
- ✅ Real-time updates
- ✅ Notification system
- ✅ Modern, responsive UI
- ✅ Kinyarwanda language support
- ✅ Production-ready code

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API responses in browser console
3. Check database logs
4. Contact system administrator

---

**System Status**: ✅ Fully Functional & Production Ready
