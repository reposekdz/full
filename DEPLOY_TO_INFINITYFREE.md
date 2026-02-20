# 🚀 Deploy Database to InfinityFree - Complete Guide

## 📋 Quick Steps (5 minutes)

### Step 1: Export Your Local Database
```bash
# Run this script to export your database
export-database.bat
```

### Step 2: Upload to InfinityFree
1. Go to: https://php-myadmin.net/db_structure.php?db=if0_41208136_school_managements
2. Click **Import** tab
3. Click **Choose File**
4. Select `school_management_export.sql`
5. Click **Go**

### Step 3: Update Backend Config
```bash
# Run this to update connection settings
update-infinityfree-config.bat
```

---

## 🔧 Detailed Instructions

### A. Export Database (3 Methods)

#### Method 1: Automated Script (RECOMMENDED)
```bash
export-database.bat
```

#### Method 2: MySQL Command
```bash
cd backend
mysqldump -u root -p school_management > ../school_management_export.sql
```

#### Method 3: phpMyAdmin (Local)
1. Open: http://localhost/phpmyadmin
2. Select `school_management` database
3. Click **Export** tab
4. Choose **Quick** export method
5. Format: **SQL**
6. Click **Go**
7. Save as `school_management_export.sql`

---

### B. Upload to InfinityFree

#### Step 1: Login to phpMyAdmin
- URL: https://php-myadmin.net/
- Database: `if0_41208136_school_managements`
- Username: `if0_41208136` (from your hosting panel)
- Password: (your database password)

#### Step 2: Import Database
1. Click **Import** tab at top
2. Click **Choose File** button
3. Select `school_management_export.sql`
4. **Important Settings:**
   - Format: SQL
   - Character set: utf8mb4_unicode_ci
   - Max file size: Check limit (usually 50MB)
5. Click **Go** button
6. Wait for success message

#### Step 3: Verify Import
1. Click **Structure** tab
2. Verify all tables exist:
   - ✅ users
   - ✅ students
   - ✅ teachers
   - ✅ global_student_sheets
   - ✅ student_conduct_records
   - ✅ parent_links
   - ✅ sms_notifications
   - ✅ news_articles
   - ✅ staff_advanced
   - ✅ rwanda_provinces
   - ✅ rwanda_districts
   - ✅ rwanda_sectors
   - ✅ rwanda_cells
   - ✅ rwanda_villages
   - (and 30+ more tables)

---

### C. Update Backend Configuration

#### Option 1: Automated (RECOMMENDED)
```bash
update-infinityfree-config.bat
```

#### Option 2: Manual Edit
Edit `backend/.env`:
```env
# InfinityFree Database Configuration
DB_HOST=sql108.infinityfree.com
DB_USER=if0_41208136
DB_PASSWORD=your_database_password_here
DB_NAME=if0_41208136_school_managements
DB_PORT=3306

# Keep other settings
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

---

## 🔥 Troubleshooting

### Problem 1: File Too Large (>50MB)
**Solution A: Split Export**
```bash
# Export in chunks
split-database-export.bat
```

**Solution B: Compress**
```bash
# Zip the SQL file
7z a school_management_export.zip school_management_export.sql
# Upload ZIP file (phpMyAdmin supports it)
```

**Solution C: Remove Large Tables First**
```sql
-- Export without these tables first
mysqldump -u root -p school_management 
  --ignore-table=school_management.audit_logs 
  --ignore-table=school_management.sms_queue 
  > school_management_small.sql

-- Then export large tables separately
mysqldump -u root -p school_management audit_logs > audit_logs.sql
mysqldump -u root -p school_management sms_queue > sms_queue.sql
```

### Problem 2: Import Timeout
**Solution:**
1. Increase timeout in phpMyAdmin
2. Or use FTP + command line:
```bash
# Upload via FTP to: /htdocs/
# Then SSH into server:
mysql -u if0_41208136 -p if0_41208136_school_managements < school_management_export.sql
```

### Problem 3: Character Encoding Issues
**Solution:**
```sql
-- Add at top of SQL file
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
```

### Problem 4: Foreign Key Constraints
**Solution:**
```sql
-- Add at top of SQL file
SET FOREIGN_KEY_CHECKS=0;

-- Your SQL here

-- Add at bottom
SET FOREIGN_KEY_CHECKS=1;
```

---

## 📊 Database Size Optimization

### Check Current Size
```sql
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'school_management'
ORDER BY (data_length + index_length) DESC;
```

### Clean Before Export
```bash
clean-database-before-export.bat
```

This removes:
- Old audit logs (>6 months)
- Sent SMS (>3 months)
- Expired sessions
- Temporary data

---

## 🎯 Post-Deployment Checklist

### 1. Test Database Connection
```bash
cd backend
npm run test-db-connection
```

### 2. Verify Critical Tables
```sql
-- Check users
SELECT COUNT(*) FROM users;

-- Check students
SELECT COUNT(*) FROM global_student_sheets;

-- Check parent links
SELECT COUNT(*) FROM parent_links;
```

### 3. Test API Endpoints
```bash
# Test login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test students
curl https://your-domain.com/api/students
```

### 4. Update Frontend Config
Edit `src/app/config/apiBase.ts`:
```typescript
export const API_BASE_URL = 'https://your-domain.com/api';
```

---

## 🔐 Security Notes

### 1. Change Default Passwords
```sql
-- Update admin password
UPDATE users SET password = '$2b$10$newhashedpassword' WHERE username = 'admin';
```

### 2. Restrict Database Access
- Use strong database password
- Don't share credentials
- Enable SSL if available

### 3. Backup Regularly
```bash
# Setup auto-backup (run weekly)
setup-auto-backup.bat
```

---

## 📱 InfinityFree Specific Tips

### Database Limits
- Max database size: 1GB
- Max connections: 10 concurrent
- Max query time: 30 seconds
- Max file upload: 50MB

### Best Practices
1. **Use connection pooling** (already configured)
2. **Index frequently queried columns**
3. **Archive old data** (>1 year)
4. **Monitor size** regularly

### Connection String
```javascript
// backend/config/database.js
const pool = mysql.createPool({
  host: 'sql108.infinityfree.com',
  user: 'if0_41208136',
  password: process.env.DB_PASSWORD,
  database: 'if0_41208136_school_managements',
  waitForConnections: true,
  connectionLimit: 5, // InfinityFree limit
  queueLimit: 0,
  connectTimeout: 10000
});
```

---

## 🚀 Quick Deploy Commands

```bash
# Full deployment (one command)
deploy-to-infinityfree.bat

# This will:
# 1. Export database
# 2. Optimize SQL file
# 3. Update config
# 4. Test connection
# 5. Show upload instructions
```

---

## 📞 Support

If you encounter issues:
1. Check InfinityFree forums
2. Review error logs in phpMyAdmin
3. Test connection with: `test-infinityfree-connection.bat`
4. Contact InfinityFree support with error details

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ All tables visible in phpMyAdmin
- ✅ Row counts match local database
- ✅ Backend connects without errors
- ✅ Login works on deployed site
- ✅ Student data loads correctly
- ✅ Parent linking functions
- ✅ SMS notifications send

---

**Next Steps:**
1. Run `export-database.bat`
2. Upload to phpMyAdmin
3. Run `update-infinityfree-config.bat`
4. Test your app!

🎉 **Your school management system will be live!**
