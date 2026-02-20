import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';
import { GLOBAL_TRADES, getLevelsForTrade } from '@/app/constants/tradesAndLevels';

const GlobalStudentSheetsSimple: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [activeTrade, setActiveTrade] = useState('SOD');
  const [activeLevel, setActiveLevel] = useState<any>(null);
  const [markColumns, setMarkColumns] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const defaultTrade = GLOBAL_TRADES[0]?.code || 'SOD';
    setActiveTrade(defaultTrade);
    const levels = getLevelsForTrade(defaultTrade);
    if (levels.length > 0) setActiveLevel(levels[0]);
  }, []);

  useEffect(() => {
    if (activeTrade && activeLevel) fetchSheetData();
  }, [activeTrade, activeLevel]);

  const fetchSheetData = async () => {
    setLoading(true);
    try {
      const levelNum = activeLevel.level_number;
      const suffix = activeLevel.level_suffix || '';
      const [studentsRes, columnsRes] = await Promise.all([
        apiService.request(`/student-management/sheets/${activeTrade}/${levelNum}?level_suffix=${suffix}`),
        apiService.request(`/global-student-sheets/columns?trade=${activeTrade}&level=${levelNum}`)
      ]);
      if (studentsRes.success) setStudents(studentsRes.students || []);
      if (columnsRes.success) setMarkColumns(columnsRes.columns || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (student: any) => {
    const total = markColumns.reduce((sum, col) => sum + (parseFloat(student[col.id]) || 0), 0);
    const totalMax = markColumns.reduce((sum, col) => sum + (col.max_marks || 0), 0);
    const average = totalMax > 0 ? (total / totalMax) * 100 : 0;
    return { total, average };
  };

  const handleCellClick = (rowIdx: number, colId: string) => {
    setEditingCell({ row: rowIdx, col: colId });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveCell = async (studentId: number, colId: string, value: string) => {
    try {
      if (colId === 'first_name' || colId === 'last_name' || colId === 'student_code') {
        const res = await apiService.request('/global-student-sheets/update-student', {
          method: 'PUT',
          body: JSON.stringify({ student_id: studentId, [colId]: value })
        });
        if (res.success) {
          setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [colId]: value } : s));
          toast.success('Saved');
        }
      } else {
        const res = await apiService.request('/global-student-sheets/save-marks', {
          method: 'POST',
          body: JSON.stringify({
            marks: [{
              student_id: studentId,
              column_id: colId,
              marks: parseFloat(value) || 0,
              academic_year: activeLevel?.academic_year || '2024',
              term: activeLevel?.term || 'Term 1'
            }]
          })
        });
        if (res.success) {
          setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
              const updated = { ...s, [colId]: parseFloat(value) || 0 };
              const { total, average } = calculateTotals(updated);
              updated.total_marks = total;
              updated.average_marks = average;
              return updated;
            }
            return s;
          }));
          toast.success('Saved');
        }
      }
    } catch (error) {
      toast.error('Failed to save');
    }
    setEditingCell(null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-white border-b p-4 flex gap-4">
        <div className="flex gap-2">
          {GLOBAL_TRADES.map(trade => (
            <button
              key={trade.code}
              onClick={() => {
                setActiveTrade(trade.code);
                setActiveLevel(getLevelsForTrade(trade.code)[0]);
              }}
              className={`px-4 py-2 rounded ${activeTrade === trade.code ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              {trade.code}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {getLevelsForTrade(activeTrade).map(level => (
            <button
              key={level.id}
              onClick={() => setActiveLevel(level)}
              className={`px-3 py-2 rounded text-sm ${activeLevel?.id === level.id ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              {level.display}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-blue-50">
            <tr>
              <th className="border p-2 text-sm">#</th>
              <th className="border p-2 text-sm">First Name</th>
              <th className="border p-2 text-sm">Last Name</th>
              <th className="border p-2 text-sm">Code</th>
              {markColumns.map(col => (
                <th key={col.id} className="border p-2 text-sm">{col.course_name}<br/><span className="text-xs">Max: {col.max_marks}</span></th>
              ))}
              <th className="border p-2 text-sm bg-blue-100">Total</th>
              <th className="border p-2 text-sm bg-green-100">Average %</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={100} className="text-center py-8">Loading...</td></tr>
            ) : students.map((student, rowIdx) => (
              <tr key={student.id} className="hover:bg-blue-50">
                <td className="border p-2 text-center text-sm">{rowIdx + 1}</td>
                <td
                  onClick={() => handleCellClick(rowIdx, 'first_name')}
                  className="border p-2 cursor-cell"
                >
                  {editingCell?.row === rowIdx && editingCell?.col === 'first_name' ? (
                    <input
                      ref={inputRef}
                      className="w-full p-1 border-2 border-blue-500"
                      defaultValue={student.first_name}
                      onBlur={(e) => handleSaveCell(student.id, 'first_name', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveCell(student.id, 'first_name', e.currentTarget.value);
                        if (e.key === 'Escape') setEditingCell(null);
                      }}
                    />
                  ) : student.first_name}
                </td>
                <td
                  onClick={() => handleCellClick(rowIdx, 'last_name')}
                  className="border p-2 cursor-cell"
                >
                  {editingCell?.row === rowIdx && editingCell?.col === 'last_name' ? (
                    <input
                      ref={inputRef}
                      className="w-full p-1 border-2 border-blue-500"
                      defaultValue={student.last_name}
                      onBlur={(e) => handleSaveCell(student.id, 'last_name', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveCell(student.id, 'last_name', e.currentTarget.value);
                        if (e.key === 'Escape') setEditingCell(null);
                      }}
                    />
                  ) : student.last_name}
                </td>
                <td
                  onClick={() => handleCellClick(rowIdx, 'student_code')}
                  className="border p-2 cursor-cell"
                >
                  {editingCell?.row === rowIdx && editingCell?.col === 'student_code' ? (
                    <input
                      ref={inputRef}
                      className="w-full p-1 border-2 border-blue-500"
                      defaultValue={student.student_code}
                      onBlur={(e) => handleSaveCell(student.id, 'student_code', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveCell(student.id, 'student_code', e.currentTarget.value);
                        if (e.key === 'Escape') setEditingCell(null);
                      }}
                    />
                  ) : student.student_code}
                </td>
                {markColumns.map(col => {
                  const val = student[col.id] || 0;
                  const isEditing = editingCell?.row === rowIdx && editingCell?.col === String(col.id);
                  return (
                    <td
                      key={col.id}
                      onClick={() => handleCellClick(rowIdx, String(col.id))}
                      className="border p-2 text-center cursor-cell"
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="number"
                          className="w-full p-1 border-2 border-blue-500 text-center"
                          defaultValue={val}
                          onBlur={(e) => handleSaveCell(student.id, String(col.id), e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveCell(student.id, String(col.id), e.currentTarget.value);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                        />
                      ) : val}
                    </td>
                  );
                })}
                <td className="border p-2 text-center font-bold text-blue-700 bg-blue-50">
                  {calculateTotals(student).total.toFixed(1)}
                </td>
                <td className="border p-2 text-center font-bold text-green-700 bg-green-50">
                  {calculateTotals(student).average.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalStudentSheetsSimple;
