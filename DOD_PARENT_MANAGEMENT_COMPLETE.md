# DOD Parent Management System - Complete Documentation

## 🎯 Overview

A **production-ready, comprehensive DOD (Director of Discipline) management system** with:
- ✅ **Real Parent-Student Linking** - No IDs required, automatic linking
- ✅ **Level 4 SOD Sheet** - Dedicated sheet with linked parent column
- ✅ **All Registered Parents View** - Complete parent management dashboard
- ✅ **Real Contact System** - SMS/WhatsApp/Email to parents
- ✅ **Automatic Notifications** - Parents notified on conduct/leave actions
- ✅ **Contact History Tracking** - Full audit trail of all communications
- ✅ **Modern UI** - Professional, responsive design

## 🚀 Quick Setup (30 seconds)

```bash
# Run the setup script
setup-dod-parent-management.bat

# Then restart backend
cd backend
npm start
```

## 📊 Database Schema

### Core Tables Created

1. **parent_student_links** - Links parents to students
   - Supports multiple parents per student
   - Primary contact designation
   - Permission controls (view marks, attendance, etc.)
   - Auto-linking support

2. **parents_info** - Extended parent information
   - Contact preferences (SMS/WhatsApp/Call/Email)
   - Location data (Province, District, Sector, etc.)
   - Verification status
   - Children count tracking

3. **level4_sod_students** - Level 4 SOD students with parent info
   - Student details (name, gender, phone, email)
   - Linked parent information (ID, name, phone, relationship)
   - Academic metrics (conduct score, attendance, grades)
   - Auto-linking timestamp

4. **parent_contact_history** - Communication audit trail
   - Contact type (SMS, WhatsApp, Call, Email, Meeting)
   - Message content and category
   - Delivery status tracking
   - Response tracking

5. **parent_notifications_queue** - Notification management
   - Queued notifications with priority
   - Multiple delivery channels
   - Retry logic and error tracking
   - Metadata storage (JSON)

6. **dod_actions_log** - DOD action tracking
   - Action types (remove conduct, grant leave, etc.)
   - Parent notification status
   - Action details (JSON)
   - Bulk action support

## 🔗 API Endpoints

### Level 4 SOD Students

#### GET `/api/dod-parent-management/level4-sod-students`
Get Level 4 SOD students with linked parent information.

**Query Parameters:**
- `search` - Search by name, student code, or parent name
- `gender` - Filter by gender (Male/Female)
- `status` - Filter by status (active/inactive/graduated/suspended)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 100)

**Response:**
```json
{
  "success": true,
  "students": [
    {
      "id": 1,
      "student_id": 123,
      "student_code": "SOD4-0123",
      "first_name": "Uwase",
      "last_name": "Marie",
      "gender": "Female",
      "phone": "0788111001",
      "email": "uwase.marie@sod.rw",
      "trade_code": "SOD",
      "trade_name": "Software Development",
      "level_number": 4,
      "conduct_score": 40,
      "attendance_percentage": 95.50,
      "average_grade": 85.00,
      "linked_parent_id": 456,
      "linked_parent_name": "Mukamana Grace",
      "linked_parent_phone": "0788222001",
      "linked_parent_relationship": "mother",
      "total_linked_parents": 2,
      "all_parents_info": "Mukamana Grace (0788222001) - mother | Niyonkuru Jean (0788222002) - father"
    }
  ],
  "total": 50,
  "pagination": {
    "page": 1,
    "limit": 100,
    "total_pages": 1
  }
}
```

### Parent Management

#### GET `/api/dod-parent-management/parents`
Get all registered parents with their linked students.

**Query Parameters:**
- `search` - Search by name, phone, or email
- `status` - Filter by status (active/inactive)
- `page` - Page number
- `limit` - Results per page

**Response:**
```json
{
  "success": true,
  "parents": [
    {
      "parent_id": 456,
      "first_name": "Mukamana",
      "last_name": "Grace",
      "phone": "0788222001",
      "email": "mukamana.grace@parent.rw",
      "whatsapp_number": "0788222001",
      "preferred_contact_method": "whatsapp",
      "preferred_language": "kinyarwanda",
      "children_in_school": 2,
      "is_verified": true,
      "total_linked_students": 2,
      "linked_students_names": "Uwase Marie (SOD4-0123), Mugisha Jean (SOD4-0124)"
    }
  ],
  "total": 25,
  "pagination": {...}
}
```

#### GET `/api/dod-parent-management/parents/:parent_id`
Get detailed parent information with all linked students and contact history.

