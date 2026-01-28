import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaUsers, FaCalendar, FaMapMarkerAlt, FaClock, FaBus, FaChevronRight } from 'react-icons/fa';

interface SportsPageProps {
  onNavigate: (page: string) => void;
}

const SportsPage: React.FC<SportsPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teams' | 'about' | 'facilities'>('teams');

  useEffect(() => {
    fetch('http://localhost:5000/api/sports/teams')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTeams(data.teams);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const facilitiesData = [
    {
      name: 'Stade Ngoma',
      nameEn: 'Ngoma Stadium',
      description: 'Stade Ngoma ni stade nkuru y\'umujyi wa Ngoma. Ikipe yacu ikina hano imikino mikuru. Stade ifite ubushobozi bwo kwakira abantu 5,000 kandi ifite ikirambi cyiza cy\'ibyatsi.',
      distance: '2.5 km kuva ku ishuri',
      transport: 'Bus y\'ishuri',
      schedule: 'Kuwa mbere, Kuwa gatatu, Kuwa gatanu (4:00 PM - 6:00 PM)'
    },
    {
      name: 'Ikirambi cy\'Ishuri',
      nameEn: 'School Ground',
      description: 'Ikirambi cy\'ishuri ni aho dukora imyitozo ya buri munsi. Abanyeshuri bose bashobora gukina hano nyuma y\'amasomo.',
      distance: 'Mu ishuri',
      transport: 'Ntago bikenewe',
      schedule: 'Buri munsi (3:30 PM - 5:30 PM)'
    },
    {
      name: 'Salle Polyvalente',
      nameEn: 'Multi-purpose Hall',
      description: 'Salle Polyvalente ni aho dukina volleyball na basketball. Ifite ubushobozi bwo kwakira abantu 1,000.',
      distance: '1.8 km kuva ku ishuri',
      transport: 'Twagenda n\'amaguru',
      schedule: 'Kuwa kabiri, Kuwa kane (4:00 PM - 6:00 PM)'
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-yellow-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">SIPORO</h1>
          <p className="text-xl">Amakipe ya Siporo ya Garden TVET School</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 py-4">
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'teams' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Amakipe
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'about' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Ibyanyu
            </button>
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'facilities' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Aho Tukina
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {activeTab === 'teams' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <motion.div
                key={team.id}
                whileHover={{ y: -5 }}
                onClick={() => onNavigate(`sport-team/${team.id}`)}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
              >
                <div className="relative h-48">
                  <img
                    src={team.image_url}
                    alt={team.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                    <p className="text-white/90">{team.name_en}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{team.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaUsers />
                      <span>{team.total_players} Abakinnyi</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaTrophy />
                      <span>{team.total_achievements} Ibihembo</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                    Reba Byose <FaChevronRight />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Umupira w'Amaguru muri Garden TVET</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Umupira w'amaguru ni kimwe mu mikino ikomeye kandi ikunzwe cyane muri Garden TVET School. Ikipe yacu yatangiye mu 2015 kandi yagize intsinzi nyinshi mu marushanwa atandukanye.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Abakinnyi bacu barangwa n'ubushobozi bukomeye, ubwitange budasanzwe, n'urukundo rukabije rw'umukino. Dukina mu Stade Ngoma, stade nkuru y'umujyi wa Ngoma.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Ishuri ryacu rifite amateka meza yo guteza imbere abakinnyi kandi tugakomeza gukora ibishoboka byose kugira ngo abanyeshuri bacu bagere ku ntera ndende.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="space-y-6">
            {facilitiesData.map((facility, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{facility.name}</h3>
                <p className="text-gray-600 mb-4">{facility.nameEn}</p>
                <p className="text-gray-700 mb-6">{facility.description}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaMapMarkerAlt className="text-green-600" />
                    <span>{facility.distance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaBus className="text-green-600" />
                    <span>{facility.transport}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaClock className="text-green-600" />
                    <span>{facility.schedule}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SportsPage;
