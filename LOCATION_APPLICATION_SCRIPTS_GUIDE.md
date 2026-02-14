# 🚀 Location & Application Scripts - Complete Guide

## 📋 Overview

This guide covers all batch scripts for setting up the **Rwanda Location System** and **Student Application System** in the Garden TVET School Management System.

---

## 🎯 Quick Start - Run Everything

### Master Script (Recommended)
```bash
run-all-location-and-application-scripts.bat
```

This single script runs **ALL** location and application setup scripts automatically.

**Duration:** 10-15 minutes  
**What it does:**
- ✅ Sets up complete Rwanda location hierarchy (5 provinces → 30 districts → 416 sectors → 2000+ cells → 10000+ villages)
- ✅ Creates all database tables and relationships
- ✅ Installs all student application systems (5 versions)
- ✅ Sets up API endpoints
- ✅ Configures file upload directories
- ✅ Enables SMS/Email notifications

---

## 🌍 Location Scripts

### 1. Run All Location Scripts
```bash
run-all-location-scripts.bat
```

**Duration:** 5-10 minutes  
**Includes:**
- Rwanda Locations System Setup
- Generate All Cells & Villages

**Output:**
- 5 Provinces
- 30 Districts
- 416 Sectors
- 2000+ Cells
- 10000+ Villages

### Individual Location Scripts

#### A. Setup Rwanda Locations
```bash
setup-rwanda-locations.bat
```
**What it does:**
- Creates database tables (provinces, districts, sectors, cells, villages)
- Inserts provinces and districts
- Imports all 416 sectors
- Imports sample cells and villages
- Creates API endpoints

**API Endpoints Created:**
```
GET /api/rwanda-locations/provinces
GET /api/rwanda-locations/districts/:provinceId
GET /api/rwanda-locations/sectors/:districtId
GET /api/rwanda-locations/cells/:sectorId
GET /api/rwanda-locations/villages/:cellId
```

#### B. Generate All Locations
```bash
generate-all-locations.bat
```
**What it does:**
- Generates 2000+ cells (3-7 per sector)
- Generates 10000+ villages (3-8 per cell)
- Takes 2-5 minutes

---

## 🎓 Student Application Scripts

### 1. Run All Application Scripts
```bash
run-all-student-application-scripts.bat
```

**Duration:** 5-10 minutes  
**Includes:**
- Application System (Complete Setup)
- Basic Application System
- Enhanced Applications
- Enhanced Applications V2
- Production Application System

### Individual Application Scripts

#### A. Complete Application System
```bash
setup-application-system.bat
```
**Features:**
- Profile photo upload
- Report card image upload
- DOS review system
- Headmaster approval system
- SMS notifications
- Status tracking
- Statistics dashboard

**API Endpoints:**
```
POST   /api/student-applications/submit
GET    /api/student-applications/status/:applicationNumber
GET    /api/student-applications/dos/pending
POST   /api/student-applications/dos/review/:id
GET    /api/student-applications/headmaster/pending
POST   /api/student-applications/headmaster/decide/:id
GET    /api/student-applications/all
GET    /api/student-applications/details/:id
GET    /api/student-applications/statistics
```

#### B. Basic Application System
```bash
setup-student-applications.bat
```
**Features:**
- Modern Interactive UI
- Advanced Application Management
- Real-time Status Tracking
- Document Upload System
- Analytics Dashboard
- Bulk Operations
- Export Functionality

#### C. Enhanced Applications
```bash
setup-enhanced-applications.bat
```
**Features:**
- 4-step application form
- Document upload support
- Dynamic level selection
- Status management workflow
- DOS and Headmaster management
- Automatic notifications
- Interview scheduling
- Comprehensive reporting

#### D. Enhanced Applications V2
```bash
setup-enhanced-applications-v2.bat
```
**Features:**
- Improved UI/UX
- Better validation
- Enhanced workflow
- Additional reporting features

#### E. Production Application System
```bash
setup-student-application-production.bat
```
**Features:**
- Production-ready configuration
- Optimized performance
- Enhanced security
- Complete audit logging

---

## 📊 Database Tables Created

### Location Tables
```
rwanda_provinces
rwanda_districts
rwanda_sectors
rwanda_cells
rwanda_villages
```

### Application Tables
```
student_applications
application_documents
application_status_history
application_comments
application_notifications
application_statistics
```

---

## 🔗 Integration Points

### Frontend Components
```tsx
// Location Selector
<RwandaLocationSelector />

// Application Forms
<StudentApplicationForm />
<AdvancedApplicationsManagement />
<ApplicationStatusChecker />

// Management Dashboards
<DOSApplicationsManagement />
<HeadmasterApplicationsManagement />
<ApplicationManagementDashboard />
```

### Backend Routes
```javascript
// In server.js
const rwandaLocations = require('./routes/rwanda-locations');
const studentApplications = require('./routes/student-applications');

app.use('/api/rwanda-locations', rwandaLocations);
app.use('/api/student-applications', studentApplications);
```

---

## 📁 Directory Structure

### Upload Directories
```
backend/uploads/applications/
├── photos/           # Student profile photos
├── report-cards/     # Report card images
└── documents/        # Additional documents
```

---

## 🎯 Trade Levels Configuration

### Automotive (AUT)
- Level 4
- Level 5

### Building & Construction (BDC)
- Level 3
- Level 4
- Level 5

### Software Development (SOD)
- Level 3
- Level 4
- Level 5

---

## 🚀 Usage Workflow

### For Students
1. Visit the website
2. Click "Apply Now" or "Saba Kwiga muri Garden TVET"
3. Fill out the application form
4. Select location using Rwanda Location Selector
5. Upload required documents
6. Submit application
7. Receive application number
8. Track status using application number

### For DOS (Director of Studies)
1. Login to dashboard
2. Navigate to "Ibyifuzo byo Kwiga" (Applications)
3. View pending applications
4. Review application details
5. Score and add comments
6. Approve/Reject/Request Interview
7. System sends automatic notifications

### For Headmaster
1. Login to dashboard
2. Navigate to Applications section
3. View DOS-approved applications
4. Make final decision
5. Accept/Reject/Request More Info
6. System sends notifications to parents

---

## 🔧 Prerequisites

### Before Running Scripts
- ✅ MySQL Server running
- ✅ Database `school_management` exists
- ✅ Node.js installed
- ✅ npm dependencies installed (`npm install`)
- ✅ Backend `.env` file configured

### Required npm Packages
```bash
npm install multer mysql2 express
```

---

## 📝 Testing

### Test Location APIs
```bash
# Get all provinces
curl http://localhost:5000/api/rwanda-locations/provinces

# Get districts for Kigali (province_id = 1)
curl http://localhost:5000/api/rwanda-locations/districts/1

# Get sectors for Gasabo (district_id = 1)
curl http://localhost:5000/api/rwanda-locations/sectors/1
```

### Test Application APIs
```bash
# Submit application
curl -X POST http://localhost:5000/api/student-applications/submit \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe",...}'

# Check application status
curl http://localhost:5000/api/student-applications/status/APP-2025-001

# Get statistics
curl http://localhost:5000/api/student-applications/statistics
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MySQL Connection Error
**Solution:**
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database `school_management` exists

#### 2. Port Already in Use
**Solution:**
```bash
# Kill existing Node processes
taskkill /F /IM node.exe

# Or change port in .env
PORT=5001
```

#### 3. Permission Denied
**Solution:**
- Run Command Prompt as Administrator
- Check file permissions

#### 4. Module Not Found
**Solution:**
```bash
cd backend
npm install
```

---

## 📖 Documentation Files

- `RWANDA_LOCATIONS_SYSTEM.md` - Location system details
- `RWANDA_LOCATIONS_INTEGRATION_COMPLETE.md` - Integration guide
- `STUDENT_APPLICATION_SYSTEM_GUIDE.md` - Application system guide
- `STUDENT_APPLICATION_PRODUCTION_GUIDE.md` - Production deployment
- `ENHANCED_APPLICATION_SYSTEM_GUIDE.md` - Enhanced features guide

---

## 🎉 Success Indicators

### Location System Ready
✅ All 5 provinces inserted  
✅ All 30 districts inserted  
✅ All 416 sectors inserted  
✅ 2000+ cells generated  
✅ 10000+ villages generated  
✅ API endpoints responding  

### Application System Ready
✅ All database tables created  
✅ Upload directories created  
✅ API endpoints responding  
✅ Frontend components available  
✅ Notifications configured  
✅ Workflows functional  

---

## 💡 Next Steps After Setup

1. **Restart Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test Location Selector**
   - Open application form
   - Test province → district → sector → cell → village cascade

3. **Submit Test Application**
   - Fill out form completely
   - Upload test documents
   - Verify application number generation

4. **Test DOS Workflow**
   - Login as DOS
   - Review test application
   - Approve/reject

5. **Test Headmaster Workflow**
   - Login as Headmaster
   - Review DOS-approved application
   - Make final decision

6. **Verify Notifications**
   - Check SMS notifications sent
   - Verify email notifications
   - Test notification history

---

## 🔐 Security Notes

- All file uploads are validated
- SQL injection protection enabled
- Role-based access control enforced
- Audit logging for all actions
- Secure file storage with unique names
- Input sanitization on all forms

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review error logs in `backend/server.log`
3. Verify database tables exist
4. Test API endpoints individually
5. Check browser console for frontend errors

---

## 🎯 Summary

**Total Scripts:** 8 batch files  
**Total Setup Time:** 10-15 minutes  
**Database Tables:** 11 tables  
**API Endpoints:** 15+ endpoints  
**Frontend Components:** 7 components  
**Features:** 30+ features  

**Result:** Complete, production-ready location and application management system! 🚀

---

*Last Updated: January 2025*  
*Version: 1.0*  
*Garden TVET School Management System*
