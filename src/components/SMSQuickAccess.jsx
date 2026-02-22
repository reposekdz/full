import React from 'react';

const SMSQuickAccess = ({ onNavigate }) => {
  const handleSMSAccess = () => {
    if (onNavigate) {
      onNavigate('sms-management');
    } else {
      window.location.href = '/sms-management';
    }
  };

  return (
    <div className="sms-quick-access">
      <style jsx>{`
        .sms-quick-access {
          position: fixed;
          bottom: 100px;
          right: 20px;
          z-index: 1000;
        }
        .sms-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 20px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }
        .sms-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
        }
        .sms-icon {
          font-size: 18px;
        }
        @media (max-width: 768px) {
          .sms-quick-access {
            bottom: 80px;
            right: 15px;
          }
          .sms-button {
            padding: 12px 16px;
            font-size: 12px;
          }
        }
      `}</style>
      
      <button className="sms-button" onClick={handleSMSAccess} title="SMS Management Panel">
        <span className="sms-icon">📱</span>
        <span>SMS Panel</span>
      </button>
    </div>
  );
};

export default SMSQuickAccess;