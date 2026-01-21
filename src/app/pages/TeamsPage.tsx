import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Users, BookOpen, Briefcase, Trophy, Wrench, Mail, Phone, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import teamsService, { Team } from '@/app/services/teamsService';

interface TeamsPageProps {
  onNavigate: (page: string) => void;
}

const TeamsPage: React.FC<TeamsPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamsData = await teamsService.getAllTeams();
      setTeams(teamsData);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getTeamIcon = (teamName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'Academic Team': BookOpen,
      'Administration Team': Briefcase,
      'Discipline Team': Users,
      'Sports Team': Trophy,
      'Finance Team': Briefcase,
      'IT Team': Wrench,
      'Maintenance Team': Wrench,
    };
    return iconMap[teamName] || Users;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Teams</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTeams}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-gradient-to-r from-yellow-500 to-green-500 p-4 rounded-full mb-4 shadow-lg">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-4">
            Management Teams
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Meet our dedicated teams working together to provide excellence in education and school management
          </p>
        </motion.div>

        {teams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teams Found</h3>
            <p className="text-gray-600">Teams will be displayed here once they are added by administrators.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team, index) => {
              const TeamIcon = getTeamIcon(team.name);
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-2xl h-full">
                    <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-r ${team.color_gradient || 'from-blue-500 to-purple-500'}`}>
                      <div className="absolute top-4 right-4 text-7xl opacity-20">
                        {team.avatar_emoji || '👥'}
                      </div>
                    </div>

                    <CardContent className="pt-20 pb-6 px-6 relative">
                      <div className="flex justify-center -mt-8 mb-4">
                        <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-4xl border-4 border-white overflow-hidden">
                          {team.image_url ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${team.image_url}`}
                              alt={team.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = team.avatar_emoji || '👥';
                                  parent.classList.add('text-4xl', 'flex', 'items-center', 'justify-center');
                                }
                              }}
                            />
                          ) : (
                            team.avatar_emoji || '👥'
                          )}
                        </div>
                      </div>

                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-black text-gray-900 mb-1">{team.name}</h3>
                        <p className="text-sm text-gray-600 font-medium">{team.role}</p>
                      </div>

                      {team.description && (
                        <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg p-4 mb-4">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {team.description}
                          </p>
                        </div>
                      )}

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between py-2 border-b border-yellow-100">
                          <span className="text-sm font-semibold text-gray-600">Team Head:</span>
                          <span className="text-sm text-gray-900 font-bold">{team.head_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-600">Team Size:</span>
                          <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                            {team.team_size} members
                          </Badge>
                        </div>
                      </div>

                      {team.responsibilities && team.responsibilities.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Key Responsibilities</h4>
                          <div className="flex flex-wrap gap-2">
                            {team.responsibilities.map((resp, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs border-yellow-300 text-yellow-700 bg-yellow-50"
                              >
                                {resp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 pt-4 border-t border-yellow-100">
                        {team.head_email && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Mail className="w-3 h-3 mr-2 text-yellow-600" />
                            <span>{team.head_email}</span>
                          </div>
                        )}
                        {team.head_phone && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="w-3 h-3 mr-2 text-yellow-600" />
                            <span>{team.head_phone}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-yellow-500 to-green-500 border-0 shadow-xl">
            <CardContent className="py-8 px-6">
              <h3 className="text-2xl font-black text-white mb-2">Work With Us</h3>
              <p className="text-white/90 mb-4">
                Interested in joining our teams? We're always looking for passionate individuals.
              </p>
              <button
                onClick={() => onNavigate('contactUs')}
                className="bg-white text-yellow-700 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-all shadow-lg"
              >
                Contact Us
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamsPage;
