import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const AcademicsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'courses') {
        const { data } = await axios.get(`${API_URL}/academics/my-courses`, { headers });
        setCourses(data.courses || []);
      } else if (activeTab === 'assignments') {
        const { data } = await axios.get(`${API_URL}/academics/assignments`, { headers });
        setAssignments(data.assignments || []);
      } else if (activeTab === 'grades') {
        const { data } = await axios.get(`${API_URL}/academics/grades`, { headers });
        setGrades(data.grades || []);
      } else if (activeTab === 'exams') {
        const { data } = await axios.get(`${API_URL}/academics/exams`, { headers });
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'courses', label: t('courses'), icon: '📚' },
    { id: 'assignments', label: t('assignments'), icon: '📝' },
    { id: 'grades', label: t('grades'), icon: '📊' },
    { id: 'exams', label: t('exams'), icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {t('myAcademics')}
          </h1>
          <p className="text-xl text-gray-600">{t('academicsDescription')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: t('courses'), value: courses.length, icon: '📚', color: 'indigo' },
            { label: t('assignments'), value: assignments.length, icon: '📝', color: 'blue' },
            { label: t('exams'), value: exams.length, icon: '📋', color: 'purple' },
            { label: t('grades'), value: grades.length, icon: '📊', color: 'pink' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white rounded-2xl shadow-lg p-6 border-t-4 border-${stat.color}-500 hover:shadow-xl transition-all transform hover:-translate-y-1`}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] px-6 py-4 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">{t('loading')}</p>
            </div>
          ) : (
            <>
              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-xl">No courses available</p>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <div key={course.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-lg px-3 py-1 text-sm font-semibold">
                            {course.course_code}
                          </div>
                          <div className="text-2xl">📚</div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.course_name}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>👨‍🏫</span>
                            <span>{course.instructor_first_name} {course.instructor_last_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>📊</span>
                            <span>{t('courseProgress')}: {course.my_average || 0}%</span>
                          </div>
                        </div>
                        <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                          {t('viewCourse')}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Assignments Tab */}
              {activeTab === 'assignments' && (
                <div className="space-y-4">
                  {assignments.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-xl">No assignments available</p>
                    </div>
                  ) : (
                    assignments.map((assignment) => (
                      <div key={assignment.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-500 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{assignment.title}</h3>
                            <p className="text-sm text-gray-600">{assignment.course_name}</p>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            assignment.submission_status === 'submitted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {assignment.submission_status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{assignment.description}</p>
                        <div className="flex gap-6 text-sm text-gray-600">
                          <span>📅 Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          {assignment.score && <span>📊 Score: {assignment.score}%</span>}
                        </div>
                        {!assignment.submission_status && (
                          <button className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                            {t('submitAssignment')}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Grades Tab */}
              {activeTab === 'grades' && (
                <div className="space-y-6">
                  {grades.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      <div className="text-6xl mb-4">📊</div>
                      <p className="text-xl">No grades available</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-2xl p-6">
                        <h3 className="text-2xl font-bold mb-2">Overall Performance</h3>
                        <div className="text-5xl font-bold">
                          {(grades.reduce((acc, g) => acc + (g.score || 0), 0) / grades.length).toFixed(1)}%
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {grades.map((grade) => (
                          <div key={grade.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-500 transition-all">
                            <h3 className="font-bold text-gray-800 mb-2">{grade.course_name}</h3>
                            <div className="flex items-center gap-4">
                              <div className="text-4xl font-bold text-indigo-600">{grade.score}%</div>
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className="bg-gradient-to-r from-indigo-600 to-pink-600 h-3 rounded-full transition-all"
                                    style={{ width: `${grade.score}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{grade.exam_name || 'Overall Grade'}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Exams Tab */}
              {activeTab === 'exams' && (
                <div className="space-y-4">
                  {exams.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-xl">No exams scheduled</p>
                    </div>
                  ) : (
                    exams.map((exam) => (
                      <div key={exam.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-500 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.exam_name}</h3>
                            <p className="text-gray-600 mb-4">{exam.course_name}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">📅 Date:</span>
                                <p className="font-semibold">{new Date(exam.exam_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">⏰ Time:</span>
                                <p className="font-semibold">{exam.start_time}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">📍 Room:</span>
                                <p className="font-semibold">{exam.room || 'TBA'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">📊 Marks:</span>
                                <p className="font-semibold">{exam.total_marks}</p>
                              </div>
                            </div>
                          </div>
                          {exam.score && (
                            <div className="text-center bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl p-4">
                              <div className="text-3xl font-bold">{exam.score}%</div>
                              <div className="text-sm">{exam.grade}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicsPage;
