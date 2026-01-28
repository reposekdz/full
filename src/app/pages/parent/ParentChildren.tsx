import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, GraduationCap, Award, Calendar, Phone, Mail, MapPin, Plus, Link as LinkIcon, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import apiService from '@/app/services/apiService';

export default function ParentChildren() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyChildren();
      setChildren(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch children:', err);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Abana Banjye
          </h1>
          <p className="text-gray-600">Abana bawe bohugura muri Garden TVET School</p>
        </div>
        <Button className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Huza Umwana Mushya
        </Button>
      </div>

      {children.length === 0 ? (
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardContent className="p-12 text-center">
            <Users className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Nta mwana uhujwe</h3>
            <p className="text-gray-500 mb-6">Nturafite umwana uhujwe kuri konti yawe</p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <LinkIcon className="w-4 h-4 mr-2" />
              Huza Umwana
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <motion.div
              key={child.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2 border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <div className="h-32 bg-gradient-to-br from-purple-600 to-blue-600 relative">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-purple-600 text-3xl font-black shadow-xl border-4 border-white">
                      {child.name?.charAt(0) || 'S'}
                    </div>
                  </div>
                </div>
                <CardContent className="pt-16 pb-6 px-6 text-center">
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{child.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{child.admission_number}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Isano:</span>
                      <Badge className="bg-purple-100 text-purple-700">{child.relationship || 'Parent'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Urwego:</span>
                      <Badge className="bg-blue-100 text-blue-700">{child.level || 'Year 1'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Umwuga:</span>
                      <Badge className="bg-green-100 text-green-700">{child.trade || 'N/A'}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Amanota</span>
                        <span className="font-bold text-purple-600">{child.average_marks || 0}%</span>
                      </div>
                      <Progress value={child.average_marks || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Kwitabira</span>
                        <span className="font-bold text-green-600">{child.attendance_percentage || 0}%</span>
                      </div>
                      <Progress value={child.attendance_percentage || 0} className="h-2" />
                    </div>
                  </div>

                  <Button 
                    onClick={() => setSelectedChild(child)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white group-hover:from-purple-700 group-hover:to-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Reba Amakuru Yose
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {children.length > 0 && (
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Incamake y'Imikorere
            </CardTitle>
            <CardDescription>Imikorere rusange y'abana bawe</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Users className="w-10 h-10 mx-auto text-blue-600 mb-2" />
                <p className="text-3xl font-black text-blue-900">{children.length}</p>
                <p className="text-sm text-blue-700">Abana Bahujwe</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <Award className="w-10 h-10 mx-auto text-green-600 mb-2" />
                <p className="text-3xl font-black text-green-900">
                  {(children.reduce((sum, child) => sum + (child.average_marks || 0), 0) / children.length || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-green-700">Impera y'Amanota</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <Calendar className="w-10 h-10 mx-auto text-purple-600 mb-2" />
                <p className="text-3xl font-black text-purple-900">
                  {(children.reduce((sum, child) => sum + (child.attendance_percentage || 0), 0) / children.length || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-purple-700">Kwitabira</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                <GraduationCap className="w-10 h-10 mx-auto text-yellow-600 mb-2" />
                <p className="text-3xl font-black text-yellow-900">
                  {children.reduce((sum, child) => sum + (child.total_medals || 0), 0)}
                </p>
                <p className="text-sm text-yellow-700">Ibihembo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
