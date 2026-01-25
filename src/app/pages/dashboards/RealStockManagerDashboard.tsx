import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, AlertTriangle, ShoppingCart, TrendingUp, Download, Plus, Eye, Edit, Search, Filter, Clock, Users, Truck, Store, ClipboardList, Bell, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import LeftSidebar from '@/app/components/LeftSidebar';
import AdvancedMessagingWidget from '@/app/components/AdvancedMessagingWidget';

interface StockManagerDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const StockManagerDashboard: React.FC<StockManagerDashboardProps> = ({ onNavigate, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    item_name: '', item_code: '', category: '', description: '', quantity: 0,
    unit: 'pcs', unit_price: 0, reorder_level: 10, location: '', supplier: '', supplier_contact: '', notes: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    item_id: '', transaction_type: 'purchase', quantity: 0, unit_price: 0,
    reference_number: '', issued_to: '', department: '', purpose: '', notes: ''
  });

  useEffect(() => {
    loadData();
  }, [filterCategory, filterStatus, searchQuery]);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [statsRes, itemsRes, transactionsRes] = await Promise.all([
        fetch('http://localhost:5000/api/stock/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/stock/items?category=${filterCategory}&status=${filterStatus}&search=${searchQuery}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/stock/transactions?limit=20', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const statsData = await statsRes.json();
      const itemsData = await itemsRes.json();
      const transactionsData = await transactionsRes.json();

      if (statsData.success) {
        setStats(statsData);
        setLowStockItems(statsData.lowStock || []);
      }
      if (itemsData.success) setItems(itemsData.items || []);
      if (transactionsData.success) setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/stock/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newItem)
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewItem({ item_name: '', item_code: '', category: '', description: '', quantity: 0, unit: 'pcs', unit_price: 0, reorder_level: 10, location: '', supplier: '', supplier_contact: '', notes: '' });
      loadData();
    }
  };

  const addTransaction = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/stock/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newTransaction)
    });
    if (res.ok) {
      setShowTransactionModal(false);
      setNewTransaction({ item_id: '', transaction_type: 'purchase', quantity: 0, unit_price: 0, reference_number: '', issued_to: '', department: '', purpose: '', notes: '' });
      loadData();
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-white">
        <LeftSidebar currentPage="stock-manager-dashboard" onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-white overflow-hidden">
      <AdvancedMessagingWidget />
      <LeftSidebar currentPage="stock-manager-dashboard" onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Dashbord y'Ibikoresho</h1>
            <p className="text-gray-600">Gukurikirana ibikoresho n'ibintu by'ishuri</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Ongeraho
            </Button>
            <Button variant="outline" className="border-2 border-yellow-200">
              <Download className="w-4 h-4 mr-2" />
              Raporo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ibintu Byose</p>
                  <p className="text-3xl font-black text-blue-600">{stats?.totals?.total_items || 0}</p>
                </div>
                <Package className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ibicyeho</p>
                  <p className="text-3xl font-black text-red-600">{stats?.alerts?.low_stock_count || 0}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Byarangiye</p>
                  <p className="text-3xl font-black text-orange-600">{stats?.alerts?.out_of_stock_count || 0}</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Agaciro</p>
                  <p className="text-2xl font-black text-green-600">{formatCurrency(stats?.totals?.total_value || 0)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-yellow-200">
            <TabsTrigger value="inventory">Ibikoresho</TabsTrigger>
            <TabsTrigger value="transactions">Ibikorwa</TabsTrigger>
            <TabsTrigger value="alerts">Iburira</TabsTrigger>
            <TabsTrigger value="reports">Raporo</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card className="border-2 border-yellow-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ibikoresho Byose</CardTitle>
                  <div className="flex gap-3">
                    <Input placeholder="Shakisha..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64" />
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Icyiciro" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Byose</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                        <th className="text-left p-4 font-bold">Izina</th>
                        <th className="text-left p-4 font-bold">Kode</th>
                        <th className="text-left p-4 font-bold">Icyiciro</th>
                        <th className="text-left p-4 font-bold">Umubare</th>
                        <th className="text-left p-4 font-bold">Aho Biri</th>
                        <th className="text-left p-4 font-bold">Agaciro</th>
                        <th className="text-left p-4 font-bold">Status</th>
                        <th className="text-left p-4 font-bold">Ibikorwa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-yellow-100 hover:bg-yellow-50">
                          <td className="p-4 font-medium">{item.item_name}</td>
                          <td className="p-4"><Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">{item.item_code}</Badge></td>
                          <td className="p-4">{item.category}</td>
                          <td className="p-4"><span className="font-bold">{item.quantity}</span> {item.unit}</td>
                          <td className="p-4">{item.location}</td>
                          <td className="p-4 font-medium">{formatCurrency(item.quantity * item.unit_price)}</td>
                          <td className="p-4">
                            <Badge className={
                              item.quantity === 0 ? 'bg-red-100 text-red-700' :
                              item.quantity <= item.reorder_level ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }>
                              {item.quantity === 0 ? 'Byarangiye' : item.quantity <= item.reorder_level ? 'Bicyeho' : 'Birahari'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => { setSelectedItem(item); setNewTransaction({...newTransaction, item_id: item.id}); setShowTransactionModal(true); }}>
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
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

          <TabsContent value="transactions">
            <Card className="border-2 border-yellow-200">
              <CardHeader><CardTitle>Ibikorwa Biheruka</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((trans) => (
                    <div key={trans.id} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{trans.item_name}</h4>
                          <p className="text-sm text-gray-600">{trans.transaction_type} - {trans.quantity} {trans.unit}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={trans.transaction_type === 'purchase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {trans.transaction_type === 'purchase' ? 'Byaguze' : 'Byasohotse'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{new Date(trans.transaction_date).toLocaleDateString('rw-RW')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="border-2 border-yellow-200">
              <CardHeader><CardTitle>Ibintu Bicyeho</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.item_code} className="p-4 rounded-lg border-2 border-red-100 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">{item.item_name}</h4>
                          <p className="text-sm text-gray-600">{item.item_code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-red-600">{item.quantity}/{item.reorder_level}</p>
                          <Badge className="bg-red-600 text-white mt-1">Bikomeye</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats?.byCategory?.map((cat: any) => (
                <Card key={cat.category} className="border-2 border-yellow-200">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{cat.category}</h3>
                    <p className="text-3xl font-black text-green-600">{cat.item_count}</p>
                    <p className="text-sm text-gray-600">Ibintu</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">{formatCurrency(cat.category_value)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Ongeraho Ikintu Gishya</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Izina</Label><Input value={newItem.item_name} onChange={(e) => setNewItem({...newItem, item_name: e.target.value})} /></div>
            <div><Label>Kode</Label><Input value={newItem.item_code} onChange={(e) => setNewItem({...newItem, item_code: e.target.value})} /></div>
            <div><Label>Icyiciro</Label><Input value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} /></div>
            <div><Label>Umubare</Label><Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})} /></div>
            <div><Label>Igiciro</Label><Input type="number" value={newItem.unit_price} onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value)})} /></div>
            <div><Label>Aho Biri</Label><Input value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Hagarika</Button>
            <Button onClick={addItem} className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">Bika</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ongeraho Igikorwa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Ubwoko</Label>
              <Select value={newTransaction.transaction_type} onValueChange={(v) => setNewTransaction({...newTransaction, transaction_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Kugura</SelectItem>
                  <SelectItem value="issue">Gutanga</SelectItem>
                  <SelectItem value="return">Gusubiza</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Umubare</Label><Input type="number" value={newTransaction.quantity} onChange={(e) => setNewTransaction({...newTransaction, quantity: parseInt(e.target.value)})} /></div>
            <div><Label>Igiciro</Label><Input type="number" value={newTransaction.unit_price} onChange={(e) => setNewTransaction({...newTransaction, unit_price: parseFloat(e.target.value)})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionModal(false)}>Hagarika</Button>
            <Button onClick={addTransaction} className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">Bika</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagerDashboard;
