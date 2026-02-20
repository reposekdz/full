# DOD Parent Management - Quick Reference

## 🚀 Setup (30 seconds)

```bash
setup-dod-parent-management.bat
cd backend && npm start
```

## 📊 Key Features

✅ **Level 4 SOD Sheet** - Dedicated sheet with linked parent column  
✅ **All Parents View** - Complete parent management dashboard  
✅ **Auto-Linking** - No IDs required, automatic parent creation  
✅ **Real Contact** - SMS/WhatsApp/Email to parents  
✅ **Contact History** - Full audit trail  

## 🔗 API Endpoints

### Students
```
GET  /api/dod-parent-management/level4-sod-students
     ?search=name&gender=Male&status=active&page=1&limit=100
```

### Parents
```
GET  /api/dod-parent-management/parents
     ?search=name&status=active&page=1&limit=100

GET  /api/dod-parent-management/parents/:parent_id
```

### Linking
```
POST /api/dod-parent-management/link-parent-student
     { parent_id, student_id, relationship_type, is_primary_contact }

POST /api/dod-parent-management/auto-link-parent
     { student_id, parent_phone, parent_name, relationship_type }
```

### Contact
```
POST /api/dod-parent-management/contact-parent
     { parent_id, student_id, contact_type, subject, message, category }

POST /api/dod-parent-management/contact-student-parents
     { student_id, contact_type, subject, message, category }
```

### Stats
```
GET  /api/dod-parent-management/stats
```

## 💻 Frontend Usage

### Load Level 4 SOD Students
```typescript
const response = await apiService.request('/dod-parent-management/level4-sod-students', {
  status: 'active',
  limit: 100
});
const students = response.students;
```

### Auto-Link Parent
```typescript
await apiService.request('/dod-parent-management/auto-link-parent', {
  student_id: 123,
  parent_phone: '0788222001',
  parent_name: 'Mukamana Grace',
  relationship_type: 'mother'
}, 'POST');
```

### Contact Parent
```typescript
await apiService.request('/dod-parent-management/contact-student-parents', {
  student_id: 123,
  contact_type: 'sms',
  subject: 'Message from School',
  message: 'Your child is doing well...',
  category: 'general'
}, 'POST');
```

## 📋 Database Tables

1. **parent_student_links** - Parent-student relationships
2. **parents_info** - Extended parent information
3. **level4_sod_students** - Level 4 SOD with linked parents
4. **parent_contact_history** - Communication audit trail
5. **parent_notifications_queue** - Notification management
6. **dod_actions_log** - DOD action tracking

## 🎯 Common Tasks

### View Students with Parents
```sql
SELECT * FROM level4_sod_students 
WHERE status = 'active' 
ORDER BY last_name, first_name;
```

### View All Parents
```sql
SELECT u.*, pi.*, 
  (SELECT COUNT(*) FROM parent_student_links psl 
   WHERE psl.parent_id = u.id AND psl.status = 'active') as children_count
FROM users u
LEFT JOIN parents_info pi ON u.id = pi.user_id
WHERE u.role = 'parent';
```

### View Contact History
```sql
SELECT * FROM parent_contact_history
WHERE parent_id = 456
ORDER BY created_at DESC
LIMIT 50;
```

## 🔐 Security

- ✅ JWT Authentication required
- ✅ Role-based access (DOD, DOS, Admin, Headmaster)
- ✅ Input validation and sanitization
- ✅ SQL injection protection
- ✅ Rate limiting
- ✅ Audit logging

## 📱 Contact Types

- **sms** - SMS text message
- **whatsapp** - WhatsApp message
- **call** - Phone call
- **email** - Email message
- **meeting** - In-person meeting

## 📊 Categories

- **conduct** - Conduct-related
- **leave** - Leave/absence
- **academic** - Academic performance
- **fees** - Financial matters
- **general** - General communication
- **emergency** - Urgent matters

## 🎨 Response Format

```json
{
  "success": true,
  "students": [...],
  "parents": [...],
  "total": 50,
  "pagination": {
    "page": 1,
    "limit": 100,
    "total_pages": 1
  }
}
```

## 📖 Full Documentation

See [DOD_PARENT_MANAGEMENT_COMPLETE.md](DOD_PARENT_MANAGEMENT_COMPLETE.md) for complete documentation.

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2025-01-27
