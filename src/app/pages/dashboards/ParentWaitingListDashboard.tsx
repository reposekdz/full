import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Link as LinkIcon, CheckCircle2, XCircle, Clock, Shield, Search, Filter,
    TrendingUp, BarChart3, Activity, AlertTriangle, Download, RefreshCw, Eye,
    UserCheck, UserX, Zap, FileText, Calendar, ChevronLeft, ChevronRight,
    MessageSquare, Phone, Mail, Bell, GraduationCap, BookOpen, DollarSign,
    CalendarDays, Award, ClipboardList, Send, Image, File, Video, Mic,
    Check, X, AlertCircle, Info, Clock3, CheckCircle, ArrowRight, Star,
    ShieldCheck, ActivitySquare, TrendingDown, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import apiService from '@/app/services/apiService';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

interface LinkedChild {
    id: number;
    student_id: string;
    student_name: string;
    trade_code: string;
    trade_name: string;
    level: number;
    level_suffix: string;
    photo_url?: string;
    gender: string;
    date_of_birth: string;
    academic_year: string;
    status: 'active' | 'inactive' | 'graduated';
    linked_at: string;
    access_granted: boolean;
}

interface LinkingRequest {
    id: number;
    student_id: string;
    student_name: string;
    student_photo?: string;
    trade_code: string;
    trade_name: string;
    level: number;
    relationship: string;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    requested_at: string;
    processed_at?: string;
    processed_by?: string;
    rejection_reason?: string;
    notes?: string;
    priority: 'normal' | 'high' | 'urgent';
}

interface Message {
    id: number;
    type: 'system' | 'staff' | 'notification';
    subject: string;
    content: string;
    timestamp: string;
    read: boolean;
    priority: 'normal' | 'high' | 'urgent';
    attachments?: { name: string; url: string; type: string }[];
}

interface ChildGrade {
    subject: string;
    score: number;
    max_score: number;
    grade: string;
    rank: number;
    total_students: number;
    term: string;
    trend: 'up' | 'down' | 'stable';
}

interface ChildAttendance {
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    marked_by?: string;
    notes?: string;
}

interface ChildFee {
    id: number;
    description: string;
    amount: number;
    paid_amount: number;
    due_date: string;
    status: 'paid' | 'unpaid' | 'partial' | 'overdue';
    academic_year: string;
    semester: string;
}

interface ChildExam {
    id: number;
    subject: string;
    date: string;
    time: string;
    venue: string;
    status: 'upcoming' | 'completed' | 'results_released';
    score?: number;
    grade?: string;
}

export default function ParentWaitingListDashboard() {
    const [activeTab, setActiveTab] = useState('waiting-list');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data states
    const [linkingRequests, setLinkingRequests] = useState<LinkingRequest[]>([]);
    const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);
    const [childGrades, setChildGrades] = useState<ChildGrade[]>([]);
    const [childAttendance, setChildAttendance] = useState<ChildAttendance[]>([]);
    const [childFees, setChildFees] = useState<ChildFee[]>([]);
    const [childExams, setChildExams] = useState<ChildExam[]>([]);

    // Stats
    const [stats, setStats] = useState({
        pending_requests: 0,
        approved_requests: 0,
        rejected_requests: 0,
        total_children: 0,
        unread_messages: 0,
        total_fees_due: 0,
        average_attendance: 0
    });

    // Modal states
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [showChildDetailsModal, setShowChildDetailsModal] = useState(false);
    const [showMessageDetailModal, setShowMessageDetailModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [composeMessage, setComposeMessage] = useState({
        subject: '',
        content: '',
        priority: 'normal' as 'normal' | 'high' | 'urgent'
    });

    // Pagination
    const [requestsPage, setRequestsPage] = useState(1);
    const [messagesPage, setMessagesPage] = useState(1);
    const [totalRequestsPages, setTotalRequestsPages] = useState(1);
    const [totalMessagesPages, setTotalMessagesPages] = useState(1);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [requestsData, childrenData, messagesData, statsData] = await Promise.all([
                apiService.getPendingParentLinkRequests({ page: 1, limit: 20 }),
                apiService.getParentChildren({
                    includeGrades: true,
                    includeAttendance: true,
                    includeFees: true
                }),
                apiService.getParentMessages({ page: 1, limit: 20, isRead: false }),
                apiService.getParentQuickStats()
            ]);

            if (requestsData.success) {
                setLinkingRequests(requestsData.data || []);
                setTotalRequestsPages(requestsData.pagination?.pages || 1);
            }

            if (childrenData.success) {
                setLinkedChildren(childrenData.children || []);
                setStats(prev => ({ ...prev, total_children: childrenData.children?.length || 0 }));
            }

            if (messagesData.success) {
                setMessages(messagesData.messages || []);
                setStats(prev => ({ ...prev, unread_messages: messagesData.unread_count || 0 }));
            }

            if (statsData.success) {
                setStats(prev => ({
                    ...prev,
                    pending_requests: statsData.pending_count || 0,
                    approved_requests: statsData.approved_count || 0,
                    rejected_requests: statsData.rejected_count || 0,
                    total_fees_due: statsData.total_fees_due || 0,
                    average_attendance: statsData.average_attendance || 0
                }));
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChildDetails = async (child: LinkedChild) => {
        try {
            setSelectedChild(child);
            setShowChildDetailsModal(true);

            const [gradesData, attendanceData, feesData, examsData] = await Promise.all([
                apiService.getParentStudentGrades(Number(child.student_id) || child.id, {
                    includeRank: true,
                    includeComparison: true,
                    semester: 'current'
                }),
                apiService.getParentStudentAttendance(Number(child.student_id) || child.id, {
                    includeDetails: true,
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                }),
                apiService.getParentStudentFees(Number(child.student_id) || child.id, {
                    includeHistory: true,
                    status: 'unpaid'
                }),
                apiService.getParentStudentExams(Number(child.student_id) || child.id, {
                    status: 'upcoming'
                })
            ]);

            if (gradesData.success) setChildGrades(gradesData.grades || []);
            if (attendanceData.success) setChildAttendance(attendanceData.records || []);
            if (feesData.success) setChildFees(feesData.fees || []);
            if (examsData.success) setChildExams(examsData.exams || []);
        } catch (error) {
            console.error('Failed to fetch child details:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    const handleSendMessage = async () => {
        try {
            const response = await apiService.sendParentCommunication({
                subject: composeMessage.subject,
                content: composeMessage.content,
                priority: composeMessage.priority,
                type: 'outgoing'
            });

            if (response.success) {
                setShowComposeModal(false);
                setComposeMessage({ subject: '', content: '', priority: 'normal' });
                alert('Message sent successfully!');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message');
        }
    };

    const handleMarkMessageRead = async (messageId: number) => {
        try {
            await apiService.markNotificationAsRead(messageId);
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, read: true } : m
            ));
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
    };

    const viewMessageDetail = (message: Message) => {
        setSelectedMessage(message);
        setShowMessageDetailModal(true);
        if (!message.read) {
            handleMarkMessageRead(message.id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'approved': return 'bg-green-500';
            case 'rejected': return 'bg-red-500';
            case 'expired': return 'bg-gray-500';
            default: return 'bg-blue-500';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return <Zap className="w-4 h-4 text-red-500" />;
            case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            default: return <Clock3 className="w-4 h-4 text-gray-500" />;
        }
    };

    const filteredRequests = statusFilter === 'all'
        ? linkingRequests
        : linkingRequests.filter(r => r.status === statusFilter);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const calculateGradeColor = (grade: string) => {
        const gradeColors: Record<string, string> = {
            'A': 'bg-green-500',
            'B': 'bg-blue-500',
            'C': 'bg-yellow-500',
            'D': 'bg-orange-500',
            'F': 'bg-red-500'
        };
        return gradeColors[grade.charAt(0)] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">Loading your dashboard...</p>
                    <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Users className="w-8 h-8" />
                                Parent Portal
                            </h1>
                            <p className="text-blue-100 mt-1">Manage your linking requests and view your children's progress</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                onClick={handleRefresh}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                className="bg-white text-blue-600 hover:bg-blue-50"
                                onClick={() => setShowComposeModal(true)}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact School
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto -mt-6 px-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pending Requests</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending_requests}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Linked Children</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.total_children}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Unread Messages</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.unread_messages}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Fees Due</p>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_fees_due)}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 pb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-white shadow-md p-1 mb-6">
                        <TabsTrigger value="waiting-list" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Waiting List
                            {stats.pending_requests > 0 && (
                                <Badge variant="destructive" className="ml-1">{stats.pending_requests}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="children" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            My Children
                            <Badge className="ml-1 bg-green-500">{stats.total_children}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="messages" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Messages
                            {stats.unread_messages > 0 && (
                                <Badge variant="destructive" className="ml-1">{stats.unread_messages}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="fees" className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Fees & Payments
                        </TabsTrigger>
                    </TabsList>

                    {/* Waiting List Tab */}
                    <TabsContent value="waiting-list">
                        <Card className="shadow-lg border-0">
                            <CardHeader className="border-b pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <LinkIcon className="w-5 h-5 text-blue-600" />
                                            Linking Requests Status
                                        </CardTitle>
                                        <CardDescription>Track your child linking requests</CardDescription>
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {filteredRequests.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-600">No Linking Requests</h3>
                                        <p className="text-gray-500 mt-1">You haven't submitted any linking requests yet.</p>
                                        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                                            <LinkIcon className="w-4 h-4 mr-2" />
                                            Request New Link
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredRequests.map((request, index) => (
                                            <motion.div
                                                key={request.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-gradient-to-r from-gray-50 to-white border rounded-xl p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <Avatar className="w-14 h-14">
                                                            <AvatarImage src={request.student_photo} />
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                                                {request.student_name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-lg">{request.student_name}</h3>
                                                                {getPriorityIcon(request.priority)}
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                {request.trade_name} - Level {request.level}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                                <span className="text-gray-500">
                                                                    <strong>Relationship:</strong> {request.relationship}
                                                                </span>
                                                                <span className="text-gray-500">
                                                                    <strong>Requested:</strong> {formatDate(request.requested_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge className={`${getStatusColor(request.status)} text-white`}>
                                                            {request.status.toUpperCase()}
                                                        </Badge>
                                                        {request.status === 'rejected' && request.rejection_reason && (
                                                            <p className="text-xs text-red-500 mt-2 max-w-xs">
                                                                Reason: {request.rejection_reason}
                                                            </p>
                                                        )}
                                                        {request.status === 'approved' && (
                                                            <Button
                                                                size="sm"
                                                                className="mt-2 bg-green-600 hover:bg-green-700"
                                                                onClick={() => {
                                                                    const child = linkedChildren.find(c => c.student_id === request.student_id);
                                                                    if (child) fetchChildDetails(child);
                                                                }}
                                                            >
                                                                View Details
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {request.status === 'pending' && (
                                                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Clock className="w-4 h-4" />
                                                            <span>Your request is being reviewed by school administration</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* My Children Tab */}
                    <TabsContent value="children">
                        <Card className="shadow-lg border-0">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-green-600" />
                                    My Children
                                </CardTitle>
                                <CardDescription>View detailed information about your linked children</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {linkedChildren.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-600">No Linked Children</h3>
                                        <p className="text-gray-500 mt-1">Once your linking requests are approved, your children will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {linkedChildren.map((child, index) => (
                                            <motion.div
                                                key={child.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-gradient-to-br from-white to-blue-50 border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                                onClick={() => fetchChildDetails(child)}
                                            >
                                                <div className="text-center">
                                                    <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-blue-100">
                                                        <AvatarImage src={child.photo_url} />
                                                        <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                                                            {child.student_name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <h3 className="font-bold text-lg">{child.student_name}</h3>
                                                    <p className="text-sm text-gray-500">{child.student_id}</p>
                                                    <Badge className="mt-2 bg-green-100 text-green-700">
                                                        {child.trade_name} - Level {child.level}{child.level_suffix}
                                                    </Badge>

                                                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-sm">
                                                        <div className="text-center">
                                                            <p className="text-gray-500">Academic Year</p>
                                                            <p className="font-semibold">{child.academic_year}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-gray-500">Status</p>
                                                            <Badge className={child.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                                                                {child.status}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Full Details
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Messages Tab */}
                    <TabsContent value="messages">
                        <Card className="shadow-lg border-0">
                            <CardHeader className="border-b pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-purple-600" />
                                            Messages & Notifications
                                        </CardTitle>
                                        <CardDescription>Stay updated with school communications</CardDescription>
                                    </div>
                                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowComposeModal(true)}>
                                        <Send className="w-4 h-4 mr-2" />
                                        Compose
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-600">No Messages</h3>
                                        <p className="text-gray-500 mt-1">You don't have any messages yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.map((message, index) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${!message.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                                    }`}
                                                onClick={() => viewMessageDetail(message)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'system' ? 'bg-blue-100' :
                                                            message.type === 'staff' ? 'bg-purple-100' : 'bg-gray-100'
                                                            }`}>
                                                            {message.type === 'system' ? <Shield className="w-5 h-5 text-blue-600" /> :
                                                                message.type === 'staff' ? <UserCheck className="w-5 h-5 text-purple-600" /> :
                                                                    <Bell className="w-5 h-5 text-gray-600" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`font-semibold ${!message.read ? 'text-blue-900' : 'text-gray-900'}`}>
                                                                    {message.subject}
                                                                </h4>
                                                                {getPriorityIcon(message.priority)}
                                                                {!message.read && (
                                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500 line-clamp-1">{message.content}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{formatDate(message.timestamp)}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Fees Tab */}
                    <TabsContent value="fees">
                        <Card className="shadow-lg border-0">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    Fees & Payments
                                </CardTitle>
                                <CardDescription>View and manage your children's school fees</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-12">
                                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-600">Fees Overview</h3>
                                    <p className="text-gray-500 mt-1">Select a child to view their fees</p>
                                    <div className="mt-6 flex justify-center gap-4">
                                        {linkedChildren.slice(0, 3).map(child => (
                                            <Button
                                                key={child.id}
                                                variant="outline"
                                                onClick={() => fetchChildDetails(child)}
                                            >
                                                {child.student_name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Compose Message Modal */}
            <Dialog open={showComposeModal} onOpenChange={setShowComposeModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            Contact School Administration
                        </DialogTitle>
                        <DialogDescription>
                            Send a message to the school staff regarding your child or linking requests.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">Subject</label>
                            <Input
                                placeholder="Enter message subject"
                                value={composeMessage.subject}
                                onChange={(e) => setComposeMessage(prev => ({ ...prev, subject: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <Select
                                value={composeMessage.priority}
                                onValueChange={(value: 'normal' | 'high' | 'urgent') =>
                                    setComposeMessage(prev => ({ ...prev, priority: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Message</label>
                            <Textarea
                                placeholder="Type your message here..."
                                className="min-h-[150px]"
                                value={composeMessage.content}
                                onChange={(e) => setComposeMessage(prev => ({ ...prev, content: e.target.value }))}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Image className="w-4 h-4 mr-1" />
                                Add Image
                            </Button>
                            <Button variant="outline" size="sm">
                                <File className="w-4 h-4 mr-1" />
                                Add File
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowComposeModal(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSendMessage}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Child Details Modal */}
            <Dialog open={showChildDetailsModal} onOpenChange={setShowChildDetailsModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-green-600" />
                            {selectedChild?.student_name} - Full Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedChild && (
                        <div className="space-y-6">
                            {/* Student Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={selectedChild.photo_url} />
                                        <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                                            {selectedChild.student_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedChild.student_name}</h3>
                                        <p className="text-gray-500">{selectedChild.student_id}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge>{selectedChild.trade_name}</Badge>
                                            <Badge variant="outline">Level {selectedChild.level}{selectedChild.level_suffix}</Badge>
                                            <Badge className="bg-green-100 text-green-700">{selectedChild.status}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Tabs defaultValue="grades">
                                <TabsList className="w-full">
                                    <TabsTrigger value="grades" className="flex-1">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Grades
                                    </TabsTrigger>
                                    <TabsTrigger value="attendance" className="flex-1">
                                        <CalendarDays className="w-4 h-4 mr-2" />
                                        Attendance
                                    </TabsTrigger>
                                    <TabsTrigger value="fees" className="flex-1">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Fees
                                    </TabsTrigger>
                                    <TabsTrigger value="exams" className="flex-1">
                                        <ClipboardList className="w-4 h-4 mr-2" />
                                        Exams
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="grades" className="mt-4">
                                    {childGrades.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">No grades available</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {childGrades.map((grade, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <BookOpen className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <p className="font-medium">{grade.subject}</p>
                                                            <p className="text-sm text-gray-500">{grade.term}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="font-bold">{grade.score}/{grade.max_score}</p>
                                                            <p className="text-sm text-gray-500">Rank: {grade.rank}/{grade.total_students}</p>
                                                        </div>
                                                        <Badge className={`${calculateGradeColor(grade.grade)} text-white`}>
                                                            {grade.grade}
                                                        </Badge>
                                                        {grade.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> :
                                                            grade.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-500" /> :
                                                                <Activity className="w-4 h-4 text-gray-500" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="attendance" className="mt-4">
                                    {childAttendance.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">No attendance records available</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {childAttendance.slice(0, 10).map((record, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <CalendarDays className="w-5 h-5 text-gray-500" />
                                                        <p className="font-medium">{record.date}</p>
                                                    </div>
                                                    <Badge className={
                                                        record.status === 'present' ? 'bg-green-500' :
                                                            record.status === 'absent' ? 'bg-red-500' :
                                                                record.status === 'late' ? 'bg-yellow-500' : 'bg-gray-500'
                                                    }>
                                                        {record.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="fees" className="mt-4">
                                    {childFees.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">No pending fees</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {childFees.map((fee, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{fee.description}</p>
                                                        <p className="text-sm text-gray-500">{fee.academic_year} - {fee.semester}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold">{formatCurrency(fee.amount - fee.paid_amount)}</p>
                                                        <Badge className={
                                                            fee.status === 'paid' ? 'bg-green-500' :
                                                                fee.status === 'unpaid' ? 'bg-red-500' :
                                                                    fee.status === 'partial' ? 'bg-yellow-500' : 'bg-orange-500'
                                                        }>
                                                            {fee.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="exams" className="mt-4">
                                    {childExams.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">No upcoming exams</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {childExams.map((exam, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{exam.subject}</p>
                                                        <p className="text-sm text-gray-500">{exam.date} at {exam.time}</p>
                                                        <p className="text-sm text-gray-500">Venue: {exam.venue}</p>
                                                    </div>
                                                    <Badge className="bg-blue-500">
                                                        {exam.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Message Detail Modal */}
            <Dialog open={showMessageDetailModal} onOpenChange={setShowMessageDetailModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedMessage?.type === 'system' && <Shield className="w-5 h-5 text-blue-600" />}
                            {selectedMessage?.type === 'staff' && <UserCheck className="w-5 h-5 text-purple-600" />}
                            {selectedMessage?.type === 'notification' && <Bell className="w-5 h-5 text-gray-600" />}
                            {selectedMessage?.subject}
                        </DialogTitle>
                        <p className="text-sm text-gray-500">{selectedMessage && formatDate(selectedMessage.timestamp)}</p>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
                        </div>
                        {selectedMessage?.attachments && selectedMessage.attachments.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Attachments:</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMessage.attachments.map((attachment, index) => (
                                        <Button key={index} variant="outline" size="sm">
                                            <File className="w-4 h-4 mr-1" />
                                            {attachment.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMessageDetailModal(false)}>Close</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                            setShowMessageDetailModal(false);
                            setShowComposeModal(true);
                            setComposeMessage(prev => ({
                                ...prev,
                                subject: `Re: ${selectedMessage?.subject}`
                            }));
                        }}>
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Reply({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="9 17 4 12 9 7"></polyline>
            <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
        </svg>
    );
}
