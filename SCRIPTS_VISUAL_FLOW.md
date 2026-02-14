# 📊 Location & Application Scripts - Visual Flow

## 🎯 Master Script Flow

```
┌─────────────────────────────────────────────────────────────┐
│  run-all-location-and-application-scripts.bat               │
│  (Master Script - Runs Everything)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────────────────────┐
                            ▼                                 ▼
        ┌───────────────────────────────┐   ┌───────────────────────────────┐
        │  PART 1: LOCATION SYSTEM      │   │  PART 2: APPLICATION SYSTEM   │
        │  run-all-location-scripts.bat │   │  run-all-student-application- │
        │                               │   │  scripts.bat                  │
        └───────────────────────────────┘   └───────────────────────────────┘
                    │                                       │
                    │                                       │
        ┌───────────┴───────────┐               ┌──────────┴──────────┐
        ▼                       ▼               ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│ setup-rwanda-    │  │ generate-all-    │  │ setup-       │  │ setup-       │
│ locations.bat    │  │ locations.bat    │  │ application- │  │ student-     │
│                  │  │                  │  │ system.bat   │  │ applications │
│ • Provinces      │  │ • Cells          │  │              │  │ .bat         │
│ • Districts      │  │ • Villages       │  │ • Complete   │  │              │
│ • Sectors        │  │                  │  │   Setup      │  │ • Basic      │
│ • Sample Data    │  │ • 2000+ Cells    │  │ • Photos     │  │   System     │
│ • API Routes     │  │ • 10000+ Villages│  │ • Documents  │  │ • UI         │
└──────────────────┘  └──────────────────┘  └──────────────┘  └──────────────┘
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                            │ setup-       │ │ setup-       │ │ setup-       │
                            │ enhanced-    │ │ enhanced-    │ │ student-     │
                            │ applications │ │ applications │ │ application- │
                            │ .bat         │ │ -v2.bat      │ │ production   │
                            │              │ │              │ │ .bat         │
                            │ • 4-step     │ │ • Enhanced   │ │              │
                            │   Form       │ │   UI/UX      │ │ • Production │
                            │ • Workflow   │ │ • Better     │ │   Ready      │
                            │ • Interview  │ │   Validation │ │ • Optimized  │
                            └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🌍 Location System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RWANDA LOCATION HIERARCHY                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │   DATABASE TABLES     │       │    API ENDPOINTS      │
    └───────────────────────┘       └───────────────────────┘
                │                               │
    ┌───────────┴───────────┐       ┌──────────┴──────────┐
    ▼                       ▼       ▼                     ▼
┌─────────┐           ┌─────────┐  GET /provinces    GET /districts/:id
│Province │──1:N──────│District │  GET /sectors/:id  GET /cells/:id
│  (5)    │           │  (30)   │  GET /villages/:id
└─────────┘           └─────────┘
                           │
                      ┌────┴────┐
                      ▼         ▼
                ┌─────────┐  ┌─────────┐
                │ Sector  │  │  Cell   │
                │  (416)  │  │ (2000+) │
                └─────────┘  └─────────┘
                                  │
                                  ▼
                            ┌─────────┐
                            │ Village │
                            │(10000+) │
                            └─────────┘
```

---

## 🎓 Application System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              STUDENT APPLICATION WORKFLOW                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │   STUDENT SUBMITS     │       │   DATABASE TABLES     │
    │   APPLICATION         │       │                       │
    └───────────────────────┘       │ • student_applications│
                │                   │ • application_docs    │
                ▼                   │ • status_history      │
    ┌───────────────────────┐       │ • comments            │
    │   DOCUMENTS UPLOADED  │       │ • notifications       │
    │   • Profile Photo     │       │ • statistics          │
    │   • Report Card       │       └───────────────────────┘
    │   • Other Docs        │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   APPLICATION NUMBER  │
    │   GENERATED           │
    │   (APP-2025-XXX)      │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   DOS REVIEWS         │
    │   • View Details      │
    │   • Score Application │
    │   • Add Comments      │
    │   • Approve/Reject    │
    └───────────────────────┘
                │
                ├─────────────┬─────────────┐
                ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ APPROVED │  │ REJECTED │  │ INTERVIEW│
        └──────────┘  └──────────┘  └──────────┘
                │                         │
                ▼                         ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │   HEADMASTER REVIEW   │   │   SCHEDULE INTERVIEW  │
    │   • Final Decision    │   └───────────────────────┘
    │   • Accept/Reject     │
    └───────────────────────┘
                │
                ├─────────────┬─────────────┐
                ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ ACCEPTED │  │ REJECTED │  │ MORE INFO│
        └──────────┘  └──────────┘  └──────────┘
                │
                ▼
    ┌───────────────────────┐
    │   NOTIFICATIONS SENT  │
    │   • SMS to Parent     │
    │   • Email to Parent   │
    │   • Status Updated    │
    └───────────────────────┘
