import React, { useState, useEffect } from 'react';
import { Send, Users, MessageSquare, CheckCircle, XCircle, Loader } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export const SMSMessaging: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [status, setStatus] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    socket.on('sms:sending', (data) => {
      setStatus(prev => [...prev, { ...data, time: new Date() }]);
    });

    socket.on('sms:sent', (data) => {
      setStatus(prev => prev.map(s => s.to === data.to ? { ...s, status: 'success' } : s));
    });

    socket.on('sms:failed', (data) => {
      setStatus(prev => prev.map(s => s.to === data.to ? { ...s, status: 'failed', error: data.error } : s));
    });

    return () => {
      socket.off('sms:sending');
      socket.off('sms:sent');
      socket.off('sms:failed');
    };
  }, []);

  const sendSingle = async () => {
    if (!phone || !message) return;
    setSending(true);
    try {
      await fetch('http://localhost:5000/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message })
      });
      setPhone('');
      setMessage('');
    } catch (error) {
      console.error(error);
    }
    setSending(false);
  };

  const sendBulk = async () => {
    if (!recipients.length || !message) return;
    setSending(true);
    try {
      await fetch('http://localhost:5000/api/sms/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, message })
      });
      setRecipients([]);
      setMessage('');
    } catch (error) {
      console.error(error);
    }
    setSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          SMS Messaging
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250788123456"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={sendSingle}
            disabled={sending || !phone || !message}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Send SMS
          </button>
        </div>
      </div>

      {status.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Status</h3>
          <div className="space-y-2">
            {status.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{s.to}</span>
                {s.status === 'sending' && <Loader className="w-5 h-5 animate-spin text-blue-600" />}
                {s.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {s.status === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
