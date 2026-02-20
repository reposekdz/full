import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Save, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const TimetableGenerator = () => {
  const [trade, setTrade] = useState('SOD');
  const [level, setLevel] = useState('1');
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [viewMode, setViewMode] = useState(false);
  const [existingTimetable, setExistingTimetable] = useState([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { period: 1, start: '08:00', end: '09:00' },
    { period: 2, start: '09:00', end: '10:00' },
    { period: 3, start: '10:00', end: '11:00' },
    { period: 4, start: '11:00', end: '12:00' },
    { period: 5, start: '13:00', end: '14:00' },
    { period: 6, start: '14:00', end: '15:00' },
    { period: 7, start: '15:00', end: '16:00' }
  ];

  useEffect(() => {
    fetchData();
  }, [trade, level]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/timetable/data/${trade}/${level}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
        setSubjects(data.subjects);
        setTeachers(data.teachers);
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const fetchExistingTimetable = async () => {
    try {
      const res = await fetch(`${API_BASE}/timetable/view/${trade}/${level}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setExistingTimetable(data.timetable);
        setViewMode(true);
      }
    } catch (error) {
      toast.error('Failed to load timetable');
    }
  };

  const addPeriod = (day, periodInfo) => {
    setSchedule([...schedule, {
      day,
      period: periodInfo.period,
      start_time: periodInfo.start,
      end_time: periodInfo.end,
      subject_id: null,
      course_id: null,
      teacher_id: null,
      room: ''
    }]);
  };

  const updatePeriod = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const removePeriod = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const generateTimetable = async () => {
    if (schedule.length === 0) {
      toast.error('Add at least one period');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/timetable/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ trade, level, schedule })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Timetable generated!');
        setSchedule([]);
        fetchExistingTimetable();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to generate timetable');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Timetable Generation</h2>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode(!viewMode)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            {viewMode ? 'Create New' : 'View Existing'}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="SOD">SOD</option>
          <option value="BDC">BDC</option>
          <option value="AUT">AUT</option>
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
          <option value="4">Level 4</option>
        </select>
      </div>

      {viewMode ? (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Existing Timetable - {trade} Level {level}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border p-2">Day</th>
                  <th className="border p-2">Period</th>
                  <th className="border p-2">Time</th>
                  <th className="border p-2">Subject/Course</th>
                  <th className="border p-2">Teacher</th>
                  <th className="border p-2">Room</th>
                </tr>
              </thead>
              <tbody>
                {existingTimetable.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border p-2">{entry.day_of_week}</td>
                    <td className="border p-2 text-center">{entry.period}</td>
                    <td className="border p-2">{entry.start_time} - {entry.end_time}</td>
                    <td className="border p-2">{entry.subject_name || entry.course_name}</td>
                    <td className="border p-2">{entry.teacher_name}</td>
                    <td className="border p-2">{entry.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Add Periods</h3>
            <div className="grid grid-cols-5 gap-4">
              {days.map(day => (
                <div key={day} className="space-y-2">
                  <h4 className="font-bold text-center">{day}</h4>
                  {periods.map(p => (
                    <Button
                      key={p.period}
                      onClick={() => addPeriod(day, p)}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      P{p.period} ({p.start})
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Schedule ({schedule.length} periods)</h3>
            <div className="space-y-4">
              {schedule.map((entry, idx) => (
                <div key={idx} className="flex gap-4 items-center p-4 border rounded">
                  <div className="font-bold">{entry.day} - P{entry.period}</div>
                  <select
                    value={entry.subject_id || ''}
                    onChange={(e) => updatePeriod(idx, 'subject_id', e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <select
                    value={entry.course_id || ''}
                    onChange={(e) => updatePeriod(idx, 'course_id', e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={entry.teacher_id || ''}
                    onChange={(e) => updatePeriod(idx, 'teacher_id', e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Room"
                    value={entry.room}
                    onChange={(e) => updatePeriod(idx, 'room', e.target.value)}
                    className="px-3 py-2 border rounded"
                  />
                  <Button onClick={() => removePeriod(idx)} variant="destructive" size="sm">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            {schedule.length > 0 && (
              <Button onClick={generateTimetable} className="mt-4 bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Generate Timetable
              </Button>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default TimetableGenerator;
