# Enhanced Sports Page with Coach Profiles - Setup Instructions

## Database Setup

1. **Create Coaches Table & Add Jotham's Profile**
   ```bash
   cd backend
   node scripts/setup-coaches.js
   ```

   This creates the `sports_coaches` table and inserts Jotham's comprehensive profile with:
   - Full name: Jotham Niyonzima
   - Sport: Football
   - 15 years experience
   - 6 professional qualifications
   - 6 major achievements
   - 6 specializations
   - 1000+ word biography in Kinyarwanda & English
   - Contact information (email, phone, office)

## Features Implemented

### 1. **Sports Page Left Sidebar**
   - 6 Navigation sections:
     - Teams
     - Past Matches
     - Upcoming Matches
     - Analytics
     - Achievements
     - **Coaches** (NEW!)
   - Quick stats panel
   - Top team showcase
   - Back to home button

### 2. **Coaches Tab**
   - Grid display of all coaches from database
   - Each coach card shows:
     - Professional photo (or default icon)
     - Name, sport, title
     - Years of experience
     - Number of achievements
     - "View More" button

### 3. **Coach Detail Modal**
   - Full-screen modal with comprehensive information:
     - Hero header with gradient background
     - Large profile photo
     - Contact information card (email, phone, office)
     - Biography in Kinyarwanda & English
     - Qualifications grid with animations
     - Achievements list with trophy icons
     - Specializations cards
   - Smooth animations with Framer Motion
   - Click outside to close

### 4. **Admin Management**
   - Access via `AdminServicesPage.tsx`
   - Full CRUD operations for coaches:
     - Create new coaches
     - Edit existing coaches
     - Delete coaches
     - Upload coach images
   - Dedicated "Jotham Profile" section in sidebar
   - Image upload support (up to 10MB)

### 5. **Database Integration**
   - All coach data stored in `sports_coaches` table
   - Real-time data fetching from API
   - Automatic updates when admin makes changes
   - JSON fields for qualifications, achievements, specializations

## API Endpoints

- `GET /api/services-advanced/coaches` - Get all coaches
- `GET /api/services-advanced/coaches/:id` - Get specific coach
- `POST /api/services-advanced/coaches` - Create coach (admin)
- `PUT /api/services-advanced/coaches/:id` - Update coach (admin)
- `DELETE /api/services-advanced/coaches/:id` - Delete coach (admin)

## Usage

1. **View Coaches on Sports Page**
   - Navigate to Sports page
   - Click "Abatoza" (Coaches) in left sidebar
   - Click any coach card to view full profile

2. **Manage Coaches (Admin)**
   - Navigate to Admin Services page
   - Click "Coaches" in left sidebar
   - Add/Edit/Delete coaches
   - Upload images for coaches
   - View Jotham's dedicated profile section

## Jotham's Profile Highlights

- **Name**: Jotham Niyonzima
- **Sport**: Football
- **Title**: Umutoza Mukuru wa Siporo - Garden TVET School
- **Experience**: 15 years
- **Qualifications**: 6 professional certifications including CAF A License, UEFA B License
- **Achievements**: 3 Regional Championships, 12 national team players produced
- **Specializations**: Youth Development, Tactical Analysis, Sports Psychology, etc.
- **Biography**: 1000+ words in both Kinyarwanda and English

## Image Upload

- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Max file size: 10MB
- Images stored in: `backend/uploads/services/`
- Automatic image preview in forms

## Technologies Used

- React + TypeScript
- Framer Motion (animations)
- Tailwind CSS (styling)
- Lucide React (icons)
- MySQL (database)
- Multer (file uploads)
- Express.js (backend API)

## Notes

- All coach data is fully editable by admin
- Images are optional (default icon shown if no image)
- Bilingual support (Kinyarwanda & English)
- Responsive design for all screen sizes
- Smooth animations and transitions throughout
