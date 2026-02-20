import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search, UserPlus, ShieldCheck, AlertCircle, CheckCircle2,
    ArrowRight, ArrowLeft, School, GraduationCap, MessageSquare,
    HelpCircle, Mail, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { GLOBAL_TRADES, getLevelsForTrade, formatLevelDisplay } from '@/app/constants/tradesAndLevels';
import { API_BASE_URL } from '@/app/config/apiBase';

interface ParentLinkingCenterProps {
    onSuccess?: () => void;
}

export default function ParentLinkingCenter({ onSuccess }: ParentLinkingCenterProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchForm, setSearchForm] = useState({
        student_name: '',
        trade: '',
        level_id: ''
    });
    const [linkResult, setLinkResult] = useState<any>(null);
    const [errorType, setErrorType] = useState<'NONE' | 'MULTIPLE' | 'NOT_FOUND'>('NONE');
    const [contactForm, setContactForm] = useState({
        message: '',
    });

    const activeTradeLevels = searchForm.trade ? getLevelsForTrade(searchForm.trade) : [];

    const handleSearch = async () => {
        if (!searchForm.student_name || !searchForm.trade || !searchForm.level_id) {
            toast.error('Uzuza amakuru yose');
            return;
        }

        const selectedLevel = activeTradeLevels.find(l => l.id === searchForm.level_id);
        if (!selectedLevel) return;

        setLoading(true);
        setErrorType('NONE');
        try {
            const nameParts = searchForm.student_name.trim().split(' ');
            const response = await fetch(`${API_BASE_URL}/parent-links/link-student`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    student_first_name: nameParts[0],
                    student_last_name: nameParts.slice(1).join(' ') || nameParts[0],
                    trade_code: searchForm.trade,
                    level: selectedLevel.level_number.toString(),
                    relationship: 'Parent'
                })
            });

            const data = await response.json();

            if (data.success) {
                setLinkResult({
                    name: searchForm.student_name,
                    trade: searchForm.trade,
                    level: selectedLevel.level_number
                });
                setStep(3);
                toast.success('Umwana yahuijwe neza!');
                if (onSuccess) onSuccess();
            } else {
                toast.error(data.message || 'Umwana ntagaragara');
                setErrorType('NOT_FOUND');
                setStep(2);
            }
        } catch (error) {
            toast.error('Ikibazo cya interineti');
        } finally {
            setLoading(false);
        }
    };

    const handleContactAdmin = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/parent-linking/contact-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    student_details: searchForm,
                    message: contactForm.message
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Ubusabe bwanyu bwakiriwe n\'ubuyobozi');
                setStep(4); // Thank you page
            }
        } catch (error) {
            toast.error('Gusubiza ntibishobotse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <AnimatePresence mode="wait">
                {/* STEP 1: SMART SEARCH */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Huza na Umwana wawe
                            </h1>
                            <p className="text-muted-foreground max-w-lg mx-auto">
                                Shyiramo amakuru y'umwana wawe hano. Sisitemu yacu izahita ihuza raporo ze n'izindi serivisi kuri konte yawe.
                            </p>
                        </div>

                        <Card className="border-2 border-blue-100 shadow-2xl overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                            <CardContent className="p-8 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-blue-500" />
                                                AMAZINA Y'UMWANA
                                            </Label>
                                            <Input
                                                placeholder="Urugero: Jean Claude Munyaneza"
                                                value={searchForm.student_name}
                                                onChange={e => setSearchForm({ ...searchForm, student_name: e.target.value })}
                                                className="h-12 border-2 focus:border-blue-500 transition-all font-medium"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold flex items-center gap-2">
                                                <School className="w-4 h-4 text-blue-500" />
                                                ISHAMI / TRADE
                                            </Label>
                                            <Select
                                                value={searchForm.trade}
                                                onValueChange={v => setSearchForm({ ...searchForm, trade: v, level_id: '' })}
                                            >
                                                <SelectTrigger className="h-12 border-2">
                                                    <SelectValue placeholder="Hitamo Ishami" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {GLOBAL_TRADES.map(t => (
                                                        <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold flex items-center gap-2">
                                                <ArrowRight className="w-4 h-4 text-blue-500" />
                                                UMWAKA / LEVEL
                                            </Label>
                                            <Select
                                                value={searchForm.level_id}
                                                disabled={!searchForm.trade}
                                                onValueChange={v => setSearchForm({ ...searchForm, level_id: v })}
                                            >
                                                <SelectTrigger className="h-12 border-2">
                                                    <SelectValue placeholder={searchForm.trade ? "Hitamo Umwaka" : "Banza uhitemo Ishami"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {activeTradeLevels.map(l => (
                                                        <SelectItem key={l.id} value={l.id}>{formatLevelDisplay(l.level_number, l.level_suffix)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>


                                    </div>

                                    <div className="flex flex-col justify-center items-center bg-blue-50/50 rounded-2xl p-6 border-2 border-dashed border-blue-200">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-blue-600">
                                            <ShieldCheck className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-lg font-bold text-blue-900 mb-2">Guhuza ako kanya</h3>
                                        <p className="text-center text-sm text-blue-700 leading-relaxed">
                                            Iyo amakuru ahuye n'ayo dufite, urahita ubona raporo z'amanota, imitsindire, n'amafaranga y'ishuri.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-bold hover:scale-[1.01] transition-all shadow-xl shadow-blue-200"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            Turashakisha...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <UserPlus className="w-5 h-5" />
                                            Huza Umwana na Konte
                                        </div>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* STEP 2: CHILD NOT FOUND / HELP NEEDED */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card className="border-2 border-amber-100 shadow-2xl overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
                            <CardHeader className="text-center bg-amber-50/30">
                                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <CardTitle className="text-2xl font-black text-amber-900">
                                    {errorType === 'MULTIPLE' ? 'Twabonye abanyeshuri benshi' : 'Umwana ntagaragara'}
                                </CardTitle>
                                <CardDescription className="text-amber-700">
                                    Wigira ikibazo! Birashoboka ko hari inyuguti yibeshye cyangwa akaba ataramenyekana muri sisitemu. Twandikire bugufasha.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="p-4 bg-white border-2 border-amber-200 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b">
                                        <span className="text-sm font-bold text-gray-500">AMAKURU WATANZE</span>
                                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Tugiye kuyasuzuma</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                                        <div>
                                            <p className="text-gray-400 text-xs mb-1 uppercase">Izina</p>
                                            <p className="text-gray-800">{searchForm.student_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs mb-1 uppercase">Ishami</p>
                                            <p className="text-gray-800">{searchForm.trade}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs mb-1 uppercase">Umwaka</p>
                                            <p className="text-gray-800">
                                                {searchForm.level_id ? formatLevelDisplay(
                                                    activeTradeLevels.find(l => l.id === searchForm.level_id)?.level_number || 0,
                                                    activeTradeLevels.find(l => l.id === searchForm.level_id)?.level_suffix || ''
                                                ) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-sm font-bold">ANDI MAKURU (ICYATUMYE UDAHUZA)</Label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border-2 focus:border-amber-500 ring-0 outline-none transition-all h-32 bg-gray-50/50"
                                        placeholder="Shyiramo andi makuru nka nimero y'irangamuntu y'umubyeyi, nimero ya telefone, cyangwa andi mazina y'umwana..."
                                        value={contactForm.message}
                                        onChange={e => setContactForm({ message: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 border-2">
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Subira inyuma
                                    </Button>
                                    <Button
                                        onClick={handleContactAdmin}
                                        disabled={loading}
                                        className="flex-[2] h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold"
                                    >
                                        {loading ? "Turi kohereza..." : "Gufashwa n'Ubuyobozi"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* STEP 3: SUCCESS AUTO-LINK */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <Card className="border-4 border-green-500 shadow-3xl overflow-hidden bg-green-50/30">
                            <CardContent className="p-12 space-y-8">
                                <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl mb-4 text-white">
                                    <CheckCircle2 className="w-16 h-16" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-5xl font-black text-green-900">Twabashije Guhuza!</h2>
                                    <p className="text-xl text-green-700">Konte y'umwana yahuijwe neza</p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border-2 border-green-100 shadow-sm max-w-sm mx-auto">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-lg text-gray-900">{linkResult?.name}</p>
                                            <p className="text-sm text-gray-500 font-medium">{linkResult?.trade} • {linkResult?.level}</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => window.location.reload()}
                                    className="h-14 px-12 bg-green-600 hover:bg-green-700 text-white font-black text-xl rounded-full shadow-lg shadow-green-200"
                                >
                                    Jya kuri Dashboard
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* STEP 4: THANK YOU FOR CONTACT */}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <Card className="border-2 border-blue-100 shadow-2xl">
                            <CardContent className="p-12 space-y-6">
                                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                    <MessageSquare className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900">Ubusabe Bwakiriwe</h2>
                                <p className="text-muted-foreground text-lg">
                                    Ubuyobozi bw'ishuri bwamenyeshejwe. Tugiye gusuzuma maze tuboneze raporo za mu mwana wawe mu gihe gito.
                                </p>
                                <Button onClick={() => setStep(1)} variant="outline" className="h-12 px-8 border-2">
                                    Ongera ugerageze
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HELP S-SECTION */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 flex flex-col items-center text-center">
                    <HelpCircle className="w-6 h-6 text-blue-500 mb-2" />
                    <h4 className="font-bold text-sm">Waba ukeneye ubufasha?</h4>
                    <p className="text-xs text-muted-foreground">Soma amabwiriza yo guhuza umwana.</p>
                </div>
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 flex flex-col items-center text-center">
                    <Phone className="w-6 h-6 text-blue-500 mb-2" />
                    <h4 className="font-bold text-sm">Twamagare</h4>
                    <p className="text-xs text-muted-foreground">+250 788 000 000</p>
                </div>
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 flex flex-col items-center text-center">
                    <Mail className="w-6 h-6 text-blue-500 mb-2" />
                    <h4 className="font-bold text-sm">Email y'Ishuri</h4>
                    <p className="text-xs text-muted-foreground">admin@gardentvet.com</p>
                </div>
            </div>
        </div>
    );
}
