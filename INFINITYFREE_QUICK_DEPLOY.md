# 🚀 InfinityFree Deployment - Quick Reference

## ⚡ 3-Step Deploy (5 minutes)

### Step 1: Export Database
```bash
deploy-to-infinityfree.bat
```
Enter MySQL password when prompted.

### Step 2: Upload to phpMyAdmin
1. **Open:** https://php-myadmin.net/
2. **Login:**
   - Username: `if0_41208136`
   - Password: `[your database password]`
   - Database: `if0_41208136_school_managements`
3. **Import:**
   - Click **Import** tab
   - Choose file: `school_management_infinityfree.sql`
   - Click **Go**
   - Wait for ✅ success

### Step 3: Update Frontend
Edit `src/app/config/apiBase.ts`:
```typescript
export const API_BASE_URL = 'https://your-domain.com/api';
```

---

## 🔧 Database Connection Details

```env
Host: sql108.infinityfree.com
User: if0_41208136
Database: if0_41208136_school_managements
Port: 3306
```

---

## 📊 File Size Limits

| Limit | Value |
|-------|-------|
| Max Upload | 50 MB |
| Max Database | 1 GB |
| Max Connections | 10 |

**If file > 50MB:**
```bash
# Option 1: Clean old data
clean-database-before-export.bat

# Option 2: Split file
split-database-export.bat

# Option 3: Compress
# Just ZIP the SQL file (phpMyAdmin supports it)
```

---

## ✅ Verify Deployment

### Check Tables
```sql
SHOW TABLES;
-- Should show 40+ tables
```

### Check Data
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM global_student_sheets;
SELECT COUNT(*) FROM parent_links;
```

### Test API
```bash
curl https://your-domain.com/api/health
```

---

## 🐛 Common Issues

### Issue: "File too large"
**Fix:** Run `clean-database-before-export.bat` first

### Issue: "Connection timeout"
**Fix:** Upload via FTP, then import via SSH

### Issue: "Foreign key constraint"
**Fix:** Already handled in export script

### Issue: "Character encoding"
**Fix:** Already set to utf8mb4 in export

---

## 📞 Support Links

- **InfinityFree Forum:** https://forum.infinityfree.com/
- **phpMyAdmin Docs:** https://docs.phpmyadmin.net/
- **Your Database:** https://php-myadmin.net/db_structure.php?db=if0_41208136_school_managements

---

## 🎯 Post-Deploy Checklist

- [ ] All tables imported
- [ ] Row counts match
- [ ] Backend connects
- [ ] Login works
- [ ] Student data loads
- [ ] Parent linking works
- [ ] SMS sends (if configured)

---

**Need help?** See full guide: `DEPLOY_TO_INFINITYFREE.md`
