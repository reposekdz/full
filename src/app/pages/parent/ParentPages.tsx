import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Search, Users, GraduationCap, Calendar, DollarSign, MessageSquare, PartyPopper, FileText, Download } from 'lucide-react';

export const ParentSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/search?q=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setResults(data.results || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Shakisha</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <Input placeholder="Shakisha..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1" />
          <Button onClick={handleSearch}><Search className="w-4 h-4 mr-2" /> Shakisha</Button>
        </div>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <p className="font-semibold">{result.title}</p>
              <p className="text-sm text-gray-600">{result.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ParentChildren: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parent-dashboard/children', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setChildren(data.children || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Abana Bawe</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <div key={index} className="p-6 bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl border-2 border-yellow-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-green-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {child.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-lg">{child.name}</p>
                  <p className="text-sm text-gray-600">{child.class_name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ikigereranyo:</span>
                  <span className="font-semibold">{child.average_grade || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Kwitabira:</span>
                  <span className="font-semibold">{child.attendance_rate || 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ParentGrades: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parent-monitoring/grades', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setGrades(data.grades || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Amanota</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Umwana</th>
                <th className="text-left p-4">Isomo</th>
                <th className="text-left p-4">Amanota</th>
                <th className="text-left p-4">Itariki</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-4">{grade.student_name}</td>
                  <td className="p-4">{grade.subject}</td>
                  <td className="p-4"><span className="font-bold text-green-600">{grade.score}</span></td>
                  <td className="p-4">{new Date(grade.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export const ParentAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parent-monitoring/attendance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setAttendance(data.attendance || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Kwitabira</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attendance.map((record, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold">{record.student_name}</p>
                <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {record.status === 'present' ? 'Yitabye' : 'Ntiyitabye'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ParentFinance: React.FC = () => {
  const [finances, setFinances] = useState<any[]>([]);

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/accountant/payments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setFinances(data.payments || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Amafaranga</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {finances.map((payment, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl border-l-4 border-yellow-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{payment.student_name}</p>
                  <p className="text-sm text-gray-600">{payment.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{payment.amount} RWF</p>
                  <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ParentCommunication: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setMessages(data.messages || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Itumanaho</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          {messages.map((msg, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold">
                  {msg.sender_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{msg.sender_name}</p>
                  <p className="text-xs text-gray-500">{new Date(msg.date).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-gray-700">{msg.message}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <Input placeholder="Andika ubutumwa..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1" />
          <Button onClick={sendMessage}><MessageSquare className="w-4 h-4 mr-2" /> Ohereza</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ParentEvents: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setEvents(data.events || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Ibirori</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <div key={index} className="p-6 bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl border-2 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-green-400 rounded-xl flex items-center justify-center">
                  <PartyPopper className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">{event.title}</p>
                  <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-gray-700">{event.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ParentReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/custom', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setReports(data.reports || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Raporo</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-green-400 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{report.title}</p>
                  <p className="text-sm text-gray-600">{new Date(report.date).toLocaleDateString()}</p>
                </div>
              </div>
              <Button size="sm"><Download className="w-4 h-4 mr-2" /> Pakurura</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
