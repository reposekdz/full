# 📊 Parent Portal Interactive - Visual Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PARENT PORTAL SYSTEM                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   PARENT     │────────▶│   BACKEND    │────────▶│   DATABASE   │
│   (React)    │◀────────│   (Node.js)  │◀────────│   (MySQL)    │
└──────────────┘         └──────────────┘         └──────────────┘
      │                         │                         │
      │                         │                         │
      ▼                         ▼                         ▼
  Dashboard              API Endpoints              Tables
  Components             Authentication             Data Storage
```

## Data Flow

```
PARENT LOGIN
     │
     ▼
AUTHENTICATION (JWT)
     │
     ▼
FETCH LINKED CHILDREN
     │
     ▼
SELECT CHILD
     │
     ├─▶ CONDUCT ──────▶ student_conduct_records
     │
     ├─▶ ATTENDANCE ───▶ attendance
     │
     ├─▶ GRADES ───────▶ grades
     │
     ├─▶ FEES ─────────▶ fees + fee_payments
     │
     ├─▶ ASSIGNMENTS ──▶ assignments + submissions
     │
     └─▶ NOTIFICATIONS ▶ parent_notifications
```

## Feature Map

```
┌─────────────────────────────────────────────────────────┐
│                    PARENT DASHBOARD                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   CHILDREN   │  │ NOTIFICATIONS│  │   INCIDENTS  │ │
│  │      3       │  │      12      │  │      2       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │           SELECT CHILD: John Doe                   ││
│  │  Trade: SOD | Level: 4 | Conduct: 95 | Att: 98%  ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ TABS: Overview | Conduct | Attendance | Grades |   ││
│  │       Fees | Assignments                            ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │                  TAB CONTENT                         ││
│  │  • Real-time data display                           ││
│  │  • Interactive elements                             ││
│  │  • Action buttons                                   ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## User Journey

```
1. PARENT LOGS IN
   └─▶ Phone: +250 XXX XXX XXX
   └─▶ Password: ********

2. DASHBOARD LOADS
   └─▶ Summary cards appear
   └─▶ Children list displayed
   └─▶ Notifications loaded

3. SELECT CHILD
   └─▶ Click on child card
   └─▶ Child details highlighted
   └─▶ Tabs become active

4. NAVIGATE TABS
   └─▶ Click "Conduct"
       └─▶ View incidents
       └─▶ See severity levels
       └─▶ Check dates
   
   └─▶ Click "Attendance"
       └─▶ View daily records
       └─▶ See statistics
       └─▶ Check patterns
   
   └─▶ Click "Grades"
       └─▶ View all subjects
       └─▶ See marks
       └─▶ Check average
   
   └─▶ Click "Fees"
       └─▶ View balance
       └─▶ Make payment
       └─▶ Download receipt

5. TAKE ACTIONS
   └─▶ Submit leave request
   └─▶ Message teacher
   └─▶ Mark notifications read
```

## Database Relationships

```
parents
   │
   └─▶ parent_student_links
          │
          └─▶ students
                 │
                 ├─▶ student_conduct_records
                 ├─▶ attendance
                 ├─▶ grades
                 ├─▶ fees
                 ├─▶ fee_payments
                 ├─▶ assignments
                 ├─▶ assignment_submissions
                 └─▶ report_cards

parent_notifications ──▶ parents
leave_requests ──▶ students + parents
messages ──▶ parents + teachers
```

## API Request Flow

```
CLIENT REQUEST
     │
     ▼
┌─────────────────┐
│ Authorization   │ ──▶ Verify JWT Token
│ Header Check    │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Parent-Student  │ ──▶ Verify Link
│ Link Validation │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Database Query  │ ──▶ Fetch Data
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Format Response │ ──▶ JSON
└─────────────────┘
     │
     ▼
CLIENT RECEIVES DATA
```

## Component Hierarchy

```
ParentDashboardInteractive
│
├─▶ Header
│   ├─▶ Title
│   └─▶ Description
│
├─▶ Summary Cards
│   ├─▶ Total Children Card
│   ├─▶ Notifications Card
│   ├─▶ Incidents Card
│   └─▶ Requests Card
│
├─▶ Children Selection
│   └─▶ Child Cards (map)
│       ├─▶ Profile Avatar
│       ├─▶ Name & Details
│       └─▶ Quick Stats Badges
│
└─▶ Tabs Component
    ├─▶ Overview Tab
    │   ├─▶ Quick Stats Card
    │   └─▶ Recent Notifications Card
    │
    ├─▶ Conduct Tab
    │   └─▶ Conduct Records List
    │
    ├─▶ Attendance Tab
    │   └─▶ Attendance Records List
    │
    ├─▶ Grades Tab
    │   └─▶ Grades List
    │
    ├─▶ Fees Tab
    │   ├─▶ Fee Summary
    │   └─▶ Payment Button
    │
    └─▶ Assignments Tab
        └─▶ Assignments List
```

## State Management

```
┌─────────────────────────────────────┐
│         COMPONENT STATE              │
├─────────────────────────────────────┤
│ • children: []                       │
│ • selectedChild: null                │
│ • activeTab: 'overview'              │
│ • conductRecords: []                 │
│ • attendance: []                     │
│ • grades: []                         │
│ • fees: {}                           │
│ • assignments: []                    │
│ • notifications: []                  │
│ • summary: {}                        │
│ • loading: true                      │
└─────────────────────────────────────┘
```

## Color Coding System

```
CONDUCT SEVERITY:
├─▶ Minor:    Yellow  (⚠️)
├─▶ Moderate: Orange  (🟠)
├─▶ Major:    Red     (🔴)
└─▶ Severe:   Purple  (🟣)

ATTENDANCE STATUS:
├─▶ Present:  Green   (✅)
├─▶ Absent:   Red     (❌)
├─▶ Late:     Orange  (⏰)
└─▶ Excused:  Blue    (ℹ️)

GRADE LEVELS:
├─▶ A: Green   (90-100%)
├─▶ B: Blue    (80-89%)
├─▶ C: Yellow  (70-79%)
├─▶ D: Orange  (60-69%)
└─▶ F: Red     (0-59%)
```

---

**Visual representation of the Parent Portal Interactive System**
