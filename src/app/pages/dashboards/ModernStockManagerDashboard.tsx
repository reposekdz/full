import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, AlertTriangle, TrendingUp, DollarSign, Plus, Search, Filter, Download, Eye, Boxes, Truck, BarChart3, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import apiService from '@/app/services/apiService';

export default function ModernStockManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    description: '',
    unit_price: '',
    current_quantity: '',
    reorder_level: '10',
    supplier: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    item_id: '',
    transaction_type: 'in',
    quantity: '',
    unit_price: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterCategory !== 'all') params.category = filterCategory;
      if (filterLowStock) params.low_stock = 'true';
      
      const [overviewData, itemsData] = await Promise.all([
        apiService.getStockOverview(),
        apiService.getInventoryItems(params)
      ]);
      setOverview(overviewData.data);
      setItems(itemsData.items || []);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      await apiService.addInventoryItem({
        ...newItem,
        unit_price: parseFloat(newItem.unit_price),
        current_quantity: parseInt(newItem.current_quantity),
        reorder_level: parseInt(newItem.reorder_level)
      });
      alert('Item added successfully!');
      setNewItem({
        name: '',
        category: '',
        description: '',
        unit_price: '',
        current_quantity: '',
        reorder_level: '10',
        supplier: ''
      });
      fetchData();
    } catch (error: any) {
      alert('Failed to add item: ' + error.message);
    }
  };

  const handleRecordTransaction = async () => {
    try {
      await apiService.recordStockTransaction({
        ...newTransaction,
        item_id: parseInt(newTransaction.item_id),
        quantity: parseInt(newTransaction.quantity),
        unit_price: parseFloat(newTransaction.unit_price)
      });
      alert('Transaction recorded successfully!');
      setNewTransaction({
        item_id: '',
        transaction_type: 'in',
        quantity: '',
        unit_price: '',
        notes: ''
      });
      fetchData();
    } catch (error: any) {
      alert('Failed to record transaction: ' + error.message);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const categories = [...new Set(overview?.categories?.map((c: any) => c.category) || [])];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Stock Manager Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Inventory management and stock control</p>
          </div>
          <div className="flex space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>Enter details for the new inventory item</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Office Chair"
                    />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Input
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      placeholder="e.g., Furniture"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Item description..."
                    />
                  </div>
                  <div>
                    <Label>Unit Price *</Label>
                    <Input
                      type="number"
                      value={newItem.unit_price}
                      onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Current Quantity *</Label>
                    <Input
                      type="number"
                      value={newItem.current_quantity}
                      onChange={(e) => setNewItem({ ...newItem, current_quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Reorder Level *</Label>
                    <Input
                      type="number"
                      value={newItem.reorder_level}
                      onChange={(e) => setNewItem({ ...newItem, reorder_level: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label>Supplier</Label>
                    <Input
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                      placeholder="Supplier name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddItem} className="bg-teal-600 hover:bg-teal-700">
                    Add Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Record Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Stock Transaction</DialogTitle>
                  <DialogDescription>Add or remove items from inventory</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Item *</Label>
                    <Select value={newTransaction.item_id} onValueChange={(value) => setNewTransaction({ ...newTransaction, item_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} (Stock: {item.current_quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Transaction Type *</Label>
                    <Select value={newTransaction.transaction_type} onValueChange={(value) => setNewTransaction({ ...newTransaction, transaction_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Stock In</SelectItem>
                        <SelectItem value="out">Stock Out</SelectItem>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="issue">Issue</SelectItem>
                        <SelectItem value="return">Return</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={newTransaction.quantity}
                      onChange={(e) => setNewTransaction({ ...newTransaction, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      value={newTransaction.unit_price}
                      onChange={(e) => setNewTransaction({ ...newTransaction, unit_price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={newTransaction.notes}
                      onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                      placeholder="Transaction notes..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleRecordTransaction} className="bg-cyan-600 hover:bg-cyan-700">
                    Record Transaction
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Items', value: overview?.total_items || 0, icon: Package, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50' },
            { title: 'Low Stock Alerts', value: overview?.low_stock_items || 0, icon: AlertTriangle, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
            { title: 'Inventory Value', value: `RWF ${(overview?.total_inventory_value || 0).toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-teal-500', bg: 'bg-green-50' },
            { title: 'Recent Transactions', value: overview?.recent_transactions?.length || 0, icon: TrendingUp, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`${stat.bg} border-2 border-teal-200 hover:shadow-xl transition-all`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 border-b border-teal-200">
            {['overview', 'inventory', 'transactions', 'categories'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-2 border-teal-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Boxes className="h-5 w-5 text-teal-600" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(overview?.recent_transactions || []).slice(0, 10).map((transaction: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-teal-100 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            transaction.transaction_type === 'in' || transaction.transaction_type === 'purchase'
                              ? 'bg-green-100'
                              : 'bg-red-100'
                          }`}>
                            {transaction.transaction_type === 'in' || transaction.transaction_type === 'purchase' ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{transaction.item_name}</div>
                            <div className="text-sm text-gray-600">
                              {transaction.transaction_type} - {transaction.quantity} units
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            RWF {((transaction.quantity || 0) * (transaction.unit_price || 0)).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-teal-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Inventory Items</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button
                      variant={filterLowStock ? 'default' : 'outline'}
                      onClick={() => {
                        setFilterLowStock(!filterLowStock);
                        fetchData();
                      }}
                      className={filterLowStock ? 'bg-orange-600' : ''}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Low Stock Only
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-teal-200">
                        <th className="text-left py-3 px-4 font-semibold">Item Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Category</th>
                        <th className="text-right py-3 px-4 font-semibold">Quantity</th>
                        <th className="text-right py-3 px-4 font-semibold">Reorder Level</th>
                        <th className="text-right py-3 px-4 font-semibold">Unit Price</th>
                        <th className="text-right py-3 px-4 font-semibold">Total Value</th>
                        <th className="text-center py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-teal-50"
                        >
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-teal-100 text-teal-700">{item.category}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">{item.current_quantity}</td>
                          <td className="py-3 px-4 text-right">{item.reorder_level}</td>
                          <td className="py-3 px-4 text-right">RWF {item.unit_price?.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-semibold">
                            RWF {(item.current_quantity * item.unit_price).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.current_quantity <= item.reorder_level ? (
                              <Badge className="bg-red-100 text-red-700">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                In Stock
                              </Badge>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-teal-200">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(overview?.recent_transactions || []).map((transaction: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-teal-100 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          transaction.transaction_type === 'in' || transaction.transaction_type === 'purchase'
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}>
                          {transaction.transaction_type === 'in' || transaction.transaction_type === 'purchase' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{transaction.item_name}</div>
                          <div className="text-sm text-gray-600">
                            Type: <span className="font-medium capitalize">{transaction.transaction_type}</span>
                            {' • '}
                            Quantity: <span className="font-medium">{transaction.quantity}</span>
                            {' • '}
                            By: <span className="font-medium">{transaction.first_name} {transaction.last_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black">
                          RWF {((transaction.quantity || 0) * (transaction.unit_price || 0)).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(transaction.transaction_date).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-teal-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                  Inventory by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(overview?.categories || []).map((cat: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-lg border-2 border-teal-200 hover:shadow-lg transition-all"
                    >
                      <div className="text-sm text-gray-600 mb-2 uppercase font-semibold">{cat.category}</div>
                      <div className="text-3xl font-black text-teal-600 mb-2">{cat.item_count} Items</div>
                      <div className="text-lg font-semibold text-gray-700">
                        RWF {(cat.category_value || 0).toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
