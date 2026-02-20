import React, { useState, useEffect } from 'react';
import { Download, Calendar, Plus, RefreshCw, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const TIME_SLOTS = [
  { start: '07:30', end: '08:10', duration: 40 },
  { start: '08:10', end: '08:50', duration: 40 },
  { start: '08:50', end: '09:30', duration: 40 },
  { start: '09:30', end: '10:10', duration: 40 },
  { start: '10:10', end: '10:25', duration: 15, isBreak: true, label: 'BREAK' },
  { start: '10:25', end: '11:05', duration: 40 },
  { start: '11:05', end: '11:45', duration: 40 },
  { start: '11:45', end: '12:25', duration: 40 },
  { start: '12:25', end: '13:25', duration: 60, isBreak: true, label: 'LUNCH' },
  { start: '13:25', end: '14:05', duration: 40 },
  { start: '14:05', end: '14:45', duration: 40 },
  { start: '14:45', end: '15:25', duration: 40 },
  { start: '15:25', end: '15:40', duration: 15, isBreak: true, label: 'AFTERNOON BREAK' },
  { start: '15:40', end: '16:20', duration: 40 },
  { start: '16:20', end: '17:00', duration: 40 }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TimetableGenerator: React.FC = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [timetable, setTimetable] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allLevelsTimetables, setAllLevelsTimetables] = useState<any>({});
  const [availableLevels, setAvailableLevels] = useState<any[]>([]);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const res = await fetch(`${API_BASE}/trades`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setTrades(data.trades || []);
    } catch (error) {
      toast.error('Failed to load trades');
    }
  };

  const fetchLevelsForTrade = async (tradeCode: string) => {
    try {
      const res = await fetch(`${API_BASE}/trades/${tradeCode}/levels`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setAvailableLevels(data.levels || []);
    } catch (error) {
      toast.error('Failed to load levels');
    }
  };

  useEffect(() => {
    if (selectedTrade) {
      fetchLevelsForTrade(selectedTrade);
    }
  }, [selectedTrade]);

  const fetchCourses = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/courses?trade_code=${selectedTrade}&level=${selectedLevel}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const coursesData = data.courses || [];
      setCourses(coursesData);
      generateTimetable(coursesData);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = (coursesData: any[]) => {
    const schedule: any[] = [];
    let courseIndex = 0;
    const classSlots = TIME_SLOTS.filter(slot => !slot.isBreak);
    
    DAYS.forEach(day => {
      TIME_SLOTS.forEach(slot => {
        if (slot.isBreak) {
          schedule.push({
            day,
            start_time: slot.start,
            end_time: slot.end,
            duration: slot.duration,
            isBreak: true,
            label: slot.label
          });
        } else if (coursesData.length > 0) {
          const course = coursesData[courseIndex % coursesData.length];
          schedule.push({
            day,
            start_time: slot.start,
            end_time: slot.end,
            duration: slot.duration,
            course_name: course.course_name,
            course_code: course.course_code,
            teacher: course.teacher_name || 'TBA',
            room: `Room ${Math.floor(Math.random() * 20) + 1}`
          });
          courseIndex++;
        }
      });
    });
    
    setTimetable(schedule);
  };

  const generateAllLevelsTimetables = async () => {
    if (!selectedTrade) {
      toast.error('Select a trade first');
      return;
    }
    setLoading(true);
    const allTimetables: any = {};
    
    try {
      const levelsRes = await fetch(`${API_BASE}/trades/${selectedTrade}/levels`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const levelsData = await levelsRes.json();
      const dbLevels = levelsData.levels || [];
      
      for (const levelObj of dbLevels) {
        const levelStr = levelObj.level_suffix ? `${levelObj.level_number}${levelObj.level_suffix}` : String(levelObj.level_number);
        
        const res = await fetch(`${API_BASE}/courses?trade_code=${selectedTrade}&level=${levelObj.level_number}${levelObj.level_suffix ? `&suffix=${levelObj.level_suffix}` : ''}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const coursesData = data.courses || [];
        
        if (coursesData.length === 0) continue;
        
        const schedule: any[] = [];
        let courseIndex = 0;
        
        DAYS.forEach(day => {
          TIME_SLOTS.forEach(slot => {
            if (slot.isBreak) {
              schedule.push({
                day,
                start_time: slot.start,
                end_time: slot.end,
                duration: slot.duration,
                isBreak: true,
                label: slot.label
              });
            } else if (coursesData.length > 0) {
              const course = coursesData[courseIndex % coursesData.length];
              schedule.push({
                day,
                start_time: slot.start,
                end_time: slot.end,
                duration: slot.duration,
                course_name: course.course_name,
                course_code: course.course_code,
                teacher: course.teacher_name || 'TBA',
                room: `Room ${Math.floor(Math.random() * 20) + 1}`
              });
              courseIndex++;
            }
          });
        });
        
        allTimetables[`Level ${levelStr}`] = schedule;
      }
      
      setAllLevelsTimetables(allTimetables);
      toast.success(`Generated timetables for all ${Object.keys(allTimetables).length} levels!`);
    } catch (error) {
      toast.error('Failed to generate all timetables');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['GARDEN TVET SCHOOL - TIMETABLE'],
      [`Trade: ${selectedTrade} | Level: ${selectedLevel}`],
      ['School Hours: 07:30 - 17:00 | Break: 10:10-10:25 | Lunch: 12:25-13:25 | Afternoon Break: 15:25-15:40'],
      [],
      ['Day', 'Start', 'End', 'Duration', 'Course', 'Code', 'Teacher', 'Room']
    ];
    
    timetable.forEach(item => {
      if (item.isBreak) {
        wsData.push([item.day, item.start_time, item.end_time, `${item.duration}min`, item.label, '', '', '']);
      } else {
        wsData.push([item.day, item.start_time, item.end_time, `${item.duration}min`, item.course_name, item.course_code, item.teacher, item.room]);
      }
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 30 }, { wch: 12 }, { wch: 20 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Timetable_${selectedTrade}_L${selectedLevel}.xlsx`);
    toast.success('Timetable exported to Excel!');
  };

  const exportAllLevelsToExcel = () => {
    if (Object.keys(allLevelsTimetables).length === 0) {
      toast.error('Generate all levels first');
      return;
    }
    
    const wb = XLSX.utils.book_new();
    
    Object.entries(allLevelsTimetables).forEach(([levelName, schedule]: [string, any]) => {
      const wsData = [
        ['GARDEN TVET SCHOOL - TIMETABLE'],
        [`Trade: ${selectedTrade} | ${levelName}`],
        ['School Hours: 07:30 - 17:00 | Break: 10:10-10:25 | Lunch: 12:25-13:25 | Afternoon Break: 15:25-15:40'],
        [],
        ['Day', 'Start', 'End', 'Duration', 'Course', 'Code', 'Teacher', 'Room']
      ];
      
      schedule.forEach((item: any) => {
        if (item.isBreak) {
          wsData.push([item.day, item.start_time, item.end_time, `${item.duration}min`, item.label, '', '', '']);
        } else {
          wsData.push([item.day, item.start_time, item.end_time, `${item.duration}min`, item.course_name, item.course_code, item.teacher, item.room]);
        }
      });
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 30 }, { wch: 12 }, { wch: 20 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws, levelName);
    });
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Timetable_${selectedTrade}_AllLevels.xlsx`);
    toast.success('All levels exported to Excel!');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="size-5" />Timetable Generator - Garden TVET Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-semibold text-blue-900">School Schedule:</p>
            <p className="text-blue-700">• Start: 07:30 | End: 17:00 | Each Period: 40 minutes</p>
            <p className="text-blue-700">• Break: 10:10-10:25 (15min) | Lunch: 12:25-13:25 (60min) | Afternoon Break: 15:25-15:40 (15min)</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger><SelectValue placeholder="Select Trade" /></SelectTrigger>
              <SelectContent>
                {trades.map(t => <SelectItem key={t.trade_code} value={t.trade_code}>{t.trade_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
              <SelectContent>
                {availableLevels.map(level => {
                  const levelStr = level.level_suffix ? `${level.level_number}${level.level_suffix}` : String(level.level_number);
                  return <SelectItem key={levelStr} value={levelStr}>Level {levelStr}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Button onClick={fetchCourses} disabled={!selectedTrade || !selectedLevel || loading}>
              <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Generate
            </Button>
            <Button onClick={generateAllLevelsTimetables} disabled={!selectedTrade || loading} variant="outline">
              <Plus className="size-4 mr-2" />All Levels
            </Button>
          </div>
          
          <div className="flex gap-2">
            {timetable.length > 0 && (
              <Button onClick={exportToExcel} className="flex-1 bg-green-600 hover:bg-green-700">
                <Download className="size-4 mr-2" />Export to Excel
              </Button>
            )}
            {Object.keys(allLevelsTimetables).length > 0 && (
              <Button onClick={exportAllLevelsToExcel} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Download className="size-4 mr-2" />Export All Levels
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {timetable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timetable - {selectedTrade} Level {selectedLevel}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border p-2">Day</th>
                    <th className="border p-2">Time</th>
                    <th className="border p-2">Duration</th>
                    <th className="border p-2">Course</th>
                    <th className="border p-2">Code</th>
                    <th className="border p-2">Teacher</th>
                    <th className="border p-2">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((item, i) => (
                    <tr key={i} className={item.isBreak ? 'bg-yellow-100 font-semibold' : 'hover:bg-gray-50'}>
                      <td className="border p-2">{item.day}</td>
                      <td className="border p-2">{item.start_time} - {item.end_time}</td>
                      <td className="border p-2 text-center">{item.duration}min</td>
                      <td className="border p-2">{item.isBreak ? item.label : item.course_name}</td>
                      <td className="border p-2 text-center">{item.course_code || '-'}</td>
                      <td className="border p-2">{item.teacher || '-'}</td>
                      <td className="border p-2 text-center">{item.room || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {Object.keys(allLevelsTimetables).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Levels Generated - {selectedTrade}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.keys(allLevelsTimetables).map(level => (
                <div key={level} className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="font-semibold text-green-900">{level}</p>
                  <p className="text-sm text-green-700">{allLevelsTimetables[level].filter((s: any) => !s.isBreak).length} periods</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
