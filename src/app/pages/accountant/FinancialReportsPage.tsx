import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, FileText } from 'lucide-react';
import AccountantSidebar from '@/app/components/AccountantSidebar';

const FinancialReportsPage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [reports, setReports] = useState<any>(null);
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState('2024');

  useEffect(() => {
    fetchReports();
  }, [period, year]);

  const fetchReports = async () => {
    const res = await fetch(`http://localhost:5000/api/accountant/reports?period=${period}&year=${year}`);
    const data = await res.json();
    if (data.success) setReports(data.reports);
  };

  const downloadReport = async (type: string) => {
    const res = await fetch(`http://localhost:5000/api/accountant/reports/download?type=${type}&period=${period}&year=${year}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_report_${period}_${year}.pdf`;
    a.click();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="financial-reports" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Raporo z'Imari</h1>
          <p className="text-gray-600">Isesengura ry'imari y'ishuri</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="daily">Buri munsi</option>
              <option value="weekly">Buri cyumweru</option>
              <option value="monthly">Buri kwezi</option>
              <option value="quarterly">Buri gihembwe</option>
              <option value="yearly">Buri mwaka</option>
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            <button onClick={fetchReports} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2">
              <BarChart3 size={18} />
              Kuvugurura
            </button>
          </div>
        </div>

        {reports && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <p className="text-sm text-gray-600 mb-1">Amafaranga Yinjiye</p>
                <p className="text-2xl font-bold text-green-600">{reports.totalIncome?.toLocaleString() || 0} RWF</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <p className="text-sm text-gray-600 mb-1">Amafaranga Yasohotse</p>
                <p className="text-2xl font-bold text-red-600">{reports.totalExpenses?.toLocaleString() || 0} RWF</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Inyungu</p>
                <p className="text-2xl font-bold text-blue-600">{reports.profit?.toLocaleString() || 0} RWF</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-1">Igipimo</p>
                <p className="text-2xl font-bold text-purple-600">{reports.profitMargin?.toFixed(1) || 0}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PieChart className="text-blue-500" size={24} />
                  Amafaranga Yakoreshejwe ku Byiciro
                </h3>
                <div className="space-y-3">
                  {reports.expensesByCategory?.map((cat: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{cat.category}</span>
                        <span className="text-sm text-gray-600">{cat.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{cat.amount.toLocaleString()} RWF</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-500" size={24} />
                  Amafaranga Yinjiye ku Byiciro
                </h3>
                <div className="space-y-3">
                  {reports.incomeBySource?.map((source: any, idx: number) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{source.source}</span>
                        <span className="text-sm text-gray-600">{source.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: `${source.percentage}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{source.amount.toLocaleString()} RWF</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Gukuramo Raporo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => downloadReport('income')} className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg flex items-center justify-center gap-2">
                  <Download size={20} />
                  Raporo y'Amafaranga Yinjiye
                </button>
                <button onClick={() => downloadReport('expense')} className="px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg flex items-center justify-center gap-2">
                  <Download size={20} />
                  Raporo y'Amafaranga Yasohotse
                </button>
                <button onClick={() => downloadReport('comprehensive')} className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg flex items-center justify-center gap-2">
                  <Download size={20} />
                  Raporo Yuzuye
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinancialReportsPage;
