import React from 'react';
import { Users, BookOpen, GraduationCap } from 'lucide-react';
import GlobalStudentSheets from '../components/GlobalStudentSheets';

export default function GlobalStudentSheetsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Imbonerahamwe y'Abanyeshuri
              </h1>
              <p className="text-gray-600 mt-1">Global Student Sheets - All Students by Trade & Level</p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Amashuri</p>
                  <p className="text-xl font-bold text-blue-900">All Trades</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-indigo-100 shadow-sm">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Inzego</p>
                  <p className="text-xl font-bold text-indigo-900">All Levels</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-purple-100 shadow-sm">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Abanyeshuri</p>
                  <p className="text-xl font-bold text-purple-900">All Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Student Sheets Component */}
        <GlobalStudentSheets />
      </div>
    </div>
  );
}
