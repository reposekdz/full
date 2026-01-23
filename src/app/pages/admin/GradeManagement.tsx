import React, { useState, useEffect } from 'react';
import { Award, Plus, Filter } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';

const AdminGradeManagement: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    class_id: '',
    assessment_type: 'test',
    assessment_name: '',
    obtained_marks: 0,
    max_marks: 100,
    assessment_date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/grades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setGrades(data.grades);
      }
    } catch (error) {
      toast.error('Failed to load grades');
    }
  };

  const handleAddGrade = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Grade added successfully');
        setShowAddDialog(false);
        loadGrades();
      }
    } catch (error) {
      toast.error('Failed to add grade');
    }
  };

  const getPercentage = (obtained: number, max: number) => {
    return ((obtained / max) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-600" />
              Grade Management
            </h1>
            <p className="text-gray-600 mt-1">Manage student grades and assessments</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grades List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{grade.student_name}</p>
                        <p className="text-sm text-gray-500">{grade.student_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{grade.subject_name}</TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline">{grade.assessment_type}</Badge>
                        <p className="text-sm mt-1">{grade.assessment_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {grade.obtained_marks}/{grade.max_marks}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        parseFloat(getPercentage(grade.obtained_marks, grade.max_marks)) >= 70 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {getPercentage(grade.obtained_marks, grade.max_marks)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(grade.assessment_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Grade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Assessment Type</Label>
              <Select value={formData.assessment_type} onValueChange={(value) => setFormData({ ...formData, assessment_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assessment Name</Label>
              <Input
                value={formData.assessment_name}
                onChange={(e) => setFormData({ ...formData, assessment_name: e.target.value })}
                placeholder="e.g., Midterm Exam"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Obtained Marks</Label>
                <Input
                  type="number"
                  value={formData.obtained_marks}
                  onChange={(e) => setFormData({ ...formData, obtained_marks: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Max Marks</Label>
                <Input
                  type="number"
                  value={formData.max_marks}
                  onChange={(e) => setFormData({ ...formData, max_marks: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Assessment Date</Label>
              <Input
                type="date"
                value={formData.assessment_date}
                onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddGrade}>Add Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGradeManagement;
