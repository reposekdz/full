import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, AlertTriangle, Plus, Search, Edit, Trash2, Truck, DollarSign, 
  RefreshCw, BarChart3, Eye, X, CheckCircle, XCircle, Clock, FileText, 
  Users, Warehouse, ShoppingCart, ArrowUpRight, ArrowDownRight, PieChart, 
  Activity, AlertCircle, ChevronLeft, ChevronRight, Layers, Save, Check, 
  Download, Upload, Printer, Mail, Bell, Settings, Home, Box, ArrowRight, 
  Zap, Grid3X3, List, BellOff, Filter, MoreHorizontal, RotateCcw, 
  TrendingUp, TrendingDown, Calculator, Calendar, CreditCard, BoxIcon,
  Archive, Inbox, Send, GripVertical, Star, Tag, Barcode, ScanLine,
  SearchCheck, FileSpreadsheet, FilterIcon, LayoutGrid, Table as TableIcon,
  ChevronDown, Building2, MapPin, Phone, Globe, UserCheck, PackageCheck,
  PackagePlus, PackageMinus, ArrowLeftRight, History, CreditCardIcon,
  PrinterIcon, SaveIcon, TrashIcon, EditIcon, ViewIcon, PlusIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { ultraStockApi, formatCurrency, formatDate, formatDateTime, getTransactionTypeLabel } from '../../services/ultraStockApi';

// Types
interface StockItem {
  id: number;
  item_code: string;
  item_name: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  reorder_level: number;
  supplier_id?: number;
  supplier_name?: string;
  location?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Supplier {
  id: number;
  supplier_code: string;
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  rating?: number;
  total_orders?: number;
  total_value?: number;
  created_at?: string;
}

interface Transaction {
  id: number;
  item_id: number;
  item_name?: string;
  item_code?: string;
  transaction_type: string;
  quantity: number;
  unit_price?: number;
  total_amount?: number;
  reference_number?: string;
  notes?: string;
  performed_by?: number;
  performed_by_name?: string;
  transaction_date: string;
}

interface Alert {
  id: number;
  item_id: number;
  item_name: string;
  item_code: string;
  category: string;
  current_quantity: number;
  reorder_level: number;
  shortage_quantity: number;
  alert_level: string;
  created_at?: string;
}

interface Category {
  id: number;
  category_name: string;
  category_code?: string;
  description?: string;
  item_count?: number;
}

interface Location {
  id: number;
  location_code: string;
  location_name: string;
  description?: string;
  item_count?: number;
}

interface PurchaseOrder {
  id: number;
  order_number: string;
  supplier_id: number;
  supplier_name?: string;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  items_count?: number;
  expected_delivery?: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 15;

export default function StockManagementAdvanced() {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [items, setItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showEditSupplier, setShowEditSupplier] = useState(false);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);
  
  // Form states
  const [itemForm, setItemForm] = useState({
    item_code: '', item_name: '', category: '', description: '',
    unit: 'pcs', quantity: 0, unit_price: 0, reorder_level: 10,
    supplier_id: '', location: '', expiry_date: ''
  });
  
  const [supplierForm, setSupplierForm] = useState({
    supplier_code: '', supplier_name: '', contact_person: '', phone: '', email: '', address: ''
  });
  
  const [categoryForm, setCategoryForm] = useState({ category_name: '', description: '' });
  
  const [transactionForm, setTransactionForm] = useState({
    item_id: '', transaction_type: 'purchase', quantity: 1, unit_price: 0,
    reference_number: '', notes: ''
  });

  // Fetch all data
  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      
      const [itemsRes, transRes, suppRes, catRes, locRes, alertsRes, ordersRes, dashRes, analyticsRes] = await Promise.all([
        ultraStockApi.getItems({ limit: 200 }),
        ultraStockApi.getTransactions({ limit: 100 }),
        ultraStockApi.getSuppliers(),
        ultraStockApi.getCategories(),
        ultraStockApi.getLocations(),
        ultraStockApi.getAlerts(),
        ultraStockApi.getPurchaseOrders(),
        ultraStockApi.getDashboard(),
        ultraStockApi.getAnalytics('month')
      ]);
      
