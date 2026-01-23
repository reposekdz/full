# Admin Homepage Management API Documentation

## Overview
Complete CRUD API for managing all homepage content. All endpoints require authentication and admin/headmaster role.

## Authentication
All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Base URL
```
http://localhost:5000/api/homepage/admin
```

---

## 📰 NEWS ARTICLES

### Get All News
```http
GET /admin/news
```

**Response:**
```json
{
  "success": true,
  "news": [
    {
      "id": 1,
      "title": "Article Title",
      "description": "Short description",
      "content": "Full content",
      "image_url": "https://...",
      "author": "Author Name",
      "category": "Category",
      "date_published": "2026-01-15",
      "is_featured": false,
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

### Create News Article
```http
POST /admin/news
```

**Body:**
```json
{
  "title": "New Article",
  "description": "Description",
  "content": "Full content",
  "image_url": "https://...",
  "author": "Author",
  "category": "Category",
  "is_featured": false,
  "sort_order": 1
}
```

### Update News Article
```http
PUT /admin/news/:id
```

**Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "content": "Updated content",
  "image_url": "https://...",
  "author": "Author",
  "category": "Category",
  "is_featured": true,
  "is_active": true,
  "sort_order": 1
}
```

### Delete News Article
```http
DELETE /admin/news/:id
```

---

## 🎬 HERO SLIDES

### Get All Slides
```http
GET /admin/slides
```

### Create Slide
```http
POST /admin/slides
```

**Body:**
```json
{
  "title": "Slide Title",
  "subtitle": "Subtitle",
  "description": "Description",
  "image_url": "https://...",
  "button_text": "Get Started",
  "button_link": "/register",
  "sort_order": 1
}
```

### Update Slide
```http
PUT /admin/slides/:id
```

### Delete Slide
```http
DELETE /admin/slides/:id
```

---

## 💬 TESTIMONIALS

### Get All Testimonials
```http
GET /admin/testimonials
```

### Create Testimonial
```http
POST /admin/testimonials
```

**Body:**
```json
{
  "name": "John Doe",
  "role": "Student - Software Development",
  "avatar": "JD",
  "quote": "Great school!",
  "rating": 5,
  "sort_order": 1
}
```

### Update Testimonial
```http
PUT /admin/testimonials/:id
```

### Delete Testimonial
```http
DELETE /admin/testimonials/:id
```

---

## 🏆 ACHIEVEMENTS

### Get All Achievements
```http
GET /admin/achievements
```

### Create Achievement
```http
POST /admin/achievements
```

**Body:**
```json
{
  "title": "Achievement Title",
  "description": "Description",
  "year": "2025",
  "image_url": "https://...",
  "sort_order": 1
}
```

### Update Achievement
```http
PUT /admin/achievements/:id
```

### Delete Achievement
```http
DELETE /admin/achievements/:id
```

---

## 📅 EVENTS

### Get All Events
```http
GET /admin/events
```

### Create Event
```http
POST /admin/events
```

**Body:**
```json
{
  "title": "Event Title",
  "title_rw": "Izina ry'Ibirori",
  "description": "Event description",
  "description_rw": "Ibisobanuro",
  "event_date": "2026-02-15",
  "event_time": "10:00:00",
  "location": "Main Hall",
  "event_type": "academic",
  "priority": "high",
  "organizer": "Admin",
  "organizer_rw": "Umuyobozi",
  "contact_info": "admin@school.rw",
  "max_attendees": 200,
  "status": "upcoming",
  "sort_order": 1
}
```

### Update Event
```http
PUT /admin/events/:id
```

### Delete Event
```http
DELETE /admin/events/:id
```

---

## ⭐ HOME FEATURES

### Get All Features
```http
GET /admin/features
```

### Create Feature
```http
POST /admin/features
```

**Body:**
```json
{
  "title": "Feature Title",
  "title_rw": "Umutwe",
  "description": "Description",
  "description_rw": "Ibisobanuro",
  "icon": "GraduationCap",
  "color": "from-blue-500 to-indigo-600",
  "sort_order": 1
}
```

