import React, { useState, useEffect } from 'react';
import { Shield, Plus, Clock, CheckCircle, Home, User, FileText, Calendar, Users, BarChart3, Mail, FileSpreadsheet, Loader2, AlertTriangle, Ban, XCircle, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const DODPunishmentsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [punishments, setPunishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [newPunishment, setNewPunishment] = useState({
    student_id: '',
    punishment_type: 'iburira',
    description: '',
    start_date: '',
    end_date: '',
    duration_days: 0
  });

  useEffect(() => {
    loadPunishments();
  }, []);

  const loadPunishments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/dod-comprehensive/punishments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPunishments(res.data.punishments || []);
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPunishment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/dod-comprehensive/punishments`, newPunishment, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setShowModal(false);
      loadPunishments();
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/dod-comprehensive/punishments/${id}`, { status }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadPunishments();
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const deletePunishment = async (id: number) => {
    if (!confirm('Urifuza koko gusiba iri hano?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/dod-comprehensive/punishments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadPunishments();
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, { label: string; icon: any; color: string }> = {
      iburira: { label: 'Iburira (Warning)', icon: AlertTriangle, color: 'from-yellow-500 to-orange-500' },
      guhagarikwa_iminsi: { label: 'Guhagarikwa Iminsi (Suspension)', icon: Ban, color: 'from-orange-500 to-red-500' },
      guhagarikwa_byimazeyo: { label: 'Guhagarikwa Byimazeyo (Permanent)', icon: XCircle, color: 'from-red-500 to-red-700' },
      kwirukana: { label: 'Kwirukana (Expulsion)', icon: Shield, color: 'from-red-700 to-black' }
    };
    return types[type] || { label: type, icon: Shield, color: 'from-gray-500 to-gray-700' };
  };

  const filteredPunishments = filterStatus === 'all' ? punishments : punishments.filter(p => p.status === filterStatus);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50"><Loader2 className="w-12 h-12 animate-spin text-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <Button onClick={() => onNavigate('director-discipline-dashboard')} variant="ghost" className="mb-4 font-bold">← Gusubira</Button>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-black text-gray-900 flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            Ibihano - Punishment Management
          </h1>
          <Button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-lg px-8 py-6 shadow-xl">
            <Plus className="w-6 h-6 mr-2" />Ongeraho Igihano
          </Button>
        </div>

        <Card className="mb-8 border-2 border-orange-200 shadow-xl">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-6 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold text-lg">
                <option value="all">Byose</option>
                <option value="biteguwe">Biteguwe (Pending)</option>
                <option value="birakora">Birakora (Active)</option>
                <option value="byarangiye">Byarangiye (Completed)</option>
                <option value="byahagaritswe">Byahagaritswe (Cancelled)</option>
              </select>
              <div className="flex-1 bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                <p className="text-sm font-black text-orange-600 uppercase">Total Punishments</p>
                <p className="text-4xl font-black text-orange-900">{filteredPunishments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {filteredPunishments.map((p, idx) => {
              const typeInfo = getTypeLabel(p.punishment_type);
              return (
                <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="border-2 border-orange-100 shadow-xl hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`p-4 bg-gradient-to-br ${typeInfo.color} rounded-2xl shadow-lg`}>
                              <typeInfo.icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-gray-900">{typeInfo.label}</h3>
                              <p className="text-sm text-gray-600 font-bold">{p.student_name} - {p.student_code}</p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-xl mb-4 border-2 border-gray-100">
                            <p className="text-gray-800 font-medium leading-relaxed">{p.description}</p>
                          </div>

                          <div className="flex items-center gap-6 text-sm font-bold text-gray-600">
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(p.start_date).toLocaleDateString('rw-RW')}
                            </span>
                            {p.end_date && (
                              <span className="flex items-center gap-2">
                                → {new Date(p.end_date).toLocaleDateString('rw-RW')}
                              </span>
                            )}
                            {p.duration_days && (
                              <Badge className="bg-orange-100 text-orange-700 text-base px-4 py-1">
                                {p.duration_days} days
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={`text-lg px-6 py-2 font-black ${
                            p.status === 'birakora' ? 'bg-yellow-500 text-white' :
                            p.status === 'byarangiye' ? 'bg-green-500 text-white' :
                            p.status === 'biteguwe' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {p.status}
                          </Badge>
                          
                          <div className="flex gap-2 mt-4">
                            {p.status === 'biteguwe' && (
                              <Button onClick={() => updateStatus(p.id, 'birakora')} className="bg-yellow-600">
                                <CheckCircle className="w-4 h-4 mr-1" />Activate
                              </Button>
                            )}
                            {p.status === 'birakora' && (
                              <Button onClick={() => updateStatus(p.id, 'byarangiye')} className="bg-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />Complete
                              </Button>
                            )}
                            <Button onClick={() => deletePunishment(p.id)} variant="destructive" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white rounded-t-3xl">
                  <h2 className="text-3xl font-black">Ongeraho Igihano Gishya</h2>
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">Student ID</label>
                    <Input value={newPunishment.student_id} onChange={(e) => setNewPunishment({...newPunishment, student_id: e.target.value})} className="h-12 border-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">Ubwoko bw'Igihano</label>
                    <select value={newPunishment.punishment_type} onChange={(e) => setNewPunishment({...newPunishment, punishment_type: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl font-bold">
                      <option value="iburira">Iburira (Warning)</option>
                      <option value="guhagarikwa_iminsi">Guhagarikwa Iminsi (Suspension)</option>
                      <option value="guhagarikwa_byimazeyo">Guhagarikwa Byimazeyo (Permanent)</option>
                      <option value="kwirukana">Kwirukana (Expulsion)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">Description</label>
                    <Textarea value={newPunishment.description} onChange={(e) => setNewPunishment({...newPunishment, description: e.target.value})} rows={4} className="border-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">Start Date</label>
                      <Input type="date" value={newPunishment.start_date} onChange={(e) => setNewPunishment({...newPunishment, start_date: e.target.value})} className="h-12 border-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">End Date</label>
                      <Input type="date" value={newPunishment.end_date} onChange={(e) => setNewPunishment({...newPunishment, end_date: e.target.value})} className="h-12 border-2" />
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-gray-50 flex gap-4 rounded-b-3xl">
                  <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1 h-12 font-bold">Reka</Button>
                  <Button onClick={createPunishment} className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black">Bika</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DODPunishmentsPage;
