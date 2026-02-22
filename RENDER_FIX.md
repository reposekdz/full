# 🔧 RENDER DEPLOYMENT FIX

## ❌ Error: Root directory "full" does not exist

This error occurs because Render is looking for the wrong root directory.

## ✅ Quick Fix

### Option 1: Update Render Dashboard Settings
1. Go to your Render dashboard
2. Select your service
3. Go to **Settings** → **Build & Deploy**
4. Change **Root Directory** from `full` to `.` (dot)
5. Click **Save Changes**

### Option 2: Use render.yaml (Recommended)
1. The `render.yaml` file has been created in your project root
2. In Render dashboard:
   - Delete existing services
   - Connect repository again
   - Render will auto-detect the `render.yaml` file
   - Deploy automatically

## 📁 Correct Directory Structure
```
Powerfulschoolmanagementsystem/  ← Root directory (use ".")
├── backend/                     ← Backend code
├── src/                         ← Frontend code  
├── dist/                        ← Built frontend
├── package.json                 ← Frontend dependencies
├── render.yaml                  ← Render config
└── README.md
```

## 🚀 Manual Render Settings

### Frontend Service:
- **Type**: Static Site
- **Root Directory**: `.` (dot)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Backend Service:
- **Type**: Web Service
- **Root Directory**: `.` (dot)
- **Build Command**: `cd backend && npm install --production`
- **Start Command**: `cd backend && npm start`
- **Environment**: Node.js

## 🔑 Environment Variables (Backend)
```
NODE_ENV=production
PORT=5000
DB_HOST=[from database]
DB_USER=[from database]  
DB_PASSWORD=[from database]
DB_NAME=school_management
JWT_SECRET=[generate secure key]
AFRICATALKING_API_KEY=[your key]
AFRICATALKING_USERNAME=[your username]
```

## ✅ Deploy Steps
1. Fix root directory to `.`
2. Add environment variables
3. Connect database
4. Deploy!