# Garden TVET School - Stock Management System

## Overview
This document describes the comprehensive stock management system implemented for Garden TVET School.

## Backend Components

### Routes Created

1. **`backend/routes/stock-management.js`** - Comprehensive stock management API
   - Dashboard statistics (`/dashboard/stats`)
   - Stock items CRUD (`/items`, `/items/:id`)
   - Stock adjustments (`/items/:id/adjust`)
   - Stock movements (`/movements`)
   - Suppliers management (`/suppliers`)
   - Purchase orders (`/orders`)
   - Categories (`/categories`)
   - Alerts (`/alerts`)
   - Reports (`/reports/stock`, `/reports/movements`)

2. **Existing Route: `backend/routes/stock-management-advanced.js`**
   - Available at `/api/stock-advanced`
   - Used by the frontend API service

### Database Tables

**Migration file:** `backend/migrations/stock-management-tables.sql`

Tables created:
- `stock_items` - Main inventory items
- `stock_movements` - Stock movement history
- `stock_suppliers` - Supplier information
- `stock_orders` - Purchase orders
- `stock_order_items` - Order line items
- `stock_categories` - Category reference

### Running the Migration

```bash
# Run the stock management migration
cd backend
node run-migration.js --file migrations/stock-management-tables.sql
```

Or execute directly in MySQL:
```sql
SOURCE migrations/stock-management-tables.sql
```

## Frontend Components

### Stock Management Dashboard

**File:** `src/app/pages/dashboards/StockManagementUltraAdvanced.tsx`

Features:
- Dashboard overview with stats cards
- Stock items management table
- Stock movements tracking
- Supplier management
- Purchase orders
- Category breakdown charts
- Low stock alerts
- Real-time data refresh

### API Service

**File:** `src/app/services/stockManagementApi.ts`

Endpoints mapped to:
- `getDashboardStats()` → `/stock-advanced/stats`
- `getItems()` → `/stock-advanced/inventory`
- `createItem()` → `/stock-advanced/inventory` (POST)
- `adjustStock()` → `/stock-advanced/inventory/:id/adjust` (POST)
- `getSuppliers()` → `/stock-advanced/suppliers`
- `getOrders()` → `/stock-advanced/orders`
- `getCategories()` → `/stock-advanced/categories`
- `getAlerts()` → `/stock-advanced/alerts`

## Garden TVET Branding

### Colors
- Primary: `#2E7D32` (Green)
- Secondary: `#FF6F00` (Orange)

### Kinyarwanda Labels
All UI elements are labeled in Kinyarwanda:
- "Ahabanza" - Overview/Home
- "Ibyakozwe" - Stock Items
- "Abah供给商" - Suppliers
- "Ibizamini" - Orders
- "Inyungu" - Movements
- "Amatangazo" - Alerts
- "Raporo" - Reports

## API Integration

### Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Response Format
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Handling
```json
{
  "success": false,
  "message": "Error description"
}
```

## Key Features

1. **Stock Tracking**
   - Real-time quantity updates
   - Movement history
   - Batch tracking
   - Expiry date monitoring

2. **Alerts System**
   - Low stock warnings
   - Out-of-stock notifications
   - Expiring items alerts
   - Pending order reminders

3. **Reporting**
   - Stock value reports
   - Movement history reports
   - Category breakdown
   - Monthly trends

4. **Supplier Management**
   - Supplier directory
   - Contact information
   - Order tracking
   - Performance metrics

## Using the Dashboard

### Navigate to Stock Management
From the main sidebar, click on "Ikigaragara cy'Ububiko" (Stock Dashboard)

### Add New Item
1. Click "Kongeramo Ikintu" button
2. Fill in the item details
3. Click "Kongeramo" to save

### Adjust Stock
1. Find the item in the list
2. Click the edit icon
3. Select adjustment type (add/subtract/return/damage)
4. Enter quantity and reason
5. Click "Guhindura"

### View Reports
- Overview tab shows monthly trends and category breakdown
- Use filters to narrow down data

## Troubleshooting

### Parent Login Issues
If parent login returns validation errors:
1. Ensure phone number is registered in `parents` table
2. Verify password hash exists
3. Check `is_active` flag is true
4. Ensure `password_hash` column exists

### Stock Data Not Loading
1. Check browser console for errors
2. Verify API server is running
3. Check JWT token is valid
4. Confirm database connection

### Missing Charts
Ensure Recharts is installed:
```bash
npm install recharts
```

## Related Files
- `src/app/services/stockManagementApi.ts` - API service
- `src/app/pages/dashboards/StockManagementUltraAdvanced.tsx` - Main dashboard
- `backend/routes/stock-management.js` - Backend API
- `backend/migrations/stock-management-tables.sql` - Database schema
