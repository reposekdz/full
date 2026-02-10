# Trade Gallery Images Guide

## Why No Images Are Showing

The gallery tab shows "Nta mafoto ahari" (No images available) because the image folders are empty.

## Folder Structure

```
backend/uploads/trades/
├── AUTO/                    # General automotive images
│   └── tools/              # Tools & equipment images
├── BDC/                     # General construction images
│   └── tools/              # Construction tools images
└── SOD/                     # General software dev images
    └── tools/              # Software tools images
```

## How to Add Images

### For Automotive Technology (AUTO)

**Step 1: Add General Images**
Place images in: `backend/uploads/trades/AUTO/`

Example images:
- `automotive-workshop.jpg` - Workshop overview
- `student-working.jpg` - Students working on vehicles
- `classroom.jpg` - Automotive classroom
- `vehicle-repair.jpg` - Vehicle repair in progress

**Step 2: Add Tools & Equipment Images**
Place images in: `backend/uploads/trades/AUTO/tools/`

Example images:
- `diagnostic-tools.jpg` - Diagnostic equipment
- `engine-tools.jpg` - Engine repair tools
- `brake-tools.jpg` - Brake system tools
- `electrical-tools.jpg` - Electrical testing equipment
- `lift-equipment.jpg` - Vehicle lifts
- `welding-tools.jpg` - Welding equipment

### Image Requirements

- **Formats**: JPG, JPEG, JFIF, PNG, WebP
- **Recommended Size**: 800x600 pixels (4:3 ratio)
- **Maximum File Size**: 2MB per image
- **Naming Convention**: Use lowercase with hyphens (e.g., `engine-repair-tools.jpg`)

## Quick Setup

### Option 1: Run Setup Script
```bash
setup-trade-gallery.bat
```
This will open both folders for you to add images.

### Option 2: Manual Setup
1. Navigate to `backend/uploads/trades/AUTO/`
2. Add your general automotive images
3. Navigate to `backend/uploads/trades/AUTO/tools/`
4. Add your tools and equipment images
5. Restart the server

## API Endpoint

The gallery fetches images from:
```
GET /api/trade-images/gallery/:tradeCode
```

For AUTO trade:
```
GET /api/trade-images/gallery/AUTO
```

## Response Format

```json
{
  "success": true,
  "gallery": [
    {
      "url": "/uploads/trades/AUTO/automotive-workshop.jpg",
      "title": "automotive workshop",
      "category": "General",
      "filename": "automotive-workshop.jpg"
    },
    {
      "url": "/uploads/trades/AUTO/tools/diagnostic-tools.jpg",
      "title": "diagnostic tools",
      "category": "Tools & Equipment",
      "filename": "diagnostic-tools.jpg"
    }
  ],
  "count": 2
}
```

## About "Subira ku Myuga"

This is **NOT an error**. "Subira ku Myuga" is Kinyarwanda for "Back to Trades".

The system is multilingual:
- **Kinyarwanda**: "Subira ku Myuga"
- **English**: "Back to Trades"

To change the language:
1. Look for a language selector in the UI
2. Or modify the language context in the code

## Testing

After adding images:

1. **Restart the server**:
   ```bash
   npm run dev
   ```

2. **Navigate to a trade**:
   - Go to Trades page
   - Click on "Automotive Technology"
   - Click on "Amafoto" (Gallery) tab

3. **Verify images appear**:
   - You should see your images in a grid
   - Filter by "Ifoto Zose" (All) or "Tools & Equipment"
   - Click images to view full size

## Troubleshooting

### Images not showing?

1. **Check file format**: Only JPG, JPEG, JFIF, PNG, WebP are supported
2. **Check file size**: Must be under 2MB
3. **Check folder path**: Must be exactly `backend/uploads/trades/AUTO/` or `backend/uploads/trades/AUTO/tools/`
4. **Restart server**: Changes require server restart
5. **Check console**: Look for errors in browser console (F12)

### Still not working?

Check the API response:
```
http://localhost:5000/api/trade-images/gallery/AUTO
```

Should return JSON with your images. If empty, images aren't in the correct folders.

## Sample Images

You can use:
- Stock photos from free sites (Unsplash, Pexels)
- Your own workshop photos
- Equipment photos
- Student work photos

**Important**: Ensure you have rights to use any images you add.

## For Other Trades

### BDC (Building & Construction)
- General: `backend/uploads/trades/BDC/`
- Tools: `backend/uploads/trades/BDC/tools/`

### SOD (Software Development)
- General: `backend/uploads/trades/SOD/`
- Tools: `backend/uploads/trades/SOD/tools/`

## Need Help?

If images still don't appear after following these steps:
1. Check server logs for errors
2. Verify folder permissions
3. Ensure the API route is registered in `backend/server.js`
4. Check that multer is properly configured
