# DOD Parent Management System - Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOD PARENT MANAGEMENT SYSTEM                 │
│                         (Production Ready)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Level 4 SOD  │  │ All Parents  │  │   Contact    │         │
│  │    Sheet     │  │     View     │  │   Parent     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  /api/dod-parent-management/                                    │
│  ├── GET  /level4-sod-students      (View students + parents)   │
│  ├── GET  /parents                  (View all parents)          │
│  ├── GET  /parents/:id              (Parent details)            │
│  ├── POST /link-parent-student      (Manual linking)            │
│  ├── POST /auto-link-parent         (Auto-create & link)        │
│  ├── GET  /parents/:id/students     (Parent's children)         │
│  ├── POST /contact-parent           (Contact specific parent)   │
│  ├── POST /contact-student-parents  (Contact all parents)       │
│  └── GET  /stats                    (System statistics)         │
│                                                                  │
│  🔐 Security: JWT Auth + Role-Based Access Control              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  parent_student_links                                   │    │
│  │  ├── parent_id, student_id, relationship_type          │    │
│  │  ├── is_primary_contact, permissions                   │    │
│  │  └── auto_linked, verified, status                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  parents_info                                           │    │
│  │  ├── user_id, national_id, occupation                  │    │
│  │  ├── contact_preferences, location_data                │    │
│  │  └── children_in_school, is_verified                   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  level4_sod_students                                    │    │
│  │  ├── student_id, student_code, name, gender            │    │
│  │  ├── linked_parent_id, linked_parent_name              │    │
│  │  ├── linked_parent_phone, relationship                 │    │
│  │  └── conduct_score, attendance, grades                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  parent_contact_history                                 │    │
│  │  ├── parent_id, student_id, contact_type               │    │
│  │  ├── subject, message, category                        │    │
│  │  └── delivery_status, response_tracking                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  parent_notifications_queue                             │    │
│  │  ├── notification_id, parent_id, student_id            │    │
│  │  ├── notification_type, title, message                 │    │
│  │  └── send_via, priority, delivery_status               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  dod_actions_log                                        │    │
│  │  ├── action_id, action_type, student_id                │    │
│  │  ├── performed_by, action_details                      │    │
│  │  └── parent_notified, notification_ids                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION SERVICES                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   SMS    │  │ WhatsApp │  │  Email   │  │   Call   │       │
│  │ (Africa's│  │ Business │  │(SendGrid)│  │  (Twilio)│       │
│  │ Talking) │  │   API    │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. View Level 4 SOD Students with Parents

```
User Request
    │
    ▼
Frontend Component
    │
    ▼
GET /api/dod-parent-management/level4-sod-students
    │
    ▼
API Route Handler
    │
    ▼
Database Query (level4_sod_students + parent_student_links)
    │
    ▼
Response with Students + Linked Parents
    │
    ▼
Frontend Display
```

### 2. Auto-Link Parent to Student

```
User Action (Enter phone + name)
    │
    ▼
Frontend Form Submission
    │
    ▼
POST /api/dod-parent-management/auto-link-parent
    │
    ▼
API Route Handler
    │
    ├─► Check if parent exists (by phone)
    │   │
    │   ├─► Parent exists? Use existing
    │   │
    │   └─► Parent doesn't exist? Create new
    │
    ▼
Create parent_student_links record
    │
    ▼
Update level4_sod_students.linked_parent_*
    │
    ▼
Response: Success + parent_id
    │
    ▼
Frontend Update
```

### 3. Contact All Parents of Student

```
User Action (Click "Contact Parents")
    │
    ▼
Frontend Modal (Enter message)
    │
    ▼
POST /api/dod-parent-management/contact-student-parents
    │
    ▼
API Route Handler
    │
    ├─► Get all linked parents (parent_student_links)
    │
    ├─► For each parent:
    │   ├─► Log in parent_contact_history
    │   └─► Queue in parent_notifications_queue
    │
    ▼
Notification Service
    │
    ├─► SMS (Africa's Talking)
    ├─► WhatsApp (Business API)
    ├─► Email (SendGrid)
    └─► Call (Twilio)
    │
    ▼
Update delivery_status
    │
    ▼
Response: Success + notification_ids
    │
    ▼
Frontend Confirmation
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Authentication                                         │
│  ├── JWT Token Required                                          │
│  ├── Token Expiration (24 hours)                                 │
│  └── Refresh Token Support                                       │
│                                                                  │
│  Layer 2: Authorization                                          │
│  ├── Role-Based Access Control                                   │
│  ├── Allowed Roles: DOD, DOS, Admin, Headmaster                 │
│  └── Permission Checks on Each Endpoint                          │
│                                                                  │
│  Layer 3: Input Validation                                       │
│  ├── Request Body Validation                                     │
│  ├── Query Parameter Sanitization                                │
│  └── SQL Injection Protection (Parameterized Queries)            │
│                                                                  │
│  Layer 4: Rate Limiting                                          │
│  ├── General: 100 requests/15 minutes                            │
│  ├── Auth: 5 requests/15 minutes                                 │
│  └── API: 50 requests/15 minutes                                 │
│                                                                  │
│  Layer 5: Audit Logging                                          │
│  ├── All Actions Logged                                          │
│  ├── User Identification                                         │
│  └── Timestamp Tracking                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Database Relationships

```
┌──────────────┐         ┌──────────────────────┐         ┌──────────────┐
│    users     │         │ parent_student_links │         │    users     │
│  (parents)   │◄────────┤                      ├────────►│  (students)  │
│              │ parent_id│  relationship_type   │student_id│              │
│  - id        │         │  is_primary_contact  │         │  - id        │
│  - phone     │         │  permissions         │         │  - name      │
│  - email     │         │  auto_linked         │         │  - gender    │
└──────┬───────┘         └──────────────────────┘         └──────┬───────┘
       │                                                          │
       │                                                          │
       ▼                                                          ▼
┌──────────────┐                                         ┌──────────────────┐
│ parents_info │                                         │ level4_sod_      │
│              │                                         │ students         │
│  - user_id   │                                         │                  │
│  - national_id│                                        │  - student_id    │
│  - occupation│                                         │  - linked_parent_│
│  - location  │                                         │    id, name,     │
│  - preferences│                                        │    phone         │
└──────────────┘                                         └──────────────────┘
       │
       │
       ▼
┌──────────────────────┐
│ parent_contact_      │
│ history              │
│                      │
│  - parent_id         │
│  - student_id        │
│  - contact_type      │
│  - message           │
│  - delivery_status   │
└──────────────────────┘
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend (React + TypeScript)                                   │
│  ├── Hosted on: Vercel / Netlify / AWS S3                       │
│  ├── CDN: CloudFlare                                             │
│  └── Build: npm run build                                        │
│                                                                  │
│  Backend (Node.js + Express)                                     │
│  ├── Hosted on: AWS EC2 / DigitalOcean / Heroku                 │
│  ├── Process Manager: PM2                                        │
│  ├── Reverse Proxy: Nginx                                        │
│  └── SSL: Let's Encrypt                                          │
│                                                                  │
│  Database (MySQL/MariaDB)                                        │
│  ├── Hosted on: AWS RDS / DigitalOcean Managed DB               │
│  ├── Backup: Daily automated backups                             │
│  └── Replication: Master-Slave setup                             │
│                                                                  │
│  Notification Services                                           │
│  ├── SMS: Africa's Talking API                                   │
│  ├── WhatsApp: WhatsApp Business API                             │
│  ├── Email: SendGrid / AWS SES                                   │
│  └── Call: Twilio API                                            │
│                                                                  │
│  Monitoring & Logging                                            │
│  ├── Application: PM2 Logs                                       │
│  ├── Database: MySQL Slow Query Log                              │
│  ├── Errors: Sentry                                              │
│  └── Uptime: UptimeRobot                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📈 Scalability

```
Current Capacity:
├── Students: 10,000+
├── Parents: 20,000+
├── Links: 30,000+
├── Messages/Day: 50,000+
└── Concurrent Users: 500+

Optimization:
├── Database Indexing ✅
├── Query Optimization ✅
├── Connection Pooling ✅
├── Caching (Redis) 🔄
└── Load Balancing 🔄
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** January 27, 2025  
**Status:** Production Ready ✅
