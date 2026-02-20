import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, AlertTriangle, DollarSign, Plus, Search, Filter, Download, Edit, Trash2, BarChart3, ShoppingCart, Warehouse, Users, RefreshCw, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE = 'http://localhost:5000/api/stock-advanced-api';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

interface StockItem {
  id: number;
  item_code: string;
  item_name: string;
  category_name: string;
  quantity: number;
  reorder_level: number;
  unit_price: number;
  selling_price: number;
  stock_status: string;
  location_name: string;
  supplier_name: string;
}

const AdvancedStockDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [items, setItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  
  const [itemForm, setItemForm] = useState({
    item_code: '', item_name: '', category_id: '', description: '', unit: 'pieces',
    quantity: 0, reorder_level: 10, unit_price: 0, selling_price: 0, supplier_id: '', location_id: ''
  });

  const [adjustForm, setAdjustForm] = useState({ type: 'in', quantity: 0, reason: '' });

  useEffect(() => {
    fetchDashboard();
    fetchCategories();
    fetchLocations();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (activeTab === 'items') fetchItems();
    if (activeTab === 'transactions') fetchTransactions();
  }, [activeTab, searchQuery, filterCategory, filterStatus]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/dashboard`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStatus) params.append('status', filterStatus);
      
      const res = await fetch(`${API_BASE}/items?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (error) {
      toast.error('Failed to load items');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE}/locations`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setLocations(data.locations);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setSuppliers(data.suppliers);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setTransactions(data.transactions);
    } catch (error) {
      toast.error('Failed to load transactions');
    }
  };

  const handleAddItem = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(itemForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Item added successfully');
        setShowAddItem(false);
        fetchItems();
        fetchDashboard();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`${API_BASE}/items/${selectedItem.id}/adjust`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(adjustForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Stock adjusted: ${data.previous} → ${data.new}`);
        setShowAdjust(false);
        setSelectedItem(null);
        fetchItems();
        fetchDashboard();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to adjust stock');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Item deleted');
        fetchItems();
        fetchDashboard();
      }
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
      <Card className={`border-0 shadow-lg ${color} text-white overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm mb-1">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <div className="flex items-center gap-1 mt-2 text-xs">
                  {trend > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  <span>{Math.abs(trend)}% vs last month</span>
                </div>
              )}
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Icon className="size-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      ok: 'bg-green-500/15 text-green-700 border-green-200',
      low: 'bg-orange-500/15 text-orange-700 border-orange-200',
      out: 'bg-red-500/15 text-red-700 border-red-200'
    };
    return <Badge className={colors[status as keyof typeof colors] || colors.ok}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-0 bg-gradient-to-r from-[#1565C0] via-[#1976D2] to-[#0D47A1] text-white shadow-xl">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Stock Management System</h1>
                  <p className="text-white/80 text-sm mt-1">Advanced Inventory Control</p>
                </div>
                <Button onClick={fetchDashboard} className="bg-white/15 hover:bg-white/25 text-white border-0">
                  <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white shadow-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Package} title="Total Items" value={stats.stats?.total_items || 0} color="bg-gradient-to-br from-blue-500 to-blue-600" trend={12} />
              <StatCard icon={AlertTriangle} title="Low Stock" value={stats.stats?.low_stock || 0} color="bg-gradient-to-br from-orange-500 to-orange-600" trend={-5} />
              <StatCard icon={TrendingUp} title="In Stock" value={stats.stats?.in_stock || 0} color="bg-gradient-to-br from-green-500 to-green-600" trend={8} />
              <StatCard icon={DollarSign} title="Total Value" value={`${(stats.stats?.total_value || 0).toLocaleString()} RWF`} color="bg-gradient-to-br from-purple-500 to-purple-600" trend={15} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.categoryBreakdown || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category_name" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total_value" fill="#1976D2" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Low Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(stats.lowStockItems || []).slice(0, 5).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.item_name}</p>
                          <p className="text-xs text-muted-foreground">{item.item_code}</p>
                        </div>
                        <Badge variant="destructive">{item.quantity}/{item.reorder_level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Transactions</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#1565C0] to-[#1976D2]">
                    <TableHead className="text-white">Code</TableHead>
                    <TableHead className="text-white">Item</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Quantity</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats.recentTransactions || []).map((txn: any) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">{txn.transaction_code}</TableCell>
                      <TableCell>{txn.item_name}</TableCell>
                      <TableCell><Badge>{txn.transaction_type}</Badge></TableCell>
                      <TableCell>{txn.quantity}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(txn.transaction_date).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.category_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddItem(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="size-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#1565C0] to-[#1976D2]">
                    <TableHead className="text-white">Code</TableHead>
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Category</TableHead>
                    <TableHead className="text-white">Quantity</TableHead>
                    <TableHead className="text-white">Price</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.item_code}</TableCell>
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell><Badge variant="outline">{item.category_name}</Badge></TableCell>
                      <TableCell>{item.quantity}/{item.reorder_level}</TableCell>
                      <TableCell>{item.unit_price.toLocaleString()} RWF</TableCell>
                      <TableCell>{getStatusBadge(item.stock_status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setShowAdjust(true); }}>
                            <Edit className="size-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteItem(item.id)} className="text-red-600">
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Code</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">{txn.transaction_code}</TableCell>
                      <TableCell>{txn.item_name}</TableCell>
                      <TableCell><Badge>{txn.transaction_type}</Badge></TableCell>
                      <TableCell>{txn.quantity}</TableCell>
                      <TableCell>{txn.total_amount?.toLocaleString()} RWF</TableCell>
                      <TableCell className="text-xs">{new Date(txn.transaction_date).toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{txn.first_name} {txn.last_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card key={cat.id}>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg">{cat.category_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>Items: <strong>{cat.item_count}</strong></span>
                      <span>Value: <strong>{cat.total_value?.toLocaleString()} RWF</strong></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suppliers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((sup) => (
                <Card key={sup.id}>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg">{sup.supplier_name}</h3>
                    <p className="text-sm text-muted-foreground">{sup.contact_person}</p>
                    <p className="text-sm">{sup.phone} • {sup.email}</p>
                    <div className="mt-3 flex justify-between text-sm">
                      <span>Items: <strong>{sup.item_count}</strong></span>
                      <span>Value: <strong>{sup.total_value?.toLocaleString()} RWF</strong></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Code *</Label>
                <Input value={itemForm.item_code} onChange={(e) => setItemForm({...itemForm, item_code: e.target.value})} />
              </div>
              <div>
                <Label>Item Name *</Label>
                <Input value={itemForm.item_name} onChange={(e) => setItemForm({...itemForm, item_name: e.target.value})} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={itemForm.category_id} onValueChange={(v) => setItemForm({...itemForm, category_id: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.category_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit</Label>
                <Input value={itemForm.unit} onChange={(e) => setItemForm({...itemForm, unit: e.target.value})} />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" value={itemForm.quantity} onChange={(e) => setItemForm({...itemForm, quantity: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <Label>Reorder Level</Label>
                <Input type="number" value={itemForm.reorder_level} onChange={(e) => setItemForm({...itemForm, reorder_level: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <Label>Unit Price</Label>
                <Input type="number" value={itemForm.unit_price} onChange={(e) => setItemForm({...itemForm, unit_price: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>Selling Price</Label>
                <Input type="number" value={itemForm.selling_price} onChange={(e) => setItemForm({...itemForm, selling_price: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={itemForm.description} onChange={(e) => setItemForm({...itemForm, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
              <Button onClick={handleAddItem} className="bg-blue-600">Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAdjust} onOpenChange={setShowAdjust}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Stock - {selectedItem?.item_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={adjustForm.type} onValueChange={(v) => setAdjustForm({...adjustForm, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" value={adjustForm.quantity} onChange={(e) => setAdjustForm({...adjustForm, quantity: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea value={adjustForm.reason} onChange={(e) => setAdjustForm({...adjustForm, reason: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdjust(false)}>Cancel</Button>
              <Button onClick={handleAdjustStock} className="bg-green-600">Adjust</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdvancedStockDashboard;
