import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Book, MapPin, Download, Filter } from 'lucide-react';
import AccountantSidebar from '@/app/components/AccountantSidebar';

const TimetableView: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [trades, setTrades] = useState<string[]>([]);
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
    fetchTrades();
  }, [selectedTrade, selectedDay]);

  const fetchTimetable = async () => {
    const params = new URLSearchParams();
    if (selectedTrade !== 'all') params.append('trade', selectedTrade);
    if (selectedDay !== 'all') params.append('day_of_week', selectedDay);
    
    try {
      const res = await fetch(`http://localhost:5000/api/dos/timetable?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTimetable(data.timetable || []);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setTimetable([]);
    }
    setLoading(false);
  };

  const fetchTrades = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trades');
      if (res.ok) {
        const data = await res.json();
        setTrades(Array.isArray(data) ? data.map((t: any) => t.trade_code) : []);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      setTrades([]);
    }
  };

  const groupByDay = () => {
    const grouped: any = {};
    days.forEach(day => {
      grouped[day] = timetable.filter(t => t.day_of_week === day);
    });
    return grouped;
  };

  const groupedTimetable = groupByDay();

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="timetable-view" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gahunda y'Amasomo</h1>
          <p className="text-gray-600">Reba gahunda y'amasomo y'ishuri</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
              <option value="all">Amahugurwa Yose</option>
              {trades.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
              <option value="all">Iminsi Yose</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={fetchTimetable} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2">
              <Filter size={18} />
              Shakisha
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {days.map(day => {
              const daySchedule = groupedTimetable[day] || [];
              if (selectedDay !== 'all' && selectedDay !== day) return null;
              
              return (
                <div key={day} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Calendar size={24} />
                      {day}
                    </h2>
                  </div>
                  
                  {daySchedule.length > 0 ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {daySchedule.map((item: any) => (
                          <div key={item.id} className="border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="text-emerald-600" size={18} />
                                <span className="font-bold text-gray-900">{item.start_time} - {item.end_time}</span>
                              </div>
                              <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-full">{item.trade}</span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Book className="text-blue-600" size={16} />
                                <span className="font-semibold text-gray-900">{item.subject}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Users className="text-purple-600" size={16} />
                                <span className="text-sm text-gray-600">Level {item.class_level}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <MapPin className="text-red-600" size={16} />
                                <span className="text-sm text-gray-600">{item.room || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      Nta masomo kuri uyu munsi
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableView;
