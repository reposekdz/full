import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Edit, Upload, Save, X } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/developers';

export default function DevelopersAdmin() {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/team`);
      setDevelopers(data.developers || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_URL}/admin/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return data.image_url;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleSave = async () => {
    try {
      let image_url = editing.image_url;
      
      if (imageFile) {
        const uploadedUrl = await handleImageUpload();
        if (uploadedUrl) image_url = uploadedUrl;
      }

      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/team/${editing.id}`, 
        { ...editing, image_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEditing(null);
      setImageFile(null);
      fetchDevelopers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-xl p-8 mb-8 text-white">
        <div className="flex items-center gap-4">
          <Code className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-black">Abateguzi ba Sisitemu</h1>
            <p className="text-purple-100">Gucunga Abateguzi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((dev) => (
          <div key={dev.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-64">
              <img 
                src={`http://localhost:5000${dev.image_url}`} 
                alt={dev.name_rw || dev.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-2xl font-black">{dev.name_rw || dev.name}</h3>
                <p className="text-sm font-bold text-purple-200">{dev.role_rw || dev.role}</p>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">{dev.description_rw || dev.description}</p>
              <button 
                onClick={() => setEditing(dev)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold"
              >
                <Edit className="w-4 h-4 inline mr-2" /> Hindura
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <h2 className="text-2xl font-black">Hindura Umuteguzi</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <input className="border p-3 rounded-xl" placeholder="Izina (English)" value={editing.name || ''}
                  onChange={e => setEditing({...editing, name: e.target.value})} />
                <input className="border p-3 rounded-xl" placeholder="Izina (Kinyarwanda)" value={editing.name_rw || ''}
                  onChange={e => setEditing({...editing, name_rw: e.target.value})} />
                <input className="border p-3 rounded-xl" placeholder="Umwanya (English)" value={editing.role || ''}
                  onChange={e => setEditing({...editing, role: e.target.value})} />
                <input className="border p-3 rounded-xl" placeholder="Umwanya (Kinyarwanda)" value={editing.role_rw || ''}
                  onChange={e => setEditing({...editing, role_rw: e.target.value})} />
                <input className="border p-3 rounded-xl" placeholder="Imeli" value={editing.email || ''}
                  onChange={e => setEditing({...editing, email: e.target.value})} />
                <input className="border p-3 rounded-xl" placeholder="Telefoni" value={editing.phone || ''}
                  onChange={e => setEditing({...editing, phone: e.target.value})} />
                <input className="border p-3 rounded-xl" placeholder="GitHub URL" value={editing.github_url || ''}
                  onChange={e => setEditing({...editing, github_url: e.target.value})} />
                <input className="border p-3 rounded-xl" placeholder="LinkedIn URL" value={editing.linkedin_url || ''}
                  onChange={e => setEditing({...editing, linkedin_url: e.target.value})} />
                <textarea className="border p-3 rounded-xl col-span-2" rows={3} placeholder="Ibisobanuro (English)" value={editing.description || ''}
                  onChange={e => setEditing({...editing, description: e.target.value})} />
                <textarea className="border p-3 rounded-xl col-span-2" rows={3} placeholder="Ibisobanuro (Kinyarwanda)" value={editing.description_rw || ''}
                  onChange={e => setEditing({...editing, description_rw: e.target.value})} />
                
                <label className="col-span-2 flex items-center gap-2 cursor-pointer border-2 border-dashed p-4 rounded-xl hover:bg-gray-50">
                  <Upload className="w-5 h-5" />
                  <span>{imageFile ? imageFile.name : 'Hitamo Ifoto'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">
                  <Save className="w-5 h-5 inline mr-2" /> Bika
                </button>
                <button onClick={() => { setEditing(null); setImageFile(null); }} className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold">
                  <X className="w-5 h-5 inline mr-2" /> Hagarika
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
