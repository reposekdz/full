import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Plus, Trophy, Users, Calendar, FileText, BarChart3, Download } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Sports Manager
export const SportsManager: React.FC = () => {
  const [sports, setSports] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/dos-comprehensive/sports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSports(data.sports || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gucunga Siporo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sports.map((sport, idx) => (
          <motion.div
            key={sport.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h3 className="font-bold text-lg">{sport.name}</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Teams: {sport.team_count || 0}</p>
              <p>Players: {sport.player_count || 0}</p>
              <p>Category: {sport.category}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Teams Manager
export const TeamsManager: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/dos-comprehensive/teams`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeams(data.teams || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gucunga Amatsinda</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team, idx) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <h3 className="font-bold">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.sport_name}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p>Coach: {team.coach_name}</p>
              <p>Players: {team.player_count || 0}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Exams Manager
export const ExamsManager: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/dos-comprehensive/exams?status=${filter}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExams(data.exams || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetch();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gucunga Ibizamini</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="upcoming">Bizaza</option>
          <option value="past">Byarangiye</option>
        </select>
      </div>
      <div className="space-y-3">
        {exams.map((exam, idx) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="font-bold">{exam.exam_name}</h3>
                <p className="text-sm text-gray-500">{exam.subject_name} - {exam.trade_name}</p>
                <p className="text-xs text-gray-400">{exam.exam_date} at {exam.exam_time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{exam.total_marks} marks</p>
              <p className="text-xs text-gray-500">{exam.registered_students || 0} students</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Schedule Manager
export const ScheduleManager: React.FC = () => {
  const [timetables, setTimetables] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/dos-comprehensive/timetables/all/active?academic_year=2025`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTimetables(data.timetables || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gucunga Gahunda</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timetables.map((tt, idx) => (
          <motion.div
            key={tt.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-bold text-lg mb-2">{tt.timetable_name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Trade: {tt.trade_code} - Level {tt.level_number}</p>
              <p>Term: {tt.term}</p>
              <p>Year: {tt.academic_year}</p>
              <p className="text-green-600 font-semibold">Status: {tt.status}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Reports Manager
export const ReportsManager: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/dos-comprehensive/reports?academic_year=2025`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(data.reports || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gucunga Raporo</h2>
      <div className="space-y-3">
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8 text-indigo-500" />
              <div>
                <h3 className="font-bold">{report.trade_name} - Level {report.level_number}</h3>
                <p className="text-sm text-gray-500">Term {report.term} - {report.academic_year}</p>
                <p className="text-xs text-gray-400">Generated by {report.generated_by_name}</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Marks Manager
export const MarksManager: React.FC = () => {
  const [marks, setMarks] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/dos-comprehensive/marks?academic_year=2025&term=Term 1`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMarks(data.marks || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gucunga Amanota</h2>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {marks.slice(0, 20).map((mark, idx) => (
              <motion.tr
                key={mark.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">{mark.student_name}</p>
                    <p className="text-sm text-gray-500">{mark.student_code}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.subject_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.marks}/{mark.max_marks}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {mark.grade}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
