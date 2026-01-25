import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  TrendingUp, 
  Boxes,
  FileText,
  BarChart3,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Store,
  ClipboardList,
  Target,
  Bell,
  TrendingDown,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import LeftSidebar from '@/app/components/LeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';

interface StockManagerDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const StockManagerDashboard: React.FC<StockManagerDashboardProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      title: 'Ibintu Byose',
      value: '2,458',
      change: '+8.2%',
      trend: 'up',
      icon: Package,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ibicye',
      value: '47',
      change: '+12%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Ibisabwa',
      value: '23',
      change: '-5.3%',
      trend: 'down',
      icon: ShoppingCart,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Byakoreshejwe',
      value: 'RWF 8.5M',
      change: '+15.8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
  ];

  const recentActivities = [
    {
      action: 'Ibitabo 50 byinjiye',
      category: 'Academics',
      user: 'Jean Mugisha',
      time: '1 isaha ishize',
      type: 'stock_in',
      priority: 'normal'
    },
    {
      action: 'Ibikoresho by\'Ubwizerezi byasabwe',
      category: 'IT',
      user: 'Marie Uwase',
      time: '2 amasaha ashize',
      type: 'requisition',
      priority: 'high'
    },
    {
      action: 'Ibikoresho bya Siporo byasohotse',
      category: 'Sports',
      user: 'Patrick Nkusi',
      time: '4 amasaha ashize',
      type: 'stock_out',
      priority: 'normal'
    },
    {
      action: 'Gutanga ibintu bishya',
      category: 'Maintenance',
      user: 'Alice Uwera',
      time: '1 umunsi ushize',
      type: 'order',
      priority: 'medium'
    },
  ];

  const stockAlerts = [
    { item: 'A4 Paper', quantity: 45, threshold: 100, status: 'low', category: 'Office Supplies' },
    { item: 'Whiteboard Markers', quantity: 12, threshold: 50, status: 'critical', category: 'Teaching Materials' },
    { item: 'Lab Chemicals', quantity: 78, threshold: 100, status: 'low', category: 'Science' },
    { item: 'Sports Equipment', quantity: 5, threshold: 20, status: 'critical', category: 'Sports' },
  ];

  const inventoryItems = [
    {
      id: 'ITM001',
      name: 'A4 Paper (Ream)',
      category: 'Office Supplies',
      quantity: 450,
      unit: 'reams',
      location: 'Storage Room A',
      value: 'RWF 225,000',
      status: 'in_stock',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'ITM002',
      name: 'Whiteboard Markers',
      category: 'Teaching Materials',
      quantity: 12,
      unit: 'boxes',
      location: 'Storage Room B',
      value: 'RWF 36,000',
      status: 'low_stock',
      lastUpdated: '2025-01-18'
    },
    {
      id: 'ITM003',
      name: 'Lab Chemicals Set',
      category: 'Science',
      quantity: 78,
      unit: 'sets',
      location: 'Science Lab',
      value: 'RWF 1,950,000',
      status: 'low_stock',
      lastUpdated: '2025-01-16'
    },
    {
      id: 'ITM004',
      name: 'Textbooks - Math S3',
      category: 'Academics',
      quantity: 250,
      unit: 'books',
      location: 'Library',
      value: 'RWF 5,000,000',
      status: 'in_stock',
      lastUpdated: '2025-01-10'
    },
    {
      id: 'ITM005',
      name: 'Sports Equipment',
      category: 'Sports',
      quantity: 5,
      unit: 'sets',
      location: 'Sports Room',
      value: 'RWF 750,000',
      status: 'critical',
      lastUpdated: '2025-01-19'
    },
  ];

  const procurementOrders = [
    {
      id: 'PO001',
      supplier: 'ABC Supplies Ltd',
      items: 'Office Supplies Package',
      quantity: 500,
      amount: 'RWF 2,500,000',
      orderDate: '2025-01-15',
      expectedDate: '2025-01-25',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'PO002',
      supplier: 'Tech Solutions',
      items: 'IT Equipment',
      quantity: 25,
      amount: 'RWF 5,000,000',
      orderDate: '2025-01-12',
      expectedDate: '2025-01-22',
      status: 'in_transit',
      priority: 'high'
    },
    {
      id: 'PO003',
      supplier: 'Sports World',
      items: 'Sports Equipment',
      quantity: 15,
      amount: 'RWF 1,200,000',
      orderDate: '2025-01-18',
      expectedDate: '2025-01-28',
      status: 'approved',
      priority: 'medium'
    },
    {
      id: 'PO004',
      supplier: 'Book Center',
      items: 'Textbooks',
      quantity: 300,
      amount: 'RWF 6,000,000',
      orderDate: '2025-01-10',
      expectedDate: '2025-01-20',
      status: 'delivered',
      priority: 'normal'
    },
    {
      id: 'PO005',
      supplier: 'Lab Supplies Co',
      items: 'Science Lab Equipment',
      quantity: 50,
      amount: 'RWF 3,500,000',
      orderDate: '2025-01-16',
      expectedDate: '2025-01-26',
      status: 'pending',
      priority: 'high'
    },
  ];

  const requisitions = [
    {
      id: 'REQ001',
      requestedBy: 'Dr. Jean Mugabo',
      department: 'Mathematics',
      items: 'Graph Paper, Rulers',
      quantity: 50,
      date: '2025-01-19',
      status: 'pending',
      priority: 'medium',
      estimatedCost: 'RWF 45,000'
    },
    {
      id: 'REQ002',
      requestedBy: 'Prof. Marie Uwase',
      department: 'Sciences',
      items: 'Lab Chemicals',
      quantity: 20,
      date: '2025-01-18',
      status: 'approved',
      priority: 'high',
      estimatedCost: 'RWF 500,000'
    },
    {
      id: 'REQ003',
      requestedBy: 'Mr. Patrick Nkusi',
      department: 'Languages',
      items: 'Dictionaries',
      quantity: 30,
      date: '2025-01-17',
      status: 'approved',
      priority: 'low',
      estimatedCost: 'RWF 150,000'
    },
    {
      id: 'REQ004',
      requestedBy: 'Coach David',
      department: 'Sports',
      items: 'Basketballs, Nets',
      quantity: 10,
      date: '2025-01-16',
      status: 'completed',
      priority: 'medium',
      estimatedCost: 'RWF 200,000'
    },
    {
      id: 'REQ005',
      requestedBy: 'IT Manager',
      department: 'IT',
      items: 'Network Cables',
      quantity: 100,
      date: '2025-01-20',
      status: 'pending',
      priority: 'high',
      estimatedCost: 'RWF 180,000'
    },
  ];

  const suppliers = [
    {
      name: 'ABC Supplies Ltd',
      contact: 'John Doe',
      phone: '+250 788 123 456',
      email: 'info@abcsupplies.rw',
      category: 'Office Supplies',
      performance: 95,
      orders: 45,
      totalValue: 'RWF 25M',
      status: 'active'
    },
    {
      name: 'Tech Solutions',
      contact: 'Jane Smith',
      phone: '+250 788 234 567',
      email: 'sales@techsolutions.rw',
      category: 'IT Equipment',
      performance: 88,
      orders: 28,
      totalValue: 'RWF 35M',
      status: 'active'
    },
    {
      name: 'Book Center',
      contact: 'Peter Mugabo',
      phone: '+250 788 345 678',
      email: 'contact@bookcenter.rw',
      category: 'Books & Educational',
      performance: 92,
      orders: 67,
      totalValue: 'RWF 45M',
      status: 'active'
    },
    {
      name: 'Sports World',
      contact: 'Alice Uwera',
      phone: '+250 788 456 789',
      email: 'info@sportsworld.rw',
      category: 'Sports Equipment',
      performance: 85,
      orders: 23,
      totalValue: 'RWF 15M',
      status: 'active'
    },
    {
      name: 'Lab Supplies Co',
      contact: 'David Nkusi',
      phone: '+250 788 567 890',
      email: 'sales@labsupplies.rw',
      category: 'Science Equipment',
      performance: 90,
      orders: 34,
      totalValue: 'RWF 28M',
      status: 'active'
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-white overflow-hidden">
      <UniversalMessagingWidget />
      <LeftSidebar currentPage="stock-manager-dashboard" onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                  Dashbord y'Ibikoresho
                </h1>
                <p className="text-gray-600">Gukurikirana ibikoresho n'ibintu by'ishuri</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Ongeraho
                </Button>
                <Button variant="outline" className="border-2 border-yellow-200 hover:bg-yellow-50">
                  <Download className="h-4 w-4 mr-2" />
                  Raporo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-2 border-yellow-200 hover:shadow-lg transition-all ${stat.bgColor}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex items-center space-x-1">
                            {stat.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto bg-white border-2 border-yellow-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Incamake
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Ibikoresho
              </TabsTrigger>
              <TabsTrigger value="procurement" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Kugura
              </TabsTrigger>
              <TabsTrigger value="requisitions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Ibisabwa
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Abatanga
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Raporo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Bell className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibikorwa Biheruka
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {recentActivities.map((activity, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{activity.action}</h4>
                                <p className="text-xs text-gray-600 mt-1">{activity.category}</p>
                              </div>
                              <Badge className={
                                activity.type === 'stock_in' ? 'bg-green-100 text-green-700' :
                                activity.type === 'stock_out' ? 'bg-red-100 text-red-700' :
                                activity.type === 'requisition' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {activity.type === 'stock_in' ? 'Byinjiye' :
                                 activity.type === 'stock_out' ? 'Byasohotse' :
                                 activity.type === 'requisition' ? 'Byasabwe' : 'Gutanga'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{activity.user}</span>
                              <span>{activity.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibintu Bicyeho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {stockAlerts.map((alert, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{alert.item}</h4>
                                <p className="text-xs text-gray-600">{alert.category}</p>
                              </div>
                              <Badge className={
                                alert.status === 'critical' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }>
                                {alert.status === 'critical' ? 'Bikomeye' : 'Bicyeho'}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Umubare: {alert.quantity}</span>
                                <span className="text-gray-600">Urugero: {alert.threshold}</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    alert.status === 'critical' 
                                      ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                                      : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                                  }`}
                                  style={{ width: `${(alert.quantity / alert.threshold) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Package className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibikoresho Byose
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-2 border-yellow-200 focus:border-yellow-400"
                      />
                      <Button variant="outline" className="border-2 border-yellow-200">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                          <th className="text-left p-4 font-bold text-gray-900">ID</th>
                          <th className="text-left p-4 font-bold text-gray-900">Izina</th>
                          <th className="text-left p-4 font-bold text-gray-900">Icyiciro</th>
                          <th className="text-left p-4 font-bold text-gray-900">Umubare</th>
                          <th className="text-left p-4 font-bold text-gray-900">Aho Biri</th>
                          <th className="text-left p-4 font-bold text-gray-900">Agaciro</th>
                          <th className="text-left p-4 font-bold text-gray-900">Uko Bimeze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Itariki</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryItems.map((item, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-4">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                {item.id}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-gray-900">{item.name}</td>
                            <td className="p-4 text-gray-700">{item.category}</td>
                            <td className="p-4">
                              <span className="font-bold text-gray-900">{item.quantity}</span>
                              <span className="text-xs text-gray-600 ml-1">{item.unit}</span>
                            </td>
                            <td className="p-4 text-gray-700">{item.location}</td>
                            <td className="p-4 font-medium text-gray-900">{item.value}</td>
                            <td className="p-4">
                              <Badge className={
                                item.status === 'in_stock' ? 'bg-green-100 text-green-700' :
                                item.status === 'low_stock' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }>
                                {item.status === 'in_stock' ? 'Birahari' :
                                 item.status === 'low_stock' ? 'Bicyeho' : 'Byarenzwe'}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-700">{item.lastUpdated}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Edit className="h-4 w-4" />
                                </Button>
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

            <TabsContent value="procurement" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <ShoppingCart className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibisabwa kwa Batanga
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-2 border-yellow-200 focus:border-yellow-400"
                      />
                      <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                        <Plus className="h-4 w-4 mr-2" />
                        Ongeraho
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                          <th className="text-left p-4 font-bold text-gray-900">ID</th>
                          <th className="text-left p-4 font-bold text-gray-900">Uwatanze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibintu</th>
                          <th className="text-left p-4 font-bold text-gray-900">Umubare</th>
                          <th className="text-left p-4 font-bold text-gray-900">Amafaranga</th>
                          <th className="text-left p-4 font-bold text-gray-900">Itariki</th>
                          <th className="text-left p-4 font-bold text-gray-900">Itegerejwe</th>
                          <th className="text-left p-4 font-bold text-gray-900">Uko Bimeze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {procurementOrders.map((order, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-4">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                {order.id}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-gray-900">{order.supplier}</td>
                            <td className="p-4 text-gray-700">{order.items}</td>
                            <td className="p-4 font-medium text-gray-900">{order.quantity}</td>
                            <td className="p-4 font-bold text-gray-900">{order.amount}</td>
                            <td className="p-4 text-gray-700">{order.orderDate}</td>
                            <td className="p-4 text-gray-700">{order.expectedDate}</td>
                            <td className="p-4">
                              <Badge className={
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'approved' ? 'bg-purple-100 text-purple-700' :
                                'bg-orange-100 text-orange-700'
                              }>
                                {order.status === 'delivered' ? 'Byashitse' :
                                 order.status === 'in_transit' ? 'Mu rugendo' :
                                 order.status === 'approved' ? 'Byemejwe' : 'Birategerezwa'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Edit className="h-4 w-4" />
                                </Button>
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

            <TabsContent value="requisitions" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <ClipboardList className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibisabwa n'Abakozi
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-2 border-yellow-200 focus:border-yellow-400"
                      />
                      <Button variant="outline" className="border-2 border-yellow-200">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                          <th className="text-left p-4 font-bold text-gray-900">ID</th>
                          <th className="text-left p-4 font-bold text-gray-900">Uwasabye</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ishami</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibintu</th>
                          <th className="text-left p-4 font-bold text-gray-900">Umubare</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ikigereranyo</th>
                          <th className="text-left p-4 font-bold text-gray-900">Itariki</th>
                          <th className="text-left p-4 font-bold text-gray-900">Uko Bimeze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requisitions.map((req, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-4">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                {req.id}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-gray-900">{req.requestedBy}</td>
                            <td className="p-4 text-gray-700">{req.department}</td>
                            <td className="p-4 text-gray-700">{req.items}</td>
                            <td className="p-4 font-medium text-gray-900">{req.quantity}</td>
                            <td className="p-4 font-medium text-gray-900">{req.estimatedCost}</td>
                            <td className="p-4 text-gray-700">{req.date}</td>
                            <td className="p-4">
                              <Badge className={
                                req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                req.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                req.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }>
                                {req.status === 'completed' ? 'Byarangiye' :
                                 req.status === 'approved' ? 'Byemejwe' :
                                 req.status === 'pending' ? 'Birategerezwa' : 'Byanze'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {req.status === 'pending' && (
                                  <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
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

            <TabsContent value="suppliers" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Store className="h-5 w-5 mr-2 text-yellow-600" />
                      Abatanga Ibikoresho
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-2 border-yellow-200 focus:border-yellow-400"
                      />
                      <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                        <Plus className="h-4 w-4 mr-2" />
                        Ongeraho
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suppliers.map((supplier, index) => (
                      <Card key={index} className="border-2 border-yellow-100 hover:border-yellow-300 transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-black text-gray-900 text-lg">{supplier.name}</h3>
                              <p className="text-sm text-gray-600">{supplier.category}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">
                              {supplier.status === 'active' ? 'Irakora' : 'Irahagaritse'}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-700">
                              <Users className="h-4 w-4 mr-2 text-yellow-600" />
                              <span>{supplier.contact}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <Phone className="h-4 w-4 mr-2 text-yellow-600" />
                              <span>{supplier.phone}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <Mail className="h-4 w-4 mr-2 text-yellow-600" />
                              <span>{supplier.email}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t-2 border-yellow-100 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Imikorere</span>
                              <span className="font-bold text-gray-900">{supplier.performance}%</span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full"
                                style={{ width: `${supplier.performance}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-600">Ibisabwa</p>
                                <p className="text-lg font-black text-gray-900">{supplier.orders}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Agaciro</p>
                                <p className="text-lg font-black text-gray-900">{supplier.totalValue}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="flex-1 border-yellow-200">
                              <Eye className="h-4 w-4 mr-2" />
                              Reba
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 border-yellow-200">
                              <Edit className="h-4 w-4 mr-2" />
                              Hindura
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-yellow-50 to-green-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-yellow-500 to-green-500">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Raporo Rusange</h3>
                        <p className="text-xs text-gray-600">Raporo y'ibikoresho byose</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                        <Download className="h-4 w-4 mr-2" />
                        Pakurura
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-green-50 to-blue-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-blue-500">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Imikorere</h3>
                        <p className="text-xs text-gray-600">Raporo y'imikorere y'ibikoresho</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 border-0">
                        <Download className="h-4 w-4 mr-2" />
                        Pakurura
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500">
                        <Truck className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Kugura</h3>
                        <p className="text-xs text-gray-600">Raporo y'ibisabwa kwa batanga</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 border-0">
                        <Download className="h-4 w-4 mr-2" />
                        Pakurura
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-red-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                        <ClipboardList className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Raporo Yihariye</h3>
                        <p className="text-xs text-gray-600">Kora raporo yihariye</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 border-0">
                        <Plus className="h-4 w-4 mr-2" />
                        Kora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagerDashboard;
