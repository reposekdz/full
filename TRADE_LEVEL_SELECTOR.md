# Trade & Level Selector System

## Overview
A fully functional, reusable component system for selecting trades and their corresponding levels across all forms in the school management system.

## Features
✅ **Dynamic Trade Loading** - Fetches all trades from database  
✅ **Cascading Level Selection** - Levels update based on selected trade  
✅ **Full Backend Integration** - Real database queries  
✅ **Reusable Component** - Use in any form  
✅ **Validation Support** - Required field handling  
✅ **Disabled State** - Control when selectors are active  
✅ **Loading States** - Visual feedback during data fetch  
✅ **Auto-Reset** - Level resets when trade changes  

## Backend API

### Endpoints

#### 1. Get All Trades
```http
GET /api/trades-levels/trades
```

**Response:**
```json
{
  "success": true,
  "trades": [
    {
      "trade_code": "SOD",
      "trade_name": "Software Development",
      "trade_name_rw": "Iterambere rya Porogaramu"
    },
    {
      "trade_code": "BDC",
      "trade_name": "Building Construction",
      "trade_name_rw": "Ubwubatsi"
    },
    {
      "trade_code": "AUT",
      "trade_name": "Automotive Technology",
      "trade_name_rw": "Ikoranabuhanga ry'Ibinyabiziga"
    }
  ]
}
```

#### 2. Get Levels for Trade
```http
GET /api/trades-levels/trades/:tradeCode/levels
```

**Example:** `GET /api/trades-levels/trades/SOD/levels`

**Response:**
```json
{
  "success": true,
  "levels": [
    {
      "level_number": 3,
      "level_suffix": null,
      "level_display": "3"
    },
    {
      "level_number": 4,
      "level_suffix": "A",
      "level_display": "4A"
    },
    {
      "level_number": 4,
      "level_suffix": "B",
      "level_display": "4B"
    }
  ]
}
```

#### 3. Get Courses for Trade & Level
```http
GET /api/trades-levels/trades/:tradeCode/levels/:level/courses
```

**Example:** `GET /api/trades-levels/trades/SOD/levels/4A/courses`

**Response:**
```json
{
  "success": true,
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

## Component Usage

### Basic Usage

```tsx
import TradeLevelSelector from './components/TradeLevelSelector';

function MyForm() {
  const [trade, setTrade] = useState('');
  const [level, setLevel] = useState('');

  return (
    <TradeLevelSelector
      selectedTrade={trade}
      selectedLevel={level}
      onTradeChange={setTrade}
      onLevelChange={setLevel}
    />
  );
}
```

### With Required Fields

```tsx
<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  required
  showLabels
/>
```

### In Form State

```tsx
const [formData, setFormData] = useState({
  studentName: '',
  trade: '',
  level: '',
  email: ''
});

<TradeLevelSelector
  selectedTrade={formData.trade}
  selectedLevel={formData.level}
  onTradeChange={(trade) => setFormData({ ...formData, trade })}
  onLevelChange={(level) => setFormData({ ...formData, level })}
  required
/>
```

### Disabled State

```tsx
<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  disabled={isSubmitting}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedTrade` | `string` | - | Currently selected trade code |
| `selectedLevel` | `string` | - | Currently selected level |
| `onTradeChange` | `(trade: string) => void` | - | Callback when trade changes |
| `onLevelChange` | `(level: string) => void` | - | Callback when level changes |
| `required` | `boolean` | `false` | Mark fields as required |
| `disabled` | `boolean` | `false` | Disable both selectors |
| `showLabels` | `boolean` | `true` | Show field labels |
| `className` | `string` | `''` | Additional CSS classes |

## Use Cases

### 1. Student Registration Form
```tsx
<TradeLevelSelector
  selectedTrade={studentData.trade}
  selectedLevel={studentData.level}
  onTradeChange={(trade) => setStudentData({ ...studentData, trade })}
  onLevelChange={(level) => setStudentData({ ...studentData, level })}
  required
