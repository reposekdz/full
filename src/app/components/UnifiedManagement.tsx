import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Link as LinkIcon, CheckCircle2, XCircle, Clock, Shield, Search, Filter,
    TrendingUp, BarChart3, Activity, AlertTriangle, Download, RefreshCw, Eye,
    UserCheck, UserX, Zap, FileText, Calendar, ChevronLeft, ChevronRight,
    MessageSquare, Send, AlertOctagon, GraduationCap, UserMinus, UserPlus,
    Phone, Mail, MapPin, BookOpen, Award, ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Checkbox } from '@/app/components/ui/checkbox';
import apiService from '@/app/services/apiService';
import { toast } from 'sonner';

interface Trade {
    trade_code: string;
    trade_name: string;
}

interface Level {
    level_number: number;
}

interface Student {
    id: number;
    student_code: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    trade_code: string;
    trade_name: string;
    level_number: number;
    gender: string;
    phone?: string;
    email?: string;
    status: string;
    conduct_score?: number;
    attendance_percentage?: number;
    gpa?: number;
    linked_parents_count?: number;
}

interface LinkRequest {
    id: number;
    parent_id: number;
    parent_name: string;
    parent_phone: string;
    parent_email: string;
    student_name: string;
    trade?: string;
    level?: string;
    message?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    processed_by_name?: string;
    notes?: string;
}

interface ConductRecord {
    id: number;
    student_id: number;
    incident_type: string;
    severity: string;
    description: string;
    action_taken: string;
    points_deducted: number;
    incident_date: string;
    first_name?: string;
    last_name?: string;
}

interface Stats {
    students: {
        total_students: number;
        active_students: number;
        dropped_students: number;
        suspended_students: number;
        avg_conduct_score: number;
        avg_attendance: number;
    };
    parentLinks: {
        total_links: number;
        total_parents: number;
        total_students_linked: number;
    };
    pendingRequests: number;
    recentDodActions: any[];
    recentConduct: ConductRecord[];
}

type TabType = 'overview' | 'students' | 'linking' | 'conduct' | 'dod';

