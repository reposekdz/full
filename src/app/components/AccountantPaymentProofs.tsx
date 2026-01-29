import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Eye, Download, Filter, Search, FileText, TrendingUp, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import apiService from '@/app/services/apiService';

const AccountantPaymentProofs: React.FC = () => {
  const [proofs, setProofs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    trade: '',
    level: '',
    search: ''
  });
  const [verificationData, setVerificationData] = useState({
    status: 'verified',
    verification_notes: '',
    create_payment: true
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [proofsRes, statsRes] = await Promise.all([
        apiService.getAllPaymentProofs(filters),
        apiService.getPaymentProofStats()
      ]);
      if (proofsRes.success) setProofs(proofsRes.proofs || []);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedProof) return;
    try {
      const res = await apiService.verifyPaymentProof(selectedProof.id, verificationData);
      if (res.success) {
        alert('Payment proof verified successfully!');
        setShowVerifyModal(false);
        setSelectedProof(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error verifying:', error);
      alert('Failed to verify payment proof');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-700',
      verified: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      processed: 'bg-blue-100 text-blue-700'
    };
    const icons = {
      pending: Clock,
      verified: CheckCircle,
      rejected: XCircle,
      processed: CheckCircle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return (
      <Badge className={styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Icyemezo cy'Kwishyura</h2>
        <p className="text-gray-600">Reba kandi wemeze ibyemezo byoherejwe n'ababyeyi</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-8 w-8 text-yellow-600" />
                  <Badge className="bg-yellow-100 text-yellow-700">{stats.total_submissions}</Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Byose</h3>
                <p className="text-2xl font-black text-gray-900">{stats.total_submissions}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <Badge className="bg-orange-100 text-orange-700">{stats.pending_count}</Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Birategerezwa</h3>
                <p className="text-2xl font-black text-gray-900">{stats.pending_count}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <Badge className="bg-green-100 text-green-700">{stats.verified_count}</Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Byemejwe</h3>
                <p className="text-2xl font-black text-gray-900">{stats.verified_count}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Amafaranga Yemejwe</h3>
                <p className="text-2xl font-black text-gray-900">
                  {new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0, notation: 'compact' }).format(stats.verified_amount || 0)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <Card className="border-2 border-yellow-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ibyemezo Byose</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Shakisha..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-64 border-2 border-yellow-200"
              />
              <select
                className="h-10 border-2 border-yellow-200 rounded px-3"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Byose</option>
                <option value="pending">Birategerezwa</option>
                <option value="verified">Byemejwe</option>
                <option value="rejected">Byanzwe</option>
                <option value="processed">Byakozwe</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                  <th className="text-left p-4 font-bold">Nimero</th>
                  <th className="text-left p-4 font-bold">Umubyeyi</th>
                  <th className="text-left p-4 font-bold">Umwana</th>
                  <th className="text-left p-4 font-bold">Amafaranga</th>
                  <th className="text-left p-4 font-bold">Itariki</th>
                  <th className="text-left p-4 font-bold">Uburyo</th>
                  <th className="text-left p-4 font-bold">Ifoto</th>
                  <th className="text-left p-4 font-bold">Uko Bimeze</th>
                  <th className="text-left p-4 font-bold">Ibikorwa</th>
                </tr>
              </thead>
              <tbody>
                {proofs.map((proof) => (
                  <tr key={proof.id} className="border-b border-yellow-100 hover:bg-yellow-50">
                    <td className="p-4 font-medium">{proof.submission_number}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold">{proof.parent_first_name} {proof.parent_last_name}</p>
                        <p className="text-xs text-gray-600">{proof.parent_phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold">{proof.student_name}</p>
                        <p className="text-xs text-gray-600">{proof.student_code} - {proof.trade} {proof.level}</p>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-green-600">
                      {new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(proof.amount_paid)}
                    </td>
                    <td className="p-4">{new Date(proof.payment_date).toLocaleDateString()}</td>
                    <td className="p-4">{proof.payment_method}</td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-200"
                        onClick={() => window.open(`http://localhost:5000${proof.proof_image}`, '_blank')}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="p-4">{getStatusBadge(proof.status)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-200"
                          onClick={() => {
                            setSelectedProof(proof);
                            setShowVerifyModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {proof.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 text-white"
                              onClick={() => {
                                setSelectedProof(proof);
                                setVerificationData({status: 'verified', verification_notes: '', create_payment: true});
                                setShowVerifyModal(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-500 text-white"
                              onClick={() => {
                                setSelectedProof(proof);
                                setVerificationData({status: 'rejected', verification_notes: '', create_payment: false});
                                setShowVerifyModal(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showVerifyModal && selectedProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Reba Icyemezo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">Amakuru y'Umubyeyi</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-bold">Izina:</span> {selectedProof.parent_first_name} {selectedProof.parent_last_name}</p>
                      <p><span className="font-bold">Telefoni:</span> {selectedProof.parent_phone}</p>
                      <p><span className="font-bold">Email:</span> {selectedProof.parent_email}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2">Amakuru y'Umwana</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-bold">Izina:</span> {selectedProof.student_name}</p>
                      <p><span className="font-bold">Kode:</span> {selectedProof.student_code}</p>
                      <p><span className="font-bold">Umwuga:</span> {selectedProof.trade}</p>
                      <p><span className="font-bold">Urwego:</span> {selectedProof.level}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2">Amakuru y'Kwishyura</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-bold">Amafaranga:</span> {new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(selectedProof.amount_paid)}</p>
                      <p><span className="font-bold">Itariki:</span> {new Date(selectedProof.payment_date).toLocaleDateString()}</p>
                      <p><span className="font-bold">Uburyo:</span> {selectedProof.payment_method}</p>
                      <p><span className="font-bold">Banki:</span> {selectedProof.bank_name}</p>
                      <p><span className="font-bold">Nimero:</span> {selectedProof.reference_number}</p>
                      <p><span className="font-bold">Transaction ID:</span> {selectedProof.transaction_id}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">Ifoto y'Icyemezo</h3>
                  <img
                    src={`http://localhost:5000${selectedProof.proof_image}`}
                    alt="Payment Proof"
                    className="w-full rounded-lg border-2 border-yellow-200"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t-2 border-yellow-200">
                <div>
                  <label className="block text-sm font-bold mb-2">Inyongera</label>
                  <textarea
                    className="w-full border-2 border-yellow-200 rounded p-2"
                    rows={3}
                    value={verificationData.verification_notes}
                    onChange={(e) => setVerificationData({...verificationData, verification_notes: e.target.value})}
                    placeholder="Andika inyongera..."
                  />
                </div>

                {verificationData.status === 'verified' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="create-payment"
                      checked={verificationData.create_payment}
                      onChange={(e) => setVerificationData({...verificationData, create_payment: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <label htmlFor="create-payment" className="text-sm font-bold">
                      Kora icyemezo cy'kwishyura muri sisitemu
                    </label>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleVerify}
                    className={`flex-1 ${verificationData.status === 'verified' ? 'bg-green-500' : 'bg-red-500'} text-white`}
                  >
                    {verificationData.status === 'verified' ? 'Emeza' : 'Anga'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowVerifyModal(false);
                      setSelectedProof(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Hagarika
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AccountantPaymentProofs;
