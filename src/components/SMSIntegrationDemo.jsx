import React, { useState } from 'react';
import smsIntegration from '../utils/smsIntegration';

const SMSIntegrationDemo = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { message, type, timestamp }]);
  };

  const handleSendEvent = async (eventType, data) => {
    setLoading(true);
    try {
      const result = await smsIntegration.sendEventNotification(eventType, data);
      addResult(`${eventType}: ${result.success ? 'Sent successfully' : result.error}`, result.success ? 'success' : 'error');
    } catch (error) {
      addResult(`Error: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  const testScenarios = [
    {
      name: 'School Event - Sports Day',
      action: () => handleSendEvent('school_event', {
        eventName: 'Sports Day',
        date: '2024-03-15',
        time: '09:00',
        description: 'Annual sports competition for all students'
      })
    },
    {
      name: 'Emergency Alert',
      action: () => handleSendEvent('emergency', {
        message: 'School closed due to weather conditions. All students should stay home.'
      })
    },
    {
      name: 'Parent Meeting Notice',
      action: () => handleSendEvent('meeting_notice', {
        date: '2024-03-20',
        time: '14:00',
        location: 'School Hall',
        agenda: 'Discuss academic progress'
      })
    },
    {
      name: 'Fee Deadline Reminder',
      action: () => handleSendEvent('fee_deadline', {
        deadline: '2024-03-25',
        amount: '150,000'
      })
    },
    {
      name: 'Student Achievement',
      action: () => handleSendEvent('achievement', {
        studentName: 'John Doe',
        subject: 'Mathematics',
        achievement: 'First place in competition'
      })
    },
    {
      name: 'Holiday Notice',
      action: () => handleSendEvent('holiday_notice', {
        startDate: '2024-04-01',
        endDate: '2024-04-07',
        reason: 'Easter holidays'
      })
    }
  ];

  return (
    <div className="sms-demo">
      <style jsx>{`
        .sms-demo {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .demo-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
        }
        .demo-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .demo-subtitle {
          opacity: 0.9;
        }
        .scenarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .scenario-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }
        .scenario-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .scenario-name {
          font-weight: bold;
          margin-bottom: 10px;
          color: #495057;
        }
        .test-button {
          background: linear-gradient(45deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          width: 100%;
        }
        .test-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(40, 167, 69, 0.3);
        }
        .test-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .results-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .results-title {
          font-weight: bold;
          margin-bottom: 15px;
          color: #495057;
        }
        .result-item {
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 6px;
          font-size: 0.9rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .result-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .result-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .result-info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        .result-timestamp {
          font-size: 0.8rem;
          opacity: 0.7;
        }
        .clear-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .integration-info {
          background: #e7f3ff;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          margin-bottom: 20px;
        }
        .integration-title {
          font-weight: bold;
          color: #004085;
          margin-bottom: 8px;
        }
        .integration-text {
          color: #004085;
          font-size: 0.9rem;
          line-height: 1.5;
        }
      `}</style>

      <div className="demo-header">
        <div className="demo-title">📱 SMS Integration System Demo</div>
        <div className="demo-subtitle">Test SMS notifications for any school events</div>
      </div>

      <div className="integration-info">
        <div className="integration-title">🚀 How to Use SMS Integration</div>
        <div className="integration-text">
          This system allows you to send SMS notifications for any school events. 
          Simply import the smsIntegration utility and call the appropriate method. 
          All messages are automatically formatted in Kinyarwanda and sent to parents.
        </div>
      </div>

      <div className="scenarios-grid">
        {testScenarios.map((scenario, index) => (
          <div key={index} className="scenario-card">
            <div className="scenario-name">{scenario.name}</div>
            <button 
              className="test-button"
              onClick={scenario.action}
              disabled={loading}
            >
              {loading ? <span className="loading-spinner"></span> : 'Send SMS'}
            </button>
          </div>
        ))}
      </div>

      <div className="results-section">
        <div className="results-title">📋 SMS Results</div>
        <button className="clear-button" onClick={() => setResults([])}>
          Clear Results
        </button>
        {results.length === 0 ? (
          <div className="result-item result-info">
            <span>No SMS tests run yet. Click any scenario above to test.</span>
          </div>
        ) : (
          results.map((result, index) => (
            <div key={index} className={`result-item result-${result.type}`}>
              <span>{result.message}</span>
              <span className="result-timestamp">{result.timestamp}</span>
            </div>
          ))
        )}
      </div>

      <div className="integration-info" style={{ marginTop: '20px' }}>
        <div className="integration-title">💡 Integration Examples</div>
        <div className="integration-text">
          <strong>In any component:</strong><br/>
          <code>import smsIntegration from '../utils/smsIntegration';</code><br/>
          <code>await smsIntegration.notifySchoolEvent('Sports Day', '2024-03-15', '09:00', 'Annual competition');</code><br/><br/>
          
          <strong>For conduct removal:</strong><br/>
          <code>await smsIntegration.integrateWithConductSystem(studentId, conductData);</code><br/><br/>
          
          <strong>For custom messages:</strong><br/>
          <code>await smsIntegration.sendCustomBulkSMS(recipients, 'Title', 'Message', 'high');</code>
        </div>
      </div>
    </div>
  );
};

export default SMSIntegrationDemo;