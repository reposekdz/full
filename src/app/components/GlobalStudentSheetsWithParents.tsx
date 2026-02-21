import React, { useState, useEffect } from 'react';
import { Users, Phone, MessageSquare, AlertCircle, Send, X } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { StudentParentLinkingButton } from '@/app/components/StudentParentLinkingButton';

const API_BASE = 'http://localhost:5000/api';

const GlobalStudentSheetsWithParents = ({ tradeCode = null, levelNumber = null }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConductDialog, setShowConductDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [conductForm, setConductForm] = useState({ incident_type: '', description: '', points_deducted: 3, severity: 'moderate' });
  const [messageForm, setMessageForm] = useState({ message: '' });

  useEffect(() => {
    fetchStudents();
  }, [tradeCode, levelNumber]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/global-conduct/students-with-parents`;
      const params = [];
      if (tradeCode) params.push(`trade=${tradeCode}`);
      if (levelNumber) params.push(`level=${levelNumber}`);
      if (params.length) url += `?${params.join('&')}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setStudents(data.students || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConduct = async () => {
    if (!conductForm.incident_type || !conductForm.description) {
      alert('Uzuza amakuru yose!');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/global-conduct/remove-conduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          incident_type: conductForm.incident_type,
          description: conductForm.description,
          points_deducted: conductForm.points_deducted,
          severity: conductForm.severity
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Imyitwarire yakuweho! SMS yoherejwe ku babyeyi ${data.sms_sent || 0}`);
        setShowConductDialog(false);
        setConductForm({ incident_type: '', description: '', points_deducted: 3, severity: 'moderate' });
        fetchStudents();
      } else {
        alert('Ikosa: ' + (data.error || 'Ikosa ryabaye'));
      }
    } catch (error) {
      console.error('Remove conduct error:', error);
      alert('Ikosa ryabaye');
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.message) {
      alert('Andika ubutumwa!');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/global-conduct/message-parents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          message: messageForm.message
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Ubutumwa bwoherejwe ku babyeyi ${data.sms_sent || 0}!`);
        setShowMessageDialog(false);
        setMessageForm({ message: '' });
      } else {
        alert('Ikosa: ' + (data.error || 'Ikosa ryabaye'));
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Ikosa ryabaye');
    }
  };

  const openConductDialog = (student) => {
    setSelectedStudent(student);
    setShowConductDialog(true);
  };

  const openMessageDialog = (student) => {
    setSelectedStudent(student);
    setShowMessageDialog(true);
  };

  if (loading) return <div className="text-center py-12">Gukurura amakuru...</div>;

  return (
    <>
      <div className="space-y-4">
        {students.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nta banyeshuri babonetse</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <th className="p-3 text-left">Amazina</th>
                  <th className="p-3 text-left">Ikode</th>
                  <th className="p-3 text-left">Umwuga</th>
                  <th className="p-3 text-left">Urwego</th>
                  <th className="p-3 text-left">Imyitwarire</th>
                  <th className="p-3 text-left">Ababyeyi</th>
                  <th className="p-3 text-left">Telefoni</th>
                  <th className="p-3 text-center">Ibikorwa</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 font-medium">{student.first_name} {student.last_name}</td>
                    <td className="p-3 text-sm text-gray-600">{student.student_code}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {student.trade_code}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        L{student.level_number}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        student.conduct_score >= 36 ? 'bg-green-100 text-green-700' :
                        student.conduct_score >= 32 ? 'bg-blue-100 text-blue-700' :
                        student.conduct_score >= 28 ? 'bg-yellow-100 text-yellow-700' :
                        student.conduct_score >= 24 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {student.conduct_score}/40
                      </span>
                    </td>
                    <td className="p-3">
                      {student.parent_count > 0 ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-700">{student.parent_names}</div>
                          <div className="text-xs text-gray-500">({student.parent_count} {student.parent_count === 1 ? 'umubyeyi' : 'ababyeyi'})</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Nta babyeyi</span>
                      )}
                    </td>
                    <td className="p-3">
                      {student.parent_phones ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{student.parent_phones}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <StudentParentLinkingButton student={student} onLinkApproved={fetchStudents} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openConductDialog(student)}
                          className="text-red-600 hover:bg-red-50"
                          title="Kuraho Imyitwarire"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                        {student.parent_count > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openMessageDialog(student)}
                            className="text-blue-600 hover:bg-blue-50"
                            title="Tumira Ubutumwa"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remove Conduct Dialog */}
      <Dialog open={showConductDialog} onOpenChange={setShowConductDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kuraho Imyitwarire - {selectedStudent?.first_name} {selectedStudent?.last_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Ubwoko bw'Ikosa *</Label>
              <Input
                value={conductForm.incident_type}
                onChange={(e) => setConductForm({...conductForm, incident_type: e.target.value})}
                placeholder="Urugero: Gutinda, Kurwana, Kutubahiriza..."
              />
            </div>
            <div>
              <Label>Ibisobanuro *</Label>
              <textarea
                className="w-full border rounded px-3 py-2 min-h-[80px]"
                value={conductForm.description}
                onChange={(e) => setConductForm({...conductForm, description: e.target.value})}
                placeholder="Sobanura icyabaye..."
              />
            </div>
            <div>
              <Label>Amanota Yakuweho</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={conductForm.points_deducted}
                onChange={(e) => setConductForm({...conductForm, points_deducted: parseInt(e.target.value)})}
              >
                <option value="1">1 point (Ikosa rito)</option>
                <option value="2">2 points (Ikosa ryo hagati)</option>
                <option value="3">3 points (Ikosa rikomeye)</option>
                <option value="5">5 points (Ikosa cyane)</option>
              </select>
            </div>
            <div>
              <Label>Urwego rw'Ikosa</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={conductForm.severity}
                onChange={(e) => setConductForm({...conductForm, severity: e.target.value})}
              >
                <option value="minor">Rito (Minor)</option>
                <option value="moderate">Ryo hagati (Moderate)</option>
                <option value="major">Rikomeye (Major)</option>
                <option value="severe">Cyane (Severe)</option>
              </select>
            </div>
            {selectedStudent?.parent_count > 0 && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-700">
                  📱 SMS izoherekezwa kuri: {selectedStudent.parent_names}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConductDialog(false)}>Hagarika</Button>
            <Button onClick={handleRemoveConduct} className="bg-red-600 hover:bg-red-700">
              Kuraho Imyitwarire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Parents Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tumira Ababyeyi - {selectedStudent?.first_name} {selectedStudent?.last_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium mb-1">Ababyeyi:</p>
              <p className="text-sm text-gray-700">{selectedStudent?.parent_names}</p>
              <p className="text-xs text-gray-500 mt-1">📱 {selectedStudent?.parent_phones}</p>
            </div>
            <div>
              <Label>Ubutumwa *</Label>
              <textarea
                className="w-full border rounded px-3 py-2 min-h-[120px]"
                value={messageForm.message}
                onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                placeholder="Andika ubutumwa bwawe hano..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Hagarika</Button>
            <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Ohereza SMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalStudentSheetsWithParents;
