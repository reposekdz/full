# Comprehensive Trades & Courses System

## Overview
This system provides a complete trade and course management solution for the Garden TVET School Management System. It includes all trades with their respective courses across different levels (L3, L4, L5).

## Features

### 🎓 Trades Included
1. **Software Development (SOD)** - Levels 3, 4, 5
2. **Building & Construction (BDC)** - Levels 3, 4, 5  
3. **Automotive Technology (AUTO)** - Levels 3, 4, 5

### 📚 Total Courses
- **L4 SOD**: 8 courses (Data Structures, Database Development, Backend Design, etc.)
- **L5 BDC**: 8 courses (Site Management, Ceiling Work, ArchiCAD, etc.)
- **L3 SOD**: 8 courses (JavaScript, UI/UX Design, Web Development, etc.)
- **L4 BDC**: 9 courses (Concrete Work, Tiling, AutoCAD, Welding, etc.)
- **L3 AUTO**: 12 courses (Engine Repair, Electrical Systems, Welding, etc.)
- **L5 SOD**: 10 courses (Python, React JS, Blockchain, Machine Learning, etc.)
- **L4 AUTO**: 9 courses (Diesel Engine, Transmission, Electronics, etc.)
- **L5 AUTO**: 8 courses (Hydraulic Systems, Hybrid Vehicles, etc.)

**Total: 72 courses across 8 trade programs**

## Setup Instructions

### 1. Database Setup
Run the setup script to create tables and populate data:

```bash
# Windows
setup-trades.bat

# Or manually
cd backend
node scripts/setup-comprehensive-trades.js
```

### 2. API Endpoints

#### Get All Trades
```
GET /api/trades/all
```
Returns all trades with instructor and course counts.

#### Get Trade by ID
```
GET /api/trades/:id
```
Returns complete trade details including:
- Trade information
- All courses
- All instructors
- Statistics (total credits, hours, courses, instructors)

#### Get Trade by Code
```
GET /api/trades/code/:code
```
Example: `/api/trades/code/L4SOD`

#### Get Trades by Level
```
GET /api/trades/level/:level
```
Example: `/api/trades/level/L4`

#### Get Courses for a Trade
```
GET /api/trades/:id/courses
```

#### Get Instructors for a Trade
```
GET /api/trades/:id/instructors
```

### 3. Admin Endpoints (Requires Authentication)

#### Update Trade
```
PUT /api/trades/admin/:id
```

#### Add Course to Trade
```
POST /api/trades/admin/:id/courses
```

#### Update Course
```
PUT /api/trades/admin/courses/:courseId
```

#### Add Instructor to Trade
```
POST /api/trades/admin/:id/instructors
```

## Frontend Components

### TradeDetailPage Component
Located at: `src/app/components/trades/TradeDetailPage.tsx`

**Features:**
- Dynamic trade information display
- Three tabs: Overview, Courses, Instructors
- Statistics cards (courses, instructors, credits, hours)
- Responsive design with animations
- Multi-language support (English/Kinyarwanda)
- Color-coded by trade type

**Usage:**
```tsx
<TradeDetailPage 
  tradeId="1" 
  onNavigate={(page) => console.log(page)} 
/>
```

### Integration Example
```tsx
// In your main App or routing component
import TradeDetailPage from '@/app/components/trades/TradeDetailPage';

// When user clicks on a trade
<TradeDetailPage 
  tradeId={selectedTradeId}
  onNavigate={handleNavigation}
/>
```

## Database Schema

### trades Table
- `id` - Primary key
- `code` - Unique trade code (e.g., L4SOD)
- `name` - Trade name in English
- `name_rw` - Trade name in Kinyarwanda
- `description` - Description in English
- `description_rw` - Description in Kinyarwanda
- `level` - Level (L3, L4, L5)
- `duration_years` - Program duration
- `total_students` - Number of students
- `total_instructors` - Number of instructors
- `is_active` - Active status
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### trade_courses Table
- `id` - Primary key
- `trade_id` - Foreign key to trades
- `code` - Unique course code
- `name` - Course name in English
- `name_rw` - Course name in Kinyarwanda
- `description` - Course description
- `level` - Course level
- `credits` - Credit hours
- `hours` - Total hours
- `semester` - Semester number
- `is_active` - Active status
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### trade_instructors Table
- `id` - Primary key
- `trade_id` - Foreign key to trades
- `name` - Instructor name
- `name_rw` - Name in Kinyarwanda
- `email` - Email address
- `phone` - Phone number
- `specialization` - Area of expertise
- `qualification` - Academic qualification
- `experience_years` - Years of experience
- `photo_url` - Profile photo URL
- `is_active` - Active status
- `created_at` - Creation timestamp

## Features by Trade

### Software Development (SOD)
- **L3**: Foundation programming, web basics
- **L4**: Advanced programming, backend development
- **L5**: Professional development, AI/ML, blockchain

### Building & Construction (BDC)
- **L3**: Basic construction skills
- **L4**: Concrete work, tiling, technical drawing
- **L5**: Site management, advanced design, ArchiCAD

### Automotive Technology (AUTO)
- **L3**: Engine basics, electrical systems
- **L4**: Diesel engines, transmission systems
- **L5**: Hydraulic systems, hybrid vehicles

## Styling & Design

### Color Schemes
- **SOD**: Blue to Indigo to Purple gradient
- **BDC**: Green to Teal to Emerald gradient
- **AUTO**: Orange to Red to Pink gradient

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly buttons and navigation

### Animations
- Framer Motion for smooth transitions
- Staggered animations for lists
- Hover effects on cards

## Multi-language Support

The system supports:
- **English** (en)
- **Kinyarwanda** (rw)

All trade names, descriptions, and course names are available in both languages.

## Testing

### Test the API
```bash
# Get all trades
curl http://localhost:5000/api/trades/all

# Get specific trade
curl http://localhost:5000/api/trades/1

# Get trade by code
curl http://localhost:5000/api/trades/code/L4SOD
```

### Test the Frontend
1. Navigate to trades page
2. Click on any trade card
3. Verify all tabs work (Overview, Courses, Instructors)
4. Check language switching
5. Test navigation back to trades list

## Future Enhancements

- [ ] Student enrollment per course
- [ ] Course prerequisites
- [ ] Instructor ratings and reviews
- [ ] Course materials upload
- [ ] Online course delivery
- [ ] Certificate generation
- [ ] Course completion tracking
- [ ] Student performance analytics

## Support

For issues or questions:
- Check the API documentation
- Review the component props
- Verify database connection
- Check console for errors

## License

Part of the Garden TVET School Management System
