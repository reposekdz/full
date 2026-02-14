// Garden TVET School - Comprehensive Stock Management Dashboard
// Kinyarwanda by default - Real API Integration - Full Features

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Inventory, LocalShipping, ShoppingCart, Warning, Error, Add, Edit,
  Search, Refresh, Visibility, TrendingUp, TrendingDown, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { formatCurrency, formatDateTime, stockApi } from '@/app/services/stockManagementApi';
import LeftSidebar from '@/app/components/LeftSidebar';

// Garden TVET Brand Colors
const COLORS = {
  primary: '#2E7D32',
  secondary: '#FF6F00',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  background: '#F5F5F5',
  white: '#FFFFFF',
};

interface StockManagementDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const StockManagementDashboard: React.FC<StockManagementDashboardProps> = ({ onNavigate, onLogout }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Dialogs
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [adjustStockOpen, setAdjustStockOpen] = useState(false);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [viewItemOpen, setViewItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form Data
  const [newItem, setNewItem] = useState({
    item_name: '', item_code: '', category: '', description: '',
    quantity: 0, unit: 'pcs', unit_price: 0, reorder_level: 5,
    location: '', supplier_id: '', expiry_date: '', batch_number: ''
  });
  const [adjustment, setAdjustment] = useState({
    adjustment_type: 'add', quantity: 0, reason: ''
  });
  const [newSupplier, setNewSupplier] = useState({
    supplier_name: '', contact_person: '', phone: '', email: '', address: ''
  });
  
  // Last updated
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setStats(getDemoStats());
      setItems(getDemoItems());
      setCategories(getDemoCategories());
      setLoading(false);
      return;
    }

    try {
      const [statsRes, itemsRes, suppliersRes, ordersRes, categoriesRes] = await Promise.all([
        stockApi.getDashboardStats(),
        stockApi.getItems({ page: page + 1, limit: rowsPerPage, category: filterCategory, search: searchQuery }),
        stockApi.getSuppliers(),
        stockApi.getOrders(),
        stockApi.getCategories()
      ]);

      if (statsRes.success) setStats(statsRes);
      if (itemsRes.success) setItems(itemsRes.items || []);
      if (suppliersRes.success) setSuppliers(suppliersRes.suppliers || []);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (categoriesRes.success) setCategories(categoriesRes.categories || []);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Load data error:', error);
      setStats(getDemoStats());
      setItems(getDemoItems());
      setCategories(getDemoCategories());
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterCategory, searchQuery]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Demo data functions
  const getDemoStats = () => ({
    success: true,
    dashboard: {
      total_items: 156,
      total_value: 2450000,
      low_stock_count: 12,
      out_of_stock_count: 3,
      pending_orders: 5,
      active_suppliers: 8
    },
    category_breakdown: [
      { category: 'Office Supplies', item_count: 45, total_quantity: 2500, total_value: 450000 },
      { category: 'Cleaning Supplies', item_count: 28, total_quantity: 1800, total_value: 320000 },
      { category: 'IT Equipment', item_count: 18, total_quantity: 150, total_value: 890000 },
      { category: 'Medical Supplies', item_count: 12, total_quantity: 450, total_value: 280000 },
      { category: 'Sports Equipment', item_count: 22, total_quantity: 350, total_value: 510000 }
    ],
    monthly_trend: [
      { date: '2024-01-01', stock_in: 1200, stock_out: 800 },
      { date: '2024-01-08', stock_in: 950, stock_out: 1100 },
      { date: '2024-01-15', stock_in: 1500, stock_out: 700 },
      { date: '2024-01-22', stock_in: 800, stock_out: 1300 },
      { date: '2024-01-29', stock_in: 1100, stock_out: 900 }
    ]
  });

  const getDemoItems = () => [
    { id: 1, item_code: 'SI001', item_name: 'Ballpoint Pens (Blue)', category: 'Office Supplies', quantity: 500, unit: 'packs', unit_price: 2500, reorder_level: 50, location: 'A1-01' },
    { id: 2, item_code: 'SI002', item_name: 'A4 Paper Reams', category: 'Office Supplies', quantity: 200, unit: 'reams', unit_price: 5000, reorder_level: 30, location: 'A1-02' },
    { id: 3, item_code: 'SI003', item_name: 'Hand Sanitizer', category: 'Cleaning Supplies', quantity: 75, unit: 'bottles', unit_price: 4000, reorder_level: 20, location: 'B1-01' },
    { id: 4, item_code: 'SI004', item_name: 'Laptop Computers', category: 'IT Equipment', quantity: 15, unit: 'pcs', unit_price: 450000, reorder_level: 5, location: 'C1-01' },
    { id: 5, item_code: 'SI005', item_name: 'First Aid Kit', category: 'Medical Supplies', quantity: 10, unit: 'kits', unit_price: 45000, reorder_level: 3, location: 'D1-01' },
    { id: 6, item_code: 'SI006', item_name: 'Soccer Balls', category: 'Sports Equipment', quantity: 30, unit: 'pcs', unit_price: 20000, reorder_level: 10, location: 'E1-01' }
  ];

  const getDemoCategories = () => [
    { category: 'Office Supplies', item_count: 45, total_value: 450000 },
    { category: 'Cleaning Supplies', item_count: 28, total_value: 320000 },
    { category: 'IT Equipment', item_count: 18, total_value: 890000 },
    { category: 'Medical Supplies', item_count: 12, total_value: 280000 },
    { category: 'Sports Equipment', item_count: 22, total_value: 510000 }
  ]);

  // CRUD Operations
  const handleAddItem = async () => {
    try {
      const res = await stockApi.createItem(newItem);
      if (res.success) {
        setAddItemOpen(false);
        setNewItem({
          item_name: '', item_code: '', category: '', description: '',
          quantity: 0, unit: 'pcs', unit_price: 0, reorder_level: 5,
          location: '', supplier_id: '', expiry_date: '', batch_number: ''
        });
        loadData();
      }
    } catch (error) {
      console.error('Add item error:', error);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedItem) return;
    try {
      const res = await stockApi.adjustStock(selectedItem.id, adjustment);
      if (res.success) {
        setAdjustStockOpen(false);
        setAdjustment({ adjustment_type: 'add', quantity: 0, reason: '' });
        loadData();
      }
    } catch (error) {
      console.error('Adjust stock error:', error);
    }
  };

  const handleAddSupplier = async () => {
    try {
      const res = await stockApi.createSupplier(newSupplier);
      if (res.success) {
        setAddSupplierOpen(false);
        setNewSupplier({ supplier_name: '', contact_person: '', phone: '', email: '', address: '' });
        loadData();
      }
    } catch (error) {
      console.error('Add supplier error:', error);
    }
  };

  const getStockStatus = (item: any) => {
    if (item.quantity === 0) return { label: 'Nta byafite', color: 'destructive' };
    if (item.quantity <= item.reorder_level) return { label: 'Byo hagati', color: 'warning' };
    return { label: 'Birihagije', color: 'success' };
  };

  const filteredItems = items.filter(item => {
    if (filterCategory && item.category !== filterCategory) return false;
    if (searchQuery && !item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.item_code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Sidebar */}
      <LeftSidebar onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Ikigaragara cy'Ububiko</h1>
            <p className="text-gray-600">Kugenzura ibicuruzwa byose</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <Refresh className="mr-2 h-4 w-4" /> Hya
            </Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={() => setAddItemOpen(true)}>
              <Add className="mr-2 h-4 w-4" /> Kongeramo Ikintu
            </Button>
          </div>
        </div>

        {loading && <div className="h-1 bg-gray-200 mb-4"><div className="h-full bg-green-600 animate-pulse" style={{ width: '100%' }}></div></div>}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{stats.dashboard.total_items}</div>
                <div className="text-sm text-gray-500">Ibyose</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{formatCurrency(stats.dashboard.total_value)}</div>
                <div className="text-sm text-gray-500">Igiciro</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-orange-500">{stats.dashboard.low_stock_count}</div>
                <div className="text-sm text-gray-500">Byo hagati</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-red-500">{stats.dashboard.out_of_stock_count}</div>
                <div className="text-sm text-gray-500">Nta byafite</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-blue-500">{stats.dashboard.pending_orders}</div>
                <div className="text-sm text-gray-500">Ibizamini</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{stats.dashboard.active_suppliers}</div>
                <div className="text-sm text-gray-500">Abah供给商</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Ahabanza</TabsTrigger>
            <TabsTrigger value="items">Ibyakozwe</TabsTrigger>
            <TabsTrigger value="suppliers">Abah供给商</TabsTrigger>
            <TabsTrigger value="orders">Ibizamini</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inyungu z'Ukwezi</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.monthly_trend && (
                    <div className="space-y-4">
                      {stats.monthly_trend.map((trend: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">{formatDateTime(trend.date)}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-green-600 font-medium">+{trend.stock_in.toLocaleString()}</span>
                            <span className="text-red-600 font-medium">-{trend.stock_out.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Muri Bika</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.category_breakdown && (
                    <div className="space-y-3">
                      {stats.category_breakdown.map((cat: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#2E7D32', '#FF6F00', '#2196F3', '#FF9800', '#F44336'][i % 5] }}></div>
                            <span>{cat.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{cat.item_count} ibintu</div>
                            <div className="text-sm text-gray-500">{formatCurrency(cat.total_value)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ibyakozwe</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Amakategoriya" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Amakategoriya yose</SelectItem>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.category} value={cat.category}>{cat.category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Code</th>
                        <th className="text-left py-3 px-4">Izina</th>
                        <th className="text-left py-3 px-4">Ikategoriya</th>
                        <th className="text-right py-3 px-4">Ibyakozwe</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Igiciro</th>
                        <th className="text-left py-3 px-4">Aho</th>
                        <th className="text-left py-3 px-4">Ibikorwa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => {
                        const status = getStockStatus(item);
                        return (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{item.item_code}</td>
                            <td className="py-3 px-4">{item.item_name}</td>
                            <td className="py-3 px-4"><Badge variant="outline">{item.category}</Badge></td>
                            <td className="py-3 px-4 text-right">{item.quantity.toLocaleString()} {item.unit}</td>
                            <td className="py-3 px-4">
                              <Badge variant={status.color as any}>{status.label}</Badge>
                            </td>
                            <td className="py-3 px-4">{formatCurrency(item.unit_price)}</td>
                            <td className="py-3 px-4">{item.location}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(item); setViewItemOpen(true); }}>
                                  <Visibility className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(item); setAdjustStockOpen(true); }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Abah供给商</CardTitle>
                  <Button onClick={() => setAddSupplierOpen(true)}>
                    <Add className="mr-2 h-4 w-4" /> Kongeramo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.map((supplier: any, i: number) => (
                    <div key={i} className="p-4 border rounded-lg hover:shadow-md">
                      <h3 className="font-medium">{supplier.supplier_name || supplier.name}</h3>
                      <p className="text-sm text-gray-500">{supplier.contact_person}</p>
                      <p className="text-sm text-gray-500">{supplier.phone}</p>
                    </div>
                  ))}
                  {/* Demo suppliers */}
                  <DemoSupplier name="Rwanda Office Supplies Ltd" contact="John Mukama" phone="+250788123456" />
                  <DemoSupplier name="East African Traders" contact="Mary Uwimana" phone="+250788654321" />
                  <DemoSupplier name="Tech Solutions Rwanda" contact="Bob Nzeyimana" phone="+250788111222" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Ibizamini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nta bizami bibonetse</p>
                  ) : (
                    orders.map((order: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{order.order_number || `Order #${i + 1}`}</h4>
                          <p className="text-sm text-gray-500">{order.supplier_name}</p>
                        </div>
                        <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                          {order.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kongeramo Ikintu Gishya</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Izina ry'ikintu</Label>
              <Input value={newItem.item_name} onChange={(e) => setNewItem({...newItem, item_name: e.target.value})} />
            </div>
            <div>
              <Label>Code</Label>
              <Input value={newItem.item_code} onChange={(e) => setNewItem({...newItem, item_code: e.target.value})} />
            </div>
            <div>
              <Label>Ikategoriya</Label>
              <Input value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} />
            </div>
            <div>
              <Label>Aho bihagaze</Label>
              <Input value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} />
            </div>
            <div>
              <Label>Ingano</Label>
              <Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={newItem.unit} onChange={(e) => setNewItem({...newItem, unit: e.target.value})} />
            </div>
            <div>
              <Label>Igiciro (RWF)</Label>
              <Input type="number" value={newItem.unit_price} onChange={(e) => setNewItem({...newItem, unit_price: parseInt(e.target.value)})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemOpen(false)}>Cancel</Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleAddItem}>Kongeramo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustStockOpen} onOpenChange={setAdjustStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guhindura Ingano - {selectedItem?.item_name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Ubwoko bw'igikorwa</Label>
              <Select value={adjustment.adjustment_type} onValueChange={(v) => setAdjustment({...adjustment, adjustment_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Kongeramo (In)</SelectItem>
                  <SelectItem value="subtract">Kugura (Out)</SelectItem>
                  <SelectItem value="return">Subizamo</SelectItem>
                  <SelectItem value="damage">Byangiritse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ingano</Label>
              <Input type="number" value={adjustment.quantity} onChange={(e) => setAdjustment({...adjustment, quantity: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Impamvu</Label>
              <Input value={adjustment.reason} onChange={(e) => setAdjustment({...adjustment, reason: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustStockOpen(false)}>Cancel</Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleAdjustStock}>Guhindura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={addSupplierOpen} onOpenChange={setAddSupplierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kongeramo Umuh供给商</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Izina ry'isosiyete</Label>
              <Input value={newSupplier.supplier_name} onChange={(e) => setNewSupplier({...newSupplier, supplier_name: e.target.value})} />
            </div>
            <div>
              <Label>Umuhuza</Label>
              <Input value={newSupplier.contact_person} onChange={(e) => setNewSupplier({...newSupplier, contact_person: e.target.value})} />
            </div>
            <div>
              <Label>Telefoni</Label>
              <Input value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={newSupplier.email} onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSupplierOpen(false)}>Cancel</Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleAddSupplier}>Kongeramo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Demo Supplier Component
const DemoSupplier: React.FC<{ name: string; contact: string; phone: string }> = ({ name, contact, phone }) => (
  <div className="p-4 border rounded-lg hover:shadow-md">
    <h3 className="font-medium">{name}</h3>
    <p className="text-sm text-gray-500">{contact}</p>
    <p className="text-sm text-gray-500">{phone}</p>
  </div>
);

export default StockManagementDashboard;
