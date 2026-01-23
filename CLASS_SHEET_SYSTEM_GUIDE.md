# Advanced Class Sheet System - Complete Guide

## ✅ **System Overview**

When DOS/Headmaster/DOD adds a student to a class:
1. ✅ **Auto-generates serial code** based on trade + year + class + random
2. ✅ **Creates user account** with full details
3. ✅ **Enrolls in class** automatically
4. ✅ **Adds to class sheet** with sequential number
5. ✅ **Updates all roles** - visible to DOS, Headmaster, DOD, Teachers
6. ✅ **Tracks complete info** - No., Serial Code, First Name, Last Name, etc.

## 📊 **Class Sheet Features**

### **Sheet Columns:**
1. **No.** - Sequential sheet number (1, 2, 3...)
2. **Serial Code** - Auto-generated (e.g., SOD202611234)
3. **First Name** - Student's first name
4. **Last Name** - Student's last name
5. **Parent Phone** - Parent contact number
6. **Location** - Student's address
7. **Date of Birth** - Student's DOB
8. **Gender** - Male/Female/Other
9. **Enrollment Date** - Date added to class
10. **Status** - Active/Removed/Transferred

### **Advanced Features:**
- ✅ **Real-time statistics** (Total, Active, Male, Female, Removed)
- ✅ **Search & filter** by any field
- ✅ **Export to CSV** for Excel/Google Sheets
- ✅ **Print-friendly** format
- ✅ **Auto-numbering** (sequential sheet numbers)
- ✅ **Gender statistics** breakdown
- ✅ **Status tracking** (active/removed/transferred)
- ✅ **Reorder capability** (change sheet numbers)
- ✅ **Bulk operations** support

## 🚀 **Setup Instructions**

### **Step 1: Run Database Setup**
```bash
cd backend
node scripts/setup-class-sheets-system.js
```

**Expected Output:**
```
🔄 Setting up class sheets system...

Creating class_sheets table...
✅ class_sheets table created

Updating users table...
✅ users table updated

✅ Class sheets system setup complete!

📋 Summary:
   - class_sheets table created
   - first_name, last_name, date_of_birth, gender added to users
   - Indexes created for performance
   - Foreign keys configured

✅ Done!
```

### **Step 2: Update Server Routes**
The routes are already loaded in server.js:
- `student-management` - For adding students
- `class-sheets-api` - For viewing/managing sheets

### **Step 3: Restart Backend**
```bash
npm start
```

## 📋 **Database Schema**

### **class_sheets Table**
```sql
CREATE TABLE class_sheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  sheet_number INT NOT NULL,
  serial_code VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  location VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  enrollment_date DATE NOT NULL,
  status ENUM('active', 'removed', 'transferred') DEFAULT 'active',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  UNIQUE KEY unique_class_student (class_id, student_id),
  INDEX idx_serial_code (serial_code),
  INDEX idx_sheet_number (class_id, sheet_number)
);
```

### **users Table Updates**
```sql
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100) NULL,
ADD COLUMN last_name VARCHAR(100) NULL,
ADD COLUMN date_of_birth DATE NULL,
ADD COLUMN gender ENUM('male', 'female', 'other') NULL;
```

## 🎯 **Usage Flow**

### **1. DOS/Headmaster Adds Student**

**Access:** `/admin/student-management`

**Steps:**
1. Click "Add Student"
2. Fill form:
   - Select Class (e.g., "Year 1 - Software Development")
   - First Name: "John"
   - Last Name: "Doe"
   - Parent Phone: "+250 788 123 456"
   - Location: "Kigali, Gasabo"
   - Date of Birth: "2005-01-15"
   - Gender: "Male"
   - Password: (optional, uses serial code if empty)
3. Click "Add Student"

**System Automatically:**
- Generates serial code: `SOD202611234`
- Creates user account
- Enrolls in selected class
- Adds to class sheet with next number
- Returns credentials

### **2. View Class Sheet**

**Access:** `/admin/class-sheet/:classId`

**Features:**
- View all students in sequential order
- See complete information
- Real-time statistics
- Search functionality
- Export to CSV
- Print sheet

### **3. Manage Sheet**

**Operations:**
- Update student info
- Remove from sheet
- Transfer to another class
- Reorder sheet numbers
- Export data
- Print formatted sheet

## 📊 **API Endpoints**

