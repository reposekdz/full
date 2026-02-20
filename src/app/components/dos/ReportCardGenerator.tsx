import React, { useState, useEffect } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const ReportCardGenerator: React.FC = () => {
  const [studentCode, setStudentCode] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReportCard = async () => {
    if (!studentCode.trim()) {
      toast.error('Enter student code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/grades/report-card/${studentCode}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setReportData(data.report);
        toast.success('Report card loaded!');
      } else {
        toast.error(data.message || 'Student not found');
      }
    } catch (error) {
      toast.error('Failed to load report card');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;
    
    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [
      ['GARDEN TVET SCHOOL'],
      ['STUDENT REPORT CARD'],
      [],
      ['Student Name:', `${reportData.student.first_name} ${reportData.student.last_name}`],
      ['Student Code:', reportData.student.student_code],
      ['Trade:', reportData.student.trade_name],
      ['Level:', reportData.student.level_number],
      [],
      ['Course Code', 'Course Name', 'CAT (/20)', 'Exam (/80)', 'Total (/100)', 'Grade', 'Points']
    ];
    
    let totalMarks = 0;
    let totalCourses = 0;
    
    reportData.grades.forEach((grade: any) => {
      const total = (grade.cat_marks || 0) + (grade.exam_marks || 0);
      totalMarks += total;
      totalCourses++;
      wsData.push([
        grade.course_code,
        grade.course_name,
        grade.cat_marks || 0,
        grade.exam_marks || 0,
        total,
        grade.grade || '-',
        grade.points || 0
      ]);
    });
    
    const average = totalCourses > 0 ? (totalMarks / totalCourses).toFixed(2) : 0;
    
    wsData.push([]);
    wsData.push(['', '', '', 'AVERAGE:', average, '', '']);
    wsData.push(['', '', '', 'TOTAL COURSES:', totalCourses, '', '']);
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add formulas
    const lastRow = wsData.length;
    ws[`E${lastRow - 1}`] = { t: 'n', f: `AVERAGE(E10:E${lastRow - 3})` };
    
    ws['!cols'] = [
      { wch: 12 }, { wch: 30 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 8 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Report Card');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `ReportCard_${studentCode}.xlsx`);
    toast.success('Report card exported with formulas!');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="size-5" />Report Card Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter student code..."
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchReportCard()}
            />
            <Button onClick={fetchReportCard} disabled={loading}>
              <Search className="size-4 mr-2" />Search
            </Button>
          </div>
          
          {reportData && (
            <Button onClick={exportToExcel} className="w-full bg-green-600 hover:bg-green-700">
              <Download className="size-4 mr-2" />Export to Excel with Formulas
            </Button>
          )}
        </CardContent>
      </Card>
      
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>
              {reportData.student.first_name} {reportData.student.last_name} - {reportData.student.student_code}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border p-2">Course</th>
                    <th className="border p-2">CAT</th>
                    <th className="border p-2">Exam</th>
                    <th className="border p-2">Total</th>
                    <th className="border p-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.grades.map((grade: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border p-2">{grade.course_name}</td>
                      <td className="border p-2 text-center">{grade.cat_marks || 0}/20</td>
                      <td className="border p-2 text-center">{grade.exam_marks || 0}/80</td>
                      <td className="border p-2 text-center font-bold">
                        {(grade.cat_marks || 0) + (grade.exam_marks || 0)}/100
                      </td>
                      <td className="border p-2 text-center font-bold">{grade.grade || '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td className="border p-2">AVERAGE</td>
                    <td className="border p-2" colSpan={2}></td>
                    <td className="border p-2 text-center">
                      {(reportData.grades.reduce((sum: number, g: any) => sum + (g.cat_marks || 0) + (g.exam_marks || 0), 0) / reportData.grades.length).toFixed(2)}%
                    </td>
                    <td className="border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
