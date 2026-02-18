import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, Download, Upload,
  BookOpen, Users, Calendar, Clock, Award, CheckCircle, XCircle, MoreVertical, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface Trade {
  id: number;
  trade_code: string;
  trade_name: string;
  trade_name_rw: string;
  description: string;
  description_rw: string;
  icon: string;
  duration_years: number;
  is_active: boolean;
  created_at: string;
}

const TradesManagementPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/trades', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTrades(data.trades || []);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrade = async (trade: Partial<Trade>) => {
    try {
      const token = localStorage.getItem('token');
      const method = editingTrade ? 'PUT' : 'POST';
      const url = editingTrade 
        ? `http://localhost:5000/api/trades/${editingTrade.id}`
        : 'http://localhost:5000/api/trades';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trade)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchTrades();
        setShowModal(false);
        setEditingTrade(null);
      }
    } catch (error) {
      console.error('Error saving trade:', error);
    }
  };

  const handleDeleteTrade = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trade?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/trades/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchTrades();
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  const filteredTrades = trades.filter(trade => 
    trade.trade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trade.trade_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTrades = filteredTrades.filter(t => t.is_active);
  const inactiveTrades = filteredTrades.filter(t => !t.is_active);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Trades Management</h1>
          <p className="text-gray-600">Manage all trades/courses in the school system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchTrades()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { setEditingTrade(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search trades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Trades</p>
                <p className="text-2xl font-bold">{trades.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Trades</p>
                <p className="text-2xl font-bold text-green-600">{activeTrades.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive Trades</p>
                <p className="text-2xl font-bold text-red-600">{inactiveTrades.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Duration</p>
                <p className="text-2xl font-bold">{trades.length > 0 ? (trades.reduce((sum, t) => sum + t.duration_years, 0) / trades.length).toFixed(1) : 0}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-xl shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 px-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-100">All Trades ({filteredTrades.length})</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-green-100">Active ({activeTrades.length})</TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-red-100">Inactive ({inactiveTrades.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trade Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name (Kinyarwanda)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(activeTab === 'all' ? filteredTrades : activeTab === 'active' ? activeTrades : inactiveTrades).map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {trade.trade_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{trade.trade_name}</td>
                      <td className="px-6 py-4 text-gray-600">{trade.trade_name_rw || '-'}</td>
                      <td className="px-6 py-4">{trade.duration_years} years</td>
                      <td className="px-6 py-4">
                        <Badge className={trade.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {trade.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingTrade(trade); setShowModal(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTrade(trade.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal for Add/Edit Trade */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingTrade ? 'Edit Trade' : 'Add New Trade'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveTrade({
                trade_code: formData.get('trade_code') as string,
                trade_name: formData.get('trade_name') as string,
                trade_name_rw: formData.get('trade_name_rw') as string,
                description: formData.get('description') as string,
                description_rw: formData.get('description_rw') as string,
                duration_years: parseInt(formData.get('duration_years') as string) || 3,
                is_active: true
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Trade Code</label>
                  <Input name="trade_code" defaultValue={editingTrade?.trade_code} required placeholder="e.g., SOD" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trade Name (English)</label>
                  <Input name="trade_name" defaultValue={editingTrade?.trade_name} required placeholder="e.g., Software Development" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trade Name (Kinyarwanda)</label>
                  <Input name="trade_name_rw" defaultValue={editingTrade?.trade_name_rw} placeholder="e.g., Iterambere ry'Ibikoresho" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (English)</label>
                  <Input name="description" defaultValue={editingTrade?.description} placeholder="Description" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Kinyarwanda)</label>
                  <Input name="description_rw" defaultValue={editingTrade?.description_rw} placeholder="Ibitekerezo" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (Years)</label>
                  <Input name="duration_years" type="number" defaultValue={editingTrade?.duration_years || 3} min="1" max="5" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingTrade ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradesManagementPage;
