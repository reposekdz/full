# 📦 Stock Management - Quick Reference

## 🚀 30-Second Setup
```bash
setup-stock-management.bat
cd backend && npm start
```

## 🔗 Access
```
URL: http://localhost:5173/stock
```

## ⚡ Quick Actions

| Action | Steps |
|--------|-------|
| **Add Item** | Click "+ Add Item" → Fill form → Save |
| **Stock In** | Click ⬆ icon → Enter quantity → Confirm |
| **Stock Out** | Click ⬇ icon → Enter quantity → Confirm |
| **Edit** | Click ✏ icon → Update → Save |
| **Delete** | Click 🗑 icon → Confirm |
| **Search** | Type in search box → Auto-filter |
| **Filter** | Select category dropdown |

## 📊 Dashboard Stats

| Card | Shows |
|------|-------|
| **Total Items** | Count of all items |
| **Total Value** | Sum of (quantity × price) |
| **Low Stock** | Items ≤ reorder level |
| **Out of Stock** | Items with 0 quantity |

## 🎨 Status Colors

| Color | Meaning |
|-------|---------|
| 🟢 Green | In Stock (qty > reorder) |
| 🟠 Orange | Low Stock (qty ≤ reorder) |
| 🔴 Red | Out of Stock (qty = 0) |

## 🗂️ Categories
Stationery • Electronics • Furniture • Sports • Laboratory • Kitchen • Cleaning • Medical • Other

## 🔌 API Quick Reference

```javascript
// Get all items
GET /api/stock?search=paper&category=Stationery

// Get stats
GET /api/stock/stats

// Create item
POST /api/stock
{ item_code, item_name, category, quantity, unit, unit_price, reorder_level }

// Update item
PUT /api/stock/:id
{ item_name, quantity, unit_price }

// Delete item
DELETE /api/stock/:id

// Transaction
POST /api/stock/transaction
{ stock_item_id, transaction_type: 'in'|'out', quantity, notes }

// History
GET /api/stock/transactions/:id
```

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| Items not loading | Check backend running: `npm start` |
| Cannot add item | Ensure unique item_code |
| Transaction fails | Check sufficient stock for "out" |
| Search not working | Clear search box and retry |

## 📱 Features Checklist

- ✅ Real-time tracking
- ✅ Stock in/out
- ✅ Low stock alerts
- ✅ Category filters
- ✅ Advanced search
- ✅ Transaction history
- ✅ Value calculation
- ✅ Responsive design

## 🎯 Common Workflows

### Daily Stock Check
1. Open dashboard
2. Check "Low Stock" card
3. Review orange/red items
4. Order from suppliers

### Receiving Stock
1. Click ⬆ on item
2. Enter received quantity
3. Add supplier note
4. Confirm

### Issuing Stock
1. Click ⬇ on item
2. Enter issued quantity
3. Add recipient note
4. Confirm

### Monthly Audit
1. Export all items
2. Physical count
3. Update discrepancies
4. Review transaction history

## 📞 Quick Help

**Full Guide:** `STOCK_MANAGEMENT_GUIDE.md`

**Database:** `backend/database/stock_schema.sql`

**API Routes:** `backend/routes/stock.js`

**Frontend:** `src/components/StockManagement.jsx`

---

**Ready to manage stock! 📦✨**
