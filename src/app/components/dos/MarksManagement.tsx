import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const MarksManagement: React.FC = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [availableLevels, setAvailableLevels] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const res = await fetch(`${API_BASE}/trades`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setTrades(data.trades || []);
    } catch (error) {
      toast.error('Failed to load trades');
    }
  };

  useEffect(() => {
    if (selectedTrade) {
      fetchLevels();
    }
  }, [selectedTrade]);

  const fetchLevels = async () => {
    try {
      const res = await fetch(`${API_BASE}/trades/${selectedTrade}/levels`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setAvailableLevels(data.levels || []);
    } catch (error) {
      toast.error('Failed to load levels');
    }
  };

  const fetchMarks = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/grades?trade_code=${selectedTrade}&level=${selectedLevel}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMarks(data.grades || []);
      toast.success(`Loaded ${data.grades?.length || 0} marks records`);
    } catch (error) {
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const exportMarksToExcel = async () => {
    if (!selectedTrade) {
      toast.error('Select a trade first');
      return;
    }
    
    setLoading(true);
    try {
      const levelsRes = await fetch(`${API_BASE}/trades/${selectedTrade}/levels`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const levelsData = await levelsRes.json();
      const dbLevels = levelsData.levels || [];
      
      const wb = XLSX.utils.book_new();
      
      for (const levelObj of dbLevels) {
        const levelStr = levelObj.level_suffix ? `${levelObj.level_number}${levelObj.level_suffix}` : String(levelObj.level_number);
        
        const marksRes = await fetch(`${API_BASE}/grades?trade_code=${selectedTrade}&level=${levelObj.level_number}${levelObj.level_suffix ? `&suffix=${levelObj.level_suffix}` : ''}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const marksData = await marksRes.json();
        const levelMarks = marksData.grades || [];
        
        if (levelMarks.length === 0) continue;
        
        const coursesRes = await fetch(`${API_BASE}/courses?trade_code=${selectedTrade}&level=${levelObj.level_number}${levelObj.level_suffix ? `&suffix=${levelObj.level_suffix}` : ''}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const coursesData = await coursesRes.json();
        const courses = coursesData.courses || [];
        
        const students = [...new Set(levelMarks.map((m: any) => m.student_code))];
        
        const wsData: any[][] = [
          ['GARDEN TVET SCHOOL - MARKS SHEET'],
          [`Trade: ${selectedTrade} | Level: ${levelStr}`],
          [`Total Students: ${students.length} | Total Courses: ${courses.length}`],
          []
        ];
        
        const headerRow = ['Student Code', 'Student Name'];
        courses.forEach((c: any) => {
          headerRow.push(`${c.course_code} CAT`, `${c.course_code} EXAM`, `${c.course_code} TOTAL`);
        });
        headerRow.push('AVERAGE', 'GRADE');
        wsData.push(headerRow);
        
        students.forEach(studentCode => {
          const studentMarks = levelMarks.filter((m: any) => m.student_code === studentCode);
          const firstMark = studentMarks[0];
          const row: any[] = [studentCode, `${firstMark?.first_name || ''} ${firstMark?.last_name || ''}`];
          
          let totalMarks = 0;
          let courseCount = 0;
          
          courses.forEach((course: any) => {
            const mark = studentMarks.find((m: any) => m.course_code === course.course_code);
            const cat = mark?.cat_marks || 0;
            const exam = mark?.exam_marks || 0;
            const total = cat + exam;
            
            row.push(cat, exam, total);
            totalMarks += total;
            courseCount++;
          });
          
          const average = courseCount > 0 ? (totalMarks / courseCount).toFixed(2) : 0;
          const grade = average >= 80 ? 'A' : average >= 70 ? 'B' : average >= 60 ? 'C' : average >= 50 ? 'D' : 'F';
          
          row.push(average, grade);
          wsData.push(row);
        });
        
        wsData.push([]);
        wsData.push(['STATISTICS']);
        wsData.push(['Total Students', students.length]);
        wsData.push(['Total Courses', courses.length]);
        wsData.push(['Pass Rate', `${((students.length - wsData.filter(r => r[r.length - 1] === 'F').length) / students.length * 100).toFixed(1)}%`]);
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        const avgCol = String.fromCharCode(65 + headerRow.length - 2);
        const lastRow = 5 + students.length;
        ws[`${avgCol}${lastRow}`] = { t: 'n', f: `AVERAGE(${avgCol}6:${avgCol}${lastRow - 1})` };
        
        const colWidths = [{ wch: 15 }, { wch: 25 }];
        courses.forEach(() => {
          colWidths.push({ wch: 10 }, { wch: 10 }, { wch: 10 });
        });
        colWidths.push({ wch: 12 }, { wch: 8 });
        ws['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(wb, ws, `Level ${levelStr}`);
      }
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Marks_${selectedTrade}_AllLevels.xlsx`);
      toast.success('Marks exported with formulas!');
    } catch (error) {
      toast.error('Failed to export marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="size-5" />Marks Management - Teacher Grades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-3 rounded-lg text-sm">
            <p className="font-semibold text-green-900">Real Marks from Teachers:</p>
            <p className="text-green-700">• Fetches all marks inserted by teachers from database</p>
            <p className="text-green-700">• Exports to Excel with formulas (AVERAGE, SUM)</p>
            <p className="text-green-700">• Includes CAT marks, Exam marks, Totals, Grades</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger><SelectValue placeholder="Select Trade" /></SelectTrigger>
              <SelectContent>
                {trades.map(t => <SelectItem key={t.trade_code} value={t.trade_code}>{t.trade_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
              <SelectContent>
                {availableLevels.map(level => {
                  const levelStr = level.level_suffix ? `${level.level_number}${level.level_suffix}` : String(level.level_number);
                  return <SelectItem key={levelStr} value={levelStr}>Level {levelStr}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Button onClick={fetchMarks} disabled={!selectedTrade || !selectedLevel || loading}>
              <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Load Marks
            </Button>
          </div>
          
          <Button onClick={exportMarksToExcel} disabled={!selectedTrade || loading} className="w-full bg-green-600 hover:bg-green-700">
            <Download className="size-4 mr-2" />Export All Levels to Excel (with Formulas)
          </Button>
        </CardContent>
      </Card>
      
      {marks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Marks Preview - {selectedTrade} Level {selectedLevel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="border p-2">Student</th>
                    <th className="border p-2">Course</th>
                    <th className="border p-2">CAT</th>
                    <th className="border p-2">Exam</th>
                    <th className="border p-2">Total</th>
                    <th className="border p-2">Grade</th>
                    <th className="border p-2">Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.slice(0, 50).map((mark, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border p-2">{mark.student_code}</td>
                      <td className="border p-2">{mark.course_code}</td>
                      <td className="border p-2 text-center">{mark.cat_marks || 0}/20</td>
                      <td className="border p-2 text-center">{mark.exam_marks || 0}/80</td>
                      <td className="border p-2 text-center font-bold">{(mark.cat_marks || 0) + (mark.exam_marks || 0)}/100</td>
                      <td className="border p-2 text-center font-bold">{mark.grade || '-'}</td>
                      <td className="border p-2">{mark.teacher_name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {marks.length > 50 && (
              <p className="text-sm text-muted-foreground mt-2">Showing 50 of {marks.length} records. Export to Excel for full data.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
