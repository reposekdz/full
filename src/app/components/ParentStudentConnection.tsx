import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/app/config/apiBase';

const SCHOOL_TRADES = [
  { code: 'SOD', name: 'Software Development' },
  { code: 'BDC', name: 'Building & Construction' },
  { code: 'AUTO', name: 'Automobile Technology' }
];

export default function ParentStudentConnection() {
  const [studentName, setStudentName] = useState('');
  const [trade, setTrade] = useState('');
  const [level, setLevel] = useState('');
  const [levels, setLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkedStudents, setLinkedStudents] = useState<any[]>([]);

  useEffect(() => {
    loadLinkedStudents();
  }, []);

  useEffect(() => {
    if (trade) {
      loadLevelsForTrade(trade);
    }
  }, [trade]);

  const loadLevelsForTrade = async (tradeCode: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/global-student-sheets/levels/${tradeCode}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success && data.levels && data.levels.length > 0) {
        setLevels(data.levels);
      } else {
        setLevels([3, 4, 5]);
      }
    } catch (error) {
      setLevels([3, 4, 5]);
    }
  };

  const loadLinkedStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/parent-links/students`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setLinkedStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error loading linked students:', error);
    }
  };

  const handleAutoConnect = async () => {
    if (!studentName.trim() || !trade || !level) {
      toast.error('Uzuza amakuru yose');
      return;
    }

    setLoading(true);
    try {
      const nameParts = studentName.trim().split(' ');
      const response = await fetch(`${API_BASE_URL}/parent-links/link-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student_first_name: nameParts[0],
          student_last_name: nameParts.slice(1).join(' ') || nameParts[0],
          trade_code: trade,
          level: level,
          relationship: 'Parent'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Umwana yahuijwe neza! 🎉');
        setStudentName('');
        setTrade('');
        setLevel('');
        loadLinkedStudents();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(data.message || 'Umwana ntagaragara');
      }
    } catch (error) {
      toast.error('Ikibazo cya interineti');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Huza na Umwana Wawe
          </h1>
          <p className="text-gray-600">Shyiramo amazina, ishami, n'umwaka</p>
        </motion.div>

        <Card className="border-2 border-blue-100 shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  AMAZINA Y'UMWANA *
                </label>
                <Input
                  placeholder="Urugero: Jean Claude Munyaneza"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="h-12 border-2 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ISHAMI / TRADE *
                </label>
                <Select value={trade} onValueChange={(v) => { setTrade(v); setLevel(''); }}>
                  <SelectTrigger className="h-12 border-2">
                    <SelectValue placeholder="Hitamo Ishami" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_TRADES.map(t => (
                      <SelectItem key={t.code} value={t.code}>
                        {t.code} - {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  UMWAKA / LEVEL *
                </label>
                <Select value={level} onValueChange={setLevel} disabled={!trade}>
                  <SelectTrigger className="h-12 border-2">
                    <SelectValue placeholder={trade ? "Hitamo Umwaka" : "Banza uhitemo Ishami"} />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(l => (
                      <SelectItem key={l} value={l.toString()}>
                        Level {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-bold text-blue-900">Guhuza Ako Kanya</p>
                  <p className="text-sm text-blue-700">
                    Iyo amakuru ahuye n'ayo dufite, urahita ubona raporo z'umwana wawe
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAutoConnect}
              disabled={loading || !studentName || !trade || !level}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-bold hover:scale-[1.01] transition-all shadow-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Turashakisha...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Huza Umwana
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {linkedStudents.length > 0 && (
          <Card className="border-2 border-green-100 shadow-xl">
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600" />
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Abana Bahuye ({linkedStudents.length})
              </h3>
              <div className="space-y-3">
                {linkedStudents.map((student, idx) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-green-50 border-2 border-green-200 rounded-lg"
                  >
                    <p className="font-bold text-gray-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {student.trade_name} - Level {student.level_number}
                    </p>
                    <p className="text-xs text-gray-500">{student.student_code}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