### Update Feature
```http
PUT /admin/features/:id
```

### Delete Feature
```http
DELETE /admin/features/:id
```

---

## 📊 STATISTICS

### Get All Stats
```http
GET /admin/stats
```

### Update Stat
```http
PUT /admin/stats/:id
```

**Body:**
```json
{
  "value": "1,500",
  "label": "Students",
  "icon": "Users",
  "color": "from-blue-500 to-indigo-500",
  "is_active": true,
  "sort_order": 1
}
```

**Note:** Stats cannot be created or deleted, only updated. They are auto-calculated from database.

---

## Usage Examples

### JavaScript/Fetch
```javascript
// Get token from localStorage
const token = localStorage.getItem('token');

// Create news article
const response = await fetch('http://localhost:5000/api/homepage/admin/news', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'New Article',
    description: 'Description',
    content: 'Content',
    image_url: 'https://...',
    author: 'Admin',
    category: 'News',
    is_featured: false,
    sort_order: 1
  })
});

const data = await response.json();
console.log(data);
```

### cURL
```bash
# Create news article
curl -X POST http://localhost:5000/api/homepage/admin/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "New Article",
    "description": "Description",
    "content": "Content",
    "image_url": "https://...",
    "author": "Admin",
    "category": "News"
  }'

# Update news article
curl -X PUT http://localhost:5000/api/homepage/admin/news/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Title",
    "is_active": true
  }'

# Delete news article
curl -X DELETE http://localhost:5000/api/homepage/admin/news/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "id": 123
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Field Validations

### News Articles
- `title`: Required, max 255 characters
- `description`: Optional, text
- `content`: Optional, text
- `image_url`: Optional, max 500 characters
- `author`: Optional, max 100 characters
- `category`: Optional, max 50 characters
- `is_featured`: Boolean, default false
- `is_active`: Boolean, default true
- `sort_order`: Integer, default 0

### Slides
- `title`: Required, max 255 characters
- `subtitle`: Optional, text
- `description`: Optional, text
- `image_url`: Optional, max 500 characters
- `button_text`: Optional, max 100 characters
- `button_link`: Optional, max 500 characters
- `is_active`: Boolean, default true
- `sort_order`: Integer, default 0

### Testimonials
- `name`: Required, max 100 characters
- `role`: Optional, max 100 characters
- `avatar`: Optional, max 10 characters
- `quote`: Required, text
- `rating`: Integer, 1-5, default 5
- `is_active`: Boolean, default true
- `sort_order`: Integer, default 0

---

## Security

### Authentication
- JWT token required for all admin endpoints
- Token must be valid and not expired
- Token must belong to user with admin or headmaster role

### Authorization
- Only users with `admin` or `headmaster` role can access these endpoints
- Role is checked via `requireRole` middleware

### Input Validation
- All inputs are sanitized to prevent SQL injection
- XSS protection enabled
- CORS configured for frontend domain

---

## Rate Limiting
- No rate limiting currently implemented
- Recommended: 100 requests per minute per user

---

## Best Practices

1. **Always validate input on frontend before sending**
2. **Use proper image URLs (HTTPS preferred)**
3. **Keep sort_order sequential for better organization**
4. **Set is_active to false instead of deleting for data retention**
5. **Use descriptive titles and categories**
6. **Optimize images before uploading**
7. **Test changes on staging before production**

---

## Troubleshooting

### 401 Unauthorized
- Check if token is valid
- Check if token is expired
- Verify token is in Authorization header

### 403 Forbidden
- Check if user has admin/headmaster role
- Verify role permissions in database

### 500 Internal Server Error
- Check backend logs
- Verify database connection
- Check if all required fields are provided

---

## Admin Panel Integration

The admin panel component (`AdminHomepageManager.tsx`) provides a UI for:
- Viewing all content
- Creating new content
- Editing existing content
- Deleting content
- Toggling active/inactive status
- Reordering items

Access the admin panel at: `/admin/homepage-manager`

---

**Last Updated:** January 2026  
**API Version:** 1.0.0
