import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import RwandaLocationSelector from '../components/RwandaLocationSelector';
import { Users, Phone, Calendar, ClipboardList, AlertTriangle, MessageSquare, Home, BookOpen, TrendingUp, Plus, Edit, Trash2, Search, Filter, X, Save, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AdvisorDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [data, setData] = useState({
    parents: [],
    communications: [],
    meetings: [],
    behavior: [],
    counseling: [],
    homeVisits: [],
    attendance: [],
    feedback: [],
    tasks: []
  });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [parentsRes, commsRes, meetingsRes, behaviorRes, counselingRes, visitsRes, feedbackRes, tasksRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/advisor/parents'),
        fetch('http://localhost:5000/api/advisor/communications'),
        fetch('http://localhost:5000/api/advisor/meetings'),
        fetch('http://localhost:5000/api/advisor/behavior'),
        fetch('http://localhost:5000/api/advisor/counseling'),
        fetch('http://localhost:5000/api/advisor/home-visits'),
        fetch('http://localhost:5000/api/advisor/feedback'),
        fetch('http://localhost:5000/api/advisor/tasks'),
        fetch('http://localhost:5000/api/advisor/stats')
      ]);

      const [parents, communications, meetings, behavior, counseling, homeVisits, feedback, tasks, stats] = await Promise.all([
        parentsRes.json(),
        commsRes.json(),
        meetingsRes.json(),
        behaviorRes.json(),
        counselingRes.json(),
        visitsRes.json(),
        feedbackRes.json(),
        tasksRes.json(),
        statsRes.json()
      ]);

      setData({ parents, communications, meetings, behavior, counseling, homeVisits, feedback, tasks });
      setStats(stats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoints = {
        parent: 'parents',
        communication: 'communications',
        meeting: 'meetings',
        behavior: 'behavior',
        counseling: 'counseling',
        homeVisit: 'home-visits',
        feedback: 'feedback',
        task: 'tasks'
      };

      const endpoint = endpoints[modalType];
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id 
        ? `http://localhost:5000/api/advisor/${endpoint}/${formData.id}`
        : `http://localhost:5000/api/advisor/${endpoint}`;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      fetchAllData();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Gusiba iyi nyandiko?')) return;
    
    try {
      const endpoints = {
        parent: 'parents',
        communication: 'communications',
        meeting: 'meetings',
        task: 'tasks'
      };

      await fetch(`http://localhost:5000/api/advisor/${endpoints[type]}/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setFormData({});
  };

  const modules = [
    { id: 'overview', name: 'Ibanze', icon: TrendingUp, color: 'from-blue-600 to-indigo-600' },
    { id: 'parents', name: 'Ababyeyi', icon: Users, color: 'from-green-600 to-emerald-600' },
    { id: 'communications', name: 'Itumanaho', icon: Phone, color: 'from-purple-600 to-pink-600' },
    { id: 'meetings', name: 'Inama', icon: Calendar, color: 'from-yellow-600 to-orange-600' },
    { id: 'behavior', name: 'Imyitwarire', icon: AlertTriangle, color: 'from-red-600 to-rose-600' },
    { id: 'counseling', name: 'Ubujyanama', icon: MessageSquare, color: 'from-teal-600 to-cyan-600' },
    { id: 'tasks', name: 'Imirimo', icon: ClipboardList, color: 'from-indigo-600 to-purple-600' },
    { id: 'feedback', name: 'Ibitekerezo', icon: BookOpen, color: 'from-orange-600 to-red-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-20 h-20 animate-pulse text-green-600 mx-auto mb-4" />
          <p className="text-2xl font-black text-gray-900">Gutangiza Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-gradient-to-b from-green-900 via-yellow-800 to-orange-900 min-h-screen p-6 shadow-2xl sticky top-0 h-screen overflow-y-auto"
        >
          <div className="mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
            >
              <Users className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2 text-center">Umujyanama</h1>
            <p className="text-yellow-200 text-center text-sm">Gucunga Ababyeyi n'Abanyeshuri</p>
          </div>

          <div className="space-y-3 mb-8">
            {modules.map((module) => (
              <Button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full justify-start h-14 text-lg font-bold transition-all ${
                  activeModule === module.id
                    ? 'bg-white text-green-900 shadow-xl scale-105'
                    : 'bg-green-800/50 text-white hover:bg-green-700'
                }`}
              >
                <module.icon className="w-5 h-5 mr-3" />
                {module.name}
              </Button>
            ))}
          </div>

          <div className="p-4 bg-green-800/50 rounded-xl">
            <h3 className="text-white font-bold mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Imibare Yihuse
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-green-700/50 rounded">
                <span className="text-yellow-200">Ababyeyi</span>
                <Badge className="bg-yellow-500 text-black">{stats.totalParents || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-700/50 rounded">
                <span className="text-yellow-200">Inama Zitegerejwe</span>
                <Badge className="bg-orange-500 text-white">{stats.upcomingMeetings || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-700/50 rounded">
                <span className="text-yellow-200">Imirimo Itegerejwe</span>
                <Badge className="bg-red-500 text-white">{stats.pendingTasks || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-700/50 rounded">
                <span className="text-yellow-200">Ibibazo by'Imyitwarire</span>
                <Badge className="bg-red-600 text-white">{stats.behaviorIssues || 0}</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'overview' && <OverviewModule stats={stats} data={data} />}
            {activeModule === 'parents' && <ParentsModule data={data.parents} openModal={openModal} handleDelete={handleDelete} />}
            {activeModule === 'communications' && <CommunicationsModule data={data.communications} openModal={openModal} />}
            {activeModule === 'meetings' && <MeetingsModule data={data.meetings} openModal={openModal} />}
            {activeModule === 'behavior' && <BehaviorModule data={data.behavior} openModal={openModal} />}
            {activeModule === 'counseling' && <CounselingModule data={data.counseling} openModal={openModal} />}
            {activeModule === 'tasks' && <TasksModule data={data.tasks} openModal={openModal} handleDelete={handleDelete} />}
            {activeModule === 'feedback' && <FeedbackModule data={data.feedback} openModal={openModal} />}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  {formData.id ? 'Guhindura' : 'Kongeramo'} {getModalTitle(modalType)}
                </h2>
                <Button onClick={closeModal} variant="ghost" size="sm">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={handleSubmit}>
                {renderModalForm(modalType, formData, setFormData)}
                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-yellow-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Bika
                  </Button>
                  <Button type="button" onClick={closeModal} variant="outline" className="flex-1">
                    Hagarika
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Functions
const getModalTitle = (type) => {
  const titles = {
    parent: 'Umubyeyi',
    communication: 'Itumanaho',
    meeting: 'Inama',
    behavior: 'Imyitwarire',
    counseling: 'Ubujyanama',
    homeVisit: 'Gusura Urugo',
    feedback: 'Igitekerezo',
    task: 'Umurimo'
  };
  return titles[type] || '';
};

const renderModalForm = (type, formData, setFormData) => {
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (type === 'parent') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Izina Ryambere" value={formData.first_name || ''} onChange={(e) => updateField('first_name', e.target.value)} required />
          <Input placeholder="Izina Ryukuri" value={formData.last_name || ''} onChange={(e) => updateField('last_name', e.target.value)} required />
        </div>
        <Input placeholder="Telefoni" value={formData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} required />
        <Input placeholder="Email" type="email" value={formData.email || ''} onChange={(e) => updateField('email', e.target.value)} />
        <Input placeholder="Indangamuntu" value={formData.national_id || ''} onChange={(e) => updateField('national_id', e.target.value)} />
        <Input placeholder="Aderesi" value={formData.address || ''} onChange={(e) => updateField('address', e.target.value)} />
        <Input placeholder="Akazi" value={formData.occupation || ''} onChange={(e) => updateField('occupation', e.target.value)} />
        <RwandaLocationSelector
          onLocationChange={(location) => updateField('location_data', location)}
          required={true}
        />
        <select className="w-full p-2 border rounded" value={formData.relationship_type || ''} onChange={(e) => updateField('relationship_type', e.target.value)} required>
          <option value="">Ubusabane</option>
          <option value="father">Se</option>
          <option value="mother">Nyina</option>
          <option value="guardian">Umurezi</option>
        </select>
      </div>
    );
  }

  if (type === 'communication') {
    return (
      <div className="space-y-4">
        <select className="w-full p-2 border rounded" value={formData.communication_type || ''} onChange={(e) => updateField('communication_type', e.target.value)} required>
          <option value="">Ubwoko bw'Itumanaho</option>
          <option value="call">Guhamagara</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
          <option value="meeting">Inama</option>
          <option value="home_visit">Gusura Urugo</option>
        </select>
        <Input placeholder="Ingingo (Kinyarwanda)" value={formData.subject_rw || ''} onChange={(e) => updateField('subject_rw', e.target.value)} required />
        <textarea className="w-full p-2 border rounded" rows="4" placeholder="Ubutumwa (Kinyarwanda)" value={formData.message_rw || ''} onChange={(e) => updateField('message_rw', e.target.value)} required />
        <select className="w-full p-2 border rounded" value={formData.priority || 'medium'} onChange={(e) => updateField('priority', e.target.value)}>
          <option value="low">Byihutirwa Bike</option>
          <option value="medium">Byihutirwa Hagati</option>
          <option value="high">Byihutirwa Cyane</option>
          <option value="urgent">Byihutirwa Cya Mbere</option>
        </select>
      </div>
    );
  }

  if (type === 'meeting') {
    return (
      <div className="space-y-4">
        <Input placeholder="Umutwe w'Inama (Kinyarwanda)" value={formData.title_rw || ''} onChange={(e) => updateField('title_rw', e.target.value)} required />
        <textarea className="w-full p-2 border rounded" rows="3" placeholder="Ibisobanuro (Kinyarwanda)" value={formData.description_rw || ''} onChange={(e) => updateField('description_rw', e.target.value)} />
        <Input type="datetime-local" value={formData.meeting_date || ''} onChange={(e) => updateField('meeting_date', e.target.value)} required />
        <Input placeholder="Ahantu" value={formData.location || ''} onChange={(e) => updateField('location', e.target.value)} />
        <Input type="number" placeholder="Iminota" value={formData.duration_minutes || 30} onChange={(e) => updateField('duration_minutes', e.target.value)} />
        <select className="w-full p-2 border rounded" value={formData.meeting_type || ''} onChange={(e) => updateField('meeting_type', e.target.value)} required>
          <option value="">Ubwoko bw'Inama</option>
          <option value="individual">Umuntu ku giti cye</option>
          <option value="group">Itsinda</option>
          <option value="emergency">Ihutirwa</option>
          <option value="routine">Isanzwe</option>
        </select>
      </div>
    );
  }

  if (type === 'task') {
    return (
      <div className="space-y-4">
        <Input placeholder="Umutwe w'Umurimo (Kinyarwanda)" value={formData.title_rw || ''} onChange={(e) => updateField('title_rw', e.target.value)} required />
        <textarea className="w-full p-2 border rounded" rows="3" placeholder="Ibisobanuro (Kinyarwanda)" value={formData.description_rw || ''} onChange={(e) => updateField('description_rw', e.target.value)} />
        <select className="w-full p-2 border rounded" value={formData.task_type || ''} onChange={(e) => updateField('task_type', e.target.value)} required>
          <option value="">Ubwoko bw'Umurimo</option>
          <option value="call">Guhamagara</option>
          <option value="meeting">Inama</option>
          <option value="report">Raporo</option>
          <option value="follow_up">Gukurikirana</option>
          <option value="visit">Gusura</option>
          <option value="other">Ibindi</option>
        </select>
        <Input type="datetime-local" value={formData.due_date || ''} onChange={(e) => updateField('due_date', e.target.value)} required />
        <select className="w-full p-2 border rounded" value={formData.priority || 'medium'} onChange={(e) => updateField('priority', e.target.value)}>
          <option value="low">Byihutirwa Bike</option>
          <option value="medium">Byihutirwa Hagati</option>
          <option value="high">Byihutirwa Cyane</option>
          <option value="urgent">Byihutirwa Cya Mbere</option>
        </select>
      </div>
    );
  }

  return null;
};

