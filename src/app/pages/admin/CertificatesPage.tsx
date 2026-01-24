import React, { useState, useEffect } from 'react';
import { Award, Download, Search, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [showGenerate, setShowGenerate] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/certificates/stats/overview');
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const verifyCertificate = async () => {
    if (!verificationCode) return;
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/verify/${verificationCode}`);
      const data = await response.json();
      setVerificationResult(data);
    } catch (error) {
      console.error('Error verifying certificate:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Certificate Management</h1>
        <Button onClick={() => setShowGenerate(true)}>
          <Award className="w-4 h-4 mr-2" /> Generate Certificate
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Certificates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.recentIssued}</div>
              <div className="text-sm text-gray-600">Issued This Month</div>
            </CardContent>
          </Card>
          {stats.byType.map(item => (
            <Card key={item.certificate_type}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-sm text-gray-600">{item.certificate_type}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Verify Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter verification code..."
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <Button onClick={verifyCertificate}>
              <CheckCircle className="w-4 h-4 mr-2" /> Verify
            </Button>
          </div>
          {verificationResult && (
            <div className={`mt-4 p-4 rounded-lg ${verificationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {verificationResult.valid ? (
                <div>
                  <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    Valid Certificate
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><strong>Student:</strong> {verificationResult.certificate.first_name} {verificationResult.certificate.last_name}</p>
                    <p><strong>Certificate #:</strong> {verificationResult.certificate.certificate_number}</p>
                    <p><strong>Type:</strong> {verificationResult.certificate.certificate_type}</p>
                    <p><strong>Issue Date:</strong> {new Date(verificationResult.certificate.issue_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-800 font-semibold">
                  <XCircle className="w-5 h-5" />
                  {verificationResult.message}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showGenerate && (
        <GenerateCertificateModal
          onClose={() => setShowGenerate(false)}
          onGenerate={() => { setShowGenerate(false); fetchStats(); }}
        />
      )}
    </div>
  );
};

const GenerateCertificateModal = ({ onClose, onGenerate }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    certificate_type: 'completion',
    template_id: 1,
    issue_date: new Date().toISOString().split('T')[0],
    data: {}
  });
  const [students, setStudents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchTemplates();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students');
      const data = await response.json();
      if (data.success) setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/certificates/templates/list');
      const data = await response.json();
      if (data.success) setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (bulkMode) {
        await fetch('http://localhost:5000/api/certificates/generate/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_ids: selectedStudents,
            certificate_type: formData.certificate_type,
            template_id: formData.template_id,
            issue_date: formData.issue_date
          })
        });
        alert(`Generated ${selectedStudents.length} certificates!`);
      } else {
        const response = await fetch('http://localhost:5000/api/certificates/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (data.success) {
          alert(`Certificate generated!\nNumber: ${data.certificate_number}\nVerification Code: ${data.verification_code}`);
        }
      }
      onGenerate();
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Generate Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={bulkMode}
                onChange={(e) => setBulkMode(e.target.checked)}
                className="w-4 h-4"
              />
              <label>Bulk Generation Mode</label>
            </div>

            {!bulkMode ? (
              <div>
                <label className="block text-sm font-medium mb-2">Student</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} - {student.student_code}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Select Students</label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {students.map(student => (
                    <label key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span>{student.first_name} {student.last_name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">{selectedStudents.length} students selected</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Certificate Type</label>
                <select
                  value={formData.certificate_type}
                  onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="completion">Completion</option>
                  <option value="achievement">Achievement</option>
                  <option value="participation">Participation</option>
                  <option value="graduation">Graduation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Issue Date</label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">
                <Award className="w-4 h-4 mr-2" /> Generate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificatesPage;
