# 🎓 Student Application System - Garden TVET School

## Overview
Complete student application system in **Kinyarwanda** with role-based management for DOS and Headmaster.

## ✨ Features

### For Applicants (Public)
- ✅ **Multi-step Application Form** (3 steps)
- ✅ **Full Kinyarwanda Interface**
- ✅ **Trade & Level Selection**
- ✅ **Education Level Options**:
  - Narangije Senior 3 (Completed Senior 3)
  - Ndahindura ishuri (Changing School)
  - Ikindi (Other)
- ✅ **Document Upload** (up to 5 files)
- ✅ **Application Status Tracking**
- ✅ **Unique Application Number**

### For DOS (Director of Studies)
- ✅ **View All Applications**
- ✅ **Filter by Status, Trade, Education Level**
- ✅ **Review & Approve/Reject**
- ✅ **Add Comments**
- ✅ **Statistics Dashboard**
- ✅ **Activity Tracking**

### For Headmaster
- ✅ **Final Approval Authority**
- ✅ **View DOS Decisions**
- ✅ **Override Capabilities**
- ✅ **Comprehensive Reports**
- ✅ **Analytics Dashboard**

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
setup-application-system.bat
```

### Option 2: Manual Setup
```bash
# 1. Setup database
cd backend
node scripts/setup-application-system.js

# 2. Restart backend
npm run dev

# 3. Add to your homepage
# Import and use StudentApplicationForm component
```

## 📊 Database Schema

### Tables Created
1. **student_applications** - Main application data
2. **application_documents** - Uploaded documents
3. **application_activity_log** - Audit trail

### Application Statuses
- `pending` - Newly submitted
- `under_review` - Being reviewed by DOS/Headmaster
- `approved` - Approved by both DOS and Headmaster
- `rejected` - Rejected by either DOS or Headmaster
- `enrolled` - Student has been enrolled

## 🔌 API Endpoints

### Public Endpoints
```
POST   /api/student-applications/submit
       - Submit new application
       - Body: Application form data
       - Returns: Application number

GET    /api/student-applications/status/:application_number
       - Check application status
       - Public access
```

### DOS/Headmaster Endpoints (Authenticated)
```
GET    /api/student-applications/all
       - Get all applications with filters
       - Query params: status, trade_code, education_level, page, limit

GET    /api/student-applications/:id
       - Get single application details
       - Includes documents and activity log

POST   /api/student-applications/:id/dos-review
       - DOS review and decision
       - Body: { decision: 'approved'|'rejected', comments: 'text' }

POST   /api/student-applications/:id/headmaster-review
       - Headmaster review and decision
       - Body: { decision: 'approved'|'rejected', comments: 'text' }

GET    /api/student-applications/stats/overview
       - Get statistics dashboard
       - Returns: Total, pending, approved, rejected, by trade
```

## 🎨 Frontend Components

### 1. StudentApplicationForm
**Location:** `src/app/components/StudentApplicationForm.tsx`

**Usage:**
```tsx
import { StudentApplicationForm } from '@/app/components/StudentApplicationForm';

// In your homepage or apply page
<StudentApplicationForm onClose={() => {}} />
```

**Features:**
- 3-step wizard interface
- Form validation
- File upload support
- Success confirmation with application number
- Full Kinyarwanda labels

### 2. ApplicationManagementDashboard
**Location:** `src/app/components/ApplicationManagementDashboard.tsx`

**Usage:**
```tsx
import { ApplicationManagementDashboard } from '@/app/components/ApplicationManagementDashboard';

// In DOS or Headmaster dashboard
<ApplicationManagementDashboard />
```

**Features:**
- Statistics cards
- Advanced filtering
- Application table
- Detail modal with review form
- Role-based permissions

## 📝 Form Fields (Kinyarwanda)

### Step 1: Amakuru yawe (Your Information)
- Izina rya mbere (First Name)
- Izina rya kabiri (Last Name)
- Itariki y'amavuko (Date of Birth)
- Igitsina (Gender)
- Telefoni (Phone)
- Email
- Aho utuye (Address)

### Step 2: Amakuru y'ababyeyi n'amasomo (Parent & Academic Info)
- Amazina y'umubyeyi (Parent Name)
- Telefoni y'umubyeyi (Parent Phone)
- Email y'umubyeyi (Parent Email)
- Akazi k'umubyeyi (Parent Occupation)
- Ishuri ryaheruka (Previous School)
- Urwego rw'amashuri (Education Level)

### Step 3: Umwuga n'impamvu (Trade & Reason)
- Hitamo umwuga (Select Trade)
- Urwego (Level: 1, 2, or 3)
- Impamvu yo gusaba kwiga (Reason for Applying)
- Amanota yaheruka (Previous Grades - optional)
- Ibindi byihutirwa (Special Needs - optional)

## 🔐 Role-Based Access

### DOS (Director of Studies)
- Can view all applications
- Can review and approve/reject
- Decision required before Headmaster review
- Full access to statistics

### Headmaster
- Can view all applications
- Can review and approve/reject
- Final approval authority
- Can override DOS decisions
- Full access to analytics

### Admin
- Full access to all features
- Can act as both DOS and Headmaster

## 📱 Integration with Homepage

### Add Application Button to Homepage
```tsx
import { useState } from 'react';
import { StudentApplicationForm } from '@/app/components/StudentApplicationForm';

