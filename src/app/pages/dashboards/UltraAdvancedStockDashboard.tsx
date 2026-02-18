/**
 * Ultra Advanced Stock Manager Dashboard
 * Real API Integration, Modern Design
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Card, CardContent, CardHeader, Typography, Button, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Paper, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Divider, IconButton,
  useTheme, Avatar, Stack, Grid, AppBar, Toolbar, createTheme, ThemeProvider, CssBaseline,
  InputAdornment
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Inventory, ShoppingCart, LocalShipping, Edit, Delete, Add,
  Search, Visibility, Assessment, TrendingUp, TrendingDown, Warning, CheckCircle, Cancel,
  Notifications, Settings, SwapVert, FileDownload, Close, Check, Folder, LocationOn
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'sonner';
import * as stockApi from '@/app/services/stockAdvancedApi';

interface DashboardStats {
  total_items: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  total_value: number;
}

interface StockItem {
  id: number;
  item_code: string;
  item_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  reorder_level: number;
}

interface Transaction {
  id: number;
  item_name: string;
  transaction_type: string;
  quantity: number;
  transaction_date: string;
}

interface Supplier {
  id: number;
  supplier_code: string;
  supplier_name: string;
  contact_person: string;
  phone: string;
}

interface AlertData {
  id: number;
  item_name: string;
  message: string;
  severity: string;
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    secondary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: { default: '#f8fafc', paper: '#ffffff' }
  },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
  shape: { borderRadius: 12 }
});

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#06b6d4'];

export default function UltraAdvancedStockDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total_items: 0, in_stock: 0, low_stock: 0, out_of_stock: 0, total_value: 0
  });

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [stockTakes, setStockTakes] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);

  const [newItem, setNewItem] = useState({
    item_code: '', item_name: '', category: '', quantity: 0, unit_price: 0, reorder_level: 10, supplier: '', location: ''
  });

  const [newTransaction, setNewTransaction] = useState({
    item_id: 0, transaction_type: 'purchase', quantity: 1
  });

  const [newSupplier, setNewSupplier] = useState({
    supplier_code: '', supplier_name: '', contact_person: '', phone: ''
  });

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardRes, itemsRes, transactionsRes, suppliersRes, categoriesRes, alertsRes, ordersRes, stockTakesRes, analyticsRes] = await Promise.all([
        stockApi.fetchStockDashboard(),
        stockApi.fetchStockItems({ page: page + 1, limit: rowsPerPage }),
        stockApi.fetchStockTransactions({ limit: 50 }),
        stockApi.fetchSuppliers({}),
        stockApi.fetchCategories(),
        stockApi.fetchAlerts({ is_resolved: false }),
        stockApi.fetchPurchaseOrders(),
        stockApi.fetchStockTakes(),
        stockApi.fetchStockAnalytics('month')
      ]);

      if (dashboardRes.success) {
        const d = dashboardRes.dashboard?.summary || {};
        setStats({
          total_items: d.total_items || 0,
          in_stock: d.in_stock || 0,
          low_stock: d.low_stock || 0,
          out_of_stock: d.out_of_stock || 0,
          total_value: d.total_value || 0
        });
      }

      if (itemsRes.success) setStockItems(itemsRes.items || []);
      if (transactionsRes.success) setTransactions(transactionsRes.transactions || []);
      if (suppliersRes.success) setSuppliers(suppliersRes.suppliers || []);
      if (categoriesRes.success) setCategories(categoriesRes.categories?.map((c: any) => c.category_name) || []);
      if (alertsRes.success) setAlerts(alertsRes.alerts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleCreateItem = async () => {
    try {
      const result = await stockApi.createStockItem(newItem);
      if (result.success) {
        toast.success('Stock item created');
        setOpenItemDialog(false);
        setNewItem({ item_code: '', item_name: '', category: '', quantity: 0, unit_price: 0, reorder_level: 10, supplier: '', location: '' });
        fetchAllData();
      }
    } catch (error) { toast.error('Failed to create item'); }
  };

  const handleCreateTransaction = async () => {
    try {
      const result = await stockApi.createStockTransaction(newTransaction);
      if (result.success) {
        toast.success('Transaction recorded');
        setOpenTransactionDialog(false);
        setNewTransaction({ item_id: 0, transaction_type: 'purchase', quantity: 1 });
        fetchAllData();
      }
    } catch (error) { toast.error('Failed to record transaction'); }
  };

  const handleCreateSupplier = async () => {
    try {
      const result = await stockApi.createSupplier(newSupplier);
      if (result.success) {
        toast.success('Supplier created');
        setOpenSupplierDialog(false);
        setNewSupplier({ supplier_code: '', supplier_name: '', contact_person: '', phone: '' });
        fetchAllData();
      }
    } catch (error) { toast.error('Failed to create supplier'); }
  };

  const stockDistribution = [
    { name: 'In Stock', value: stats.in_stock, color: '#10b981' },
    { name: 'Low Stock', value: stats.low_stock, color: '#f59e0b' },
    { name: 'Out of Stock', value: stats.out_of_stock, color: '#ef4444' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
          <Toolbar>
            <Inventory sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Stock Manager Ultra</Typography>
            <IconButton><Notifications /></IconButton>
            <IconButton><Settings /></IconButton>
            <Avatar sx={{ ml: 2, bgcolor: 'primary.main' }}>{user?.first_name?.[0] || 'S'}</Avatar>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {[
              { title: 'Total Items', value: stats.total_items, color: '#6366f1' },
              { title: 'In Stock', value: stats.in_stock, color: '#10b981' },
              { title: 'Low Stock', value: stats.low_stock, color: '#f59e0b' },
              { title: 'Out of Stock', value: stats.out_of_stock, color: '#ef4444' },
              { title: 'Total Value', value: `$${(stats.total_value / 1000).toFixed(1)}K`, color: '#06b6d4' }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${stat.color}15`, display: 'inline-flex', mb: 1 }}>
                      <Typography sx={{ color: stat.color, fontWeight: 'bold', fontSize: '1.5rem' }}>{stat.value}</Typography>
                    </Box>
                    <Typography color="text.secondary">{stat.title}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Stock Distribution" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={stockDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                        {stockDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Quick Actions" />
                <CardContent>
                  <Stack spacing={2}>
                    <Button variant="contained" onClick={() => setOpenItemDialog(true)}>Add Stock Item</Button>
                    <Button variant="contained" onClick={() => setOpenTransactionDialog(true)}>Record Transaction</Button>
                    <Button variant="contained" onClick={() => setOpenSupplierDialog(true)}>Add Supplier</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {alerts.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardHeader title={`${alerts.length} Active Alerts`} />
              <CardContent>
                {alerts.slice(0, 3).map((alert) => (
                  <Alert key={alert.id} severity="warning" sx={{ mb: 1 }}>
                    {alert.item_name}: {alert.message}
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          <Card sx={{ mt: 3 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab icon={<DashboardIcon />} label="Dashboard" />
              <Tab icon={<Inventory />} label="Stock Items" />
              <Tab icon={<SwapVert />} label="Transactions" />
              <Tab icon={<LocalShipping />} label="Suppliers" />
              <Tab icon={<Folder />} label="Categories" />
              <Tab icon={<LocationOn />} label="Locations" />
              <Tab icon={<Warning />} label="Alerts" />
              <Tab icon={<ShoppingCart />} label="Orders" />
              <Tab icon={<Assessment />} label="Stock Takes" />
              <Tab icon={<BarChart />} label="Analytics" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Typography>Welcome to Stock Manager Ultra - Real-time inventory management</Typography>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <TextField placeholder="Search..." size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
                <Button variant="contained" onClick={() => setOpenItemDialog(true)}>Add Item</Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f59e0b' }}>
                      <TableHead sx={{ color: 'white' }}>Code</TableHead>
                      <TableHead sx={{ color: 'white' }}>Name</TableHead>
                      <TableHead sx={{ color: 'white' }}>Category</TableHead>
                      <TableHead sx={{ color: 'white' }}>Qty</TableHead>
                      <TableHead sx={{ color: 'white' }}>Price</TableHead>
                      <TableHead sx={{ color: 'white' }}>Status</TableHead>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, i) => (
                      <TableRow key={i} hover>
                        <TableCell>{item.item_code}</TableCell>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price}</TableCell>
                        <TableCell>
                          <Chip label={item.quantity === 0 ? 'Out' : item.quantity <= item.reorder_level ? 'Low' : 'OK'}
                            color={item.quantity === 0 ? 'error' : item.quantity <= item.reorder_level ? 'warning' : 'success'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination component="div" count={stockItems.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#6366f1' }}>
                      <TableHead sx={{ color: 'white' }}>Date</TableHead>
                      <TableHead sx={{ color: 'white' }}>Item</TableHead>
                      <TableHead sx={{ color: 'white' }}>Type</TableHead>
                      <TableHead sx={{ color: 'white' }}>Quantity</TableHead>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.slice(0, 20).map((tx, i) => (
                      <TableRow key={i}>
                        <TableCell>{tx.transaction_date}</TableCell>
                        <TableCell>{tx.item_name}</TableCell>
                        <TableCell><Chip label={tx.transaction_type} size="small" /></TableCell>
                        <TableCell>{tx.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenSupplierDialog(true)}>Add Supplier</Button>
              <Grid container spacing={2}>
                {suppliers.map((supplier, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card>
                      <CardHeader title={supplier.supplier_name} subheader={supplier.supplier_code} />
                      <CardContent>
                        <Typography variant="body2">{supplier.contact_person}</Typography>
                        <Typography variant="body2" color="text.secondary">{supplier.phone}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <Typography variant="h6" gutterBottom>Categories</Typography>
              <Grid container spacing={2}>
                {categories.map((cat, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card><CardContent><Typography>{cat}</Typography></CardContent></Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={5}>
              <Typography variant="h6" gutterBottom>Locations</Typography>
              <Typography color="text.secondary">Storage locations management coming soon</Typography>
            </TabPanel>

            <TabPanel value={activeTab} index={6}>
              <Typography variant="h6" gutterBottom>Alerts ({alerts.length})</Typography>
              {alerts.map((alert, i) => (
                <Alert key={i} severity="warning" sx={{ mb: 1 }}>{alert.item_name}: {alert.message}</Alert>
              ))}
            </TabPanel>

            <TabPanel value={activeTab} index={7}>
              <Typography variant="h6" gutterBottom>Purchase Orders</Typography>
              <Typography color="text.secondary">Purchase orders management coming soon</Typography>
            </TabPanel>

            <TabPanel value={activeTab} index={8}>
              <Typography variant="h6" gutterBottom>Stock Takes</Typography>
              <Typography color="text.secondary">Stock takes management coming soon</Typography>
            </TabPanel>

            <TabPanel value={activeTab} index={9}>
              <Typography variant="h6" gutterBottom>Analytics</Typography>
              <Typography color="text.secondary">Stock analytics and reports coming soon</Typography>
            </TabPanel>
          </Card>
        </Container>

        <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Stock Item</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Item Code" value={newItem.item_code} onChange={(e) => setNewItem({...newItem, item_code: e.target.value})} fullWidth required />
              <TextField label="Item Name" value={newItem.item_name} onChange={(e) => setNewItem({...newItem, item_name: e.target.value})} fullWidth required />
              <TextField label="Category" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} fullWidth />
              <TextField label="Quantity" type="number" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})} fullWidth />
              <TextField label="Unit Price" type="number" value={newItem.unit_price} onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value)})} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenItemDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateItem}>Create</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openTransactionDialog} onClose={() => setOpenTransactionDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Item</InputLabel>
                <Select value={newTransaction.item_id} onChange={(e) => setNewTransaction({...newTransaction, item_id: Number(e.target.value)})} label="Item">
                  {stockItems.map((item) => <MenuItem key={item.id} value={item.id}>{item.item_name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={newTransaction.transaction_type} onChange={(e) => setNewTransaction({...newTransaction, transaction_type: e.target.value})} label="Type">
                  <MenuItem value="purchase">Purchase</MenuItem>
                  <MenuItem value="stock_in">Stock In</MenuItem>
                  <MenuItem value="stock_out">Stock Out</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Quantity" type="number" value={newTransaction.quantity} onChange={(e) => setNewTransaction({...newTransaction, quantity: parseInt(e.target.value)})} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTransactionDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateTransaction}>Record</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openSupplierDialog} onClose={() => setOpenSupplierDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Supplier</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Code" value={newSupplier.supplier_code} onChange={(e) => setNewSupplier({...newSupplier, supplier_code: e.target.value})} fullWidth required />
              <TextField label="Name" value={newSupplier.supplier_name} onChange={(e) => setNewSupplier({...newSupplier, supplier_name: e.target.value})} fullWidth required />
              <TextField label="Contact" value={newSupplier.contact_person} onChange={(e) => setNewSupplier({...newSupplier, contact_person: e.target.value})} fullWidth />
              <TextField label="Phone" value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSupplierDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateSupplier}>Create</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