**Response:**
```json
{
  "success": true,
  "parent": {
    "parent_id": 456,
    "first_name": "Mukamana",
    "last_name": "Grace",
    "phone": "0788222001",
    "email": "mukamana.grace@parent.rw",
    "national_id": "1198012345678901",
    "occupation": "Teacher",
    "address": "Kigali, Gasabo",
    "province": "Kigali City",
    "district": "Gasabo",
    "whatsapp_number": "0788222001",
    "preferred_contact_method": "whatsapp",
    "children_in_school": 2
  },
  "linked_students": [
    {
      "student_id": 123,
      "first_name": "Uwase",
      "last_name": "Marie",
      "admission_number": "SOD4-0123",
      "trade_name": "Software Development",
      "level_number": 4,
      "conduct_score": 40,
      "relationship_type": "mother",
      "is_primary_contact": true
    }
  ],
  "contact_history": [
    {
      "id": 789,
      "contact_type": "sms",
      "subject": "Conduct Removed",
      "message": "Your child's conduct has been cleared...",
      "category": "conduct",
      "delivery_status": "delivered",
      "created_at": "2025-01-27T10:30:00Z"
    }
  ]
}
```

### Parent Linking

#### POST `/api/dod-parent-management/link-parent-student`
Manually link a parent to a student.

**Request Body:**
```json
{
  "parent_id": 456,
  "student_id": 123,
  "relationship_type": "mother",
  "is_primary_contact": true,
  "auto_linked": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parent linked to student successfully"
}
```

#### POST `/api/dod-parent-management/auto-link-parent`
Automatically create parent account and link to student.

**Request Body:**
```json
{
  "student_id": 123,
  "parent_phone": "0788222001",
  "parent_name": "Mukamana Grace",
  "relationship_type": "mother"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parent auto-linked successfully",
  "parent_id": 456
}
```

### Contact Parents

#### POST `/api/dod-parent-management/contact-parent`
Send message to a specific parent.

**Request Body:**
```json
{
  "parent_id": 456,
  "student_id": 123,
  "contact_type": "sms",
  "subject": "Academic Update",
  "message": "Your child has excellent performance this term...",
  "category": "academic",
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent to parent successfully",
  "notification_id": "NOTIF-1738000000000-abc123",
  "contact_info": {
    "phone": "0788222001",
    "email": "mukamana.grace@parent.rw",
    "whatsapp": "0788222001"
  }
}
```

#### POST `/api/dod-parent-management/contact-student-parents`
Send message to ALL parents of a student.

**Request Body:**
```json
{
  "student_id": 123,
  "contact_type": "sms",
  "subject": "Conduct Removed",
  "message": "We are pleased to inform you that your child's conduct record has been cleared...",
  "category": "conduct"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent to 2 parent(s) successfully",
  "parents_contacted": 2,
  "notification_ids": ["NOTIF-...", "NOTIF-..."]
}
```

### Statistics

#### GET `/api/dod-parent-management/stats`
Get parent management statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_parents": 150,
    "total_links": 200,
    "total_l4_sod_students": 50,
    "l4_sod_with_parents": 45,
    "pending_requests": 5,
    "queued_notifications": 10,
    "contacts_today": 25
  }
}
```

## 🎨 Frontend Integration

### Level 4 SOD Students Sheet

```typescript
import { useState, useEffect } from 'react';
import apiService from '@/app/services/apiService';

function Level4SODSheet() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await apiService.request('/dod-parent-management/level4-sod-students', {
        status: 'active',
        limit: 100
      });
      setStudents(response.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2>Level 4 SOD Students</h2>
      <table>
        <thead>
          <tr>
            <th>Student Code</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Conduct Score</th>
            <th>Linked Parent</th>
            <th>Parent Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.student_code}</td>
              <td>{student.first_name} {student.last_name}</td>
              <td>{student.gender}</td>
              <td>{student.conduct_score}/40</td>
              <td>{student.linked_parent_name || 'No parent linked'}</td>
              <td>{student.linked_parent_phone || '-'}</td>
              <td>
                <button onClick={() => contactParent(student)}>
                  Contact Parent
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Contact Parent Function

```typescript
const contactParent = async (student) => {
  if (!student.linked_parent_id) {
    toast.error('No parent linked to this student');
    return;
  }

  try {
    await apiService.request('/dod-parent-management/contact-student-parents', {
      student_id: student.student_id,
      contact_type: 'sms',
      subject: 'Message from School',
      message: 'Your child is doing well...',
      category: 'general'
    }, 'POST');
    
    toast.success('Message sent to parent(s) successfully');
  } catch (error) {
    toast.error('Failed to send message');
  }
};
```

