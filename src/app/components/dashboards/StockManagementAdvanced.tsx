import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Plus,
  Download,
  Search,
  Edit,
  Truck,
  ClipboardList,
  Calendar,
  DollarSign,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import apiService from '../../services/apiService';

export default function StockManagementAdvanced() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [valuationReport, setValuationReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [itemForm, setItemForm] = useState({
    item_code: '',
    item_name: '',
    category: '',
    unit_of_measure: '',
    quantity: '',
    unit_price: '',
    reorder_level: '',
    supplier_id: '',
    storage_location: ''
  });

  const [purchaseForm, setPurchaseForm] = useState({
    item_id: '',
    quantity: '',
    unit_price: '',
    supplier_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [distributionForm, setDistributionForm] = useState({
    item_id: '',
    quantity: '',
    recipient_type: 'department',
    recipient_name: '',
    distribution_date: new Date().toISOString().split('T')[0],
    purpose: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        inventoryData,
        suppliersData,
        alertsData,
        expiringData,
        valuationData
      ] = await Promise.all([
        apiService.getInventory({ page: 1, limit: 100 }),
        apiService.getSuppliers({}),
        apiService.getLowStockAlerts(),
        apiService.getExpiringItems(30),
        apiService.getInventoryValuation({})
      ]);

      if (inventoryData.success) setInventory(inventoryData.items || []);
      if (suppliersData.success) setSuppliers(suppliersData.suppliers || []);
      if (alertsData.success) setLowStockAlerts(alertsData.alerts || []);
      if (expiringData.success) setExpiringItems(expiringData.items || []);
      if (valuationData.success) setValuationReport(valuationData.report);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const result = await apiService.addInventoryItem({
        ...itemForm,
        quantity: parseInt(itemForm.quantity),
        unit_price: parseFloat(itemForm.unit_price),
        reorder_level: parseInt(itemForm.reorder_level)
      });

      if (result.success) {
        setShowAddItem(false);
        setItemForm({
          item_code: '',
          item_name: '',
          category: '',
          unit_of_measure: '',
          quantity: '',
          unit_price: '',
          reorder_level: '',
          supplier_id: '',
          storage_location: ''
        });
        fetchData();
      }
    } catch (error: any) {
      alert('Failed to add item: ' + error.message);
    }
  };

  const handleRecordPurchase = async () => {
    try {
      const result = await apiService.recordPurchase({
        ...purchaseForm,
        quantity: parseInt(purchaseForm.quantity),
        unit_price: parseFloat(purchaseForm.unit_price)
      });

      if (result.success) {
        setShowPurchase(false);
        setPurchaseForm({
          item_id: '',
          quantity: '',
          unit_price: '',
          supplier_id: '',
          transaction_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        fetchData();
      }
    } catch (error: any) {
      alert('Failed to record purchase: ' + error.message);
    }
  };

  const handleRecordDistribution = async () => {
    try {
      const result = await apiService.recordDistribution({
        ...distributionForm,
        quantity: parseInt(distributionForm.quantity)
      });

      if (result.success) {
        setShowDistribution(false);
        setDistributionForm({
          item_id: '',
          quantity: '',
          recipient_type: 'department',
          recipient_name: '',
          distribution_date: new Date().toISOString().split('T')[0],
          purpose: '',
          notes: ''
        });
        fetchData();
      }
    } catch (error: any) {
      alert('Failed to record distribution: ' + error.message);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalValue = valuationReport?.total_value || 0;
  const totalItems = inventory.length;
  const lowStockCount = lowStockAlerts.length;
  const expiringCount = expiringItems.length;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Advanced inventory control system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddItem(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button onClick={() => setShowPurchase(true)} variant="secondary">
            <Truck className="w-4 h-4 mr-2" />
            Record Purchase
          </Button>
          <Button onClick={() => setShowDistribution(true)} variant="outline">
            <ClipboardList className="w-4 h-4 mr-2" />
            Distribute
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Package className="w-4 h-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalItems}</div>
            <p className="text-xs opacity-90">In inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalValue.toLocaleString()} RWF</div>
            <p className="text-xs opacity-90">Inventory valuation</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockCount}</div>
            <p className="text-xs opacity-90">Items need reorder</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{expiringCount}</div>
            <p className="text-xs opacity-90">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Inventory Items</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Code</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Unit Price</th>
                      <th className="text-left p-2">Total Value</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item: any) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-sm">{item.item_code}</td>
                        <td className="p-2">{item.item_name}</td>
                        <td className="p-2">{item.category}</td>
                        <td className="p-2">{item.quantity} {item.unit_of_measure}</td>
                        <td className="p-2">{item.unit_price} RWF</td>
                        <td className="p-2 font-medium">{item.total_value} RWF</td>
                        <td className="p-2">
                          <Badge 
                            variant={
                              item.status === 'available' ? 'default' :
                              item.status === 'low_stock' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockAlerts.map((alert: any) => (
                    <div key={alert.id} className="p-3 border rounded-lg bg-orange-50">
                      <div className="font-medium">{alert.item_name}</div>
                      <div className="text-sm text-gray-600">
                        Current: {alert.quantity} | Reorder Level: {alert.reorder_level}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Calendar className="w-5 h-5" />
                  Expiring Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiringItems.map((item: any) => (
                    <div key={item.id} className="p-3 border rounded-lg bg-red-50">
                      <div className="font-medium">{item.item_name}</div>
                      <div className="text-sm text-gray-600">
                        Expires: {new Date(item.expiry_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((supplier: any) => (
                  <div key={supplier.id} className="p-4 border rounded-lg">
                    <div className="font-medium text-lg">{supplier.supplier_name}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div>Contact: {supplier.contact_person}</div>
                      <div>Phone: {supplier.phone}</div>
                      <div>Email: {supplier.email}</div>
                    </div>
                    <Badge className="mt-2" variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                      {supplier.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Inventory Valuation Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Items</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {valuationReport?.total_items || 0}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Quantity</div>
                  <div className="text-2xl font-bold text-green-600">
                    {valuationReport?.total_quantity || 0}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Value</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(valuationReport?.total_value || 0).toLocaleString()} RWF
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Item Code</Label>
              <Input 
                value={itemForm.item_code}
                onChange={(e) => setItemForm({...itemForm, item_code: e.target.value})}
              />
            </div>
            <div>
              <Label>Item Name</Label>
              <Input 
                value={itemForm.item_name}
                onChange={(e) => setItemForm({...itemForm, item_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input 
                value={itemForm.category}
                onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
              />
            </div>
            <div>
              <Label>Unit of Measure</Label>
              <Input 
                value={itemForm.unit_of_measure}
                onChange={(e) => setItemForm({...itemForm, unit_of_measure: e.target.value})}
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input 
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm({...itemForm, quantity: e.target.value})}
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input 
                type="number"
                value={itemForm.unit_price}
                onChange={(e) => setItemForm({...itemForm, unit_price: e.target.value})}
              />
            </div>
            <div>
              <Label>Reorder Level</Label>
              <Input 
                type="number"
                value={itemForm.reorder_level}
                onChange={(e) => setItemForm({...itemForm, reorder_level: e.target.value})}
              />
            </div>
            <div>
              <Label>Storage Location</Label>
              <Input 
                value={itemForm.storage_location}
                onChange={(e) => setItemForm({...itemForm, storage_location: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPurchase} onOpenChange={setShowPurchase}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item</Label>
              <Select 
                value={purchaseForm.item_id}
                onValueChange={(value) => setPurchaseForm({...purchaseForm, item_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input 
                type="number"
                value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm({...purchaseForm, quantity: e.target.value})}
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input 
                type="number"
                value={purchaseForm.unit_price}
                onChange={(e) => setPurchaseForm({...purchaseForm, unit_price: e.target.value})}
              />
            </div>
            <div>
              <Label>Supplier</Label>
              <Select 
                value={purchaseForm.supplier_id}
                onValueChange={(value) => setPurchaseForm({...purchaseForm, supplier_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchase(false)}>Cancel</Button>
            <Button onClick={handleRecordPurchase}>Record Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDistribution} onOpenChange={setShowDistribution}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Distribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item</Label>
              <Select 
                value={distributionForm.item_id}
                onValueChange={(value) => setDistributionForm({...distributionForm, item_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input 
                type="number"
                value={distributionForm.quantity}
                onChange={(e) => setDistributionForm({...distributionForm, quantity: e.target.value})}
              />
            </div>
            <div>
              <Label>Recipient Name</Label>
              <Input 
                value={distributionForm.recipient_name}
                onChange={(e) => setDistributionForm({...distributionForm, recipient_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Purpose</Label>
              <Input 
                value={distributionForm.purpose}
                onChange={(e) => setDistributionForm({...distributionForm, purpose: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDistribution(false)}>Cancel</Button>
            <Button onClick={handleRecordDistribution}>Record Distribution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
