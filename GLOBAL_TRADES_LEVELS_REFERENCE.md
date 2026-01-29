# 🎓 Global Trades & Levels System - Quick Reference

## 📊 System Overview

The school has **3 trades** with specific levels for each trade. This is a **global system** used across ALL staff roles.

## 🏗️ Available Trades

### 1. **SOD - Software Development**
- **Code:** `SOD`
- **Full Name:** Software Development
- **Levels:** 3, 4, 5
- **Total Levels:** 3

### 2. **BDC - Building Construction**
- **Code:** `BDC`
- **Full Name:** Building Construction
- **Levels:** 3, 4, 5
- **Total Levels:** 3

### 3. **AUT - Automotive**
- **Code:** `AUT`
- **Full Name:** Automotive Technology
- **Levels:** 3, 4A, 4B, 5A, 5B
- **Total Levels:** 5

## 📋 Level Structure

### **SOD & BDC:**
```
Level 3 → Level 4 → Level 5
```

### **AUT:**
```
Level 3 → Level 4A → Level 4B → Level 5A → Level 5B
```

## 🔌 API Endpoints

### **Get All Trades with Levels:**
```typescript
GET /api/levels/trades-with-levels

Response:
{
  "success": true,
  "trades": [
    {
      "code": "SOD",
      "name": "Software Development",
      "levels": [
        { "level_number": 3, "level_suffix": null },
        { "level_number": 4, "level_suffix": null },
        { "level_number": 5, "level_suffix": null }
      ]
    },
    {
      "code": "BDC",
      "name": "Building Construction",
      "levels": [
        { "level_number": 3, "level_suffix": null },
        { "level_number": 4, "level_suffix": null },
        { "level_number": 5, "level_suffix": null }
      ]
    },
    {
      "code": "AUT",
      "name": "Automotive Technology",
      "levels": [
        { "level_number": 3, "level_suffix": null },
        { "level_number": 4, "level_suffix": "A" },
        { "level_number": 4, "level_suffix": "B" },
        { "level_number": 5, "level_suffix": "A" },
        { "level_number": 5, "level_suffix": "B" }
      ]
    }
  ]
}
```

### **Get Specific Trade Levels:**
```typescript
GET /api/levels/trades/:code/levels

Example: GET /api/levels/trades/SOD/levels

Response:
{
  "success": true,
  "trade": "SOD",
  "levels": [
    { "level_number": 3, "level_suffix": null },
    { "level_number": 4, "level_suffix": null },
    { "level_number": 5, "level_suffix": null }
  ]
}
```

### **Get All Levels:**
```typescript
GET /api/levels/levels

Response:
{
  "success": true,
  "levels": [
    { "trade_code": "SOD", "level_number": 3, "level_suffix": null },
    { "trade_code": "SOD", "level_number": 4, "level_suffix": null },
    { "trade_code": "SOD", "level_number": 5, "level_suffix": null },
    { "trade_code": "BDC", "level_number": 3, "level_suffix": null },
    { "trade_code": "BDC", "level_number": 4, "level_suffix": null },
    { "trade_code": "BDC", "level_number": 5, "level_suffix": null },
    { "trade_code": "AUT", "level_number": 3, "level_suffix": null },
    { "trade_code": "AUT", "level_number": 4, "level_suffix": "A" },
    { "trade_code": "AUT", "level_number": 4, "level_suffix": "B" },
    { "trade_code": "AUT", "level_number": 5, "level_suffix": "A" },
    { "trade_code": "AUT", "level_number": 5, "level_suffix": "B" }
  ]
}
```

## 💻 Usage in Code

### **Fetch Trades with Levels:**
```typescript
import apiService from '@/app/services/apiService';

// In your component
const [trades, setTrades] = useState<any[]>([]);

useEffect(() => {
  const fetchTrades = async () => {
    const res = await apiService.getTradesWithLevels();
    if (res.success) {
      setTrades(res.trades || []);
    }
  };
  fetchTrades();
}, []);
```

