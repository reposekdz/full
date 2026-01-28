import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, TrendingDown, AlertTriangle, DollarSign, BarChart3, PieChart,
  Plus, Edit, Trash2, Eye, Search, Filter, RefreshCw, Download, Upload,
  ShoppingCart, Truck, Archive, CheckCircle, XCircle, ArrowUpDown,
  Building, Users, Calendar, FileText, Target, Zap, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

const API_BASE = 'http://localhost:5000/api';

interface InventoryManagementDashboardProps {
  userRole: string;
  userId: number;
}

const InventoryManagementDashboard: React.FC<InventoryManagementDashboardProps> = ({ userRole, userId }) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, transactionsRes, alertsRes, categoriesRes, suppliersRes] = await Promise.all([
        fetch(`${API_BASE}/inventory-management/inventory-items`).then(r => r.json()),
        fetch(`${API_BASE}/inventory-management/inventory-transactions`).then(r => r.json()),
        fetch(`${API_BASE}/inventory-management/low-stock-alerts`).then(r => r.json()),
        fetch(`${API_BASE}/inventory-management/inventory-categories`).then(r => r.json()),
        fetch(`${API_BASE}/inventory-management/suppliers`).then(r => r.json())
      ]);

      setInventory(inventoryRes.items || []);
      setTransactions(transactionsRes.transactions || []);
      setLowStockAlerts(alertsRes.alerts || []);
      setCategories(categoriesRes.categories || []);
      setSuppliers(suppliersRes.suppliers || []);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (type: 'in' | 'out', itemId: number, quantity: number) => {
    try {
      const response = await fetch(`${API_BASE}/inventory-management/inventory-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          transaction_type: type,
          quantity,
          user_id: userId,
          notes: `${type === 'in' ? 'Stock in' : 'Stock out'} transaction`
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchAllData();
        alert(`Transaction successful! New quantity: ${data.newQuantity}`);
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Transaction failed!');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <h3 className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                {value}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
              )}
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${color}`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const stats = [
    { title: 'Total Items', value: inventory.length, icon: Package, color: 'from-blue-500 to-blue-600', subtitle: `${totalItems} units in stock` },
    { title: 'Total Value', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-green-600', subtitle: 'Current inventory value' },
    { title: 'Low Stock Alerts', value: lowStockAlerts.length, icon: AlertTriangle, color: 'from-red-500 to-red-600', subtitle: 'Items need reordering' },
    { title: 'Categories', value: categories.length, icon: BarChart3, color: 'from-purple-500 to-purple-600', subtitle: 'Product categories' }
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive inventory tracking and management</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchAllData}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-yellow-600 to-green-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Low Stock Alerts Banner */}
        {lowStockAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div className="flex-1">
                <h3 className="font-black text-red-800">Low Stock Alert!</h3>
                <p className="text-sm text-red-600">
                  {lowStockAlerts.length} items are running low and need reordering
                </p>
              </div>
              <Button className="bg-gradient-to-r from-red-600 to-orange-600">
                <Eye className="w-4 h-4 mr-2" />
                View Alerts
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl bg-gradient-to-r from-green-100 to-yellow-100 p-1 rounded-2xl">
          <TabsTrigger value="inventory" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="transactions" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="categories" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Truck className="w-4 h-4 mr-2" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="alerts" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-black">
                  <Package className="w-6 h-6 text-green-600" />
                  Inventory Items
                </CardTitle>
                <Button className="bg-gradient-to-r from-green-600 to-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.category} value={cat.category}>{cat.category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-black text-gray-800 mb-1">{item.item_name}</h3>
                        <Badge className="bg-gradient-to-r from-green-500 to-yellow-500 text-white">
                          {item.category}
                        </Badge>
                      </div>
                      {item.quantity <= item.reorder_level && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600 font-bold">Quantity</p>
                        <p className="text-xl font-black text-green-600">{item.quantity} {item.unit}</p>
                      </div>
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <p className="text-xs text-gray-600 font-bold">Unit Price</p>
                        <p className="text-xl font-black text-yellow-600">${item.unit_price}</p>
                      </div>
                    </div>

                    <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-bold">Total Value</p>
                      <p className="text-lg font-black text-blue-600">${(item.quantity * item.unit_price).toLocaleString()}</p>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      <p><span className="font-bold">Reorder Level:</span> {item.reorder_level}</p>
                      <p><span className="font-bold">Location:</span> {item.location}</p>
                      <p><span className="font-bold">Supplier:</span> {item.supplier}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleTransaction('in', item.id, 10)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Stock In
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTransaction('out', item.id, 10)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700"
                      >
                        <ArrowUpDown className="w-4 h-4 mr-1" />
                        Stock Out
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2 font-black">
                <ArrowUpDown className="w-6 h-6 text-green-600" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border-2 ${
                      transaction.transaction_type === 'in'
                        ? 'bg-gradient-to-r from-green-50 to-white border-green-200'
                        : transaction.transaction_type === 'out'
                        ? 'bg-gradient-to-r from-red-50 to-white border-red-200'
                        : 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          transaction.transaction_type === 'in'
                            ? 'bg-green-600'
                            : transaction.transaction_type === 'out'
                            ? 'bg-red-600'
                            : 'bg-yellow-600'
                        }`}>
                          {transaction.transaction_type === 'in' ? (
                            <Plus className="w-5 h-5 text-white" />
                          ) : (
                            <ArrowUpDown className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-gray-800">{transaction.item_name}</h3>
                          <p className="text-sm text-gray-600">
                            {transaction.first_name} {transaction.last_name} • {new Date(transaction.transaction_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${
                          transaction.transaction_type === 'in'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'in' ? '+' : '-'}{transaction.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.previous_quantity} → {transaction.new_quantity}
                        </p>
                      </div>
                    </div>
                    {transaction.notes && (
                      <p className="text-sm text-gray-600 mt-3 pl-16">{transaction.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2 font-black">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Inventory by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-purple-100 shadow-lg"
                  >
                    <h3 className="text-xl font-black text-gray-800 mb-4">{category.category}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-bold">Items</span>
                        <span className="text-lg font-black text-purple-600">{category.item_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-bold">Total Units</span>
                        <span className="text-lg font-black text-blue-600">{category.total_quantity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-bold">Total Value</span>
                        <span className="text-lg font-black text-green-600">${parseFloat(category.total_value).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-black">
                  <Truck className="w-6 h-6 text-blue-600" />
                  Supplier Management
                </CardTitle>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map((supplier, index) => (
                  <motion.div
                    key={supplier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-100 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-gray-800">{supplier.name}</h3>
                      <Badge className={supplier.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                        {supplier.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600"><span className="font-bold">Contact:</span> {supplier.contact_person}</p>
                      <p className="text-gray-600"><span className="font-bold">Phone:</span> {supplier.phone}</p>
                      <p className="text-gray-600"><span className="font-bold">Email:</span> {supplier.email}</p>
                      <p className="text-gray-600"><span className="font-bold">Payment Terms:</span> {supplier.payment_terms}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="flex items-center gap-2 font-black">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {lowStockAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border-2 border-red-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-800">{alert.item_name}</h3>
                          <p className="text-sm text-gray-600">{alert.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-red-600">{alert.quantity}</p>
                        <p className="text-xs text-gray-500">Reorder at {alert.reorder_level}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-red-100 flex gap-2">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-green-600 to-green-700">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Reorder Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Adjust Level
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagementDashboard;
