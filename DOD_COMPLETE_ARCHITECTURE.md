# DOD COMPLETE SYSTEM - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOD COMPLETE SYSTEM ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              DODDashboardAdvanced.tsx (React Component)              │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │  │
│  │  │  Student    │  │  Conduct    │  │   Leave     │  │  Message   │ │  │
│  │  │   Table     │  │   Modal     │  │   Modal     │  │   Modal    │ │  │
│  │  │             │  │             │  │             │  │            │ │  │
│  │  │ • Checkbox  │  │ • Type      │  │ • Type      │  │ • Subject  │ │  │
│  │  │ • Search    │  │ • Severity  │  │ • Reason    │  │ • Message  │ │  │
│  │  │ • Filter    │  │ • Desc      │  │ • Dates     │  │ • Templates│ │  │
│  │  │ • Actions   │  │ • Points    │  │ • Approver  │  │ • Broadcast│ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │  │
│  │                                                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │  │                    Statistics Dashboard                       │   │  │
│  │  │  • Total Students  • Linked Parents  • Incidents             │   │  │
│  │  │  • Critical Cases  • Pending Actions • Avg Conduct           │   │  │
│  │  └──────────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                                   │ HTTP/HTTPS (JWT Auth)
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                              BACKEND LAYER                                    │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    Express.js Server (Node.js)                         │ │
│  │                    Route: /api/dod-complete                            │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                      API ENDPOINTS                                │ │ │
│  │  ├──────────────────────────────────────────────────────────────────┤ │ │
│  │  │                                                                   │ │ │
│  │  │  GET  /students/all          → Get all students + parent info   │ │ │
│  │  │  POST /conduct/remove         → Remove conduct + auto SMS        │ │ │
│  │  │  POST /leave/grant            → Grant leave + auto SMS           │ │ │
│  │  │  POST /message-parents        → Message selected parents         │ │ │
│  │  │  POST /message-all-parents    → Broadcast to all parents         │ │ │
│  │  │  GET  /statistics             → Get dashboard stats              │ │ │
│  │  │  GET  /student/:id/history    → Get student history              │ │ │
│  │  │                                                                   │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    BUSINESS LOGIC                                 │ │ │
│  │  ├──────────────────────────────────────────────────────────────────┤ │ │
│  │  │                                                                   │ │ │
│  │  │  • Authentication & Authorization (JWT)                          │ │ │
│  │  │  • Input Validation & Sanitization                               │ │ │
│  │  │  • Database Query Construction                                   │ │ │
│  │  │  • Parent Connection Lookup                                      │ │ │
│  │  │  • SMS Message Formatting                                        │ │ │
│  │  │  • Delivery Status Tracking                                      │ │ │
│  │  │  • Error Handling & Logging                                      │ │ │
│  │  │                                                                   │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└───────────────────────────┬───────────────────────┬───────────────────────────┘
                            │                       │
                            │                       │
                ┌───────────▼──────────┐  ┌─────────▼──────────┐
                │   DATABASE LAYER     │  │   SMS SERVICE      │
                │   (MySQL)            │  │   (Garden SMS)     │
                └──────────────────────┘  └────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐      ┌────────────────────────┐                │
