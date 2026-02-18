/**
 * Parent Child Linking Page v3.0
 * Features: Real-time student search, auto-linking with verification, comprehensive search
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, UserPlus, CheckCircle, XCircle, Loader2, AlertCircle,
    GraduationCap, Phone, Mail, MapPin, ArrowRight, Sparkles,
    Users, BookOpen, Clock, RefreshCw, Eye, EyeOff, ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { API_BASE_URL } from '@/app/config/apiBase';
import axios from 'axios';

interface ParentChildLinkingPageProps {
    onNavigate: (page: string) => void;
    onComplete: () => void;
}

interface Student {
    id: number;
    student_code: string;
    first_name: string;
    last_name: string;
    trade_name: string;
    trade_code: string;
    level_number: number;
    gender: string;
    balance?: number;
}

interface SearchResult {
    students: Student[];
    count: number;
}

export default function ParentChildLinkingPage({ onNavigate, onComplete }: ParentChildLinkingPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [linking, setLinking] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [linkedStudents, setLinkedStudents] = useState<Student[]>([]);
    const [searchFilters, setSearchFilters] = useState({
        trade: '',
        level: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualData, setManualData] = useState({
        student_first_name: '',
        student_last_name: '',
        trade_code: '',
        level: '',
        gender: '',
        relationship: 'Parent'
    });
    const [submittingManual, setSubmittingManual] = useState(false);

    const parent = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchLinkedStudents();
    }, []);

    const fetchLinkedStudents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/parent-dashboard/children`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setLinkedStudents(response.data.children || []);
            }
        } catch (err) {
            console.error('Error fetching linked students:', err);
        }
    };

    const searchStudents = async () => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setError('Andika izina rimwe c\'abana cyangwa nomero y\'umwana');
            return;
        }

        setLoading(true);
        setError('');
        setSearchResults([]);

        try {
            const params = new URLSearchParams();
            params.append('query', searchQuery);
            if (searchFilters.trade) params.append('trade', searchFilters.trade);
            if (searchFilters.level) params.append('level', searchFilters.level);

            const response = await axios.get(`${API_BASE_URL}/parent-management/search-students?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setSearchResults(response.data.students || []);
                if (response.data.students.length === 0) {
                    setError('Nta masingo ashatse. Gerageza search ikindi.');
                }
            } else {
                setError(response.data.message || 'Search failed');
            }
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.response?.data?.message || 'Search failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const linkStudent = async (student: Student) => {
        setLinking(student.id);
        setError('');

        try {
            const response = await axios.post(
                `${API_BASE_URL}/parent-management/links/create`,
                {
                    parent_id: parent.id,
                    student_id: student.id,
                    relationship_type: 'Parent'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess(`Umwana ${student.first_name} ${student.last_name} yahuriwe neza!`);
                setSearchResults(prev => prev.filter(s => s.id !== student.id));
                fetchLinkedStudents();

                // Auto-login redirect after 2 seconds if student linked
                if (linkedStudents.length === 0) {
                    setTimeout(() => {
                        onComplete();
                    }, 2000);
                }
            } else {
                setError(response.data.message || 'Linking failed');
            }
        } catch (err: any) {
            console.error('Linking error:', err);
            setError(err.response?.data?.message || 'Linking failed. Try again.');
        } finally {
            setLinking(null);
        }
    };

    const submitManualRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingManual(true);
        setError('');

        try {
            const response = await axios.post(
                `${API_BASE_URL}/parent-links/link-student`,
                manualData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess('Gusaba kwanyu koherejwe neza! Tegereza kwemezwa na school.');
                setShowManualForm(false);
                setManualData({
                    student_first_name: '',
                    student_last_name: '',
                    trade_code: '',
                    level: '',
                    gender: '',
                    relationship: 'Parent'
                });
                // After 5 seconds, clear success
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(response.data.message || 'Gusaba kwanze');
            }
        } catch (err: any) {
            console.error('Manual request error:', err);
            setError(err.response?.data?.message || 'Gusaba kwanze. Gerageza ukundi.');
        } finally {
            setSubmittingManual(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchStudents();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex flex-col">
            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-white/95 backdrop-blur-sm shadow-lg border-b-4 border-yellow-400 sticky top-0 z-50"
            >
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Huza Umwana wawe</h1>
                                <p className="text-sm text-gray-500">Funganya konti y'umwana wawe</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Kwiyandikisha Byagenze
                            </Badge>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="flex-1 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Success Message */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-green-50 border-2 border-green-400 rounded-xl p-4 mb-6 flex items-center gap-3"
                            >
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <p className="text-green-800 font-medium">{success}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Already Linked Students */}
                    {linkedStudents.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Abana Uhujwe
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {linkedStudents.map((child) => (
                                    <Card key={child.id} className="bg-white/90 backdrop-blur-sm border-2 border-green-300 shadow-lg">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                                                    {child.first_name[0]}{child.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{child.first_name} {child.last_name}</p>
                                                    <p className="text-sm text-gray-500">{child.student_code}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <p className="flex items-center gap-2 text-gray-600">
                                                    <BookOpen className="w-4 h-4 text-green-500" />
                                                    {child.trade_name} Level {child.level_number}
                                                </p>
                                                <Badge className="bg-green-100 text-green-700">Yemewe</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Search Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-yellow-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Search className="w-5 h-5 text-yellow-600" />
                                    <h2 className="text-xl font-bold text-gray-800">Shaka Umwana wawe</h2>
                                </div>

                                {/* Search Input */}
                                <div className="flex flex-col md:flex-row gap-3 mb-4">
                                    <div className="flex-1 relative">
                                        <Input
                                            type="text"
                                            placeholder="Andika izina cg nomero y'umwana..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="pl-10 h-12 border-2 border-yellow-200 focus:border-yellow-400"
                                        />
                                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                    <Button
                                        onClick={searchStudents}
                                        disabled={loading}
                                        className="h-12 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold px-6"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Shaka'}
                                    </Button>
                                </div>

                                {/* Advanced Filters Toggle */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                    Ibyifuzo byongeyeho
                                </button>

                                {/* Advanced Filters */}
                                <AnimatePresence>
                                    {showFilters && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-yellow-50 rounded-lg"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Trade</label>
                                                <select
                                                    value={searchFilters.trade}
                                                    onChange={(e) => setSearchFilters({ ...searchFilters, trade: e.target.value })}
                                                    className="w-full p-2 border rounded-lg"
                                                >
                                                    <option value="">Hitamo Trade</option>
                                                    <option value="AUTOMOTIVE">Automotive</option>
                                                    <option value="ELECTRICAL">Electrical</option>
                                                    <option value="PLUMBING">Plumbing</option>
                                                    <option value="CARPENTRY">Carpentry</option>
                                                    <option value="MASONRY">Masonry</option>
                                                    <option value="HAIRDRESSING">Hairdressing</option>
                                                    <option value="TAILORING">Tailoring</option>
                                                    <option value="CATERING">Catering</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                                <select
                                                    value={searchFilters.level}
                                                    onChange={(e) => setSearchFilters({ ...searchFilters, level: e.target.value })}
                                                    className="w-full p-2 border rounded-lg"
                                                >
                                                    <option value="">Hitamo Level</option>
                                                    <option value="1">Level 1</option>
                                                    <option value="2">Level 2</option>
                                                    <option value="3">Level 3</option>
                                                    <option value="4">Level 4</option>
                                                </select>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-gray-700">
                                            Ibagezobashonga ({searchResults.length})
                                        </h3>
                                        {searchResults.map((student) => (
                                            <motion.div
                                                key={student.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-green-400 flex items-center justify-center text-white font-bold text-lg">
                                                        {student.first_name[0]}{student.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-lg">
                                                            {student.first_name} {student.last_name}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <GraduationCap className="w-4 h-4" />
                                                                {student.student_code}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <BookOpen className="w-4 h-4" />
                                                                {student.trade_name}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs">
                                                                Level {student.level_number}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => linkStudent(student)}
                                                    disabled={linking === student.id}
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                                                >
                                                    {linking === student.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <UserPlus className="w-5 h-5 mr-2" />
                                                            Huza
                                                        </>
                                                    )}
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* No Results or Manual Form Requested */}
                                {((!loading && searchResults.length === 0 && searchQuery && !error) || showManualForm) && (
                                    <div className="mt-8">
                                        {!showManualForm ? (
                                            <div className="text-center py-8">
                                                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                                                <p className="text-gray-600 mb-4 text-lg">Nta masomo ashatse. Ushobora kohereza dosiye y'umwana wawe hano.</p>
                                                <Button
                                                    onClick={() => setShowManualForm(true)}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg"
                                                >
                                                    Uzuza Dosiye y'Umwana
                                                </Button>
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="p-6 bg-white border-4 border-yellow-400 rounded-3xl shadow-2xl overflow-hidden relative"
                                            >
                                                <div className="absolute top-0 right-0 p-4">
                                                    <button onClick={() => setShowManualForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                        <XCircle className="w-8 h-8" />
                                                    </button>
                                                </div>

                                                <div className="mb-6">
                                                    <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                                        <Sparkles className="w-8 h-8 text-yellow-500" />
                                                        Kwandikisha Umwana Mushya
                                                    </h3>
                                                    <p className="text-gray-500">Uzuza amakuru y'umwana wawe kugira ngo ishuri rimumenye.</p>
                                                </div>

                                                <form onSubmit={submitManualRequest} className="space-y-6">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-gray-700">Izina rya mbere (First Name)</label>
                                                            <Input
                                                                required
                                                                className="h-12 border-2 border-gray-100 focus:border-yellow-400"
                                                                value={manualData.student_first_name}
                                                                onChange={(e) => setManualData({ ...manualData, student_first_name: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-gray-700">Izina rya kabiri (Last Name)</label>
                                                            <Input
                                                                required
                                                                className="h-12 border-2 border-gray-100 focus:border-yellow-400"
                                                                value={manualData.student_last_name}
                                                                onChange={(e) => setManualData({ ...manualData, student_last_name: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-bold text-gray-700">Ishami (Trade)</label>
                                                            <select
                                                                required
                                                                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-yellow-400 outline-none"
                                                                value={manualData.trade_code}
                                                                onChange={(e) => setManualData({ ...manualData, trade_code: e.target.value })}
                                                            >
                                                                <option value="">Hitamo Ishami</option>
                                                                <option value="AUTOMOTIVE">Automotive</option>
                                                                <option value="ELECTRICAL">Electrical</option>
                                                                <option value="SOD">Software-Development</option>
                                                                <option value="MASONRY">Masonry</option>
                                                                <option value="CULINARY">Culinary Arts</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-bold text-gray-700">Urwego (Level)</label>
                                                            <select
                                                                required
                                                                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-yellow-400 outline-none"
                                                                value={manualData.level}
                                                                onChange={(e) => setManualData({ ...manualData, level: e.target.value })}
                                                            >
                                                                <option value="">Hitamo Level</option>
                                                                <option value="1">Level 1</option>
                                                                <option value="2">Level 2</option>
                                                                <option value="3">Level 3</option>
                                                                <option value="4">Level 4</option>
                                                                <option value="5">Level 5</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-bold text-gray-700">Igitsina (Gender)</label>
                                                            <select
                                                                required
                                                                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-yellow-400 outline-none"
                                                                value={manualData.gender}
                                                                onChange={(e) => setManualData({ ...manualData, gender: e.target.value })}
                                                            >
                                                                <option value="">Select Gender</option>
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-gray-700">Isano (Relationship)</label>
                                                            <Input
                                                                required
                                                                className="h-12 border-2 border-gray-100 focus:border-yellow-400"
                                                                value={manualData.relationship}
                                                                onChange={(e) => setManualData({ ...manualData, relationship: e.target.value })}
                                                                placeholder="Mubyeyi, Murandazi, etc."
                                                            />
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        disabled={submittingManual}
                                                        className="w-full h-14 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-black text-xl rounded-2xl shadow-2xl transform active:scale-95 transition-all"
                                                    >
                                                        {submittingManual ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : 'OHEREZA DOSIYE'}
                                                    </Button>
                                                </form>
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {/* Skip/Dashboard Link */}
                                <div className="mt-12 pt-8 border-t-2 border-gray-100">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                                            <p className="text-sm text-gray-600 max-w-md">
                                                <span className="font-bold text-gray-800">Icyitonderwa:</span> Kwandikisha umwana bituma ubona amakuru ye y'ishuri mu buryo bw'ako kanya.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => onNavigate('dashboard-parent')}
                                            className="h-12 rounded-xl border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 text-gray-700 font-bold px-8 transition-all"
                                        >
                                            Injira kuri Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Help Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8"
                    >
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    Ubufasha
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-green-500 mt-1" />
                                        <div>
                                            <p className="font-medium text-gray-800">Telefoni</p>
                                            <p>Twabafasha guhuza numwana wawe</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Mail className="w-4 h-4 text-blue-500 mt-1" />
                                        <div>
                                            <p className="font-medium text-gray-800">Email</p>
                                            <p>Ohereza email tugufashe</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-red-500 mt-1" />
                                        <div>
                                            <p className="font-medium text-gray-800">Ku ruhande</p>
                                            <p>Mujye kuri school kubona ubufasha</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 text-purple-500 mt-1" />
                                        <div>
                                            <p className="font-medium text-gray-800">Igihe</p>
                                            <p>Ubucutiwa bufata: Mon-Fri 8am-5pm</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
