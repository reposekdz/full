import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Settings, HelpCircle, Trophy, Plus, Edit, Trash2, Save, Upload, Image as ImageIcon, Users, BookOpen, Award, Target, BarChart3, Calendar, FileText, MessageSquare, Search, Filter, Download, Eye, TrendingUp } from 'lucide-react';

const UltimateAdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [data, setData] = useState({
    support: { categories: [], faqs: [], tickets: [], articles: [] },
    sports: { teams: [], players: [], matches: [], coaches: [] },
    system: { images: [], content: [], settings: [] }
  });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [supportRes, sportsRes, systemRes] = await Promise.all([
        Promise.all([
          fetch('http://localhost:5000/api/support-enhanced/categories'),
          fetch('http://localhost:5000/api/support-enhanced/faqs'),
          fetch('http://localhost:5000/api/support-enhanced/tickets'),
          fetch('http://localhost:5000/api/support-enhanced/articles'),
          fetch('http://localhost:5000/api/support-enhanced/stats')
        ]),
        Promise.all([
          fetch('http://localhost:5000/api/sports/teams'),
          fetch('http://localhost:5000/api/sports-players/players'),
          fetch('http://localhost:5000/api/sports/matches'),
          fetch('http://localhost:5000/api/services-advanced/coaches')
        ]),
        Promise.all([
          fetch('http://localhost:5000/api/system-updates/images'),
          fetch('http://localhost:5000/api/system-updates/content'),
          fetch('http://localhost:5000/api/system-updates/settings')
        ])
      ]);

      const supportData = await Promise.all(supportRes.map(r => r.json()));
      const sportsData = await Promise.all(sportsRes.map(r => r.json()));
      const systemData = await Promise.all(systemRes.map(r => r.json()));

      setData({
        support: {
          categories: supportData[0],
          faqs: supportData[1],
          tickets: supportData[2],
          articles: supportData[3]
        },
        sports: {
          teams: sportsData[0],
          players: sportsData[1],
          matches: sportsData[2],
          coaches: sportsData[3]
        },
        system: {
          images: systemData[0],
          content: systemData[1],
          settings: systemData[2]
        }
      });

      setStats(supportData[4]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'object' && formData[key] !== null) {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    if (imageFile) formDataToSend.append('image', imageFile);

    try {
      const endpoints = {
        faq: 'http://localhost:5000/api/support-enhanced/faqs',
        article: 'http://localhost:5000/api/support-enhanced/articles',
        team: 'http://localhost:5000/api/sports/teams',
        player: 'http://localhost:5000/api/sports-players/players',
        coach: 'http://localhost:5000/api/services-advanced/coaches',
        systemImage: 'http://localhost:5000/api/system-updates/images',
        systemContent: 'http://localhost:5000/api/system-updates/content'
      };

      const endpoint = endpoints[modalType];
      const method = formData.id ? 'PUT' : 'POST';
      const needsJSON = ['faq', 'article'].includes(modalType);

      await fetch(formData.id ? `${endpoint}/${formData.id}` : endpoint, {
        method,
        body: needsJSON ? JSON.stringify(formData) : formDataToSend,
        ...(needsJSON && { headers: { 'Content-Type': 'application/json' } })
      });

      fetchAllData();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Delete this item?')) return;
    
    try {
      const endpoints = {
        faq: `http://localhost:5000/api/support-enhanced/faqs/${id}`,
        article: `http://localhost:5000/api/support-enhanced/articles/${id}`,
        team: `http://localhost:5000/api/sports/teams/${id}`,
        player: `http://localhost:5000/api/sports-players/players/${id}`,
        systemImage: `http://localhost:5000/api/system-updates/images/${id}`,
        systemContent: `http://localhost:5000/api/system-updates/content/${id}`
      };

      await fetch(endpoints[type], { method: 'DELETE' });
      fetchAllData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormData(item || {});
    setImagePreview(item?.image_url ? `http://localhost:5000${item.image_url}` : '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setFormData({});
    setImageFile(null);
    setImagePreview('');
  };

  const modules = [
    { id: 'overview', name: 'Overview', icon: BarChart3, color: 'from-blue-600 to-indigo-600' },
    { id: 'support', name: 'Support', icon: HelpCircle, color: 'from-green-600 to-emerald-600' },
    { id: 'sports', name: 'Sports', icon: Trophy, color: 'from-yellow-600 to-orange-600' },
    { id: 'system', name: 'System', icon: Settings, color: 'from-purple-600 to-pink-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-20 h-20 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-2xl font-black text-gray-900">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex">
        {/* Advanced Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 min-h-screen p-6 shadow-2xl sticky top-0 h-screen overflow-y-auto"
        >
          <div className="mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
            >
              <Settings className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2 text-center">Ultimate Admin</h1>
            <p className="text-indigo-200 text-center text-sm">Complete Management System</p>
          </div>

          <div className="space-y-3 mb-8">
            {modules.map((module) => (
              <Button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full justify-start h-14 text-lg font-bold transition-all ${
                  activeModule === module.id
                    ? 'bg-white text-indigo-900 shadow-xl scale-105'
                    : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
                }`}
              >
                <module.icon className="w-5 h-5 mr-3" />
                {module.name}
              </Button>
            ))}
          </div>

          <div className="p-4 bg-indigo-800/50 rounded-xl mb-4">
            <h3 className="text-white font-bold mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Quick Stats
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-indigo-700/50 rounded">
                <span className="text-indigo-200">Support Tickets:</span>
                <span className="font-black text-white text-lg">{stats?.total_tickets || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-indigo-700/50 rounded">
                <span className="text-indigo-200">Sports Teams:</span>
                <span className="font-black text-white text-lg">{data.sports.teams.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-indigo-700/50 rounded">
                <span className="text-indigo-200">Total Players:</span>
                <span className="font-black text-white text-lg">{data.sports.players.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-indigo-700/50 rounded">
                <span className="text-indigo-200">FAQs:</span>
                <span className="font-black text-white text-lg">{data.support.faqs.length}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
            <h3 className="text-white font-black mb-2 text-center">System Status</h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl">✓</span>
              </div>
              <p className="text-white font-bold">All Systems Operational</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-5xl font-black text-gray-900 mb-2">
                  {activeModule === 'overview' ? 'Dashboard Overview' :
                   activeModule === 'support' ? 'Support Management' :
                   activeModule === 'sports' ? 'Sports Management' : 'System Settings'}
                </h2>
                <p className="text-gray-600">Complete control over all system content</p>
              </div>
              {activeModule !== 'overview' && (
                <Button
                  onClick={() => openModal(activeModule === 'support' ? 'faq' : activeModule === 'sports' ? 'team' : 'systemContent')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold h-14 px-8 shadow-2xl"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Add New
                </Button>
              )}
            </div>

            {/* Overview Module */}
            {activeModule === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Tickets', value: stats?.total_tickets || 0, icon: MessageSquare, color: 'from-blue-500 to-indigo-600' },
                    { label: 'Sports Teams', value: data.sports.teams.length, icon: Trophy, color: 'from-green-500 to-emerald-600' },
                    { label: 'Total Players', value: data.sports.players.length, icon: Users, color: 'from-yellow-500 to-orange-600' },
                    { label: 'Knowledge Base', value: data.support.articles.length, icon: BookOpen, color: 'from-purple-500 to-pink-600' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
                        <CardContent className="p-6">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                            <stat.icon className="w-9 h-9 text-white" />
                          </div>
                          <p className="text-4xl font-black text-gray-900 mb-2 text-center">{stat.value}</p>
                          <p className="text-sm font-bold text-gray-600 text-center uppercase">{stat.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-2xl">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-black text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {data.support.tickets.slice(0, 5).map((ticket, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            <div className="flex-1">
                              <p className="font-bold text-sm">{ticket.subject}</p>
                              <p className="text-xs text-gray-600">{ticket.user_name}</p>
                            </div>
                            <Badge className={ticket.status === 'resolved' ? 'bg-green-600' : 'bg-yellow-600'}>
                              {ticket.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-2xl">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-black text-gray-900 mb-4">Top Performers</h3>
                      <div className="space-y-3">
                        {data.sports.players.slice(0, 5).map((player, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-black">
                              {player.jersey_number}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm">{player.name}</p>
                              <p className="text-xs text-gray-600">{player.position}</p>
                            </div>
                            <span className="text-lg font-black text-green-600">{player.goals_scored || 0}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Support Module */}
            {activeModule === 'support' && (
              <div className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search FAQs, tickets, articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white h-12 px-6">
                    <Filter className="w-5 h-5 mr-2" />
                    Filter
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.support.faqs.map((faq) => (
                    <Card key={faq.id} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-gray-900 mb-2">{faq.question_rw}</h4>
                            <p className="text-sm text-gray-600 mb-2">{faq.question_en}</p>
                            <p className="text-gray-700 text-sm line-clamp-2">{faq.answer_rw}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={() => openModal('faq', faq)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete('faq', faq.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sports Module */}
            {activeModule === 'sports' && (
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-black text-gray-900">Teams</h3>
                    <Button
                      onClick={() => openModal('team')}
                      className="bg-gradient-to-r from-green-600 to-yellow-500 text-white h-12 px-6"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Team
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.sports.teams.map((team) => (
                      <Card key={team.id} className="border-0 shadow-xl hover:shadow-2xl transition-all">
                        <div className="h-2 bg-gradient-to-r from-green-500 to-yellow-500"></div>
                        <CardContent className="p-6">
                          <Badge className="mb-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white">
                            {team.sport}
                          </Badge>
                          <h4 className="text-xl font-black text-gray-900 mb-2">{team.name}</h4>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{team.description_rw}</p>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-green-100 rounded-lg p-2 text-center">
                              <p className="text-2xl font-black text-green-700">{team.wins || 0}</p>
                              <p className="text-xs text-gray-600">Wins</p>
                            </div>
                            <div className="bg-red-100 rounded-lg p-2 text-center">
                              <p className="text-2xl font-black text-red-700">{team.losses || 0}</p>
                              <p className="text-xs text-gray-600">Losses</p>
                            </div>
                            <div className="bg-yellow-100 rounded-lg p-2 text-center">
                              <p className="text-2xl font-black text-yellow-700">{team.players_count || 0}</p>
                              <p className="text-xs text-gray-600">Players</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openModal('team', team)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete('team', team.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-black text-gray-900">Players</h3>
                    <Button
                      onClick={() => openModal('player')}
                      className="bg-gradient-to-r from-yellow-600 to-orange-500 text-white h-12 px-6"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Player
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {data.sports.players.map((player) => (
                      <Card key={player.id} className="border-0 shadow-xl hover:shadow-2xl transition-all">
                        <CardContent className="p-4 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-black shadow-xl">
                            {player.jersey_number}
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 mb-1">{player.name}</h4>
                          <p className="text-xs text-gray-600 mb-3">{player.position}</p>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => openModal('player', player)}
                              className="flex-1 bg-blue-600 text-white text-xs p-1"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => handleDelete('player', player.id)}
                              className="flex-1 bg-red-600 text-white text-xs p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* System Module */}
            {activeModule === 'system' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <CardContent className="p-8 text-center">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-5xl font-black mb-2">{data.system.images.length}</p>
                      <p className="text-xl font-bold">System Images</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <CardContent className="p-8 text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-5xl font-black mb-2">{data.system.content.length}</p>
                      <p className="text-xl font-bold">Content Items</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <CardContent className="p-8 text-center">
                      <Settings className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-5xl font-black mb-2">{data.system.settings.length}</p>
                      <p className="text-xl font-bold">Settings</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Universal Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8"
            >
              <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl flex justify-between items-center">
                <h3 className="text-2xl font-black">
                  {modalType === 'faq' ? 'FAQ' :
                   modalType === 'team' ? 'Team' :
                   modalType === 'player' ? 'Player' :
                   modalType === 'coach' ? 'Coach' : 'Content'} Management
                </h3>
                <Button onClick={closeModal} className="bg-white/20 hover:bg-white/30 text-white">
                  ×
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {modalType === 'faq' && (
                  <>
                    <Input placeholder="Question (Kinyarwanda)" value={formData.question_rw || ''} onChange={(e) => setFormData({ ...formData, question_rw: e.target.value })} required />
                    <Input placeholder="Question (English)" value={formData.question_en || ''} onChange={(e) => setFormData({ ...formData, question_en: e.target.value })} required />
                    <textarea placeholder="Answer (Kinyarwanda)" value={formData.answer_rw || ''} onChange={(e) => setFormData({ ...formData, answer_rw: e.target.value })} className="w-full p-3 border rounded-lg min-h-[100px]" required />
                    <textarea placeholder="Answer (English)" value={formData.answer_en || ''} onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })} className="w-full p-3 border rounded-lg min-h-[100px]" required />
                  </>
                )}

                {(modalType === 'team' || modalType === 'player') && (
                  <>
                    <Input placeholder="Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    {modalType === 'player' && (
                      <>
                        <Input type="number" placeholder="Jersey Number" value={formData.jersey_number || ''} onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })} required />
                        <Input placeholder="Position" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} required />
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-bold mb-2">Upload Image</label>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                      {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />}
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold h-12">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </Button>
                  <Button type="button" onClick={closeModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold h-12">
                    Cancel
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

export default UltimateAdminDashboard;
