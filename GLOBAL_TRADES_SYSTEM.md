# Global Trades System - BDC, SOD, AUT

## Overview
This document describes the **Global Trades System** that is used throughout the entire application. The system ensures that only **3 trades** (BDC, SOD, AUT) are available and used consistently across all staff dashboards, student sheets, and frontend components.

## The 3 Trades

### 1. BDC - Building and Construction (Kubaka)
- **Levels**: 3, 4, 5
- **Focus**: Construction, architecture, project management
- **Classes**: Single class per level

### 2. SOD - Software Development (Gutegura Porogaramu)
- **Levels**: 3, 4, 5
- **Focus**: Web development, mobile apps, software engineering
- **Classes**: Single class per level

### 3. AUT - Automotive Technology (Ikoranabuhanga rya Modoka)
- **Levels**: 3, 4A, 4B, 5A, 5B
- **Focus**: Vehicle repair, maintenance, diagnostics
- **Classes**: Level 3 has 1 class, Levels 4 and 5 have 2 classes each (A and B)

## Global Implementation

### Backend API (`/api/trades-levels`)

#### Endpoints:

1. **GET `/api/trades-levels/trades`**
   - Returns only BDC, SOD, AUT
   - Used by all staff dashboards and frontend components
   - Response:
   ```json
   {
     "success": true,
     "trades": [
       { "trade_code": "BDC", "trade_name": "Building and Construction", "trade_name_rw": "Kubaka" },
       { "trade_code": "SOD", "trade_name": "Software Development", "trade_name_rw": "Gutegura Porogaramu" },
       { "trade_code": "AUT", "trade_name": "Automotive Technology", "trade_name_rw": "Ikoranabuhanga rya Modoka" }
     ]
   }
   ```

2. **GET `/api/trades-levels/trades/:tradeCode/levels`**
   - Returns levels for specific trade
   - BDC/SOD: 3, 4, 5
   - AUT: 3, 4A, 4B, 5A, 5B
   - Validates that only BDC, SOD, AUT are accepted

3. **GET `/api/trades-levels/trades/:tradeCode/levels/:level/students`**
   - Returns students for specific trade and level
   - Uses `global_students` table first, falls back to `students` table
   - Supports level suffixes (A, B) for AUT

4. **GET `/api/trades-levels/trades/:tradeCode/students`**
   - Returns all students for a trade (all levels)
   - Used for trade-wide reports and statistics

5. **GET `/api/trades-levels/stats`**
   - Returns statistics for all 3 trades
   - Shows total students per trade

### Frontend Component (`TradeLevelSelector.tsx`)

**Location**: `src/app/components/TradeLevelSelector.tsx`

**Usage**: This component is used throughout the application for selecting trades and levels.

**Features**:
- ✅ Fetches only BDC, SOD, AUT from API
- ✅ Dynamically loads levels based on selected trade
- ✅ Supports course selection (optional)
- ✅ Shows Kinyarwanda names
- ✅ Real-time validation
- ✅ Loading states and error handling
- ✅ Multiple variants (default, compact, inline)

**Props**:
```typescript
interface TradeLevelSelectorProps {
  selectedTrade: string;
  selectedLevel: string;
  onTradeChange: (trade: string) => void;
  onLevelChange: (level: string) => void;
  selectedCourse?: string;
  onCourseChange?: (courseId: string) => void;
  required?: boolean;
  disabled?: boolean;
  showLabels?: boolean;
  showCourses?: boolean;
  showStats?: boolean;
  showKinyarwanda?: boolean;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}
```

**Example Usage**:
```tsx
import TradeLevelSelector from '@/app/components/TradeLevelSelector';

function MyComponent() {
  const [trade, setTrade] = useState('');
  const [level, setLevel] = useState('');

  return (
    <TradeLevelSelector
      selectedTrade={trade}
      selectedLevel={level}
      onTradeChange={setTrade}
      onLevelChange={setLevel}
      showKinyarwanda={true}
      required={true}
    />
  );
}
```

## Global Student Sheets

### Database Structure

**Table**: `global_students`

**Key Columns**:
- `id` - Primary key
- `student_id` - Unique student code
- `first_name`, `last_name` - Student names
- `current_trade` - Trade code (BDC, SOD, AUT)
- `current_level` - Level number (3, 4, 5)
- `conduct_score` - Behavior score
- `attendance_percentage` - Attendance rate
- `email`, `phone` - Contact information

### Sheet Organization

Each trade-level combination has its own student sheet:

**BDC**:
- BDC Level 3 Sheet
- BDC Level 4 Sheet
- BDC Level 5 Sheet

**SOD**:
- SOD Level 3 Sheet
- SOD Level 4 Sheet
- SOD Level 5 Sheet

**AUT**:
- AUT Level 3 Sheet
- AUT Level 4A Sheet
- AUT Level 4B Sheet
- AUT Level 5A Sheet
- AUT Level 5B Sheet

**Total**: 11 student sheets

## Staff Dashboard Integration

### Where TradeLevelSelector is Used:

1. **Admin Dashboard**
   - Student management
   - Class assignment
   - Report generation

2. **DOS (Director of Studies) Dashboard**
   - Academic management
   - Course assignment
   - Performance tracking

3. **DOD (Director of Discipline) Dashboard**
   - Conduct management
   - Discipline records
   - Student monitoring

4. **Headmaster Dashboard**
   - Overview statistics
   - School-wide reports
   - Strategic planning

5. **Accountant Dashboard**
   - Fee management by trade/level
   - Payment tracking
   - Financial reports

6. **Advisor Dashboard**
   - Student counseling
   - Career guidance
   - Academic advising

7. **Teacher Dashboard**
   - Class management
   - Grade entry
   - Attendance tracking

