import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Edit, Trash2, Plus, Upload, Save, X, Search, Filter, Eye, Mail, Phone, MapPin, Award } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leadership';

const roleOrder = [
  { key: 'School Owner', label: 'Umwene Ishuri', color: 'purple' },
  { key: 'Advisor', label: 'Umujyanama', color: 'blue' },
  { key: 'DOS', label: 'DOS', color: 'green' },
  { key: 'Accountant', label: 'Umubitsi', color: 'emerald' },
  { key: 'Head Teacher', label: 'Umuyobozi Mukuru', color: 'indigo' },
  { key: 'Patron', label: 'Patron', color: 'amber' },
  { key: 'DOD', label: 'DOD', color: 'orange' },
  { key: 'Matron', label: 'Matron', color: 'pink' }
];

export default function ModernLeadershipManagement() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [filteredLeaders, setFilteredLeaders] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchLeaders();
  }, []);

  useEffect(() => {
    filterLeaders();
  }, [leaders, searchTerm, filterRole]);

  const fetchLeaders = async () => {
    try {
      const { data } = await axios.get(API_URL);
      const sorted = data.sort((a: any, b: any) => {
        const aIndex = roleOrder.findIndex(r => r.key === a.role);
        const bIndex = roleOrder.findIndex(r => r.key === b.role);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
      setLeaders(sorted);
    } catch (error) {
      console.error(error);
    }
  };

  const filterLeaders = () => {
    let filtered = leaders;
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterRole !== 'all') {
      filtered = filtered.filter(l => l.role === filterRole);
    }
    setFilteredLeaders(filtered);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.entries(editing).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'image_url') {
          formData.append(key, value?.toString() || '');
        }
      });
      if (imageFile) formData.append('image', imageFile);

      if (editing.id) {
        await axios.put(`${API_URL}/${editing.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      
      setEditing(null);
      setImageFile(null);
      fetchLeaders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Gusiba uyu muyobozi?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchLeaders();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const parseJSON = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed.join('\n') : str;
    } catch {
      return str;
    }
  };

  const stringifyJSON = (str: string) => {
    return JSON.stringify(str.split('\n').filter(s => s.trim()));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-black">Ubuyobozi bw'Ishuri</h1>
                <p className="text-blue-100">Gucunga Abayobozi</p>
              </div>
            </div>
            <button onClick={() => setEditing({
              name: '', role: '', department: '', biography_rw: '', email: '', phone: '',
              office_location: '', image_url: '', qualifications: '[]', experience_years: 0,
              specialization: '', achievements: '[]', responsibilities: '[]', office_hours: ''
            })} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition">
              <Plus className="w-5 h-5 inline mr-2" /> Ongeraho
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Shakisha..."
                className="w-full pl-10 pr-4 py-3 border rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select className="w-full pl-10 pr-4 py-3 border rounded-xl" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="all">Byose</option>
                {roleOrder.map(role => (
                  <option key={role.key} value={role.key}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLeaders.map((leader, index) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all"
            >
              <div className="relative h-48">
                <img src={`http://localhost:5000${leader.image_url}`} alt={leader.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                  {leader.role}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-black text-gray-900 mb-1">{leader.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{leader.department}</p>
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {leader.email}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setViewing(leader)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-bold">
                    <Eye className="w-4 h-4 inline mr-1" /> Reba
                  </button>
                  <button onClick={() => setEditing(leader)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-bold">
                    <Edit className="w-4 h-4 inline mr-1" /> Hindura
                  </button>
                  <button onClick={() => handleDelete(leader.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
                  <h2 className="text-2xl font-black">{editing.id ? 'Hindura' : 'Ongeraho'}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <input className="border p-3 rounded-xl" placeholder="Amazina" value={editing.name}
                      onChange={e => setEditing({...editing, name: e.target.value})} />
                    <select className="border p-3 rounded-xl" value={editing.role}
                      onChange={e => setEditing({...editing, role: e.target.value})}>
                      <option value="">Hitamo Umwanya</option>
                      {roleOrder.map(role => (
                        <option key={role.key} value={role.key}>{role.label}</option>
                      ))}
                    </select>
                    <input className="border p-3 rounded-xl" placeholder="Ishami" value={editing.department}
                      onChange={e => setEditing({...editing, department: e.target.value})} />
                    <input className="border p-3 rounded-xl" placeholder="Imeli" value={editing.email}
                      onChange={e => setEditing({...editing, email: e.target.value})} />
                    <input className="border p-3 rounded-xl" placeholder="Telefoni" value={editing.phone}
                      onChange={e => setEditing({...editing, phone: e.target.value})} />
                    <input className="border p-3 rounded-xl" placeholder="Ibiro" value={editing.office_location}
                      onChange={e => setEditing({...editing, office_location: e.target.value})} />
                    <input className="border p-3 rounded-xl" placeholder="Uburambe" type="number" value={editing.experience_years}
                      onChange={e => setEditing({...editing, experience_years: parseInt(e.target.value)})} />
                    <input className="border p-3 rounded-xl" placeholder="Amasaha" value={editing.office_hours}
                      onChange={e => setEditing({...editing, office_hours: e.target.value})} />
                    <textarea className="border p-3 rounded-xl col-span-2" rows={4} placeholder="Umwirondoro" value={editing.biography_rw}
                      onChange={e => setEditing({...editing, biography_rw: e.target.value})} />
                    <textarea className="border p-3 rounded-xl col-span-2" rows={2} placeholder="Ubuhanga" value={editing.specialization}
                      onChange={e => setEditing({...editing, specialization: e.target.value})} />
                    <textarea className="border p-3 rounded-xl col-span-2" rows={3} placeholder="Amashuri" 
                      value={parseJSON(editing.qualifications)}
                      onChange={e => setEditing({...editing, qualifications: stringifyJSON(e.target.value)})} />
                    <textarea className="border p-3 rounded-xl col-span-2" rows={3} placeholder="Ibyagezweho" 
                      value={parseJSON(editing.achievements)}
                      onChange={e => setEditing({...editing, achievements: stringifyJSON(e.target.value)})} />
                    <textarea className="border p-3 rounded-xl col-span-2" rows={3} placeholder="Inshingano" 
                      value={parseJSON(editing.responsibilities)}
                      onChange={e => setEditing({...editing, responsibilities: stringifyJSON(e.target.value)})} />
                    <label className="col-span-2 flex items-center gap-2 cursor-pointer border-2 border-dashed p-4 rounded-xl hover:bg-gray-50">
                      <Upload className="w-5 h-5" />
                      <span>{imageFile ? imageFile.name : 'Hitamo Ifoto'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">
                      <Save className="w-5 h-5 inline mr-2" /> Bika
                    </button>
                    <button onClick={() => { setEditing(null); setImageFile(null); }} className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold">
                      <X className="w-5 h-5 inline mr-2" /> Hagarika
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewing(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="relative h-64">
                  <img src={`http://localhost:5000${viewing.image_url}`} alt={viewing.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h2 className="text-4xl font-black mb-2">{viewing.name}</h2>
                    <p className="text-xl font-bold">{viewing.role}</p>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {viewing.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {viewing.phone}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {viewing.office_location}</div>
                    <div className="flex items-center gap-2"><Award className="w-4 h-4" /> {viewing.experience_years}+ Imyaka</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-3">Umwirondoro</h3>
                    <p className="text-gray-700 leading-relaxed">{viewing.biography_rw}</p>
                  </div>
                  {viewing.qualifications && (
                    <div>
                      <h3 className="text-xl font-black mb-3">Amashuri</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {JSON.parse(viewing.qualifications).map((q: string, i: number) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewing.achievements && (
                    <div>
                      <h3 className="text-xl font-black mb-3">Ibyagezweho</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {JSON.parse(viewing.achievements).map((a: string, i: number) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button onClick={() => setViewing(null)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
                    Funga
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
