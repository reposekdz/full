import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Award, Clock, Star, MessageCircle, User } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';

interface Teacher {
  id: number;
  name: string;
  name_rw?: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  image_url: string;
  photo_url?: string;
}

interface TradeTeachersProps {
  tradeId: number;
  gradientColors: string;
}

export const TradeTeachers: React.FC<TradeTeachersProps> = ({ tradeId, gradientColors }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/trades/${tradeId}/instructors`);
        const data = await response.json();
        
        if (data.success && data.instructors) {
          setTeachers(data.instructors);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tradeId) {
      fetchTeachers();
    }
  }, [tradeId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Iratunganya amakuru y'abarimu...</p>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Nta barimu bahari</p>
        <p className="text-sm text-gray-500 mt-1">Abarimu bazongera hano vuba</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teachers.map((teacher, index) => (
        <motion.div
          key={teacher.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -8 }}
        >
          <Card className="bg-gradient-to-br from-white via-green-50 to-yellow-50 border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all overflow-hidden">
            <CardContent className="p-6">
              {/* Teacher Header */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={`http://localhost:5000${teacher.image_url || teacher.photo_url}`} 
                    alt={teacher.name}
                  />
                  <AvatarFallback className={`text-xl font-bold bg-gradient-to-r ${gradientColors} text-white`}>
                    {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-gray-800 truncate">{teacher.name}</h4>
                  {teacher.name_rw && (
                    <p className="text-sm text-gray-600 truncate">{teacher.name_rw}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-700">4.8</span>
                  </div>
                </div>
              </div>

              {/* Qualification Badge */}
              <div className="mb-4">
                <Badge className={`bg-gradient-to-r ${gradientColors} text-white border-0`}>
                  <Award className="w-3 h-3 mr-1" />
                  {teacher.qualification}
                </Badge>
              </div>

              {/* Teacher Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Uburambe: {teacher.experience_years}+ imyaka</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="truncate">{teacher.specialization}</span>
                </div>

                {teacher.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Mail className="w-4 h-4 text-purple-600" />
                    </div>
                    <a 
                      href={`mailto:${teacher.email}`}
                      className="truncate hover:text-purple-600 transition-colors"
                    >
                      {teacher.email}
                    </a>
                  </div>
                )}

                {teacher.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <a 
                      href={`tel:${teacher.phone}`}
                      className="hover:text-orange-600 transition-colors"
                    >
                      {teacher.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Contact Button */}
              <Button 
                className={`w-full bg-gradient-to-r ${gradientColors} hover:opacity-90 transition-opacity`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Vugana n'Umwarimu
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
