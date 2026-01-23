import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Save, Upload, Loader2, FileText, Calendar, Target } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import AdvancedTextEditor from '@/app/components/AdvancedTextEditor';

interface TeacherCreateAssignmentPageProps {
  teacherId: number;
}

const TeacherCreateAssignmentPage: React.FC<TeacherCreateAssignmentPageProps> = ({ teacherId }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    class_id: '',
    course_id: '',
    title: '',
    description: '',
    type: 'homework',
    rich_text_content: '',
    total_marks: '',
    passing_marks: '',
    due_date: '',
    allow_late_submission: false,
    late_penalty_percent: '0',
    is_published: false
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dos/classes');
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dos/courses');
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.class_id || !formData.course_id || !formData.title || !formData.total_marks || !formData.due_date) {
      alert('Uzuza ibisabwa byose');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('teacher_id', teacherId.toString());
      submitData.append('class_id', formData.class_id);
      submitData.append('course_id', formData.course_id);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('type', formData.type);
      submitData.append('content_type', 'both');
      submitData.append('rich_text_content', formData.rich_text_content);
      submitData.append('total_marks', formData.total_marks);
      submitData.append('passing_marks', formData.passing_marks || Math.floor(parseInt(formData.total_marks) * 0.5).toString());
      submitData.append('due_date', formData.due_date);
      submitData.append('allow_late_submission', formData.allow_late_submission.toString());
      submitData.append('late_penalty_percent', formData.late_penalty_percent);
      submitData.append('is_published', formData.is_published.toString());

      files.forEach(file => {
        submitData.append('files', file);
      });

      const response = await fetch('http://localhost:5000/api/assignments/assignments', {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        alert('Igikorwa cyashyizweho neza!');
        // Reset form
        setFormData({
          class_id: '',
          course_id: '',
          title: '',
          description: '',
          type: 'homework',
          rich_text_content: '',
          total_marks: '',
          passing_marks: '',
          due_date: '',
          allow_late_submission: false,
          late_penalty_percent: '0',
          is_published: false
        });
        setFiles([]);
      } else {
        alert('Ikosa ryabaye');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Ikosa ryabaye');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Kora Igikorwa Gishya</h1>
          <p className="text-lg text-gray-600 font-semibold">Create Homework, Quiz, or Assignment</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-2 border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Amakuru Rusange</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-bold mb-2">Ishuri *</Label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg"
                    required
                  >
                    <option value="">Hitamo ishuri</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-base font-bold mb-2">Isomo *</Label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg"
                    required
                  >
                    <option value="">Hitamo isomo</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-base font-bold mb-2">Ubwoko *</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg"
                    required
                  >
                    <option value="homework">Homework</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <div>
                  <Label className="text-base font-bold mb-2">Itariki yo Kurangiza *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="h-12 border-2"
                    required
                  />
                </div>

                <div>
                  <Label className="text-base font-bold mb-2">Amanota Yose *</Label>
                  <Input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                    placeholder="100"
                    className="h-12 border-2"
                    required
                  />
                </div>

                <div>
                  <Label className="text-base font-bold mb-2">Amanota yo Kurangura</Label>
                  <Input
                    type="number"
                    value={formData.passing_marks}
                    onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
                    placeholder="50"
                    className="h-12 border-2"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-base font-bold mb-2">Umutwe *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Andika umutwe w'igikorwa..."
                  className="h-12 border-2"
                  required
                />
              </div>

              <div className="mt-6">
                <Label className="text-base font-bold mb-2">Ibisobanuro Bigufi</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ibisobanuro bigufi..."
                  className="h-12 border-2"
                />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.allow_late_submission}
                    onChange={(e) => setFormData({ ...formData, allow_late_submission: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <Label className="text-base font-bold">Emera Gutinda</Label>
                </div>

                {formData.allow_late_submission && (
                  <div>
                    <Label className="text-base font-bold mb-2">Igihano cyo Gutinda (%)</Label>
                    <Input
                      type="number"
                      value={formData.late_penalty_percent}
                      onChange={(e) => setFormData({ ...formData, late_penalty_percent: e.target.value })}
                      placeholder="10"
                      className="h-12 border-2"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <Label className="text-base font-bold">Tangaza Nonaha</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rich Text Content */}
          <Card className="border-2 border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Ibisobanuro Birambuye</h2>
              <AdvancedTextEditor
                value={formData.rich_text_content}
                onChange={(value) => setFormData({ ...formData, rich_text_content: value })}
                placeholder="Andika ibisobanuro birambuye by'igikorwa..."
                minHeight="500px"
              />
            </CardContent>
          </Card>

          {/* File Attachments */}
          <Card className="border-2 border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Shyira Amadosiye</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold">Kanda hano ushyire amadosiye</p>
                  <p className="text-sm text-gray-500 mt-2">PDF, DOCX, TXT, Images, ZIP (Max 50MB each)</p>
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl font-black"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                Tegereza...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Save className="w-6 h-6 mr-3" />
                Bika Igikorwa
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TeacherCreateAssignmentPage;