```

---

## 📊 Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCATION TABLES                               │
└─────────────────────────────────────────────────────────────────┘

rwanda_provinces (5 records)
    │
    └──> rwanda_districts (30 records)
            │
            └──> rwanda_sectors (416 records)
                    │
                    └──> rwanda_cells (2000+ records)
                            │
                            └──> rwanda_villages (10000+ records)

┌─────────────────────────────────────────────────────────────────┐
│                  APPLICATION TABLES                              │
└─────────────────────────────────────────────────────────────────┘

student_applications (main table)
    │
    ├──> application_documents (1:N)
    │       • Document uploads
    │       • File metadata
    │
    ├──> application_status_history (1:N)
    │       • Status changes
    │       • Timestamps
    │       • Changed by
    │
    ├──> application_comments (1:N)
    │       • DOS comments
    │       • Headmaster comments
    │       • Internal notes
    │
    ├──> application_notifications (1:N)
    │       • SMS sent
    │       • Email sent
    │       • Delivery status
    │
    └──> application_statistics (aggregated)
            • Total applications
            • By status
            • By trade
            • By level
```

---

## 🔄 Script Execution Flow

```
START
  │
  ├─> Check Prerequisites
  │   ├─> MySQL Running? ✓
  │   ├─> Database Exists? ✓
  │   ├─> Node.js Installed? ✓
  │   └─> Dependencies Installed? ✓
  │
  ├─> LOCATION SETUP (5-10 min)
  │   │
  │   ├─> Create Tables
  │   │   ├─> rwanda_provinces ✓
  │   │   ├─> rwanda_districts ✓
  │   │   ├─> rwanda_sectors ✓
  │   │   ├─> rwanda_cells ✓
  │   │   └─> rwanda_villages ✓
  │   │
  │   ├─> Insert Data
  │   │   ├─> 5 Provinces ✓
  │   │   ├─> 30 Districts ✓
  │   │   ├─> 416 Sectors ✓
  │   │   ├─> 2000+ Cells ✓
  │   │   └─> 10000+ Villages ✓
  │   │
  │   └─> Create API Routes ✓
  │
  ├─> APPLICATION SETUP (5-10 min)
  │   │
  │   ├─> Install Dependencies
  │   │   └─> multer ✓
  │   │
  │   ├─> Create Tables
  │   │   ├─> student_applications ✓
  │   │   ├─> application_documents ✓
  │   │   ├─> application_status_history ✓
  │   │   ├─> application_comments ✓
  │   │   ├─> application_notifications ✓
  │   │   └─> application_statistics ✓
  │   │
  │   ├─> Create Upload Directories
  │   │   ├─> photos/ ✓
  │   │   ├─> report-cards/ ✓
  │   │   └─> documents/ ✓
  │   │
  │   └─> Create API Routes ✓
  │
  └─> COMPLETE ✓
      │
      └─> Next Steps:
          ├─> Restart Backend Server
          ├─> Test Location APIs
          ├─> Test Application APIs
          ├─> Submit Test Application
          └─> Test DOS/Headmaster Workflows
```

---

## 🎯 Component Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │  LOCATION COMPONENTS  │       │  APPLICATION COMPS    │
    └───────────────────────┘       └───────────────────────┘
                │                               │
                ▼                               ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│ RwandaLocationSelector   │      │ StudentApplicationForm   │
│                          │      │ AdvancedApplications     │
│ • Province Dropdown      │      │   Management             │
│ • District Dropdown      │      │ ApplicationStatusChecker │
│ • Sector Dropdown        │      │ DOSApplications          │
│ • Cell Dropdown          │      │   Management             │
│ • Village Dropdown       │      │ HeadmasterApplications   │
│                          │      │   Management             │
│ • Cascading Selection    │      │ ApplicationManagement    │
│ • Real-time Loading      │      │   Dashboard              │
└──────────────────────────┘      └──────────────────────────┘
                │                               │
                └───────────────┬───────────────┘
                                ▼
                    ┌───────────────────────┐
                    │   BACKEND API ROUTES  │
                    └───────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │ /api/rwanda-locations │       │ /api/student-         │
    │                       │       │   applications        │
    │ • GET /provinces      │       │                       │
    │ • GET /districts/:id  │       │ • POST /submit        │
    │ • GET /sectors/:id    │       │ • GET /status/:num    │
    │ • GET /cells/:id      │       │ • GET /dos/pending    │
    │ • GET /villages/:id   │       │ • POST /dos/review    │
    └───────────────────────┘       │ • GET /headmaster/    │
                                    │   pending             │
                                    │ • POST /headmaster/   │
                                    │   decide              │
                                    └───────────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │   DATABASE TABLES     │
                                    └───────────────────────┘
