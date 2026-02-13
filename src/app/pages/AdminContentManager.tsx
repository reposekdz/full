import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import RwandaLocationSelector from '../components/RwandaLocationSelector';
import { Settings, HelpCircle, Trophy, Plus, Edit, Trash2, Save, Upload, Image as ImageIcon } from 'lucide-react';

const AdminContentManager = () => {
  const [activeModule, setActiveModule] = useState('support');
  const [supportCategories, setSupportCategories] = useState([]);
  const [supportFaqs, setSupportFaqs] = useState([]);
  const [sportsTeams, setSportsTeams] = useState([]);
  const [sportsPlayers, setSportsPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeModule]);

  const fetchData = async () => {
    try {
      if (activeModule === 'support') {
        const [categoriesRes, faqsRes] = await Promise.all([
          fetch('http://localhost:5000/api/support-enhanced/categories'),
          fetch('http://localhost:5000/api/support-enhanced/faqs')
        ]);
        setSupportCategories(await categoriesRes.json());
        setSupportFaqs(await faqsRes.json());
      } else {
        const [teamsRes, playersRes] = await Promise.all([
          fetch('http://localhost:5000/api/sports/teams'),
          fetch('http://localhost:5000/api/sports-players/players')
        ]);
        setSportsTeams(await teamsRes.json());
        setSportsPlayers(await playersRes.json());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    if (imageFile) formDataToSend.append('image', imageFile);

    try {
      let endpoint = '';
      if (modalType === 'faq') endpoint = 'http://localhost:5000/api/support-enhanced/faqs';
      else if (modalType === 'team') endpoint = 'http://localhost:5000/api/sports/teams';
      else if (modalType === 'player') endpoint = 'http://localhost:5000/api/sports-players/players';

      await fetch(endpoint, {
        method: formData.id ? 'PUT' : 'POST',
        body: modalType === 'faq' ? JSON.stringify(formData) : formDataToSend,
        ...(modalType === 'faq' && { headers: { 'Content-Type': 'application/json' } })
      });

      fetchData();
      setShowModal(false);
      setFormData({});
      setImageFile(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      let endpoint = '';
      if (type === 'faq') endpoint = `http://localhost:5000/api/support-enhanced/faqs/${id}`;
      else if (type === 'team') endpoint = `http://localhost:5000/api/sports/teams/${id}`;
      else if (type === 'player') endpoint = `http://localhost:5000/api/sports-players/players/${id}`;

      await fetch(endpoint, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormData(item || {});
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 min-h-screen p-6 shadow-2xl"
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Settings className="w-12 h-12 text-white animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 text-center">Content Manager</h1>
            <p className="text-indigo-200 text-center text-sm">Dynamic Updates</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setActiveModule('support')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeModule === 'support'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <HelpCircle className="w-5 h-5 mr-3" />
              Support Content
            </Button>

            <Button
              onClick={() => setActiveModule('sports')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeModule === 'sports'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <Trophy className="w-5 h-5 mr-3" />
              Sports Content
            </Button>
          </div>

          <div className="mt-8 p-4 bg-indigo-800/50 rounded-xl">
            <h3 className="text-white font-bold mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              {activeModule === 'support' ? (
                <>
                  <div className="flex justify-between text-indigo-200">
                    <span>Categories:</span>
                    <span className="font-bold text-white">{supportCategories.length}</span>
                  </div>
                  <div className="flex justify-between text-indigo-200">
                    <span>FAQs:</span>
                    <span className="font-bold text-white">{supportFaqs.length}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-indigo-200">
                    <span>Teams:</span>
                    <span className="font-bold text-white">{sportsTeams.length}</span>
                  </div>
                  <div className="flex justify-between text-indigo-200">
                    <span>Players:</span>
                    <span className="font-bold text-white">{sportsPlayers.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black text-gray-900">
                {activeModule === 'support' ? 'Manage Support Content' : 'Manage Sports Content'}
              </h2>
              <Button
                onClick={() => openModal(activeModule === 'support' ? 'faq' : 'team')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold h-12 px-6 shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New
              </Button>
            </div>

            {/* Support Content */}
            {activeModule === 'support' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900">FAQs</h3>
                {supportFaqs.map((faq, index) => (
                  <Card key={faq.id} className="border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{faq.question_rw}</h4>
                          <p className="text-sm text-gray-600 mb-2">{faq.question_en}</p>
                          <p className="text-gray-700">{faq.answer_rw}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => openModal('faq', faq)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete('faq', faq.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Sports Content */}
            {activeModule === 'sports' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-gray-900">Teams</h3>
                    <Button
                      onClick={() => openModal('team')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sportsTeams.map((team) => (
                      <Card key={team.id} className="border-0 shadow-xl">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-2">{team.name}</h4>
                              <Badge className="bg-green-600 text-white mb-2">{team.sport}</Badge>
                              <p className="text-sm text-gray-600">{team.description_rw}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => openModal('team', team)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete('team', team.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-gray-900">Players</h3>
                    <Button
                      onClick={() => openModal('player')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Player
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sportsPlayers.map((player) => (
                      <Card key={player.id} className="border-0 shadow-xl">
                        <CardContent className="p-6">
                          <div className="text-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-black">
                              {player.jersey_number}
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">{player.name}</h4>
                            <p className="text-sm text-gray-600">{player.position}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openModal('player', player)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete('player', player.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-black">
                {modalType === 'faq' ? 'FAQ' : modalType === 'team' ? 'Team' : 'Player'}
              </h3>
              <Button onClick={() => setShowModal(false)} className="bg-gray-200">
                ×
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalType === 'faq' && (
                <>
                  <Input
                    placeholder="Question (Kinyarwanda)"
                    value={formData.question_rw || ''}
                    onChange={(e) => setFormData({ ...formData, question_rw: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Question (English)"
                    value={formData.question_en || ''}
                    onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Answer (Kinyarwanda)"
                    value={formData.answer_rw || ''}
                    onChange={(e) => setFormData({ ...formData, answer_rw: e.target.value })}
                    className="w-full p-3 border rounded-lg min-h-[100px]"
                    required
                  />
                  <textarea
                    placeholder="Answer (English)"
                    value={formData.answer_en || ''}
                    onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
                    className="w-full p-3 border rounded-lg min-h-[100px]"
                    required
                  />
                </>
              )}

              {(modalType === 'team' || modalType === 'player') && (
                <>
                  <Input
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  {modalType === 'player' && (
                    <>
                      <Input
                        type="number"
                        placeholder="Jersey Number"
                        value={formData.jersey_number || ''}
                        onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Position"
                        value={formData.position || ''}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        required
                      />
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full"
                  />
                  {(modalType === 'team' || modalType === 'player') && (
                    <div>
                      <Label className="text-lg font-semibold text-indigo-700">Location (Rwanda)</Label>
                      <RwandaLocationSelector
                        onLocationChange={(location) => setFormData({...formData, ...location})}
                        required={true}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold h-12">
                  <Save className="w-5 h-5 mr-2" />
                  Save
                </Button>
                <Button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 h-12">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentManager;