### **Student Management**
```
POST   /api/student-management/students
       - Add student (auto-adds to sheet)
       Body: {
         class_id, first_name, last_name, parent_phone, 
         location, date_of_birth, gender, default_password
       }

GET    /api/student-management/students
       - Get all students

PUT    /api/student-management/students/:id
       - Update student

DELETE /api/student-management/students/:id
       - Remove student
```

### **Class Sheets**
```
GET    /api/class-sheets-api/class/:classId
       - Get class sheet

GET    /api/class-sheets-api/all
       - Get all class sheets

GET    /api/class-sheets-api/class/:classId/stats
       - Get sheet statistics

GET    /api/class-sheets-api/class/:classId/export
       - Export to CSV

GET    /api/class-sheets-api/class/:classId/print
       - Get print-formatted sheet

PUT    /api/class-sheets-api/student/:id
       - Update student in sheet

DELETE /api/class-sheets-api/student/:id
       - Remove from sheet

GET    /api/class-sheets-api/search?query=...
       - Search across all sheets

PUT    /api/class-sheets-api/class/:classId/reorder
       - Reorder sheet numbers
```

## 🎨 **Frontend Components**

### **StudentManagement.tsx**
- Add students with full details
- Auto-generates serial codes
- Displays success with credentials
- Search and filter
- Export functionality

### **ClassSheetViewer.tsx**
- View complete class sheet
- Real-time statistics
- Search students
- Export to CSV
- Print sheet
- Gender breakdown
- Status tracking

## 📈 **Example Usage**

### **Add Student**
```javascript
POST /api/student-management/students
{
  "class_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "parent_phone": "+250 788 123 456",
  "location": "Kigali, Gasabo",
  "date_of_birth": "2005-01-15",
  "gender": "male"
}

Response:
{
  "success": true,
  "message": "Student added successfully and added to class sheet",
  "student": {
    "id": 123,
    "sheet_number": 15,
    "serial_code": "SOD202611234",
    "first_name": "John",
    "last_name": "Doe",
    "default_password": "SOD202611234",
    "class_name": "Year 1",
    "course_name": "Software Development"
  }
}
```

### **View Class Sheet**
```javascript
GET /api/class-sheets-api/class/1

Response:
{
  "success": true,
  "sheet": [
    {
      "id": 1,
      "sheet_number": 1,
      "serial_code": "SOD202611234",
      "first_name": "John",
      "last_name": "Doe",
      "parent_phone": "+250 788 123 456",
      "location": "Kigali, Gasabo",
      "date_of_birth": "2005-01-15",
      "gender": "male",
      "enrollment_date": "2026-01-15",
      "status": "active"
    }
  ],
  "classInfo": {
    "class_name": "Year 1",
    "course_name": "Software Development",
    "trade_code": "SOD"
  },
  "totalStudents": 15
}
```

### **Export to CSV**
```javascript
GET /api/class-sheets-api/class/1/export

Downloads CSV file with all student data
```

## 🎯 **Benefits**

1. ✅ **Automated** - No manual sheet management
2. ✅ **Organized** - Sequential numbering
3. ✅ **Complete** - All student information
4. ✅ **Real-time** - Instant updates
5. ✅ **Accessible** - All roles can view
6. ✅ **Exportable** - CSV for Excel
7. ✅ **Printable** - Formatted sheets
8. ✅ **Searchable** - Find students quickly
9. ✅ **Statistical** - Gender, status breakdown
10. ✅ **Secure** - Role-based access

## 🔐 **Access Control**

### **Can Add Students:**
- Admin
- Headmaster
- DOS (Director of Studies)
- DOD (Director of Discipline)

### **Can View Sheets:**
- Admin
- Headmaster
- DOS
- DOD
- Teachers (their classes only)

### **Can Edit Sheets:**
- Admin
- Headmaster
- DOS
- DOD

### **Can Delete:**
- Admin
- Headmaster

## 📊 **Sheet Statistics**

Each class sheet shows:
- **Total Students** - Count of all students
- **Active** - Currently enrolled
- **Male** - Male students count
- **Female** - Female students count
- **Removed** - Removed from class

## 🎉 **Complete System Flow**

1. **DOS adds student** → Serial code generated → User created → Enrolled in class → Added to sheet
2. **Sheet updated** → Sequential number assigned → All info stored → Visible to all roles
3. **Teachers view** → See complete class list → Export if needed → Print for records
4. **Statistics tracked** → Gender breakdown → Status monitoring → Enrollment trends

---

**Status:** ✅ Production Ready  
**Version:** 2.0.0  
**Features:** Advanced, Rich, Powerful, Full-Functional
