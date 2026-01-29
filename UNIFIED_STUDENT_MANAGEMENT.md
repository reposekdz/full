# 🎓 Unified Student Management System

## Overview
A comprehensive, database-driven student management system with automatic serial code generation and role-based access for all school staff.

---

## 🚀 Key Features

### **1. Global Student Sheets**
- ✅ View students by Trade (AUTSOD, BDC, etc.) and Level
- ✅ Real-time statistics (Total, Male, Female, Active)
- ✅ Dynamic custom columns per trade/level
- ✅ Inline editing of student data
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Export to CSV
- ✅ Advanced search and filtering

### **2. Automatic Serial Code Generation**
When DOS/Headmaster adds a student:
```
Format: {TRADE_CODE}-{YEAR}-{STUDENT_ID}
Example: AUTSOD-2024-0001, BDC-2024-0002
```
- ✅ Auto-generated based on trade code
- ✅ Includes current year
- ✅ Sequential numbering
- ✅ Stored in database
- ✅ Marked as "used" automatically

### **3. Role-Based Access**

**DOS & Headmaster:**
- ✅ Add new students with trade/level
- ✅ Edit student information
- ✅ Delete students
- ✅ View global sheets
- ✅ Manage all student data

**Accountant:**
- ✅ View global sheets
- ✅ Create custom columns
- ✅ Edit custom column values
- ✅ View financial data
- ✅ Export reports

**DOD (Director of Discipline):**
- ✅ View global sheets
- ✅ Track student behavior
- ✅ View discipline records

**Teacher:**
- ✅ View global sheets
- ✅ View students in their classes
- ✅ Access student details

**Advisor:**
- ✅ View global sheets
- ✅ Access student information
- ✅ View counseling records

---

## 📊 Database Integration

### **Trades in Database**
```sql
- AUTSOD (Automation)
- BDC (Building Construction)
- [Other trades as configured]
```

### **Levels in Database**
```sql
- Level 1, Level 2, Level 3, etc.
```

### **Student Data**
All student information stored in `students` table:
- Personal info (name, email, phone, DOB, gender)
- Academic info (trade_id, level_id, enrollment_date)
- Guardian info (name, phone, email)
- Status (active, inactive, graduated)

### **Serial Codes**
Stored in `serial_codes` table:
- serial_code (unique identifier)
- trade_id, level_id
- student_id (linked to student)
- academic_year
- status (used/unused)

### **Custom Columns**
Stored in `level_sheet_columns` table:
- Per trade and level combination
- Column types: text, number, date, currency, percentage
- Default values and required flags

---

## 🔄 Workflow

### **Adding a Student (DOS/Headmaster)**
1. Navigate to "Gucunga" tab
2. Click "Ongeraho Umunyeshuri"
3. Fill student details
4. Select Trade (AUTSOD, BDC, etc.)
5. Select Level (1, 2, 3, etc.)
6. Add guardian information
7. Click "Bika Umunyeshuri"

**What Happens:**
- Student saved to database
- Serial code auto-generated (e.g., AUTSOD-2024-0001)
- Notification sent to accountants
- Student appears in global sheets

### **Viewing Students (All Roles)**
1. Navigate to "Imbonerahamwe" tab
2. Select Trade from dropdown
3. Select Level from dropdown
4. View filtered student list
5. See statistics and custom columns

### **Editing Student Data**
1. Click Edit icon (✏️) on student row
2. Modify information
3. Can change trade/level if needed
4. Click "Bika Impinduka"
5. Changes saved to database

### **Deleting Students**
1. Click Delete icon (🗑️) on student row
2. Confirm deletion
3. Student removed from database
4. Serial code marked as inactive

---

## 🎯 API Endpoints

### **Student Management**
```
GET    /api/management/trades              - Get all trades
GET    /api/management/levels              - Get all levels
GET    /api/management/students/:tradeId/:levelId - Get students by trade/level
POST   /api/management/students            - Add student (auto-generates serial)
PUT    /api/management/students/:id        - Update student
DELETE /api/management/students/:id        - Delete student
GET    /api/management/students/:id/details - Get full student details
```