## Constants File

**Location**: `src/app/constants/tradesAndLevels.ts`

```typescript
export const GLOBAL_TRADES = [
  { id: 1, code: 'BDC', name: 'Building and Construction', name_rw: 'Kubaka' },
  { id: 2, code: 'SOD', name: 'Software Development', name_rw: 'Gutegura Porogaramu' },
  { id: 3, code: 'AUT', name: 'Automotive Technology', name_rw: 'Ikoranabuhanga rya Modoka' }
];

export const GLOBAL_LEVELS = [
  // BDC and SOD: Levels 3, 4, 5
  { id: 'bdc_sod_3', level_number: 3, level_suffix: '', name: 'Level 3', display: 'Level 3', trade_codes: ['BDC', 'SOD'] },
  { id: 'bdc_sod_4', level_number: 4, level_suffix: '', name: 'Level 4', display: 'Level 4', trade_codes: ['BDC', 'SOD'] },
  { id: 'bdc_sod_5', level_number: 5, level_suffix: '', name: 'Level 5', display: 'Level 5', trade_codes: ['BDC', 'SOD'] },
  
  // AUT: Levels 3, 4A, 4B, 5A, 5B
  { id: 'aut_3', level_number: 3, level_suffix: '', name: 'Level 3', display: 'Level 3', trade_codes: ['AUT'] },
  { id: 'aut_4a', level_number: 4, level_suffix: 'A', name: 'Level 4A', display: 'Level 4A', trade_codes: ['AUT'] },
  { id: 'aut_4b', level_number: 4, level_suffix: 'B', name: 'Level 4B', display: 'Level 4B', trade_codes: ['AUT'] },
  { id: 'aut_5a', level_number: 5, level_suffix: 'A', name: 'Level 5A', display: 'Level 5A', trade_codes: ['AUT'] },
  { id: 'aut_5b', level_number: 5, level_suffix: 'B', name: 'Level 5B', display: 'Level 5B', trade_codes: ['AUT'] }
];
```

## Implementation Checklist

### ✅ Completed:
- [x] Backend API returns only BDC, SOD, AUT
- [x] Level structure defined (BDC/SOD: 3,4,5; AUT: 3,4A,4B,5A,5B)
- [x] TradeLevelSelector component created
- [x] Global constants file updated
- [x] Student sheets API integrated
- [x] Validation for trade codes
- [x] Kinyarwanda language support

### 🔄 To Implement in Staff Dashboards:

1. **Admin Dashboard**
   - Replace any custom trade selectors with TradeLevelSelector
   - Update student management to use global sheets
   - Ensure reports filter by BDC, SOD, AUT only

2. **DOS Dashboard**
   - Integrate TradeLevelSelector for course management
   - Update academic reports to use global trades
   - Ensure grade entry uses correct trade/level structure

3. **DOD Dashboard**
   - Use TradeLevelSelector for discipline records
   - Update conduct management to filter by global trades
   - Ensure student monitoring uses global sheets

4. **Headmaster Dashboard**
   - Display statistics for all 3 trades
   - Use TradeLevelSelector for filtering reports
   - Show trade-wise performance metrics

5. **Accountant Dashboard**
   - Integrate TradeLevelSelector for fee management
   - Update payment tracking by trade/level
   - Generate financial reports per trade

6. **Advisor Dashboard**
   - Use TradeLevelSelector for student selection
   - Update counseling records with trade/level
   - Track student progress by trade

7. **Teacher Dashboard**
   - Integrate TradeLevelSelector for class selection
   - Update grade entry with trade/level context
   - Ensure attendance tracking uses global structure

## Benefits

### 1. Consistency
- Same 3 trades used everywhere
- No confusion about trade codes
- Standardized level structure

### 2. Maintainability
- Single source of truth (API + constants)
- Easy to update if trades change
- Centralized validation

### 3. Performance
- Efficient student sheet queries
- Optimized by trade and level
- Fast filtering and reporting

### 4. User Experience
- Consistent UI across all dashboards
- Clear trade/level selection
- Kinyarwanda language support

### 5. Data Integrity
- Validation at API level
- Only valid trades accepted
- Proper level structure enforced

## Testing

### Test Cases:

1. **Trade Selection**
   - ✅ Only BDC, SOD, AUT appear in dropdown
   - ✅ Invalid trade codes are rejected
   - ✅ Kinyarwanda names display correctly

2. **Level Selection**
   - ✅ BDC shows levels 3, 4, 5
   - ✅ SOD shows levels 3, 4, 5
   - ✅ AUT shows levels 3, 4A, 4B, 5A, 5B
   - ✅ Level selection disabled until trade selected

3. **Student Sheets**
   - ✅ Students load for each trade/level combination
   - ✅ Empty sheets show appropriate message
   - ✅ Student count is accurate

4. **API Validation**
   - ✅ Invalid trade codes return error
   - ✅ Invalid level formats are handled
   - ✅ Empty results return gracefully

## Migration Guide

### For Existing Components:

**Before**:
```tsx
<select value={trade} onChange={(e) => setTrade(e.target.value)}>
  <option value="">Select Trade</option>
  <option value="BDC">BDC</option>
  <option value="SOD">SOD</option>
  <option value="AUT">AUT</option>
</select>
```

**After**:
```tsx
<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  showKinyarwanda={true}
/>
```

## Support

For questions or issues with the Global Trades System:
1. Check this documentation
2. Review the API endpoints
3. Test with the TradeLevelSelector component
4. Verify database structure

## Future Enhancements

- [ ] Add trade-specific settings
- [ ] Implement trade transfer functionality
- [ ] Add historical trade data tracking
- [ ] Create trade comparison reports
- [ ] Add trade-specific permissions
