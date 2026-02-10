import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ComposedChart, RadialBarChart, RadialBar
} from 'recharts';
import {
  Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign,
  ShoppingCart, Truck, FileText, BarChart2, Settings, Search,
  Filter, Download, Upload, Plus, Edit, Trash2, Eye, CheckCircle,
  XCircle, Clock, MapPin, Calendar, Users, Target, Zap, Bell,
  Camera, QrCode, RefreshCw, ChevronDown, ChevronUp, ChevronRight,
  ChevronLeft, MoreVertical, Grid, List, Save, X, Save, Printer,
  Mail, Phone, MapPin, Building, User, ArrowUp, ArrowDown,
  Minus, Plus, Archive, RotateCcw, History, Layers, Box, Tag,
  Star, Heart, Share2, Copy, ExternalLink, Unlock, Lock, Send
} from 'lucide-react';

// TypeScript Interfaces
interface StockItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  subCategoryId?: number;
  subCategoryName?: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  unitPrice: number;
  supplierId: number;
  supplierName: string;
  locationId: number;
  locationName: string;
  batchNumber?: string;
  expiryDate?: string;
  barcode?: string;
  qrCode?: string;
  weight?: number;
  dimensions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  itemCount: number;
  isActive: boolean;
}

interface Supplier {
  id: number;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  paymentTerms: string;
  rating: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  isActive: boolean;
  notes?: string;
}

interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  notes?: string;
}

interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  total: number;
}

interface StockTransaction {
  id: number;
  transactionType: 'in' | 'out' | 'adjustment' | 'transfer' | 'return' | 'damage';
  productId: number;
  productName: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitCost: number;
  totalCost: number;
  referenceType?: string;
  referenceId?: string;
  fromLocationId?: number;
  fromLocationName?: string;
  toLocationId?: number;
  toLocationName?: string;
  notes?: string;
  performedBy: string;
  performedAt: string;
}

interface StockTake {
  id: number;
  stockTakeNumber: string;
  locationId: number;
  locationName: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'discrepancy';
  items: StockTakeItem[];
  startedAt: string;
  completedAt?: string;
  createdBy: string;
  notes?: string;
}

interface StockTakeItem {
  id: number;
  productId: number;
  productName: string;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  notes?: string;
}

interface Location {
  id: number;
  name: string;
  code: string;
  type: 'warehouse' | 'store' | 'bin' | 'shelf';
  parentId?: number;
  parentName?: string;
  capacity?: number;
  isActive: boolean;
}

interface Alert {
  id: number;
  type: 'low_stock' | 'expiry' | 'overstock' | 'discrepancy' | 'order_status';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  productId?: number;
  productName?: string;
  isRead: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingOrders: number;
  todayTransactions: number;
  weeklyTrend: number;
  monthlyTrend: number;
}

