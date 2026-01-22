import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, Phone, Key, CheckCircle, AlertCircle, Search,
  UserPlus, Link as LinkIcon, Eye, RefreshCw
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { useAuth } from '@/app/contexts/AuthContext';

const API_BASE = 'http://localhost:5000/api';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_id: string;
  email: string;
  course_name: string;
  academic_year: string;
}

interface ParentCode {
  id: number;
  student_name: string;
  parent_phone: string;
  verification_code: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

interface ParentStudentLinkProps {
  onNavigate?: (page: string) => void;
}

const ParentStudentLink: React.FC<ParentStudentLinkProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('generate');
  const [students, setStudents] = useState<Student[]>([]);
  const [parentCodes, setParentCodes] = useState<ParentCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [parentPhone, setParentPhone] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [linkedStudent, setLinkedStudent] = useState<any>(null);

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/users?role=student&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.users);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch parent codes
  const fetchParentCodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/advanced/admin/parent-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setParentCodes(data.codes);
      }
    } catch (error) {
      console.error('Error fetching parent codes:', error);
    }
  };

  // Check if parent is already linked
  const checkParentLink = async () => {
    if (user?.role !== 'parent') return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/advanced/parent/my-student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLinkedStudent(data.student);
      }
    } catch (error) {
      console.error('Error checking parent link:', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'parent') {
      checkParentLink();
    } else {
      fetchStudents();
      fetchParentCodes();
    }
  }, [user]);

  const generateCode = async () => {
    if (!selectedStudent || !parentPhone) {
      alert('Please select a student and enter parent phone number');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/advanced/parent/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          parent_phone: parentPhone
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedCode(data.code);
        fetchParentCodes(); // Refresh the list
        alert(`Code generated successfully: ${data.code}\nSend this code to the parent via SMS or notification.`);
      } else {
        alert(data.message || 'Failed to generate code');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Error generating verification code');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      alert('Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/advanced/parent/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          verification_code: verificationCode,
          parent_id: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        setLinkedStudent(data.student);
        alert('Successfully linked to student!');
      } else {
        alert(data.message || 'Failed to verify code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('Error verifying code');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.includes(searchTerm) ||
    student.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Parent view
  if (user?.role === 'parent') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Portal</h1>
            <p className="text-gray-600">Link with your child to access their academic information</p>
          </motion.div>

          {linkedStudent ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Linked to Student
                </CardTitle>
                <CardDescription>
                  You are successfully linked to your child's account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Student Name</Label>
                      <p className="text-lg font-semibold">{linkedStudent.first_name} {linkedStudent.last_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Student ID</Label>
                      <p className="text-lg font-semibold">{linkedStudent.student_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Course</Label>
                      <p className="text-lg">{linkedStudent.course_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Academic Year</Label>
                      <p className="text-lg">{linkedStudent.academic_year}</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button onClick={() => onNavigate?.('dashboard')} className="w-full">
                      View Student Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-600" />
                  Link with Your Child
                </CardTitle>
                <CardDescription>
                  Enter the verification code sent to you by the school administration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <Input
                      id="verification-code"
                      placeholder="Enter 6-character code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  <Button
                    onClick={verifyCode}
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                    Link Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Admin/DOD view
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent-Student Linking System</h1>
          <p className="text-gray-600">Generate verification codes and manage parent-student relationships</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generate Code Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  Generate Verification Code
                </CardTitle>
                <CardDescription>
                  Create a verification code for parents to link with their children
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Search Student</Label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search by name, ID, or course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.slice(0, 10).map((student) => (
                          <TableRow
                            key={student.id}
                            className={selectedStudent?.id === student.id ? 'bg-blue-50' : ''}
                          >
                            <TableCell>{student.first_name} {student.last_name}</TableCell>
                            <TableCell>{student.student_id}</TableCell>
                            <TableCell>{student.course_name}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={selectedStudent?.id === student.id ? "default" : "outline"}
                                onClick={() => setSelectedStudent(student)}
                              >
                                {selectedStudent?.id === student.id ? <CheckCircle className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {selectedStudent && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold">Selected Student:</h4>
                      <p>{selectedStudent.first_name} {selectedStudent.last_name} ({selectedStudent.student_id})</p>
                      <p className="text-sm text-gray-600">{selectedStudent.course_name} - {selectedStudent.academic_year}</p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="parent-phone">Parent Phone Number</Label>
                    <Input
                      id="parent-phone"
                      placeholder="+250 XXX XXX XXX"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={generateCode}
                    disabled={loading || !selectedStudent || !parentPhone}
                    className="w-full"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                    Generate Verification Code
                  </Button>

                  {generatedCode && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Code Generated Successfully!</span>
                      </div>
                      <p className="text-2xl font-mono font-bold text-center text-green-700 mb-2">
                        {generatedCode}
                      </p>
                      <p className="text-sm text-green-600">
                        Send this code to the parent via SMS or notification. The code expires in 24 hours.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Codes History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Recent Codes
                </CardTitle>
                <CardDescription>
                  Recently generated verification codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {parentCodes.slice(0, 10).map((code) => (
                    <div key={code.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono font-bold text-lg">{code.verification_code}</span>
                        <Badge variant={code.is_used ? "secondary" : "default"}>
                          {code.is_used ? "Used" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{code.student_name}</p>
                      <p className="text-xs text-gray-500">{code.parent_phone}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(code.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchParentCodes}
                  className="w-full mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentStudentLink;
