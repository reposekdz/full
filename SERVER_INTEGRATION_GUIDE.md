# 🔌 Server Integration - Add to server.js

## Quick Integration

Add this ONE line to your `backend/server.js` file:

```javascript
// Advanced Parent Linking System - Real Trades (BDC, SOD, AUTO)
app.use('/api/parent-linking-advanced', require('./routes/parent-linking-advanced'));
```

## Full Example

Here's where to add it in your server.js:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ... other middleware ...

// ============================================
// ROUTES
// ============================================

// Existing routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
// ... other routes ...

// ✨ ADD THIS LINE - Advanced Parent Linking System
app.use('/api/parent-linking-advanced', require('./routes/parent-linking-advanced'));

// ... rest of server.js ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Verify Integration

After adding the route, restart your server and test:

```bash
# Test trades endpoint
curl http://localhost:3000/api/parent-linking-advanced/trades

# Expected response:
{
  "success": true,
  "trades": [
    { "trade_name": "BDC", "trade_code": "BDC", "full_name": "Building and Construction" },
    { "trade_name": "SOD", "trade_code": "SOD", "full_name": "Software Development" },
    { "trade_name": "AUTO", "trade_code": "AUTO", "full_name": "Automobile Technology" }
  ]
}
```

## Complete Setup Checklist

- [ ] Run `setup-parent-linking-advanced.bat`
- [ ] Add route to `server.js` (line above)
- [ ] Restart backend: `npm start`
- [ ] Test trades endpoint
- [ ] Test levels endpoint
- [ ] Test student search
- [ ] Access parent portal
- [ ] Verify only 3 trades show (BDC, SOD, AUTO)

## Troubleshooting

### Error: Cannot find module './routes/parent-linking-advanced'
**Solution:** Make sure you ran `setup-parent-linking-advanced.bat` first

### Error: Table 'parent_messages' doesn't exist
**Solution:** Run the setup script again to create tables

### Trades endpoint returns empty array
**Solution:** Check that `global_student_sheets` table has data

### Only showing 1 or 2 trades instead of 3
**Solution:** Add students to missing trades in `global_student_sheets`

## Alternative: Manual Route Registration

If you prefer to register the route manually:

```javascript
const parentLinkingAdvanced = require('./routes/parent-linking-advanced');
app.use('/api/parent-linking-advanced', parentLinkingAdvanced);
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=garden_tvet
PORT=3000
```

## Testing All Endpoints

```bash
# 1. Get trades (should show BDC, SOD, AUTO only)
curl http://localhost:3000/api/parent-linking-advanced/trades

# 2. Get levels (should show real levels from database)
curl http://localhost:3000/api/parent-linking-advanced/levels

# 3. Search students
curl "http://localhost:3000/api/parent-linking-advanced/search-students?name=John&trade=SOD&level=2"

# 4. Get parent dashboard
curl http://localhost:3000/api/parent-linking-advanced/parent-dashboard/+250788000001

# 5. Get messages
curl http://localhost:3000/api/parent-linking-advanced/messages/+250788000001

# 6. Get notifications
curl http://localhost:3000/api/parent-linking-advanced/notifications/+250788000001
```

## Success Indicators

✅ Server starts without errors
✅ Trades endpoint returns BDC, SOD, AUTO only
✅ Levels endpoint returns real levels from database
✅ Student search returns real students
✅ Parent dashboard loads with real data
✅ Messages show sender name and role
✅ Notifications display properly

## Next Steps

1. ✅ Add route to server.js
2. ✅ Restart backend
3. ✅ Test all endpoints
4. ✅ Access parent portal at http://localhost:5173/parent-portal
5. ✅ Login with phone: +250788000001
6. ✅ Verify only 3 trades show
7. ✅ Test linking request
8. ✅ Check messages from staff
9. ✅ Verify notifications work

## Production Deployment

For production, make sure to:

1. Set proper environment variables
2. Use HTTPS for API calls
3. Enable CORS for your frontend domain
4. Set up proper authentication
5. Configure rate limiting
6. Enable logging
7. Set up monitoring

```javascript
// Production CORS config
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

**Status:** Ready to integrate
**Time:** 30 seconds
**Difficulty:** Easy (just add 1 line)
