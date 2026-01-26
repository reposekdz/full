# News Articles API Documentation

## Overview
Complete CRUD API for managing news articles with image support.

## Database Setup

Run the setup script to add existing news images to the database:
```bash
setup-news.bat
```

Or manually:
```bash
cd backend
node scripts/setup-news-articles.js
```

## API Endpoints

### 1. Get All Articles
**GET** `/api/news`

**Query Parameters:**
- `category` (optional) - Filter by category
- `featured` (optional) - Set to 'true' to get only featured articles
- `limit` (optional) - Number of articles to return (default: 50)

**Response:**
```json
{
  "success": true,
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "description": "Short description",
      "content": "Full article content",
      "image_url": "/uploads/news/image.jpg",
      "author": "Author Name",
      "category": "School Life",
      "date_published": "2024-01-15",
      "views": 150,
      "likes": 25,
      "shares": 10,
      "is_featured": true,
      "is_active": true,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### 2. Get Single Article
**GET** `/api/news/:id`

**Response:**
```json
{
  "success": true,
  "article": {
    "id": 1,
    "title": "Article Title",
    "description": "Short description",
    "content": "Full article content",
    "image_url": "/uploads/news/image.jpg",
    "author": "Author Name",
    "category": "School Life",
    "date_published": "2024-01-15",
    "views": 150,
    "likes": 25,
    "is_featured": true
  }
}
```

### 3. Create New Article
**POST** `/api/news`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `title` (required) - Article title
- `description` (required) - Short description
- `content` (required) - Full article content
- `author` (required) - Author name
- `category` (required) - Article category
- `is_featured` (optional) - 'true' or 'false'
- `image` (optional) - Image file

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('title', 'New Article Title');
formData.append('description', 'Article description');
formData.append('content', 'Full article content here...');
formData.append('author', 'John Doe');
formData.append('category', 'School Life');
formData.append('is_featured', 'true');
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:5000/api/news', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "id": 7,
  "message": "Article created successfully"
}
```

### 4. Update Article
**PUT** `/api/news/:id`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `title` (required) - Article title
- `description` (required) - Short description
- `content` (required) - Full article content
- `author` (required) - Author name
- `category` (required) - Article category
- `is_featured` (optional) - 'true' or 'false'
- `image` (optional) - New image file (if updating image)

**Example:**
```javascript
const formData = new FormData();
formData.append('title', 'Updated Title');
formData.append('description', 'Updated description');
formData.append('content', 'Updated content...');
formData.append('author', 'Jane Doe');
formData.append('category', 'Academics');
formData.append('is_featured', 'false');
// Only add image if updating
if (newImage) {
  formData.append('image', newImage);
}

const response = await fetch('http://localhost:5000/api/news/1', {
  method: 'PUT',
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "message": "Article updated successfully"
}
```

### 5. Delete Article
**DELETE** `/api/news/:id`

**Note:** This is a soft delete - the article is marked as inactive but not removed from the database.

**Response:**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

### 6. Track Article View
**POST** `/api/news/:id/view`

Increments the view count for an article.

**Response:**
```json
{
  "success": true
}
```

### 7. Like Article
**POST** `/api/news/:id/like`

Increments the like count for an article.

**Response:**
```json
{
  "success": true
}
```

## Categories

Available categories:
- School Life
- Guidance
- Leadership
- Academics
- Environment
- Staff
- Sports
- Events
- Announcements

## Existing Articles

The following articles are included with images:

1. **Ibiganiro hagati y'abanyeshuri n'abayobozi**
   - Image: `ibiganiro hagati yabanyeshuri nabayobozi.jpg`
   - Category: School Life
   - Featured: Yes

2. **Inama nyishi zitangwa ku banyeshuri**
   - Image: `inama nyishi zitangwa kubanyeshuri.jpg`
   - Category: Guidance

3. **Kuganirizwa n'abayobozi batandukanye**
   - Image: `kuganirizwa nabayobozi batandukanye.jpg`
   - Category: Leadership

4. **Mu bihe byo gukora ibizamini**
   - Image: `mubihe byogukora ibizamin.jpg`
   - Category: Academics
   - Featured: Yes

5. **Muri Garden TSS - Isuku ni umuco**
   - Image: `muri garden  tss isuku ni umuco.jpg`
   - Category: Environment

6. **Team y'ikigo**
   - Image: `team yikigo.jpg`
   - Category: Staff
   - Featured: Yes

## Frontend Integration Example

```typescript
// Fetch all articles
const fetchArticles = async () => {
  const response = await fetch('http://localhost:5000/api/news');
  const data = await response.json();
  return data.articles;
};

// Fetch featured articles
const fetchFeaturedArticles = async () => {
  const response = await fetch('http://localhost:5000/api/news?featured=true&limit=3');
  const data = await response.json();
  return data.articles;
};

// Create new article
const createArticle = async (articleData: FormData) => {
  const response = await fetch('http://localhost:5000/api/news', {
    method: 'POST',
    body: articleData
  });
  return await response.json();
};

// Update article
const updateArticle = async (id: number, articleData: FormData) => {
  const response = await fetch(`http://localhost:5000/api/news/${id}`, {
    method: 'PUT',
    body: articleData
  });
  return await response.json();
};

// Delete article
const deleteArticle = async (id: number) => {
  const response = await fetch(`http://localhost:5000/api/news/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
};
```

## Image Upload Notes

- Images are stored in `backend/uploads/news/`
- Supported formats: JPG, JPEG, PNG, GIF
- Images are automatically renamed with timestamp to avoid conflicts
- Image URLs are stored as `/uploads/news/filename.jpg`
- When updating an article, you can optionally upload a new image

## Testing

Test the API using curl:

```bash
# Get all articles
curl http://localhost:5000/api/news

# Get featured articles
curl http://localhost:5000/api/news?featured=true

# Get single article
curl http://localhost:5000/api/news/1

# Create article with image
curl -X POST http://localhost:5000/api/news \
  -F "title=Test Article" \
  -F "description=Test description" \
  -F "content=Test content" \
  -F "author=Test Author" \
  -F "category=School Life" \
  -F "is_featured=true" \
  -F "image=@path/to/image.jpg"

# Update article
curl -X PUT http://localhost:5000/api/news/1 \
  -F "title=Updated Title" \
  -F "description=Updated description" \
  -F "content=Updated content" \
  -F "author=Updated Author" \
  -F "category=Academics" \
  -F "is_featured=false"

# Delete article
curl -X DELETE http://localhost:5000/api/news/1

# Track view
curl -X POST http://localhost:5000/api/news/1/view

# Like article
curl -X POST http://localhost:5000/api/news/1/like
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `404` - Article not found
- `500` - Server error
