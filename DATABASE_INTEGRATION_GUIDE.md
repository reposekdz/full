# Complete Database Integration Setup Guide

## 🎯 Overview

This guide will help you set up the complete database integration for your School Management System, replacing all mock data with real database-driven content.

## 📋 Prerequisites

- Node.js installed
- MySQL database running
- Backend server configured with database credentials

## 🚀 Quick Start

### Step 1: Initialize Homepage Database

Run the initialization script to create tables and populate with data:

```bash
cd backend
node scripts/init-homepage-data.js
```

**Expected Output:**
```
🚀 Initializing homepage data...

📋 Creating tables...
✅ Tables created successfully

🗑️  Clearing existing data...
✅ Data cleared

📸 Inserting slides...
✅ Slides inserted

📰 Inserting news articles...
✅ News articles inserted

💬 Inserting testimonials...
✅ Testimonials inserted

📊 Inserting school stats...
✅ School stats inserted

🏆 Inserting achievements...
✅ Achievements inserted

📅 Inserting events...
✅ Events inserted

⭐ Inserting home features...
✅ Home features inserted

✅ Homepage data initialization completed successfully!

📊 Summary:
   - 4 Hero Slides
   - 4 News Articles
   - 4 Testimonials
   - 4 School Stats
   - 4 Achievements
   - 4 Events
   - 6 Home Features

✅ Done!
```

### Step 2: Start Backend Server

```bash
cd backend
npm start
```

The server should start on `http://localhost:5000`

### Step 3: Start Frontend

```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

### Step 4: Verify Integration

Open your browser and navigate to `http://localhost:5173`. The homepage should now display:
- Real statistics from database
- News articles from database
- Testimonials from database
- Achievements from database
- Events from database
- Features from database

## 📊 Database Tables Created

### 1. slides
Stores hero carousel slides for homepage
- 4 default slides created
- Supports bilingual content
- Sortable order

### 2. news_articles
Stores news and announcements
- 4 default articles created
- Category-based filtering
- Featured article support

### 3. testimonials
Stores testimonials from students, parents, teachers
- 4 default testimonials created
- Rating system (1-5 stars)
- Avatar initials support

### 4. school_stats
Stores key statistics displayed on homepage
- 4 default stats created
- Icon and color customization
- Real-time calculation support

### 5. achievements
Stores school achievements and awards
- 4 default achievements created
- Year-based organization
- Image support

### 6. events
Stores upcoming school events
- 4 default events created
- Bilingual support (English/Kinyarwanda)
- Date/time/location tracking
- Attendee management

### 7. home_features
Stores feature highlights for homepage
- 6 default features created
- Bilingual descriptions
- Icon and color customization

## 🔌 API Endpoints

### Public Endpoints (No Authentication Required)

```
GET /api/homepage/stats              - Get school statistics
GET /api/homepage/news               - Get news articles
GET /api/homepage/testimonials       - Get testimonials
GET /api/homepage/achievements       - Get achievements
GET /api/homepage/events             - Get upcoming events
GET /api/homepage/hero-slides        - Get hero slides
GET /api/homepage/features           - Get home features
GET /api/homepage/trades             - Get available trades/courses
```

### Admin Endpoints (Authentication Required)

```
POST   /api/content/news             - Create news article
PUT    /api/content/news/:id         - Update news article
DELETE /api/content/news/:id         - Delete news article

POST   /api/content/slides           - Create slide
PUT    /api/content/slides/:id       - Update slide
DELETE /api/content/slides/:id       - Delete slide
```

## 🎨 Frontend Integration

The HomePage component automatically fetches data from the API:

```typescript
// Fetches from /api/homepage/stats
const statsResponse = await fetch(`${API_BASE}/homepage/stats`);

// Fetches from /api/homepage/news
const newsResponse = await fetch(`${API_BASE}/homepage/news`);

// Fetches from /api/homepage/testimonials
const testimonialsResponse = await fetch(`${API_BASE}/homepage/testimonials`);
```

### Fallback Mechanism

If API calls fail, the frontend displays default mock data:
- No breaking errors
- Seamless user experience
- Console logs for debugging

## 🔧 Customization

### Adding New News Article

**Via Database:**
```sql
INSERT INTO news_articles (title, description, content, image_url, author, category, date_published)
VALUES ('New Article', 'Description', 'Full content', 'https://...', 'Author', 'Category', CURDATE());
```

**Via API (requires authentication):**
```bash
curl -X POST http://localhost:5000/api/content/news \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Article",
    "description": "Description",
    "content": "Full content",
    "image_url": "https://...",
    "author": "Author",
    "category": "Category"
  }'
```

### Updating Statistics

Statistics are calculated in real-time from the database:
- Student count: From `users` table where role = 'student'
- Teacher count: From `users` table where role = 'teacher'
- Employment rate: From `enrollments` table
- Awards: From `achievements` table

To update, simply add/modify records in the respective tables.

### Adding New Testimonial

```sql
INSERT INTO testimonials (name, role, avatar, quote, rating, sort_order)
VALUES ('John Doe', 'Student', 'JD', 'Great school!', 5, 5);
```

### Adding New Event

```sql
INSERT INTO events (title, title_rw, description, description_rw, event_date, event_time, location, event_type, priority, organizer, contact_info, status)
VALUES ('New Event', 'Ibirori Bishya', 'Event description', 'Ibisobanuro', '2026-02-15', '10:00:00', 'Main Hall', 'academic', 'high', 'Admin', 'admin@school.rw', 'upcoming');
```

## 🔍 Troubleshooting

### Issue: API returns empty arrays

**Solution:**
1. Check if database tables exist:
```sql
SHOW TABLES LIKE '%news%';
SHOW TABLES LIKE '%testimonials%';
```

2. Check if data exists:
```sql
SELECT COUNT(*) FROM news_articles;
SELECT COUNT(*) FROM testimonials;
```

3. Re-run initialization script:
```bash
node scripts/init-homepage-data.js
```

### Issue: Frontend shows mock data

**Solution:**
1. Check if backend is running on port 5000
2. Check browser console for API errors
3. Verify API_BASE constant in HomePage.tsx:
```typescript
const API_BASE = 'http://localhost:5000/api';
```

### Issue: Database connection error

**Solution:**
1. Check `.env` file in backend folder:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management
DB_PORT=3306
```

2. Test database connection:
```bash
cd backend
node scripts/test-db-connection.js
```

## 📈 Performance Optimization

### Caching Strategy

Frontend caches API responses in component state:
- Data fetched once on component mount
- No repeated API calls during navigation
- Refresh on page reload

### Database Indexing

Key indexes created for performance:
```sql
CREATE INDEX idx_news_date ON news_articles(date_published);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_active ON news_articles(is_active);
```

## 🔐 Security

### Public Endpoints
- Read-only access
- No authentication required
- Safe for public consumption

### Admin Endpoints
- JWT authentication required
- Role-based access control
- Input validation and sanitization

## 🎯 Next Steps

### 1. Add More Content
- Add more news articles
- Add more testimonials
- Add more events
- Upload custom images

### 2. Customize Design
- Update colors in `school_stats` table
- Update icons in `home_features` table
- Modify sort orders for display priority

### 3. Enable Admin Panel
- Create admin interface for content management
- Add image upload functionality
- Implement WYSIWYG editor for news articles

### 4. Extend Functionality
- Add pagination for news articles
- Add search functionality
- Add filtering by category
- Add event registration system

## 📚 Additional Resources

- [API Documentation](./HOMEPAGE_API_DOCUMENTATION.md)
- [Database Schema](./backend/scripts/comprehensive-schema.sql)
- [Backend Routes](./backend/routes/)
- [Frontend Components](./src/app/pages/)

## ✅ Verification Checklist

- [ ] Database tables created successfully
- [ ] Default data inserted
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Homepage displays database content
- [ ] Statistics show real numbers
- [ ] News articles display correctly
- [ ] Testimonials display correctly
- [ ] Events display correctly
- [ ] No console errors

## 🎉 Success!

If all steps completed successfully, your School Management System is now fully integrated with the database and displaying real dynamic content!

## 💡 Tips

1. **Regular Backups**: Backup your database regularly
2. **Content Updates**: Update content regularly to keep site fresh
3. **Image Optimization**: Optimize images before uploading
4. **Monitoring**: Monitor API response times
5. **Testing**: Test on different devices and browsers

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review console logs for errors
3. Verify database connection
4. Check API endpoints with curl/Postman
5. Review backend server logs

---

**Last Updated:** January 2026
**Version:** 1.0.0
