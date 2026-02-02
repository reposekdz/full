# Advanced Trade & Level Selector - Complete Guide

## 🚀 Advanced Features

### ✨ Core Features
- ✅ **Dynamic Trade Loading** - Real-time from database
- ✅ **Cascading Level Selection** - Auto-updates based on trade
- ✅ **Course Selection** - Optional third dropdown for courses
- ✅ **Loading States** - Visual feedback with spinners
- ✅ **Success Indicators** - Green checkmarks on selection
- ✅ **Error Handling** - Graceful error messages
- ✅ **Refresh Button** - Manual data reload
- ✅ **Stats Display** - Show selection summary
- ✅ **Kinyarwanda Support** - Bilingual labels
- ✅ **Multiple Variants** - Default, Compact, Inline
- ✅ **Animations** - Smooth Framer Motion transitions
- ✅ **Icons** - Lucide React icons
- ✅ **Validation** - HTML5 required fields
- ✅ **Disabled States** - During form submission

## 📋 Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedTrade` | `string` | - | Selected trade code (e.g., "SOD") |
| `selectedLevel` | `string` | - | Selected level (e.g., "4A") |
| `onTradeChange` | `(trade: string) => void` | - | Trade change callback |
| `onLevelChange` | `(level: string) => void` | - | Level change callback |
| `selectedCourse` | `string` | `''` | Selected course ID |
| `onCourseChange` | `(courseId: string) => void` | - | Course change callback |
| `required` | `boolean` | `false` | Mark fields as required |
| `disabled` | `boolean` | `false` | Disable all selectors |
| `showLabels` | `boolean` | `true` | Show field labels |
| `showCourses` | `boolean` | `false` | Enable course selection |
| `showStats` | `boolean` | `false` | Display selection stats |
| `showKinyarwanda` | `boolean` | `false` | Use Kinyarwanda names |
| `variant` | `'default' \| 'compact' \| 'inline'` | `'default'` | Component layout |
| `className` | `string` | `''` | Additional CSS classes |
| `onDataLoaded` | `(data) => void` | - | Callback when data loads |

## 🎨 Usage Examples

### 1. Basic Usage
```tsx
import TradeLevelSelector from './components/TradeLevelSelector';

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

### 2. With Course Selection
```tsx
const [trade, setTrade] = useState('');
const [level, setLevel] = useState('');
const [course, setCourse] = useState('');

<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  selectedCourse={course}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  onCourseChange={setCourse}
  showCourses
  required
/>
```

### 3. With Stats & Kinyarwanda
```tsx
<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  showStats
  showKinyarwanda
  required
/>
```

### 4. Compact Variant (No Labels)
```tsx
<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  variant="compact"
  showLabels={false}
/>
```

### 5. Inline Variant
```tsx
<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  variant="inline"
/>
```

### 6. With Form State
```tsx
const [formData, setFormData] = useState({
  name: '',
  trade: '',
  level: '',
  course: '',
  email: ''
});

<TradeLevelSelector
  selectedTrade={formData.trade}
  selectedLevel={formData.level}
  selectedCourse={formData.course}
  onTradeChange={(trade) => setFormData({...formData, trade})}
  onLevelChange={(level) => setFormData({...formData, level})}
  onCourseChange={(course) => setFormData({...formData, course})}
  showCourses
  required
/>
```

### 7. Disabled During Submission
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

### 8. With Data Loaded Callback
```tsx
<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  onDataLoaded={(data) => {
    console.log('Trades:', data.trades);
    console.log('Levels:', data.levels);
    console.log('Courses:', data.courses);
  }}
  showCourses
