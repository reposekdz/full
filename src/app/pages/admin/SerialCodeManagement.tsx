import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RefreshCw, Download, Trash2, Ban, CheckCircle2, XCircle, Copy, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import apiService from '@/app/services/apiService';

export default function SerialCodeManagement() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [generateForm, setGenerateForm] = useState({
    trade_code: '',
    level_number: 1,
    level_suffix: '',
    quantity: 10,
    academic_year: '',
    expires_at: '',
    notes: ''
  });

  useEffect(() => {
    fetchCodes();
  }, [filterStatus]);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const response = await apiService.getSerialCodes(params);
      setCodes(response.codes || []);
    } catch (err) {
      console.error('Failed to fetch codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!generateForm.trade_code || !generateForm.level_number || !generateForm.quantity) {
      alert('Uzuza ibibazwa byose!');
      return;
    }

    try {
      setGenerating(true);
      const response = await apiService.generateSerialCodes(generateForm);
      if (response.success) {
        alert(`${response.codes.length} kode zakoze neza!`);
        setGenerateForm({
          trade_code: '',
          level_number: 1,
          level_suffix: '',
          quantity: 10,
          academic_year: '',
          expires_at: '',
          notes: ''
        });
        fetchCodes();
      } else {
        alert('Byanze: ' + response.message);
      }
    } catch (err: any) {
      alert('Byanze: ' + (err.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Urashaka guhagarika iyi kode?')) return;

    try {
      const response = await apiService.revokeSerialCode(id);
      if (response.success) {
        alert('Kode yahagaritswe!');
        fetchCodes();
      }
    } catch (err: any) {
      alert('Byanze: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Urashaka gusiba iyi kode burundu?')) return;

    try {
      const response = await apiService.deleteSerialCode(id);
      if (response.success) {
        alert('Kode yasibwe!');
        fetchCodes();
      }
    } catch (err: any) {
      alert('Byanze: ' + (err.message || 'Unknown error'));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Kode yakopishijwe!');
  };

  const exportCodes = () => {
    const csvContent = 'Serial Code,Trade,Level,Status,Generated At,Used By\n' +
      codes.map(c => `${c.serial_code},${c.trade_code},${c.level_number},${c.status},${c.generated_at},${c.used_by_first_name || 'N/A'}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredCodes = codes.filter(c => 
    c.serial_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.trade_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.trade_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: codes.length,
    active: codes.filter(c => c.status === 'active' && !c.is_used).length,
    used: codes.filter(c => c.is_used).length,
    revoked: codes.filter(c => c.status === 'revoked').length
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Serial Code Management
          </h1>
          <p className="text-gray-600">Generate and manage student serial codes</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchCodes} variant="outline" className="border-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportCodes} variant="outline" className="border-2">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Generate Codes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate Serial Codes</DialogTitle>
                <DialogDescription>
                  Create new serial codes for student registration
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="trade_code">Trade Code</Label>
                  <Input
                    id="trade_code"
                    placeholder="e.g., ELE, CON, PLU"
                    value={generateForm.trade_code}
                    onChange={(e) => setGenerateForm({ ...generateForm, trade_code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="level_number">Level Number</Label>
                    <Input
                      id="level_number"
                      type="number"
                      min="1"
                      max="6"
                      value={generateForm.level_number}
                      onChange={(e) => setGenerateForm({ ...generateForm, level_number: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level_suffix">Level Suffix (Optional)</Label>
                    <Input
                      id="level_suffix"
                      placeholder="e.g., A, B"
                      value={generateForm.level_suffix}
                      onChange={(e) => setGenerateForm({ ...generateForm, level_suffix: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="100"
                    value={generateForm.quantity}
                    onChange={(e) => setGenerateForm({ ...generateForm, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="academic_year">Academic Year (Optional)</Label>
                  <Input
                    id="academic_year"
                    placeholder="e.g., 2024-2025"
                    value={generateForm.academic_year}
                    onChange={(e) => setGenerateForm({ ...generateForm, academic_year: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={generateForm.notes}
                    onChange={(e) => setGenerateForm({ ...generateForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleGenerate} disabled={generating} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  {generating ? 'Generating...' : 'Generate Codes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-2 border-indigo-100 shadow-lg">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-indigo-600 mb-2" />
            <p className="text-3xl font-black text-indigo-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Codes</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-100 shadow-lg">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
            <p className="text-3xl font-black text-green-900">{stats.active}</p>
            <p className="text-sm text-gray-600">Active (Unused)</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-blue-600 mb-2" />
            <p className="text-3xl font-black text-blue-900">{stats.used}</p>
            <p className="text-sm text-gray-600">Used</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-100 shadow-lg">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 mx-auto text-red-600 mb-2" />
            <p className="text-3xl font-black text-red-900">{stats.revoked}</p>
            <p className="text-sm text-gray-600">Revoked</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-indigo-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-100">
          <div className="flex justify-between items-center">
            <CardTitle>Serial Codes List</CardTitle>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-indigo-100 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 border-2 border-indigo-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-indigo-100">
                    <th className="text-left py-3 px-4 font-semibold">Serial Code</th>
                    <th className="text-left py-3 px-4 font-semibold">Trade/Level</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Generated</th>
                    <th className="text-left py-3 px-4 font-semibold">Used By</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredCodes.map((code, index) => (
                      <motion.tr
                        key={code.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-gray-100 hover:bg-indigo-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                              {code.serial_code}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(code.serial_code)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="font-semibold">{code.trade_name || code.trade_code}</p>
                            <p className="text-gray-500">Level {code.level_number}{code.level_suffix}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {code.is_used ? (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300">Used</Badge>
                          ) : code.status === 'active' ? (
                            <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-300">Revoked</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(code.generated_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {code.used_by_first_name ? (
                            <div>
                              <p className="font-semibold">{code.used_by_first_name} {code.used_by_last_name}</p>
                              <p className="text-gray-500">{code.student_registration_id}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not used</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {!code.is_used && code.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRevoke(code.id)}
                                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                              >
                                <Ban className="w-3 h-3 mr-1" />
                                Revoke
                              </Button>
                            )}
                            {!code.is_used && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(code.id)}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredCodes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No codes found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