      if (itemsRes.success) setItems(itemsRes.items || []);
      if (transRes.success) setTransactions(transRes.transactions || []);
      if (suppRes.success) setSuppliers(suppRes.suppliers || []);
      if (catRes.success) setCategories(catRes.categories || []);
      if (locRes.success) setLocations(locRes.locations || []);
      if (alertsRes.success) setAlerts(alertsRes.alerts || []);
      if (ordersRes.success) setPurchaseOrders(ordersRes.orders || []);
      if (dashRes.success) setDashboardStats(dashRes);
      if (analyticsRes.success) setAnalytics(analyticsRes);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  useEffect(() => { fetchData(); }, [fetchData]);
  
  // Advanced filtering and sorting
  const processedItems = useMemo(() => {
    let result = [...items];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.item_name?.toLowerCase().includes(query) ||
        item.item_code?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.supplier_name?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => {
        if (statusFilter === 'out_of_stock') return item.quantity === 0;
        if (statusFilter === 'low_stock') return item.quantity > 0 && item.quantity <= item.reorder_level;
        if (statusFilter === 'in_stock') return item.quantity > item.reorder_level;
        return true;
      });
    }
    
    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter(item => item.location === locationFilter);
    }
    
    // Supplier filter
    if (supplierFilter !== 'all') {
      result = result.filter(item => item.supplier_id?.toString() === supplierFilter);
    }
    
    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name': comparison = (a.item_name || '').localeCompare(b.item_name || ''); break;
        case 'code': comparison = (a.item_code || '').localeCompare(b.item_code || ''); break;
        case 'quantity': comparison = (a.quantity || 0) - (b.quantity || 0); break;
        case 'price': comparison = (a.unit_price || 0) - (b.unit_price || 0); break;
        case 'category': comparison = (a.category || '').localeCompare(b.category || ''); break;
        case 'updated': comparison = new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(); break;
        default: comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [items, searchQuery, categoryFilter, statusFilter, locationFilter, supplierFilter, sortBy, sortOrder]);
  
  // Pagination
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [processedItems, currentPage]);
  
  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  
  // Stats calculation
  const stats = useMemo(() => {
    const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
    const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.reorder_level).length;
    const outOfStock = items.filter(i => i.quantity === 0).length;
    const inStock = items.filter(i => i.quantity > i.reorder_level).length;
    const totalItems = items.length;
    
    return { totalValue, lowStock, outOfStock, inStock, totalItems };
  }, [items]);

  // Handlers
  const handleAddItem = async () => {
    try {
      setSubmitting(true);
      const result = await ultraStockApi.createItem({
        ...itemForm,
        supplier_id: itemForm.supplier_id ? parseInt(itemForm.supplier_id) : undefined,
        quantity: parseInt(itemForm.quantity.toString()) || 0,
        unit_price: parseFloat(itemForm.unit_price.toString()) || 0,
        reorder_level: parseInt(itemForm.reorder_level.toString()) || 10
      });
      if (result.success) {
        setShowAddItem(false);
        setItemForm({ item_code: '', item_name: '', category: '', description: '', unit: 'pcs', quantity: 0, unit_price: 0, reorder_level: 10, supplier_id: '', location: '', expiry_date: '' });
        fetchData(true);
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };
  
  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    try {
      setSubmitting(true);
      const result = await ultraStockApi.updateItem(selectedItem.id, {
        item_name: selectedItem.item_name, category: selectedItem.category,
        quantity: selectedItem.quantity, unit: selectedItem.unit, unit_price: selectedItem.unit_price,
        reorder_level: selectedItem.reorder_level, location: selectedItem.location, description: selectedItem.description
      });
      if (result.success) { setShowEditItem(false); setSelectedItem(null); fetchData(true); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };
  
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      setSubmitting(true);
      const result = await ultraStockApi.deleteItem(itemToDelete.id);
      if (result.success) { setShowDeleteConfirm(false); setItemToDelete(null); fetchData(true); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };
  
  const handleAddSupplier = async () => {
    try {
      setSubmitting(true);
      const result = await ultraStockApi.createSupplier(supplierForm);
      if (result.success) { setShowAddSupplier(false); setSupplierForm({ supplier_code: '', supplier_name: '', contact_person: '', phone: '', email: '', address: '' }); fetchData(true); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };
  
  const handleAddCategory = async () => {
    try {
      setSubmitting(true);
      const result = await ultraStockApi.createCategory(categoryForm);
      if (result.success) { setShowAddCategory(false); setCategoryForm({ category_name: '', description: '' }); fetchData(true); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };
  
  const handleAddTransaction = async () => {
    try {
      setSubmitting(true);
      const result = await ultraStockApi.createTransaction({
        item_id: parseInt(transactionForm.item_id),
        transaction_type: transactionForm.transaction_type,
        quantity: parseInt(transactionForm.quantity.toString()),
        unit_price: parseFloat(transactionForm.unit_price.toString()) || undefined,
        reference_number: transactionForm.reference_number || undefined,
        notes: transactionForm.notes || undefined
      });
      if (result.success) { setShowAddTransaction(false); setTransactionForm({ item_id: '', transaction_type: 'purchase', quantity: 1, unit_price: 0, reference_number: '', notes: '' }); fetchData(true); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setLocationFilter('all');
    setSupplierFilter('all');
    setCurrentPage(1);
  };

  const getBadgeVariant = (item: StockItem): "default" | "secondary" | "destructive" | "outline" => {
    if (item.quantity === 0) return "destructive";
    if (item.quantity <= item.reorder_level) return "secondary";
    return "default";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Package className="h-16 w-16 text-blue-400 animate-pulse" />
            <div className="absolute inset-0 bg-blue-400/20 animate-ping rounded-full" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Loading Stock Management</h2>
            <p className="text-slate-400">Fetching data from database...</p>
          </div>
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Package className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Stock Management
                <Badge variant="outline" className="ml-2 text-white border-white/30">Advanced</Badge>
              </h1>
              <p className="text-slate-400 mt-1">Complete inventory control with real-time analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">Database Connected</span>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => fetchData(true)} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30" onClick={() => setShowAddItem(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'Total Items', value: stats.totalItems, icon: Package, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
            { title: 'Total Value', value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'green', gradient: 'from-green-500 to-green-600' },
            { title: 'In Stock', value: stats.inStock, icon: CheckCircle, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
            { title: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'amber', gradient: 'from-amber-500 to-amber-600' },
            { title: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: 'red', gradient: 'from-red-500 to-red-600' },
            { title: 'Categories', value: categories.length, icon: Layers, color: 'violet', gradient: 'from-violet-500 to-violet-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className={`bg-gradient-to-br ${stat.gradient} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className="h-10 w-10 opacity-80" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-2">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="dashboard" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" />Dashboard</TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2"><Package className="h-4 w-4" />Inventory</TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" />Movements</TabsTrigger>
              <TabsTrigger value="suppliers" className="flex items-center gap-2"><Truck className="h-4 w-4" />Suppliers</TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" />Orders</TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />Alerts
                {alerts.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{alerts.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Reports</TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" />Inventory Overview</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.slice(0, 8).map((cat, idx) => {
                      const catItems = items.filter(i => i.category === cat.category_name);
                      const catValue = catItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
                      return (
                        <div key={cat.id} className="p-4 bg-slate-50 rounded-xl border">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'amber', 'red', 'violet', 'cyan', 'pink', 'orange'][idx % 8]}-500`} />
                            <span className="font-medium text-sm truncate">{cat.category_name}</span>
                          </div>
                          <p className="text-2xl font-bold">{catItems.length}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(catValue)}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" />Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-12" onClick={() => setShowAddItem(true)}>
                    <PackagePlus className="h-5 w-5 mr-3 text-blue-500" />Add New Item
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12" onClick={() => setShowAddTransaction(true)}>
                    <ArrowRight className="h-5 w-5 mr-3 text-green-500" />Record Transaction
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12" onClick={() => setShowAddSupplier(true)}>
                    <UserCheck className="h-5 w-5 mr-3 text-purple-500" />Add Supplier
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12" onClick={() => setActiveTab('reports')}>
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-amber-500" />Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Low Stock Items</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.filter(i => i.quantity > 0 && i.quantity <= i.reorder_level).slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div>
                          <p className="font-medium">{item.item_name}</p>
                          <p className="text-xs text-slate-500">{item.item_code}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600">{item.quantity} {item.unit}</p>
                          <p className="text-xs text-slate-500">Min: {item.reorder_level}</p>
                        </div>
                      </div>
                    ))}
                    {items.filter(i => i.quantity > 0 && i.quantity <= i.reorder_level).length === 0 && (
                      <p className="text-center text-slate-500 py-4">No low stock items</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-blue-500" />Recent Transactions</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm font-medium text-slate-500">Date</th>
                          <th className="text-left p-3 text-sm font-medium text-slate-500">Item</th>
                          <th className="text-left p-3 text-sm font-medium text-slate-500">Type</th>
                          <th className="text-right p-3 text-sm font-medium text-slate-500">Qty</th>
                          <th className="text-right p-3 text-sm font-medium text-slate-500">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 8).map((tx) => (
                          <tr key={tx.id} className="border-b hover:bg-slate-50">
                            <td className="p-3 text-sm">{formatDateTime(tx.transaction_date)}</td>
                            <td className="p-3"><p className="font-medium">{tx.item_name || `Item #${tx.item_id}`}</p><p className="text-xs text-slate-500">{tx.item_code}</p></td>
                            <td className="p-3"><Badge variant={tx.transaction_type === 'purchase' || tx.transaction_type === 'receive' ? 'default' : 'destructive'}>{getTransactionTypeLabel(tx.transaction_type)}</Badge></td>
                            <td className="p-3 text-right font-medium">{tx.quantity}</td>
                            <td className="p-3 text-right">{formatCurrency(tx.quantity * (tx.unit_price || 0))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Stock Items</CardTitle>
                    <CardDescription>{processedItems.length} items found</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="Search items..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10 w-64" />
                    </div>
                    <Button variant="outline" onClick={() => setShowFilterPanel(!showFilterPanel)} className={showFilterPanel ? 'bg-blue-50' : ''}>
                      <FilterIcon className="h-4 w-4 mr-2" />Filters
                      {(categoryFilter !== 'all' || statusFilter !== 'all' || locationFilter !== 'all' || supplierFilter !== 'all') && <Badge variant="default" className="ml-2">Active</Badge>}
                    </Button>
                    <div className="flex border rounded-md">
                      <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4" /></Button>
                      <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><TableIcon className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
                
                {/* Filter Panel */}
                <AnimatePresence>
                  {showFilterPanel && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
                        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (<SelectItem key={cat.id} value={cat.category_name}>{cat.category_name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="low_stock">Low Stock</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={locationFilter} onValueChange={(v) => { setLocationFilter(v); setCurrentPage(1); }}>
                          <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {locations.map(loc => (<SelectItem key={loc.id} value={loc.location_name}>{loc.location_name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Select value={supplierFilter} onValueChange={(v) => { setSupplierFilter(v); setCurrentPage(1); }}>
                          <SelectTrigger><SelectValue placeholder="Supplier" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Suppliers</SelectItem>
                            {suppliers.map(sup => (<SelectItem key={sup.id} value={sup.id.toString()}>{sup.supplier_name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="code">Code</SelectItem>
                            <SelectItem value="quantity">Quantity</SelectItem>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                            <SelectItem value="updated">Last Updated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(categoryFilter !== 'all' || statusFilter !== 'all' || locationFilter !== 'all' || supplierFilter !== 'all') && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2 text-red-500">
                          <X className="h-4 w-4 mr-1" />Clear all filters
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardHeader>
              <CardContent>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:grid-cols-5 gap-4">
                    {paginatedItems.map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="border rounded-xl p-4 hover:shadow-xl transition-all bg-white group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{item.item_name}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1"><Barcode className="h-3 w-3" />{item.item_code}</p>
                          </div>
                          <Badge variant={getBadgeVariant(item)} className="shrink-0">{item.quantity === 0 ? 'Out' : item.quantity <= item.reorder_level ? 'Low' : 'OK'}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="font-medium truncate">{item.category}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="font-bold">{item.quantity} {item.unit}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Price</span><span className="font-medium">{formatCurrency(item.unit_price)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Value</span><span className="font-medium">{formatCurrency(item.quantity * item.unit_price)}</span></div>
                          {item.location && <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-medium truncate">{item.location}</span></div>}
                        </div>
                        <Separator className="my-3" />
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="flex-1" onClick={() => { setSelectedItem(item); setShowItemDetails(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="flex-1" onClick={() => { setSelectedItem(item); setShowEditItem(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="flex-1 text-red-500" onClick={() => { setItemToDelete(item); setShowDeleteConfirm(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="text-left p-3 font-medium">Code</th>
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Category</th>
                          <th className="text-left p-3 font-medium">Location</th>
                          <th className="text-right p-3 font-medium">Qty</th>
                          <th className="text-right p-3 font-medium">Unit Price</th>
                          <th className="text-right p-3 font-medium">Total Value</th>
                          <th className="text-center p-3 font-medium">Status</th>
                          <th className="text-center p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-slate-50">
                            <td className="p-3 font-mono text-sm">{item.item_code}</td>
                            <td className="p-3 font-medium">{item.item_name}</td>
                            <td className="p-3"><Badge variant="outline">{item.category}</Badge></td>
                            <td className="p-3 text-sm">{item.location || '-'}</td>
                            <td className="p-3 text-right font-bold">{item.quantity} {item.unit}</td>
                            <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="p-3 text-right font-medium">{formatCurrency(item.quantity * item.unit_price)}</td>
                            <td className="p-3 text-center"><Badge variant={getBadgeVariant(item)}>{item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.reorder_level ? 'Low Stock' : 'In Stock'}</Badge></td>
                            <td className="p-3">
                              <div className="flex gap-1 justify-center">
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setShowItemDetails(true); }}><Eye className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setShowEditItem(true); }}><Edit className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { setItemToDelete(item); setShowDeleteConfirm(true); }}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-slate-500">Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, processedItems.length)} of {processedItems.length} items</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                        <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)}>{page}</Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><ArrowLeftRight className="h-5 w-5" />Stock Movements</CardTitle>
                  <Button onClick={() => setShowAddTransaction(true)}><Plus className="h-4 w-4 mr-2" />Record Transaction</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left p-3">Date & Time</th>
                        <th className="text-left p-3">Item</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-right p-3">Quantity</th>
                        <th className="text-right p-3">Unit Price</th>
                        <th className="text-right p-3">Total</th>
                        <th className="text-left p-3">Reference</th>
                        <th className="text-left p-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 text-sm">{formatDateTime(tx.transaction_date)}</td>
                          <td className="p-3"><p className="font-medium">{tx.item_name || `Item #${tx.item_id}`}</p><p className="text-xs text-slate-500">{tx.item_code}</p></td>
                          <td className="p-3"><Badge variant={tx.transaction_type === 'purchase' || tx.transaction_type === 'receive' ? 'default' : 'destructive'}>{getTransactionTypeLabel(tx.transaction_type)}</Badge></td>
                          <td className="p-3 text-right font-bold">{tx.quantity}</td>
                          <td className="p-3 text-right">{tx.unit_price ? formatCurrency(tx.unit_price) : '-'}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(tx.quantity * (tx.unit_price || 0))}</td>
                          <td className="p-3 text-sm">{tx.reference_number || '-'}</td>
                          <td className="p-3 text-sm text-slate-500 max-w-xs truncate">{tx.notes || '-'}</td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (<tr><td colSpan={8} className="p-8 text-center text-slate-500">No transactions found</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />Supplier Management</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddCategory(true)}><Layers className="h-4 w-4 mr-2" />Categories</Button>
                    <Button onClick={() => setShowAddSupplier(true)}><Plus className="h-4 w-4 mr-2" />Add Supplier</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {suppliers.map((supplier) => (
                    <motion.div key={supplier.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border rounded-xl p-5 hover:shadow-xl transition-all bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {supplier.supplier_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{supplier.supplier_name}</h3>
                            <p className="text-xs text-slate-500">{supplier.supplier_code}</p>
                          </div>
                        </div>
                        <Badge variant={supplier.is_active ? 'default' : 'secondary'}>{supplier.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        {supplier.contact_person && <div className="flex items-center gap-2 text-slate-600"><UserCheck className="h-4 w-4 text-slate-400" />{supplier.contact_person}</div>}
                        {supplier.phone && <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400" />{supplier.phone}</div>}
                        {supplier.email && <div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{supplier.email}</div>}
                        {supplier.address && <div className="flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" />{supplier.address}</div>}
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedSupplier(supplier); setShowSupplierDetails(true); }}>Details</Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedSupplier(supplier); setShowEditSupplier(true); }}>Edit</Button>
                      </div>
                    </motion.div>
                  ))}
                  {suppliers.length === 0 && (
                    <div className="col-span-full p-12 text-center">
                      <Truck className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 text-lg">No suppliers found</p>
                      <p className="text-slate-400 text-sm">Add your first supplier to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left p-3">Order #</th>
                        <th className="text-left p-3">Supplier</th>
                        <th className="text-center p-3">Status</th>
                        <th className="text-right p-3">Total Amount</th>
                        <th className="text-left p-3">Expected Delivery</th>
                        <th className="text-left p-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 font-mono font-medium">{order.order_number}</td>
                          <td className="p-3">{order.supplier_name || `Supplier #${order.supplier_id}`}</td>
                          <td className="p-3 text-center">
                            <Badge variant={order.status === 'received' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right font-bold">{formatCurrency(order.total_amount)}</td>
                          <td className="p-3">{order.expected_delivery ? formatDate(order.expected_delivery) : '-'}</td>
                          <td className="p-3 text-sm">{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                      {purchaseOrders.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-slate-500">No purchase orders found</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {alerts.map((alert) => (
                    <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-5 border rounded-xl bg-white">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${alert.alert_level === 'critical' ? 'bg-red-100' : 'bg-amber-100'}`}>
                          <AlertTriangle className={`h-6 w-6 ${alert.alert_level === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{alert.item_name}</h3>
                          <p className="text-sm text-slate-500">{alert.item_code} • {alert.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{alert.current_quantity} <span className="text-sm font-normal text-slate-500">/ {alert.reorder_level}</span></p>
                        <p className="text-sm text-slate-500">Current / Reorder Level</p>
                        <p className="text-xs text-red-500 mt-1">Need {alert.reorder_level - alert.current_quantity} more</p>
                      </div>
                    </motion.div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="p-12 text-center">
                      <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                      <p className="text-xl font-semibold">All Clear!</p>
                      <p className="text-slate-500">No stock alerts at this time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Inventory Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between p-4 bg-slate-50 rounded-xl"><span className="text-slate-600">Total Items</span><span className="font-bold text-xl">{stats.totalItems}</span></div>
                    <div className="flex justify-between p-4 bg-green-50 rounded-xl"><span className="text-green-700">Total Value</span><span className="font-bold text-xl text-green-600">{formatCurrency(stats.totalValue)}</span></div>
                    <div className="flex justify-between p-4 bg-blue-50 rounded-xl"><span className="text-blue-700">In Stock</span><span className="font-bold text-xl text-blue-600">{stats.inStock}</span></div>
                    <div className="flex justify-between p-4 bg-amber-50 rounded-xl"><span className="text-amber-700">Low Stock</span><span className="font-bold text-xl text-amber-600">{stats.lowStock}</span></div>
                    <div className="flex justify-between p-4 bg-red-50 rounded-xl"><span className="text-red-700">Out of Stock</span><span className="font-bold text-xl text-red-600">{stats.outOfStock}</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Category Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map((cat, idx) => {
                      const catItems = items.filter(i => i.category === cat.category_name);
                      const catValue = catItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
                      const percentage = stats.totalValue > 0 ? (catValue / stats.totalValue) * 100 : 0;
                      return (
                        <div key={cat.id}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{cat.category_name}</span>
                            <span className="text-slate-500">{catItems.length} items ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: idx * 0.1 }} className={`h-full bg-gradient-to-r from-${['blue', 'green', 'amber', 'red', 'violet', 'cyan', 'pink', 'orange'][idx % 8]}-500 to-${['blue', 'green', 'amber', 'red', 'violet', 'cyan', 'pink', 'orange'][idx % 8]}-400`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><PackagePlus className="h-5 w-5 text-blue-500" />Add New Stock Item</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            <div><Label>Item Code *</Label><Input value={itemForm.item_code} onChange={(e) => setItemForm({...itemForm, item_code: e.target.value})} placeholder="e.g., ITM-001" /></div>
            <div className="md:col-span-2"><Label>Item Name *</Label><Input value={itemForm.item_name} onChange={(e) => setItemForm({...itemForm, item_name: e.target.value})} placeholder="Full item name" className="w-full" /></div>
            <div><Label>Category *</Label>
              <Select value={itemForm.category} onValueChange={(v) => setItemForm({...itemForm, category: v})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.category_name}>{cat.category_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label>Unit</Label>
              <Select value={itemForm.unit} onValueChange={(v) => setItemForm({...itemForm, unit: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">Pieces</SelectItem><SelectItem value="kg">Kilograms</SelectItem><SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem><SelectItem value="packs">Packs</SelectItem><SelectItem value="meters">Meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Location</Label>
              <Select value={itemForm.location} onValueChange={(v) => setItemForm({...itemForm, location: v})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{locations.map(loc => (<SelectItem key={loc.id} value={loc.location_name}>{loc.location_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label>Quantity</Label><Input type="number" value={itemForm.quantity} onChange={(e) => setItemForm({...itemForm, quantity: parseInt(e.target.value) || 0})} /></div>
            <div><Label>Unit Price (RWF)</Label><Input type="number" value={itemForm.unit_price} onChange={(e) => setItemForm({...itemForm, unit_price: parseFloat(e.target.value) || 0})} /></div>
            <div><Label>Reorder Level</Label><Input type="number" value={itemForm.reorder_level} onChange={(e) => setItemForm({...itemForm, reorder_level: parseInt(e.target.value) || 0})} /></div>
            <div><Label>Supplier</Label>
              <Select value={itemForm.supplier_id} onValueChange={(v) => setItemForm({...itemForm, supplier_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{suppliers.map(sup => (<SelectItem key={sup.id} value={sup.id.toString()}>{sup.supplier_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label>Expiry Date</Label><Input type="date" value={itemForm.expiry_date} onChange={(e) => setItemForm({...itemForm, expiry_date: e.target.value})} /></div>
            <div className="md:col-span-3"><Label>Description</Label><Textarea value={itemForm.description} onChange={(e) => setItemForm({...itemForm, description: e.target.value})} placeholder="Item description..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={submitting}>{submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditItem} onOpenChange={setShowEditItem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Stock Item</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div><Label>Item Code</Label><Input value={selectedItem.item_code} disabled /></div>
              <div><Label>Item Name</Label><Input value={selectedItem.item_name} onChange={(e) => setSelectedItem({...selectedItem, item_name: e.target.value})} /></div>
              <div><Label>Category</Label>
                <Select value={selectedItem.category} onValueChange={(v) => setSelectedItem({...selectedItem, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.category_name}>{cat.category_name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantity</Label><Input type="number" value={selectedItem.quantity} onChange={(e) => setSelectedItem({...selectedItem, quantity: parseInt(e.target.value) || 0})} /></div>
              <div><Label>Unit Price</Label><Input type="number" value={selectedItem.unit_price} onChange={(e) => setSelectedItem({...selectedItem, unit_price: parseFloat(e.target.value) || 0})} /></div>
              <div><Label>Reorder Level</Label><Input type="number" value={selectedItem.reorder_level} onChange={(e) => setSelectedItem({...selectedItem, reorder_level: parseInt(e.target.value) || 0})} /></div>
              <div><Label>Location</Label><Input value={selectedItem.location || ''} onChange={(e) => setSelectedItem({...selectedItem, location: e.target.value})} /></div>
              <div><Label>Unit</Label><Input value={selectedItem.unit} onChange={(e) => setSelectedItem({...selectedItem, unit: e.target.value})} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditItem(false)}>Cancel</Button>
            <Button onClick={handleUpdateItem} disabled={submitting}>{submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-purple-500" />Add New Supplier</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Supplier Code *</Label><Input value={supplierForm.supplier_code} onChange={(e) => setSupplierForm({...supplierForm, supplier_code: e.target.value})} placeholder="e.g., SUP-001" /></div>
            <div><Label>Supplier Name *</Label><Input value={supplierForm.supplier_name} onChange={(e) => setSupplierForm({...supplierForm, supplier_name: e.target.value})} placeholder="Company name" /></div>
            <div><Label>Contact Person</Label><Input value={supplierForm.contact_person} onChange={(e) => setSupplierForm({...supplierForm, contact_person: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={supplierForm.phone} onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})} /></div>
              <div><Label>Email</Label><Input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})} /></div>
            </div>
            <div><Label>Address</Label><Textarea value={supplierForm.address} onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSupplier(false)}>Cancel</Button>
            <Button onClick={handleAddSupplier} disabled={submitting}>{submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-violet-500" />Add New Category</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Category Name *</Label><Input value={categoryForm.category_name} onChange={(e) => setCategoryForm({...categoryForm, category_name: e.target.value})} placeholder="Category name" /></div>
            <div><Label>Description</Label><Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCategory(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} disabled={submitting}>{submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowRight className="h-5 w-5 text-green-500" />Record Transaction</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Item *</Label>
              <Select value={transactionForm.item_id} onValueChange={(v) => { const item = items.find(i => i.id.toString() === v); setTransactionForm({ ...transactionForm, item_id: v, unit_price: item?.unit_price || 0 }); }}>
                <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                <SelectContent>{items.map(item => (<SelectItem key={item.id} value={item.id.toString()}>{item.item_name} ({item.quantity} {item.unit})</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label>Transaction Type *</Label>
              <Select value={transactionForm.transaction_type} onValueChange={(v) => setTransactionForm({...transactionForm, transaction_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem><SelectItem value="receive">Receive</SelectItem>
                  <SelectItem value="issue">Issue/Distribution</SelectItem><SelectItem value="return">Return</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem><SelectItem value="damaged">Damaged</SelectItem><SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Quantity *</Label><Input type="number" value={transactionForm.quantity} onChange={(e) => setTransactionForm({...transactionForm, quantity: parseInt(e.target.value) || 0})} /></div>
              <div><Label>Unit Price</Label><Input type="number" value={transactionForm.unit_price} onChange={(e) => setTransactionForm({...transactionForm, unit_price: parseFloat(e.target.value) || 0})} /></div>
            </div>
            <div><Label>Reference Number</Label><Input value={transactionForm.reference_number} onChange={(e) => setTransactionForm({...transactionForm, reference_number: e.target.value})} placeholder="Invoice #, etc." /></div>
            <div><Label>Notes</Label><Textarea value={transactionForm.notes} onChange={(e) => setTransactionForm({...transactionForm, notes: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTransaction(false)}>Cancel</Button>
            <Button onClick={handleAddTransaction} disabled={submitting}>{submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle><DialogDescription>Are you sure you want to delete "{itemToDelete?.item_name}"? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteItem} disabled={submitting}>{submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Details Dialog */}
      <Dialog open={showItemDetails} onOpenChange={setShowItemDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Item Details</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="col-span-2 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                <h3 className="text-2xl font-bold">{selectedItem.item_name}</h3>
                <p className="text-blue-100">{selectedItem.item_code}</p>
              </div>
              <div><Label className="text-slate-500">Category</Label><p className="font-semibold">{selectedItem.category}</p></div>
              <div><Label className="text-slate-500">Status</Label><Badge variant={getBadgeVariant(selectedItem)}>{selectedItem.quantity === 0 ? 'Out of Stock' : selectedItem.quantity <= selectedItem.reorder_level ? 'Low Stock' : 'In Stock'}</Badge></div>
              <div><Label className="text-slate-500">Current Quantity</Label><p className="font-bold text-2xl">{selectedItem.quantity} {selectedItem.unit}</p></div>
              <div><Label className="text-slate-500">Reorder Level</Label><p>{selectedItem.reorder_level} {selectedItem.unit}</p></div>
              <div><Label className="text-slate-500">Unit Price</Label><p className="font-semibold">{formatCurrency(selectedItem.unit_price)}</p></div>
              <div><Label className="text-slate-500">Total Value</Label><p className="font-bold text-green-600 text-xl">{formatCurrency(selectedItem.quantity * selectedItem.unit_price)}</p></div>
              {selectedItem.location && <div><Label className="text-slate-500">Location</Label><p>{selectedItem.location}</p></div>}
              {selectedItem.supplier_name && <div><Label className="text-slate-500">Supplier</Label><p>{selectedItem.supplier_name}</p></div>}
              {selectedItem.expiry_date && <div><Label className="text-slate-500">Expiry Date</Label><p>{formatDate(selectedItem.expiry_date)}</p></div>}
              {selectedItem.description && <div className="col-span-2"><Label className="text-slate-500">Description</Label><p>{selectedItem.description}</p></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDetails(false)}>Close</Button>
            <Button onClick={() => { setShowItemDetails(false); setShowEditItem(true); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Details Dialog */}
      <Dialog open={showSupplierDetails} onOpenChange={setShowSupplierDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Supplier Details</DialogTitle></DialogHeader>
          {selectedSupplier && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {selectedSupplier.supplier_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedSupplier.supplier_name}</h3>
                  <p className="text-slate-500">{selectedSupplier.supplier_code}</p>
                  <Badge variant={selectedSupplier.is_active ? 'default' : 'secondary'}>{selectedSupplier.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selectedSupplier.contact_person && <div><Label className="text-slate-500">Contact Person</Label><p>{selectedSupplier.contact_person}</p></div>}
                {selectedSupplier.phone && <div><Label className="text-slate-500">Phone</Label><p>{selectedSupplier.phone}</p></div>}
                {selectedSupplier.email && <div><Label className="text-slate-500">Email</Label><p>{selectedSupplier.email}</p></div>}
                {selectedSupplier.address && <div><Label className="text-slate-500">Address</Label><p>{selectedSupplier.address}</p></div>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
