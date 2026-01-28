import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Eye, Search,
  Filter, RefreshCw, Download, Upload, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Award, Target, Bell, BookOpen, Briefcase, PartyPopper,
  GraduationCap, Trophy, Zap, Star, UserPlus, Mail, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';

const API_BASE = 'http://localhost:5000/api';

interface EventManagementDashboardProps {
  userRole: string;
  userId: number;
}

const EventManagementDashboard: React.FC<EventManagementDashboardProps> = ({ userRole, userId }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAttendeesDialog, setShowAttendeesDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'academic',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    max_attendees: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [eventsRes, typesRes] = await Promise.all([
        fetch(`${API_BASE}/event-management/events`).then(r => r.json()),
        fetch(`${API_BASE}/event-management/event-types`).then(r => r.json())
      ]);

      setEvents(eventsRes.events || []);
      setEventTypes(typesRes.types || []);
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventAttendees = async (eventId: number) => {
    try {
      const response = await fetch(`${API_BASE}/event-management/events/${eventId}`);
      const data = await response.json();
      if (data.success) {
        setAttendees(data.attendees || []);
        setSelectedEvent(data.event);
        setShowAttendeesDialog(true);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  const handleRegisterAttendee = async (eventId: number) => {
    try {
      const response = await fetch(`${API_BASE}/event-management/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          user_id: userId,
          registration_status: 'confirmed'
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchAllData();
        alert('Successfully registered for event!');
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const response = await fetch(`${API_BASE}/event-management/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organizer_id: userId
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchAllData();
        setShowEventDialog(false);
        resetForm();
        alert('Event created successfully!');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'academic',
      event_date: '',
      start_time: '',
      end_time: '',
      location: '',
      max_attendees: ''
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <h3 className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                {value}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
              )}
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${color}`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'academic': return BookOpen;
      case 'sports': return Trophy;
      case 'cultural': return PartyPopper;
      case 'graduation': return GraduationCap;
      case 'workshop': return Briefcase;
      default: return Calendar;
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date() && e.status !== 'cancelled');
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date() || e.status === 'completed');
  const totalAttendees = events.reduce((sum, e) => sum + (e.registered_count || 0), 0);

  const stats = [
    { title: 'Total Events', value: events.length, icon: Calendar, color: 'from-blue-500 to-blue-600', subtitle: `${upcomingEvents.length} upcoming` },
    { title: 'Total Attendees', value: totalAttendees, icon: Users, color: 'from-green-500 to-green-600', subtitle: 'Across all events' },
    { title: 'Event Types', value: [...new Set(events.map(e => e.event_type))].length, icon: Award, color: 'from-purple-500 to-purple-600', subtitle: 'Different categories' },
    { title: 'This Month', value: events.filter(e => new Date(e.event_date).getMonth() === new Date().getMonth()).length, icon: TrendingUp, color: 'from-yellow-500 to-yellow-600', subtitle: 'Events scheduled' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || event.event_type === selectedType;
    const matchesTab = activeTab === 'upcoming' 
      ? new Date(event.event_date) >= new Date() && event.status !== 'cancelled'
      : new Date(event.event_date) < new Date() || event.status === 'completed';
    return matchesSearch && matchesType && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Event Management
            </h1>
            <p className="text-gray-600 mt-2">Manage school events, workshops, and activities</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchAllData}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowEventDialog(true)}
              className="bg-gradient-to-r from-yellow-600 to-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md bg-gradient-to-r from-green-100 to-yellow-100 p-1 rounded-2xl">
          <TabsTrigger value="upcoming" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="past" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Past Events
          </TabsTrigger>
        </TabsList>

        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2 font-black">
                <Calendar className="w-6 h-6 text-green-600" />
                {activeTab === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
              </CardTitle>
              <div className="flex gap-3">
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="graduation">Graduation</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-bold">No events found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                  const EventIcon = getEventTypeIcon(event.event_type);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100"
                    >
                      <div className={`h-2 bg-gradient-to-r ${
                        event.event_type === 'academic' ? 'from-blue-500 to-blue-600' :
                        event.event_type === 'sports' ? 'from-green-500 to-green-600' :
                        event.event_type === 'cultural' ? 'from-purple-500 to-purple-600' :
                        'from-yellow-500 to-yellow-600'
                      }`} />
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${
                            event.event_type === 'academic' ? 'from-blue-500 to-blue-600' :
                            event.event_type === 'sports' ? 'from-green-500 to-green-600' :
                            event.event_type === 'cultural' ? 'from-purple-500 to-purple-600' :
                            'from-yellow-500 to-yellow-600'
                          }`}>
                            <EventIcon className="w-6 h-6 text-white" />
                          </div>
                          <Badge className={getEventStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>

                        <h3 className="text-xl font-black text-gray-800 mb-2 line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span>{event.start_time} - {event.end_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span>{event.registered_count || 0} / {event.max_attendees} attendees</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => fetchEventAttendees(event.id)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {activeTab === 'upcoming' && event.status === 'scheduled' && (
                            <Button
                              onClick={() => handleRegisterAttendee(event.id)}
                              className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
                              size="sm"
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Register
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Create New Event
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Event Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Type</Label>
                <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="graduation">Graduation</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter event location"
              />
            </div>
            <div>
              <Label>Max Attendees</Label>
              <Input
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="Maximum number of attendees"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateEvent}
                className="flex-1 bg-gradient-to-r from-green-600 to-yellow-600"
              >
                Create Event
              </Button>
              <Button
                onClick={() => setShowEventDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAttendeesDialog} onOpenChange={setShowAttendeesDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Event Attendees
            </DialogTitle>
            {selectedEvent && (
              <p className="text-gray-600">{selectedEvent.title}</p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {attendees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No attendees registered yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center text-white font-black">
                        {attendee.first_name?.[0]}{attendee.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {attendee.first_name} {attendee.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{attendee.email}</p>
                      </div>
                    </div>
                    <Badge className={getEventStatusColor(attendee.registration_status)}>
                      {attendee.registration_status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventManagementDashboard;
