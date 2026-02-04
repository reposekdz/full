import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Building,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Download,
  Edit,
  FileText,
  Filter,
  Mail,
  Package,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line
} from 'recharts';
import LeftSidebar from '@/app/components/LeftSidebar';
import apiService from '@/app/services/apiService';

interface StockManagerDashboardProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

type StockItem = {
  id: number;
  item_name: string;
  item_code?: string;
  category?: string;
  description?: string;
  quantity: number;
  unit?: string;
  unit_price?: number;
  reorder_level?: number;
  location?: string;
  supplier?: string;
  supplier_contact?: string;
  status?: string;
  notes?: string;
};

type StockTransaction = {
  id: number;
  item_id: number;
  item_name?: string;
  item_code?: string;
  transaction_type: string;
  quantity: number;
  unit_price?: number;
  total_value?: number;
  transaction_date?: string;
  issued_to_name?: string;
  issued_to_lastname?: string;
  issued_by_name?: string;
  issued_by_lastname?: string;
  department?: string;
  purpose?: string;
  notes?: string;
};

type RequisitionItem = {
  id?: number;
  item_id?: number;
  item_name?: string;
  item_code?: string;
  unit?: string;
  quantity_requested?: number;
  quantity_approved?: number;
  purpose?: string;
};

type Requisition = {
  id: number;
  requisition_number?: string;
  status?: string;
  department?: string;
  request_date?: string;
  required_date?: string;
  requested_by_name?: string;
  requested_by_lastname?: string;
  approved_by_name?: string;
  approved_by_lastname?: string;
  items?: RequisitionItem[];
  notes?: string;
};

type ProcurementOrderItem = {
  id?: number;
  item_id?: number;
  item_name?: string;
  item_code?: string;
  unit?: string;
  quantity_ordered?: number;
  unit_price?: number;
  total_price?: number;
};

type ProcurementOrder = {
  id: number;
  order_number?: string;
  supplier?: string;
  supplier_contact?: string;
  status?: string;
  order_date?: string;
  expected_delivery_date?: string;
  total_amount?: number;
  ordered_by_name?: string;
  ordered_by_lastname?: string;
  received_by_name?: string;
  received_by_lastname?: string;
  items?: ProcurementOrderItem[];
  notes?: string;
};

type Supplier = {
  id: number;
  supplier_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
  status?: string;
  notes?: string;
};

type StockNotification = {
  id: number;
  title?: string;
  message?: string;
  priority?: string;
  created_at?: string;
};

const buildDefaultItemForm = () => ({
  item_name: '',
  item_code: '',
  category: '',
  description: '',
  quantity: '',
  unit: 'pcs',
  unit_price: '',
  reorder_level: '10',
  location: '',
  supplier: '',
  supplier_contact: '',
  notes: ''
});

const buildDefaultTransactionForm = () => ({
  item_id: '',
  transaction_type: 'purchase',
  quantity: '',
  unit_price: '',
  transaction_date: new Date().toISOString().split('T')[0],
  reference_number: '',
  issued_to: '',
  department: '',
  purpose: '',
  notes: ''
});

const buildDefaultRequisitionForm = () => ({
  department: '',
  required_date: '',
  notes: '',
  items: [{ item_id: '', quantity: '', purpose: '' }]
});

const buildDefaultProcurementForm = () => ({
  supplier: '',
  supplier_contact: '',
  expected_delivery_date: '',
  notes: '',
  items: [{ item_id: '', item_name: '', quantity: '', unit_price: '' }]
});

const buildDefaultSupplierForm = () => ({
  supplier_name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  category: '',
  notes: ''
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0
  }).format(amount || 0);

