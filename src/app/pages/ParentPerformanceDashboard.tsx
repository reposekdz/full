import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, Target, FileText, CheckCircle, Clock, BarChart3, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface ParentPerformanceDashboardProps {
  studentId: number;
}

const ParentPerformanceDashboard: React.FC<ParentPerformanceDashboardProps> = ({ studentId }) => {
  const [performance, setPerformance] = useState<any>(null);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/assignments/analytics/student/${studentId}`);
      const data = await response.json();
      setPerformance(data.performance?.[0] || null);
      setRecentGrades(data.recentGrades || []);
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Ibikorwa Byose', value: performance?.total_assignments || 0, icon: FileText, color: 'from-blue-600 to-indigo-600' },
    { label: 'Byakozwe', value: performance?.completed_assignments || 0, icon: CheckCircle, color: 'from-green-600 to-emerald-600' },
    { label: 'Ikigereranyo', value: `${performance?.average_percentage?.toFixed(1) || 0}%`, icon: TrendingUp, color: 'from-purple-600 to-pink-600' },
    { label: 'Amanota Yose', value: performance?.total_marks_obtained?.toFixed(0) || 0, icon: Award, color: 'from-yellow-600 to-orange-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Imikorere y'Umwana</h1>
          <p className="text-lg text-gray-600 font-semibold">Academic Performance Dashboard</p>
        </motion.div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
              <Card className="border-2 border-gray-100 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1 text-center">{stat.value}</p>
                  <p className="text-sm font-bold text-gray-600 text-center">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Performance Summary */}
        {performance && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Incamake y'Imikorere</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <span className="text-5xl font-black text-white">{performance.average_percentage?.toFixed(0) || 0}%</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">Ikigereranyo Rusange</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <span className="text-5xl font-black text-white">{performance.completed_assignments || 0}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">Ibikorwa Byakozwe</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <span className="text-5xl font-black text-white">{performance.total_marks_obtained?.toFixed(0) || 0}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">Amanota Yose</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Grades */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-2 border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Amanota Yaheruka</h2>
              {recentGrades.length > 0 ? (
                <div className="space-y-4">
                  {recentGrades.map((grade, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                      <div className={`p-6 rounded-xl border-2 ${grade.percentage >= 70 ? 'bg-green-50 border-green-200' : grade.percentage >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-gray-900 mb-1">{grade.assignment_title}</h3>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">{grade.type}</Badge>
                              <span className="text-sm text-gray-600">{new Date(grade.graded_at).toLocaleDateString('rw-RW')}</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-4xl font-black text-gray-900 mb-2">{grade.percentage.toFixed(1)}%</p>
                            <Badge className={`${grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-600' : grade.grade === 'F' ? 'bg-red-600' : 'bg-yellow-600'} text-white text-xl px-4 py-2`}>
                              {grade.grade}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-gray-700">Amanota: {grade.marks_obtained}/{grade.total_marks}</span>
                        </div>
                        {grade.feedback && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-semibold text-gray-600 mb-1">Icyiyumviro cy'Umwarimu:</p>
                            <p className="text-gray-700">{grade.feedback}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">Nta manota ahari</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Insights */}
        {performance && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-4">Ibyiyumviro</h2>
                <div className="space-y-3">
                  {performance.average_percentage >= 80 && (
                    <div className="flex items-start space-x-3 bg-green-100 border-2 border-green-300 rounded-xl p-4">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-green-900">Imikorere Myiza Cyane!</p>
                        <p className="text-sm text-green-800">Umwana wawe afite imikorere myiza. Komeza kumushishikariza!</p>
                      </div>
                    </div>
                  )}
                  {performance.average_percentage >= 50 && performance.average_percentage < 80 && (
                    <div className="flex items-start space-x-3 bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4">
                      <Target className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-yellow-900">Imikorere Myiza</p>
                        <p className="text-sm text-yellow-800">Umwana wawe afite imikorere myiza. Mushishikarize kugira ngo yiyongere.</p>
                      </div>
                    </div>
                  )}
                  {performance.average_percentage < 50 && (
                    <div className="flex items-start space-x-3 bg-red-100 border-2 border-red-300 rounded-xl p-4">
                      <Clock className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-red-900">Akenera Ubufasha</p>
                        <p className="text-sm text-red-800">Umwana wawe akenera ubufasha bw'inyongera. Vugana n'abarimu kugira ngo mumuhe inkunga.</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3 bg-blue-100 border-2 border-blue-300 rounded-xl p-4">
                    <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-blue-900">Igipimo cy'Imikorere</p>
                      <p className="text-sm text-blue-800">
                        Umwana wawe yakoze {performance.completed_assignments} mu bikorwa {performance.total_assignments} byasabwe.
                        Igipimo: {((performance.completed_assignments / performance.total_assignments) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ParentPerformanceDashboard;
