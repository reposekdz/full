# 🚀 RUN PARENT LINKING SETUP

## Quick Start (Choose ONE method)

### Method 1: Double-Click Batch File (EASIEST)
```
1. Double-click: setup-parent-linking-tables.bat
2. Wait for completion
3. Restart backend server
```

### Method 2: Command Line
```bash
# From project root directory
node backend/migrations/run-parent-linking-setup.js
```

### Method 3: NPM Script
```bash
# Add to package.json scripts:
"setup-parent-linking": "node backend/migrations/run-parent-linking-setup.js"

# Then run:
npm run setup-parent-linking
```

---

## What It Does

✅ Creates 3 tables:
- `parent_linking_applications`
- `parent_child_links`
- `parent_linking_audit_log`

✅ Creates 3 stored procedures:
- `sp_submit_parent_linking_application`
- `sp_approve_parent_linking_application`
- `sp_reject_parent_linking_application`

✅ Verifies everything was created successfully

---

## After Running

1. **Restart Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Refresh Browser:**
   - Press `Ctrl+R`
   - Error should be gone!

3. **Test:**
   - Login as DOD
   - Check "Parent Applications" tab
   - Should show 0 applications (no error)

---

## Troubleshooting

### Error: Cannot find module 'mysql2'
```bash
cd backend
npm install mysql2
```

### Error: Access denied for user
- Check `.env` file
- Verify MySQL username/password
- Make sure MySQL is running

### Error: Unknown database
- Create database first:
  ```sql
  CREATE DATABASE garden_tvet_db;
  ```

### Error: Table already exists
- Tables already created, you're good!
- Just restart backend server

---

## ✅ Success Output

You should see:
```
═══════════════════════════════════════════════════════════════
PARENT LINKING TABLES - AUTO SETUP
═══════════════════════════════════════════════════════════════

📡 Connecting to database...
✅ Connected to database

📄 Reading SQL file...
✅ SQL file loaded

🔧 Creating tables and procedures...
✅ Tables and procedures created successfully!

🔍 Verifying tables...

📋 Tables created:
   ✅ parent_linking_applications
   ✅ parent_child_links
   ✅ parent_linking_audit_log

📋 Stored procedures created:
   ✅ sp_submit_parent_linking_application
   ✅ sp_approve_parent_linking_application
   ✅ sp_reject_parent_linking_application

═══════════════════════════════════════════════════════════════
✅ SETUP COMPLETE!
═══════════════════════════════════════════════════════════════
```

---

## 🎉 Done!

After successful setup:
- ✅ No more 500 errors
- ✅ DOD dashboard loads
- ✅ Parent applications work
- ✅ SMS notifications work

**Now restart your backend and test!** 🚀
