import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Calendar, Search, MapPin, Building2, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const AlumniPage = () => {
  const [alumni, setAlumni] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAlumni();
    fetchEvents();
    fetchJobs();
    fetchStats();
  }, [search]);

  const fetchAlumni = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await fetch(`http://localhost:5000/api/alumni/directory?${params}`);
      const data = await response.json();
      if (data.success) setAlumni(data.alumni);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/alumni/events/list?upcoming=true');
      const data = await response.json();
      if (data.success) setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/alumni/jobs/list');
      const data = await response.json();
      if (data.success) setJobs(data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/alumni/stats/overview');
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Alumni Management</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Alumni</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.employed}</div>
              <div className="text-sm text-gray-600">Employed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{Math.round((stats.employed / stats.total) * 100)}%</div>
              <div className="text-sm text-gray-600">Employment Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.byYear?.length || 0}</div>
              <div className="text-sm text-gray-600">Graduation Years</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Alumni Directory</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="jobs">Job Board</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search alumni..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map(alum => (
              <Card key={alum.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {alum.first_name[0]}{alum.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{alum.first_name} {alum.last_name}</h3>
                      <Badge variant="secondary" className="mb-2">
                        <GraduationCap className="w-3 h-3 mr-1" /> {alum.graduation_year}
                      </Badge>
                      {alum.current_occupation && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{alum.current_occupation}</span>
                        </div>
                      )}
                      {alum.company && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>{alum.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Button>
            <Calendar className="w-4 h-4 mr-2" /> Create Event
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map(event => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(event.event_date).toLocaleDateString()} at {event.event_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                    {event.max_attendees && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>Max {event.max_attendees} attendees</span>
                      </div>
                    )}
                  </div>
                  <Button className="w-full mt-4">Register</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Button>
            <Briefcase className="w-4 h-4 mr-2" /> Post Job
          </Button>

          <div className="space-y-4">
            {jobs.map(job => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary_range && (
                          <Badge variant="secondary">{job.salary_range}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                      {job.requirements && (
                        <div className="text-sm">
                          <strong>Requirements:</strong>
                          <p className="text-gray-600">{job.requirements}</p>
                        </div>
                      )}
                    </div>
                    <Button>Apply</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlumniPage;
