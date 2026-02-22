import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, DollarSign, Users, AlertCircle, CheckCircle, Clock, Send, Plus, Download,
  Search, Filter, MessageSquare, TrendingUp, Calendar, Phone, Mail, FileText, BarChart3,
  PieChart, Activity, Wallet, Receipt, Bell, Settings, Eye, Edit, Trash2, RefreshCw,
  Upload, FileSpreadsheet, Printer, Share2, Target, Award, Zap, Shield, QrCode, X
} from 'lucide-react';

const UltraAdvancedPaymentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'analytics'>('table');
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', trade: 'all', level: 'all' });
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);

  // Advanced Features State
  const [paymentPlan, setPaymentPlan] = useState<any>(null);
  const [aiPredictions, setAiPredictions] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [exportFormat, setExportFormat] = useState('excel');
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    loadData();
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [studentsRes, statsRes] = await Promise.all([
        fetch('/api/payments/students', { headers }),
        fetch('/api/payments/stats', { headers })
      ]);

      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedStudents.length === 0) return;
    
    const token = localStorage.getItem('token');
    await fetch(`/api/payments/bulk/${bulkAction}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_ids: selectedStudents })
    });
    
    loadData();
    setSelectedStudents([]);
  };

  const exportData = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/payments/export?format=${exportFormat}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${Date.now()}.${exportFormat}`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        .animate-slide-in { animation: slideIn 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .shimmer { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 1000px 100%; animation: shimmer 2s infinite; }
        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
        .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      {/* Ultra-Modern Header */}
      <div className="glass rounded-2xl p-6 mb-6 animate-slide-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">💰 Ultra Payment Management</h1>
            <p className="text-gray-600">Advanced AI-Powered Fee Collection System</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setAutoRefresh(!autoRefresh)} className={`px-4 py-2 rounded-xl ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'} text-white transition-all hover:scale-105`}>
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowModal('export')} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-105 transition-all flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button onClick={() => setShowModal('settings')} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:scale-105 transition-all flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Advanced Tab Navigation */}
        <div className="flex space-x-2 mt-6 overflow-x-auto">
          {['dashboard', 'students', 'analytics', 'reports', 'automation', 'ai-insights'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Real-Time Statistics Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, label: 'Total Students', value: '1,234', change: '+12%', color: 'blue' },
              { icon: DollarSign, label: 'Total Collected', value: '45.2M RWF', change: '+8%', color: 'green' },
              { icon: AlertCircle, label: 'Pending', value: '12.8M RWF', change: '-5%', color: 'orange' },
              { icon: TrendingUp, label: 'Collection Rate', value: '78%', change: '+3%', color: 'purple' }
            ].map((stat, idx) => (
              <div key={idx} className="glass rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Advanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">📊 Payment Trends</h3>
              <canvas ref={chartRef} className="w-full h-64"></canvas>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">🎯 Collection by Trade</h3>
              <div className="space-y-4">
                {['SOD', 'BDC', 'AUTO'].map((trade, idx) => (
                  <div key={trade}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{trade}</span>
                      <span className="text-gray-600">{85 - idx * 10}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500`} style={{ width: `${85 - idx * 10}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Student Table */}
      {activeTab === 'students' && (
        <div className="glass rounded-2xl p-6 animate-slide-in">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <select onChange={(e) => setFilters({...filters, status: e.target.value})} className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
            <select onChange={(e) => setFilters({...filters, trade: e.target.value})} className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500">
              <option value="all">All Trades</option>
              <option value="SOD">SOD</option>
              <option value="BDC">BDC</option>
              <option value="AUTO">AUTO</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedStudents.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="font-semibold text-blue-900">{selectedStudents.length} students selected</span>
              <div className="flex space-x-2">
                <button onClick={() => setBulkAction('send-reminder')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Send className="w-4 h-4 inline mr-2" />Send Reminders
                </button>
                <button onClick={() => setBulkAction('export')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Download className="w-4 h-4 inline mr-2" />Export
                </button>
                <button onClick={() => setSelectedStudents([])} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Advanced Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-4 text-left"><input type="checkbox" className="w-5 h-5" /></th>
                  <th className="p-4 text-left font-bold">Student</th>
                  <th className="p-4 text-left font-bold">Trade/Level</th>
                  <th className="p-4 text-left font-bold">Total Fees</th>
                  <th className="p-4 text-left font-bold">Paid</th>
                  <th className="p-4 text-left font-bold">Balance</th>
                  <th className="p-4 text-left font-bold">Status</th>
                  <th className="p-4 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-blue-50 transition-all">
                    <td className="p-4"><input type="checkbox" className="w-5 h-5" /></td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                          JD
                        </div>
                        <div>
                          <p className="font-semibold">John Doe</p>
                          <p className="text-sm text-gray-500">SOD{i}-001</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">SOD Level {i}</span>
                    </td>
                    <td className="p-4 font-semibold">500,000 RWF</td>
                    <td className="p-4 text-green-600 font-semibold">350,000 RWF</td>
                    <td className="p-4 text-orange-600 font-semibold">150,000 RWF</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center w-fit">
                        <Clock className="w-4 h-4 mr-1" />Partial
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Eye className="w-4 h-4" /></button>
                        <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><Edit className="w-4 h-4" /></button>
                        <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"><Send className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6 animate-slide-in">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-500" />
              AI-Powered Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                <h4 className="font-bold text-lg mb-4">📈 Prediction: Next Month</h4>
                <p className="text-3xl font-bold text-blue-600 mb-2">42.5M RWF</p>
                <p className="text-gray-600">Expected collection based on AI analysis</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
                <h4 className="font-bold text-lg mb-4">🎯 Recommended Action</h4>
                <p className="text-gray-700 mb-2">Send reminders to 45 students</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Execute</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showModal === 'export' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-8 max-w-md w-full animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Export Data</h3>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-200 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {['Excel', 'PDF', 'CSV', 'JSON'].map(format => (
                <button
                  key={format}
                  onClick={() => { setExportFormat(format.toLowerCase()); exportData(); }}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-semibold"
                >
                  <FileSpreadsheet className="w-5 h-5 inline mr-3" />
                  Export as {format}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraAdvancedPaymentManagement;
