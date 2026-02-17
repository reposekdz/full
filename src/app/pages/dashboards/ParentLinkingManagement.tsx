import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Link as LinkIcon, CheckCircle2, XCircle, Clock, Shield, Search, Filter,
    TrendingUp, BarChart3, Activity, AlertTriangle, Download, RefreshCw, Eye,
    UserCheck, UserX, Zap, FileText, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Checkbox } from '@/app/components/ui/checkbox';
import apiService from '@/app/services/apiService';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ParentLinkingManagement() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [pendingLinks, setPendingLinks] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [conflicts, setConflicts] = useState<any>(null);
    const [auditLog, setAuditLog] = useState<any[]>([]);
    const [selectedLinks, setSelectedLinks] = useState<number[]>([]);

    // Pagination states
    const [pendingPage, setPendingPage] = useState(1);
    const [searchPage, setSearchPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Search filters
    const [searchFilters, setSearchFilters] = useState({
        parent_name: '',
        student_name: '',
        parent_phone: '',
        student_number: '',
        trade_code: '',
        level: '',
        status: '',
        date_from: '',
        date_to: ''
    });

    // Modals
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedLink, setSelectedLink] = useState<any>(null);
    const [linkActivity, setLinkActivity] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, analyticsData] = await Promise.all([
                apiService.getParentLinkingDashboardStats(),
                apiService.getParentLinkingAnalytics()
            ]);

            if (statsData.success) setStats(statsData.stats);
            if (analyticsData.success) setAnalytics(analyticsData.analytics);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingLinks = async (page = 1) => {
        try {
            const response = await apiService.getPendingLinks({ page, limit: 20 });
            if (response.success) {
                setPendingLinks(response.data);
                setTotalPages(response.pagination.pages);
                setPendingPage(page);
            }
        } catch (error) {
            console.error('Failed to fetch pending links:', error);
        }
    };

    const fetchConflicts = async () => {
        try {
            const response = await apiService.getParentLinkingConflicts();
            if (response.success) {
                setConflicts(response.conflicts);
            }
        } catch (error) {
            console.error('Failed to fetch conflicts:', error);
        }
    };

    const fetchAuditLog = async () => {
        try {
            const response = await apiService.getParentLinkingAuditLog({ page: 1, limit: 50 });
            if (response.success) {
                setAuditLog(response.logs);
            }
        } catch (error) {
            console.error('Failed to fetch audit log:', error);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await apiService.searchParentLinks({
                ...searchFilters,
                page: searchPage,
                limit: 20
            });

            if (response.success) {
                setSearchResults(response.data);
                setTotalPages(response.pagination.pages);
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            const response = await apiService.approveLink(id);
            if (response.success) {
                fetchPendingLinks(pendingPage);
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Approve failed:', error);
            alert('Failed to approve link');
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const response = await apiService.rejectLink(id, reason);
            if (response.success) {
                fetchPendingLinks(pendingPage);
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Reject failed:', error);
            alert('Failed to reject link');
        }
    };

    const handleBulkApprove = async () => {
        if (selectedLinks.length === 0) {
            alert('Please select links to approve');
            return;
        }

        try {
            const response = await apiService.bulkApproveLinks(selectedLinks);
            if (response.success) {
                setSelectedLinks([]);
                fetchPendingLinks(pendingPage);
                fetchDashboardData();
                alert(`${response.count} links approved successfully`);
            }
        } catch (error) {
            console.error('Bulk approve failed:', error);
            alert('Failed to bulk approve links');
        }
    };

    const handleBulkReject = async () => {
        if (selectedLinks.length === 0) {
            alert('Please select links to reject');
            return;
        }

        const reason = prompt('Enter rejection reason for all selected links:');
        if (!reason) return;

        try {
            const response = await apiService.bulkRejectLinks(selectedLinks, reason);
            if (response.success) {
                setSelectedLinks([]);
                fetchPendingLinks(pendingPage);
                fetchDashboardData();
                alert(`${response.count} links rejected successfully`);
            }
        } catch (error) {
            console.error('Bulk reject failed:', error);
            alert('Failed to bulk reject links');
        }
    };

    const viewLinkDetails = async (link: any) => {
        try {
            const [detailsResponse, activityResponse] = await Promise.all([
                apiService.getParentLink(link.id),
                apiService.getParentLinkActivity(link.id)
            ]);

            if (detailsResponse.success) {
                setSelectedLink(detailsResponse.link);
                setLinkActivity(activityResponse.activity || []);
                setShowDetailsModal(true);
            }
        } catch (error) {
            console.error('Failed to fetch link details:', error);
        }
    };

    const toggleLinkSelection = (id: number) => {
        setSelectedLinks(prev =>
            prev.includes(id) ? prev.filter(linkId => linkId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedLinks.length === pendingLinks.length) {
            setSelectedLinks([]);
        } else {
            setSelectedLinks(pendingLinks.map(link => link.id));
        }
    };

    const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-400"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1600px] mx-auto"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <motion.h1
                            initial={{ x: -50 }}
                            animate={{ x: 0 }}
                            className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2"
                        >
                            Parent Linking Management
                        </motion.h1>
                        <p className="text-gray-400 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-400 animate-pulse" />
                            Advanced parent-student relationship management
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={fetchDashboardData}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { title: 'Total Links', value: stats?.total || 0, icon: LinkIcon, color: 'from-blue-500 to-cyan-500' },
                        { title: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'from-yellow-500 to-orange-500' },
                        { title: 'Active', value: stats?.active || 0, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
                        { title: 'Rejected', value: stats?.rejected || 0, icon: XCircle, color: 'from-red-500 to-pink-500' },
                        { title: 'Last 7 Days', value: stats?.recent_7days || 0, icon: TrendingUp, color: 'from-purple-500 to-indigo-500' }
                    ].map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                            >
                                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white shadow-2xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="text-4xl font-black mb-1">{stat.value}</div>
                                        <div className="text-sm text-gray-400">{stat.title}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2 bg-slate-800/50 backdrop-blur-xl p-2 rounded-2xl border border-purple-500/30">
                        {[
                            { id: 'overview', icon: BarChart3, label: 'Overview' },
                            { id: 'pending', icon: Clock, label: 'Pending Approvals' },
                            { id: 'search', icon: Search, label: 'Advanced Search' },
                            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
                            { id: 'conflicts', icon: AlertTriangle, label: 'Conflicts' },
                            { id: 'audit', icon: FileText, label: 'Audit Log' }
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        if (tab.id === 'pending') fetchPendingLinks();
                                        if (tab.id === 'conflicts') fetchConflicts();
                                        if (tab.id === 'audit') fetchAuditLog();
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-6 py-3 font-semibold rounded-xl transition-all flex items-center gap-2 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    <TabIcon className="h-4 w-4" />
                                    {tab.label}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Status Distribution */}
                            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-6 w-6 text-purple-400" />
                                        Status Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {analytics?.status_breakdown && (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={analytics.status_breakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ status, count }) => `${status}: ${count}`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                    nameKey="status"
                                                >
                                                    {analytics.status_breakdown.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Monthly Trends */}
                            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-6 w-6 text-green-400" />
                                        Monthly Trends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {analytics?.monthly_trends && (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={analytics.monthly_trends}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="month" stroke="#9ca3af" />
                                                <YAxis stroke="#9ca3af" />
                                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Relationship Types */}
                            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-6 w-6 text-blue-400" />
                                        Top Relationship Types
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analytics?.relationship_types?.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-gray-300">{item.relationship_type || 'Unknown'}</span>
                                                <Badge className="bg-purple-600">{item.count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trade Distribution */}
                            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-6 w-6 text-orange-400" />
                                        Links by Trade
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {analytics?.trade_distribution && (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={analytics.trade_distribution}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="trade_name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                                                <YAxis stroke="#9ca3af" />
                                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                                <Bar dataKey="count" fill="#8b5cf6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Pending Approvals Tab */}
                    {activeTab === 'pending' && (
                        <motion.div
                            key="pending"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-purple-500/30">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-yellow-400" />
                                        Pending Requests ({pendingLinks.length})
                                    </h3>
                                    {selectedLinks.length > 0 && (
                                        <Badge variant="outline" className="border-purple-500 text-purple-300">
                                            {selectedLinks.length} selected
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                                        onClick={handleBulkApprove}
                                        disabled={selectedLinks.length === 0}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Approve Selected
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                                        onClick={handleBulkReject}
                                        disabled={selectedLinks.length === 0}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Selected
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="text-gray-400 hover:text-white"
                                        onClick={toggleSelectAll}
                                    >
                                        {selectedLinks.length === pendingLinks.length ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>
                            </div>

                            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-900/50 text-gray-400">
                                            <tr>
                                                <th className="p-4 text-left"><Checkbox checked={selectedLinks.length === pendingLinks.length && pendingLinks.length > 0} onCheckedChange={toggleSelectAll} /></th>
                                                <th className="p-4 text-left">Parent</th>
                                                <th className="p-4 text-left">Student</th>
                                                <th className="p-4 text-left">Relationship</th>
                                                <th className="p-4 text-left">Confidence</th>
                                                <th className="p-4 text-left">Date</th>
                                                <th className="p-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-500/10">
                                            {pendingLinks.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="p-8 text-center text-gray-500">No pending requests found</td>
                                                </tr>
                                            ) : (
                                                pendingLinks.map((link) => (
                                                    <motion.tr
                                                        key={link.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                                                    >
                                                        <td className="p-4"><Checkbox checked={selectedLinks.includes(link.id)} onCheckedChange={() => toggleLinkSelection(link.id)} /></td>
                                                        <td className="p-4">
                                                            <div className="font-semibold">{link.parent_name}</div>
                                                            <div className="text-sm text-gray-400">{link.parent_phone}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-semibold">{link.student_name}</div>
                                                            <div className="text-sm text-gray-400">{link.trade_code} - Level {link.level}</div>
                                                        </td>
                                                        <td className="p-4">{link.relationship_type}</td>
                                                        <td className="p-4">
                                                            <Badge className={`${link.match_confidence >= 90 ? 'bg-green-600' : link.match_confidence >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                                                                {link.match_confidence}%
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-400">{new Date(link.created_at).toLocaleDateString()}</td>
                                                        <td className="p-4 flex justify-center gap-2">
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-400/10" onClick={() => viewLinkDetails(link)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-400 hover:bg-green-400/10" onClick={() => handleApprove(link.id)}>
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-400/10" onClick={() => handleReject(link.id)}>
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center p-4 gap-4 border-t border-purple-500/10">
                                        <Button
                                            variant="ghost"
                                            disabled={pendingPage === 1}
                                            onClick={() => fetchPendingLinks(pendingPage - 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-gray-400">Page {pendingPage} of {totalPages}</span>
                                        <Button
                                            variant="ghost"
                                            disabled={pendingPage === totalPages}
                                            onClick={() => fetchPendingLinks(pendingPage + 1)}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    )}

                    {/* Search Tab */}
                    {activeTab === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                                    <Input
                                        placeholder="Parent Name"
                                        value={searchFilters.parent_name}
                                        onChange={(e) => setSearchFilters({ ...searchFilters, parent_name: e.target.value })}
                                        className="bg-slate-700 border-slate-600 focus:ring-purple-500"
                                    />
                                    <Input
                                        placeholder="Student Name"
                                        value={searchFilters.student_name}
                                        onChange={(e) => setSearchFilters({ ...searchFilters, student_name: e.target.value })}
                                        className="bg-slate-700 border-slate-600 focus:ring-purple-500"
                                    />
                                    <Input
                                        placeholder="Parent Phone"
                                        value={searchFilters.parent_phone}
                                        onChange={(e) => setSearchFilters({ ...searchFilters, parent_phone: e.target.value })}
                                        className="bg-slate-700 border-slate-600 focus:ring-purple-500"
                                    />
                                    <Input
                                        placeholder="Student Number"
                                        value={searchFilters.student_number}
                                        onChange={(e) => setSearchFilters({ ...searchFilters, student_number: e.target.value })}
                                        className="bg-slate-700 border-slate-600 focus:ring-purple-500"
                                    />
                                    <Select value={searchFilters.status} onValueChange={(val) => setSearchFilters({ ...searchFilters, status: val })}>
                                        <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Trade Code"
                                        value={searchFilters.trade_code}
                                        onChange={(e) => setSearchFilters({ ...searchFilters, trade_code: e.target.value })}
                                        className="bg-slate-700 border-slate-600"
                                    />
                                    <Input
                                        type="date"
                                        value={searchFilters.date_from}
                                        onChange={(e) => setSearchFilters({ ...searchFilters, date_from: e.target.value })}
                                        className="bg-slate-700 border-slate-600"
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full"
                                    >
                                        <Search className="h-4 w-4 mr-2" />
                                        Search Records
                                    </Button>
                                </div>
                            </Card>

                            {searchResults.length > 0 && (
                                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-900/50 text-gray-400">
                                            <tr>
                                                <th className="p-4 text-left">Parent/Student</th>
                                                <th className="p-4 text-left">Trade/Level</th>
                                                <th className="p-4 text-left">Status</th>
                                                <th className="p-4 text-left">Confidence</th>
                                                <th className="p-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-500/10">
                                            {searchResults.map((link) => (
                                                <tr key={link.id} className="hover:bg-slate-700/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-semibold text-purple-300">{link.parent_name}</div>
                                                        <div className="text-gray-400 text-sm">Child: {link.student_name}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm">{link.trade_name}</div>
                                                        <Badge variant="outline" className="text-xs bg-slate-700">Level {link.level}</Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge className={`${link.status === 'active' ? 'bg-green-600' : link.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                                                            {link.status.toUpperCase()}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-sm font-mono">{link.match_confidence}%</td>
                                                    <td className="p-4 text-center">
                                                        <Button size="sm" variant="ghost" onClick={() => viewLinkDetails(link)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Card>
                            )}
                        </motion.div>
                    )}

                    {/* Conflicts Tab */}
                    {activeTab === 'conflicts' && (
                        <motion.div
                            key="conflicts"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                                <div>
                                    <h3 className="text-lg font-bold text-red-200">Conflict Detection Active</h3>
                                    <p className="text-red-300/80 text-sm">Displaying potential data inconsistencies and duplicate links.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserX className="h-5 w-5 text-orange-400" />
                                            Students with Multiple Parents
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {conflicts?.multiple_parents && conflicts.multiple_parents.length > 0 ? (
                                            <div className="space-y-4">
                                                {conflicts.multiple_parents.map((item: any, i: number) => (
                                                    <div key={i} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                                        <div className="font-bold text-lg text-purple-300">{item.student_name}</div>
                                                        <div className="text-sm text-gray-400 mb-2">{item.student_number} • {item.parent_count} Parents Linked</div>
                                                        <div className="text-xs bg-slate-800 p-2 rounded text-gray-300">
                                                            Parents: {item.parent_names}
                                                        </div>
                                                        <Button size="sm" className="mt-3 w-full border-orange-500 text-orange-400 hover:bg-orange-500/10" variant="outline"
                                                            onClick={() => handleSearch()} // Preset search in real app
                                                        >
                                                            Review Links
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">No multi-parent conflicts detected.</div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <RefreshCw className="h-5 w-5 text-yellow-400" />
                                            Duplicate Requests
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {conflicts?.duplicate_requests && conflicts.duplicate_requests.length > 0 ? (
                                            <div className="space-y-4">
                                                {conflicts.duplicate_requests.map((item: any, i: number) => (
                                                    <div key={i} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 flex justify-between items-center">
                                                        <div>
                                                            <div className="font-bold text-gray-200">Pending Duplicates: {item.count}</div>
                                                            <div className="text-xs text-gray-400">Parent ID: {item.parent_id} • Student ID: {item.student_id}</div>
                                                        </div>
                                                        <Button size="sm" variant="destructive" onClick={() => handleBulkReject()}>
                                                            Resolve
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">No duplicate requests pending.</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {/* Audit Log Tab */}
                    {activeTab === 'audit' && (
                        <motion.div
                            key="audit"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-6 w-6 text-blue-400" />
                                        System Audit Log
                                    </CardTitle>
                                </CardHeader>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-900/50 text-gray-400">
                                            <tr>
                                                <th className="p-4 text-left">Date/Time</th>
                                                <th className="p-4 text-left">Action</th>
                                                <th className="p-4 text-left">Details</th>
                                                <th className="p-4 text-left">Linked Parties</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-500/10">
                                            {auditLog.map((log: any) => (
                                                <tr key={log.id} className="hover:bg-slate-700/30">
                                                    <td className="p-4 text-sm text-gray-400">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant="outline" className="uppercase bg-slate-800 border-slate-600">
                                                            {log.action?.replace('_', ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-300 max-w-md truncate" title={log.details}>
                                                        {log.details}
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        <div className="text-purple-300">{log.parent_name}</div>
                                                        <div className="text-blue-300">{log.student_name}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {auditLog.length === 0 && (
                                                <tr><td colSpan={4} className="text-center p-8 text-gray-500">No audit records found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Details Modal */}
                <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                    <DialogContent className="bg-slate-900 text-white border-purple-500 max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                Link Details
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Created on {selectedLink && new Date(selectedLink.created_at).toLocaleDateString()}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedLink && (
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                        <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2"><Users className="h-4 w-4" /> Parent</h4>
                                        <div className="text-lg">{selectedLink.parent_name}</div>
                                        <div className="text-sm text-gray-400">{selectedLink.parent_email}</div>
                                        <div className="text-sm text-gray-400">{selectedLink.parent_phone}</div>
                                    </div>
                                    <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                        <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Student</h4>
                                        <div className="text-lg">{selectedLink.student_name}</div>
                                        <div className="text-sm text-gray-400">{selectedLink.student_number}</div>
                                        <div className="text-sm text-gray-400">{selectedLink.trade_name} (Level {selectedLink.level})</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl">
                                    <h4 className="font-bold text-gray-300 mb-2">Match Metadata</h4>
                                    <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                                        {JSON.stringify(selectedLink.match_metadata, null, 2)}
                                    </pre>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-300 border-b border-gray-700 pb-2">Activity History</h4>
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                        {linkActivity.map((act: any, i: number) => (
                                            <div key={i} className="flex gap-3 text-sm">
                                                <span className="text-gray-500 min-w-[140px]">{new Date(act.created_at).toLocaleString()}</span>
                                                <span className="font-medium text-purple-400 uppercase text-xs w-20">{act.action}</span>
                                                <span className="text-gray-300">{act.details}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            {selectedLink?.status === 'pending' && (
                                <>
                                    <Button variant="outline" className="border-red-500 text-red-400" onClick={() => { handleReject(selectedLink.id); setShowDetailsModal(false); }}>Reject</Button>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { handleApprove(selectedLink.id); setShowDetailsModal(false); }}>Approve</Button>
                                </>
                            )}
                            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </AnimatePresence>
        </motion.div>
    </div >
  );
}
}
