import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Link as LinkIcon, CheckCircle2, XCircle, Clock, Shield, Search, Filter,
    TrendingUp, BarChart3, Activity, AlertTriangle, Download, RefreshCw, Eye,
    UserCheck, UserX, Zap, FileText, Calendar, ChevronLeft, ChevronRight,
    MessageSquare, Send, AlertOctagon, GraduationCap, UserMinus, UserPlus,
    Phone, Mail, MapPin, BookOpen, Award, ShieldAlert, CreditCard, LogIn,
    Loader2, Check, AlertCircle, ArrowRight, User, Building, PhoneCall
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Label } from '@/app/components/ui/label';
import apiService from '@/app/services/apiService';
import { toast } from 'sonner';

interface Trade {
    trade_code: string;
    trade_name: string;
}

interface LinkedStudent {
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
    relationship_type?: string;
    linked_at?: string;
    can_view_marks?: number;
    can_view_attendance?: number;
    can_view_report_cards?: number;
    can_view_discipline?: number;
}

interface Application {
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

interface StudentDetail {
    id: number;
    student_code: string;
    first_name: string;
    last_name: string;
    trade_name: string;
    level_number: number;
    gender: string;
    phone: string;
    email: string;
    status: string;
    gpa: number;
    attendance_percentage: number;
    conduct_score: number;
    conduct_grade: string;
    academic_year: string;
}

type ApplyStep = 'info' | 'student' | 'contact' | 'review' | 'success';

export default function ParentPortalAdvanced() {
    const [activeTab, setActiveTab] = useState<'apply' | 'status' | 'children'>('apply');
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<{ trades: Trade[]; levels: number[] }>({ trades: [], levels: [] });
    const [applications, setApplications] = useState<Application[]>([]);
    const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
    const [stats, setStats] = useState<{
        totalApplications: number;
        pending: number;
        approved: number;
        rejected: number;
        linkedStudents: number;
    } | null>(null);
    
    // Multi-step form state
    const [showApplyDialog, setShowApplyDialog] = useState(false);
    const [currentStep, setCurrentStep] = useState<ApplyStep>('info');
    const [applying, setApplying] = useState(false);
    const [searchResults, setSearchResults] = useState<LinkedStudent[]>([]);
    const [searching, setSearching] = useState(false);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    
    const [applyFormData, setApplyFormData] = useState({
        // Step 1: Parent Info
        parent_name: '',
        parent_phone: '',
        parent_relationship: 'Parent',
        
        // Step 2: Student Info
        student_first_name: '',
        student_last_name: '',
        student_code: '',
        trade_code: '',
        level_number: '',
        
        // Step 3: Additional
        additional_info: '',
        agree_terms: false
    });
    
    // Selected child detail
    const [selectedChild, setSelectedChild] = useState<LinkedStudent | null>(null);
    const [childDetail, setChildDetail] = useState<StudentDetail | null>(null);
    const [childLoading, setChildLoading] = useState(false);

    useEffect(() => {
        fetchConfig();
        fetchParentData();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await apiService.getUnifiedConfig();
            if (response.success) {
                setConfig({
                    trades: response.config.trades,
                    levels: response.config.levels
                });
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
        }
    };

    const fetchParentData = async () => {
        try {
            setLoading(true);
            const response = await apiService.getParentApplications();
            if (response.success) {
                setApplications(response.applications || []);
                setLinkedStudents(response.linkedStudents || []);
                setStats(response.stats);
                
                if (response.linkedStudents && response.linkedStudents.length > 0) {
                    setActiveTab('children');
                } else if (response.applications && response.applications.some((a: Application) => a.status === 'pending')) {
                    setActiveTab('status');
                }
            }
        } catch (error) {
            console.error('Failed to fetch parent data:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchStudents = async () => {
        if (!studentSearchQuery || studentSearchQuery.length < 2) return;
        
        try {
            setSearching(true);
            const response = await apiService.searchStudentsForLinking({
                query: studentSearchQuery,
                trade_code: applyFormData.trade_code,
                level_number: applyFormData.level_number
            });
            if (response.success) {
                setSearchResults(response.students || []);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleNextStep = () => {
        const steps: ApplyStep[] = ['info', 'student', 'contact', 'review', 'success'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handlePrevStep = () => {
        const steps: ApplyStep[] = ['info', 'student', 'contact', 'review', 'success'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    const handleApply = async () => {
        if (!applyFormData.student_first_name || !applyFormData.student_last_name || 
            !applyFormData.trade_code || !applyFormData.level_number) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setApplying(true);
            const response = await apiService.parentApplyForLink({
                student_first_name: applyFormData.student_first_name,
                student_last_name: applyFormData.student_last_name,
                trade_code: applyFormData.trade_code,
                level_number: parseInt(applyFormData.level_number),
                relationship_type: applyFormData.parent_relationship,
                student_code: applyFormData.student_code,
                parent_phone: applyFormData.parent_phone,
                additional_info: applyFormData.additional_info
            });

            if (response.success) {
                setCurrentStep('success');
                toast.success(response.message);
                setTimeout(() => {
                    setShowApplyDialog(false);
                    setActiveTab('status');
                    fetchParentData();
                    // Reset form
                    setCurrentStep('info');
                    setApplyFormData({
                        parent_name: '',
                        parent_phone: '',
                        parent_relationship: 'Parent',
                        student_first_name: '',
                        student_last_name: '',
                        student_code: '',
                        trade_code: '',
                        level_number: '',
                        additional_info: '',
                        agree_terms: false
                    });
                }, 3000);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Apply error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    const viewChildDetails = async (student: LinkedStudent) => {
        try {
            setSelectedChild(student);
            setChildLoading(true);
            
            const response = await apiService.getUnifiedStudent(student.id);
            if (response.success) {
                setChildDetail(response.student);
            }
        } catch (error) {
            console.error('Failed to fetch child details:', error);
            toast.error('Failed to load student details');
        } finally {
            setChildLoading(false);
        }
    };

    const pendingApplications = applications.filter(a => a.status === 'pending');
    const approvedApplications = applications.filter(a => a.status === 'approved');

    const steps = [
        { id: 'info', title: 'Your Info', icon: User },
        { id: 'student', title: 'Child Info', icon: GraduationCap },
        { id: 'contact', title: 'Contact', icon: PhoneCall },
        { id: 'review', title: 'Review', icon: CheckCircle2 },
        { id: 'success', title: 'Done', icon: Check }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading parent portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Parent Portal</h1>
                <p className="text-gray-600">Connect with your child's academic information</p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="apply" className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Apply to Link
                    </TabsTrigger>
                    <TabsTrigger value="status" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Application Status
                        {pendingApplications.length > 0 && (
                            <Badge variant="destructive" className="ml-1">
                                {pendingApplications.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="children" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        My Children
                        {linkedStudents.length > 0 && (
                            <Badge className="ml-1 bg-green-500">
                                {linkedStudents.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Apply Tab */}
                <TabsContent value="apply">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apply to Link with Your Child</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <div className="mb-6">
                                    <LinkIcon className="w-16 h-16 mx-auto text-blue-500 opacity-50" />
                                    <h3 className="mt-4 text-xl font-semibold">Connect with Your Child</h3>
                                    <p className="text-gray-600 mt-2">
                                        Apply to link with your child's academic account to receive updates and view their progress.
                                    </p>
                                </div>
                                
                                <Button 
                                    onClick={() => setShowApplyDialog(true)}
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Start Application
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Status Tab */}
                <TabsContent value="status">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                        <span className="font-semibold">Pending</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600 mt-1">{stats?.pending || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold">Approved</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{stats?.approved || 0}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        <span className="font-semibold">Rejected</span>
                                    </div>
                                    <p className="text-2xl font-bold text-red-600 mt-1">{stats?.rejected || 0}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold">Linked</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.linkedStudents || 0}</p>
                                </div>
                            </div>

                            {/* Pending Applications - Show waiting state */}
                            {pendingApplications.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Your Applications</h3>
                                    {pendingApplications.map((app) => (
                                        <div key={app.id} className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="w-5 h-5 text-orange-600" />
                                                        <Badge className="bg-orange-500">Awaiting Review</Badge>
                                                    </div>
                                                    <p className="font-semibold">{app.student_name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Trade: {app.trade} | Level: {app.level}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Submitted: {new Date(app.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 p-3 bg-white rounded">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                                    <p>
                                                        ⏳ Your application is being reviewed by school staff. 
                                                        You will receive an SMS notification once approved.
                                                    </p>
                                                </div>
                                                
                                                {/* Progress indicator */}
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Review Progress</span>
                                                        <span>In Progress...</span>
                                                    </div>
                                                    <Progress value={65} className="h-2" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>No pending applications</p>
                                    {linkedStudents.length === 0 && (
                                        <Button 
                                            onClick={() => setActiveTab('apply')} 
                                            className="mt-4"
                                        >
                                            Apply Now
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Rejected */}
                            {applications.filter(a => a.status === 'rejected').length > 0 && (
                                <div className="mt-6 space-y-4">
                                    {applications.filter(a => a.status === 'rejected').map((app) => (
                                        <div key={app.id} className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                <Badge className="bg-red-500">Application Not Approved</Badge>
                                            </div>
                                            <p className="font-semibold">{app.student_name}</p>
                                            {app.notes && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Reason: {app.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Children Tab */}
                <TabsContent value="children">
                    {linkedStudents.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">My Children ({linkedStudents.length})</h2>
                                <Button onClick={fetchParentData} variant="outline" size="sm">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {linkedStudents.map((student) => (
                                    <Card key={student.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">
                                                    {student.first_name} {student.last_name}
                                                </CardTitle>
                                                <Badge className="bg-green-500">Active</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <GraduationCap className="w-4 h-4 text-gray-500" />
                                                    <span>{student.trade_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <BookOpen className="w-4 h-4 text-gray-500" />
                                                    <span>Level {student.level_number}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Award className="w-4 h-4 text-gray-500" />
                                                    <span>GPA: {student.gpa || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span>Attendance: {student.attendance_percentage || 0}%</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Shield 
                                                        className={`w-4 h-4 ${
                                                            (student.conduct_score || 40) >= 36 ? 'text-green-500' :
                                                            (student.conduct_score || 40) >= 28 ? 'text-yellow-500' :
                                                            'text-red-500'
                                                        }`} 
                                                    />
                                                    <span className={
                                                        (student.conduct_score || 40) >= 36 ? 'text-green-600' :
                                                        (student.conduct_score || 40) >= 28 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }>
                                                        Conduct: {student.conduct_score || 40}/40
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <Button 
                                                onClick={() => viewChildDetails(student)}
                                                className="w-full mt-4"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Full Details
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600">No Children Linked</h3>
                                <p className="text-gray-500 mt-2">
                                    You don't have any children linked to your account yet.
                                </p>
                                <Button 
                                    onClick={() => setActiveTab('apply')} 
                                    className="mt-4"
                                >
                                    Apply to Link
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Multi-Step Application Dialog */}
            <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Apply to Link with Your Child</DialogTitle>
                        <DialogDescription>
                            Complete the form below to connect with your child's academic account
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Step Indicator */}
                    <div className="mb-6">
                        <div className="flex justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        index <= currentStepIndex 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {index < currentStepIndex ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className="text-xs mt-1 hidden md:block">{step.title}</span>
                                </div>
                            ))}
                        </div>
                        <Progress value={(currentStepIndex / (steps.length - 1)) * 100} className="mt-2" />
                    </div>

                    <div className="min-h-[300px]">
                        {/* Step 1: Parent Info */}
                        {currentStep === 'info' && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Step 1: Your Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Your Name *</Label>
                                        <Input
                                            value={applyFormData.parent_name}
                                            onChange={(e) => setApplyFormData({ ...applyFormData, parent_name: e.target.value })}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <Label>Relationship *</Label>
                                        <Select
                                            value={applyFormData.parent_relationship}
                                            onValueChange={(value) => setApplyFormData({ ...applyFormData, parent_relationship: value })}
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
                            </div>
                        )}

                        {/* Step 2: Student Info */}
                        {currentStep === 'student' && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Step 2: Child's Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Child's First Name *</Label>
                                        <Input
                                            value={applyFormData.student_first_name}
                                            onChange={(e) => setApplyFormData({ ...applyFormData, student_first_name: e.target.value })}
                                            placeholder="First name"
                                        />
                                    </div>
                                    <div>
                                        <Label>Child's Last Name *</Label>
                                        <Input
                                            value={applyFormData.student_last_name}
                                            onChange={(e) => setApplyFormData({ ...applyFormData, student_last_name: e.target.value })}
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Trade/Course *</Label>
                                        <Select
                                            value={applyFormData.trade_code}
                                            onValueChange={(value) => setApplyFormData({ ...applyFormData, trade_code: value })}
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
                                        <Label>Level *</Label>
                                        <Select
                                            value={applyFormData.level_number}
                                            onValueChange={(value) => setApplyFormData({ ...applyFormData, level_number: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {config.levels.map((level) => (
                                                    <SelectItem key={level} value={String(level)}>
                                                        Level {level}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label>Student ID (Optional)</Label>
                                    <Input
                                        value={applyFormData.student_code}
                                        onChange={(e) => setApplyFormData({ ...applyFormData, student_code: e.target.value })}
                                        placeholder="If you know it"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact */}
                        {currentStep === 'contact' && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Step 3: Contact Information</h3>
                                <div>
                                    <Label>Phone Number *</Label>
                                    <Input
                                        value={applyFormData.parent_phone}
                                        onChange={(e) => setApplyFormData({ ...applyFormData, parent_phone: e.target.value })}
                                        placeholder="e.g., 0781234567"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        You will receive SMS notifications about your application status
                                    </p>
                                </div>
                                <div>
                                    <Label>Additional Information</Label>
                                    <textarea
                                        className="w-full p-2 border rounded"
                                        rows={3}
                                        value={applyFormData.additional_info}
                                        onChange={(e) => setApplyFormData({ ...applyFormData, additional_info: e.target.value })}
                                        placeholder="Any additional details that might help..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 'review' && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Step 4: Review Your Application</h3>
                                <div className="bg-gray-50 p-4 rounded space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Parent Name</p>
                                            <p className="font-medium">{applyFormData.parent_name || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Relationship</p>
                                            <p className="font-medium">{applyFormData.parent_relationship}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium">{applyFormData.parent_phone || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Child's Name</p>
                                            <p className="font-medium">{applyFormData.student_first_name} {applyFormData.student_last_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Trade</p>
                                            <p className="font-medium">{applyFormData.trade_code}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Level</p>
                                            <p className="font-medium">Level {applyFormData.level_number}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={applyFormData.agree_terms}
                                        onChange={(e) => setApplyFormData({ ...applyFormData, agree_terms: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <Label htmlFor="terms" className="text-sm">
                                        I confirm that the information provided is accurate
                                    </Label>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Success */}
                        {currentStep === 'success' && (
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <Check className="w-10 h-10 text-green-600" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-green-600">Application Submitted!</h3>
                                <p className="text-gray-600 mt-2">
                                    Your application has been submitted successfully.
                                </p>
                                <p className="text-sm text-gray-500 mt-4">
                                    The school staff will review your application and you will receive an SMS notification once it's approved.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {currentStep !== 'success' && (
                            <>
                                {currentStepIndex > 0 && (
                                    <Button variant="outline" onClick={handlePrevStep}>
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                )}
                                {currentStepIndex < steps.length - 2 ? (
                                    <Button onClick={handleNextStep}>
                                        Next
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={handleApply} 
                                        disabled={applying || !applyFormData.agree_terms}
                                    >
                                        {applying ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Submit Application
                                            </>
                                        )}
                                    </Button>
                                )}
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Child Detail Dialog */}
            <Dialog open={!!selectedChild} onOpenChange={(open) => !open && setSelectedChild(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {childDetail?.first_name} {childDetail?.last_name} - Full Details
                        </DialogTitle>
                    </DialogHeader>
                    {childLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : childDetail ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded">
                                    <p className="text-xs text-gray-500">Student Code</p>
                                    <p className="font-semibold">{childDetail.student_code}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <p className="text-xs text-gray-500">Status</p>
                                    <Badge className="bg-green-500">{childDetail.status}</Badge>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <p className="text-xs text-gray-500">Trade</p>
                                    <p className="font-semibold">{childDetail.trade_name}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <p className="text-xs text-gray-500">Level</p>
                                    <p className="font-semibold">Level {childDetail.level_number}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Academic Performance</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-3 rounded text-center">
                                        <GraduationCap className="w-6 h-6 mx-auto text-blue-600" />
                                        <p className="text-2xl font-bold text-blue-600">{childDetail.gpa || 0}</p>
                                        <p className="text-xs text-gray-600">GPA</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded text-center">
                                        <Calendar className="w-6 h-6 mx-auto text-green-600" />
                                        <p className="text-2xl font-bold text-green-600">{childDetail.attendance_percentage || 0}%</p>
                                        <p className="text-xs text-gray-600">Attendance</p>
                                    </div>
                                    <div className={`p-3 rounded text-center ${
                                        (childDetail.conduct_score || 40) >= 36 ? 'bg-green-50' :
                                        (childDetail.conduct_score || 40) >= 28 ? 'bg-yellow-50' :
                                        'bg-red-50'
                                    }`}>
                                        <ShieldAlert className={`w-6 h-6 mx-auto ${
                                            (childDetail.conduct_score || 40) >= 36 ? 'text-green-600' :
                                            (childDetail.conduct_score || 40) >= 28 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`} />
                                        <p className={`text-2xl font-bold ${
                                            (childDetail.conduct_score || 40) >= 36 ? 'text-green-600' :
                                            (childDetail.conduct_score || 40) >= 28 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {childDetail.conduct_score || 40}/40
                                        </p>
                                        <p className="text-xs text-gray-600">Conduct</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Contact Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>{childDetail.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>{childDetail.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold text-blue-600">Payment Information</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    For payment inquiries, please contact the school accountant or visit the school office.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p>No details available</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
