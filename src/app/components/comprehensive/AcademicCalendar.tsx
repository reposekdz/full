import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import axios from 'axios';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  academic_year: string;
  start_time: string;
  end_time: string;
}

export const AcademicCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ event_type: '', month: '', academic_year: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', event_date: '', event_type: 'exam', 
    academic_year: '2024', start_time: '', end_time: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, events]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/comprehensive-db/academic-calendar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];
    if (filters.event_type) filtered = filtered.filter(e => e.event_type === filters.event_type);
    if (filters.month) filtered = filtered.filter(e => new Date(e.event_date).getMonth() + 1 === parseInt(filters.month));
    if (filters.academic_year) filtered = filtered.filter(e => e.academic_year === filters.academic_year);
    setFilteredEvents(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/comprehensive-db/academic-calendar', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
      setIsDialogOpen(false);
      setFormData({ title: '', description: '', event_date: '', event_type: 'exam', academic_year: '2024', start_time: '', end_time: '' });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/comprehensive-db/academic-calendar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      exam: 'bg-red-500', holiday: 'bg-green-500', meeting: 'bg-blue-500',
      event: 'bg-purple-500', deadline: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Academic Calendar
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create Calendar Event</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <textarea className="w-full p-2 border rounded" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} required />
                  <Select value={formData.event_type} onValueChange={v => setFormData({...formData, event_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input type="time" placeholder="Start Time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                  <Input type="time" placeholder="End Time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                  <Input placeholder="Academic Year" value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} />
                </div>
                <Button type="submit" className="w-full">Create Event</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={filters.event_type} onValueChange={v => setFilters({...filters, event_type: v})}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Event Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.month} onValueChange={v => setFilters({...filters, month: v})}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Months</SelectItem>
                {Array.from({length: 12}, (_, i) => (
                  <SelectItem key={i+1} value={String(i+1)}>{new Date(2024, i).toLocaleString('default', {month: 'long'})}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFilters({event_type: '', month: '', academic_year: ''})}>
              <Filter className="w-4 h-4 mr-2" />Clear Filters
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading events...</div>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map(event => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getEventTypeColor(event.event_type)}>{event.event_type}</Badge>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{event.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                          {event.start_time && <span>🕐 {event.start_time} - {event.end_time}</span>}
                          <span>📚 {event.academic_year}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
