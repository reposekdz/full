import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Edit, Trash2, Plus, Upload, Save, X } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leadership';

interface Leader {
  id?: number;
  name: string;
  role: string;
  department: string;
  biography_rw: string;
  email: string;
  phone: string;
  office_location: string;
  image_url: string;
  qualifications: string;
  experience_years: number;
  specialization: string;
  achievements: string;
  responsibilities: string;
  office_hours: string;
}

export default function LeadershipAdmin() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [editing, setEditing] = useState<Leader | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setLeaders(data);
    } catch (error) {
      console.error('Error fetching leaders:', error);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.entries(editing!).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'image_url') {
          formData.append(key, value?.toString() || '');
        }
      });
      if (imageFile) formData.append('image', imageFile);

      if (editing!.id) {
        await axios.put(`${API_URL}/${editing!.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      
      setEditing(null);
      setImageFile(null);
      fetchLeaders();
    } catch (error) {
      console.error('Error saving leader:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this leader?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchLeaders();
      } catch (error) {
        console.error('Error deleting leader:', error);
      }
    }
  };

  const parseJSON = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed.join('\n') : str;
    } catch {
      return str;
    }
  };

  const stringifyJSON = (str: string) => {
    return JSON.stringify(str.split('\n').filter(s => s.trim()));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          Leadership Management
        </h1>
        <Button onClick={() => setEditing({
          name: '', role: '', department: '', biography_rw: '', email: '', phone: '',
          office_location: '', image_url: '', qualifications: '[]', experience_years: 0,
          specialization: '', achievements: '[]', responsibilities: '[]', office_hours: ''
        })}>
          <Plus className="w-4 h-4 mr-2" /> Add Leader
        </Button>
      </div>

      {editing && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>{editing.id ? 'Edit Leader' : 'Add New Leader'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Name" value={editing.name}
                onChange={e => setEditing({...editing, name: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Role" value={editing.role}
                onChange={e => setEditing({...editing, role: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Department" value={editing.department}
                onChange={e => setEditing({...editing, department: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Email" value={editing.email}
                onChange={e => setEditing({...editing, email: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Phone" value={editing.phone}
                onChange={e => setEditing({...editing, phone: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Office Location" value={editing.office_location}
                onChange={e => setEditing({...editing, office_location: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Experience Years" type="number" value={editing.experience_years}
                onChange={e => setEditing({...editing, experience_years: parseInt(e.target.value)})} />
              <input className="border p-2 rounded" placeholder="Office Hours" value={editing.office_hours}
                onChange={e => setEditing({...editing, office_hours: e.target.value})} />
              <textarea className="border p-2 rounded col-span-2" rows={3} placeholder="Biography (Kinyarwanda)" value={editing.biography_rw}
                onChange={e => setEditing({...editing, biography_rw: e.target.value})} />
              <textarea className="border p-2 rounded col-span-2" rows={2} placeholder="Specialization" value={editing.specialization}
                onChange={e => setEditing({...editing, specialization: e.target.value})} />
              <textarea className="border p-2 rounded col-span-2" rows={3} placeholder="Qualifications (one per line)" 
                value={parseJSON(editing.qualifications)}
                onChange={e => setEditing({...editing, qualifications: stringifyJSON(e.target.value)})} />
              <textarea className="border p-2 rounded col-span-2" rows={3} placeholder="Achievements (one per line)" 
                value={parseJSON(editing.achievements)}
                onChange={e => setEditing({...editing, achievements: stringifyJSON(e.target.value)})} />
              <textarea className="border p-2 rounded col-span-2" rows={3} placeholder="Responsibilities (one per line)" 
                value={parseJSON(editing.responsibilities)}
                onChange={e => setEditing({...editing, responsibilities: stringifyJSON(e.target.value)})} />
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer border p-2 rounded hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <span>{imageFile ? imageFile.name : 'Upload Image'}</span>
                  <input type="file" className="hidden" accept="image/*"
                    onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save</Button>
              <Button variant="outline" onClick={() => { setEditing(null); setImageFile(null); }}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {leaders.map(leader => (
          <Card key={leader.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <img src={`http://localhost:5000${leader.image_url}`} alt={leader.name}
                  className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{leader.name}</h3>
                  <p className="text-sm text-gray-600">{leader.role} - {leader.department}</p>
                  <p className="text-sm text-gray-500">{leader.email} | {leader.phone}</p>
                  <p className="text-sm mt-2 line-clamp-2">{leader.biography_rw}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setEditing(leader)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(leader.id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
