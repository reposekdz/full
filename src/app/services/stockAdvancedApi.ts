/**
 * Advanced Stock Management API Service
 * Real API integration for Stock Manager Dashboard
 */
import { API_BASE_URL } from '../config/apiBase';

function getAuthHeaders(): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : { 'Content-Type': 'application/json' };
}

const API_BASE = API_BASE_URL;

// Dashboard
export async function fetchStockDashboard() {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/dashboard`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Stock Items
export async function fetchStockItems(params?: {
  category?: string;
  status?: string;
  search?: string;
  supplier?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
  }
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/items?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchStockItem(itemId: number) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/items/${itemId}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createStockItem(itemData: any) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(itemData)
  });
  return response.json();
}

export async function updateStockItem(itemId: number, itemData: any) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/items/${itemId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(itemData)
  });
  return response.json();
}

export async function deleteStockItem(itemId: number) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/items/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Stock Transactions
export async function fetchStockTransactions(params?: {
  item_id?: number;
  transaction_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
  }
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/transactions?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createStockTransaction(transactionData: {
  item_id: number;
  transaction_type: string;
  quantity: number;
  unit_price?: number;
  issued_to?: number;
  notes?: string;
  transaction_date?: string;
}) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(transactionData)
  });
  return response.json();
}

export async function adjustStock(itemId: number, adjustment: {
  adjustment_type: 'in' | 'out';
  quantity: number;
  reason?: string;
}) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/items/${itemId}/adjust`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(adjustment)
  });
  return response.json();
}

// Suppliers
export async function fetchSuppliers(params?: { search?: string; is_active?: boolean }) {
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.search) queryParams.append('search', params.search);
    if (params.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
  }
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/suppliers?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createSupplier(supplierData: {
  supplier_code: string;
  supplier_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_number?: string;
  payment_terms?: string;
  notes?: string;
}) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/suppliers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(supplierData)
  });
  return response.json();
}

export async function updateSupplier(supplierId: number, supplierData: any) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/suppliers/${supplierId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(supplierData)
  });
  return response.json();
}

export async function deleteSupplier(supplierId: number) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/suppliers/${supplierId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Categories
export async function fetchCategories() {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/categories`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createCategory(categoryData: {
  category_code: string;
  category_name: string;
  description?: string;
  parent_category_id?: number;
}) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData)
  });
  return response.json();
}

// Locations
export async function fetchLocations() {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/locations`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createLocation(locationData: {
  location_code: string;
  location_name: string;
  description?: string;
}) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/locations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(locationData)
  });
  return response.json();
}

// Alerts
export async function fetchAlerts(params?: {
  is_resolved?: boolean;
  alert_type?: string;
  severity?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
  }
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/alerts?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function resolveAlert(alertId: number) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/alerts/${alertId}/resolve`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Purchase Orders
export async function fetchPurchaseOrders(params?: { status?: string; supplier_id?: number }) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
  }
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/purchase-orders?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createPurchaseOrder(orderData: {
  supplier_id: number;
  expected_delivery_date?: string;
  items: Array<{
    item_id: number;
    quantity: number;
    unit_price: number;
  }>;
  notes?: string;
}) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/purchase-orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData)
  });
  return response.json();
}

export async function updatePurchaseOrderStatus(orderId: number, status: string) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/purchase-orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  return response.json();
}

// Stock Takes
export async function fetchStockTakes(params?: { status?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/stock-takes?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createStockTake(stockTakeData: {
  location_id?: number;
  notes?: string;
}) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/stock-takes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(stockTakeData)
  });
  return response.json();
}

export async function completeStockTake(stockTakeId: number) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/stock-takes/${stockTakeId}/complete`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function updateStockTakeItem(itemId: number, countedQuantity: number, varianceReason?: string) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/stock-take-items/${itemId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ counted_quantity: countedQuantity, variance_reason: varianceReason })
  });
  return response.json();
}

// Analytics
export async function fetchStockAnalytics(period: 'week' | 'month' | 'year' = 'month') {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/analytics?period=${period}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Reports
export async function generateStockReport(reportType: string, params: any) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/reports/${reportType}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params)
  });
  return response.json();
}

export async function exportStockData(format: 'excel' | 'pdf' | 'csv' = 'excel') {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/export?format=${format}`, {
    headers: getAuthHeaders()
  });
  return response.blob();
}

// Search
export async function searchStockItems(query: string) {
  const response = await fetch(`${API_BASE}/stock-ultra-advanced/search?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}
