import React, { useState, useEffect, useRef, useMemo } from 'react';

import {
  Users, FileText, RefreshCw,
  Search, Download as DownloadIcon, Table as TableIcon, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';
import { GLOBAL_TRADES, getLevelsForTrade } from '@/app/constants/tradesAndLevels';
import * as XLSX from 'xlsx';
import { Input } from './ui/input';
import { Button } from './ui/button';



interface GlobalStudentSheetsProps {
  userRole: string;
}

const GlobalStudentSheets: React.FC<GlobalStudentSheetsProps> = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [formulaValue, setFormulaValue] = useState('');

  const [activeTrade, setActiveTrade] = useState('SOD');
  const [activeLevel, setActiveLevel] = useState<any>(null);
  const [markColumns, setMarkColumns] = useState<any[]>([]);

  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize trade and level
  useEffect(() => {
    const defaultTrade = GLOBAL_TRADES[0]?.code || 'SOD';
    setActiveTrade(defaultTrade);
    const levels = getLevelsForTrade(defaultTrade);
    if (levels.length > 0) setActiveLevel(levels[0]);
  }, []);

  useEffect(() => {
    if (activeTrade && activeLevel) {
      fetchSheetData();
    }
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
      console.error('Fetch Error:', error);
      toast.error('Failed to load spreadsheet data');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter(s => {
      const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
      const code = (s.student_code || s.student_id || '').toLowerCase();
      return fullName.includes(q) || code.includes(q);
    });
  }, [students, searchQuery]);

  const handleCellClick = (rowIdx: number, colId: string, value: any) => {
    setSelectedCell({ row: rowIdx, col: colId });
    setFormulaValue(String(value ?? ''));
  };

  const handleCellDoubleClick = (rowIdx: number, colId: string) => {
    setEditingCell({ row: rowIdx, col: colId });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell || editingCell) return;

    const { row, col } = selectedCell;
    const colOrder = ['student_name', 'student_code', ...markColumns.map(c => String(c.id)), 'total_marks', 'average_marks', 'payment_status'];
    const colIdx = colOrder.indexOf(col);

    switch (e.key) {
      case 'ArrowUp':
        if (row > 0) handleCellClick(row - 1, col, getCellValue(row - 1, col));
        e.preventDefault();
        break;
      case 'ArrowDown':
        if (row < students.length - 1) handleCellClick(row + 1, col, getCellValue(row + 1, col));
        e.preventDefault();
        break;
      case 'ArrowLeft':
        if (colIdx > 0) handleCellClick(row, colOrder[colIdx - 1], getCellValue(row, colOrder[colIdx - 1]));
        e.preventDefault();
        break;
      case 'ArrowRight':
        if (colIdx < colOrder.length - 1) handleCellClick(row, colOrder[colIdx + 1], getCellValue(row, colOrder[colIdx + 1]));
        e.preventDefault();
        break;
      case 'Enter':
        handleCellDoubleClick(row, col);
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  const getCellValue = (rowIdx: number, colId: string) => {
    const student = students[rowIdx];
    if (!student) return '';
    if (colId === 'student_name') return `${student.first_name} ${student.last_name}`;
    return student[colId] ?? '';
  };

  const handleSaveCell = async (studentId: number, colId: string, value: string) => {
    try {
      const res = await apiService.request('/global-student-sheets/save-marks', {
        method: 'POST',
        body: JSON.stringify({
          marks: [{
            student_id: studentId,
            column_id: colId,
            marks: parseFloat(value) || 0,
            academic_year: activeLevel.academic_year || '2024',
            term: activeLevel.term || 'Term 1'
          }]
        })
      });
      if (res.success) {
        setStudents(prev => prev.map(s => {
          if (s.id === studentId) {
            const updatedStudent = { ...s, [colId]: parseFloat(value) || 0 };

            // Recalculate total and average
            const total = markColumns.reduce((acc, col) => acc + (updatedStudent[col.id] || updatedStudent[`mark_${col.id}`] || 0), 0);
            const totalMax = markColumns.reduce((acc, col) => acc + (col.max_marks || 0), 0);

            updatedStudent.total_marks = total;
            updatedStudent.average_marks = totalMax > 0 ? (total / totalMax) * 100 : 0;

            return updatedStudent;
          }
          return s;
        }));
        toast.success('Agaciro kabitswe neza');
      }
    } catch (error) {
      toast.error('Byanze kubika agaciro');
    }
    setEditingCell(null);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students.map(s => ({
      'Student Name': `${s.first_name} ${s.last_name}`,
      'Code': s.student_code,
      ...markColumns.reduce((acc, mc) => ({ ...acc, [mc.column_name]: s[mc.id] || 0 }), {}),
      'Total': s.total_marks,
      'Average': s.average_marks,
      'Status': s.payment_status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTrade}_Level_${activeLevel.level_number}`);
    XLSX.writeFile(workbook, `Student_Sheet_${activeTrade}_L${activeLevel.level_number}.xlsx`);
    toast.success('Excel exported successfully');
  };

  // Conditional Formatting Utility
  const getCellStyles = (colId: string, value: any) => {
    if (colId === 'payment_status') {
      if (value === 'paid') return 'bg-emerald-100 text-emerald-800 font-bold';
      if (value === 'unpaid') return 'bg-rose-100 text-rose-800 font-bold';
      return 'bg-amber-100 text-amber-800 font-bold';
    }
    if (markColumns.some(c => String(c.id) === colId)) {
      const val = parseFloat(value);
      if (val < 50) return 'text-rose-600 font-medium';
      if (val >= 80) return 'text-emerald-600 font-bold';
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] select-none" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Top Professional Toolbar */}
      <div className="bg-white border-b border-gray-300 p-2 flex items-center justify-between gap-4 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            <TableIcon className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-900 tracking-tight">Advanced Student Excel</span>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-1" />

          {/* Trade Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            {GLOBAL_TRADES.map(trade => (
              <button
                key={trade.code}
                onClick={() => {
                  setActiveTrade(trade.code);
                  setActiveLevel(getLevelsForTrade(trade.code)[0]);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTrade === trade.code ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {trade.code}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-gray-200 mx-1" />

          {/* Level Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[400px] scrollbar-hide">
            {getLevelsForTrade(activeTrade).map(level => (
              <button
                key={level.id}
                onClick={() => setActiveLevel(level)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all whitespace-nowrap ${activeLevel?.id === level.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
              >
                {level.display}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-64 bg-white border-gray-300 focus:ring-blue-500 rounded-lg text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 border-gray-300 gap-2" onClick={handleExportExcel}>
            <DownloadIcon className="w-4 h-4" /> Export XLSX
          </Button>
          <Button variant="outline" size="sm" className="h-9 border-gray-300">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="bg-[#f3f3f3] border-b border-gray-300 p-1.5 flex items-center gap-2 z-20">
        <div className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded font-mono text-xs text-gray-500 min-w-[80px] shadow-inner">
          <span className="text-blue-600 font-bold">{selectedCell ? `${String.fromCharCode(65 + ['student_name', 'student_code', ...markColumns.map((c: any) => String(c.id))].indexOf(selectedCell.col))}${selectedCell.row + 1}` : ''}</span>
        </div>
        <div className="w-8 flex justify-center text-gray-400 font-serif italic text-sm">fx</div>
        <div className="flex-1 relative">
          <input
            type="text"
            className="w-full bg-white border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:border-blue-400 shadow-inner"
            value={formulaValue}
            onChange={(e) => setFormulaValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && selectedCell) {
                handleSaveCell(students[selectedCell.row].id, selectedCell.col, formulaValue);
              }
            }}
          />
        </div>
      </div>

      {/* Main Spreadsheet Grid */}
      <div className="flex-1 overflow-auto bg-gray-200 relative" ref={gridRef}>
        <table className="border-separate border-spacing-0 w-max min-w-full bg-white">
          <thead className="sticky top-0 z-10">
            {/* Column Labels (A, B, C...) */}
            <tr className="bg-[#f3f3f3]">
              <th className="w-10 border-b border-r border-gray-300 bg-[#e6e6e6]"></th>
              {['A', 'B', ...markColumns.map((_: any, i: number) => String.fromCharCode(67 + i)), 'X', 'Y', 'Z'].map((label: string, i: number) => (
                <th key={i} className="text-[10px] font-normal text-gray-500 border-b border-r border-gray-300 py-0.5 text-center min-w-[120px]">
                  {label}
                </th>
              ))}
            </tr>
            {/* Header Labels */}
            <tr className="bg-[#f3f3f3] shadow-sm">
              <th className="w-10 border-b border-r border-gray-300 bg-gray-100 flex items-center justify-center" rowSpan={2}>
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              </th>
              <th className="px-4 py-2 text-xs font-bold text-gray-700 border-b border-r border-gray-300 text-left sticky left-0 z-20 bg-gray-50 min-w-[200px]" rowSpan={2}>Student Name</th>
              <th className="px-4 py-2 text-xs font-bold text-gray-700 border-b border-r border-gray-300 text-left min-w-[120px]" rowSpan={2}>Student Code</th>
              {markColumns.map((col: any) => (
                <th key={col.id} className="px-4 py-1 text-[10px] font-bold text-blue-800 border-b border-r border-gray-300 text-center min-w-[120px] bg-blue-50/50">
                  {col.course_name || 'General'}
                </th>
              ))}
              <th className="px-4 py-2 text-xs font-bold text-blue-700 border-b border-r border-gray-300 text-center min-w-[100px] bg-blue-50/50" rowSpan={2}>Total</th>
              <th className="px-4 py-2 text-xs font-bold text-green-700 border-b border-r border-gray-300 text-center min-w-[100px] bg-green-50/30" rowSpan={2}>Average</th>
              <th className="px-4 py-2 text-xs font-bold text-gray-700 border-b border-r border-gray-300 text-center min-w-[120px]" rowSpan={2}>Status</th>
            </tr>
            <tr className="bg-[#f3f3f3]">
              {markColumns.map((col: any) => (
                <th key={`label-${col.id}`} className="px-4 py-1 text-[9px] font-medium text-gray-600 border-b border-r border-gray-300 text-center bg-white/50">
                  {col.column_label} (/{col.max_marks})
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="z-0">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={100} className="px-6 py-20 text-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                      <p className="text-gray-500 font-medium">Imbonerahamwe iri gutegurwa...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-400">Nta mibare yabonetse kuri iyi mbonerahamwe.</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : filteredStudents.map((student: any, rowIdx: number) => (
              <tr key={student.id} className="h-9 hover:bg-gray-50/50">
                {/* Row Number */}
                <td className="border-b border-r border-gray-200 bg-[#f3f3f3] text-[10px] text-gray-500 text-center font-medium sticky left-0 z-10 min-w-[40px]">
                  {rowIdx + 1}
                </td>

                {/* Student Name */}
                <td
                  onClick={() => handleCellClick(rowIdx, 'student_name', `${student.first_name} ${student.last_name}`)}
                  className={`px-4 py-2 border-b border-r border-gray-200 text-sm whitespace-nowrap cursor-cell transition-all ${selectedCell?.row === rowIdx && selectedCell?.col === 'student_name' ? 'ring-2 ring-blue-500 z-10 shadow-sm outline-none' : ''}`}
                >
                  {student.first_name} {student.last_name}
                </td>

                <td
                  onClick={() => handleCellClick(rowIdx, 'student_code', student.student_code)}
                  className={`px-4 py-2 border-b border-r border-gray-200 text-sm font-mono cursor-cell ${selectedCell?.row === rowIdx && selectedCell?.col === 'student_code' ? 'ring-2 ring-blue-500 z-10' : ''}`}
                >
                  {student.student_code}
                </td>

                {/* Mark Columns */}
                {markColumns.map(col => {
                  const val = student[col.id] || student[`mark_${col.id}`] || 0;
                  const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === String(col.id);
                  const isEditing = editingCell?.row === rowIdx && editingCell?.col === String(col.id);
                  const cellStyle = getCellStyles(String(col.id), val);

                  return (
                    <td
                      key={col.id}
                      onClick={() => handleCellClick(rowIdx, String(col.id), val)}
                      onDoubleClick={() => handleCellDoubleClick(rowIdx, String(col.id))}
                      className={`relative px-4 py-2 border-b border-r border-gray-200 text-sm text-center cursor-cell transition-all ${isSelected ? 'ring-2 ring-blue-500 z-10 bg-white' : ''} ${cellStyle}`}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          className="absolute inset-0 w-full h-full px-4 text-center outline-none ring-2 ring-blue-500 z-20 shadow-lg"
                          defaultValue={val}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleSaveCell(student.id, String(col.id), e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') handleSaveCell(student.id, String(col.id), e.currentTarget.value);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                        />
                      ) : (
                        val
                      )}
                    </td>
                  );
                })}

                <td className="px-4 py-2 border-b border-r border-gray-200 text-sm text-center font-bold text-blue-700 bg-blue-50/5 uppercase">
                  {student.total_marks || 0}
                </td>

                <td className="px-4 py-2 border-b border-r border-gray-200 text-sm text-center font-bold text-green-700 bg-green-50/5">
                  {(student.average_marks || 0).toFixed(1)}%
                </td>

                <td className={`px-4 py-2 border-b border-r border-gray-200 text-xs text-center uppercase tracking-wider ${getCellStyles('payment_status', student.payment_status)}`}>
                  {student.payment_status}
                </td>
              </tr>
            ))}
            {/* Blank Placeholder Rows */}
            {students.length > 0 && Array.from({ length: 20 }).map((_, i) => (
              <tr key={`blank-${i}`} className="h-9">
                <td className="border-b border-r border-gray-200 bg-[#f3f3f3] text-[10px] text-gray-500 text-center sticky left-0 z-10">{students.length + i + 1}</td>
                {Array.from({ length: 15 }).map((__, j) => (
                  <td key={`blank-cell-${j}`} className="border-b border-r border-gray-100 cursor-cell" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Status Bar */}
      <div className="bg-[#f3f3f3] border-t border-gray-300 px-4 py-1 flex items-center justify-between text-[11px] text-gray-600 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-600" />
            <span>Excel Sheet Ready</span>
          </div>
          <div className="h-3 w-px bg-gray-400" />
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{students.length} Records</span>
          </div>
          <div className="h-3 w-px bg-gray-400" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-blue-600 uppercase">{activeTrade}</span>
            <span className="text-gray-400">|</span>
            <span>{activeLevel?.display}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>Average:</span>
            <span className="font-bold text-gray-900 bg-white px-2 rounded border border-gray-300">
              {students.length > 0 ? (students.reduce((acc: number, s: any) => acc + (s.average_marks || 0), 0) / students.length).toFixed(2) : '0.00'}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`p-1 rounded hover:bg-gray-200 cursor-pointer ${loading ? 'animate-pulse' : ''}`}>
              <div className="w-3 h-3 border-2 border-green-600 rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalStudentSheets;