# Homepage & Dynamic Content API Documentation

## Overview
This document describes all API endpoints for fetching dynamic content from the database for the homepage and other frontend components.

## Base URL
```
http://localhost:5000/api
```

## Homepage APIs

### 1. Get Homepage Statistics
**Endpoint:** `GET /homepage/stats`

**Description:** Fetches real-time statistics from the database including student count, teacher count, employment rate, and awards.

**Response:**
```json
{
  "success": true,
  "students": 1248,
  "teachers": 84,
  "employmentRate": "95%",
  "awards": 25
}
```

### 2. Get News Articles
**Endpoint:** `GET /homepage/news`

**Description:** Fetches latest news articles from the database.

**Response:**
```json
{
  "success": true,
  "articles": [
    {
      "id": 1,
      "title": "Abanyeshuri bacu batsinze amahugurwa y'ubuhanga",
      "description": "Ikipe y'abanyeshuri muri Software Development...",
      "content": "Full article content...",
      "image_url": "https://...",
      "author": "Jean Mugisha",
      "category": "Ibihembo",
      "publish_date": "2026-01-15",
      "is_featured": false,
      "is_active": true
    }
  ]
}
```

### 3. Get Testimonials
**Endpoint:** `GET /homepage/testimonials`

**Description:** Fetches testimonials from students, parents, and teachers.

