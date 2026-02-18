import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Edit,
  Search,
  Filter,
  Download,
  Upload,
  ShoppingCart,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Loader2,
  Box,
  Truck,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';

interface StockItem {
  id: number;
  item_code: string;
  item_name: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  reorder_level: number;
  location: string;
  supplier_name?: string;
  total_value: number;
  status_label: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface StockMovement {
  id: number;
  item_name: string;
  item_code: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'return' | 'damage' | 'transfer';
  quantity: number;
  previous_qty: number;
  new_qty: number;
  notes: string;
  performed_by_name: string;
  created_at: string;
}

interface Supplier {
  id: number;
  supplier_code: string;
  supplier_name: string;
  contact_person: string;
  phone: string;
  email: string;
  item_count: number;
  total_supply_value: number;
}

interface Category {
  id: number;
  category_name: string;
  item_count: number;
  total_quantity: number;
  total_value: number;
}

export default function ComprehensiveStockManagement() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [items, setItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const [newItem, setNewItem] = useState({
    item_code: '',
    item_name: '',
    category: '',
    description: '',
    quantity: 0,
    unit: 'pcs',
    unit_price: 0,
    reorder_level: 10,
    location: '',
    supplier_id: null
  });

  const [newMovement, setNewMovement] = useState({
    item_id: 0,
    movement_type: 'in',
    quantity: 0,
    notes: ''
  });

  const [newSupplier, setNewSupplier] = useState({
    supplier_code: '',
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    loadStockData();
  }, []);

  useEffect(() => {
    if (activeTab === 'items') {
      loadItems();
    } else if (activeTab === 'movements') {
      loadMovements();
    } else if (activeTab === 'suppliers') {
      loadSuppliers();
    } else if (activeTab === 'categories') {
      loadCategories();
    }
  }, [activeTab, searchTerm, selectedCategory, selectedStatus]);

  const loadStockData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/stock-comprehensive/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setOverview(result.overview);
        setAlerts(result.alerts);
        setCategories(result.categoryBreakdown);
      }
    } catch (error) {
      console.error('Load stock data error:', error);
      toast.error('Failed to load stock overview');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedStatus && { status: selectedStatus }),
        limit: '50'
      });

      const response = await fetch(`http://localhost:3000/api/stock-comprehensive/items?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setItems(result.items);
      }
    } catch (error) {
      console.error('Load items error:', error);
    }
  };

  const loadMovements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/stock-comprehensive/movements?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setMovements(result.movements);
      }
    } catch (error) {
      console.error('Load movements error:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/stock-comprehensive/suppliers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setSuppliers(result.suppliers);
      }
    } catch (error) {
      console.error('Load suppliers error:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/stock-comprehensive/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const handleAddItem = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/stock-comprehensive/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Stock item added successfully');
        setShowAddItemDialog(false);
        setNewItem({
          item_code: '',
          item_name: '',
          category: '',
          description: '',
          quantity: 0,
          unit: 'pcs',
          unit_price: 0,
          reorder_level: 10,
          location: '',
          supplier_id: null
        });
        loadItems();
        loadStockData();
      } else {
        toast.error(result.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Add item error:', error);
      toast.error('Failed to add stock item');
    } finally {
      setProcessing(false);
    }
  };

  const handleRecordMovement = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/stock-comprehensive/movements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMovement)
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Stock ${newMovement.movement_type} recorded successfully`);
        setShowMovementDialog(false);
        setNewMovement({
          item_id: 0,
          movement_type: 'in',
          quantity: 0,
          notes: ''
        });
        setSelectedItem(null);
        loadMovements();
        loadItems();
        loadStockData();
      } else {
        toast.error(result.message || 'Failed to record movement');
      }
    } catch (error) {
      console.error('Record movement error:', error);
      toast.error('Failed to record stock movement');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddSupplier = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/stock-comprehensive/suppliers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSupplier)
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Supplier added successfully');
        setShowAddSupplierDialog(false);
        setNewSupplier({
          supplier_code: '',
          supplier_name: '',
          contact_person: '',
          phone: '',
          email: '',
          address: ''
        });
        loadSuppliers();
      } else {
        toast.error(result.message || 'Failed to add supplier');
      }
    } catch (error) {
      console.error('Add supplier error:', error);
      toast.error('Failed to add supplier');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'out':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'adjustment':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'return':
        return <ArrowDownRight className="w-4 h-4 text-yellow-600" />;
      case 'damage':
        return <X className="w-4 h-4 text-red-600" />;
      case 'transfer':
        return <Truck className="w-4 h-4 text-purple-600" />;
      default:
        return <Box className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            Stock Management System
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive inventory tracking and management</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="items" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Items
            </TabsTrigger>
            <TabsTrigger value="movements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Movements
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {overview && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Items</p>
                        <p className="text-2xl font-bold text-gray-900">{overview.total_items}</p>
                      </div>
                      <Package className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">In Stock</p>
                        <p className="text-2xl font-bold text-gray-900">{overview.in_stock_items}</p>
                      </div>
                      <Check className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Low Stock</p>
                        <p className="text-2xl font-bold text-gray-900">{overview.low_stock_items}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(parseFloat(overview.total_stock_value || 0))}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {alerts && alerts.lowStock && alerts.lowStock.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-700">
                      <AlertTriangle className="w-5 h-5" />
                      Low Stock Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.lowStock.slice(0, 5).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{item.item_name}</p>
                            <p className="text-sm text-gray-600">{item.item_code} • {item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-yellow-700">{item.quantity} {item.unit}</p>
                            <p className="text-xs text-gray-500">Reorder at: {item.reorder_level}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {categories && categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Top Categories by Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categories.slice(0, 5).map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{cat.category_name}</p>
                            <p className="text-sm text-gray-600">{cat.item_count} items</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-700">
                              {formatCurrency(parseFloat(cat.total_value || 0))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-2 flex-1 max-w-md">
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.category_name}>
                            {cat.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="low_stock">Low Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => setShowAddItemDialog(true)}
                      className="bg-gradient-to-r from-green-500 to-yellow-500 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {items.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Package className="w-8 h-8 text-green-600" />
                          <div>
                            <h3 className="font-bold text-gray-900">{item.item_name}</h3>
                            <p className="text-sm text-gray-600">{item.item_code} • {item.category}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(item.status_label)}>
                          {item.status_label.replace('_', ' ')}
                        </Badge>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {item.quantity} {item.unit}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.unit_price)} per {item.unit}
                          </p>
                          <p className="text-sm font-semibold text-green-700">
                            Total: {formatCurrency(item.total_value)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(item);
                            setNewMovement({ ...newMovement, item_id: item.id });
                            setShowMovementDialog(true);
                          }}
                        >
                          Record Movement
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <div className="grid gap-4">
              {movements.map((movement) => (
                <Card key={movement.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getMovementIcon(movement.movement_type)}
                        <div>
                          <h3 className="font-bold text-gray-900">{movement.item_name}</h3>
                          <p className="text-sm text-gray-600">{movement.item_code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="mb-2">
                          {movement.movement_type.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-gray-600">
                          {movement.previous_qty} → {movement.new_qty}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          Qty: {movement.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          By: {movement.performed_by_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(movement.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {movement.notes && (
                      <p className="mt-2 text-sm text-gray-600 italic">{movement.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <Button 
                  onClick={() => setShowAddSupplierDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-yellow-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {suppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{supplier.supplier_name}</h3>
                        <p className="text-sm text-gray-600">{supplier.supplier_code}</p>
                        {supplier.contact_person && (
                          <p className="text-sm text-gray-600 mt-2">Contact: {supplier.contact_person}</p>
                        )}
                        {supplier.phone && (
                          <p className="text-sm text-gray-600">Phone: {supplier.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{supplier.item_count} items</p>
                        <p className="text-sm font-semibold text-green-700">
                          {formatCurrency(parseFloat(supplier.total_supply_value || 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{category.category_name}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Items: {category.item_count}</p>
                      <p className="text-sm text-gray-600">Quantity: {category.total_quantity}</p>
                      <p className="text-sm font-semibold text-green-700">
                        Value: {formatCurrency(parseFloat(category.total_value || 0))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Stock Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Code *</Label>
                <Input
                  value={newItem.item_code}
                  onChange={(e) => setNewItem({ ...newItem, item_code: e.target.value })}
                  placeholder="SI001"
                />
              </div>
              <div>
                <Label>Item Name *</Label>
                <Input
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  placeholder="Laptop Computer"
                />
              </div>
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.category_name}>
                      {cat.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Item description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="pcs"
                />
              </div>
              <div>
                <Label>Unit Price (RWF)</Label>
                <Input
                  type="number"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={newItem.reorder_level}
                  onChange={(e) => setNewItem({ ...newItem, reorder_level: parseFloat(e.target.value) || 10 })}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  placeholder="A1-01"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={processing || !newItem.item_code || !newItem.item_name || !newItem.category}
              className="bg-gradient-to-r from-green-500 to-yellow-500 text-white"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Movement</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{selectedItem.item_name}</p>
                <p className="text-sm text-gray-600">Current: {selectedItem.quantity} {selectedItem.unit}</p>
              </div>
              <div>
                <Label>Movement Type</Label>
                <Select
                  value={newMovement.movement_type}
                  onValueChange={(value: any) => setNewMovement({ ...newMovement, movement_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In (Receiving)</SelectItem>
                    <SelectItem value="out">Stock Out (Issue)</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="damage">Damage/Loss</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newMovement.quantity}
                  onChange={(e) => setNewMovement({ ...newMovement, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={newMovement.notes}
                  onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovementDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordMovement}
              disabled={processing || newMovement.quantity <= 0}
              className="bg-gradient-to-r from-green-500 to-yellow-500 text-white"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Movement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddSupplierDialog} onOpenChange={setShowAddSupplierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier Code *</Label>
                <Input
                  value={newSupplier.supplier_code}
                  onChange={(e) => setNewSupplier({ ...newSupplier, supplier_code: e.target.value })}
                  placeholder="SUP001"
                />
              </div>
              <div>
                <Label>Supplier Name *</Label>
                <Input
                  value={newSupplier.supplier_name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, supplier_name: e.target.value })}
                  placeholder="ABC Suppliers Ltd"
                />
              </div>
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input
                value={newSupplier.contact_person}
                onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="+250788123456"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="supplier@example.com"
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                placeholder="Kigali, Rwanda"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSupplierDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSupplier}
              disabled={processing || !newSupplier.supplier_code || !newSupplier.supplier_name}
              className="bg-gradient-to-r from-green-500 to-yellow-500 text-white"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
