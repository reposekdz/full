# LEADERSHIP SYSTEM - QUICK START

## 🚀 Setup (3 Steps)

### 1. Setup Database
```bash
setup-leadership.bat
```

### 2. Start Servers
```bash
start-servers.bat
```

### 3. Access Leadership
- Open http://localhost:5173
- Click menu icon (☰) in header
- Click "Ubuyobozi" (Leadership)
- Click any leader card to view details

## ✅ What's Included

### Pages
- **LeadershipPage**: Grid of leader cards
- **LeaderDetailPage**: Full leader profile

### Database
- 4 sample leaders with full Kinyarwanda content
- Complete biographies (2000+ words each)
- Qualifications, achievements, responsibilities

### API
- GET /api/leadership - All leaders
- GET /api/leadership/:id - Single leader
- POST /api/leadership - Create leader
- PUT /api/leadership/:id - Update leader
- DELETE /api/leadership/:id - Delete leader

## 👥 Sample Leaders

1. **Mugisha Jean Claude** - Umuyobozi Mukuru (15+ years)
2. **Uwase Marie Grace** - Umuyobozi w'Amasomo (12+ years)
3. **Nkurunziza Patrick** - Umuyobozi w'Indero (10+ years)
4. **Mukamana Jeanne** - Umubitsi (8+ years)

## 🎨 Features

✅ Modern card design with hover effects
✅ Full leader profiles with contact info
✅ Responsive grid layout (1-4 columns)
✅ All content in Kinyarwanda
✅ Navigation from header menu
✅ Database integration
✅ Image upload support

## 📱 Navigation

**Header Menu → Ubuyobozi → Click Card → View Details**

## 🔧 Files Created

- `src/app/pages/LeadershipPage.tsx`
- `src/app/pages/LeaderDetailPage.tsx`
- `backend/routes/leadership.js`
- `backend/scripts/setup-leadership.js`
- `setup-leadership.bat`

## ✅ Status

**FULLY FUNCTIONAL** - Ready to use!