**Response:**
```json
{
  "success": true,
  "testimonials": [
    {
      "id": 1,
      "name": "Jean Claude Mugisha",
      "role": "Umunyeshuri - Software Development",
      "avatar": "JM",
      "quote": "Ishuri ryacu ryampaye amahirwe menshi...",
      "rating": 5,
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

### 4. Get Achievements
**Endpoint:** `GET /homepage/achievements`

**Description:** Fetches school achievements and awards.

**Response:**
```json
{
  "success": true,
  "achievements": [
    {
      "id": 1,
      "title": "Ishuri ry'Umwaka",
      "description": "Twatoranijwe nk'ishuri ry'umwaka...",
      "year": "2025",
      "image_url": null,
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

### 5. Get Upcoming Events
**Endpoint:** `GET /homepage/events`

**Description:** Fetches upcoming school events.

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": 1,
      "title": "Parent-Teacher Meeting",
      "title_rw": "Inama y'Ababyeyi n'Abarimu",
      "description": "Monthly meeting between parents and teachers",
      "description_rw": "Inama y'ukwezi ihuza ababyeyi n'abarimu",
      "event_date": "2026-01-25",
      "event_time": "14:00:00",
      "location": "Main Hall",
      "event_type": "academic",
      "priority": "high",
      "organizer": "School Administration",
      "organizer_rw": "Abayobozi b'Ishuri",
      "contact_info": "admin@school.rw",
      "max_attendees": 200,
      "current_attendees": 0,
      "status": "upcoming",
      "is_active": true
    }
  ]
}
```

### 6. Get Hero Slides
**Endpoint:** `GET /homepage/hero-slides`

**Description:** Fetches hero carousel slides for the homepage.

**Response:**
```json
{
  "success": true,
  "slides": [
    {
      "id": 1,
      "title": "EMPOWERING FUTURE SKILLS",
      "subtitle": "Building Tomorrow's Professionals Today",
      "description": "Join thousands of students...",
      "image_url": "https://...",
      "button_text": "Get Started",
      "button_link": "/register",
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

### 7. Get Home Features
**Endpoint:** `GET /homepage/features`

**Description:** Fetches feature highlights for the homepage.

**Response:**
```json
{
  "success": true,
  "features": [
    {
      "id": 1,
      "title": "Experienced Teachers",
      "title_rw": "Abarimu Babizi",
      "description": "Our teachers have extensive experience...",
      "description_rw": "Abarimu bacu bafite uburambe bwinshi...",
      "icon": "GraduationCap",
      "color": "from-blue-500 to-indigo-600",
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

### 8. Get Trades/Courses
**Endpoint:** `GET /homepage/trades`

**Description:** Fetches available trades/courses.

**Response:**
```json
{
  "success": true,
  "trades": [
    {
      "id": 1,
      "name": "Software Development",
      "description": "Comprehensive software development program...",
      "code": "SOD",
      "duration_months": 24,
      "fee_amount": 500000,
      "is_active": true
    }
  ]
}
```

## Content Management APIs

### 1. Get News Articles
**Endpoint:** `GET /content/news`

**Description:** Alternative endpoint for news articles.

### 2. Get Slides
**Endpoint:** `GET /content/slides`

**Description:** Alternative endpoint for hero slides.

### 3. Get Testimonials
**Endpoint:** `GET /content/testimonials`

**Description:** Alternative endpoint for testimonials.

### 4. Get Stats
**Endpoint:** `GET /content/stats`

**Description:** Alternative endpoint for school statistics.

### 5. Get Achievements
**Endpoint:** `GET /content/achievements`

**Description:** Alternative endpoint for achievements.

### 6. Get Trades
**Endpoint:** `GET /content/trades`

**Description:** Alternative endpoint for trades/courses.

## Admin APIs (Requires Authentication)

### Create News Article
**Endpoint:** `POST /content/news`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Article Title",
  "description": "Short description",
  "content": "Full article content",
  "image_url": "https://...",
  "author": "Author Name",
  "category": "Category"
}
```

### Update News Article
**Endpoint:** `PUT /content/news/:id`

**Headers:**
```
Authorization: Bearer <token>
```

### Delete News Article
**Endpoint:** `DELETE /content/news/:id`

**Headers:**
```
Authorization: Bearer <token>
```

### Create Slide
**Endpoint:** `POST /content/slides`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Slide Title",
  "subtitle": "Subtitle",
  "description": "Description",
  "image_url": "https://...",
  "button_text": "Button Text",
  "button_link": "/link",
  "sort_order": 1
}
```

### Update Slide
**Endpoint:** `PUT /content/slides/:id`

**Headers:**
```
Authorization: Bearer <token>
```

### Delete Slide
**Endpoint:** `DELETE /content/slides/:id`

**Headers:**
```
Authorization: Bearer <token>
```

## Database Tables

### slides
- id (INT, PRIMARY KEY)
- title (VARCHAR)
- subtitle (TEXT)
- description (TEXT)
- image_url (VARCHAR)
- button_text (VARCHAR)
- button_link (VARCHAR)
- is_active (BOOLEAN)
- sort_order (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### news_articles
- id (INT, PRIMARY KEY)
- title (VARCHAR)
- description (TEXT)
- content (TEXT)
- image_url (VARCHAR)
- author (VARCHAR)
- category (VARCHAR)
- date_published (DATE)
- is_featured (BOOLEAN)
- is_active (BOOLEAN)
- sort_order (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### testimonials
- id (INT, PRIMARY KEY)
- name (VARCHAR)
- role (VARCHAR)
- avatar (VARCHAR)
- quote (TEXT)
- rating (INT)
- is_active (BOOLEAN)
- sort_order (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### school_stats
- id (INT, PRIMARY KEY)
- stat_key (VARCHAR, UNIQUE)
- value (VARCHAR)
- label (VARCHAR)
- icon (VARCHAR)
- color (VARCHAR)
- is_active (BOOLEAN)
- sort_order (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### achievements
- id (INT, PRIMARY KEY)
- title (VARCHAR)
- description (TEXT)
- year (VARCHAR)
- image_url (VARCHAR)
- is_active (BOOLEAN)
- sort_order (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### events
- id (INT, PRIMARY KEY)
- title (VARCHAR)
- title_rw (VARCHAR)
- description (TEXT)
- description_rw (TEXT)
- event_date (DATE)
- event_time (TIME)
- location (VARCHAR)
- event_type (VARCHAR)
- priority (VARCHAR)
- organizer (VARCHAR)
- organizer_rw (VARCHAR)
- contact_info (VARCHAR)
- max_attendees (INT)
- current_attendees (INT)
- status (VARCHAR)
- is_active (BOOLEAN)
- sort_order (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### home_features
- id (INT, PRIMARY KEY)
- title (VARCHAR)
- title_rw (VARCHAR)
- description (TEXT)
- description_rw (TEXT)
- icon (VARCHAR)
- color (VARCHAR)
- is_active (BOOLEAN)
- sort_order (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### courses
- id (INT, PRIMARY KEY)
- name (VARCHAR)
- description (TEXT)
- code (VARCHAR, UNIQUE)
- duration_months (INT)
- fee_amount (DECIMAL)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Setup Instructions

### 1. Initialize Database Tables and Data
```bash
cd backend
node scripts/init-homepage-data.js
```

This will:
- Create all necessary tables
- Populate them with default data
- Display a summary of inserted records

### 2. Verify API Endpoints
Test the endpoints using curl or Postman:

```bash
# Test stats endpoint
curl http://localhost:5000/api/homepage/stats

# Test news endpoint
curl http://localhost:5000/api/homepage/news

# Test testimonials endpoint
curl http://localhost:5000/api/homepage/testimonials
```

### 3. Frontend Integration
The HomePage component automatically fetches data from these endpoints on mount. No additional configuration needed.

## Error Handling

All endpoints return graceful fallbacks:
- If database query fails, returns empty array or default values
- Frontend displays default mock data if API fails
- No breaking errors - system continues to function

## Notes

- All endpoints support CORS for frontend integration
- Authentication required only for admin operations (POST, PUT, DELETE)
- GET endpoints are public and don't require authentication
- Data is cached in frontend state to minimize API calls
- Images support both local uploads and external URLs
