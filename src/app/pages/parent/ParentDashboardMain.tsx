import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, BookOpen, Award, DollarSign, Calendar, ChevronRight, Plus } from 'lucide-react';

interface LinkedStudent {
  id: number;
  first_name: string;
  last_name: string;
  student_code: string;
  trade_name: string;
  level_number: number;
  gender: string;
}

interface ParentDashboardMainProps {
  onNavigate?: (page: string) => void;
}

const ParentDashboardMain: React.FC<ParentDashboardMainProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinkedStudents();
  }, []);

  const fetchLinkedStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/parent-links/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Gufungura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">Ikaze kuri Dashboard y'Ababyeyi</h1>
          <p className="mt-2 text-indigo-100">Reba amakuru y'abana bawe</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Abana Bawe ({students.length})</h2>
          <button
            onClick={() => onNavigate?.('parent-child-linking')}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Ongeraho Umwana</span>
          </button>
        </div>

        {/* Students Grid */}
        {students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nta bana bahurijwe</h3>
            <p className="text-gray-600 mb-6">Kanda buto hejuru kugirango uhuze umwana wawe</p>
            <button
              onClick={() => onNavigate?.('parent-child-linking')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ongeraho Umwana
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => onNavigate?.(`parent-child/${student.id}`)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {student.first_name[0]}{student.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{student.student_code}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2 text-indigo-600" />
                    <span>{student.trade_name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2 text-purple-600" />
                    <span>Urwego {student.level_number}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 text-pink-600" />
                    <span>{student.gender === 'M' ? 'Umuhungu' : 'Umukobwa'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-indigo-600">Reba Amakuru</span>
                  <ChevronRight className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {students.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Abana</p>
                  <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Amashuri</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {new Set(students.map(s => s.trade_name)).size}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Inzego</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {new Set(students.map(s => s.level_number)).size}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Uyu Mwaka</p>
                  <p className="text-2xl font-bold text-gray-800">2024</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboardMain;
