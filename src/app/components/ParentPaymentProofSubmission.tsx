import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, Clock, Eye, Download, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import apiService from '@/app/services/apiService';
import RwandaLocationSelector from '@/app/components/RwandaLocationSelector';

const ParentPaymentProofSubmission: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    amount_paid: '',
    payment_date: '',
    payment_method: 'Bank Transfer',
    reference_number: '',
    bank_name: '',
    transaction_id: '',
    notes: ''
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [childrenRes, submissionsRes] = await Promise.all([
        apiService.getMyChildren(),
        apiService.getMyPaymentProofs({})
      ]);
      if (childrenRes.success) setChildren(childrenRes.children || []);
      if (submissionsRes.success) setSubmissions(submissionsRes.submissions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) {
      alert('Please upload payment proof image');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append('proof_image', proofFile);

      const res = await apiService.submitPaymentProof(formDataToSend);
      if (res.success) {
        alert('Payment proof submitted successfully!');
        setShowForm(false);
        setFormData({
          student_id: '',
          amount_paid: '',
          payment_date: '',
          payment_method: 'Bank Transfer',
          reference_number: '',
          bank_name: '',
          transaction_id: '',
          notes: ''
        });
        setProofFile(null);
        setImagePreview(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit payment proof');
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Kwishyura Amafaranga</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-yellow-500 to-green-500 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Ohereza Icyemezo
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Ohereza Icyemezo cy'Kwishyura</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2">Umwana</label>
                    <select
                      className="w-full h-10 border-2 border-yellow-200 rounded px-3"
                      value={formData.student_id}
                      onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                      required
                    >
                      <option value="">Hitamo umwana</option>
                      {children.map(child => (
                        <option key={child.id} value={child.id}>
                          {child.first_name} {child.last_name} - {child.student_code} ({child.trade} {child.level})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Amafaranga Yishyuwe</label>
                    <Input
                      type="number"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                      placeholder="500000"
                      className="border-2 border-yellow-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Itariki</label>
                    <Input
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                      className="border-2 border-yellow-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Uburyo bwo Kwishyura</label>
                    <select
                      className="w-full h-10 border-2 border-yellow-200 rounded px-3"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    >
                      <option>Bank Transfer</option>
                      <option>Mobile Money</option>
                      <option>Cash</option>
                      <option>Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Banki</label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      placeholder="Bank of Kigali"
                      className="border-2 border-yellow-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Nimero y'Icyemezo</label>
                    <Input
                      value={formData.reference_number}
                      onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                      placeholder="BK2024001"
                      className="border-2 border-yellow-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Transaction ID</label>
                    <Input
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                      placeholder="TXN123456"
                      className="border-2 border-yellow-200"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2">Ifoto y'Icyemezo</label>
                    <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="proof-upload"
                        required
                      />
                      <label htmlFor="proof-upload" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                            <p className="text-sm text-green-600 font-bold">Ifoto yashyizweho!</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="h-12 w-12 mx-auto text-yellow-500" />
                            <p className="text-sm text-gray-600">Kanda hano ushyireho ifoto</p>
                            <p className="text-xs text-gray-500">JPEG, PNG, PDF (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2">Inyongera</label>
                    <textarea
                      className="w-full border-2 border-yellow-200 rounded p-2"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Andika inyongera..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Aho Utuye (Rwanda)</label>
                  <RwandaLocationSelector
                    onLocationChange={(location) => setFormData({...formData, ...location})}
                    required={true}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-green-500"
                  >
                    {loading ? 'Birohereza...' : 'Ohereza'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Hagarika
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="border-2 border-yellow-200">
        <CardHeader>
          <CardTitle>Ibyoherejwe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                  <th className="text-left p-4 font-bold">Nimero</th>
                  <th className="text-left p-4 font-bold">Umwana</th>
                  <th className="text-left p-4 font-bold">Amafaranga</th>
                  <th className="text-left p-4 font-bold">Itariki</th>
                  <th className="text-left p-4 font-bold">Uburyo</th>
                  <th className="text-left p-4 font-bold">Uko Bimeze</th>
                  <th className="text-left p-4 font-bold">Ibikorwa</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-yellow-100 hover:bg-yellow-50">
                    <td className="p-4 font-medium">{sub.submission_number}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold">{sub.student_name}</p>
                        <p className="text-xs text-gray-600">{sub.student_code} - {sub.trade} {sub.level}</p>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-green-600">
                      {new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(sub.amount_paid)}
                    </td>
                    <td className="p-4">{new Date(sub.payment_date).toLocaleDateString()}</td>
                    <td className="p-4">{sub.payment_method}</td>
                    <td className="p-4">{getStatusBadge(sub.status)}</td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" className="border-yellow-200">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentPaymentProofSubmission;
