import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users, Bell, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import apiService from '@/app/services/apiService';

export default function ParentEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'academic': return { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Amasomo' };
      case 'sports': return { color: 'bg-green-100 text-green-700 border-green-300', label: 'Siporo' };
      case 'cultural': return { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Umuco' };
      case 'meeting': return { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Inama' };
      default: return { color: 'bg-gray-100 text-gray-700 border-gray-300', label: type || 'Ikindi' };
    }
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

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
            Ibirori n'Ibikorwa
          </h1>
          <p className="text-gray-600">Ibirori n'ibikorwa by'ishuri</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-2 border-purple-200">
            <Filter className="w-4 h-4 mr-2" />
            Shyiramo Akayunguruzo
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <Bell className="w-4 h-4 mr-2" />
            Hamagara Ibihembo
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto text-purple-600 mb-2" />
            <p className="text-3xl font-black text-purple-900">{events.length}</p>
            <p className="text-sm text-gray-600">Ibirori Byose</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 mx-auto text-blue-600 mb-2" />
            <p className="text-3xl font-black text-blue-900">{upcomingEvents.length}</p>
            <p className="text-sm text-gray-600">Bizaza</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto text-green-600 mb-2" />
            <p className="text-3xl font-black text-green-900">{events.filter(e => e.participants > 0).length}</p>
            <p className="text-sm text-gray-600">Nitabiye</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-yellow-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto text-yellow-600 mb-2" />
            <p className="text-3xl font-black text-yellow-900">{pastEvents.length}</p>
            <p className="text-sm text-gray-600">Byarangiye</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-white border-2 border-purple-100 rounded-2xl shadow-lg">
          <TabsTrigger value="upcoming" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Ibirori Bizaza ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Byarangiye ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingEvents.length === 0 ? (
            <Card className="border-2 border-purple-100 shadow-xl">
              <CardContent className="p-12 text-center">
                <Calendar className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">Nta birori bizaza</h3>
                <p className="text-gray-500">Ntamurimo uzaza uhari kuri ubu</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => {
                const eventTypeInfo = getEventType(event.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-2 border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <div className="h-40 bg-gradient-to-br from-purple-600 to-blue-600 rounded-t-xl flex items-center justify-center">
                        <div className="text-center text-white">
                          <p className="text-5xl font-black">{new Date(event.date).getDate()}</p>
                          <p className="text-xl">{new Date(event.date).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-black text-gray-900">{event.title}</h3>
                          <Badge className={`border-2 ${eventTypeInfo.color}`}>{eventTypeInfo.label}</Badge>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{event.time || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location || 'Garden TVET School'}</span>
                          </div>
                          {event.participants > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{event.participants} Nitabiye</span>
                            </div>
                          )}
                        </div>
                        <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                          Emeza Kwitabira
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastEvents.length === 0 ? (
            <Card className="border-2 border-purple-100 shadow-xl">
              <CardContent className="p-12 text-center">
                <Calendar className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">Nta birori byarangiye</h3>
                <p className="text-gray-500">Ntamurimo warangiye uhari</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event, index) => {
                const eventTypeInfo = getEventType(event.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-700">
                            <p className="text-2xl font-black">{new Date(event.date).getDate()}</p>
                            <p className="text-xs">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</p>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-black text-gray-900">{event.title}</h3>
                              <Badge className={`border-2 ${eventTypeInfo.color}`}>{eventTypeInfo.label}</Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-1">{event.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location || 'Garden TVET'}
                              </span>
                              {event.participants > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {event.participants} Nitabiye
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
