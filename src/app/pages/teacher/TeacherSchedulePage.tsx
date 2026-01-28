import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, Clock, MapPin, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import apiService from '@/app/services/apiService';

interface TeacherSchedulePageProps {
  onNavigate: (page: string) => void;
}

const TeacherSchedulePage: React.FC<TeacherSchedulePageProps> = ({ onNavigate }) => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTeacherUpcomingLessons();
      if (res.success) {
        setLessons(res.lessons || []);
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Array starts with Monday (Index 0)
  const daysOfWeek = [
    'Ku wa mbere', 
    'Ku wa kabiri', 
    'Ku wa gatatu', 
    'Ku wa kane', 
    'Ku wa gatanu', 
    'Ku wa gatandatu', 
    'Ku cyumweru'
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="schedule" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
            Gahunda Yanjye
          </h1>
          <Button onClick={fetchSchedule} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Kuvugurura
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-yellow-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {daysOfWeek.map((day, dayIndex) => {
              /**
               * FIX: JS getDay() returns 0 for Sunday, 1 for Monday, etc.
               * Since our array starts at Index 0 (Monday), we shift the value:
               * (1 + 6) % 7 = 0 (Monday)
               * (0 + 6) % 7 = 6 (Sunday)
               */
              const dayLessons = lessons.filter(l => {
                const date = new Date(l.date);
                const jsDay = date.getDay(); 
                const adjustedDayIndex = (jsDay + 6) % 7;
                return adjustedDayIndex === dayIndex;
              });

              return (
                <Card key={dayIndex} className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-800">
                      <Calendar className="h-5 w-5 mr-2 text-yellow-600" />
                      {day}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dayLessons.length > 0 ? (
                      <div className="space-y-3">
                        {dayLessons.map((lesson, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 bg-white/50 hover:border-yellow-300 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                    {lesson.class}
                                  </Badge>
                                  <Badge variant="outline" className="border-green-200 text-green-700">
                                    {lesson.subject}
                                  </Badge>
                                </div>
                                <h4 className="font-bold text-gray-900">{lesson.topic}</h4>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-yellow-600" />
                                    {lesson.time} ({lesson.duration})
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1 text-yellow-600" />
                                    {lesson.room}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1 text-yellow-600" />
                                    {lesson.students || 0} Abanyeshuri
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 py-4 italic">
                        Nta masomo ari kuri uyu munsi
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSchedulePage;