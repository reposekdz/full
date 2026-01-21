import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, BookOpen, Heart, HelpCircle, Search, Calendar, Clock, User, Phone, Mail, MapPin, ChevronRight, Star } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('library');

  const libraryResources = [
    { id: 'l1', title: 'Ibitabo bya Tekiniki', titleEn: 'Technical Books', count: 1250, available: 980, category: 'Books', color: 'from-blue-500 to-indigo-500' },
    { id: 'l2', title: 'Ibinyamakuru', titleEn: 'Journals', count: 450, available: 420, category: 'Journals', color: 'from-green-500 to-emerald-500' },
    { id: 'l3', title: 'Amakuru ya Elegitoronike', titleEn: 'E-Resources', count: 3500, available: 3500, category: 'Digital', color: 'from-purple-500 to-pink-500' }
  ];

  const counselingServices = [
    { id: 'cs1', name: 'Ubujyanama bw\'Amasomo', nameEn: 'Academic Counseling', counselor: 'Dr. Marie Uwase', available: 'Kuwa mbere - Kuwa gatanu', time: '09:00 - 17:00' },
    { id: 'cs2', name: 'Ubujyanama bw\'Umwuga', nameEn: 'Career Counseling', counselor: 'Mr. Jean Mugisha', available: 'Kuwa kabiri - Kuwa kane', time: '10:00 - 16:00' },
    { id: 'cs3', name: 'Ubujyanama bw\'Ubuzima bwo mu Mutwe', nameEn: 'Mental Health Counseling', counselor: 'Ms. Grace Mukamana', available: 'Kuwa mbere - Kuwa gatanu', time: '08:00 - 18:00' }
  ];

  const healthServices = [
    { id: 'hs1', name: 'Isuzuma Rusange', nameEn: 'General Checkup', doctor: 'Dr. Patrick Habimana', available: 'Buri munsi', time: '08:00 - 17:00' },
    { id: 'hs2', name: 'Ubuvuzi bw\'Ihutirwa', nameEn: 'Emergency Care', doctor: 'Dr. Alice Uwera', available: '24/7', time: 'Igihe cyose' },
    { id: 'hs3', name: 'Imiti', nameEn: 'Pharmacy', doctor: 'Pharmacist Sarah', available: 'Kuwa mbere - Kuwa gatanu', time: '08:00 - 18:00' }
  ];

  const stats = [
    { label: 'Ibitabo', value: '1,250', icon: BookOpen, color: 'from-blue-600 to-indigo-600' },
    { label: 'Abajyanama', value: '3', icon: HelpCircle, color: 'from-green-600 to-emerald-600' },
    { label: 'Abaganga', value: '5', icon: Heart, color: 'from-red-600 to-pink-600' },
    { label: 'Serivisi', value: '9', icon: Briefcase, color: 'from-purple-600 to-indigo-600' }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">
      <AdvancedLeftSidebar currentPage="services" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center shadow-xl">
                <Briefcase className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900">Serivisi</h1>
                <p className="text-lg text-gray-600 font-semibold mt-1">Isomero, Ubujyanama n'Ubuvuzi</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1 text-center">{stat.value}</p>
                  <p className="text-sm font-semibold text-gray-600 text-center">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl border-2 border-green-100 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Search className="w-6 h-6 text-green-600" />
              <h3 className="text-2xl font-black text-gray-900">Shakisha</h3>
            </div>
            <Input placeholder="Shakisha serivisi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-lg border-2 border-green-200" />
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 h-14 bg-white border-2 border-green-200 rounded-2xl p-1">
              <TabsTrigger value="library" className="text-base font-bold rounded-xl">Isomero</TabsTrigger>
              <TabsTrigger value="counseling" className="text-base font-bold rounded-xl">Ubujyanama</TabsTrigger>
              <TabsTrigger value="health" className="text-base font-bold rounded-xl">Ubuvuzi</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {libraryResources.map((resource, index) => (
                  <motion.div key={resource.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                    <Card className={`border-2 border-blue-200 bg-gradient-to-br ${resource.color} text-white overflow-hidden`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-center mb-2">{resource.title}</h3>
                        <p className="text-white/90 text-center font-semibold mb-4">{resource.titleEn}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                            <p className="text-2xl font-black">{resource.count}</p>
                            <p className="text-xs text-white/80 font-semibold">Byose</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                            <p className="text-2xl font-black">{resource.available}</p>
                            <p className="text-xs text-white/80 font-semibold">Bihari</p>
                          </div>
                        </div>
                        <Button className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white font-bold backdrop-blur-sm">
                          Reba Byinshi <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="counseling" className="mt-6">
              <div className="space-y-4">
                {counselingServices.map((service, index) => (
                  <motion.div key={service.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="border-2 border-green-100 hover:border-green-400 hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-gray-600 font-semibold mb-4">{service.nameEn}</p>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <User className="w-4 h-4 text-green-600" />
                                <span className="font-bold">{service.counselor}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-4 h-4 text-green-600" />
                                <span className="font-semibold">{service.available}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="font-semibold">{service.time}</span>
                              </div>
                            </div>
                          </div>
                          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                            Gira Gahunda
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="health" className="mt-6">
              <div className="space-y-4">
                {healthServices.map((service, index) => (
                  <motion.div key={service.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="border-2 border-red-100 hover:border-red-400 hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-gray-600 font-semibold mb-4">{service.nameEn}</p>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <User className="w-4 h-4 text-red-600" />
                                <span className="font-bold">{service.doctor}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-4 h-4 text-red-600" />
                                <span className="font-semibold">{service.available}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-red-600" />
                                <span className="font-semibold">{service.time}</span>
                              </div>
                            </div>
                          </div>
                          <Button className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold">
                            Gira Gahunda
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
