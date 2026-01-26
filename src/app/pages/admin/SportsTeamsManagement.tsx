import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Trophy, Upload, Save, X } from 'lucide-react';

const SportsTeamsManagement: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('teams');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      if (activeTab === 'teams') {
        const res = await fetch('http://localhost:5000/api/sports/teams', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setTeams(data.teams);
      } else if (activeTab === 'coaches') {
        const res = await fetch('http://localhost:5000/api/sports/coaches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setCoaches(data.coaches);
      } else if (activeTab === 'players') {
        const res = await fetch('http://localhost:5000/api/sports/players', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setPlayers(data.players);
      } else if (activeTab === 'achievements') {
        const res = await fetch('http://localhost:5000/api/sports/achievements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setAchievements(data.achievements);
      } else if (activeTab === 'matches') {
        const res = await fetch('http://localhost:5000/api/sports/matches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setMatches(data.matches);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const endpoint = editingItem 
      ? `http://localhost:5000/api/sports/${activeTab}/${editingItem.id}`
      : `http://localhost:5000/api/sports/${activeTab}`;
    
    try {
      const res = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert(editingItem ? 'Updated successfully!' : 'Created successfully!');
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        fetchData();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/sports/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-600 to-green-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Sports Teams Management</h1>
          <p className="text-yellow-100">Manage teams, coaches, players, achievements, and matches</p>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto">
          {['teams', 'coaches', 'players', 'achievements', 'matches', 'overview'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowForm(false); }}
              className={`px-6 py-3 rounded-lg font-bold capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-yellow-600 to-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab === 'overview' ? 'Team Overview' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <iframe
            src="/admin/team-overview"
            className="w-full h-[800px] border-0 rounded-xl"
            title="Team Overview Management"
          />
        ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">Manage {activeTab}</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-600 to-lime-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Add New
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}</h3>
              
              {activeTab === 'teams' && (
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Team Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input placeholder="Name (Kinyarwanda)" value={formData.name_rw || ''} onChange={(e) => setFormData({...formData, name_rw: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <select value={formData.sport_type || ''} onChange={(e) => setFormData({...formData, sport_type: e.target.value})} className="px-4 py-2 border rounded-lg" required>
                    <option value="">Select Sport</option>
                    <option value="football">Football</option>
                    <option value="volleyball">Volleyball</option>
                  </select>
                  <input placeholder="Icon (emoji)" value={formData.icon || ''} onChange={(e) => setFormData({...formData, icon: e.target.value})} className="px-4 py-2 border rounded-lg" />
                </div>
              )}

              {activeTab === 'coaches' && (
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Coach Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input placeholder="Name (Kinyarwanda)" value={formData.name_rw || ''} onChange={(e) => setFormData({...formData, name_rw: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <select value={formData.team_id || ''} onChange={(e) => setFormData({...formData, team_id: e.target.value})} className="px-4 py-2 border rounded-lg" required>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input type="number" placeholder="Experience Years" value={formData.experience_years || ''} onChange={(e) => setFormData({...formData, experience_years: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <input placeholder="Role" value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <input placeholder="Specialization" value={formData.specialization || ''} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <textarea placeholder="Bio (Kinyarwanda)" value={formData.bio_rw || ''} onChange={(e) => setFormData({...formData, bio_rw: e.target.value})} className="px-4 py-2 border rounded-lg col-span-2" rows={3} />
                </div>
              )}

              {activeTab === 'players' && (
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Player Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input placeholder="Name (Kinyarwanda)" value={formData.name_rw || ''} onChange={(e) => setFormData({...formData, name_rw: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <select value={formData.team_id || ''} onChange={(e) => setFormData({...formData, team_id: e.target.value})} className="px-4 py-2 border rounded-lg" required>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input type="number" placeholder="Jersey Number" value={formData.jersey_number || ''} onChange={(e) => setFormData({...formData, jersey_number: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input placeholder="Position" value={formData.position || ''} onChange={(e) => setFormData({...formData, position: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input placeholder="Position (Kinyarwanda)" value={formData.position_rw || ''} onChange={(e) => setFormData({...formData, position_rw: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <input placeholder="Class" value={formData.class || ''} onChange={(e) => setFormData({...formData, class: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <input type="number" placeholder="Height (cm)" value={formData.height || ''} onChange={(e) => setFormData({...formData, height: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <label className="flex items-center gap-2 col-span-2">
                    <input type="checkbox" checked={formData.is_captain || false} onChange={(e) => setFormData({...formData, is_captain: e.target.checked})} />
                    <span>Is Captain</span>
                  </label>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="grid grid-cols-2 gap-4">
                  <select value={formData.team_id || ''} onChange={(e) => setFormData({...formData, team_id: e.target.value})} className="px-4 py-2 border rounded-lg" required>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input placeholder="Title (Kinyarwanda)" value={formData.title_rw || ''} onChange={(e) => setFormData({...formData, title_rw: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <input placeholder="Competition Name" value={formData.competition_name || ''} onChange={(e) => setFormData({...formData, competition_name: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <input placeholder="Position" value={formData.position || ''} onChange={(e) => setFormData({...formData, position: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <input type="date" placeholder="Achievement Date" value={formData.achievement_date || ''} onChange={(e) => setFormData({...formData, achievement_date: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <input placeholder="Icon (emoji)" value={formData.icon || ''} onChange={(e) => setFormData({...formData, icon: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <textarea placeholder="Description (Kinyarwanda)" value={formData.description_rw || ''} onChange={(e) => setFormData({...formData, description_rw: e.target.value})} className="px-4 py-2 border rounded-lg col-span-2" rows={3} />
                </div>
              )}

              {activeTab === 'matches' && (
                <div className="grid grid-cols-2 gap-4">
                  <select value={formData.team_id || ''} onChange={(e) => setFormData({...formData, team_id: e.target.value})} className="px-4 py-2 border rounded-lg" required>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input placeholder="Opponent" value={formData.opponent || ''} onChange={(e) => setFormData({...formData, opponent: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input type="number" placeholder="Our Score" value={formData.our_score || ''} onChange={(e) => setFormData({...formData, our_score: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input type="number" placeholder="Opponent Score" value={formData.opponent_score || ''} onChange={(e) => setFormData({...formData, opponent_score: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input type="date" placeholder="Match Date" value={formData.match_date || ''} onChange={(e) => setFormData({...formData, match_date: e.target.value})} className="px-4 py-2 border rounded-lg" required />
                  <input type="time" placeholder="Match Time" value={formData.match_time || ''} onChange={(e) => setFormData({...formData, match_time: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <input placeholder="Location" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} className="px-4 py-2 border rounded-lg" />
                  <select value={formData.result || ''} onChange={(e) => setFormData({...formData, result: e.target.value})} className="px-4 py-2 border rounded-lg" required>
                    <option value="">Select Result</option>
                    <option value="win">Win</option>
                    <option value="loss">Loss</option>
                    <option value="draw">Draw</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Save size={18} />
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2">
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeTab === 'teams' && teams.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 font-bold">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.sport_type} • {item.icon}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'coaches' && coaches.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 font-bold">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.role} • {item.experience_years} years</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'players' && players.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 font-bold">#{item.jersey_number} {item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.position} • {item.class}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'achievements' && achievements.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 font-bold">{item.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.competition_name} • {item.position}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'matches' && matches.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 font-bold">vs {item.opponent}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.our_score}-{item.opponent_score} • {item.result}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default SportsTeamsManagement;
