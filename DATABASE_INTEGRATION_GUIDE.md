# Database Integration for Student Management

## Overview
All student management forms now fetch real data from the database for trades and levels. This ensures consistency across all roles (admin, DOS, DOD, accountant, teacher, advisor).

## Changes Made

### 1. Backend Routes (`backend/routes/levels.js`)
Created a new route file to handle levels and trades data:

**Endpoints:**
- `GET /api/levels/levels` - Get all available levels
- `GET /api/levels/trades/:tradeCode/levels` - Get levels for a specific trade
- `GET /api/levels/trades-with-levels` - Get all trades with their associated levels

**Features:**
- Fetches from `trades_levels` table
- Falls back to standard levels (1-4) if table is empty
- Returns structured data with trade codes and level information

### 2. API Service Updates (`src/app/services/apiService.ts`)
Added new methods:
```typescript
async getAllTrades() - Fetch all trades from database
async getAllLevels() - Fetch all levels
async getTradesByLevel(tradeCode) - Get levels for specific trade
async getTradesWithLevels() - Get trades with nested levels
```

### 3. UniversalStudentManagement Component Updates
**Changes:**
- Now fetches trades with levels from `/api/levels/trades-with-levels`
- Dropdown filters dynamically populate based on selected trade
- Level selection shows only levels available for the selected trade
- All data comes from database, no hardcoded values

**Form Flow:**
1. User selects a trade (e.g., "ELE", "MCT", "CON")
2. System fetches available levels for that trade from database
3. Level dropdown populates with real data
4. Student is created with proper trade_code and level information

### 4. Server Configuration (`backend/server.js`)
- Added levels route to the server
- Mounted at `/api/levels`
- Available to all authenticated users

## Database Structure

### Required Tables:

**1. courses (trades)**
```sql
- id
- code (trade_code: ELE, MCT, CON, etc.)
- name (trade name)
- description
- duration_months
- fee_amount
- is_active
```

**2. trades_levels**
```sql
- id
- trade_code (references courses.code)
- level_number (1, 2, 3, 4)
- level_suffix (optional: A, B, etc.)
- description
- is_active
```

## Usage Across Roles

### Admin / Super Admin
- Full access to add students with any trade/level
- Can manage trades and levels

### DOS (Director of Studies)
- Add students to any trade/level
- View all students by trade/level
- Filter and search by trade/level

### DOD (Director of Discipline)
- View students by trade/level
- Filter discipline records by trade/level

### Accountant
- View student payments by trade/level
- Generate financial reports by trade/level
- Filter students for fee management

### Teacher
- View assigned students by trade/level
- Access class lists filtered by trade/level
- Submit grades for specific trade/level combinations

### Advisor
- View students by trade/level
- Access student records filtered by trade/level

## Benefits

1. **Consistency**: All roles use the same database source
2. **Flexibility**: Easy to add new trades or levels without code changes
3. **Accuracy**: No hardcoded data, always up-to-date
4. **Scalability**: Supports any number of trades and levels
5. **Maintainability**: Single source of truth for trade/level data

## Testing

To test the integration:

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Verify the endpoint:**
   ```
   GET http://localhost:5000/api/levels/trades-with-levels
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "trades": [
       {
         "id": 1,
         "trade_code": "ELE",
         "trade_name": "Electrical Installation",
         "levels": [
           { "level_number": 1, "level_suffix": "", "level_name": "Level 1" },
           { "level_number": 2, "level_suffix": "", "level_name": "Level 2" }
         ]
       }
     ]
   }
   ```

4. **Test in UI:**
   - Login as any role with student management access
   - Navigate to student management
   - Click "Add Student"
   - Select a trade - levels should populate automatically
   - Submit form - student should be created with correct trade/level

## Future Enhancements

1. Add class management (e.g., ELE-1A, ELE-1B)
2. Add academic year filtering
3. Add enrollment status tracking
4. Add capacity limits per trade/level
5. Add prerequisite checking for level progression

## Troubleshooting

**Issue: No trades showing**
- Check if `courses` table has data with `is_active = true`
- Verify backend server is running
- Check browser console for API errors

**Issue: No levels for selected trade**
- Check if `trades_levels` table has data for that trade_code
- System will fall back to standard levels 1-4 if table is empty
- Verify trade_code matches between tables

**Issue: Cannot create student**
- Verify all required fields are filled
- Check backend logs for validation errors
- Ensure user has proper permissions
