# Content Management System (CMS)

## Overview
Admins can now update ALL frontend content including images, text, and links for:
- Homepage
- Sports
- Services
- Trades
- Leadership
- Developers
- Support

## Features
✅ **Image Upload** - Upload and manage images for each section
✅ **Content Editor** - Edit titles, subtitles, descriptions, and full content
✅ **Link Management** - Add links to external pages or resources
✅ **Display Order** - Control the order items appear
✅ **Active/Inactive** - Show or hide content without deleting
✅ **Real-time Updates** - Changes reflect immediately on frontend

## Access
**Admin Dashboard** → **CMS Management**

## API Endpoints

### Get Content
```
GET /api/cms/:section
```
Sections: homepage, sports, services, trades, leadership, developers, support

### Create/Update Content
```
POST /api/cms/:section
```
Body (multipart/form-data):
- title (required)
- subtitle
- description
- content
- image (file)
- link
- display_order
- active

### Delete Content
```
DELETE /api/cms/:section/:id
```

## Usage Example

### Add Sports Content
1. Go to Admin Dashboard
2. Click "CMS Management"
3. Select "Sports" tab
4. Click "Add Content"
5. Upload image
6. Fill in title, description
7. Set display order
8. Click "Save"

### Update Homepage Hero
1. Select "Homepage" tab
2. Click edit on existing item
3. Change image/text
4. Click "Save"

## Frontend Integration

All frontend pages automatically fetch from CMS:

```javascript
const [content, setContent] = useState([]);

useEffect(() => {
  fetch('http://localhost:5000/api/cms/sports')
    .then(res => res.json())
    .then(data => setContent(data.items));
}, []);
```

## Database Schema

Table: `cms_content`
- id
- section (homepage, sports, services, etc.)
- title
- subtitle
- description
- content
- image
- link
- metadata (JSON)
- display_order
- active
- created_at
- updated_at

## Setup Complete ✅

Run: `node backend/scripts/setup-cms.js`

Now admins have full control over all public-facing content!