```

---

## 📈 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

STUDENT
  │
  ├─> Opens Application Form
  │   │
  │   ├─> Selects Province
  │   │   └─> API: GET /api/rwanda-locations/provinces
  │   │       └─> Returns: [Kigali, Eastern, Northern, ...]
  │   │
  │   ├─> Selects District
  │   │   └─> API: GET /api/rwanda-locations/districts/1
  │   │       └─> Returns: [Gasabo, Kicukiro, Nyarugenge]
  │   │
  │   ├─> Selects Sector
  │   │   └─> API: GET /api/rwanda-locations/sectors/1
  │   │       └─> Returns: [Bumbogo, Gatsata, Gikomero, ...]
  │   │
  │   ├─> Selects Cell
  │   │   └─> API: GET /api/rwanda-locations/cells/1
  │   │       └─> Returns: [Cell A, Cell B, Cell C, ...]
  │   │
  │   └─> Selects Village
  │       └─> API: GET /api/rwanda-locations/villages/1
  │           └─> Returns: [Village 1, Village 2, ...]
  │
  ├─> Fills Application Form
  │   ├─> Personal Information
  │   ├─> Contact Details
  │   ├─> Education Background
  │   └─> Trade Selection
  │
  ├─> Uploads Documents
  │   ├─> Profile Photo
  │   ├─> Report Card
  │   └─> Other Documents
  │
  └─> Submits Application
      └─> API: POST /api/student-applications/submit
          └─> Returns: Application Number (APP-2025-XXX)

DOS
  │
  ├─> Views Pending Applications
  │   └─> API: GET /api/student-applications/dos/pending
  │       └─> Returns: List of pending applications
  │
  ├─> Reviews Application
  │   ├─> Views student details
  │   ├─> Views documents
  │   └─> Adds score and comments
  │
  └─> Makes Decision
      └─> API: POST /api/student-applications/dos/review/:id
          ├─> Approve → Sends to Headmaster
          ├─> Reject → Notifies parent
          └─> Interview → Schedules interview

HEADMASTER
  │
  ├─> Views DOS-Approved Applications
  │   └─> API: GET /api/student-applications/headmaster/pending
  │       └─> Returns: List of approved applications
  │
  ├─> Reviews Application
  │   ├─> Views DOS recommendation
  │   ├─> Views student details
  │   └─> Views all documents
  │
  └─> Makes Final Decision
      └─> API: POST /api/student-applications/headmaster/decide/:id
          ├─> Accept → Student admitted
          ├─> Reject → Application rejected
          └─> More Info → Requests additional info
          │
          └─> Triggers Notifications
              ├─> SMS to parent
              └─> Email to parent
```

---

## 🎨 Visual Summary

```
╔═══════════════════════════════════════════════════════════════╗
║                    COMPLETE SYSTEM OVERVIEW                    ║
╚═══════════════════════════════════════════════════════════════╝

┌─────────────────────┐         ┌─────────────────────┐
│  LOCATION SYSTEM    │         │  APPLICATION SYSTEM │
│                     │         │                     │
│  📍 5 Provinces     │         │  📝 Application Form│
│  📍 30 Districts    │    +    │  📤 Document Upload │
│  📍 416 Sectors     │         │  👨‍💼 DOS Review      │
│  📍 2000+ Cells     │         │  🎓 Headmaster      │
│  📍 10000+ Villages │         │  📊 Analytics       │
│  🔗 5 API Endpoints │         │  🔗 10+ API Endpoints│
└─────────────────────┘         └─────────────────────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
              ┌─────────────────────────┐
              │  INTEGRATED SYSTEM      │
              │                         │
              │  ✅ Complete Location   │
              │     Selection           │
              │  ✅ Full Application    │
              │     Workflow            │
              │  ✅ Document Management │
              │  ✅ Notifications       │
              │  ✅ Analytics           │
              │  ✅ Role-based Access   │
              └─────────────────────────┘
```

---

*Visual diagrams for Garden TVET School Management System*  
*Last Updated: January 2025*