### Auto-Link Parent

```typescript
const autoLinkParent = async (studentId, parentPhone, parentName) => {
  try {
    const response = await apiService.request('/dod-parent-management/auto-link-parent', {
      student_id: studentId,
      parent_phone: parentPhone,
      parent_name: parentName,
      relationship_type: 'guardian'
    }, 'POST');
    
    toast.success('Parent linked successfully');
    return response.parent_id;
  } catch (error) {
    toast.error('Failed to link parent');
  }
};
```

## 🔐 Security Features

- ✅ **Authentication Required** - All endpoints require valid JWT token
- ✅ **Role-Based Access** - Only DOD, DOS, Admin, Headmaster can access
- ✅ **Data Validation** - Input sanitization and validation
- ✅ **SQL Injection Protection** - Parameterized queries
- ✅ **Rate Limiting** - Prevents abuse
- ✅ **Audit Logging** - All actions tracked

## 📱 Notification System

### Automatic Notifications

When DOD removes conduct or grants leave, parents are automatically notified:

```typescript
// Example: Remove conduct and notify parents
const removeConduct = async (studentId, reason) => {
  // 1. Remove conduct record
  await apiService.request('/dod-actions/remove-conduct', {
    student_id: studentId,
    reason: reason
  }, 'POST');
  
  // 2. System automatically sends SMS to ALL linked parents
  // No additional code needed - handled by backend triggers
};
```

### Manual Notifications

```typescript
// Send custom message to parent
await apiService.request('/dod-parent-management/contact-parent', {
  parent_id: 456,
  student_id: 123,
  contact_type: 'whatsapp',
  subject: 'Parent Meeting',
  message: 'Please come to school tomorrow at 10 AM...',
  category: 'general',
  priority: 'high'
}, 'POST');
```

## 🎯 Key Features

### 1. No ID Required
- Parents and students linked by phone number and name
- System automatically finds or creates parent accounts
- No need to remember IDs

### 2. Linked Parent Column
- Level 4 SOD sheet shows linked parent directly
- One-click access to parent information
- Visual indicator of linking status

### 3. All Parents View
- Dedicated page showing all registered parents
- See all children linked to each parent
- Contact history and statistics

### 4. Real Contact System
- Send SMS, WhatsApp, Email, or make calls
- Track delivery status
- View response history
- Bulk messaging support

### 5. Automatic Linking
- System can auto-create parent accounts
- Links based on phone number
- Supports multiple parents per student

## 📊 Usage Examples

### Example 1: View Level 4 SOD Students with Parents

```bash
GET /api/dod-parent-management/level4-sod-students?status=active&limit=50
```

### Example 2: Link Parent to Student

```bash
POST /api/dod-parent-management/link-parent-student
{
  "parent_id": 456,
  "student_id": 123,
  "relationship_type": "mother",
  "is_primary_contact": true
}
```

### Example 3: Auto-Create and Link Parent

```bash
POST /api/dod-parent-management/auto-link-parent
{
  "student_id": 123,
  "parent_phone": "0788222001",
  "parent_name": "Mukamana Grace",
  "relationship_type": "mother"
}
```

### Example 4: Contact All Parents of Student

```bash
POST /api/dod-parent-management/contact-student-parents
{
  "student_id": 123,
  "contact_type": "sms",
  "subject": "Academic Excellence",
  "message": "Congratulations! Your child has achieved excellent grades this term.",
  "category": "academic"
}
```

## 🚀 Production Deployment

1. **Database Setup**
   ```bash
   setup-dod-parent-management.bat
   ```

2. **Environment Variables**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=school_management
   JWT_SECRET=your_jwt_secret
   ```

3. **Start Server**
   ```bash
   cd backend
   npm start
   ```

4. **Verify**
   ```bash
   curl http://localhost:5000/api/dod-parent-management/stats
   ```

## 📝 Summary

✅ **Complete System** - All features implemented and tested
✅ **Real Database** - Production-ready schema
✅ **Modern API** - RESTful endpoints with full CRUD
✅ **Security** - Authentication, authorization, validation
✅ **Documentation** - Complete API docs and examples
✅ **Easy Setup** - One-click installation script

**Total Implementation:**
- 6 Database Tables
- 8 API Endpoints
- Automatic Parent Linking
- Real Contact System
- Complete Audit Trail
- Modern UI Ready

🎉 **Ready for Production Use!**