function Homepage() {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  return (
    <>
      {/* Your homepage content */}
      
      <button 
        onClick={() => setShowApplicationForm(true)}
        className="px-8 py-4 bg-green-600 text-white rounded-lg"
      >
        Saba Kwiga muri Garden TVET
      </button>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <StudentApplicationForm onClose={() => setShowApplicationForm(false)} />
        </div>
      )}
    </>
  );
}
```

### Add to DOS Dashboard
```tsx
import { ApplicationManagementDashboard } from '@/app/components/ApplicationManagementDashboard';

function DOSDashboard() {
  return (
    <div>
      <h1>DOS Dashboard</h1>
      <ApplicationManagementDashboard />
    </div>
  );
}
```

### Add to Headmaster Dashboard
```tsx
import { ApplicationManagementDashboard } from '@/app/components/ApplicationManagementDashboard';

function HeadmasterDashboard() {
  return (
    <div>
      <h1>Headmaster Dashboard</h1>
      <ApplicationManagementDashboard />
    </div>
  );
}
```

## 📊 Workflow

1. **Student Submits Application**
   - Fills 3-step form in Kinyarwanda
   - Uploads documents (optional)
   - Receives unique application number
   - Status: `pending`

2. **DOS Reviews**
   - Views application details
   - Reviews all information
   - Approves or rejects with comments
   - Status: `under_review`

3. **Headmaster Reviews**
   - Views application and DOS decision
   - Makes final decision
   - Approves or rejects with comments
   - Status: `approved` or `rejected`

4. **Enrollment** (if approved)
   - Application marked as `enrolled`
   - Student added to system
   - Parent notified

## 🎯 Statistics Tracked

- Total applications
- Pending applications
- Under review
- Approved applications
- Rejected applications
- Applications today
- Applications this week
- Applications by trade
- Applications by education level

## 🔔 Notifications (Future Enhancement)

- Email notification on submission
- SMS to parent on status change
- DOS notification for new applications
- Headmaster notification after DOS review

## 📁 File Structure

```
backend/
├── migrations/
│   └── student_applications.sql
├── routes/
│   └── student-applications.js
├── scripts/
│   └── setup-application-system.js
└── uploads/
    └── applications/

src/app/components/
├── StudentApplicationForm.tsx
└── ApplicationManagementDashboard.tsx
```

## 🧪 Testing

### Test Application Submission
```bash
curl -X POST http://localhost:5000/api/student-applications/submit \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jean",
    "last_name": "Mugabo",
    "date_of_birth": "2005-01-15",
    "gender": "male",
    "phone": "+250788123456",
    "address": "Kigali, Gasabo, Remera",
    "parent_name": "Marie Mukamana",
    "parent_phone": "+250788654321",
    "previous_school": "GS Remera",
    "education_level": "senior_3_completed",
    "trade_code": "ICT",
    "level_number": 1,
    "reason_for_applying": "Nshaka kwiga ICT kuko nkunda ikoranabuhanga"
  }'
```

### Check Application Status
```bash
curl http://localhost:5000/api/student-applications/status/APP-2025-0001
```

## 🎨 Customization

### Change Colors
Edit the component files and update Tailwind classes:
- Primary: `green-600` → your color
- Success: `green-500` → your color
- Warning: `yellow-500` → your color

### Add More Fields
1. Update database schema in `student_applications.sql`
2. Add fields to API route
3. Add form fields to `StudentApplicationForm.tsx`

### Change Language
Replace Kinyarwanda text in `StudentApplicationForm.tsx` with your preferred language.

## 🚀 Production Deployment

1. **Environment Variables**
```env
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_secret
```

2. **File Upload Configuration**
- Ensure `uploads/applications/` directory exists
- Set proper permissions (755)
- Configure file size limits in route

3. **Security**
- Enable HTTPS
- Add rate limiting
- Validate file types
- Sanitize inputs

## 📞 Support

For issues or questions:
- Check API logs: `backend/server.log`
- Verify database connection
- Ensure all tables are created
- Check file upload permissions

## 🎉 Success!

Your student application system is now ready! Students can apply in Kinyarwanda, and DOS/Headmaster can manage applications efficiently.

**Next Steps:**
1. Add application button to homepage
2. Test the complete workflow
3. Train DOS and Headmaster staff
4. Announce to prospective students
