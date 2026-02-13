# Rwanda Administrative Locations System

## Overview
Complete integration of Rwanda's administrative structure (Provinces, Districts, Sectors, Cells, Villages) into parent registration and student application forms.

## Features
✅ **5-Level Administrative Structure**
- Provinces (5): Kigali City, Northern, Southern, Eastern, Western
- Districts (30): Gasabo, Kicukiro, Nyarugenge, Huye, etc.
- Sectors (416+): Subdivisions within districts
- Cells (2,148+): Subdivisions within sectors
- Villages (14,837+): Smallest administrative units

✅ **Cascading Dropdowns**
- Select Province → Districts load
- Select District → Sectors load
- Select Sector → Cells load
- Select Cell → Villages load

✅ **Bilingual Support**
- Kinyarwanda and English names for all locations
- User-friendly interface

## Setup

### Quick Setup
```bash
setup-rwanda-locations.bat
```

### Manual Setup
1. Run location tables migration:
```bash
cd backend
mysql -u root school_management < migrations/rwanda_locations.sql
```

2. Add location fields to users table:
```bash
mysql -u root school_management < migrations/add-locations-to-users.sql
```

3. Restart backend server

## API Endpoints

### Get Provinces
```
GET /api/locations/provinces
```
Response:
```json
{
  "success": true,
  "provinces": [
    {
      "id": 1,
      "name_en": "Kigali City",
      "name_rw": "Umujyi wa Kigali",
      "code": "KGL"
    }
  ]
}
```

### Get Districts by Province
```
GET /api/locations/districts/:provinceId
```

### Get Sectors by District
```
GET /api/locations/sectors/:districtId
```

### Get Cells by Sector
```
GET /api/locations/cells/:sectorId
```

### Get Villages by Cell
```
GET /api/locations/villages/:cellId
```

## Usage in Forms

### React Component
```tsx
import RwandaLocationSelector from './components/RwandaLocationSelector';

function MyForm() {
  const [location, setLocation] = useState({});

  return (
    <RwandaLocationSelector
      onLocationChange={setLocation}
      required={true}
    />
  );
}
```

### Parent Registration
The parent registration form now includes:
- Province selection (required)
- District selection (required)
- Sector selection (optional)
- Cell selection (optional)
- Village selection (optional)

### Student Application
The student application form includes all location fields for:
- Student's residential address
- Parent's address
- Emergency contact address

## Database Schema

### Tables Created
- `provinces` - 5 provinces
- `districts` - 30 districts
- `sectors` - Sample sectors (expandable)
- `cells` - Sample cells (expandable)
- `villages` - Sample villages (expandable)

### Foreign Keys
- `users.province_id` → `provinces.id`
- `users.district_id` → `districts.id`
- `users.sector_id` → `sectors.id`
- `users.cell_id` → `cells.id`
- `users.village_id` → `villages.id`

### Student Applications
- `student_applications.province_id` → `provinces.id`
- `student_applications.district_id` → `districts.id`
- `student_applications.sector_id` → `sectors.id`
- `student_applications.cell_id` → `cells.id`
- `student_applications.village_id` → `villages.id`

## Data Sources
Official data from:
- National Institute of Statistics of Rwanda (NISR)
- Rwanda Governance Board (RGB)
- Ministry of Local Government (MINALOC)
- risa.gov.rw

## Expandability
The system includes sample data for:
- All 5 provinces ✓
- All 30 districts ✓
- Sample sectors for Kigali City districts
- Sample cells for Remera sector
- Sample villages for Gishushu cell

To add more locations:
```sql
INSERT INTO sectors (district_id, name_en, name_rw, code) 
VALUES (1, 'Sector Name', 'Izina ry\'Umurenge', 'CODE');
```

## Benefits
1. **Accurate Addressing** - Precise location data for all users
2. **Government Compliance** - Uses official administrative structure
3. **Better Analytics** - Location-based reports and statistics
4. **SMS Delivery** - Improved message routing by location
5. **Resource Planning** - Understand student distribution

## Integration Points
- ✅ Parent Registration Form
- ✅ Student Application Form
- ✅ User Profile Management
- ✅ Reports & Analytics
- ✅ SMS Notification System

## Future Enhancements
- [ ] Auto-complete location search
- [ ] Map visualization
- [ ] Location-based student statistics
- [ ] Geolocation integration
- [ ] Transport route planning by location

## Support
For issues or questions:
- Check API endpoints are accessible
- Verify database tables exist
- Ensure foreign keys are properly set
- Review browser console for errors

---
**System Status**: ✅ Production Ready
**Last Updated**: January 2025