/>
```

## 🎯 Real-World Use Cases

### Student Registration Form
```tsx
const StudentRegistrationForm = () => {
  const [student, setStudent] = useState({
    name: '',
    trade: '',
    level: '',
    course: '',
    email: ''
  });

  return (
    <form>
      <input
        value={student.name}
        onChange={(e) => setStudent({...student, name: e.target.value})}
        placeholder="Student Name"
      />
      
      <TradeLevelSelector
        selectedTrade={student.trade}
        selectedLevel={student.level}
        selectedCourse={student.course}
        onTradeChange={(trade) => setStudent({...student, trade})}
        onLevelChange={(level) => setStudent({...student, level})}
        onCourseChange={(course) => setStudent({...student, course})}
        showCourses
        showStats
        required
      />
      
      <button type="submit">Register Student</button>
    </form>
  );
};
```

### Class Creation Form
```tsx
const ClassCreationForm = () => {
  const [classData, setClassData] = useState({
    className: '',
    trade: '',
    level: '',
    capacity: 30
  });

  return (
    <form>
      <TradeLevelSelector
        selectedTrade={classData.trade}
        selectedLevel={classData.level}
        onTradeChange={(trade) => setClassData({...classData, trade})}
        onLevelChange={(level) => setClassData({...classData, level})}
        showStats
        required
      />
    </form>
  );
};
```

### Report Filter
```tsx
const ReportFilter = () => {
  const [filters, setFilters] = useState({
    trade: '',
    level: '',
    dateFrom: '',
    dateTo: ''
  });

  return (
    <div>
      <TradeLevelSelector
        selectedTrade={filters.trade}
        selectedLevel={filters.level}
        onTradeChange={(trade) => setFilters({...filters, trade})}
        onLevelChange={(level) => setFilters({...filters, level})}
        variant="compact"
        showLabels={false}
      />
    </div>
  );
};
```

### Assignment Creation
```tsx
const AssignmentForm = () => {
  const [assignment, setAssignment] = useState({
    title: '',
    trade: '',
    level: '',
    course: '',
    dueDate: ''
  });

  return (
    <form>
      <TradeLevelSelector
        selectedTrade={assignment.trade}
        selectedLevel={assignment.level}
        selectedCourse={assignment.course}
        onTradeChange={(trade) => setAssignment({...assignment, trade})}
        onLevelChange={(level) => setAssignment({...assignment, level})}
        onCourseChange={(course) => setAssignment({...assignment, course})}
        showCourses
        showKinyarwanda
        required
      />
    </form>
  );
};
```

## 🎭 Variants Comparison

### Default Variant
- Full-width layout
- Labels above inputs
- Refresh button included
- Best for: Main forms

### Compact Variant
- Smaller height (h-9)
- Minimal spacing
- No refresh button
- Best for: Filters, toolbars

### Inline Variant
- Horizontal alignment
- Items aligned at bottom
- Refresh button included
- Best for: Search bars, quick filters

## 🔄 Data Flow

```
Component Mount
    ↓
Fetch Trades → Display in dropdown
    ↓
User Selects Trade
    ↓
Fetch Levels for Trade → Display in dropdown
    ↓
User Selects Level
    ↓
(If showCourses) Fetch Courses → Display in dropdown
    ↓
User Selects Course
    ↓
Form Submission with: trade, level, course
```

## 🎨 Visual States

### Loading State
- Spinner icon in dropdown
- Dropdown disabled
- "Loading..." placeholder

### Success State
- Green checkmark icon
- Green border on input
- Data loaded successfully

### Error State
- Red error message below
- Alert icon
- Retry with refresh button

### Disabled State
- Gray background
- Cursor not-allowed
- All interactions blocked

## 🌐 API Integration

### Endpoints Used
```
GET /api/trades-levels/trades
GET /api/trades-levels/trades/:tradeCode/levels
GET /api/trades-levels/trades/:tradeCode/levels/:level/courses
```

### Response Format
```json
{
  "success": true,
  "trades": [
    {
      "trade_code": "SOD",
      "trade_name": "Software Development",
      "trade_name_rw": "Iterambere rya Porogaramu"
    }
  ],
  "levels": [
    {
      "level_number": 4,
      "level_suffix": "A",
      "level_display": "4A"
    }
  ],
  "courses": [
    {
      "id": 1,
      "trade_code": "SOD",
      "course_name": "Web Development",
      "course_name_rw": "Iterambere rya Urubuga",
      "level_number": 4,
      "level_suffix": "A",
      "level_display": "4A"
    }
  ]
}
```

## 🎯 Best Practices

1. **Always use required prop for mandatory fields**
2. **Disable during form submission**
3. **Use variant based on context**
4. **Enable showStats for user feedback**
5. **Use showKinyarwanda for local users**
6. **Handle onDataLoaded for analytics**
7. **Test all three cascading levels**
8. **Provide clear error messages**

## 🐛 Troubleshooting

### Issue: Dropdowns not loading
**Check:**
- Backend server running
- API endpoints accessible
- Database has data
- Network tab for errors

### Issue: Level not resetting
**Solution:**
- Ensure using onTradeChange callback
- Component handles reset automatically

### Issue: Course dropdown empty
**Check:**
- showCourses prop is true
- onCourseChange callback provided
- Trade and level selected
- Courses exist in database

### Issue: Validation not working
**Solution:**
- Add required prop
- Ensure form has onSubmit
- Check HTML5 validation enabled

## 📦 Dependencies

```json
{
  "axios": "^1.6.0",
  "framer-motion": "^10.0.0",
  "lucide-react": "^0.300.0",
  "react": "^18.2.0"
}
```

## 🚀 Performance

- Trades loaded once on mount
- Levels cached per trade
- Courses cached per trade+level
- Minimal re-renders
- Optimized API calls

## ♿ Accessibility

- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels
- Disabled state handling

## 📱 Responsive

- Mobile-friendly
- Touch-optimized
- Flexible layouts
- Breakpoint support

## 🎉 Summary

The TradeLevelSelector is a **fully functional, production-ready, advanced component** with:
- 🔥 15+ features
- 🎨 3 variants
- 🌐 Bilingual support
- ⚡ Real-time data
- 🎭 Smooth animations
- 🛡️ Error handling
- ✅ Full validation
- 📊 Stats display
- 🔄 Auto-refresh
- 💪 TypeScript support

**Ready to use in any form across the entire system!**
