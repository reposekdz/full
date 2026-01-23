import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Save, X, Upload, Trophy, Users, Calendar, Target, Award, Search, Filter } from 'lucide-react';

const AdminSportsManagement = () => {
  const [activeSection, setActiveSection] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [goals, setGoals] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [teamsRes, playersRes, matchesRes, goalsRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/sports/teams'),
        fetch('http://localhost:5000/api/sports-players/players'),
        fetch('http://localhost:5000/api/sports/matches'),
        fetch('http://localhost:5000/api/sports-players/goals'),
        fetch('http://localhost:5000/api/sports-advanced-mgmt/statistics')
      ]);

      setTeams(await teamsRes.json());
      setPlayers(await playersRes.json());
      setMatches(await matchesRes.json());
      setGoals(await goalsRes.json());
      setStatistics(await statsRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    if (imageFile) formDataToSend.append(modalType === 'team' ? 'logo' : 'photo', imageFile);

    try {
      const endpoints = {
        team: 'teams',
        player: 'players',
        match: 'matches',
        goal: 'goals'
      };

      const url = formData.id
        ? `http://localhost:5000/api/sports-advanced-mgmt/${endpoints[modalType]}/${formData.id}`
        : `http://localhost:5000/api/sports-advanced-mgmt/${endpoints[modalType]}`;

      await fetch(url, {
        method: formData.id ? 'PUT' : 'POST',
        body: formDataToSend
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
      const endpoints = { team: 'teams', player: 'players', match: 'matches', goal: 'goals' };
      await fetch(`http://localhost:5000/api/sports-advanced-mgmt/${endpoints[type]}/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormData(item || {});
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setFormData({});
    setImageFile(null);
  };

  const sections = [
    { id: 'teams', name: 'Amakipe', icon: Trophy, color: 'from-yellow-600 to-orange-600' },
    { id: 'players', name: 'Abakinnyi', icon: Users, color: 'from-green-600 to-emerald-600' },
    { id: 'matches', name: 'Imikino', icon: Calendar, color: 'from-blue-600 to-indigo-600' },
    { id: 'goals', name: 'Ibitego', icon: Target, color: 'from-red-600 to-rose-600' },
    { id: 'statistics', name: 'Imibare', icon: Award, color: 'from-purple-600 to-pink-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-green-600">Gutegura...</div>
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
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 text-center">Gucunga Siporo</h1>
            <p className="text-yellow-200 text-center text-sm">Admin Management</p>
          </div>

          <div className="space-y-3 mb-8">
            {sections.map((section) => (
              <Button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full justify-start h-14 text-lg font-bold ${
                  activeSection === section.id
                    ? 'bg-white text-green-900 shadow-xl'
                    : 'bg-green-800/50 text-white hover:bg-green-700'
                }`}
              >
                <section.icon className="w-5 h-5 mr-3" />
                {section.name}
              </Button>
            ))}
          </div>

          <div className="p-4 bg-green-800/50 rounded-xl">
            <h3 className="text-white font-bold mb-3">Imibare Yihuse</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-yellow-200">
                <span>Amakipe:</span>
                <span className="font-bold text-white">{statistics.totalTeams || 0}</span>
              </div>
              <div className="flex justify-between text-yellow-200">
                <span>Abakinnyi:</span>
                <span className="font-bold text-white">{statistics.totalPlayers || 0}</span>
              </div>
              <div className="flex justify-between text-yellow-200">
                <span>Imikino:</span>
                <span className="font-bold text-white">{statistics.totalMatches || 0}</span>
              </div>
              <div className="flex justify-between text-yellow-200">
                <span>Ibitego:</span>
                <span className="font-bold text-white">{statistics.totalGoals || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black text-gray-900">
                {sections.find(s => s.id === activeSection)?.name}
              </h2>
              {activeSection !== 'statistics' && (
                <Button
                  onClick={() => openModal(activeSection === 'teams' ? 'team' : activeSection === 'players' ? 'player' : activeSection === 'matches' ? 'match' : 'goal')}
                  className="bg-gradient-to-r from-green-600 to-yellow-600 h-12 px-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Kongeramo
                </Button>
              )}
            </div>

            {/* Search */}
            {activeSection !== 'statistics' && (
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Shakisha..."
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            )}

            {/* Teams Section */}
            {activeSection === 'teams' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.filter(t => t.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((team) => (
                  <motion.div key={team.id} whileHover={{ scale: 1.02 }}>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            {team.logo_url && (
                              <img src={`http://localhost:5000${team.logo_url}`} alt={team.name} className="w-16 h-16 rounded-full object-cover" />
                            )}
                            <div>
                              <h3 className="text-xl font-black text-gray-900">{team.name}</h3>
                              <Badge className="bg-green-500">{team.sport}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openModal('team', team)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete('team', team.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-green-50 rounded">
                            <p className="text-2xl font-black text-green-600">{team.wins || 0}</p>
                            <p className="text-xs text-gray-600">Intsinzi</p>
                          </div>
                          <div className="p-2 bg-red-50 rounded">
                            <p className="text-2xl font-black text-red-600">{team.losses || 0}</p>
                            <p className="text-xs text-gray-600">Gutsindwa</p>
                          </div>
                          <div className="p-2 bg-yellow-50 rounded">
                            <p className="text-2xl font-black text-yellow-600">{team.draws || 0}</p>
                            <p className="text-xs text-gray-600">Guhuza</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Players Section */}
            {activeSection === 'players' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {players.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((player) => (
                  <motion.div key={player.id} whileHover={{ scale: 1.02 }}>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-yellow-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                            {player.jersey_number}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openModal('player', player)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete('player', player.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">{player.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{player.position}</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <p className="font-black text-green-600">{player.goals || 0}</p>
                            <p className="text-gray-600">Ibitego</p>
                          </div>
                          <div>
                            <p className="font-black text-yellow-600">{player.assists || 0}</p>
                            <p className="text-gray-600">Assists</p>
                          </div>
                          <div>
                            <p className="font-black text-blue-600">{player.matches_played || 0}</p>
                            <p className="text-gray-600">Imikino</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Matches Section */}
            {activeSection === 'matches' && (
              <div className="space-y-4">
                {matches.map((match) => (
                  <motion.div key={match.id} whileHover={{ x: 5 }}>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-4">
                                <h3 className="text-xl font-black">{match.team1_name}</h3>
                                <Badge className="text-2xl font-black px-4 py-2">{match.team1_score || 0}</Badge>
                              </div>
                              <span className="text-gray-500 font-bold">VS</span>
                              <div className="flex items-center gap-4">
                                <Badge className="text-2xl font-black px-4 py-2">{match.team2_score || 0}</Badge>
                                <h3 className="text-xl font-black">{match.team2_name}</h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{new Date(match.match_date).toLocaleDateString('rw-RW')}</span>
                              <span>{match.location}</span>
                              <Badge className={match.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>{match.status}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openModal('match', match)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete('match', match.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Statistics Section */}
            {activeSection === 'statistics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <Trophy className="w-12 h-12 text-yellow-600 mb-4" />
                    <p className="text-4xl font-black text-gray-900 mb-2">{statistics.totalTeams || 0}</p>
                    <p className="text-gray-600 font-semibold">Amakipe Yose</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Users className="w-12 h-12 text-green-600 mb-4" />
                    <p className="text-4xl font-black text-gray-900 mb-2">{statistics.totalPlayers || 0}</p>
                    <p className="text-gray-600 font-semibold">Abakinnyi Bose</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Calendar className="w-12 h-12 text-blue-600 mb-4" />
                    <p className="text-4xl font-black text-gray-900 mb-2">{statistics.totalMatches || 0}</p>
                    <p className="text-gray-600 font-semibold">Imikino Yose</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Target className="w-12 h-12 text-red-600 mb-4" />
                    <p className="text-4xl font-black text-gray-900 mb-2">{statistics.totalGoals || 0}</p>
                    <p className="text-gray-600 font-semibold">Ibitego Byose</p>
                  </CardContent>
                </Card>

                {/* Top Scorers */}
                <Card className="md:col-span-2 lg:col-span-4">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-4">Abakinnyi Bakora Ibitego Byinshi</h3>
                    <div className="space-y-3">
                      {statistics.topScorers?.map((scorer, i) => (
                        <div key={scorer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-black text-gray-900">{scorer.name}</p>
                              <p className="text-sm text-gray-600">{scorer.position}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600 text-white text-xl px-4 py-2">{scorer.goals_count} Ibitego</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">{formData.id ? 'Guhindura' : 'Kongeramo'}</h2>
                <Button onClick={closeModal} variant="ghost" size="sm">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {modalType === 'team' && (
                  <>
                    <Input placeholder="Izina ry'Ikipe" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <Input placeholder="Siporo" value={formData.sport || ''} onChange={(e) => setFormData({...formData, sport: e.target.value})} required />
                    <Input placeholder="Umutoza" value={formData.coach || ''} onChange={(e) => setFormData({...formData, coach: e.target.value})} />
                    <textarea className="w-full p-2 border rounded" rows="3" placeholder="Ibisobanuro" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    <Input type="file" onChange={handleImageChange} accept="image/*" />
                  </>
                )}
                {modalType === 'player' && (
                  <>
                    <select className="w-full p-2 border rounded" value={formData.team_id || ''} onChange={(e) => setFormData({...formData, team_id: e.target.value})} required>
                      <option value="">Hitamo Ikipe</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <Input placeholder="Izina" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <Input type="number" placeholder="Nimero" value={formData.jersey_number || ''} onChange={(e) => setFormData({...formData, jersey_number: e.target.value})} required />
                    <Input placeholder="Umwanya" value={formData.position || ''} onChange={(e) => setFormData({...formData, position: e.target.value})} required />
                    <Input type="number" placeholder="Imyaka" value={formData.age || ''} onChange={(e) => setFormData({...formData, age: e.target.value})} />
                    <Input placeholder="Icyiciro" value={formData.class_level || ''} onChange={(e) => setFormData({...formData, class_level: e.target.value})} />
                  </>
                )}
                {modalType === 'match' && (
                  <>
                    <select className="w-full p-2 border rounded" value={formData.team1_id || ''} onChange={(e) => setFormData({...formData, team1_id: e.target.value})} required>
                      <option value="">Ikipe ya 1</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select className="w-full p-2 border rounded" value={formData.team2_id || ''} onChange={(e) => setFormData({...formData, team2_id: e.target.value})} required>
                      <option value="">Ikipe ya 2</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <Input type="datetime-local" value={formData.match_date || ''} onChange={(e) => setFormData({...formData, match_date: e.target.value})} required />
                    <Input placeholder="Ahantu" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                    <Input type="number" placeholder="Amanota ya 1" value={formData.team1_score || 0} onChange={(e) => setFormData({...formData, team1_score: e.target.value})} />
                    <Input type="number" placeholder="Amanota ya 2" value={formData.team2_score || 0} onChange={(e) => setFormData({...formData, team2_score: e.target.value})} />
                    <select className="w-full p-2 border rounded" value={formData.status || 'scheduled'} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="scheduled">Yateguwe</option>
                      <option value="completed">Yarangiye</option>
                      <option value="cancelled">Yahagaritswe</option>
                    </select>
                  </>
                )}
                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-yellow-600">
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

export default AdminSportsManagement;
