import { API_BASE_URL } from '@/app/config/apiBase';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ===================== ULTRA ADVANCED STOCK MANAGEMENT API =====================
// Using /api/stock-ultra-advanced endpoints

export const ultraStockApi = {
  // ==================== DASHBOARD ====================
  getDashboard: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/dashboard`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // ==================== ITEMS ====================
  getItems: async (params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    search?: string; 
    lowStock?: boolean;
    location?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.category) queryParams.set('category', params.category);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.lowStock) queryParams.set('lowStock', 'true');
    if (params?.location) queryParams.set('location', params.location);

    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/items?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getItem: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/items/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createItem: async (data: {
    item_code: string;
    item_name: string;
    category: string;
    quantity: number;
    unit: string;
    unit_price: number;
    reorder_level: number;
    supplier_id?: number;
    location?: string;
    description?: string;
    expiry_date?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateItem: async (id: number, data: Partial<{
    item_name: string;
    category: string;
    quantity: number;
    unit: string;
    unit_price: number;
    reorder_level: number;
    supplier_id: number;
    location: string;
    description: string;
    expiry_date: string;
    is_active: boolean;
  }>) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/items/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteItem: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // ==================== TRANSACTIONS ====================
  getTransactions: async (params?: {
    item_id?: number;
    transaction_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.item_id) queryParams.set('item_id', params.item_id.toString());
    if (params?.transaction_type) queryParams.set('transaction_type', params.transaction_type);
    if (params?.start_date) queryParams.set('start_date', params.start_date);
    if (params?.end_date) queryParams.set('end_date', params.end_date);
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/transactions?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createTransaction: async (data: {
    item_id: number;
    transaction_type: string;
    quantity: number;
    unit_price?: number;
    reference_number?: string;
    notes?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ==================== ANALYTICS ====================
  getAnalytics: async (period: string = 'month') => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/analytics?period=${period}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getValuation: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/valuation`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // ==================== SUPPLIERS ====================
  getSuppliers: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/suppliers`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createSupplier: async (data: {
    supplier_code: string;
    supplier_name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/suppliers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateSupplier: async (id: number, data: Partial<{
    supplier_name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    is_active: boolean;
  }>) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/suppliers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteSupplier: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/suppliers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // ==================== CATEGORIES ====================
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/categories`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createCategory: async (data: { category_name: string; description?: string }) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ==================== LOCATIONS ====================
  getLocations: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/locations`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createLocation: async (data: { location_code: string; location_name: string; description?: string }) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/locations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ==================== ALERTS ====================
  getAlerts: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/alerts`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  resolveAlert: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/alerts/${id}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // ==================== PURCHASE ORDERS ====================
  getPurchaseOrders: async (params?: { status?: string; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.page) queryParams.set('page', params.page.toString());

    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/purchase-orders?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createPurchaseOrder: async (data: {
    supplier_id: number;
    items: Array<{ item_id: number; quantity: number; unit_price: number }>;
    expected_delivery?: string;
    notes?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/purchase-orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updatePurchaseOrderStatus: async (id: number, status: string) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/purchase-orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // ==================== STOCK TAKES ====================
  getStockTakes: async (status?: string) => {
    const queryParams = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/stock-takes${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createStockTake: async (data: { location_id?: number; notes?: string }) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/stock-takes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  completeStockTake: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/stock-ultra-advanced/stock-takes/${id}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};

// Helper functions
export const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string) => 
  new Date(date).toLocaleDateString('rw-RW');

export const formatDateTime = (date: string) => 
  new Date(date).toLocaleString('rw-RW');

export const getStockStatus = (item: { quantity: number; reorder_level: number }) => {
  if (item.quantity === 0) return { label: 'Out of Stock', color: 'destructive' };
  if (item.quantity <= item.reorder_level) return { label: 'Low Stock', color: 'warning' };
  return { label: 'In Stock', color: 'success' };
};

export const getTransactionTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'purchase': 'Purchase',
    'receive': 'Receive',
    'issue': 'Issue/Distribution',
    'sale': 'Sale',
    'return': 'Return',
    'adjustment': 'Adjustment',
    'stock_in': 'Stock In',
    'stock_out': 'Stock Out',
    'initial': 'Initial Stock',
    'damaged': 'Damaged',
    'lost': 'Lost',
  };
  return labels[type] || type;
};