// Mock Data Generators
const generateMockStockItems = (): StockItem[] => {
  const categories = ['Office Supplies', 'Electronics', 'Furniture', 'Cleaning Supplies', 'Safety Equipment'];
  const suppliers = ['SupplyCo Ltd', 'TechWorld Inc', 'Office Depot', 'Quality Supplies', 'FastShip Supplies'];
  const locations = ['Main Warehouse', 'Store Room A', 'Store Room B', 'Shelf 1', 'Shelf 2', 'Bin 1'];
  
  const items: StockItem[] = [];
  const itemNames = [
    'A4 Paper Reams', 'Ballpoint Pens (Box)', 'Stapler Heavy Duty', 'File Folders (100pk)',
    'Laptop Dell XPS', 'Monitor 27" 4K', 'Wireless Keyboard', 'USB Flash Drive 64GB',
    'Office Desk Standard', 'Office Chair Ergonomic', 'Filing Cabinet 4-Drawer', 'Conference Table',
    'Disinfectant Wipes', 'Hand Sanitizer (5L)', 'Trash Bags (100pk)', 'Floor Cleaner (5L)',
    'Safety Helmet', 'Fire Extinguisher', 'First Aid Kit', 'Safety Goggles'
  ];

  for (let i = 0; i < itemNames.length; i++) {
    const quantity = Math.floor(Math.random() * 500) + 10;
    const unitCost = Math.random() * 200 + 5;
    const minStock = Math.floor(Math.random() * 50) + 10;
    
    items.push({
      id: i + 1,
      sku: `SKU-${String(i + 1).padStart(5, '0')}`,
      name: itemNames[i],
      description: `High quality ${itemNames[i].toLowerCase()} for professional use`,
      categoryId: Math.floor(i / 4) + 1,
      categoryName: categories[Math.floor(i / 4)],
      unit: ['pieces', 'boxes', 'sets', 'liters', 'kg'].sort(() => Math.random() - 0.5)[0],
      quantity,
      minStock,
      maxStock: minStock * 10,
      reorderPoint: minStock * 2,
      unitCost: Math.round(unitCost * 100) / 100,
      unitPrice: Math.round(unitCost * 1.3 * 100) / 100,
      supplierId: Math.floor(Math.random() * suppliers.length) + 1,
      supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
      locationId: Math.floor(Math.random() * locations.length) + 1,
      locationName: locations[Math.floor(Math.random() * locations.length)],
      batchNumber: Math.random() > 0.5 ? `BATCH-${Date.now()}-${i}` : undefined,
      expiryDate: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      barcode: Math.random() > 0.5 ? `${Math.floor(Math.random() * 9000000000000) + 1000000000000}` : undefined,
      isActive: Math.random() > 0.1,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  return items;
};

const generateMockCategories = (): Category[] => {
  const categories: Category[] = [
    { id: 1, name: 'Office Supplies', description: 'General office supplies and stationery', itemCount: 45, isActive: true },
    { id: 2, name: 'Electronics', description: 'Electronic devices and accessories', itemCount: 32, isActive: true },
    { id: 3, name: 'Furniture', description: 'Office furniture and fixtures', itemCount: 18, isActive: true },
    { id: 4, name: 'Cleaning Supplies', description: 'Cleaning and maintenance supplies', itemCount: 28, isActive: true },
    { id: 5, name: 'Safety Equipment', description: 'Safety gear and protective equipment', itemCount: 15, isActive: true }
  ];
  
  // Add subcategories
  const subcategories = [
    { parentId: 1, name: 'Paper Products', itemCount: 12 },
    { parentId: 1, name: 'Writing Instruments', itemCount: 18 },
    { parentId: 1, name: 'Filing & Organization', itemCount: 15 },
    { parentId: 2, name: 'Computers & Tablets', itemCount: 10 },
    { parentId: 2, name: 'Peripherals', itemCount: 22 }
  ];
  
  subcategories.forEach((sub, idx) => {
    categories.push({
      id: 100 + idx,
      name: sub.name,
      description: `Subcategory of ${categories.find(c => c.id === sub.parentId)?.name}`,
      parentId: sub.parentId,
      parentName: categories.find(c => c.id === sub.parentId)?.name,
      itemCount: sub.itemCount,
      isActive: true
    });
  });
  
  return categories;
};

const generateMockSuppliers = (): Supplier[] => {
  return [
    { id: 1, code: 'SUP001', name: 'SupplyCo Ltd', contactPerson: 'John Smith', email: 'john@supplyco.com', phone: '+1-555-0101', address: '123 Supply St', city: 'New York', country: 'USA', paymentTerms: 'Net 30', rating: 4.5, totalOrders: 156, totalSpent: 125000, lastOrderDate: '2024-01-15', isActive: true },
    { id: 2, code: 'SUP002', name: 'TechWorld Inc', contactPerson: 'Sarah Johnson', email: 'sarah@techworld.com', phone: '+1-555-0102', address: '456 Tech Ave', city: 'San Francisco', country: 'USA', paymentTerms: 'Net 45', rating: 4.8, totalOrders: 89, totalSpent: 250000, lastOrderDate: '2024-01-18', isActive: true },
    { id: 3, code: 'SUP003', name: 'Office Depot', contactPerson: 'Mike Brown', email: 'mike@officedepot.com', phone: '+1-555-0103', address: '789 Office Blvd', city: 'Chicago', country: 'USA', paymentTerms: 'Net 30', rating: 4.2, totalOrders: 234, totalSpent: 89000, lastOrderDate: '2024-01-10', isActive: true },
    { id: 4, code: 'SUP004', name: 'Quality Supplies', contactPerson: 'Emily Davis', email: 'emily@qualitysupplies.com', phone: '+1-555-0104', address: '321 Quality Lane', city: 'Boston', country: 'USA', paymentTerms: 'Net 15', rating: 4.6, totalOrders: 67, totalSpent: 45000, lastOrderDate: '2024-01-20', isActive: true },
    { id: 5, code: 'SUP005', name: 'FastShip Supplies', contactPerson: 'David Wilson', email: 'david@fastship.com', phone: '+1-555-0105', address: '654 Fast Ave', city: 'Los Angeles', country: 'USA', paymentTerms: 'Net 30', rating: 4.0, totalOrders: 45, totalSpent: 32000, lastOrderDate: '2024-01-12', isActive: false }
  ];
};

const generateMockPurchaseOrders = (): PurchaseOrder[] => {
  return [
    {
      id: 1,
      orderNumber: 'PO-2024-0001',
      supplierId: 1,
      supplierName: 'SupplyCo Ltd',
      status: 'pending',
      items: [
        { id: 1, productId: 1, productName: 'A4 Paper Reams', quantity: 50, receivedQuantity: 0, unitCost: 12.50, total: 625 },
        { id: 2, productId: 2, productName: 'Ballpoint Pens (Box)', quantity: 30, receivedQuantity: 0, unitCost: 8.75, total: 262.50 }
      ],
      subtotal: 887.50,
      tax: 71.00,
      total: 958.50,
      orderDate: '2024-01-20',
      expectedDate: '2024-01-28',
      createdBy: 'Admin User'
    },
    {
      id: 2,
      orderNumber: 'PO-2024-0002',
      supplierId: 2,
      supplierName: 'TechWorld Inc',
      status: 'approved',
      items: [
        { id: 3, productId: 5, productName: 'Laptop Dell XPS', quantity: 10, receivedQuantity: 0, unitCost: 1200, total: 12000 }
      ],
      subtotal: 12000,
      tax: 960,
      total: 12960,
      orderDate: '2024-01-18',
      expectedDate: '2024-01-25',
      approvedBy: 'Manager',
      approvedAt: '2024-01-19',
      createdBy: 'Admin User'
    },
    {
      id: 3,
      orderNumber: 'PO-2024-0003',
      supplierId: 3,
      supplierName: 'Office Depot',
      status: 'received',
      items: [
        { id: 4, productId: 9, productName: 'Office Desk Standard', quantity: 5, receivedQuantity: 5, unitCost: 350, total: 1750 }
      ],
      subtotal: 1750,
      tax: 140,
      total: 1890,
      orderDate: '2024-01-10',
      expectedDate: '2024-01-15',
      receivedDate: '2024-01-15',
      approvedBy: 'Manager',
      approvedAt: '2024-01-11',
      createdBy: 'Admin User'
    }
  ];
};

const generateMockTransactions = (): StockTransaction[] => {
  const types: StockTransaction['transactionType'][] = ['in', 'out', 'adjustment', 'transfer', 'return', 'damage'];
  const products = ['A4 Paper Reams', 'Ballpoint Pens (Box)', 'Laptop Dell XPS', 'Office Desk Standard', 'Disinfectant Wipes'];
  const users = ['Admin User', 'John Doe', 'Jane Smith', 'Warehouse Manager'];
  
  const transactions: StockTransaction[] = [];
  
  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const quantity = Math.floor(Math.random() * 50) + 1;
    const prevQty = Math.floor(Math.random() * 200) + 50;
    
    transactions.push({
      id: i + 1,
      transactionType: type,
      productId: Math.floor(Math.random() * 5) + 1,
      productName: products[Math.floor(Math.random() * products.length)],
      quantity: type === 'out' ? -quantity : quantity,
      previousQuantity: prevQty,
      newQuantity: type === 'out' ? prevQty - quantity : prevQty + quantity,
      unitCost: Math.random() * 100 + 10,
      totalCost: Math.random() * 1000 + 100,
      referenceType: Math.random() > 0.5 ? 'Purchase Order' : 'Manual',
      referenceId: Math.random() > 0.5 ? `PO-2024-${String(Math.floor(Math.random() * 100)).padStart(4, '0')}` : undefined,
      notes: Math.random() > 0.7 ? 'Regular stock movement' : undefined,
      performedBy: users[Math.floor(Math.random() * users.length)],
      performedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return transactions.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
};

const generateMockLocations = (): Location[] => {
  return [
    { id: 1, name: 'Main Warehouse', code: 'WH-MAIN', type: 'warehouse', capacity: 10000, isActive: true },
    { id: 2, name: 'Store Room A', code: 'WH-SRA', type: 'store', parentId: 1, parentName: 'Main Warehouse', capacity: 2000, isActive: true },
    { id: 3, name: 'Store Room B', code: 'WH-SRB', type: 'store', parentId: 1, parentName: 'Main Warehouse', capacity: 1500, isActive: true },
    { id: 4, name: 'Shelf 1', code: 'WH-SH1', type: 'shelf', parentId: 2, parentName: 'Store Room A', capacity: 500, isActive: true },
    { id: 5, name: 'Shelf 2', code: 'WH-SH2', type: 'shelf', parentId: 2, parentName: 'Store Room A', capacity: 500, isActive: true },
    { id: 6, name: 'Bin 1', code: 'WH-BIN1', type: 'bin', parentId: 4, parentName: 'Shelf 1', capacity: 100, isActive: true }
  ];
};

const generateMockAlerts = (): Alert[] => {
  return [
    { id: 1, type: 'low_stock', severity: 'high', title: 'Low Stock Alert', message: 'A4 Paper Reams is below reorder point', productId: 1, productName: 'A4 Paper Reams', isRead: false, createdAt: new Date().toISOString() },
    { id: 2, type: 'expiry', severity: 'critical', title: 'Expiry Warning', message: 'Hand Sanitizer expires in 15 days', productId: 14, productName: 'Hand Sanitizer (5L)', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, type: 'order_status', severity: 'medium', title: 'Order Pending', message: 'PO-2024-0001 awaiting approval', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 4, type: 'low_stock', severity: 'low', title: 'Stock Running Low', message: 'Ballpoint Pens (Box) at 20% of max stock', productId: 2, productName: 'Ballpoint Pens (Box)', isRead: true, createdAt: new Date(Date.now() - 259200000).toISOString() }
  ];
};

// Utility Functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Main Component
const StockManagementUltraAdvanced: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string>('');

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    pendingOrders: 0,
    todayTransactions: 0,
    weeklyTrend: 0,
    monthlyTrend: 0
  });

  // Chart Data
  const [stockTrendData, setStockTrendData] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [transactionVolume, setTransactionVolume] = useState<any[]>([]);

  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const items = generateMockStockItems();
      const cats = generateMockCategories();
      const sups = generateMockSuppliers();
      const orders = generateMockPurchaseOrders();
      const trans = generateMockTransactions();
      const locs = generateMockLocations();
      const alts = generateMockAlerts();
      
      setStockItems(items);
      setCategories(cats);
      setSuppliers(sups);
      setPurchaseOrders(orders);
      setTransactions(trans);
      setLocations(locs);
      setAlerts(alts);
      
      // Calculate dashboard stats
      const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
      const lowStock = items.filter(item => item.quantity <= item.reorderPoint && item.quantity > 0).length;
      const outOfStock = items.filter(item => item.quantity === 0).length;
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'approved').length;
      const today = new Date().toISOString().split('T')[0];
      const todayTransactions = trans.filter(t => t.performedAt.split('T')[0] === today).length;
      
      setDashboardStats({
        totalItems: items.length,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockItems: lowStock,
        outOfStockItems: outOfStock,
        pendingOrders,
        todayTransactions,
        weeklyTrend: 5.2,
        monthlyTrend: 12.8
      });
      
      // Generate chart data
      generateChartData(items, trans, cats);
      
      setLoading(false);
    }, 1000);
  }, []);

  const generateChartData = (items: StockItem[], trans: StockTransaction[], cats: Category[]) => {
    // Stock trend data (last 7 days)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trendData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        itemsIn: Math.floor(Math.random() * 100) + 50,
        itemsOut: Math.floor(Math.random() * 80) + 30,
        value: Math.floor(Math.random() * 10000) + 50000
      });
    }
    setStockTrendData(trendData);
    
    // Category distribution
    const catDist = cats.filter(c => !c.parentId).map(cat => ({
      name: cat.name,
      value: cat.itemCount,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
    setCategoryDistribution(catDist);
    
    // Top products by value
    const topProd = items
      .sort((a, b) => (b.quantity * b.unitCost) - (a.quantity * a.unitCost))
      .slice(0, 5)
      .map(item => ({
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        value: Math.round(item.quantity * item.unitCost)
      }));
    setTopProducts(topProd);
    
    // Transaction volume (last 7 days)
    const transVol = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      transVol.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        transactions: Math.floor(Math.random() * 30) + 10
      });
    }
    setTransactionVolume(transVol);
  };

  // Filter and Search Logic
  const filteredItems = useMemo(() => {
    return stockItems.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode?.includes(searchQuery);
      
      const matchesCategory = selectedCategory === 'all' || item.categoryId.toString() === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || item.locationId.toString() === selectedLocation;
      
      return matchesSearch && matchesCategory && matchesLocation;
    }).sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'quantity': comparison = a.quantity - b.quantity; break;
        case 'value': comparison = (a.quantity * a.unitCost) - (b.quantity * b.unitCost); break;
        case 'category': comparison = a.categoryName.localeCompare(b.categoryName); break;
        case 'updated': comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break;
        default: comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [stockItems, searchQuery, selectedCategory, selectedLocation, sortBy, sortOrder]);

  // Modal Handlers
  const openModal = (type: string, item?: StockItem) => {
    setModalType(type);
    setSelectedItem(item || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
  };

  // Scanner Simulation
  const handleScan = () => {
    if (scannedCode) {
      const found = stockItems.find(item => item.barcode === scannedCode || item.sku === scannedCode);
      if (found) {
        openModal('view', found);
      } else {
        alert(`Product with code ${scannedCode} not found`);
      }
      setScannedCode('');
    }
  };

  // Export Functions
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  // Render Tab Content
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Items</p>
              <p className="text-3xl font-bold">{dashboardStats.totalItems}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Package size={28} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp size={16} className="mr-1" />
            <span>{dashboardStats.weeklyTrend}% from last week</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Value</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboardStats.totalValue)}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <DollarSign size={28} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp size={16} className="mr-1" />
            <span>{dashboardStats.monthlyTrend}% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Low Stock Items</p>
              <p className="text-3xl font-bold">{dashboardStats.lowStockItems}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <AlertTriangle size={28} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-200">Needs attention</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Pending Orders</p>
              <p className="text-3xl font-bold">{dashboardStats.pendingOrders}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <ShoppingCart size={28} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock size={16} className="mr-1" />
            <span>{dashboardStats.todayTransactions} today</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2 text-blue-500" />
            Stock Movement Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stockTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="itemsIn" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Items In" />
              <Area type="monotone" dataKey="itemsOut" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Items Out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart size={20} className="mr-2 text-purple-500" />
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart2 size={20} className="mr-2 text-green-500" />
            Top Products by Value
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Volume */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <History size={20} className="mr-2 text-orange-500" />
            Daily Transactions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={transactionVolume} startAngle={180} endAngle={0}>
              <RadialBar minAngle={15} label={{ fill: '#666', position: 'insideStart' }} background clockWise dataKey="transactions" />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Bell size={20} className="mr-2 text-red-500" />
            Recent Alerts
          </h3>
          <button className="text-blue-500 hover:text-blue-600 text-sm">View All</button>
        </div>
        <div className="space-y-3">
          {alerts.slice(0, 4).map(alert => (
            <div key={alert.id} className={`flex items-center p-3 rounded-lg border-l-4 ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
              alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
              alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <AlertTriangle size={20} className={`mr-3 ${
                alert.severity === 'critical' ? 'text-red-500' :
                alert.severity === 'high' ? 'text-orange-500' :
                alert.severity === 'medium' ? 'text-yellow-500' :
                'text-blue-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
              <span className="text-xs text-gray-500">{formatDate(alert.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => !c.parentId).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="healthy">Healthy Stock</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV(filteredItems, 'inventory.csv')}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download size={18} className="mr-2" />
              Export
            </button>
            <button
              onClick={() => openModal('add')}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={18} className="mr-2" />
              Add Item
            </button>
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="flex gap-4 mt-4 pt-4 border-t">
          <span className="text-sm text-gray-500">Sort by:</span>
          {['name', 'quantity', 'value', 'category', 'updated'].map(sort => (
            <button
              key={sort}
              onClick={() => {
                if (sortBy === sort) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(sort);
                  setSortOrder('asc');
                }
              }}
              className={`flex items-center text-sm px-3 py-1 rounded ${
                sortBy === sort ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
              {sortBy === sort && (
                sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.sku}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.barcode && <div className="text-xs text-gray-500">BC: {item.barcode}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.locationName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        item.quantity === 0 ? 'text-red-600' :
                        item.quantity <= item.reorderPoint ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {item.quantity} {item.unit}
                      </span>
                      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.quantity === 0 ? 'bg-red-500' :
                            item.quantity <= item.reorderPoint ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((item.quantity / item.maxStock) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.unitCost)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.quantity * item.unitCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.quantity === 0 ? 'bg-red-100 text-red-800' :
                      item.quantity <= item.reorderPoint ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity === 0 ? 'Out of Stock' :
                       item.quantity <= item.reorderPoint ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal('view', item)} className="text-blue-600 hover:text-blue-900">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openModal('edit', item)} className="text-green-600 hover:text-green-900">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => openModal('adjust', item)} className="text-orange-600 hover:text-orange-900">
                        <Settings size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {filteredItems.length} of {stockItems.length} items
          </span>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              <ChevronLeft size={18} />
            </button>
            <button className="px-3 py-1 bg-blue-500 text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100">3</button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStockMovements = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <History size={20} className="mr-2 text-blue-500" />
            Stock Movement History
          </h3>
          <button
            onClick={() => exportToCSV(transactions, 'transactions.csv')}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From → To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 20).map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(tx.performedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit ${
                      tx.transactionType === 'in' ? 'bg-green-100 text-green-800' :
                      tx.transactionType === 'out' ? 'bg-red-100 text-red-800' :
                      tx.transactionType === 'adjustment' ? 'bg-blue-100 text-blue-800' :
                      tx.transactionType === 'transfer' ? 'bg-purple-100 text-purple-800' :
                      tx.transactionType === 'return' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tx.transactionType === 'in' && <ArrowDown size={12} className="mr-1" />}
                      {tx.transactionType === 'out' && <ArrowUp size={12} className="mr-1" />}
                      {tx.transactionType === 'adjustment' && <Settings size={12} className="mr-1" />}
                      {tx.transactionType === 'transfer' && <ArrowRight size={12} className="mr-1" />}
                      {tx.transactionType.charAt(0).toUpperCase() + tx.transactionType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className={tx.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {tx.fromLocationName && <span>{tx.fromLocationName}</span>}
                    {tx.fromLocationName && tx.toLocationName && <span className="mx-2">→</span>}
                    {tx.toLocationName && <span>{tx.toLocationName}</span>}
                    {!tx.fromLocationName && !tx.toLocationName && <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.performedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.referenceId || tx.referenceType || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSuppliers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Truck size={20} className="mr-2 text-blue-500" />
            Supplier Management
          </h3>
          <button
            onClick={() => openModal('add-supplier')}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} className="mr-2" />
            Add Supplier
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{supplier.name}</h4>
                  <p className="text-sm text-gray-500">{supplier.code}</p>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= supplier.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <User size={16} className="mr-2" />
                  {supplier.contactPerson}
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  {supplier.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2" />
                  {supplier.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  {supplier.city}, {supplier.country}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="font-semibold">{supplier.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="font-semibold">{formatCurrency(supplier.totalSpent)}</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPurchaseOrders = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <ShoppingCart size={20} className="mr-2 text-blue-500" />
            Purchase Orders
          </h3>
          <button
            onClick={() => openModal('create-po')}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} className="mr-2" />
            Create Order
          </button>
        </div>
        
        {/* Order Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'draft', 'pending', 'approved', 'ordered', 'partial', 'received', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="space-y-4">
          {purchaseOrders.filter(po => filterStatus === 'all' || po.status === filterStatus).map(order => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-lg">{order.orderNumber}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ordered' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                      order.status === 'received' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Supplier: {order.supplierName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-gray-500">{order.items.length} items</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expected Date</p>
                  <p className="font-medium">{order.expectedDate ? formatDate(order.expectedDate) : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Approved By</p>
                  <p className="font-medium">{order.approvedBy || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created By</p>
                  <p className="font-medium">{order.createdBy}</p>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.productName}</span>
                      <div className="flex items-center gap-4">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.total)}</span>
                        {item.receivedQuantity > 0 && (
                          <span className="text-green-600 text-xs">
                            (Received: {item.receivedQuantity})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-4 pt-4 border-t flex items-center justify-end gap-2">
                {order.status === 'draft' && (
                  <button className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm">
                    <Send size={14} className="mr-1" />
                    Submit for Approval
                  </button>
                )}
                {order.status === 'pending' && (
                  <button className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                    <CheckCircle size={14} className="mr-1" />
                    Approve
                  </button>
                )}
                {order.status === 'approved' && (
                  <button className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                    <Truck size={14} className="mr-1" />
                    Mark as Ordered
                  </button>
                )}
                {order.status === 'ordered' && (
                  <button className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                    <Package size={14} className="mr-1" />
                    Receive Items
                  </button>
                )}
                <button className="flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Eye size={14} className="mr-1" />
                  View Details
                </button>
                <button className="flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Printer size={14} className="mr-1" />
                  Print
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStockTake = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText size={20} className="mr-2 text-blue-500" />
            Stock Take / Audit
          </h3>
          <button
            onClick={() => openModal('new-stocktake')}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} className="mr-2" />
            New Stock Take
          </button>
        </div>
        
        {/* Stock Take Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">3</p>
            <p className="text-sm text-gray-600">Total Audits</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">2</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">1</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-sm text-gray-600">Discrepancies</p>
          </div>
        </div>
        
        {/* Recent Stock Takes */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-lg">ST-2024-0001</h4>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                <p className="text-sm text-gray-500">Location: Main Warehouse</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Started: Jan 15, 2024</p>
                <p>Completed: Jan 16, 2024</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-500">Items Counted</p>
                <p className="font-medium">150</p>
              </div>
              <div>
                <p className="text-gray-500">Variances Found</p>
                <p className="font-medium text-green-600">3</p>
              </div>
              <div>
                <p className="text-gray-500">Accuracy Rate</p>
                <p className="font-medium text-green-600">98%</p>
              </div>
              <div>
                <p className="text-gray-500">Audited By</p>
                <p className="font-medium">Admin User</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Top Variances:</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>A4 Paper Reams</span>
                  <span className="text-red-600">-5 units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ballpoint Pens (Box)</span>
                  <span className="text-green-600">+3 units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Laptop Dell XPS</span>
                  <span className="text-green-600">+1 unit</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <button className="flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <Eye size={14} className="mr-1" />
                View Report
              </button>
              <button className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                <CheckCircle size={14} className="mr-1" />
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin size={20} className="mr-2 text-blue-500" />
            Location Management
          </h3>
          <button
            onClick={() => openModal('add-location')}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} className="mr-2" />
            Add Location
          </button>
        </div>
        
        {/* Location Tree */}
        <div className="space-y-4">
          {locations.filter(l => !l.parentId).map(location => (
            <div key={location.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    location.type === 'warehouse' ? 'bg-blue-100 text-blue-600' :
                    location.type === 'store' ? 'bg-green-100 text-green-600' :
                    location.type === 'shelf' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <Building size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{location.name}</h4>
                    <p className="text-sm text-gray-500">{location.code} • {location.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {location.capacity && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium">{location.capacity} units</p>
                    </div>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    location.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {location.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Child Locations */}
              {locations.filter(l => l.parentId === location.id).map(child => (
                <div key={child.id} className="ml-12 mt-4 border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        child.type === 'shelf' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <Layers size={16} />
                      </div>
                      <div>
                        <h5 className="font-medium">{child.name}</h5>
                        <p className="text-sm text-gray-500">{child.code} • {child.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {child.capacity && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-medium">{child.capacity} units</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Grandchild Locations */}
                  {locations.filter(l => l.parentId === child.id).map(grandchild => (
                    <div key={grandchild.id} className="ml-12 mt-2 border-l-2 border-gray-100 pl-4">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Box size={16} className="text-gray-400" />
                          <div>
                            <h6 className="font-medium text-sm">{grandchild.name}</h6>
                            <p className="text-xs text-gray-500">{grandchild.code}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Tag size={20} className="mr-2 text-blue-500" />
            Category Management
          </h3>
          <button
            onClick={() => openModal('add-category')}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} className="mr-2" />
            Add Category
          </button>
        </div>
        
        <div className="space-y-4">
          {categories.map(category => (
            <div
              key={category.id}
              className={`border rounded-xl p-4 ${
                category.parentId ? 'ml-12 border-dashed' : 'border-solid'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.parentId ? 'bg-gray-100' : 'bg-blue-100'}`}>
                    {category.parentId ? (
                      <Layers size={20} className="text-gray-600" />
                    ) : (
                      <Tag size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${category.parentId ? 'text-sm' : ''}`}>
                      {category.name}
                    </h4>
                    {category.parentName && (
                      <p className="text-xs text-gray-500">Subcategory of {category.parentName}</p>
                    )}
                    {category.description && (
                      <p className="text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Items</p>
                    <p className="font-medium">{category.itemCount}</p>
                  </div>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Valuation Report */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign size={20} className="mr-2 text-green-500" />
              Inventory Valuation
            </h3>
            <button className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
              <Download size={14} className="mr-1" />
              Export
            </button>
          </div>
          
          <div className="space-y-3">
            {stockItems.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                  </div>
                </div>
                <p className="font-semibold">{formatCurrency(item.quantity * item.unitCost)}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t flex justify-between">
            <span className="font-semibold">Total Valuation</span>
            <span className="font-bold text-xl text-green-600">
              {formatCurrency(stockItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0))}
            </span>
          </div>
        </div>
        
        {/* Stock Movement Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-500" />
              Stock Movement Summary
            </h3>
            <button className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
              <Download size={14} className="mr-1" />
              Export
            </button>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={transactionVolume}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Low Stock Report */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertTriangle size={20} className="mr-2 text-orange-500" />
            Low Stock Report
          </h3>
          <button className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
            <Download size={14} className="mr-1" />
            Export
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Point</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suggested Order</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockItems.filter(item => item.quantity <= item.reorderPoint).slice(0, 10).map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.minStock}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.reorderPoint}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    {item.maxStock - item.quantity} {item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <p className="text-indigo-100 text-sm">Stock Turnover Rate</p>
          <p className="text-3xl font-bold">4.2x</p>
          <p className="text-sm text-indigo-200 mt-2">+0.3 from last month</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <p className="text-emerald-100 text-sm">Average Inventory Value</p>
          <p className="text-3xl font-bold">{formatCurrency(dashboardStats.totalValue / stockItems.length)}</p>
          <p className="text-sm text-emerald-200 mt-2">Per item average</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <p className="text-amber-100 text-sm">Stock Accuracy</p>
          <p className="text-3xl font-bold">98.5%</p>
          <p className="text-sm text-amber-200 mt-2">Based on last audit</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white">
          <p className="text-rose-100 text-sm">Carrying Cost</p>
          <p className="text-3xl font-bold">{formatCurrency(dashboardStats.totalValue * 0.02)}</p>
          <p className="text-sm text-rose-200 mt-2">Monthly estimated</p>
        </div>
      </div>
      
      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Inventory Age Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { age: '0-30 days', count: 45 },
              { age: '31-60 days', count: 30 },
              { age: '61-90 days', count: 20 },
              { age: '90+ days', count: 15 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Stock Value by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={locations.map(loc => ({
                  name: loc.name,
                  value: Math.floor(Math.random() * 50000) + 10000
                }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name }) => name}
              >
                {locations.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={[`#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Supplier Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">On-Time Delivery</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.filter(s => s.isActive).map(supplier => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{supplier.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.floor(Math.random() * 20) + 80}%` }}
                        />
                      </div>
                      <span>{Math.floor(Math.random() * 20) + 80}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.floor(Math.random() * 20) + 75}%` }}
                        />
                      </div>
                      <span>{Math.floor(Math.random() * 20) + 75}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {Math.floor(Math.random() * 24) + 1}h
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= supplier.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">({supplier.rating})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderScanner = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <QrCode size={20} className="mr-2 text-blue-500" />
            Barcode / QR Scanner
          </h3>
          <button
            onClick={() => setShowScanner(!showScanner)}
            className={`flex items-center px-4 py-2 rounded-lg text-white ${
              showScanner ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Camera size={18} className="mr-2" />
            {showScanner ? 'Close Scanner' : 'Open Scanner'}
          </button>
        </div>
        
        {/* Scanner Simulation */}
        {showScanner && (
          <div className="mb-6 p-8 bg-gray-900 rounded-xl flex flex-col items-center justify-center">
            <div className="w-full max-w-md h-64 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Scanning animation */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-500 animate-pulse" />
                <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-blue-500 rounded-lg animate-pulse" />
                <div className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-blue-500 rounded-lg" />
              </div>
              <QrCode size={120} className="text-white/50 z-10" />
            </div>
            <p className="text-white mt-4">Position barcode within the frame</p>
          </div>
        )}
        
        {/* Manual Entry */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter barcode or SKU manually..."
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleScan}
            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Search size={20} className="mr-2" />
            Search
          </button>
        </div>
        
        {/* Recent Scans */}
        <div>
          <h4 className="font-medium mb-4">Recent Scans</h4>
          <div className="space-y-2">
            {[
              { code: '123456789012', time: '2 minutes ago', found: true },
              { code: '987654321098', time: '15 minutes ago', found: false },
              { code: '456789123456', time: '1 hour ago', found: true }
            ].map((scan, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium">{scan.code}</p>
                    <p className="text-xs text-gray-500">{scan.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  scan.found ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {scan.found ? 'Found' : 'Not Found'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-xl font-semibold">
              {modalType === 'add' && 'Add New Item'}
              {modalType === 'edit' && 'Edit Item'}
              {modalType === 'view' && 'Item Details'}
              {modalType === 'adjust' && 'Adjust Stock'}
              {modalType === 'add-supplier' && 'Add Supplier'}
              {modalType === 'add-location' && 'Add Location'}
              {modalType === 'add-category' && 'Add Category'}
              {modalType === 'create-po' && 'Create Purchase Order'}
              {modalType === 'new-stocktake' && 'New Stock Take'}
            </h3>
            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            {modalType === 'view' && selectedItem && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">SKU</label>
                    <p className="text-lg font-semibold">{selectedItem.sku}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Barcode</label>
                    <p className="text-lg font-semibold">{selectedItem.barcode || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
                    <p className="text-xl font-semibold">{selectedItem.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                    <p className="font-medium">{selectedItem.categoryName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                    <p className="font-medium">{selectedItem.locationName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Quantity</label>
                    <p className="font-medium">{selectedItem.quantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Unit Cost</label>
                    <p className="font-medium">{formatCurrency(selectedItem.unitCost)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Total Value</label>
                    <p className="font-bold text-green-600">{formatCurrency(selectedItem.quantity * selectedItem.unitCost)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Supplier</label>
                    <p className="font-medium">{selectedItem.supplierName}</p>
                  </div>
                  {selectedItem.expiryDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Expiry Date</label>
                      <p className="font-medium text-orange-600">{formatDate(selectedItem.expiryDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {(modalType === 'add' || modalType === 'edit') && (
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="SKU-00001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="123456789012" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter product name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Select category...</option>
                      {categories.filter(c => !c.parentId).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Select location...</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>pieces</option>
                      <option>boxes</option>
                      <option>kg</option>
                      <option>liters</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                    <input type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                    <input type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Select supplier...</option>
                      {suppliers.map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
            )}
            
            {modalType === 'adjust' && selectedItem && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-sm text-gray-600">Current Quantity: {selectedItem.quantity} {selectedItem.unit}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="add">Add Stock</option>
                      <option value="remove">Remove Stock</option>
                      <option value="set">Set Quantity</option>
                      <option value="damage">Mark as Damaged</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason/Notes</label>
                  <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Enter reason for adjustment..." />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
              <Save size={18} className="mr-2" />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Navigation Tabs
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'movements', label: 'Stock Movements', icon: History },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
    { id: 'stocktake', label: 'Stock Take', icon: FileText },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'scanner', label: 'Scanner', icon: QrCode }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Package size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Stock Management System</h1>
                <p className="text-blue-200 text-sm">Complete Inventory Control & Tracking</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Alerts */}
              <button className="relative p-2 bg-white/10 hover:bg-white/20 rounded-lg">
                <Bell size={20} />
                {alerts.filter(a => !a.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {alerts.filter(a => !a.isRead).length}
                  </span>
                )}
              </button>
              
              {/* Settings */}
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
                <Settings size={20} />
              </button>
              
              {/* User */}
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
                <div className="bg-white/20 p-2 rounded-full">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium text-sm">Admin User</p>
                  <p className="text-xs text-blue-200">Warehouse Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="px-6 pb-4 overflow-x-auto">
          <div className="flex gap-1">
            {navTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <tab.icon size={18} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500">Loading stock data...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'movements' && renderStockMovements()}
            {activeTab === 'suppliers' && renderSuppliers()}
            {activeTab === 'purchase-orders' && renderPurchaseOrders()}
            {activeTab === 'stocktake' && renderStockTake()}
            {activeTab === 'locations' && renderLocations()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'scanner' && renderScanner()}
          </>
        )}
      </main>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default StockManagementUltraAdvanced;
