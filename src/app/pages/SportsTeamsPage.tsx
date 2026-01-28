import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaUsers, FaTrophy, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';

interface SportsTeamsPageProps {
  teamId: string;
  onNavigate: (page: string) => void;
}

const SportsTeamsPage: React.FC<SportsTeamsPageProps> = ({ teamId, onNavigate }) => {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'achievements'>('overview');

  useEffect(() => {
    fetch(`http://localhost:5000/api/sports/teams/${teamId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const t = data.team;
          if (typeof t.players === 'string') t.players = JSON.parse(t.players);
          if (typeof t.achievements === 'string') t.achievements = JSON.parse(t.achievements);
          setTeam(t);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Urasubira...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ikipe Ntiyabonetse</h2>
          <button
            onClick={() => onNavigate('sports')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Subira ku Makipe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => onNavigate('sports')}
            className="flex items-center gap-2 text-white hover:text-white/80 transition mb-6"
          >
            <FaArrowLeft /> Subira
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-white/20">
              <img
                src={team.image_url}
                alt={team.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
              <p className="text-xl text-white/90 mb-4">{team.name_en}</p>
              
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaUsers />
                    <span>{team.total_players} Abakinnyi</span>
                  </div>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaTrophy />
                    <span>{team.total_achievements} Ibihembo</span>
                  </div>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCalendar />
                    <span>Yatangiye 2015</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 py-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'overview' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Ibyanyu
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'players' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Abakinnyi
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'achievements' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Ibihembo
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ibyanyu {team.name}</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {team.description || team.description_rw || 'Nta makuru ahari.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(team.players || []).map((player: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <FaUsers className="text-green-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{player.name}</h3>
                    <p className="text-gray-600">{player.position}</p>
                  </div>
                </div>
                {player.number && (
                  <div className="text-gray-700">
                    <span className="font-semibold">Numero:</span> {player.number}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {(team.achievements || []).map((achievement: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaTrophy className="text-yellow-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{achievement.title || achievement}</h3>
                  {achievement.year && (
                    <p className="text-gray-600">{achievement.year}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SportsTeamsPage;
