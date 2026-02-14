import { API_BASE_URL } from '@/app/config/apiBase';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ===================== STOCK MANAGEMENT API SERVICE =====================
// Using existing /api/stock-advanced endpoints

export const stockApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/stats`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Get all stock items
  getItems: async (params?: { page?: number; limit?: number; category?: string; search?: string; low_stock?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.category) queryParams.set('category', params.category);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.low_stock) queryParams.set('lowStock', 'true');

    const res = await fetch(`${API_BASE_URL}/stock-advanced/inventory?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Get single stock item
  getItem: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/inventory/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Create stock item
  createItem: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/inventory`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Update stock item
  updateItem: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/inventory/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Adjust stock quantity
  adjustStock: async (id: number, data: { adjustment_type: string; quantity: number; reason?: string }) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/inventory/${id}/adjust`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Delete stock item
  deleteItem: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/inventory/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Get stock movements
  getMovements: async (params?: { item_id?: number; movement_type?: string; start_date?: string; end_date?: string; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.item_id) queryParams.set('item_id', params.item_id.toString());
    if (params?.movement_type) queryParams.set('movement_type', params.movement_type);
    if (params?.start_date) queryParams.set('start_date', params.start_date);
    if (params?.end_date) queryParams.set('end_date', params.end_date);
    if (params?.page) queryParams.set('page', params.page.toString());

    const res = await fetch(`${API_BASE_URL}/stock-advanced/movements?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Create stock movement
  createMovement: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/movements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Get suppliers
  getSuppliers: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/suppliers`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Create supplier
  createSupplier: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/suppliers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Update supplier
  updateSupplier: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/suppliers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Get purchase orders
  getOrders: async (params?: { status?: string; supplier_id?: number; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.supplier_id) queryParams.set('supplier_id', params.supplier_id.toString());
    if (params?.page) queryParams.set('page', params.page.toString());

    const res = await fetch(`${API_BASE_URL}/stock-advanced/orders?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Create purchase order
  createOrder: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Receive purchase order
  receiveOrder: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/orders/${id}/receive`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Get categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/categories`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Get stock alerts
  getAlerts: async () => {
    const res = await fetch(`${API_BASE_URL}/stock-advanced/alerts`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Get stock report
  getStockReport: async (params?: { category?: string; low_stock?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.low_stock) queryParams.set('low_stock', 'true');

    const res = await fetch(`${API_BASE_URL}/stock-advanced/reports/stock?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Get movement report
  getMovementReport: async (params?: { start_date?: string; end_date?: string; movement_type?: string; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.set('start_date', params.start_date);
    if (params?.end_date) queryParams.set('end_date', params.end_date);
    if (params?.movement_type) queryParams.set('movement_type', params.movement_type);
    if (params?.category) queryParams.set('category', params.category);

    const res = await fetch(`${API_BASE_URL}/stock-advanced/reports/movements?${queryParams}`, {
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

export const getStockStatus = (item: any) => {
  if (item.quantity === 0) return { label: 'Nta byafite', color: 'destructive' };
  if (item.quantity <= item.reorder_level) return { label: 'Byo hagati', color: 'warning' };
  return { label: 'Birihagije', color: 'success' };
};