│  │ global_student_sheets  │      │  parent_connections    │                │
│  ├────────────────────────┤      ├────────────────────────┤                │
│  │ • id (PK)              │◄─────┤ • student_id (FK)      │                │
│  │ • student_code         │      │ • parent_phone         │                │
│  │ • first_name           │      │ • parent_name          │                │
│  │ • last_name            │      │ • can_receive_notif    │                │
│  │ • trade_code           │      │ • status               │                │
│  │ • level_number         │      └────────────────────────┘                │
│  │ • conduct_score        │                                                 │
│  │ • status               │                                                 │
│  └────────────────────────┘                                                 │
│           │                                                                  │
│           │                                                                  │
│           ├──────────────┬──────────────┬──────────────┐                   │
│           │              │              │              │                   │
│  ┌────────▼────────┐ ┌──▼──────────┐ ┌─▼─────────────┐ ┌─▼──────────────┐ │
│  │ discipline_     │ │ student_    │ │ parent_       │ │ scheduled_     │ │
│  │ records         │ │ leaves      │ │ messages      │ │ meetings       │ │
│  ├─────────────────┤ ├─────────────┤ ├───────────────┤ ├────────────────┤ │
│  │ • student_id    │ │ • student_id│ │ • student_id  │ │ • student_id   │ │
│  │ • conduct_type  │ │ • leave_type│ │ • parent_phone│ │ • meeting_type │ │
│  │ • severity      │ │ • reason    │ │ • subject     │ │ • meeting_date │ │
│  │ • description   │ │ • start_time│ │ • message     │ │ • status       │ │
│  │ • points_deduct │ │ • end_time  │ │ • send_via    │ │ • parent_notif │ │
│  │ • new_score     │ │ • approved  │ │ • delivery    │ └────────────────┘ │
│  │ • parent_notif  │ │ • parent_not│ │ • created_at  │                    │
│  │ • sms_sent      │ │ • sms_sent  │ └───────────────┘                    │
│  └─────────────────┘ └─────────────┘                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMS SERVICE FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐                                                           │
│  │   Action     │  (Conduct Removal / Leave Grant / Manual Message)         │
│  │  Triggered   │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  1. Query parent_connections for student_id                          │  │
│  │     WHERE status = 'active' AND can_receive_notifications = 1        │  │
│  └──────┬───────────────────────────────────────────────────────────────┘  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  2. For each parent_phone:                                           │  │
│  │     • Format message in Kinyarwanda                                  │  │
│  │     • Add Garden TVET branding                                       │  │
│  │     • Include student details                                        │  │
│  │     • Add action details                                             │  │
│  │     • Add contact information                                        │  │
│  └──────┬───────────────────────────────────────────────────────────────┘  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  3. Send SMS via Garden SMS Service                                  │  │
│  │     • sendConductRemovalSMS()                                        │  │
│  │     • sendLeaveApprovalSMS()                                         │  │
│  │     • sendCustomParentSMS()                                          │  │
│  └──────┬───────────────────────────────────────────────────────────────┘  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  4. Track delivery status                                            │  │
│  │     • Success: Log message_id                                        │  │
│  │     • Failed: Log error                                              │  │
│  │     • Update parent_notified flag                                    │  │
│  │     • Update sms_sent flag                                           │  │
│  └──────┬───────────────────────────────────────────────────────────────┘  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  5. Return results to frontend                                       │  │
│  │     • Total parents contacted                                        │  │
│  │     • Successful deliveries                                          │  │
│  │     • Failed deliveries                                              │  │
│  │     • Individual status per parent                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DOD/Patron/Matron Login                                                    │
│         │                                                                    │
│         ▼                                                                    │
│  Navigate to DOD Dashboard                                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CHOOSE ACTION                                     │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  Option 1: Remove Conduct                                           │   │
│  │  ├─ Select student                                                  │   │
│  │  ├─ Click Gavel icon                                                │   │
│  │  ├─ Fill conduct form                                               │   │
│  │  ├─ Submit                                                           │   │
│  │  └─ ✅ Parents notified automatically                               │   │
│  │                                                                      │   │
│  │  Option 2: Grant Leave                                              │   │
│  │  ├─ Select student                                                  │   │
│  │  ├─ Click Check icon                                                │   │
│  │  ├─ Fill leave form                                                 │   │
│  │  ├─ Submit                                                           │   │
│  │  └─ ✅ Parents notified automatically                               │   │
│  │                                                                      │   │
│  │  Option 3: Message Individual Parent                                │   │
│  │  ├─ Select student                                                  │   │
│  │  ├─ Click Phone icon                                                │   │
│  │  ├─ Fill message form                                               │   │
│  │  ├─ Click "Send to Selected"                                        │   │
│  │  └─ ✅ Parent(s) receive message                                    │   │
│  │                                                                      │   │
│  │  Option 4: Message Multiple Parents                                 │   │
│  │  ├─ Check boxes next to students                                    │   │
│  │  ├─ Click "Message X Parents"                                       │   │
│  │  ├─ Fill message form                                               │   │
│  │  ├─ Click "Send to Selected"                                        │   │
│  │  └─ ✅ All selected parents receive message                         │   │
│  │                                                                      │   │
│  │  Option 5: Broadcast to All Parents                                 │   │
│  │  ├─ Click any Phone icon                                            │   │
│  │  ├─ Fill message form                                               │   │
│  │  ├─ Click "Broadcast to All"                                        │   │
│  │  ├─ Confirm action                                                  │   │
│  │  └─ ✅ ALL linked parents receive message                           │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Layer 1: Authentication                                                    │
│  ├─ JWT Token Required                                                      │
│  ├─ Token Validation                                                        │
│  └─ Session Management                                                      │
│                                                                              │
│  Layer 2: Authorization                                                     │
│  ├─ Role Check (DOD, Patron, Matron only)                                  │
│  ├─ Permission Verification                                                 │
│  └─ Access Control                                                          │
│                                                                              │
│  Layer 3: Input Validation                                                  │
│  ├─ Data Type Validation                                                    │
│  ├─ Required Field Check                                                    │
│  ├─ Format Validation                                                       │
│  └─ Sanitization                                                            │
│                                                                              │
│  Layer 4: Database Security                                                 │
│  ├─ Parameterized Queries                                                   │
│  ├─ SQL Injection Prevention                                                │
│  ├─ Transaction Management                                                  │
│  └─ Error Handling                                                          │
│                                                                              │
│  Layer 5: Audit Logging                                                     │
│  ├─ Action Logging                                                          │
│  ├─ User Tracking                                                           │
│  ├─ Timestamp Recording                                                     │
│  └─ Change History                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           PERFORMANCE OPTIMIZATIONS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Database Level:                                                            │
│  ├─ Indexes on frequently queried columns                                  │
│  ├─ Efficient JOIN operations                                              │
│  ├─ Query result caching                                                   │
│  └─ Connection pooling                                                     │
│                                                                              │
│  Application Level:                                                         │
│  ├─ Async/await for non-blocking operations                                │
│  ├─ Batch SMS sending                                                      │
│  ├─ Statistics caching (5 min TTL)                                         │
│  └─ Pagination support                                                     │
│                                                                              │
│  Frontend Level:                                                            │
│  ├─ React component optimization                                           │
│  ├─ Debounced search                                                       │
│  ├─ Lazy loading                                                           │
│  └─ Memoization                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              🎉 SYSTEM READY! 🎉
```
