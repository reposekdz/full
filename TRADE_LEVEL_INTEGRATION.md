# Integration Guide: Trade & Level Selector

## Quick Integration Steps

### Step 1: Import the Component
```tsx
import TradeLevelSelector from '../components/TradeLevelSelector';
```

### Step 2: Add State Variables
```tsx
const [trade, setTrade] = useState('');
const [level, setLevel] = useState('');
```

### Step 3: Replace Existing Trade/Level Inputs
**Before:**
```tsx
<select value={formData.trade} onChange={(e) => setFormData({...formData, trade: e.target.value})}>
  <option value="SOD">SOD</option>
  <option value="BDC">BDC</option>
  <option value="AUT">AUT</option>
</select>

<select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})}>
  <option value="3">Level 3</option>
  <option value="4A">Level 4A</option>
</select>
```

**After:**
```tsx
<TradeLevelSelector
  selectedTrade={formData.trade}
  selectedLevel={formData.level}
  onTradeChange={(trade) => setFormData({...formData, trade})}
  onLevelChange={(level) => setFormData({...formData, level})}
  required
/>
```

## Common Integration Patterns

### Pattern 1: Simple Form State
```tsx
const [formData, setFormData] = useState({
  name: '',
  trade: '',
  level: '',
  email: ''
});

<TradeLevelSelector
  selectedTrade={formData.trade}
  selectedLevel={formData.level}
  onTradeChange={(trade) => setFormData({...formData, trade})}
  onLevelChange={(level) => setFormData({...formData, level})}
  required
/>
```

### Pattern 2: Separate State Variables
```tsx
const [trade, setTrade] = useState('');
const [level, setLevel] = useState('');

<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  required
/>
```

### Pattern 3: With Form Validation
```tsx
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  if (!trade) newErrors.trade = 'Trade is required';
  if (!level) newErrors.level = 'Level is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  required
/>
{errors.trade && <span className="text-red-500">{errors.trade}</span>}
{errors.level && <span className="text-red-500">{errors.level}</span>}
```

### Pattern 4: Disabled During Submission
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  disabled={isSubmitting}
  required
/>
```

## Files to Update

### ✅ Already Updated
- `src/app/components/GlobalStudentSheets.tsx` - Now uses dynamic API

### 🔄 Need Updates (Examples)

#### 1. DOD Dashboard - Student Management
**File:** `src/app/pages/dashboards/DODDashboard.tsx`

**Find:** Student add/edit forms with trade/level selection
**Replace with:**
```tsx
<TradeLevelSelector
  selectedTrade={studentData.trade}
  selectedLevel={studentData.level}
  onTradeChange={(trade) => setStudentData({...studentData, trade})}
  onLevelChange={(level) => setStudentData({...studentData, level})}
  required
/>
```

#### 2. DOS Dashboard - Class Management
**File:** `src/app/pages/dashboards/DOSDashboard.tsx`

**Find:** Class creation forms
**Replace with:**
```tsx
<TradeLevelSelector
  selectedTrade={classData.trade}
  selectedLevel={classData.level}
  onTradeChange={(trade) => setClassData({...classData, trade})}
  onLevelChange={(level) => setClassData({...classData, level})}
  required
/>
```

#### 3. Teacher Dashboard - Assignment Creation
**Find:** Assignment forms with trade/level
**Replace with:**
```tsx
<TradeLevelSelector
  selectedTrade={assignment.trade}
  selectedLevel={assignment.level}
  onTradeChange={(trade) => setAssignment({...assignment, trade})}
  onLevelChange={(level) => setAssignment({...assignment, level})}
  required
/>
```

#### 4. Admin Dashboard - Reports/Filters
**Find:** Report generation filters
**Replace with:**
```tsx
<TradeLevelSelector
  selectedTrade={filters.trade}
  selectedLevel={filters.level}
  onTradeChange={(trade) => setFilters({...filters, trade})}
  onLevelChange={(level) => setFilters({...filters, level})}
  showLabels={false}
/>
```

## Migration Checklist

- [ ] Import TradeLevelSelector component
- [ ] Update state management (trade/level as strings)
- [ ] Replace hardcoded trade arrays with dynamic component
- [ ] Remove manual level filtering logic
- [ ] Update form submission to use trade code and level display
- [ ] Test cascading behavior (level resets when trade changes)
- [ ] Verify API integration works
- [ ] Check validation still works
- [ ] Test disabled states during form submission

## Benefits After Migration

✅ **Dynamic Data** - Trades/levels loaded from database  
✅ **Auto-Sync** - Always matches database structure  
✅ **Less Code** - No hardcoded arrays  
✅ **Consistent UX** - Same behavior across all forms  
✅ **Cascading Logic** - Built-in level reset  
✅ **Validation** - HTML5 required fields  
✅ **Loading States** - Visual feedback  
✅ **Error Handling** - Graceful failures  

## Testing After Integration

1. **Test Trade Selection:**
   - Select each trade (SOD, BDC, AUT)
   - Verify levels update correctly

2. **Test Level Selection:**
   - Verify correct levels show for each trade
   - Check AUT has 4A, 4B, 5A, 5B
   - Check SOD/BDC have 3, 4, 5

3. **Test Cascading:**
   - Select trade and level
   - Change trade
   - Verify level resets to empty

4. **Test Form Submission:**
   - Submit with valid trade/level
   - Verify data sent correctly to backend

5. **Test Validation:**
   - Try submitting without trade
   - Try submitting without level
   - Verify required field validation works

## Troubleshooting

### Issue: Levels not loading
**Solution:** Check backend server is running and API endpoint is accessible

### Issue: Level doesn't reset when trade changes
**Solution:** Ensure you're using the component's onTradeChange callback

### Issue: Form submission fails
**Solution:** Verify you're sending trade_code (string) and level_display (string like "4A")

### Issue: Validation not working
**Solution:** Add `required` prop to TradeLevelSelector

## Support

For issues, check:
1. Backend server running on port 5000
2. Database has courses table populated
3. API endpoints responding correctly
4. Browser console for errors
