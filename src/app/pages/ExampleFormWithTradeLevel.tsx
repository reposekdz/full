import React, { useState } from 'react';
import TradeLevelSelector from '../components/TradeLevelSelector';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, User, Mail, Phone, MapPin } from 'lucide-react';

const ExampleFormWithTradeLevel: React.FC = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    trade: '',
    level: '',
    course: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('Form submitted:', formData);
    
    try {
      const response = await axios.post('http://localhost:5000/api/students', formData);
      if (response.data.success) {
        alert('Student added successfully!');
        setFormData({ studentName: '', trade: '', level: '', course: '', email: '', phone: '', address: '' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <User className="w-8 h-8" />
              Add New Student
            </h2>
            <p className="mt-2 text-blue-100">Complete the form with student details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter student full name"
              />
            </div>

            {/* Basic Trade & Level Selector */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Academic Information</h3>
              <TradeLevelSelector
                selectedTrade={formData.trade}
                selectedLevel={formData.level}
                onTradeChange={(trade) => setFormData({ ...formData, trade })}
                onLevelChange={(level) => setFormData({ ...formData, level })}
                required
                disabled={isSubmitting}
                showLabels
              />
            </div>

            {/* Advanced Options Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showAdvanced"
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="showAdvanced" className="text-sm font-medium text-gray-700 cursor-pointer">
                Show Advanced Options (Course Selection, Stats, Kinyarwanda)
              </label>
            </div>

            {/* Advanced Trade & Level Selector with Course */}
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 relative"
              >
                <h3 className="text-lg font-semibold text-gray-800">Advanced Selection</h3>
                <TradeLevelSelector
                  selectedTrade={formData.trade}
                  selectedLevel={formData.level}
                  selectedCourse={formData.course}
                  onTradeChange={(trade) => setFormData({ ...formData, trade })}
                  onLevelChange={(level) => setFormData({ ...formData, level })}
                  onCourseChange={(course) => setFormData({ ...formData, course })}
                  required
                  disabled={isSubmitting}
                  showLabels
                  showCourses
                  showStats
                  showKinyarwanda
                />
              </motion.div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+250 XXX XXX XXX"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Enter student address"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Add Student
                </>
              )}
            </motion.button>
          </form>

          {/* Display Selected Values */}
          {formData.trade && formData.level && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
            >
              <h3 className="font-semibold text-green-800 mb-2">Selected Information:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Trade:</span>
                  <p className="font-medium text-gray-900">{formData.trade}</p>
                </div>
                <div>
                  <span className="text-gray-600">Level:</span>
                  <p className="font-medium text-gray-900">{formData.level}</p>
                </div>
                {formData.course && (
                  <div>
                    <span className="text-gray-600">Course:</span>
                    <p className="font-medium text-gray-900">{formData.course}</p>
                  </div>
                )}
                {formData.studentName && (
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900">{formData.studentName}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Variants Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white rounded-2xl shadow-xl p-6 space-y-6"
        >
          <h3 className="text-2xl font-bold text-gray-800">Component Variants</h3>
          
          {/* Compact Variant */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Compact Variant</h4>
            <TradeLevelSelector
              selectedTrade={formData.trade}
              selectedLevel={formData.level}
              onTradeChange={(trade) => setFormData({ ...formData, trade })}
              onLevelChange={(level) => setFormData({ ...formData, level })}
              variant="compact"
              showLabels={false}
            />
          </div>

          {/* Inline Variant */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Inline Variant</h4>
            <TradeLevelSelector
              selectedTrade={formData.trade}
              selectedLevel={formData.level}
              onTradeChange={(trade) => setFormData({ ...formData, trade })}
              onLevelChange={(level) => setFormData({ ...formData, level })}
              variant="inline"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExampleFormWithTradeLevel;
