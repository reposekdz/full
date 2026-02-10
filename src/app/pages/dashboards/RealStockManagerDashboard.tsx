import { API_BASE_URL } from '@/app/config/apiBase';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, AlertTriangle, ShoppingCart, TrendingUp, Download, Plus, Eye, Edit, Search, 
  Filter, Clock, Users, Truck, Store, ClipboardList, Bell, TrendingDown, ArrowUpRight, 
  ArrowDownRight, BarChart3, PieChart, Activity, RefreshCw, Save, X, Check, Upload,
  FileText, Printer, Send, Calendar, DollarSign, Boxes, Warehouse, TruckIcon,
  Calculator, FileBarChart, Barcode, MapPin, User, Phone, Mail, Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Progress } from '@/app/components/ui/progress';
import LeftSidebar from '@/app/components/LeftSidebar';
import AdvancedMessagingWidget from '@/app/components/AdvancedMessagingWidget';

interface StockManagerDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const StockManagerDashboard: React.FC<StockManagerDashboardProps> = ({ onNavigate, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stockTakes, setStockTakes] = useState<any[]>([]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showStockTakeModal, setShowStockTakeModal] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState<any>(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  
  // Form States
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    item_name: '', item_code: '', category: '', description: '', quantity: 0,
    unit: 'pcs', unit_price: 0, reorder_level: 10, location: '', supplier: '', 
    supplier_contact: '', notes: '', expiry_date: '', barcode: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    item_id: '', transaction_type: 'purchase', quantity: 0, unit_price: 0,
    reference_number: '', issued_to: '', department: '', purpose: '', notes: ''
  });
  const [newSupplier, setNewSupplier] = useState({
    name: '', contact_person: '', phone: '', email: '', address: '', payment_terms: ''
  });
  const [newPurchaseOrder, setNewPurchaseOrder] = useState({
    supplier_id: '', expected_delivery_date: '', notes: '', items: [] as any[]
  });
  const [stockTakeItems, setStockTakeItems] = useState<any[]>([]);
  
  // Real-time updates
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [filterCategory, filterStatus, searchQuery]);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    try {
      const endpoints = [
        fetch(`${API_BASE_URL}/stock/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/stock/items?category=${filterCategory}&status=${filterStatus}&search=${searchQuery}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/stock/transactions?limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/stock/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/inventory-management/suppliers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/inventory-management/purchase-orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/inventory-management/inventory-categories`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/inventory-management/stock-takes`, { headers: { Authorization: `Bearer ${token}` } }),
      ];

      const results = await Promise.all(endpoints);
      const [statsData, itemsData, transactionsData, alertsData, suppliersData, ordersData, categoriesData, stockTakesData] = await Promise.all(results.map(r => r.json()));

      if (statsData.success) {
        setStats(statsData);
        setLowStockItems(statsData.lowStock || []);
      }
      if (itemsData.success) setItems(itemsData.items || []);
      if (transactionsData.success) setTransactions(transactionsData.transactions || []);
      if (alertsData.success) setLowStockItems(alertsData.alerts || []);
      if (suppliersData.success) setSuppliers(suppliersData.suppliers || []);
      if (ordersData.success) setPurchaseOrders(ordersData.orders || []);
      if (categoriesData.success) setCategories(categoriesData.categories || []);
      if (stockTakesData.success) setStockTakes(stockTakesData.stockTakes || []);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('rw-RW');

  // CRUD Operations
  const addItem = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/stock/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newItem)
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewItem({ item_name: '', item_code: '', category: '', description: '', quantity: 0, unit: 'pcs', unit_price: 0, reorder_level: 10, location: '', supplier: '', supplier_contact: '', notes: '', expiry_date: '', barcode: '' });
      loadData();
    }
  };

  const addTransaction = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const res = await fetch(`${API_BASE_URL}/stock/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newTransaction, user_id: userId })
    });
    if (res.ok) {
      setShowTransactionModal(false);
      setNewTransaction({ item_id: '', transaction_type: 'purchase', quantity: 0, unit_price: 0, reference_number: '', issued_to: '', department: '', purpose: '', notes: '' });
      loadData();
    }
  };

  const addSupplier = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/inventory-management/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newSupplier)
    });
    if (res.ok) {
      setShowSupplierModal(false);
      setNewSupplier({ name: '', contact_person: '', phone: '', email: '', address: '', payment_terms: '' });
      loadData();
    }
  };

  const createPurchaseOrder = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/inventory-management/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newPurchaseOrder)
    });
    if (res.ok) {
      setShowPurchaseOrderModal(false);
      setNewPurchaseOrder({ supplier_id: '', expected_delivery_date: '', notes: '', items: [] });
      loadData();
    }
  };

  const updatePurchaseOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/inventory-management/purchase-orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    loadData();
  };

  const conductStockTake = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const res = await fetch(`${API_BASE_URL}/inventory-management/stock-take`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: stockTakeItems, conducted_by: userId, notes: 'Regular stock take' })
    });
    if (res.ok) {
      setShowStockTakeModal(false);
      setStockTakeItems([]);
      loadData();
    }
  };

  const generateReport = (type: string) => {
    // Generate and download report
    let csvContent = 'data:text/csv;charset=utf-8,';
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === 'inventory') {
      headers = ['Item Code', 'Name', 'Category', 'Quantity', 'Unit', 'Unit Price', 'Total Value', 'Location', 'Status'];
      rows = items.map(item => [
        item.item_code, item.item_name, item.category, item.quantity.toString(), item.unit,
        item.unit_price.toString(), (item.quantity * item.unit_price).toString(), item.location,
        item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.reorder_level ? 'Low Stock' : 'In Stock'
      ]);
    } else if (type === 'transactions') {
      headers = ['Date', 'Item', 'Type', 'Quantity', 'Previous Qty', 'New Qty', 'Notes'];
      rows = transactions.map(trans => [
        trans.transaction_date, trans.item_name, trans.transaction_type, trans.quantity.toString(),
        trans.previous_quantity?.toString() || '', trans.new_quantity?.toString() || '', trans.notes || ''
      ]);
    } else if (type === 'valuation') {
      headers = ['Category', 'Item Count', 'Total Quantity', 'Total Value'];
      rows = categories.map(cat => [
        cat.category, cat.item_count.toString(), cat.total_quantity.toString(), cat.total_value.toString()
      ]);
    }

    csvContent += headers.join(',') + '\n';
    rows.forEach(row => csvContent += row.join(',') + '\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-white">
        <LeftSidebar currentPage="stock-manager-dashboard" onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl font-bold text-gray-700">Tegereza...</p>
            <p className="text-gray-500">Gukurikirana ibikoresho</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-white overflow-hidden">
      <AdvancedMessagingWidget />
      <LeftSidebar currentPage="stock-manager-dashboard" onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              <Boxes className="w-10 h-10 text-green-600" />
              Dashbord y'Ibikoresho
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Byavugurujwe: {lastUpdated.toLocaleTimeString('rw-RW')}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={loadData} variant="outline" className="border-2 border-green-200 hover:bg-green-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Subiza
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Ongeraho Ikintu
            </Button>
            <Button onClick={() => setShowReportsModal(true)} variant="outline" className="border-2 border-yellow-200">
              <FileText className="w-4 h-4 mr-2" />
              Raporo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ibintu Byose</p>
                  <p className="text-2xl font-black text-blue-600">{stats?.totals?.total_items || 0}</p>
                </div>
                <Package className="w-10 h-10 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-red-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ibicyeho</p>
                  <p className="text-2xl font-black text-red-600">{stats?.alerts?.low_stock_count || 0}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-orange-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Byarangiye</p>
                  <p className="text-2xl font-black text-orange-600">{stats?.alerts?.out_of_stock_count || 0}</p>
                </div>
                <ShoppingCart className="w-10 h-10 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Agaciro Byose</p>
                  <p className="text-lg font-black text-green-600 truncate">{formatCurrency(stats?.totals?.total_value || 0)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Amagambo</p>
                  <p className="text-2xl font-black text-purple-600">{suppliers.length}</p>
                </div>
                <Truck className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { icon: Plus, label: 'Ikintu Gishya', color: 'bg-green-500', action: () => setShowAddModal(true) },
            { icon: ShoppingCart, label: 'Gura', color: 'bg-blue-500', action: () => { setNewTransaction({ ...newTransaction, transaction_type: 'purchase' }); setShowTransactionModal(true); } },
            { icon: ArrowDownRight, label: 'Gusohotsa', color: 'bg-red-500', action: () => { setNewTransaction({ ...newTransaction, transaction_type: 'issue' }); setShowTransactionModal(true); } },
            { icon: Truck, label: 'Order', color: 'bg-purple-500', action: () => setShowPurchaseOrderModal(true) },
            { icon: Building, label: 'Muganga', color: 'bg-orange-500', action: () => setShowSupplierModal(true) },
            { icon: Calculator, label: 'Stock Take', color: 'bg-teal-500', action: () => setShowStockTakeModal(true) },
          ].map((action, idx) => (
            <Button key={idx} onClick={action.action} className={`${action.color} text-white hover:opacity-90 transition-opacity`}>
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border-2 border-green-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Iboneza</TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Ibikoresho</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Ibikorwa</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Amagambo</TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Abahinzi</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Raporo</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Low Stock Alerts */}
              <Card className="lg:col-span-2 border-2 border-red-200">
                <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Ibintu Bicyeho (Low Stock)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {lowStockItems.slice(0, 10).map((item, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100 hover:border-red-300 cursor-pointer"
                        onClick={() => { setShowItemDetail(item); setNewTransaction({ ...newTransaction, item_id: item.id }); }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
                            <Package className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.item_name}</p>
                            <p className="text-sm text-gray-500">{item.item_code} • {item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-red-600">{item.quantity}/{item.reorder_level}</p>
                          <Badge className="bg-red-100 text-red-700">Bikomeye</Badge>
                        </div>
                      </motion.div>
                    ))}
                    {lowStockItems.length === 0 && <p className="text-gray-500 text-center py-4">Nta bibazo byo kubura ibikoresho</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Categories Summary */}
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-100 to-green-100">
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-yellow-600" />
                    Ibyiciro
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {categories.slice(0, 6).map((cat: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{cat.category}</span>
                          <span className="text-gray-500">{cat.item_count} ibintu</span>
                        </div>
                        <Progress value={(cat.item_count / (stats?.totals?.total_items || 1)) * 100} className="h-2" />
                        <p className="text-xs text-green-600 font-bold mt-1">{formatCurrency(cat.category_value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Ibikorwa Biheruka
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {transactions.slice(0, 8).map((trans, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <Badge className={trans.transaction_type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {trans.transaction_type === 'in' ? '+' : '-'}
                        </Badge>
                        <div>
                          <p className="font-medium text-gray-900">{trans.item_name}</p>
                          <p className="text-xs text-gray-500">{formatDate(trans.transaction_date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{trans.quantity} {trans.unit}</p>
                        <p className="text-xs text-gray-500">{trans.reference_number || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="border-2 border-yellow-200">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-yellow-600" />
                    Ibikoresho Byose
                  </CardTitle>
                  <div className="flex gap-3">
                    <Input placeholder="Shakisha..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64" />
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Icyiciro" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Byose</SelectItem>
                        {categories.map((cat: any) => <SelectItem key={cat.category} value={cat.category}>{cat.category}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                        <th className="text-left p-3 font-bold">Kode</th>
                        <th className="text-left p-3 font-bold">Izina</th>
                        <th className="text-left p-3 font-bold">Icyiciro</th>
                        <th className="text-left p-3 font-bold">Umubare</th>
                        <th className="text-left p-3 font-bold">Aho Biri</th>
                        <th className="text-left p-3 font-bold">Agaciro</th>
                        <th className="text-left p-3 font-bold">Status</th>
                        <th className="text-left p-3 font-bold">Ibikorwa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-yellow-100 hover:bg-yellow-50 cursor-pointer"
                          onClick={() => setShowItemDetail(item)}>
                          <td className="p-3"><Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">{item.item_code}</Badge></td>
                          <td className="p-3 font-medium">{item.item_name}</td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3"><span className="font-bold">{item.quantity}</span> {item.unit}</td>
                          <td className="p-3">{item.location || '-'}</td>
                          <td className="p-3 font-medium">{formatCurrency(item.quantity * item.unit_price)}</td>
                          <td className="p-3">
                            <Badge className={item.quantity === 0 ? 'bg-red-100 text-red-700' : item.quantity <= item.reorder_level ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>
                              {item.quantity === 0 ? 'Byarangiye' : item.quantity <= item.reorder_level ? 'Bicyeho' : 'Birahari'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setNewTransaction({ ...newTransaction, item_id: item.id }); setShowTransactionModal(true); }}>
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setShowItemDetail(item); }}>
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Ibikorwa Byose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                        <th className="text-left p-3 font-bold">Itariki</th>
                        <th className="text-left p-3 font-bold">Ikintu</th>
                        <th className="text-left p-3 font-bold">Ubwoko</th>
                        <th className="text-left p-3 font-bold">Umubare</th>
                        <th className="text-left p-3 font-bold">Before → After</th>
                        <th className="text-left p-3 font-bold">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((trans, idx) => (
                        <tr key={idx} className="border-b border-blue-100 hover:bg-blue-50">
                          <td className="p-3">{formatDate(trans.transaction_date)}</td>
                          <td className="p-3 font-medium">{trans.item_name}</td>
                          <td className="p-3">
                            <Badge className={trans.transaction_type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {trans.transaction_type === 'in' ? 'Kugura' : 'Gusohotsa'}
                            </Badge>
                          </td>
                          <td className="p-3 font-bold">{trans.quantity}</td>
                          <td className="p-3">{trans.previous_quantity} → {trans.new_quantity}</td>
                          <td className="p-3 text-gray-500">{trans.reference_number || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-600" />
                    Amagambo y'Ububikisho
                  </CardTitle>
                  <Button onClick={() => setShowPurchaseOrderModal(true)} className="bg-purple-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Gura
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {purchaseOrders.map((order, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg border-2 border-purple-100 bg-purple-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={order.status === 'received' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}>
                          {order.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(order.order_date)}</span>
                      </div>
                      <p className="font-bold text-gray-900">{order.supplier_name}</p>
                      <p className="text-2xl font-black text-purple-600">{formatCurrency(order.total_amount)}</p>
                      <div className="flex gap-2 mt-3">
                        {order.status === 'pending' && (
                          <Button size="sm" className="flex-1 bg-green-500 text-white" onClick={() => updatePurchaseOrderStatus(order.id, 'received')}>
                            <Check className="w-3 h-3 mr-1" /> Kurondera
                          </Button>
                        )}
                        <Button size="sm" variant="outline"><Eye className="w-3 h-3" /></Button>
                      </div>
                    </motion.div>
                  ))}
                  {purchaseOrders.length === 0 && <p className="col-span-3 text-center text-gray-500 py-8">Nta magambo arimo</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-orange-600" />
                    Abahinzi n'Ababikisho
                  </CardTitle>
                  <Button onClick={() => setShowSupplierModal(true)} className="bg-orange-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Ongeraho
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.map((supplier, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg border-2 border-orange-100 bg-orange-50"
                    >
                      <p className="font-bold text-gray-900">{supplier.name}</p>
                      <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                      <div className="mt-3 space-y-1 text-sm">
                        <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {supplier.phone}</p>
                        <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {supplier.email}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <Badge className="bg-orange-100 text-orange-700">{supplier.total_orders || 0} orders</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Raporo y Ibikoresho', icon: Package, action: () => generateReport('inventory'), color: 'bg-blue-500' },
                { title: 'Raporo y Ibikorwa', icon: Activity, action: () => generateReport('transactions'), color: 'bg-green-500' },
                { title: 'Raporo y Agaciro', icon: TrendingUp, action: () => generateReport('valuation'), color: 'bg-purple-500' },
                { title: 'Stock Take Report', icon: Calculator, action: () => {}, color: 'bg-orange-500' },
              ].map((report, idx) => (
                <Card key={idx} className="border-2 border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={report.action}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full ${report.color} mx-auto mb-4 flex items-center justify-center`}>
                      <report.icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-bold text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-500 mt-2">Kanda kugira ngowshyire muburyo bwo gushyira mu cyapa</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Analytics Summary */}
            <Card className="mt-6 border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  Isesengamenege
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100">
                    <p className="text-sm text-gray-600">Igiciro cy'ibikoresho</p>
                    <p className="text-3xl font-black text-green-600">{formatCurrency(stats?.totals?.total_value || 0)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                    <p className="text-sm text-gray-600">Umubare w'ibintu</p>
                    <p className="text-3xl font-black text-blue-600">{stats?.totals?.total_items || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-100">
                    <p className="text-sm text-gray-600">Bibura</p>
                    <p className="text-3xl font-black text-orange-600">{lowStockItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Add Item Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Ongeraho Ikintu Gishya</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            <div><Label>Izina</Label><Input value={newItem.item_name} onChange={(e) => setNewItem({...newItem, item_name: e.target.value})} /></div>
            <div><Label>Kode</Label><Input value={newItem.item_code} onChange={(e) => setNewItem({...newItem, item_code: e.target.value})} /></div>
            <div><Label>Barcode</Label><Input value={newItem.barcode} onChange={(e) => setNewItem({...newItem, barcode: e.target.value})} /></div>
            <div><Label>Icyiciro</Label>
              <Select value={newItem.category} onValueChange={(v) => setNewItem({...newItem, category: v})}>
                <SelectTrigger><SelectValue placeholder="Hitamo..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Teaching Materials">Teaching Materials</SelectItem>
                  <SelectItem value="Science Equipment">Science Equipment</SelectItem>
                  <SelectItem value="Sports Equipment">Sports Equipment</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Umubare</Label><Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})} /></div>
            <div><Label>Unit</Label>
              <Select value={newItem.unit} onValueChange={(v) => setNewItem({...newItem, unit: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">Pcs</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="meters">Meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Igiciro (RWF)</Label><Input type="number" value={newItem.unit_price} onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value)})} /></div>
            <div><Label>Reorder Level</Label><Input type="number" value={newItem.reorder_level} onChange={(e) => setNewItem({...newItem, reorder_level: parseInt(e.target.value)})} /></div>
            <div><Label>Aho Biri</Label><Input value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={newItem.expiry_date} onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})} /></div>
            <div className="col-span-2 md:col-span-3"><Label>Description</Label><Textarea value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Hagarika</Button>
            <Button onClick={addItem} className="bg-green-500 text-white">Bika</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ongeraho Igikorwa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Ubwoko</Label>
              <Select value={newTransaction.transaction_type} onValueChange={(v) => setNewTransaction({...newTransaction, transaction_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Kugura (Purchase)</SelectItem>
                  <SelectItem value="out">Gusohotsa (Issue)</SelectItem>
                  <SelectItem value="return">Gusubiza (Return)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Umubare</Label><Input type="number" value={newTransaction.quantity} onChange={(e) => setNewTransaction({...newTransaction, quantity: parseInt(e.target.value)})} /></div>
            <div><Label>Igiciro</Label><Input type="number" value={newTransaction.unit_price} onChange={(e) => setNewTransaction({...newTransaction, unit_price: parseFloat(e.target.value)})} /></div>
            <div><Label>Reference</Label><Input value={newTransaction.reference_number} onChange={(e) => setNewTransaction({...newTransaction, reference_number: e.target.value})} /></div>
            <div><Label>Uwakiriye</Label><Input value={newTransaction.issued_to} onChange={(e) => setNewTransaction({...newTransaction, issued_to: e.target.value})} /></div>
            <div><Label>Department</Label><Input value={newTransaction.department} onChange={(e) => setNewTransaction({...newTransaction, department: e.target.value})} /></div>
            <div><Label>Impamvu</Label><Input value={newTransaction.purpose} onChange={(e) => setNewTransaction({...newTransaction, purpose: e.target.value})} /></div>
            <div><Label>Notes</Label><Textarea value={newTransaction.notes} onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionModal(false)}>Hagarika</Button>
            <Button onClick={addTransaction} className="bg-blue-500 text-white">Bika</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Modal */}
      <Dialog open={showSupplierModal} onOpenChange={setShowSupplierModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ongeraho Muganga</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Izina ry'ikigo</Label><Input value={newSupplier.name} onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} /></div>
            <div><Label>Umuhuza</Label><Input value={newSupplier.contact_person} onChange={(e) => setNewSupplier({...newSupplier, contact_person: e.target.value})} /></div>
            <div><Label>Telefoni</Label><Input value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={newSupplier.email} onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})} /></div>
            <div><Label>Aho biri</Label><Input value={newSupplier.address} onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})} /></div>
            <div><Label>Amasezerano y'ubwishyu</Label><Input value={newSupplier.payment_terms} onChange={(e) => setNewSupplier({...newSupplier, payment_terms: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierModal(false)}>Hagarika</Button>
            <Button onClick={addSupplier} className="bg-orange-500 text-white">Bika</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Order Modal */}
      <Dialog open={showPurchaseOrderModal} onOpenChange={setShowPurchaseOrderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Gura Ikintu</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Muganga</Label>
              <Select value={newPurchaseOrder.supplier_id} onValueChange={(v) => setNewPurchaseOrder({...newPurchaseOrder, supplier_id: v})}>
                <SelectTrigger><SelectValue placeholder="Hitamo muganga..." /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Itariki y'itegeko</Label><Input type="date" value={newPurchaseOrder.expected_delivery_date} onChange={(e) => setNewPurchaseOrder({...newPurchaseOrder, expected_delivery_date: e.target.value})} /></div>
            <div><Label>Notes</Label><Textarea value={newPurchaseOrder.notes} onChange={(e) => setNewPurchaseOrder({...newPurchaseOrder, notes: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseOrderModal(false)}>Hagarika</Button>
            <Button onClick={createPurchaseOrder} className="bg-purple-500 text-white">Ohereza Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Modal */}
      <Dialog open={showReportsModal} onOpenChange={setShowReportsModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Shiramo Raporo</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => { generateReport('inventory'); setShowReportsModal(false); }} className="bg-blue-500 text-white">
              <FileText className="w-4 h-4 mr-2" /> Inventory Report
            </Button>
            <Button onClick={() => { generateReport('transactions'); setShowReportsModal(false); }} className="bg-green-500 text-white">
              <Activity className="w-4 h-4 mr-2" /> Transactions Report
            </Button>
            <Button onClick={() => { generateReport('valuation'); setShowReportsModal(false); }} className="bg-purple-500 text-white">
              <DollarSign className="w-4 h-4 mr-2" /> Valuation Report
            </Button>
            <Button onClick={() => setShowReportsModal(false)} variant="outline">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Detail Modal */}
      <Dialog open={!!showItemDetail} onOpenChange={() => setShowItemDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{showItemDetail?.item_name}</DialogTitle>
            <DialogDescription>{showItemDetail?.item_code} • {showItemDetail?.category}</DialogDescription>
          </DialogHeader>
          {showItemDetail && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="text-2xl font-black">{showItemDetail.quantity} {showItemDetail.unit}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Unit Price</p>
                <p className="text-2xl font-black text-green-600">{formatCurrency(showItemDetail.unit_price)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{showItemDetail.location || 'N/A'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Reorder Level</p>
                <p className="font-medium">{showItemDetail.reorder_level}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-black text-green-600">{formatCurrency(showItemDetail.quantity * showItemDetail.unit_price)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={showItemDetail.quantity === 0 ? 'bg-red-100 text-red-700' : showItemDetail.quantity <= showItemDetail.reorder_level ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>
                  {showItemDetail.quantity === 0 ? 'Out of Stock' : showItemDetail.quantity <= showItemDetail.reorder_level ? 'Low Stock' : 'In Stock'}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDetail(null)}>Funga</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagerDashboard;
