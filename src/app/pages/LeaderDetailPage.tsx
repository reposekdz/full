import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, MapPin, Award, Briefcase, GraduationCap, Building2, Shield, Star, CheckCircle, Target, TrendingUp, Users, Calendar, Clock, Heart, Zap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface LeaderDetailPageProps {
  leaderId: string;
  onNavigate: (page: string) => void;
}

const LeaderDetailPage: React.FC<LeaderDetailPageProps> = ({ leaderId, onNavigate }) => {
  const [leader, setLeader] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/leadership/leaders/${leaderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const parsedLeader = {
            ...data.leader,
            responsibilities: typeof data.leader.responsibilities === 'string' 
              ? JSON.parse(data.leader.responsibilities) 
              : data.leader.responsibilities || [],
            qualifications: typeof data.leader.qualifications === 'string' 
              ? JSON.parse(data.leader.qualifications) 
              : data.leader.qualifications || []
          };
          setLeader(parsedLeader);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [leaderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Gutegura amakuru...</p>
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Nta makuru abonetse</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      {/* Hero Section with Image */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-yellow-500">
          {leader.image_url && (
            <img
              src={leader.image_url.startsWith('/uploads') ? `http://localhost:5000${leader.image_url}` : leader.image_url}
              alt={leader.name}
              className="w-full h-full object-cover opacity-30"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-8">
          <Button onClick={() => onNavigate('leadership')} variant="ghost" className="text-white hover:bg-white/20 w-fit">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Subira ku Buyobozi
          </Button>
          
          <div className="text-white">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg">
              {leader.name}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl md:text-3xl font-bold mb-4 text-yellow-300">
              {leader.role}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              <span className="text-xl font-semibold">{leader.department}</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl shadow-xl p-8">
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-green-400 shadow-2xl">
                {leader.image_url ? (
                  <img
                    src={leader.image_url.startsWith('/uploads') ? `http://localhost:5000${leader.image_url}` : leader.image_url}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center">
                    <Users className="w-24 h-24 text-white" />
                  </div>
                )}
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 mb-2">{leader.name}</h3>
                <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                  {leader.role}
                </p>
              </div>

              <div className="space-y-4">
                {leader.email && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <Mail className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Email</p>
                      <a href={`mailto:${leader.email}`} className="text-sm font-bold text-green-700 hover:text-green-800">
                        {leader.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {leader.phone && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                    <Phone className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Telefoni</p>
                      <a href={`tel:${leader.phone}`} className="text-sm font-bold text-yellow-700 hover:text-yellow-800">
                        {leader.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {leader.office_location && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Biro</p>
                      <p className="text-sm font-bold text-green-700">{leader.office_location}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-500 to-yellow-500 rounded-3xl shadow-xl p-6 text-white">
              <h4 className="text-xl font-black mb-4">Imibare</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Inshingano</span>
                  <span className="text-2xl font-black">{leader.responsibilities?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Impamyabumenyi</span>
                  <span className="text-2xl font-black">{leader.qualifications?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Uburambe</span>
                  <span className="text-2xl font-black">15+ yrs</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Award className="w-8 h-8 text-green-600" />
                Amateka n'Uburambe
              </h3>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">{leader.bio}</p>
              </div>
            </motion.div>

            {/* Responsibilities */}
            {leader.responsibilities && leader.responsibilities.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-yellow-600" />
                  Inshingano n'Imirimo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leader.responsibilities.map((resp: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl border-l-4 border-green-500"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 font-semibold">{resp}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Qualifications */}
            {leader.qualifications && leader.qualifications.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-green-600" />
                  Impamyabumenyi n'Amahugurwa
                </h3>
                <div className="space-y-4">
                  {leader.qualifications.map((qual: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl"
                    >
                      <div className="bg-green-500 rounded-full p-2">
                        <Star className="w-5 h-5 text-white fill-current" />
                      </div>
                      <p className="text-gray-700 font-semibold flex-1">{qual}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Leadership Impact */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-green-100 to-yellow-100 rounded-3xl shadow-xl p-8">
              <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Target className="w-8 h-8 text-green-600" />
                Uruhare mu Ishuri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Users, title: 'Ubuyobozi', desc: 'Kuyobora no guhuza abakozi', color: 'green' },
                  { icon: TrendingUp, title: 'Iterambere', desc: 'Guteza imbere ishuri', color: 'yellow' },
                  { icon: Heart, title: 'Ubufatanye', desc: 'Gufatanya n\'abandi', color: 'green' }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className={`bg-white rounded-xl p-6 text-center shadow-lg`}>
                      <div className={`bg-${item.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`w-8 h-8 text-${item.color}-600`} />
                      </div>
                      <h4 className="font-black text-lg mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderDetailPage;
