# DOD COMPLETE SYSTEM - Quick Reference

## 🚀 Quick Start (3 Steps)

### 1. Setup Database
```bash
setup-dod-complete.bat
```

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 3. Login & Use
- Login as DOD/Patron/Matron
- Navigate to DOD Dashboard
- Start managing students!

## 📋 Key Features

| Feature | Description | Auto SMS |
|---------|-------------|----------|
| **Remove Conduct** | Deduct conduct points | ✅ Yes |
| **Grant Leave** | Approve student leave | ✅ Yes |
| **Message Parents** | Send custom messages | ✅ Yes |
| **Bulk Selection** | Select multiple students | ✅ Yes |
| **Broadcast** | Message ALL parents | ✅ Yes |

## 🎯 Common Tasks

### Remove Conduct from Student

1. Go to **Students** tab
2. Find student in table
3. Click **Gavel icon** (Remove Conduct)
4. Fill form:
   - Conduct Type: Select from dropdown
   - Severity: Light/Moderate/Severe
   - Description: Explain what happened
   - Action Taken: What you did
   - Points to Deduct: How many points
5. Click **Remove Conduct & Notify Parent**
6. ✅ Done! Parents receive SMS automatically

### Grant Leave to Student

1. Go to **Students** tab
2. Find student in table
3. Click **Check icon** (Grant Leave)
4. Fill form:
   - Leave Type: Select type
   - Reason: Why they need leave
   - Start Time: When leave starts
   - End Time: When leave ends
5. Click **Grant Leave & Notify Parent**
6. ✅ Done! Parents receive SMS automatically

### Message Individual Parent

1. Go to **Students** tab
2. Find student in table
3. Click **Phone icon** (Message Parent)
4. Fill form:
   - Subject: Message title
   - Message: Your message
   - Send Via: SMS/WhatsApp/Both
5. Click **Send to Selected**
6. ✅ Done! Message sent

### Message Multiple Parents (Bulk)

1. Go to **Students** tab
2. Check boxes next to students
3. Click **Message X Parents** button
4. Fill form and send
5. ✅ Done! All selected parents receive message

### Broadcast to ALL Parents

1. Go to **Students** tab
2. Click any **Phone icon**
3. Fill message form
4. Click **Broadcast to All**
5. Confirm action
6. ✅ Done! ALL linked parents receive message

## 📱 Message Templates

### School Notice
```
Subject: Itangazo ry'Ishuri
Message: Mwaramutse. Dufite itangazo ry'ingenzi ku bijyanye n'umwana wanyu.
```

### Parent Meeting
```
Subject: Inama y'Ababyeyi
Message: Mwahamagariwe mu nama y'ababyeyi. Itariki: [Date]
```

### Good Behavior
```
Subject: Imyitwarire Myiza
Message: Tubifuza kukumenyesha ko umwana wanyu agaragaza imyitwarire myiza mu ishuri.
```

## 🔍 Search & Filter

### Search Students
- Type in search box
- Searches: Name, Student Code
- Real-time filtering

### Filter by Conduct
- Poor: Score < 24
- Warning: Score 24-31
- Good: Score 32+

### Filter by Trade/Level
- Use dropdown filters
- Combine multiple filters

## 📊 Statistics Dashboard

| Stat | What it Shows |
|------|---------------|
| **Total Students** | All active students |
| **Linked Parents** | Parents with accounts |
| **Total Incidents** | This month's incidents |
| **Critical** | Severe incidents |
| **Pending Actions** | Students needing attention |
| **Avg Conduct** | Average conduct score |

## 🎨 UI Elements

### Student Table Columns

| Column | Shows |
|--------|-------|
| ☑️ Checkbox | Select for bulk actions |
| **Student ID** | Unique student code |
| **Name** | First & Last name |
| **Trade/Level** | ELE L3, etc. |
| **Conduct Score** | Score with progress bar |
| **Incidents** | Total incident count |
| **Linked Parents** | Number of linked parents |
| **Status** | Excellent/Good/Poor |
| **Actions** | Conduct/Leave/Message buttons |

### Action Buttons

| Icon | Action | Color |
|------|--------|-------|
| ⚖️ Gavel | Remove Conduct | Red |
| ✅ Check | Grant Leave | Green |
| 📞 Phone | Message Parent | Blue |

## 🔐 Roles with Access

- ✅ **DOD** (Director of Discipline)
- ✅ **Patron** (Boys' Supervisor)
- ✅ **Matron** (Girls' Supervisor)
- ❌ Other roles: No access

## 📞 Parent Linking

### How Parents Link

1. Parent creates account on parent portal
2. Parent enters student code
3. System verifies and links
4. Parent can now receive notifications

### Check if Parent is Linked

Look at **Linked Parents** column in student table:
- **0** = No parents linked
- **1+** = Parents linked and will receive SMS

## 🚨 Important Notes

### ⚠️ SMS Notifications

- SMS sent ONLY to linked parents
- Parents must have valid phone number
- Parents must have notifications enabled
- Check "Linked Parents" count before actions

### ⚠️ Conduct Scores

- Maximum: 40 points
- Minimum: 0 points
- Cannot deduct more than current score
- Score updates automatically

### ⚠️ Bulk Operations

- Select students using checkboxes
- "Select All" button available
- Selected count shown in button
- Deselect by unchecking boxes

## 🐛 Quick Fixes

### Problem: No students showing
**Fix:** Check if students exist in global_student_sheets table

### Problem: Parents not receiving SMS
**Fix:** Verify parent_connections table has entries with valid phone numbers

### Problem: Can't remove conduct
**Fix:** Ensure all required fields are filled (type, severity, description, points)

### Problem: Broadcast not working
**Fix:** Confirm there are linked parents in the system

## 📈 Best Practices

1. **Always fill descriptions** - Be specific about incidents
2. **Use appropriate severity** - Match severity to incident
3. **Check linked parents** - Verify parents will receive notification
4. **Use templates** - Save time with quick templates
5. **Review before broadcast** - Double-check message before sending to all

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl + F` | Focus search box |
| `Esc` | Close modal |
| `Enter` | Submit form (in modal) |

## 📊 Performance Tips

- Use search to find specific students quickly
- Filter by trade/level to narrow results
- Bulk operations are faster than individual
- Statistics refresh automatically

## ✅ Success Indicators

| Message | Meaning |
|---------|---------|
| "✅ Conduct removed! X parent(s) notified" | Success! |
| "✅ Leave granted! X parent(s) notified" | Success! |
| "✅ Messages sent to X parents" | Success! |
| "✅ Broadcast sent to X parents" | Success! |

## 🎉 You're Ready!

Now you can:
- ✅ Manage student conduct
- ✅ Grant student leave
- ✅ Message parents individually
- ✅ Message parents in bulk
- ✅ Broadcast to all parents
- ✅ Track everything in real-time

**Happy Managing! 🎓**

---

**Need Help?**
- 📖 Full Documentation: DOD_COMPLETE_DOCUMENTATION.md
- 📞 Support: +250783407691
- 📧 Email: support@gardentvet.rw
