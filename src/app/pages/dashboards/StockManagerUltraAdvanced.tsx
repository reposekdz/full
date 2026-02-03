import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  CircularProgress,
  Badge,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Inventory,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  LocalShipping,
  WarningAmber,
  CheckCircle,
  Download,
  Search,
  FilterList,
  Refresh,
  Assessment,
  ArrowUpward,
  ArrowDownward,
  Category
} from '@mui/icons-material';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

interface StockItem {
  id: number;
  item_code: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  reorder_level: number;
  supplier: string;
  location: string;
  status: string;
  last_restocked: string;
  created_at: string;
}

interface Transaction {
  id: number;
  item_id: number;
  item_name: string;
  item_code: string;
  transaction_type: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  transaction_date: string;
  notes: string;
  issued_to_first_name: string;
  issued_to_last_name: string;
  issued_by_first_name: string;
  issued_by_last_name: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const StockManagerUltraAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [openBulkImport, setOpenBulkImport] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  
  const [newItem, setNewItem] = useState({
    item_code: '',
    item_name: '',
    category: '',
    quantity: 0,
    unit: 'pieces',
    unit_price: 0,
    reorder_level: 10,
    supplier: '',
    location: '',
    description: '',
    barcode: '',
    expiry_date: ''
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const MEASUREMENT_UNITS = [
    { value: 'pieces', label: 'Pieces (pcs)' },
    { value: 'kg', label: 'Kilograms (KG)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'l', label: 'Liters (L)' },
    { value: 'ml', label: 'Milliliters (mL)' },
    { value: 'm', label: 'Meters (M)' },
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'sqm', label: 'Square Meters (m²)' },
    { value: 'box', label: 'Boxes' },
    { value: 'pack', label: 'Packs' },
    { value: 'dozen', label: 'Dozens' },
    { value: 'set', label: 'Sets' },
    { value: 'unit', label: 'Units' }
  ];

  const STOCK_CATEGORIES = [
    'Electronics',
    'Office Supplies',
    'Stationery',
    'Cleaning Supplies',
    'IT Equipment',
    'Furniture',
    'Kitchen Supplies',
    'Workshop Tools',
    'Building Materials',
    'Safety Equipment',
    'Medical Supplies',
    'Sports Equipment',
    'Other'
  ];
  
  const [newTransaction, setNewTransaction] = useState({
    item_id: '',
    transaction_type: 'purchase',
    quantity: 0,
    unit_price: 0,
    issued_to: '',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    supplier: ''
  });

  useEffect(() => {
    fetchDashboard();
    fetchStockItems();
    fetchTransactions();
    fetchAnalytics();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/stock-ultra-advanced/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
    }
  };

  const fetchStockItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.supplier) params.append('supplier', filters.supplier);
      
      const response = await axios.get(
        `${API_BASE_URL}/stock-ultra-advanced/items?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setStockItems(response.data.items);
      }
    } catch (error) {
      console.error('Fetch stock items error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/stock-ultra-advanced/transactions?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/stock-ultra-advanced/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    }
  };

  const handleAddItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = isEditMode && selectedItem 
        ? `${API_BASE_URL}/stock-ultra-advanced/items/${selectedItem.id}`
        : `${API_BASE_URL}/stock-ultra-advanced/items`;
      
      const method = isEditMode ? 'put' : 'post';
      const response = await axios[method](url, newItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showAlert('success', isEditMode ? 'Item updated successfully!' : 'Item added successfully!');
        setOpenItemDialog(false);
        fetchStockItems();
        fetchDashboard();
        resetItemForm();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} item`);
    }
  };

  const handleEditItem = (item: StockItem) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setNewItem({
      item_code: item.item_code,
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      reorder_level: item.reorder_level,
      supplier: item.supplier || '',
      location: item.location || '',
      description: '',
      barcode: '',
      expiry_date: ''
    });
    setOpenItemDialog(true);
  };

  const handleDeleteItem = async (item_id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE_URL}/stock-ultra-advanced/items/${item_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', 'Item deleted successfully!');
        fetchStockItems();
        fetchDashboard();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to delete item');
    }
  };

  const resetItemForm = () => {
    setNewItem({
      item_code: '',
      item_name: '',
      category: '',
      quantity: 0,
      unit: 'pieces',
      unit_price: 0,
      reorder_level: 10,
      supplier: '',
      location: '',
      description: '',
      barcode: '',
      expiry_date: ''
    });
    setIsEditMode(false);
    setSelectedItem(null);
  };

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleAddTransaction = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/stock-ultra-advanced/transactions`,
        newTransaction,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert('Transaction recorded successfully!');
        setOpenTransactionDialog(false);
        fetchTransactions();
        fetchStockItems();
        fetchDashboard();
        fetchAnalytics();
        setNewTransaction({
          item_id: '',
          transaction_type: 'purchase',
          quantity: 0,
          unit_price: 0,
          issued_to: '',
          notes: '',
          transaction_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to record transaction'}`);
    }
  };

  const getStatusColor = (quantity: number, reorder_level: number) => {
    if (quantity === 0) return 'error';
    if (quantity <= reorder_level) return 'warning';
    return 'success';
  };

  const getStatusLabel = (quantity: number, reorder_level: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= reorder_level) return 'Low Stock';
    return 'In Stock';
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'primary';
      case 'issue':
        return 'secondary';
      case 'return':
        return 'success';
      case 'damaged':
        return 'error';
      case 'lost':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {dashboard?.summary?.total_items || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Total Items
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                <Inventory sx={{ color: 'white', fontSize: 32 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {dashboard?.summary?.out_of_stock || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Out of Stock
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                <WarningAmber sx={{ color: 'white', fontSize: 32 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #fdeb71 0%, #f8d800 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {dashboard?.summary?.low_stock || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Low Stock
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                <TrendingDown sx={{ color: 'white', fontSize: 32 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {dashboard?.summary?.total_value?.toLocaleString() || 0} RWF
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Total Value
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                <Assessment sx={{ color: 'white', fontSize: 32 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Stock by Category
            </Typography>
            {dashboard?.category_breakdown && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboard.category_breakdown}
                    dataKey="total_quantity"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {dashboard.category_breakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Consumption Trends
            </Typography>
            {dashboard?.monthly_consumption && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboard.monthly_consumption}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_quantity" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              Low Stock Alerts
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Reorder</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard?.low_stock_items?.slice(0, 5).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.quantity}
                          color={item.quantity === 0 ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{item.reorder_level}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard?.recent_transactions?.slice(0, 5).map((trans: any) => (
                    <TableRow key={trans.id}>
                      <TableCell>
                        <Chip
                          label={trans.transaction_type}
                          color={getTransactionTypeColor(trans.transaction_type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{trans.item_name}</TableCell>
                      <TableCell align="right">{trans.quantity}</TableCell>
                      <TableCell align="right">{trans.total_cost?.toLocaleString()} RWF</TableCell>
                      <TableCell>{new Date(trans.transaction_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderStockItems = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" gap={2}>
          <TextField
            placeholder="Search items..."
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'gray' }} />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              {STOCK_CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="in_stock">In Stock</MenuItem>
              <MenuItem value="low_stock">Low Stock</MenuItem>
              <MenuItem value="out_of_stock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={fetchStockItems}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setFilters({ search: '', category: '', status: '', supplier: '' });
              fetchStockItems();
            }}
          >
            Reset
          </Button>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            resetItemForm();
            setOpenItemDialog(true);
          }}
        >
          Add New Item
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}>Code</TableCell>
                <TableCell sx={{ color: 'white' }}>Item Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Category</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Quantity</TableCell>
                <TableCell sx={{ color: 'white' }}>Unit</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Unit Price</TableCell>
                <TableCell sx={{ color: 'white' }}>Supplier</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockItems.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.item_code}</TableCell>
                  <TableCell><strong>{item.item_name}</strong></TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" color="default" />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={item.quantity}
                      color={getStatusColor(item.quantity, item.reorder_level)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell align="right">{item.unit_price?.toLocaleString()} RWF</TableCell>
                  <TableCell>{item.supplier || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(item.quantity, item.reorder_level)}
                      color={getStatusColor(item.quantity, item.reorder_level)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="info">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEditItem(item)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderTransactions = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Transaction History</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenTransactionDialog(true)}
        >
          New Transaction
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Type</TableCell>
              <TableCell sx={{ color: 'white' }}>Item</TableCell>
              <TableCell sx={{ color: 'white' }} align="right">Quantity</TableCell>
              <TableCell sx={{ color: 'white' }} align="right">Total Cost</TableCell>
              <TableCell sx={{ color: 'white' }}>Issued To</TableCell>
              <TableCell sx={{ color: 'white' }}>Issued By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((trans) => (
              <TableRow key={trans.id} hover>
                <TableCell>{new Date(trans.transaction_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={trans.transaction_type}
                    color={getTransactionTypeColor(trans.transaction_type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2"><strong>{trans.item_name}</strong></Typography>
                  <Typography variant="caption" color="textSecondary">{trans.item_code}</Typography>
                </TableCell>
                <TableCell align="right">{trans.quantity}</TableCell>
                <TableCell align="right">{trans.total_cost?.toLocaleString()} RWF</TableCell>
                <TableCell>
                  {trans.issued_to_first_name && `${trans.issued_to_first_name} ${trans.issued_to_last_name}`}
                </TableCell>
                <TableCell>{trans.issued_by_first_name} {trans.issued_by_last_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
          Ultra-Advanced Stock Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
        >
          Export Report
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" />
        <Tab label="Stock Items" />
        <Tab label="Transactions" />
        <Tab label="Analytics" />
      </Tabs>

      {activeTab === 0 && dashboard && renderDashboard()}
      {activeTab === 1 && renderStockItems()}
      {activeTab === 2 && renderTransactions()}

      <Dialog open={openItemDialog} onClose={() => { setOpenItemDialog(false); resetItemForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Stock Item' : 'Add New Stock Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Code *"
                value={newItem.item_code}
                onChange={(e) => setNewItem({ ...newItem, item_code: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name *"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={newItem.category}
                  label="Category *"
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  {STOCK_CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity *"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Measurement Unit *</InputLabel>
                <Select
                  value={newItem.unit}
                  label="Measurement Unit *"
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                >
                  {MEASUREMENT_UNITS.map(unit => (
                    <MenuItem key={unit.value} value={unit.value}>{unit.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Price (RWF) *"
                type="number"
                value={newItem.unit_price}
                onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reorder Level *"
                type="number"
                value={newItem.reorder_level}
                onChange={(e) => setNewItem({ ...newItem, reorder_level: parseInt(e.target.value) || 10 })}
                required
                helperText="Alert when stock reaches this level"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={newItem.supplier}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Barcode / SKU"
                value={newItem.barcode}
                onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expiry Date (if applicable)"
                type="date"
                value={newItem.expiry_date}
                onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Storage Location"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                placeholder="e.g., Warehouse A, Shelf 3, Room 201"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description / Notes"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenItemDialog(false); resetItemForm(); }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddItem}
            disabled={!newItem.item_code || !newItem.item_name || !newItem.category}
          >
            {isEditMode ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTransactionDialog} onClose={() => setOpenTransactionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record New Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Stock Item</InputLabel>
                <Select
                  value={newTransaction.item_id}
                  label="Stock Item"
                  onChange={(e) => setNewTransaction({ ...newTransaction, item_id: e.target.value })}
                >
                  {stockItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.item_name} ({item.item_code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={newTransaction.transaction_type}
                  label="Transaction Type"
                  onChange={(e) => setNewTransaction({ ...newTransaction, transaction_type: e.target.value })}
                >
                  <MenuItem value="purchase">Purchase</MenuItem>
                  <MenuItem value="issue">Issue</MenuItem>
                  <MenuItem value="return">Return</MenuItem>
                  <MenuItem value="damaged">Damaged</MenuItem>
                  <MenuItem value="lost">Lost</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={newTransaction.quantity}
                onChange={(e) => setNewTransaction({ ...newTransaction, quantity: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={newTransaction.unit_price}
                onChange={(e) => setNewTransaction({ ...newTransaction, unit_price: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction Date"
                type="date"
                value={newTransaction.transaction_date}
                onChange={(e) => setNewTransaction({ ...newTransaction, transaction_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={newTransaction.notes}
                onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransactionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTransaction}>Record Transaction</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StockManagerUltraAdvanced;