export default function UnifiedManagement() {
    // State
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<{ trades: Trade[]; levels: Level[] }>({ trades: [], levels: [] });
    const [stats, setStats] = useState<Stats | null>(null);
    
    // Students state
    const [students, setStudents] = useState<Student[]>([]);
    const [studentPage, setStudentPage] = useState(1);
    const [studentTotalPages, setStudentTotalPages] = useState(1);
    const [studentFilters, setStudentFilters] = useState({
        search: '',
        trade_code: '',
        level_number: ''
    });
    
    // Linking state
    const [linkRequests, setLinkRequests] = useState<LinkRequest[]>([]);
    const [linkPage, setLinkPage] = useState(1);
    const [linkTotalPages, setLinkTotalPages] = useState(1);
    const [linkStatusFilter, setLinkStatusFilter] = useState('pending');
    
    // Conduct state
    const [conductRecords, setConductRecords] = useState<ConductRecord[]>([]);
    const [selectedStudentConduct, setSelectedStudentConduct] = useState<Student | null>(null);
    
    // Dialogs
    const [showLinkStudentDialog, setShowLinkStudentDialog] = useState(false);
    const [showDropStudentDialog, setShowDropStudentDialog] = useState(false);
    const [showConductDialog, setShowConductDialog] = useState(false);
    const [showApproveLinkDialog, setShowApproveLinkDialog] = useState(false);
    const [showRejectLinkDialog, setShowRejectLinkDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LinkRequest | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    
    // Form data
    const [linkFormData, setLinkFormData] = useState({
        student_first_name: '',
        student_last_name: '',
        trade_code: '',
        level_number: '',
        relationship_type: 'Parent'
    });
    const [dropFormData, setDropFormData] = useState({
        reason: '',
        notes: '',
        send_sms: true
    });
    const [conductFormData, setConductFormData] = useState({
        incident_type: 'Discipline Issue',
        severity: 'moderate',
        description: '',
        action_taken: '',
        send_sms: true
    });
    const [notes, setNotes] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchConfig();
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'students') {
            fetchStudents();
        } else if (activeTab === 'linking') {
            fetchLinkRequests();
        }
    }, [activeTab, studentPage, studentFilters, linkPage, linkStatusFilter]);

    const fetchConfig = async () => {
        try {
            const response = await apiService.getUnifiedConfig();
            if (response.success) {
                setConfig(response.config);
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUnifiedDashboardStats();
            if (response.success) {
                setStats(response.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUnifiedStudents({
                ...studentFilters,
                page: studentPage,
                limit: 20
            });
            if (response.success) {
                setStudents(response.students);
                setStudentTotalPages(response.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const fetchLinkRequests = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUnifiedParentLinkRequests({
                status: linkStatusFilter,
                page: linkPage,
                limit: 20
            });
            if (response.success) {
                setLinkRequests(response.requests);
                setLinkTotalPages(Math.ceil(response.stats.total / 20) || 1);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchStudents = async () => {
        if (!searchQuery || searchQuery.length < 2) return;
        
        try {
            const response = await apiService.searchStudentsForLinking({
                query: searchQuery,
                trade_code: linkFormData.trade_code,
                level_number: linkFormData.level_number
            });
            if (response.success) {
                setSearchResults(response.students);
            }
        } catch (error) {
            console.error('Search failed:', error);
            toast.error('Search failed');
        }
    };

    const handleLinkStudent = async () => {
        if (!linkFormData.student_first_name || !linkFormData.student_last_name || !linkFormData.trade_code || !linkFormData.level_number) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setProcessing(true);
            const response = await apiService.linkStudentToParent({
                student_first_name: linkFormData.student_first_name,
                student_last_name: linkFormData.student_last_name,
                trade_code: linkFormData.trade_code,
                level_number: parseInt(linkFormData.level_number),
                relationship_type: linkFormData.relationship_type
            });

            if (response.success) {
                toast.success(response.message || 'Student linked successfully!');
                setShowLinkStudentDialog(false);
                setLinkFormData({
                    student_first_name: '',
                    student_last_name: '',
                    trade_code: '',
                    level_number: '',
                    relationship_type: 'Parent'
                });
                fetchStats();
            } else {
                toast.error(response.message || 'Failed to link student');
            }
        } catch (error: any) {
            console.error('Link error:', error);
            toast.error(error.response?.data?.message || 'Failed to link student');
        } finally {
            setProcessing(false);
        }
    };

    const handleDropStudent = async () => {
        if (!selectedStudent) return;

        try {
            setProcessing(true);
            const response = await apiService.dropStudent({
                student_id: selectedStudent.id,
                reason: dropFormData.reason,
                notes: dropFormData.notes,
                send_sms: dropFormData.send_sms
            });

            if (response.success) {
                toast.success(response.message || 'Student dropped successfully!');
                toast.info(`Parents notified: ${response.parentsNotified}`);
                setShowDropStudentDialog(false);
                setSelectedStudent(null);
                setDropFormData({ reason: '', notes: '', send_sms: true });
                fetchStats();
                fetchStudents();
            } else {
                toast.error(response.message || 'Failed to drop student');
            }
        } catch (error: any) {
            console.error('Drop error:', error);
            toast.error(error.response?.data?.message || 'Failed to drop student');
        } finally {
            setProcessing(false);
        }
    };

    const handleAddConduct = async () => {
        if (!selectedStudent) return;

        try {
            setProcessing(true);
            const response = await apiService.addConductRecord({
                student_id: selectedStudent.id,
                incident_type: conductFormData.incident_type,
                severity: conductFormData.severity,
                description: conductFormData.description,
                action_taken: conductFormData.action_taken,
                send_sms: conductFormData.send_sms
            });

            if (response.success) {
                toast.success('Conduct record added!');
                toast.info(`Parents notified: ${response.parentsNotified}`);
                setShowConductDialog(false);
                setSelectedStudent(null);
                setConductFormData({
                    incident_type: 'Discipline Issue',
                    severity: 'moderate',
                    description: '',
                    action_taken: '',
                    send_sms: true
                });
                fetchStats();
            } else {
                toast.error(response.message || 'Failed to add conduct record');
            }
        } catch (error: any) {
            console.error('Conduct error:', error);
            toast.error(error.response?.data?.message || 'Failed to add conduct record');
        } finally {
            setProcessing(false);
        }
    };

    const handleApproveLink = async () => {
        if (!selectedRequest || !selectedStudent) {
            toast.error('Please select a student');
            return;
        }

        try {
            setProcessing(true);
            const response = await apiService.approveParentLinkRequest({
                request_id: selectedRequest.id,
                student_id: selectedStudent.id,
                notes
            });

            if (response.success) {
                toast.success('Link approved!');
                setShowApproveLinkDialog(false);
                setSelectedRequest(null);
                setSelectedStudent(null);
                setNotes('');
                setSearchResults([]);
                setSearchQuery('');
                fetchLinkRequests();
                fetchStats();
            } else {
                toast.error(response.message || 'Failed to approve');
            }
        } catch (error: any) {
            console.error('Approve error:', error);
            toast.error(error.response?.data?.message || 'Failed to approve');
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectLink = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);
            const response = await apiService.rejectParentLinkRequest({
                request_id: selectedRequest.id,
                notes
            });

            if (response.success) {
                toast.success('Request rejected');
                setShowRejectLinkDialog(false);
                setSelectedRequest(null);
                setNotes('');
                fetchLinkRequests();
                fetchStats();
            } else {
                toast.error(response.message || 'Failed to reject');
            }
        } catch (error: any) {
            console.error('Reject error:', error);
            toast.error(error.response?.data?.message || 'Failed to reject');
        } finally {
            setProcessing(false);
        }
    };

    const openDropDialog = (student: Student) => {
        setSelectedStudent(student);
        setShowDropStudentDialog(true);
    };

    const openConductDialog = (student: Student) => {
        setSelectedStudent(student);
        setShowConductDialog(true);
    };

    const openApproveDialog = (request: LinkRequest) => {
        setSelectedRequest(request);
        setShowApproveLinkDialog(true);
    };

    const openRejectDialog = (request: LinkRequest) => {
        setSelectedRequest(request);
        setShowRejectLinkDialog(true);
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading unified management...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Unified Management System</h1>
                <p className="text-gray-600">Parent Linking • DOD Operations • Conduct Management</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'students', label: 'Students', icon: Users },
                    { id: 'linking', label: 'Parent Linking', icon: LinkIcon },
                    { id: 'conduct', label: 'Conduct', icon: ShieldAlert },
                    { id: 'dod', label: 'DOD Actions', icon: UserMinus }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Students</p>
                                        <p className="text-3xl font-bold">{stats.students.total_students || 0}</p>
                                    </div>
                                    <Users className="w-10 h-10 text-blue-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active Students</p>
                                        <p className="text-3xl font-bold text-green-600">{stats.students.active_students || 0}</p>
                                    </div>
                                    <UserCheck className="w-10 h-10 text-green-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Dropped Students</p>
                                        <p className="text-3xl font-bold text-red-600">{stats.students.dropped_students || 0}</p>
                                    </div>
                                    <UserMinus className="w-10 h-10 text-red-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Pending Links</p>
                                        <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests || 0}</p>
                                    </div>
                                    <LinkIcon className="w-10 h-10 text-orange-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Parent Links</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Links</span>
                                        <span className="font-bold">{stats.parentLinks.total_links || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Parents</span>
                                        <span className="font-bold">{stats.parentLinks.total_parents || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Students Linked</span>
                                        <span className="font-bold">{stats.parentLinks.total_students_linked || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Average Scores</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Conduct Score</span>
                                        <span className="font-bold">{Math.round(stats.students.avg_conduct_score || 0)}/40</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Attendance</span>
                                        <span className="font-bold">{Math.round(stats.students.avg_attendance || 0)}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent DOD Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.recentDodActions?.length > 0 ? (
                                    <div className="space-y-2">
                                        {stats.recentDodActions.slice(0, 5).map((action: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm">{action.action_type}</span>
                                                <span className="text-xs text-gray-500">{new Date(action.created_at).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No recent actions</p>
                                )}
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Conduct</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.recentConduct?.length > 0 ? (
                                    <div className="space-y-2">
                                        {stats.recentConduct.slice(0, 5).map((record: ConductRecord, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm">{record.first_name} {record.last_name}</span>
                                                <Badge variant={record.severity === 'severe' ? 'destructive' : 'outline'}>
                                                    {record.incident_type}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No recent conduct records</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-4">
                                <Input
                                    placeholder="Search students..."
                                    value={studentFilters.search}
                                    onChange={(e) => setStudentFilters({ ...studentFilters, search: e.target.value })}
                                    className="w-64"
                                />
                                <Select
                                    value={studentFilters.trade_code}
                                    onValueChange={(value) => setStudentFilters({ ...studentFilters, trade_code: value })}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Trade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Trades</SelectItem>
                                        {config.trades.map((trade) => (
                                            <SelectItem key={trade.trade_code} value={trade.trade_code}>
                                                {trade.trade_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={studentFilters.level_number}
                                    onValueChange={(value) => setStudentFilters({ ...studentFilters, level_number: value })}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Levels</SelectItem>
                                        {config.levels.map((level) => (
                                            <SelectItem key={level.level_number} value={String(level.level_number)}>
                                                Level {level.level_number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={() => setStudentPage(1)}>
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Students Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Students ({students.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {students.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No students found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2">Student</th>
                                                <th className="text-left p-2">Trade</th>
                                                <th className="text-left p-2">Level</th>
                                                <th className="text-left p-2">Status</th>
                                                <th className="text-left p-2">Conduct</th>
                                                <th className="text-left p-2">Parents</th>
                                                <th className="text-left p-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student) => (
                                                <tr key={student.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-2">
                                                        <div>
                                                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                                                            <p className="text-xs text-gray-500">{student.student_code}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-2">{student.trade_name}</td>
                                                    <td className="p-2">Level {student.level_number}</td>
                                                    <td className="p-2">
                                                        <Badge variant={student.status === 'active' ? 'default' : 'destructive'}>
                                                            {student.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2">
                                                        <span className={`font-bold ${
                                                            (student.conduct_score || 40) >= 36 ? 'text-green-600' :
                                                            (student.conduct_score || 40) >= 28 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                            {student.conduct_score || 40}/40
                                                        </span>
                                                    </td>
                                                    <td className="p-2">
                                                        <Badge variant="outline">
                                                            {student.linked_parents_count || 0}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openConductDialog(student)}
                                                            >
                                                                <ShieldAlert className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => openDropDialog(student)}
                                                                disabled={student.status !== 'active'}
                                                            >
                                                                <UserMinus className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            
                            {/* Pagination */}
                            {studentTotalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                                        disabled={studentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm">Page {studentPage} of {studentTotalPages}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setStudentPage(p => Math.min(studentTotalPages, p + 1))}
                                        disabled={studentPage === studentTotalPages}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Parent Linking Tab */}
            {activeTab === 'linking' && (
                <div className="space-y-6">
                    {/* Status Filter */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <Select value={linkStatusFilter} onValueChange={setLinkStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={() => setShowLinkStudentDialog(true)}>
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Link Student
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requests List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Link Requests ({linkRequests.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {linkRequests.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No requests found</p>
                            ) : (
                                <div className="space-y-4">
                                    {linkRequests.map((request) => (
                                        <div key={request.id} className={`border-2 rounded-lg p-4 ${
                                            request.status === 'pending' ? 'border-orange-200 bg-orange-50' :
                                            request.status === 'approved' ? 'border-green-200 bg-green-50' :
                                            'border-red-200 bg-red-50'
                                        }`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-bold">{request.parent_name}</span>
                                                        <Badge>{request.status}</Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3 h-3" />
                                                            {request.parent_phone}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3 h-3" />
                                                            {request.parent_email}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 p-2 bg-white rounded">
                                                        <p className="text-sm">Requested: {request.student_name}</p>
                                                        {request.trade && <p className="text-xs text-gray-500">Trade: {request.trade} | Level: {request.level}</p>}
                                                    </div>
                                                    {request.message && (
                                                        <p className="mt-2 text-sm text-gray-600">Message: {request.message}</p>
                                                    )}
                                                </div>
                                                {request.status === 'pending' && (
                                                    <div className="flex gap-2 ml-4">
                                                        <Button size="sm" onClick={() => openApproveDialog(request)}>
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => openRejectDialog(request)}>
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Conduct Tab */}
            {activeTab === 'conduct' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Conduct Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">Select a student from the Students tab to add conduct records.</p>
                            <Button onClick={() => setActiveTab('students')}>
                                <Users className="w-4 h-4 mr-2" />
                                Go to Students
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* DOD Actions Tab */}
            {activeTab === 'dod' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>DOD Operations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">Select a student from the Students tab to drop or perform DOD actions.</p>
                            <Button onClick={() => setActiveTab('students')}>
                                <Users className="w-4 h-4 mr-2" />
                                Go to Students
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Link Student Dialog */}
            <Dialog open={showLinkStudentDialog} onOpenChange={setShowLinkStudentDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Link Student to Your Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Student First Name</label>
                            <Input
                                value={linkFormData.student_first_name}
                                onChange={(e) => setLinkFormData({ ...linkFormData, student_first_name: e.target.value })}
                                placeholder="First name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Student Last Name</label>
                            <Input
                                value={linkFormData.student_last_name}
                                onChange={(e) => setLinkFormData({ ...linkFormData, student_last_name: e.target.value })}
                                placeholder="Last name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Trade</label>
                            <Select
                                value={linkFormData.trade_code}
                                onValueChange={(value) => setLinkFormData({ ...linkFormData, trade_code: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Trade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {config.trades.map((trade) => (
                                        <SelectItem key={trade.trade_code} value={trade.trade_code}>
                                            {trade.trade_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Level</label>
                            <Select
                                value={linkFormData.level_number}
                                onValueChange={(value) => setLinkFormData({ ...linkFormData, level_number: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {config.levels.map((level) => (
                                        <SelectItem key={level.level_number} value={String(level.level_number)}>
                                            Level {level.level_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Relationship</label>
                            <Select
                                value={linkFormData.relationship_type}
                                onValueChange={(value) => setLinkFormData({ ...linkFormData, relationship_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Parent">Parent</SelectItem>
                                    <SelectItem value="Guardian">Guardian</SelectItem>
                                    <SelectItem value="Sponsor">Sponsor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLinkStudentDialog(false)}>Cancel</Button>
                        <Button onClick={handleLinkStudent} disabled={processing}>
                            {processing ? 'Linking...' : 'Link Student'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Drop Student Dialog */}
            <Dialog open={showDropStudentDialog} onOpenChange={setShowDropStudentDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Drop Student (DOD)</DialogTitle>
                        <DialogDescription>
                            This will mark {selectedStudent?.first_name} {selectedStudent?.last_name} as dropped.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Reason</label>
                            <Input
                                value={dropFormData.reason}
                                onChange={(e) => setDropFormData({ ...dropFormData, reason: e.target.value })}
                                placeholder="Reason for dropping"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <textarea
                                className="w-full p-2 border rounded"
                                rows={3}
                                value={dropFormData.notes}
                                onChange={(e) => setDropFormData({ ...dropFormData, notes: e.target.value })}
                                placeholder="Additional notes..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="send_sms_drop"
                                checked={dropFormData.send_sms}
                                onCheckedChange={(checked) => setDropFormData({ ...dropFormData, send_sms: checked as boolean })}
                            />
                            <label htmlFor="send_sms_drop" className="text-sm">Send SMS notification to parents</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDropStudentDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDropStudent} disabled={processing}>
                            {processing ? 'Dropping...' : 'Drop Student'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Conduct Dialog */}
            <Dialog open={showConductDialog} onOpenChange={setShowConductDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Conduct Record</DialogTitle>
                        <DialogDescription>
                            Adding conduct record for {selectedStudent?.first_name} {selectedStudent?.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Incident Type</label>
                            <Select
                                value={conductFormData.incident_type}
                                onValueChange={(value) => setConductFormData({ ...conductFormData, incident_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Discipline Issue">Discipline Issue</SelectItem>
                                    <SelectItem value="Academic Misconduct">Academic Misconduct</SelectItem>
                                    <SelectItem value="Absence">Absence</SelectItem>
                                    <SelectItem value="Late Arrival">Late Arrival</SelectItem>
                                    <SelectItem value="Uniform Violation">Uniform Violation</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Severity</label>
                            <Select
                                value={conductFormData.severity}
                                onValueChange={(value) => setConductFormData({ ...conductFormData, severity: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minor">Minor (1 point)</SelectItem>
                                    <SelectItem value="moderate">Moderate (2 points)</SelectItem>
                                    <SelectItem value="major">Major (3 points)</SelectItem>
                                    <SelectItem value="severe">Severe (5 points)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                className="w-full p-2 border rounded"
                                rows={3}
                                value={conductFormData.description}
                                onChange={(e) => setConductFormData({ ...conductFormData, description: e.target.value })}
                                placeholder="Describe the incident..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="send_sms_conduct"
                                checked={conductFormData.send_sms}
                                onCheckedChange={(checked) => setConductFormData({ ...conductFormData, send_sms: checked as boolean })}
                            />
                            <label htmlFor="send_sms_conduct" className="text-sm">Send SMS notification to parents</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConductDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddConduct} disabled={processing}>
                            {processing ? 'Adding...' : 'Add Record'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Link Dialog */}
            <Dialog open={showApproveLinkDialog} onOpenChange={setShowApproveLinkDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Approve Link Request</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-medium">Parent: {selectedRequest.parent_name}</p>
                                <p className="text-sm text-gray-600">Requested: {selectedRequest.student_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Search Student</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search by name or code..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchStudents()}
                                    />
                                    <Button onClick={handleSearchStudents}>
                                        <Search className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            {searchResults.length > 0 && (
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {searchResults.map((student) => (
                                        <div
                                            key={student.id}
                                            onClick={() => setSelectedStudent(student)}
                                            className={`border-2 rounded-lg p-3 cursor-pointer ${
                                                selectedStudent?.id === student.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                                            <p className="text-sm text-gray-600">
                                                {student.student_code} | {student.trade_name} Level {student.level_number}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium">Notes</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Optional notes..."
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveLinkDialog(false)}>Cancel</Button>
                        <Button onClick={handleApproveLink} disabled={!selectedStudent || processing}>
                            {processing ? 'Approving...' : 'Approve & Link'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Link Dialog */}
            <Dialog open={showRejectLinkDialog} onOpenChange={setShowRejectLinkDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Link Request</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="bg-red-50 p-4 rounded">
                                <p className="font-medium">Parent: {selectedRequest.parent_name}</p>
                                <p className="text-sm text-gray-600">Requested: {selectedRequest.student_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Reason for Rejection</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Explain why..."
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectLinkDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRejectLink} disabled={processing}>
                            {processing ? 'Rejecting...' : 'Reject Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
