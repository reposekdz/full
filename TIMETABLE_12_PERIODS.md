# 📅 TIMETABLE SYSTEM - 12 PERIODS

## ⏰ Daily Schedule

### Full Day: 7:30 AM - 5:00 PM

```
Period 1:  07:30 - 08:10  (40 min)
Period 2:  08:10 - 08:50  (40 min)
Period 3:  08:50 - 09:30  (40 min)
Period 4:  09:30 - 10:10  (40 min)

BREAK:     10:10 - 10:25  (15 min) ☕

Period 5:  10:25 - 11:05  (40 min)
Period 6:  11:05 - 11:45  (40 min)
Period 7:  11:45 - 12:25  (40 min)

LUNCH:     12:25 - 13:25  (60 min) 🍽️

Period 8:  13:25 - 14:05  (40 min)
Period 9:  14:05 - 14:45  (40 min)
Period 10: 14:45 - 15:25  (40 min)

BREAK:     15:25 - 15:40  (15 min) ☕

Period 11: 15:40 - 16:20  (40 min)
Period 12: 16:20 - 17:00  (40 min)
```

## 📊 Summary

- **Total Periods**: 12 per day
- **Period Duration**: 40 minutes each
- **Days**: Monday - Friday
- **Total Weekly Periods**: 60 (12 × 5)
- **Start Time**: 7:30 AM
- **End Time**: 5:00 PM
- **Short Breaks**: 2 (15 min each)
- **Lunch Break**: 1 (60 min)

## 🚀 API Usage

### Generate Timetable
```javascript
POST /api/dos-management/timetables/auto-generate
{
  "trade_code": "AUTO",
  "level_number": 1,
  "academic_year": "2024",
  "term": "Term 1"
}

Response: {
  "success": true,
  "id": 123,
  "total_slots": 60,
  "periods_per_day": 12
}
```

### Bulk Generate
```javascript
POST /api/dos-management/timetables/bulk-generate
{
  "selections": [
    {"trade_code": "AUTO", "level_number": 1},
    {"trade_code": "BDC", "level_number": 1}
  ],
  "academic_year": "2024",
  "term": "Term 1"
}
```

## ✅ Features

- ✅ 12 periods per day
- ✅ 40-minute periods
- ✅ 7:30 AM start
- ✅ 5:00 PM end
- ✅ 15-min breaks (10:10, 15:25)
- ✅ 60-min lunch (12:25)
- ✅ Conflict detection
- ✅ Teacher tracking
- ✅ Course-based generation

## 🎯 How It Works

1. DOS assigns teachers to courses
2. System generates 12 periods/day
3. Distributes courses across week
4. Prevents teacher conflicts
5. Creates 60 total slots (12×5)

---

**Status**: ✅ Production Ready  
**Periods**: 12 per day  
**Duration**: 40 minutes  
**Weekly Total**: 60 periods
