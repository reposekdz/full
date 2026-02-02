import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Users, Package, AlertTriangle, 
  Award, BookOpen, Activity, BarChart3, PieChart, LineChart,
  Download, Filter, Calendar, RefreshCw, Eye, ChevronRight
} from 'lucide-react';

const SchoolOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/school-owner/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDashboardData(data.dashboard);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Gutegura amakuru...</p>
        </div>
      </div>
    );
  }

  const { financial, academic, stock, staff, discipline, recent_activities } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Ikibanza cy'Umuyobozi w'Ishuri</h1>
              <p className="text-blue-100 text-lg">Genzura byose mu ishuri - Amafaranga, Imikorere, Ibikoresho</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchDashboard} className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl flex items-center gap-2 transition-all">
                <RefreshCw className="w-5 h-5" />
                Vugurura
              </button>
              <button className="bg-white text-indigo-600 hover:bg-blue-50 px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all">
                <Download className="w-5 h-5" />
                Kuramo Raporo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Amafaranga Yakusanyijwe"
            value={`${(financial?.revenue?.collected || 0).toLocaleString()} RWF`}
            change={`${financial?.revenue?.collection_rate || 0}%`}
            icon={<DollarSign className="w-8 h-8" />}
            color="green"
            trend="up"
          />
          <StatCard
            title="Inyungu Zose"
            value={`${(financial?.profit?.net || 0).toLocaleString()} RWF`}
            change={`${financial?.profit?.margin || 0}% margin`}
            icon={<TrendingUp className="w-8 h-8" />}
            color="blue"
            trend="up"
          />
          <StatCard
            title="Abanyeshuri"
            value={academic?.students?.total || 0}
            change={`${academic?.students?.honors || 0} ba honors`}
            icon={<Users className="w-8 h-8" />}
            color="purple"
          />
          <StatCard
            title="Ibikoresho"
            value={`${(stock?.total_value || 0).toLocaleString()} RWF`}
            change={`${stock?.low_stock || 0} biri hasi`}
            icon={<Package className="w-8 h-8" />}
            color="orange"
            alert={stock?.low_stock > 0}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Muri Rusange', icon: <BarChart3 className="w-5 h-5" /> },
              { id: 'finance', label: 'Amafaranga', icon: <DollarSign className="w-5 h-5" /> },
              { id: 'academic', label: 'Amasomo', icon: <BookOpen className="w-5 h-5" /> },
              { id: 'stock', label: 'Ibikoresho', icon: <Package className="w-5 h-5" /> },
              { id: 'staff', label: 'Abakozi', icon: <Users className="w-5 h-5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'overview' && <OverviewTab data={dashboardData} />}
            {activeTab === 'finance' && <FinanceTab data={financial} />}
            {activeTab === 'academic' && <AcademicTab data={academic} />}
            {activeTab === 'stock' && <StockTab data={stock} />}
            {activeTab === 'staff' && <StaffTab data={staff} />}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentPayments payments={recent_activities?.payments || []} />
          <RecentExpenses expenses={recent_activities?.expenses || []} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color, trend, alert }) => {
  const colors = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`bg-gradient-to-br ${colors[color]} text-white p-3 rounded-xl`}>
          {icon}
        </div>
        {alert && <AlertTriangle className="w-6 h-6 text-orange-500 animate-pulse" />}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
        {change}
      </p>
    </div>
  );
};

const OverviewTab = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricBox title="Igipimo cya GPA" value={data?.academic?.performance?.avg_gpa || '0.00'} color="blue" />
      <MetricBox title="Kwitabira (%)" value={`${data?.academic?.performance?.avg_attendance || 0}%`} color="green" />
      <MetricBox title="Imyitwarire" value={data?.discipline?.avg_conduct || '0.00'} color="purple" />
    </div>
    
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Ibisobanuro by'Ingenzi</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoItem label="Abanyeshuri bose" value={data?.academic?.students?.total || 0} />
        <InfoItem label="Abakozi" value={data?.staff?.reduce((sum, s) => sum + s.count, 0) || 0} />
        <InfoItem label="Ibikoresho" value={data?.stock?.total_items || 0} />
        <InfoItem label="Ibibazo" value={data?.discipline?.total_incidents || 0} />
      </div>
    </div>
  </div>
);

const FinanceTab = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Amafaranga Yinjiye</h3>
        <div className="space-y-3">
          <FinanceRow label="Byategerejwe" value={data?.revenue?.expected || 0} />
          <FinanceRow label="Byakusanyijwe" value={data?.revenue?.collected || 0} highlight />
          <FinanceRow label="Bisigaye" value={data?.revenue?.outstanding || 0} />
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Amafaranga Yasohokeje</h3>
        <div className="space-y-3">
          <FinanceRow label="Amafaranga y'Ibikoresho" value={data?.expenses?.total || 0} />
          <FinanceRow label="Imishahara" value={data?.salaries?.total || 0} />
          <FinanceRow label="Inyungu" value={data?.profit?.net || 0} highlight />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Imiterere y'Ubwishyu</h3>
      <div className="grid grid-cols-3 gap-4">
        <PaymentStatus label="Byishyuwe Byose" count={data?.payment_status?.fully_paid || 0} color="green" />
        <PaymentStatus label="Byishyuwe Igice" count={data?.payment_status?.partial || 0} color="yellow" />
        <PaymentStatus label="Nta Cyishyuwe" count={data?.payment_status?.unpaid || 0} color="red" />
      </div>
    </div>
  </div>
);

