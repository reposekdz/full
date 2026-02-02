# 🚀 TradeLevelSelector - Quick Reference

## ⚡ Basic Usage (Most Common)

```tsx
import TradeLevelSelector from './components/TradeLevelSelector';
import { useTradeLevel } from './hooks/useTradeLevel';

function MyForm() {
  const { trade, level, setTrade, setLevel, isValid } = useTradeLevel();

  return (
    <form>
      <TradeLevelSelector
        selectedTrade={trade}
        selectedLevel={level}
        onTradeChange={setTrade}
        onLevelChange={setLevel}
        required
      />
      <button disabled={!isValid}>Submit</button>
    </form>
  );
}
```

## 🎯 With Course Selection

```tsx
const { trade, level, course, setTrade, setLevel, setCourse } = useTradeLevel(true);

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

## 🌟 Full Featured (All Options)

```tsx
<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  selectedCourse={course}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  onCourseChange={setCourse}
  showCourses
  showStats
  showKinyarwanda
  variant="default"
  required
  disabled={isSubmitting}
/>
```

## 📦 Props Quick Reference

| Prop | Type | Default | Use When |
|------|------|---------|----------|
| `required` | boolean | false | Form validation needed |
| `disabled` | boolean | false | During submission |
| `showCourses` | boolean | false | Need course selection |
| `showStats` | boolean | false | Show selection summary |
| `showKinyarwanda` | boolean | false | Local language support |
| `variant` | string | 'default' | 'compact' for filters |

## 🎨 Variants

```tsx
// Default - Full width, all features
<TradeLevelSelector variant="default" {...props} />

// Compact - Smaller, for toolbars
<TradeLevelSelector variant="compact" showLabels={false} {...props} />

// Inline - Horizontal layout
<TradeLevelSelector variant="inline" {...props} />
```

## 🔧 Hook Methods

```tsx
const {
  trade,        // Current trade code
  level,        // Current level
  course,       // Current course ID
  setTrade,     // Update trade
  setLevel,     // Update level
  setCourse,    // Update course
  reset,        // Clear all
  isValid,      // Check if valid
  getData       // Get all data
} = useTradeLevel(includeCourse);

// Usage
const formData = getData(); // { trade: 'SOD', level: '4A', course: '123' }
reset(); // Clear all selections
```

## 🌐 API Endpoints

```
GET /api/trades-levels/trades
GET /api/trades-levels/trades/SOD/levels
GET /api/trades-levels/trades/SOD/levels/4A/courses
```

## ✅ Integration Checklist

- [ ] Import component and hook
- [ ] Initialize hook with `useTradeLevel()`
- [ ] Add component to form
- [ ] Connect state with props
- [ ] Add validation if needed
- [ ] Test trade selection
- [ ] Test level cascading
- [ ] Test form submission

## 🎯 Common Patterns

### Student Registration
```tsx
const { trade, level, setTrade, setLevel } = useTradeLevel();
<TradeLevelSelector {...{selectedTrade: trade, selectedLevel: level, onTradeChange: setTrade, onLevelChange: setLevel}} required />
```

### Report Filter
```tsx
const { trade, level, setTrade, setLevel } = useTradeLevel();
<TradeLevelSelector {...{selectedTrade: trade, selectedLevel: level, onTradeChange: setTrade, onLevelChange: setLevel}} variant="compact" showLabels={false} />
```

### Assignment Creation
```tsx
const { trade, level, course, setTrade, setLevel, setCourse } = useTradeLevel(true);
<TradeLevelSelector {...{selectedTrade: trade, selectedLevel: level, selectedCourse: course, onTradeChange: setTrade, onLevelChange: setLevel, onCourseChange: setCourse}} showCourses required />
```

## 🚨 Important Notes

1. **Cascading**: Level auto-resets when trade changes
2. **Validation**: Use `isValid` from hook for form validation
3. **Loading**: Component handles all loading states
4. **Errors**: Automatic error handling with retry
5. **Data**: Use `getData()` to get all values at once

## 📞 Support

- Full docs: `ADVANCED_TRADE_LEVEL_SELECTOR.md`
- Integration guide: `TRADE_LEVEL_INTEGRATION.md`
- API docs: `TRADE_LEVEL_SELECTOR.md`