### **Custom Columns**
```
GET    /api/management/columns/:tradeId/:levelId - Get columns
POST   /api/management/columns             - Create column
PUT    /api/management/columns/:id         - Update column
DELETE /api/management/columns/:id         - Delete column
PUT    /api/management/students/:studentId/columns/:columnId - Update value
```

---

## 📱 UI Components

### **UnifiedStudentManagement.tsx**
Main page with role-based tabs:
- **Imbonerahamwe** (Sheets) - For all roles
- **Gucunga** (Manage) - For DOS/Headmaster only

### **GlobalStudentSheets.tsx**
- Trade and level selectors
- Statistics cards
- Student table with custom columns
- Edit/Delete actions
- Export functionality

### **DOSStudentManagement.tsx**
- Add student form
- Search and filter
- Student list with actions
- Full details modal

---

## 🔐 Security

### **Authentication**
- All endpoints require valid JWT token
- Role-based authorization enforced

### **Permissions**
```javascript
Add Students:     dos, headmaster, admin, super_admin
Edit Students:    dos, headmaster, admin, super_admin
Delete Students:  dos, headmaster, admin, super_admin
View Sheets:      All authenticated users
Edit Columns:     accountant, admin, super_admin
```

---

## 📈 Statistics & Analytics

### **Real-time Stats**
- Total students per trade/level
- Gender breakdown
- Active vs inactive students
- Enrollment trends

### **Export Capabilities**
- CSV export with all data
- Includes custom columns
- Timestamped filenames
- Trade and level in filename

---

## 🎨 UI Features

### **Modern Design**
- Gradient backgrounds
- Framer Motion animations
- Color-coded badges
- Responsive tables
- Modal dialogs

### **Kinyarwanda Language**
- Full translation
- Consistent terminology
- User-friendly labels

### **Interactive Elements**
- Inline editing
- Drag-and-drop (future)
- Real-time search
- Instant filters

---

## 🔔 Notifications

### **Automatic Alerts**
1. **Student Added** → Accountants, Admins
2. **Student Updated** → Relevant staff
3. **Student Deleted** → Admins
4. **Serial Code Generated** → DOS/Headmaster

---

## 📊 Sample Data Flow

```
DOS adds student:
  ↓
Student saved to database
  ↓
Serial code generated: AUTSOD-2024-0001
  ↓
Notification sent to accountants
  ↓
Student appears in global sheets
  ↓
Accountant creates custom columns
  ↓
Teachers view student in their classes
  ↓
Advisor accesses counseling records
  ↓
DOD tracks discipline
```

---

## 🚀 Getting Started

### **For DOS/Headmaster:**
1. Login to system
2. Navigate to Student Management
3. Click "Gucunga" tab
4. Add students with trade/level
5. Serial codes auto-generated

### **For Accountant:**
1. Login to system
2. Navigate to Student Management
3. Select trade and level
4. Create custom columns
5. Edit student values

### **For Other Roles:**
1. Login to system
2. Navigate to Student Management
3. Select trade and level
4. View student information
5. Export data if needed

---

## ✅ Production Ready

- ✅ Real database integration
- ✅ Full CRUD operations
- ✅ Role-based access control
- ✅ Automatic serial generation
- ✅ Error handling
- ✅ Loading states
- ✅ Validation
- ✅ Notifications
- ✅ Export functionality
- ✅ Responsive design

---

## 🎉 Success!

The system is **fully functional** with:
- Real trades from database (AUTSOD, BDC, etc.)
- Real levels from database (1, 2, 3, etc.)
- Automatic serial code generation
- Complete CRUD operations
- Role-based access for all staff
- Modern, intuitive UI

**All data fetched from and saved to MySQL database!** 🚀
