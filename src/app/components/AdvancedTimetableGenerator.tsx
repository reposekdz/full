import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Users, BookOpen, MapPin, 
  Plus, Save, Download, RefreshCw, Settings,
  ChevronLeft, ChevronRight, Grid, List,
  Filter, Search, Edit, Trash2, Copy
} from 'lucide-react';

interface Course {
  id: number;
  name: string;
  code: string;
  trade_code: string;
  level: number;
  hours_per_week: number;
  instructor_id?: number;
  instructor_name?: string;
}

interface Instructor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialization: string;
  available_hours: number;
}

interface TimeSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  course_id?: number;
  course_name?: string;
  instructor_id?: number;
  instructor_name?: string;
  room?: string;
  trade_code?: string;
  level?: number;
  level_suffix?: string;
}

interface TimetableData {
  [key: string]: TimeSlot[];
}

const AdvancedTimetableGenerator: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('SOD');
  const [selectedLevel, setSelectedLevel] = useState('1');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  // Time slots configuration
  const timeSlots = [
    { start: '08:00', end: '09:30', label: '8:00 - 9:30 AM' },
    { start: '09:45', end: '11:15', label: '9:45 - 11:15 AM' },
    { start: '11:30', end: '13:00', label: '11:30 AM - 1:00 PM' },
    { start: '14:00', end: '15:30', label: '2:00 - 3:30 PM' },
    { start: '15:45', end: '17:15', label: '3:45 - 5:15 PM' }
  ];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const trades = [
    { code: 'SOD', name: 'Software Development' },
    { code: 'BDC', name: 'Building Construction' },
    { code: 'AUT', name: 'Automobile Technology' }
  ];
  
  const levels = [
    { id: '1', name: 'Level 1' },
    { id: '2', name: 'Level 2' },
    { id: '3', name: 'Level 3' },
    { id: '4A', name: 'Level 4A' },
    { id: '4B', name: 'Level 4B' },
    { id: '5A', name: 'Level 5A' },
    { id: '5B', name: 'Level 5B' }
  ];

  // Fetch courses based on trade and level
  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/timetable/courses?trade=${selectedTrade}&level=${selectedLevel}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback data
      setCourses([
        { id: 1, name: 'Programming Fundamentals', code: 'SOD101', trade_code: 'SOD', level: 1, hours_per_week: 4 },
        { id: 2, name: 'Database Systems', code: 'SOD102', trade_code: 'SOD', level: 1, hours_per_week: 3 },
        { id: 3, name: 'Web Development', code: 'SOD103', trade_code: 'SOD', level: 1, hours_per_week: 4 },
        { id: 4, name: 'Mathematics', code: 'GEN101', trade_code: 'SOD', level: 1, hours_per_week: 3 },
        { id: 5, name: 'English', code: 'GEN102', trade_code: 'SOD', level: 1, hours_per_week: 2 }
      ]);
    }
  };

  // Fetch instructors
  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/timetable/instructors', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInstructors(data.instructors || []);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      // Fallback data
      setInstructors([
        { id: 1, first_name: 'Jean', last_name: 'Mukamana', email: 'jean@garden.rw', specialization: 'Programming', available_hours: 20 },
        { id: 2, first_name: 'Marie', last_name: 'Uwimana', email: 'marie@garden.rw', specialization: 'Database', available_hours: 18 },
        { id: 3, first_name: 'Paul', last_name: 'Nzeyimana', email: 'paul@garden.rw', specialization: 'Web Development', available_hours: 22 },
        { id: 4, first_name: 'Grace', last_name: 'Ingabire', email: 'grace@garden.rw', specialization: 'Mathematics', available_hours: 16 },
        { id: 5, first_name: 'David', last_name: 'Habimana', email: 'david@garden.rw', specialization: 'English', available_hours: 14 }
      ]);
    }
  };

  // Fetch existing timetable
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/timetable/data/${selectedTrade}/${selectedLevel}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTimetable(data.timetable || {});
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      // Initialize empty timetable
      const emptyTimetable: TimetableData = {};
      days.forEach(day => {
        emptyTimetable[day] = timeSlots.map(slot => ({
          id: `${day}-${slot.start}`,
          day,
          start_time: slot.start,
          end_time: slot.end
        }));
      });
      setTimetable(emptyTimetable);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate timetable using AI algorithm
  const generateTimetable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/timetable/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          trade_code: selectedTrade,
          level: selectedLevel,
          courses,
          instructors
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTimetable(data.timetable);
      } else {
        // Fallback: Simple algorithm
        generateSimpleTimetable();
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      generateSimpleTimetable();
    } finally {
      setLoading(false);
    }
  };

  // Simple timetable generation algorithm
  const generateSimpleTimetable = () => {
    const newTimetable: TimetableData = {};
    let courseIndex = 0;
    let instructorIndex = 0;
    
    days.forEach(day => {
      newTimetable[day] = timeSlots.map(slot => {
        const course = courses[courseIndex % courses.length];
        const instructor = instructors[instructorIndex % instructors.length];
        
        courseIndex++;
        instructorIndex++;
        
        return {
          id: `${day}-${slot.start}`,
          day,
          start_time: slot.start,
          end_time: slot.end,
          course_id: course?.id,
          course_name: course?.name,
          instructor_id: instructor?.id,
          instructor_name: `${instructor?.first_name} ${instructor?.last_name}`,
          room: `Room ${Math.floor(Math.random() * 10) + 1}`,
          trade_code: selectedTrade,
          level: parseInt(selectedLevel)
        };
      });
    });
    
    setTimetable(newTimetable);
  };

  // Save timetable
  const saveTimetable = async () => {
    try {
      const response = await fetch('/api/timetable/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          trade_code: selectedTrade,
          level: selectedLevel,
          timetable
        })
      });
      
      if (response.ok) {
        alert('Gahunda yabitswe neza!');
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      alert('Habaye ikosa mu kubika gahunda');
    }
  };

  // Update time slot
  const updateTimeSlot = (day: string, slotId: string, updates: Partial<TimeSlot>) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day]?.map(slot => 
        slot.id === slotId ? { ...slot, ...updates } : slot
      ) || []
    }));
  };

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, [selectedTrade, selectedLevel]);

  useEffect(() => {
    fetchTimetable();
  }, [selectedTrade, selectedLevel]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Gahunda y'Amasomo
            </h1>
            <p className="text-gray-600">Kora gahunda y'amasomo ikurikije amashuri n'amahugurwa</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateTimetable}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold shadow-lg disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Kora Gahunda
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveTimetable}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg"
            >
              <Save className="w-5 h-5" />
              Bika Gahunda
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold shadow-lg"
            >
              <Download className="w-5 h-5" />
              Kuramo PDF
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Trade and Level Selection */}
          <div className="flex gap-4">
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              {trades.map(trade => (
                <option key={trade.code} value={trade.code}>{trade.name}</option>
              ))}
            </select>
            
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'week' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
              Icyumweru
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'day' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Umunsi
            </button>
          </div>
          
          {/* Day Navigation (for day view) */}
          {viewMode === 'day' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const currentIndex = days.indexOf(selectedDay);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : days.length - 1;
                  setSelectedDay(days[prevIndex]);
                }}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  const currentIndex = days.indexOf(selectedDay);
                  const nextIndex = currentIndex < days.length - 1 ? currentIndex + 1 : 0;
                  setSelectedDay(days[nextIndex]);
                }}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Timetable Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg text-gray-600">Birategurika...</span>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden"
        >
          {viewMode === 'week' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Igihe</th>
                    {days.map(day => (
                      <th key={day} className="px-4 py-3 text-center font-semibold min-w-[180px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIndex) => (
                    <tr key={slot.start} className={slotIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 font-semibold text-gray-700 border-r-2 border-gray-200">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {slot.label}
                        </div>
                      </td>
                      {days.map(day => {
                        const daySlot = timetable[day]?.find(s => s.start_time === slot.start);
                        return (
                          <td key={`${day}-${slot.start}`} className="px-2 py-2 border-r border-gray-200">
                            <TimetableSlot
                              slot={daySlot}
                              courses={courses}
                              instructors={instructors}
                              onUpdate={(updates) => updateTimeSlot(day, daySlot?.id || '', updates)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                {selectedDay} - {selectedTrade} Level {selectedLevel}
              </h3>
              <div className="space-y-4">
                {timeSlots.map(slot => {
                  const daySlot = timetable[selectedDay]?.find(s => s.start_time === slot.start);
                  return (
                    <div key={slot.start} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-32 text-sm font-semibold text-gray-700">
                        {slot.label}
                      </div>
                      <div className="flex-1">
                        <TimetableSlot
                          slot={daySlot}
                          courses={courses}
                          instructors={instructors}
                          onUpdate={(updates) => updateTimeSlot(selectedDay, daySlot?.id || '', updates)}
                          expanded={true}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Timetable Slot Component
const TimetableSlot: React.FC<{
  slot?: TimeSlot;
  courses: Course[];
  instructors: Instructor[];
  onUpdate: (updates: Partial<TimeSlot>) => void;
  expanded?: boolean;
}> = ({ slot, courses, instructors, onUpdate, expanded = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  if (!slot) return <div className="h-16 bg-gray-100 rounded border-2 border-dashed border-gray-300"></div>;
  
  if (isEditing) {
    return (
      <div className={`${expanded ? 'p-4' : 'p-2'} bg-blue-50 border-2 border-blue-300 rounded-lg`}>
        <div className="space-y-2">
          <select
            value={slot.course_id || ''}
            onChange={(e) => {
              const course = courses.find(c => c.id === parseInt(e.target.value));
              onUpdate({
                course_id: course?.id,
                course_name: course?.name
              });
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
          >
            <option value="">Hitamo Isomo</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
          
          <select
            value={slot.instructor_id || ''}
            onChange={(e) => {
              const instructor = instructors.find(i => i.id === parseInt(e.target.value));
              onUpdate({
                instructor_id: instructor?.id,
                instructor_name: `${instructor?.first_name} ${instructor?.last_name}`
              });
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
          >
            <option value="">Hitamo Umwarimu</option>
            {instructors.map(instructor => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.first_name} {instructor.last_name}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Icyumba"
            value={slot.room || ''}
            onChange={(e) => onUpdate({ room: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
          />
          
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-all"
            >
              <Save className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!slot.course_name) {
    return (
      <div 
        onClick={() => setIsEditing(true)}
        className={`${expanded ? 'h-20 p-4' : 'h-16 p-2'} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center`}
      >
        <Plus className="w-4 h-4 text-gray-400" />
      </div>
    );
  }
  
  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`${expanded ? 'p-4' : 'p-2'} bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md`}
    >
      <div className={`${expanded ? 'space-y-2' : 'space-y-1'}`}>
        <h4 className={`${expanded ? 'text-sm' : 'text-xs'} font-bold truncate`}>
          {slot.course_name}
        </h4>
        {slot.instructor_name && (
          <p className={`${expanded ? 'text-xs' : 'text-[10px]'} opacity-90 truncate flex items-center gap-1`}>
            <Users className="w-3 h-3" />
            {slot.instructor_name}
          </p>
        )}
        {slot.room && (
          <p className={`${expanded ? 'text-xs' : 'text-[10px]'} opacity-90 truncate flex items-center gap-1`}>
            <MapPin className="w-3 h-3" />
            {slot.room}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdvancedTimetableGenerator;