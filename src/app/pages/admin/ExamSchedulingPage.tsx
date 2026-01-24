import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const ExamSchedulingPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/exam-scheduling/schedule');
      const data = await response.json();
      if (data.success) setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Examination Scheduling</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map(schedule => (
          <Card key={schedule.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedSchedule(schedule)}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{schedule.exam_name}</span>
                <Badge variant={schedule.status === 'published' ? 'default' : 'secondary'}>
                  {schedule.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{schedule.exam_type}</Badge>
                  <Badge variant="outline">{schedule.academic_year}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showCreateModal && (
        <CreateScheduleModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => { setShowCreateModal(false); fetchSchedules(); }}
        />
      )}

      {selectedSchedule && (
        <ScheduleDetails
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          onUpdate={fetchSchedules}
        />
      )}
    </div>
  );
};

const CreateScheduleModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    exam_name: '',
    exam_type: 'midterm',
    academic_year: '2024',
    term: 'Term 1',
    start_date: '',
    end_date: '',
    created_by: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/exam-scheduling/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      onSave();
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Exam Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Exam Name</label>
              <Input
                value={formData.exam_name}
                onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Exam Type</label>
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Academic Year</label>
                <Input
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Create Schedule</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const ScheduleDetails = ({ schedule, onClose, onUpdate }) => {
  const [sessions, setSessions] = useState([]);
  const [showAddSession, setShowAddSession] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [schedule.id]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/exam-scheduling/schedule/${schedule.id}`);
      const data = await response.json();
      if (data.success) setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const publishSchedule = async () => {
    try {
      await fetch(`http://localhost:5000/api/exam-scheduling/schedule/${schedule.id}/publish`, {
        method: 'PUT'
      });
      alert('Schedule published successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error publishing schedule:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{schedule.exam_name}</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddSession(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Session
              </Button>
              {schedule.status === 'draft' && (
                <Button onClick={publishSchedule}>Publish Schedule</Button>
              )}
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map(session => (
              <Card key={session.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subject</label>
                      <p className="font-medium">{session.subject_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date & Time</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{new Date(session.exam_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{session.start_time} - {session.end_time}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Room</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{session.room_name}</span>
                      </div>
                      <div className="text-sm text-gray-500">Capacity: {session.capacity}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Invigilators</label>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{session.invigilators?.length || 0}</span>
                      </div>
                      {session.invigilators?.map((inv, i) => (
                        <div key={i} className="text-sm text-gray-600">
                          {inv.first_name} {inv.last_name}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamSchedulingPage;