/>
```

### 2. Class Creation Form
```tsx
<TradeLevelSelector
  selectedTrade={classData.trade}
  selectedLevel={classData.level}
  onTradeChange={(trade) => setClassData({ ...classData, trade })}
  onLevelChange={(level) => setClassData({ ...classData, level })}
  required
/>
```

### 3. Exam Scheduling Form
```tsx
<TradeLevelSelector
  selectedTrade={examData.trade}
  selectedLevel={examData.level}
  onTradeChange={(trade) => setExamData({ ...examData, trade })}
  onLevelChange={(level) => setExamData({ ...examData, level })}
  required
/>
```

### 4. Report Generation Filter
```tsx
<TradeLevelSelector
  selectedTrade={filters.trade}
  selectedLevel={filters.level}
  onTradeChange={(trade) => setFilters({ ...filters, trade })}
  onLevelChange={(level) => setFilters({ ...filters, level })}
  showLabels={false}
/>
```

### 5. Staff Assignment Form
```tsx
<TradeLevelSelector
  selectedTrade={assignment.trade}
  selectedLevel={assignment.level}
  onTradeChange={(trade) => setAssignment({ ...assignment, trade })}
  onLevelChange={(level) => setAssignment({ ...assignment, level })}
  required
/>
```

## Database Structure

The system reads from the `courses` table:

```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(10),           -- Trade code (SOD, BDC, AUT)
  name VARCHAR(255),          -- Course name
  name_rw VARCHAR(255),       -- Course name in Kinyarwanda
  level_number INT,           -- Level number (3, 4, 5)
  level_suffix VARCHAR(2),    -- Level suffix (A, B, or NULL)
  -- other fields...
);
```

## Setup

1. **Run Setup Script:**
```bash
setup-trade-level-selector.bat
```

2. **Import Component:**
```tsx
import TradeLevelSelector from './components/TradeLevelSelector';
```

3. **Use in Form:**
```tsx
<TradeLevelSelector
  selectedTrade={trade}
  selectedLevel={level}
  onTradeChange={setTrade}
  onLevelChange={setLevel}
  required
/>
```

## Features in Detail

### Auto-Reset Behavior
When a user changes the trade, the level automatically resets to empty. This prevents invalid trade-level combinations.

### Loading States
The component shows loading states during API calls and disables inputs to prevent race conditions.

### Validation
When `required={true}`, both fields are marked as required and will trigger HTML5 validation on form submit.

### Cascading Selection
Levels are only loaded after a trade is selected, ensuring data consistency.

## Integration Examples

### DOD Dashboard - Student Management
```tsx
<TradeLevelSelector
  selectedTrade={newStudent.trade}
  selectedLevel={newStudent.level}
  onTradeChange={(trade) => setNewStudent({ ...newStudent, trade })}
  onLevelChange={(level) => setNewStudent({ ...newStudent, level })}
  required
/>
```

### DOS Dashboard - Class Creation
```tsx
<TradeLevelSelector
  selectedTrade={newClass.trade}
  selectedLevel={newClass.level}
  onTradeChange={(trade) => setNewClass({ ...newClass, trade })}
  onLevelChange={(level) => setNewClass({ ...newClass, level })}
  required
/>
```

### Teacher Portal - Assignment Creation
```tsx
<TradeLevelSelector
  selectedTrade={assignment.trade}
  selectedLevel={assignment.level}
  onTradeChange={(trade) => setAssignment({ ...assignment, trade })}
  onLevelChange={(level) => setAssignment({ ...assignment, level })}
  required
/>
```

## Error Handling

The component handles errors gracefully:
- Network errors: Logs to console, shows empty options
- Invalid trade: Clears levels automatically
- Database errors: Returns empty arrays

## Performance

- Trades loaded once on mount
- Levels loaded only when trade changes
- Minimal re-renders with proper state management
- Efficient API calls with axios

## Browser Support

Works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- Proper label associations
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Disabled state handling

## Future Enhancements

- [ ] Add search/filter in dropdowns
- [ ] Support for multiple trade selection
- [ ] Cache API responses
- [ ] Add loading skeletons
- [ ] Support for custom styling themes
- [ ] Add course selection as third dropdown

## Support

For issues or questions, contact the development team.
