import React, { useState, useMemo } from 'react';
import {
    Search, Filter, Download, Upload, Plus, Edit, Trash2,
    DollarSign, TrendingUp, CheckCircle, AlertCircle, MoreVertical,
    ChevronDown, ChevronUp, X, Save, RefreshCw
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';

interface Student {
    id: number;
    student_id: string;
    student_code: string;
    first_name: string;
    last_name: string;
    gender: string;
    email: string;
    phone: string;
    trade_code: string;
    trade_name: string;
    level_number: number;
    gpa: number;
    attendance_percentage: number;
    total_fees: number;
    paid_amount: number;
    balance: number;
    payment_status: string;
    status: string;
    created_at: string;
}

interface AdvancedAccountantSheetProps {
    students: Student[];
    onRecordPayment?: (student: Student) => void;
    onViewDetails?: (student: Student) => void;
    loading?: boolean;
    onRefresh?: () => void;
}

export const AdvancedAccountantSheet: React.FC<AdvancedAccountantSheetProps> = ({
    students,
    onRecordPayment,
    onViewDetails,
    loading = false,
    onRefresh
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTrade, setFilterTrade] = useState<string>('');
    const [filterLevel, setFilterLevel] = useState<number | ''>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [sortField, setSortField] = useState<keyof Student>('student_code');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Get unique trades and levels for filters
    const trades = useMemo(() => [...new Set(students.map(s => s.trade_code).filter(Boolean))], [students]);
    const levels = useMemo(() => [...new Set(students.map(s => s.level_number).filter(Boolean))], [students]);

    // Filter and sort students
    const filteredStudents = useMemo(() => {
        return students
            .filter(student => {
                const matchesSearch = !searchTerm ||
                    student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.student_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.phone?.includes(searchTerm);
                const matchesTrade = !filterTrade || student.trade_code === filterTrade;
                const matchesLevel = !filterLevel || student.level_number === filterLevel;
                const matchesStatus = !filterStatus || student.payment_status === filterStatus;
                return matchesSearch && matchesTrade && matchesLevel && matchesStatus;
            })
            .sort((a, b) => {
                const aVal = a[sortField] ?? '';
                const bVal = b[sortField] ?? '';
                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [students, searchTerm, filterTrade, filterLevel, filterStatus, sortField, sortDirection]);

    // Calculate totals
    const totals = useMemo(() => {
        return {
            totalFees: filteredStudents.reduce((sum, s) => sum + (s.total_fees || 0), 0),
            totalPaid: filteredStudents.reduce((sum, s) => sum + (s.paid_amount || 0), 0),
            totalBalance: filteredStudents.reduce((sum, s) => sum + (s.balance || 0), 0),
            count: filteredStudents.length,
            paid: filteredStudents.filter(s => s.payment_status === 'paid').length,
            partial: filteredStudents.filter(s => s.payment_status === 'partial').length,
            unpaid: filteredStudents.filter(s => s.payment_status === 'unpaid').length,
        };
    }, [filteredStudents]);

    const handleSort = (field: keyof Student) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s.id));
        }
    };

    const handleSelectStudent = (id: number) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
            case 'partial':
                return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
            case 'unpaid':
                return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const exportToCSV = () => {
        const headers = ['Student Code', 'First Name', 'Last Name', 'Trade', 'Level', 'Total Fees', 'Paid', 'Balance', 'Status'];
        const rows = filteredStudents.map(s => [
            s.student_code, s.first_name, s.last_name, s.trade_code, s.level_number,
            s.total_fees, s.paid_amount, s.balance, s.payment_status
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accountant-students-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const SortIcon = ({ field }: { field: keyof Student }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading student data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Total Fees</p>
                            <p className="text-lg font-bold text-green-700">{formatCurrency(totals.totalFees)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                </Card>

                <Card className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Total Paid</p>
                            <p className="text-lg font-bold text-blue-700">{formatCurrency(totals.totalPaid)}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                    </div>
                </Card>

                <Card className="p-3 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Total Balance</p>
                            <p className="text-lg font-bold text-red-700">{formatCurrency(totals.totalBalance)}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                </Card>

                <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Students</p>
                            <p className="text-lg font-bold text-purple-700">{totals.count}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                </Card>

                <Card className="p-3 bg-gradient-to-br from-green-50 to-teal-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Fully Paid</p>
                            <p className="text-lg font-bold text-green-700">{totals.paid}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">With Balance</p>
                            <p className="text-lg font-bold text-yellow-700">{totals.partial + totals.unpaid}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search by name, code, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:w-auto"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {(filterTrade || filterLevel || filterStatus) && (
                            <Badge className="ml-2 bg-green-500">Active</Badge>
                        )}
                    </Button>

                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>

                    {onRefresh && (
                        <Button variant="outline" onClick={onRefresh}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    )}
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Trade</label>
                            <select
                                value={filterTrade}
                                onChange={(e) => setFilterTrade(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">All Trades</option>
                                {trades.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Level</label>
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value ? parseInt(e.target.value) : '')}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">All Levels</option>
                                {levels.map(l => (
                                    <option key={l} value={l}>Level {l}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                    </div>
                )}
            </Card>

            {/* Data Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded"
                                    />
                                </th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('student_code')}
                                >
                                    <div className="flex items-center gap-1">
                                        Code <SortIcon field="student_code" />
                                    </div>
                                </th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('first_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Name <SortIcon field="first_name" />
                                    </div>
                                </th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('trade_code')}
                                >
                                    <div className="flex items-center gap-1">
                                        Trade <SortIcon field="trade_code" />
                                    </div>
                                </th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('level_number')}
                                >
                                    <div className="flex items-center gap-1">
                                        Level <SortIcon field="level_number" />
                                    </div>
                                </th>
                                <th className="p-3 text-right">Total Fees</th>
                                <th className="p-3 text-right">Paid</th>
                                <th className="p-3 text-right">Balance</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-gray-500">
                                        No students found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                    >
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(student.id)}
                                                onChange={() => handleSelectStudent(student.id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="p-3 font-mono text-xs">{student.student_code}</td>
                                        <td className="p-3">
                                            <div>
                                                <div className="font-medium">{student.first_name} {student.last_name}</div>
                                                <div className="text-xs text-gray-500">{student.phone}</div>
                                            </div>
                                        </td>
                                        <td className="p-3">{student.trade_code}</td>
                                        <td className="p-3">Level {student.level_number}</td>
                                        <td className="p-3 text-right font-medium">{formatCurrency(student.total_fees)}</td>
                                        <td className="p-3 text-right text-green-600">{formatCurrency(student.paid_amount)}</td>
                                        <td className={`p-3 text-right font-medium ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(student.balance)}
                                        </td>
                                        <td className="p-3 text-center">
                                            {getPaymentStatusBadge(student.payment_status)}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {onRecordPayment && student.balance > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onRecordPayment(student)}
                                                        className="text-xs"
                                                    >
                                                        <DollarSign className="w-3 h-3 mr-1" />
                                                        Pay
                                                    </Button>
                                                )}
                                                {onViewDetails && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => onViewDetails(student)}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Info */}
                <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {filteredStudents.length} of {students.length} students
                        {selectedStudents.length > 0 && (
                            <span className="ml-2 text-blue-600">
                                ({selectedStudents.length} selected)
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdvancedAccountantSheet;