const parseNumber = (value: string, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const downloadCsv = (filename: string, rows: Record<string, any>[]) => {
  if (!rows.length) {
    toast.error('No data to export');
    return;
  }

  const headers = Object.keys(rows[0]);
  const escapeValue = (value: any) => {
    const stringValue = value === null || value === undefined ? '' : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => escapeValue(row[key])).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const StockManagerComprehensiveDashboard: React.FC<StockManagerDashboardProps> = ({
  onNavigate,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [procurementOrders, setProcurementOrders] = useState<ProcurementOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [notifications, setNotifications] = useState<StockNotification[]>([]);

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all'
  });

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [requisitionDialogOpen, setRequisitionDialogOpen] = useState(false);
  const [procurementDialogOpen, setProcurementDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const [itemForm, setItemForm] = useState(buildDefaultItemForm);
  const [transactionForm, setTransactionForm] = useState(buildDefaultTransactionForm);
  const [requisitionForm, setRequisitionForm] = useState(buildDefaultRequisitionForm);
  const [procurementForm, setProcurementForm] = useState(buildDefaultProcurementForm);
  const [supplierForm, setSupplierForm] = useState(buildDefaultSupplierForm);

  const buildItemParams = () => {
    const params: any = { limit: 100 };
    if (filters.search) params.search = filters.search;
    if (filters.category !== 'all' && filters.category) params.category = filters.category;
    if (filters.status !== 'all' && filters.status) params.status = filters.status;
    return params;
  };

  const fetchItems = async () => {
    try {
      const res = await apiService.getStockItems(buildItemParams());
      if (res?.success) {
        setItems(res.items || []);
      }
    } catch (error) {
      toast.error('Failed to load items');
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        itemsRes,
        transactionsRes,
        requisitionsRes,
        procurementRes,
        suppliersRes,
        notificationsRes
      ] = await Promise.all([
        apiService.getStockStats(),
        apiService.getStockItems(buildItemParams()),
        apiService.getStockTransactions({ limit: 50 }),
        apiService.getStockRequisitions({ limit: 50 }),
        apiService.getStockProcurementOrders({ limit: 50 }),
        apiService.getStockSuppliers({}),
        apiService.getStockNotifications()
      ]);

      if (statsRes?.success) setStats(statsRes);
      if (itemsRes?.success) setItems(itemsRes.items || []);
      if (transactionsRes?.success) setTransactions(transactionsRes.transactions || []);
      if (requisitionsRes?.success) setRequisitions(requisitionsRes.requisitions || []);
      if (procurementRes?.success) setProcurementOrders(procurementRes.orders || []);
      if (suppliersRes?.success) setSuppliers(suppliersRes.suppliers || []);
      if (notificationsRes?.success) setNotifications(notificationsRes.notifications || []);
    } catch (error) {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [filters.search, filters.category, filters.status]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    (stats?.byCategory || []).forEach((cat: any) => {
      if (cat.category) categorySet.add(cat.category);
    });
    items.forEach((item) => {
      if (item.category) categorySet.add(item.category);
    });
    return Array.from(categorySet);
  }, [stats, items]);

  const totalValue = useMemo(() => {
    if (stats?.totals?.total_value) return stats.totals.total_value;
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0);
  }, [stats, items]);

  const categoryChartData = useMemo(() => {
    return (stats?.byCategory || []).map((cat: any) => ({
      name: cat.category,
      value: cat.category_value || 0,
      items: cat.item_count || 0
    }));
  }, [stats]);

  const movementChartData = useMemo(() => {
    const map = new Map<string, { date: string; stock_in: number; stock_out: number }>();
    const days = 7;
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      map.set(key, { date: key, stock_in: 0, stock_out: 0 });
    }
    transactions.forEach((tx) => {
      if (!tx.transaction_date) return;
      const key = tx.transaction_date.split('T')[0];
      if (!map.has(key)) return;
      const entry = map.get(key)!;
      if (['purchase', 'return', 'initial', 'in'].includes(tx.transaction_type)) {
        entry.stock_in += tx.quantity || 0;
      } else {
        entry.stock_out += tx.quantity || 0;
      }
    });
    return Array.from(map.values());
  }, [transactions]);

  const getItemStatus = (item: StockItem) => {
    if (item.status) return item.status;
    if (item.quantity === 0) return 'out_of_stock';
    if (item.quantity <= (item.reorder_level || 10)) return 'low_stock';
    return 'available';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'bg-red-100 text-red-700';
      case 'low_stock':
        return 'bg-orange-100 text-orange-700';
      case 'available':
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getTransactionBadge = (type: string) => {
    if (['purchase', 'return', 'initial', 'in'].includes(type)) return 'bg-green-100 text-green-700';
    if (['issue', 'damage', 'loss', 'out'].includes(type)) return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  const resetItemDialog = () => {
    setEditingItem(null);
    setItemForm(buildDefaultItemForm());
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    setItemForm({
      item_name: item.item_name || '',
      item_code: item.item_code || '',
      category: item.category || '',
      description: item.description || '',
      quantity: String(item.quantity ?? ''),
      unit: item.unit || 'pcs',
      unit_price: String(item.unit_price ?? ''),
      reorder_level: String(item.reorder_level ?? '10'),
      location: item.location || '',
      supplier: item.supplier || '',
      supplier_contact: item.supplier_contact || '',
      notes: item.notes || ''
    });
    setItemDialogOpen(true);
  };