export default AdvisorDashboard;


// Module Components
const OverviewModule = ({ stats, data }: any) => (
  <div className="space-y-6">
    <h1 className="text-4xl font-black text-gray-900 mb-8">Ikigereranyo</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Ababyeyi', value: stats.totalParents, icon: Users, color: 'from-blue-600 to-indigo-600' },
        { label: 'Inama Zitegerejwe', value: stats.upcomingMeetings, icon: Calendar, color: 'from-green-600 to-emerald-600' },
        { label: 'Imirimo Itegerejwe', value: stats.pendingTasks, icon: ClipboardList, color: 'from-yellow-600 to-orange-600' },
        { label: 'Ibibazo by\'Imyitwarire', value: stats.behaviorIssues, icon: AlertTriangle, color: 'from-red-600 to-rose-600' }
      ].map((stat, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-black text-gray-900 mb-1">{stat.value || 0}</p>
              <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4">Imirimo Yihutirwa</h3>
          <div className="space-y-3">
            {data.tasks?.slice(0, 5).map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{task.title_rw}</p>
                  <p className="text-sm text-gray-600">{new Date(task.due_date).toLocaleDateString('rw-RW')}</p>
                </div>
                <Badge className={task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4">Inama Zitegerejwe</h3>
          <div className="space-y-3">
            {data.meetings?.slice(0, 5).map((meeting: any) => (
              <div key={meeting.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{meeting.title_rw}</p>
                  <p className="text-sm text-gray-600">{meeting.first_name} {meeting.last_name}</p>
                  <p className="text-xs text-gray-500">{new Date(meeting.meeting_date).toLocaleString('rw-RW')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const ParentsModule = ({ data, openModal, handleDelete }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-black text-gray-900">Ababyeyi</h1>
      <Button onClick={() => openModal('parent')} className="bg-gradient-to-r from-green-600 to-yellow-600">
        <Plus className="w-4 h-4 mr-2" />
        Kongeramo Umubyeyi
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((parent: any) => (
        <motion.div key={parent.id} whileHover={{ scale: 1.02 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-yellow-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openModal('parent', parent)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete('parent', parent.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{parent.first_name} {parent.last_name}</h3>
              <p className="text-sm text-gray-600 mb-3">{parent.relationship_type === 'father' ? 'Se' : parent.relationship_type === 'mother' ? 'Nyina' : 'Umurezi'}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>{parent.phone}</span>
                </div>
                {parent.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-yellow-600" />
                    <span className="truncate">{parent.email}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between text-xs text-gray-600">
                <span>{parent.total_children} Abana</span>
                <span>{parent.total_communications} Itumanaho</span>
                <span>{parent.total_meetings} Inama</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

const CommunicationsModule = ({ data, openModal }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-black text-gray-900">Itumanaho</h1>
      <Button onClick={() => openModal('communication')} className="bg-gradient-to-r from-purple-600 to-pink-600">
        <Plus className="w-4 h-4 mr-2" />
        Ohereza Ubutumwa
      </Button>
    </div>

    <div className="space-y-4">
      {data.map((comm: any) => (
        <motion.div key={comm.id} whileHover={{ x: 5 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-black text-gray-900">{comm.subject_rw}</h3>
                    <Badge className={comm.status === 'sent' ? 'bg-green-500' : comm.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'}>
                      {comm.status}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{comm.message_rw}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-semibold">{comm.first_name} {comm.last_name}</span>
                    <span>{comm.phone}</span>
                    <span>{new Date(comm.created_at).toLocaleDateString('rw-RW')}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openModal('communication', comm)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

const MeetingsModule = ({ data, openModal }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-black text-gray-900">Inama</h1>
      <Button onClick={() => openModal('meeting')} className="bg-gradient-to-r from-yellow-600 to-orange-600">
        <Plus className="w-4 h-4 mr-2" />
        Shiraho Inama
      </Button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.map((meeting: any) => (
        <motion.div key={meeting.id} whileHover={{ scale: 1.02 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{meeting.title_rw}</h3>
                    <p className="text-sm text-gray-600">{meeting.first_name} {meeting.last_name}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openModal('meeting', meeting)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span>{new Date(meeting.meeting_date).toLocaleString('rw-RW')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>{meeting.location || 'N/A'}</span>
                </div>
              </div>
              <Badge className={`mt-4 ${meeting.status === 'completed' ? 'bg-green-500' : meeting.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                {meeting.status}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

const BehaviorModule = ({ data, openModal }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-black text-gray-900">Imyitwarire y'Abanyeshuri</h1>
      <Button onClick={() => openModal('behavior')} className="bg-gradient-to-r from-red-600 to-rose-600">
        <Plus className="w-4 h-4 mr-2" />
        Andika Imyitwarire
      </Button>
    </div>

    <div className="space-y-4">
      {data.map((record: any) => (
        <motion.div key={record.id} whileHover={{ x: 5 }}>
          <Card className={record.behavior_type === 'negative' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className={`w-5 h-5 ${record.behavior_type === 'negative' ? 'text-red-600' : 'text-green-600'}`} />
                    <h3 className="text-lg font-black text-gray-900">{record.title_rw}</h3>
                    <Badge className={record.severity === 'critical' ? 'bg-red-600' : record.severity === 'major' ? 'bg-orange-500' : 'bg-yellow-500'}>
                      {record.severity}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{record.description_rw}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-semibold">{record.first_name} {record.last_name}</span>
                    <span>{record.student_code}</span>
                    <span>{new Date(record.incident_date).toLocaleDateString('rw-RW')}</span>
                    {record.resolved && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openModal('behavior', record)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

const CounselingModule = ({ data, openModal }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-black text-gray-900">Ubujyanama</h1>
      <Button onClick={() => openModal('counseling')} className="bg-gradient-to-r from-teal-600 to-cyan-600">
        <Plus className="w-4 h-4 mr-2" />
        Shiraho Umujyanama
      </Button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.map((session: any) => (
        <motion.div key={session.id} whileHover={{ scale: 1.02 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{session.title_rw}</h3>
                    <p className="text-sm text-gray-600">{session.first_name} {session.last_name}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openModal('counseling', session)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-700 mb-3">{session.concerns_rw}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{new Date(session.session_date).toLocaleString('rw-RW')}</span>
              </div>
              <Badge className={`mt-4 ${session.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}>
                {session.status}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

const TasksModule = ({ data, openModal, handleDelete }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-black text-gray-900">Imirimo Yanjye</h1>
      <Button onClick={() => openModal('task')} className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <Plus className="w-4 h-4 mr-2" />
        Kongeramo Umurimo
      </Button>
    </div>

    <div className="space-y-4">
      {data.map((task: any) => (
        <motion.div key={task.id} whileHover={{ x: 5 }}>
          <Card className={task.status === 'completed' ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-black text-gray-900">{task.title_rw}</h3>
                    <Badge className={task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}>
                      {task.priority}
                    </Badge>
                    <Badge className={task.status === 'completed' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'}>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{task.description_rw}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(task.due_date).toLocaleDateString('rw-RW')}</span>
                    </div>
                    {task.student_first_name && (
                      <span>Umunyeshuri: {task.student_first_name} {task.student_last_name}</span>
                    )}
                    {task.parent_first_name && (
                      <span>Umubyeyi: {task.parent_first_name} {task.parent_last_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openModal('task', task)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete('task', task.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

const FeedbackModule = ({ data, openModal }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-black text-gray-900">Ibitekerezo by'Ababyeyi</h1>
      <Button onClick={() => openModal('feedback')} className="bg-gradient-to-r from-orange-600 to-red-600">
        <Plus className="w-4 h-4 mr-2" />
        Andika Igitekerezo
      </Button>
    </div>

    <div className="space-y-4">
      {data.map((feedback: any) => (
        <motion.div key={feedback.id} whileHover={{ x: 5 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-black text-gray-900">{feedback.subject_rw}</h3>
                    <Badge className={feedback.feedback_type === 'complaint' ? 'bg-red-500' : feedback.feedback_type === 'compliment' ? 'bg-green-500' : 'bg-blue-500'}>
                      {feedback.feedback_type}
                    </Badge>
                    <Badge className={feedback.status === 'resolved' ? 'bg-green-500' : feedback.status === 'investigating' ? 'bg-yellow-500' : 'bg-gray-500'}>
                      {feedback.status}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{feedback.message_rw}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-semibold">{feedback.first_name} {feedback.last_name}</span>
                    <span>{feedback.phone}</span>
                    <span>{new Date(feedback.created_at).toLocaleDateString('rw-RW')}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openModal('feedback', feedback)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);