### **Trade Dropdown:**
```typescript
<Select value={selectedTrade} onValueChange={setSelectedTrade}>
  <SelectTrigger>
    <SelectValue placeholder="Hitamo Umwuga" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">Imyuga Yose</SelectItem>
    {trades.map(trade => (
      <SelectItem key={trade.code} value={trade.code}>
        {trade.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### **Level Dropdown (Dynamic based on Trade):**
```typescript
<Select value={selectedLevel} onValueChange={setSelectedLevel}>
  <SelectTrigger>
    <SelectValue placeholder="Hitamo Urwego" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">Inzego Zose</SelectItem>
    {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels?.map((level: any) => (
      <SelectItem 
        key={`${level.level_number}${level.level_suffix || ''}`} 
        value={level.level_number.toString()}
      >
        Level {level.level_number}{level.level_suffix || ''}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### **Filter Students by Trade and Level:**
```typescript
const filteredStudents = students.filter(student => {
  const matchesTrade = !selectedTrade || student.trade_code === selectedTrade;
  const matchesLevel = !selectedLevel || student.level_number?.toString() === selectedLevel;
  return matchesTrade && matchesLevel;
});
```

## 🗄️ Database Schema

### **courses Table:**
```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_years INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **trades_levels Table:**
```sql
CREATE TABLE trades_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  level_suffix VARCHAR(5),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trade_code) REFERENCES courses(code),
  UNIQUE KEY unique_level (trade_code, level_number, level_suffix)
);
```

### **users Table (Students):**
```sql
ALTER TABLE users ADD COLUMN trade_code VARCHAR(10);
ALTER TABLE users ADD COLUMN level_number INT;
ALTER TABLE users ADD COLUMN level_suffix VARCHAR(5);
ALTER TABLE users ADD FOREIGN KEY (trade_code) REFERENCES courses(code);
```

## 🎯 Use Cases by Role

### **DOD (Director of Discipline):**
- Filter students by trade/level for discipline tracking
- Send notifications to specific trade/level
- Generate reports by trade/level

### **DOS (Director of Studies):**
- Manage curriculum by trade/level
- Assign teachers to trade/level classes
- Track academic performance by trade/level

### **Accountant:**
- Track payments by trade/level
- Generate fee reports by trade/level
- Monitor outstanding balances by trade/level

### **Teacher:**
- View assigned classes by trade/level
- Grade students by trade/level
- Mark attendance by trade/level

### **Advisor:**
- Counsel students by trade/level
- Track student progress by trade/level
- Provide career guidance by trade

### **HeadMaster:**
- View school-wide statistics by trade/level
- Monitor performance by trade/level
- Make strategic decisions based on trade/level data

## 📊 Statistics Examples

### **Total Students by Trade:**
```typescript
const studentsByTrade = {
  SOD: students.filter(s => s.trade_code === 'SOD').length,
  BDC: students.filter(s => s.trade_code === 'BDC').length,
  AUT: students.filter(s => s.trade_code === 'AUT').length
};
```

### **Students by Level:**
```typescript
const studentsByLevel = {
  level3: students.filter(s => s.level_number === 3).length,
  level4: students.filter(s => s.level_number === 4).length,
  level5: students.filter(s => s.level_number === 5).length
};
```

### **Students by Trade and Level:**
```typescript
const sodLevel3 = students.filter(s => 
  s.trade_code === 'SOD' && s.level_number === 3
).length;
```

## 🔧 Setup Commands

### **Initialize Database:**
```bash
# Run the setup script
setup-trades-levels.bat

# Or manually
node backend/setup-trades-levels.js
```

### **Verify Setup:**
```sql
-- Check trades
SELECT * FROM courses;

-- Check levels
SELECT * FROM trades_levels ORDER BY trade_code, level_number, level_suffix;

-- Check students with trades
SELECT 
  u.id, 
  u.first_name, 
  u.last_name, 
  u.trade_code, 
  u.level_number, 
  u.level_suffix,
  c.name as trade_name
FROM users u
LEFT JOIN courses c ON u.trade_code = c.code
WHERE u.role = 'student';
```

## ✅ Best Practices

1. **Always fetch trades dynamically** - Don't hardcode trade lists
2. **Use trade codes** (SOD, BDC, AUT) not IDs for consistency
3. **Handle level suffixes** properly for AUT trade
4. **Validate trade/level combinations** before saving
5. **Use global filters** consistently across all dashboards
6. **Cache trades data** to reduce API calls
7. **Show trade names** to users, not codes
8. **Include level suffix** in display (e.g., "Level 4A")

## 🚫 Common Mistakes to Avoid

1. ❌ Hardcoding trade lists
2. ❌ Forgetting level suffixes for AUT
3. ❌ Not validating trade/level combinations
4. ❌ Using trade IDs instead of codes
5. ❌ Not handling null level_suffix
6. ❌ Mixing up level_number and level_suffix
7. ❌ Not filtering students properly

## 📞 Support

If you need to:
- **Add a new trade**: Update database and run setup script
- **Add a new level**: Update trades_levels table
- **Modify trade structure**: Update both courses and trades_levels tables
- **Report issues**: Check console logs and database connections

---

**System Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready  
**Maintained by:** Development Team
