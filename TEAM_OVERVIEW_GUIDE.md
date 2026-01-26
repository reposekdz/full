# Team Overview Management System

## Overview
The Team Overview Management System allows administrators to create rich, dynamic, and fully customizable overview content for sports teams. All content is stored in the database and can be managed through the admin panel.

## Features

### Content Types
1. **Stats (Imibare)** - Display key statistics with icons, values, and colors
   - Win Rate, Goals Scored, Clean Sheets, etc.
   - Customizable colors: green, blue, yellow, red, purple, orange

2. **Highlights (Ibyiza)** - Showcase major achievements with gradient backgrounds
   - Championship victories, winning streaks, records
   - Eye-catching gradient cards with large icons

3. **Milestones (Intego)** - Timeline of important achievements
   - 100 goals, national rankings, historic moments
   - Large format with detailed descriptions

4. **Quotes (Amagambo)** - Motivational messages and team mottos
   - Team spirit, coach wisdom, player testimonials
   - Beautiful gradient backgrounds

5. **Images (Amafoto)** - Photo gallery
   - Team photos, action shots, celebrations
   - Grid layout with hover effects

6. **Announcements (Amatangazo)** - Important team news
   - Upcoming events, schedule changes, news
   - Prominent display with icons

## Admin Access

### Navigation
1. Go to Admin Panel
2. Click "Sports Management" (Trophy icon)
3. Select "Team Overview" tab

### Managing Content

#### Add New Content
1. Select a team from dropdown
2. Click "Ongeraho Ibirimo" (Add Content)
3. Fill in the form:
   - **Ubwoko** (Type): Choose content type
   - **Umutwe** (Title): English and Kinyarwanda
   - **Ibisobanuro** (Description): English and Kinyarwanda
   - **Icon**: Emoji (e.g., 🏆, ⚽, 🎯)
   - **Agaciro** (Value): Optional value (e.g., 75%, 100)
   - **Ibara** (Color): Choose color theme
   - **URL y'Ifoto**: Optional image URL
4. Click "Bika" (Save)

#### Edit Content
1. Click Edit button (pencil icon) on any content card
2. Modify fields as needed
3. Click "Bika" (Save)

#### Delete Content
1. Click Delete button (trash icon) on any content card
2. Confirm deletion

## Database Structure

### Table: sports_team_overview
```sql
- id: Primary key
- team_id: Foreign key to sports_teams
- content_type: ENUM('stat', 'highlight', 'milestone', 'quote', 'image', 'video', 'announcement')
- title: English title
- title_rw: Kinyarwanda title
- description: English description
- description_rw: Kinyarwanda description
- image_url: Optional image path
- icon: Emoji or icon
- value: Optional value (for stats)
- color: Color theme
- sort_order: Display order
- is_active: Boolean flag
```

## API Endpoints

### GET /api/sports/teams/:id/overview
Fetch all overview content for a team

### POST /api/sports/teams/:id/overview
Create new overview content
- Requires admin/headmaster authentication

### PUT /api/sports/overview/:id
Update existing overview content
- Requires admin/headmaster authentication

### DELETE /api/sports/overview/:id
Delete overview content
- Requires admin/headmaster authentication

## Frontend Display

### Team Detail Page
- Overview tab shows all content dynamically
- Content organized by type:
  - Stats in grid cards at top
  - Highlights in large gradient cards
  - Milestones in timeline format
  - Quotes in colorful cards
  - Images in photo gallery
  - Recent form visualization
  - Announcements prominently displayed

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly interactions
- Smooth animations

## Sample Data
The system comes pre-populated with sample data for both Football and Volleyball teams:
- 6 stat cards per team
- 2 highlight cards per team
- 2 milestone cards per team
- 1 quote card per team

## Best Practices

1. **Icons**: Use relevant emojis (🏆, ⚽, 🎯, 🔥, ⚡, 💪)
2. **Colors**: Match team colors and content type
3. **Values**: Keep short and impactful (75%, #1, 100+)
4. **Descriptions**: Clear and concise in both languages
5. **Sort Order**: Organize content logically
6. **Images**: Use high-quality team photos

## Troubleshooting

### Content not showing
- Check team_id matches
- Verify is_active = TRUE
- Check sort_order values

### Images not loading
- Verify image_url path is correct
- Ensure images are in /uploads directory
- Check file permissions

### API errors
- Verify authentication token
- Check user role (admin/headmaster required)
- Validate all required fields

## Future Enhancements
- Video content support
- Drag-and-drop reordering
- Bulk import/export
- Content templates
- Analytics tracking
- Social media integration
