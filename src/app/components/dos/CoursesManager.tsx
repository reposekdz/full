import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, BookOpen } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const CoursesManager: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', duration_months: 36, fee_amount: 0 });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/dos-comprehensive/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/dos-comprehensive/courses`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Course created!');
      setShowModal(false);
      setForm({ code: '', name: '', description: '', duration_months: 36, fee_amount: 0 });
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const filtered = courses.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gucunga Amasomo</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Ongeramo Isomo</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Shakisha isomo..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-500">{course.code}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{course.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{course.duration_months} months</span>
              <span className="font-semibold text-green-600">{course.fee_amount} RWF</span>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold mb-4">Ongeramo Isomo Rishya</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Code (e.g., SOD)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Course Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
              <input
                type="number"
                placeholder="Duration (months)"
                value={form.duration_months}
                onChange={(e) => setForm({ ...form, duration_months: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Fee Amount (RWF)"
                value={form.fee_amount}
                onChange={(e) => setForm({ ...form, fee_amount: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Bika
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CoursesManager;