const AcademicTab = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AcademicCard title="Abanyeshuri ba Honors" value={data?.students?.honors || 0} icon={<Award />} color="yellow" />
      <AcademicCard title="Abanyeshuri Bose" value={data?.students?.total || 0} icon={<Users />} color="blue" />
      <AcademicCard title="Bakeneye Ubufasha" value={data?.students?.at_risk || 0} icon={<AlertTriangle />} color="red" />
    </div>

    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Imikorere ku Mashami</h3>
      <div className="space-y-3">
        {data?.by_trade?.slice(0, 5).map((trade, idx) => (
          <TradePerformance key={idx} trade={trade} />
        ))}
      </div>
    </div>
  </div>
);

const StockTab = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StockMetric label="Ibikoresho Byose" value={data?.total_items || 0} />
      <StockMetric label="Agaciro" value={`${(data?.total_value || 0).toLocaleString()} RWF`} />
      <StockMetric label="Biri Hasi" value={data?.low_stock || 0} alert />
      <StockMetric label="Byabuze" value={data?.out_of_stock || 0} alert />
    </div>

    {data?.low_stock > 0 && (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-bold text-orange-900">Ibikoresho Bikeneye Kugurwa</h3>
        </div>
        <p className="text-orange-700">Hari ibikoresho {data?.low_stock} bikeneye kugurwa vuba.</p>
      </div>
    )}
  </div>
);

const StaffTab = ({ data }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-gray-900">Abakozi ku Mirimo</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.map((role, idx) => (
        <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-bold text-gray-900 mb-2">{role.role}</h4>
          <p className="text-3xl font-bold text-indigo-600">{role.count}</p>
        </div>
      ))}
    </div>
  </div>
);

const RecentPayments = ({ payments }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Ubwishyu bwa Vuba</h3>
    <div className="space-y-3">
      {payments.slice(0, 5).map((payment, idx) => (
        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
          <div>
            <p className="font-semibold text-gray-900">{payment.first_name} {payment.last_name}</p>
            <p className="text-sm text-gray-600">{payment.student_code}</p>
          </div>
          <p className="font-bold text-green-600">{payment.amount?.toLocaleString()} RWF</p>
        </div>
      ))}
    </div>
  </div>
);

const RecentExpenses = ({ expenses }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Amafaranga Yasohokeje</h3>
    <div className="space-y-3">
      {expenses.slice(0, 5).map((expense, idx) => (
        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
          <div>
            <p className="font-semibold text-gray-900">{expense.category}</p>
            <p className="text-sm text-gray-600">{expense.description}</p>
          </div>
          <p className="font-bold text-red-600">{expense.amount?.toLocaleString()} RWF</p>
        </div>
      ))}
    </div>
  </div>
);

const MetricBox = ({ title, value, color }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-6 border border-${color}-200`}>
    <h4 className="text-gray-700 font-medium mb-2">{title}</h4>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-indigo-600">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{label}</p>
  </div>
);

const FinanceRow = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center">
    <span className={`${highlight ? 'font-bold' : 'font-medium'} text-gray-700`}>{label}</span>
    <span className={`${highlight ? 'text-xl font-bold' : 'font-semibold'} text-gray-900`}>
      {value.toLocaleString()} RWF
    </span>
  </div>
);

const PaymentStatus = ({ label, count, color }) => {
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  };
  
  return (
    <div className={`${colors[color]} rounded-lg p-4 border-2 text-center`}>
      <p className="text-3xl font-bold mb-1">{count}</p>
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
};

const AcademicCard = ({ title, value, icon, color }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-6 border border-${color}-200`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`text-${color}-600`}>{icon}</div>
      <h4 className="font-bold text-gray-900">{title}</h4>
    </div>
    <p className="text-4xl font-bold text-gray-900">{value}</p>
  </div>
);

const TradePerformance = ({ trade }) => (
  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
    <div>
      <p className="font-bold text-gray-900">{trade.trade_name}</p>
      <p className="text-sm text-gray-600">{trade.student_count} abanyeshuri</p>
    </div>
    <div className="text-right">
      <p className="font-bold text-indigo-600">GPA: {parseFloat(trade.avg_gpa).toFixed(2)}</p>
      <p className="text-sm text-gray-600">{parseFloat(trade.avg_attendance).toFixed(1)}% kwitabira</p>
    </div>
  </div>
);

const StockMetric = ({ label, value, alert }) => (
  <div className={`${alert ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border-2 text-center`}>
    <p className={`text-2xl font-bold ${alert ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
    <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
  </div>
);

export default SchoolOwnerDashboard;
