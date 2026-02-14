# 🚀 Quick Reference - Location & Application Scripts

## ⚡ One-Click Setup (Recommended)

```bash
run-all-location-and-application-scripts.bat
```
**Runs everything in one go! (10-15 minutes)**

---

## 📦 Individual Script Groups

### 🌍 Location Scripts

| Script | Duration | What It Does |
|--------|----------|--------------|
| `run-all-location-scripts.bat` | 5-10 min | Runs all location scripts |
| `setup-rwanda-locations.bat` | 3-5 min | Sets up provinces, districts, sectors |
| `generate-all-locations.bat` | 2-5 min | Generates cells & villages |

### 🎓 Application Scripts

| Script | Duration | What It Does |
|--------|----------|--------------|
| `run-all-student-application-scripts.bat` | 5-10 min | Runs all application scripts |
| `setup-application-system.bat` | 2-3 min | Complete application system |
| `setup-student-applications.bat` | 1-2 min | Basic application system |
| `setup-enhanced-applications.bat` | 1-2 min | Enhanced features |
| `setup-enhanced-applications-v2.bat` | 1-2 min | Enhanced V2 |
| `setup-student-application-production.bat` | 1-2 min | Production version |

---

## 🔗 Key API Endpoints

### Location APIs
```
GET /api/rwanda-locations/provinces
GET /api/rwanda-locations/districts/:provinceId
GET /api/rwanda-locations/sectors/:districtId
GET /api/rwanda-locations/cells/:sectorId
GET /api/rwanda-locations/villages/:cellId
```

### Application APIs
```
POST /api/student-applications/submit
GET  /api/student-applications/status/:applicationNumber
GET  /api/student-applications/dos/pending
POST /api/student-applications/dos/review/:id
GET  /api/student-applications/headmaster/pending
POST /api/student-applications/headmaster/decide/:id
GET  /api/student-applications/analytics/dashboard
GET  /api/student-applications/statistics
GET  /api/student-applications/export/csv
```

---

## 📊 What Gets Created

### Location System
- ✅ 5 Provinces
- ✅ 30 Districts
- ✅ 416 Sectors
- ✅ 2000+ Cells
- ✅ 10000+ Villages

### Application System
- ✅ Application submission form
- ✅ Document upload system
- ✅ DOS review workflow
- ✅ Headmaster approval system
- ✅ Status tracking
- ✅ SMS/Email notifications
- ✅ Analytics dashboard
- ✅ Export functionality

---

## 🎯 Quick Commands

### Start Backend
```bash
cd backend
npm run dev
```

### Test Location API
```bash
curl http://localhost:5000/api/rwanda-locations/provinces
```

### Test Application API
```bash
curl http://localhost:5000/api/student-applications/statistics
```

### Kill Node Processes
```bash
taskkill /F /IM node.exe
```

---

## 📁 Important Files

### Documentation
- `LOCATION_APPLICATION_SCRIPTS_GUIDE.md` - Complete guide
- `RWANDA_LOCATIONS_SYSTEM.md` - Location system details
- `STUDENT_APPLICATION_SYSTEM_GUIDE.md` - Application guide

### Configuration
- `backend/.env` - Environment variables
- `backend/server.js` - Main server file

### Upload Directories
- `backend/uploads/applications/photos/`
- `backend/uploads/applications/report-cards/`
- `backend/uploads/applications/documents/`

---

## ✅ Checklist Before Running

- [ ] MySQL is running
- [ ] Database `school_management` exists
- [ ] Node.js installed
- [ ] npm dependencies installed (`npm install`)
- [ ] Backend `.env` configured

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| MySQL connection error | Check MySQL is running, verify credentials |
| Port already in use | Kill node processes: `taskkill /F /IM node.exe` |
| Module not found | Run `npm install` in backend folder |
| Permission denied | Run Command Prompt as Administrator |

---

## 🎉 Success Indicators

✅ Scripts complete without errors  
✅ Database tables created  
✅ API endpoints respond  
✅ Upload directories exist  
✅ Server starts successfully  

---

## 💡 Next Steps

1. Run the master script: `run-all-location-and-application-scripts.bat`
2. Wait for completion (10-15 minutes)
3. Restart backend: `cd backend && npm run dev`
4. Test location selector in application form
5. Submit a test application
6. Login as DOS to review
7. Login as Headmaster to approve

---

**🚀 You're ready to go!**

*For detailed information, see `LOCATION_APPLICATION_SCRIPTS_GUIDE.md`*
