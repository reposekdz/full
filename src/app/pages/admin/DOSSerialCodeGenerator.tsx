import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { KeyRound, Copy, Check, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const DOSSerialCodeGenerator = () => {
  const [serialCode, setSerialCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const generateCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.target);
    const class_id = formData.get('class_id');
    const student_name = formData.get('student_name');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/student-auth/dos/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ class_id, student_name })
      });

      const data = await response.json();

      if (data.success) {
        setSerialCode(data.serialCode);
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate code. Please try again.' });
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(serialCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <KeyRound className="w-6 h-6" />
            Student Serial Code Generator
          </CardTitle>
          <p className="text-gray-600">Generate unique serial codes for new students</p>
        </CardHeader>

        <CardContent>
          {message.text && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={generateCode} className="space-y-4">
            <div>
              <Label htmlFor="student_name">Student Name (Optional)</Label>
              <Input
                id="student_name"
                name="student_name"
                placeholder="Enter student name for reference"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="class_id">Class ID (Optional)</Label>
              <Input
                id="class_id"
                name="class_id"
                placeholder="Enter class ID"
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'Generate Serial Code'}
            </Button>
          </form>

          {serialCode && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Generated Serial Code:</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-white p-4 rounded-lg border-2 border-blue-300">
                  <code className="text-2xl font-mono font-bold text-blue-600">
                    {serialCode}
                  </code>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="h-14"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-900">
                  <li>Copy this serial code</li>
                  <li>Give it to the student manually</li>
                  <li>Student will use this code to register</li>
                  <li>Student will need: Serial Code, Password, Parent Phone, Location</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DOSSerialCodeGenerator;
