import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Search, Filter, Eye, Edit, Check, Home, User, FileText, Calendar, Users, BarChart3, Scale, Mail, FileSpreadsheet, Menu, X, Trash2, Send, Loader2 } from 'lucide-react';
import { apiService } from '@/app/services/apiService';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';

interface DisciplineCase {
  id: number;
  student_id: number;
  student_name: string;
  student_number: string;
  case_type: string;
  description: string;
  action_taken: string;
  status: string;
  severity: number;
  marks_lost?: number;
  created_at: string;
}

const DODDisciplinePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [cases, setCases] = useState<DisciplineCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<DisciplineCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<DisciplineCase | null>(null);
  const [marksToDeduct, setMarksToDeduct] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [searchTerm, statusFilter, cases]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDODDisciplineCases();
      setCases(Array.isArray(data.cases) ? data.cases : []);
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = [...cases];
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.student_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) filtered = filtered.filter(c => c.status === statusFilter);
    setFilteredCases(filtered);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiService.updateDODDisciplineCase(id, { status });
      loadCases();
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const deleteCase = async (id: number) => {
    if (!confirm('Urifuza koko gusiba iri kosa?')) return;
    try {
      await apiService.deleteDODDisciplineCase(id);
      loadCases();
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const handleNotifyParent = async () => {
    if (!selectedCase || !marksToDeduct) return;
    
    setNotifyLoading(true);
    try {
      await apiService.notifyParentMarkLoss(
        selectedCase.student_id,
        parseInt(marksToDeduct),
        selectedCase.description
      );
      alert('Umubyeyi yamenyeshejwe neza binyuze kuri SMS!');
      setIsNotifyModalOpen(false);
      setMarksToDeduct('');
      loadCases();
    } catch (error) {
      console.error('Ikosa:', error);
      alert('Ikosa ryabaye mu kumenyesha umubyeyi');
    } finally {
      setNotifyLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      gishya: 'bg-yellow-500',
      girakurikiranwa: 'bg-blue-500',
      byakemuwe: 'bg-green-500',
      byahagaritswe: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg">
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out mt-16`}>
        <div className="h-full bg-gradient-to-b from-green-700 via-green-600 to-green-800 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-6 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home },
              { id: 'dod-profile', label: 'Profil', Icon: User },
              { id: 'dod-discipline', label: 'Amakosa', Icon: FileText, active: true },
              { id: 'dod-exams', label: 'Ibizamini', Icon: Calendar },
              { id: 'dod-students', label: 'Abanyeshuri', Icon: Users },
              { id: 'dod-reports', label: 'Raporo', Icon: BarChart3 },
              { id: 'dod-punishments', label: 'Ibihano', Icon: Scale },
              { id: 'dod-parent-notifications', label: 'Ababyeyi', Icon: Mail },
              { id: 'dod-student-sheets', label: 'Imbonerahamwe', Icon: FileSpreadsheet }
            ].map(item => (
              <button key={item.id} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${item.active ? 'bg-white text-green-700 shadow-lg scale-105 font-bold' : 'text-white hover:bg-white/10 hover:translate-x-2'}`}>
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="lg:pl-0 flex-1 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-end">
            <div>
              <button onClick={() => onNavigate('director-discipline-dashboard')} className="mb-4 text-green-600 font-bold hover:underline flex items-center gap-2">
                ← Gusubira kuri Dashboard
              </button>
              <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                <AlertTriangle className="w-10 h-10 text-red-600 animate-pulse" />
                Gucunga Amakosa & Imyitwarire
              </h1>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-green-100 text-right">
              <p className="text-sm text-gray-500 font-bold">Amakosa Yose</p>
              <p className="text-3xl font-black text-green-600">{cases.length}</p>
            </div>
          </motion.div>

          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden mb-8">
            <CardContent className="p-6 bg-white/50 backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Shakisha umunyeshuri..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 transition-all"
                  />
                </div>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-14 px-6 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 transition-all outline-none font-bold text-gray-700"
                >
                  <option value="">Imiterere yose</option>
                  <option value="gishya">Gishya (New)</option>
                  <option value="girakurikiranwa">Biri gukurikiranwa</option>
                  <option value="byakemuwe">Byakemuwe (Resolved)</option>
                </select>
                <div className="flex items-center gap-4 bg-green-50 p-4 rounded-2xl">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Filter className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-black uppercase tracking-wider">Filtered Results</p>
                    <p className="text-xl font-black text-green-900">{filteredCases.length} Amakosa</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredCases.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-2 border-gray-50 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className={`w-2 ${getStatusColor(c.status)}`} />
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-black text-gray-900">{c.student_name}</h3>
                                <Badge className={`${getStatusColor(c.status)} text-white border-0 px-4 py-1 rounded-full font-bold uppercase text-xs`}>
                                  {c.status}
                                </Badge>
                                <span className="text-sm font-bold text-gray-400">#{c.student_number}</span>
                              </div>
                              <p className="text-gray-600 font-medium flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {c.case_type}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => {
                                  setSelectedCase(c);
                                  setIsNotifyModalOpen(true);
                                }}
                                className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                              >
                                <Mail className="w-5 h-5" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => deleteCase(c.id)}
                                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100 group-hover:bg-white group-hover:border-green-100 transition-colors">
                            <p className="text-gray-800 leading-relaxed font-medium">{c.description}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6 text-sm text-gray-500 font-bold">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(c.created_at).toLocaleDateString('rw-RW', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              {c.marks_lost && (
                                <span className="text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                                  -{c.marks_lost} Marks
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {c.status === 'gishya' && (
                                <Button 
                                  onClick={() => updateStatus(c.id, 'girakurikiranwa')}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                                >
                                  Kurikirana
                                </Button>
                              )}
                              {c.status === 'girakurikiranwa' && (
                                <Button 
                                  onClick={() => updateStatus(c.id, 'byakemuwe')}
                                  className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                                >
                                  Kemuya
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Notify Parent Modal */}
      <AnimatePresence>
        {isNotifyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsNotifyModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
                <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                  <Mail className="w-8 h-8" />
                  Menyesha Umubyeyi
                </h2>
                <p className="text-orange-50 font-bold">{selectedCase?.student_name}</p>
              </div>
              <div className="p-8">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Amanota yagabanutse</label>
                <Input
                  type="number"
                  placeholder="Andika amanota yagabanutse (e.g. 5)"
                  value={marksToDeduct}
                  onChange={(e) => setMarksToDeduct(e.target.value)}
                  className="h-16 text-2xl font-black text-red-600 border-2 border-orange-100 rounded-2xl focus:border-orange-500 mb-6"
                />
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsNotifyModalOpen(false)}
                    className="flex-1 h-14 rounded-2xl border-2 border-gray-100 font-bold text-gray-600"
                  >
                    Reka
                  </Button>
                  <Button 
                    onClick={handleNotifyParent}
                    disabled={notifyLoading || !marksToDeduct}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black shadow-lg shadow-orange-200 disabled:opacity-50"
                  >
                    {notifyLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="flex items-center gap-2"><Send className="w-5 h-5" /> Ohereza</span>}
                  </Button>
                </div>
                <p className="mt-4 text-xs text-center text-gray-400 font-medium italic">
                  * Iri buto ryoherereza umubyeyi ubutumwa bugufi (SMS) ako kanya bugaragaza amanota umunyeshuri yatakaje n'impamvu.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DODDisciplinePage;
