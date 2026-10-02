import React, { useState } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';

export const AccountantSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  
  // Profile state
  const [fullName, setFullName] = useState('Mavis Donko');
  const [email, setEmail] = useState('mavis.donko@sabiosmis.edu.gh');
  const [phone, setPhone] = useState('+233 24 123 4567');

  // Preferences state
  const [currency, setCurrency] = useState('GHS (Ghana Cedi)');
  const [fiscalYear, setFiscalYear] = useState('2025/2026');
  const [autoReceipts, setAutoReceipts] = useState(true);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [overdueReminders, setOverdueReminders] = useState(true);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
    marginBottom: '20px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '800',
    color: '#334155',
    display: 'block',
    marginBottom: '6px',
    textTransform: 'uppercase',
  };

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* PAGE HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Accountant Settings
          </h1>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Manage your profile credentials, notification channels, and financial preferences.</span>
        </div>

        {/* SETTINGS TABS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['Profile', 'Financial Preferences', 'Notifications', 'Security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === tab ? '1px solid #002b49' : '1px solid #cbd5e1',
                backgroundColor: activeTab === tab ? '#002b49' : '#ffffff',
                color: activeTab === tab ? '#ffffff' : '#334155',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: PROFILE */}
        {activeTab === 'Profile' && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Personal Information</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60" 
                  alt="Mavis Donko" 
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} 
                />
                <div>
                  <button style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginRight: '8px' }}>
                    Change Avatar
                  </button>
                  <button style={{ backgroundColor: '#f8fafc', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Assigned Role</label>
                  <input type="text" value="District Accountant" disabled style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FINANCIAL PREFERENCES */}
        {activeTab === 'Financial Preferences' && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Financial System Configurations</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Default Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={inputStyle}>
                    <option>GHS (Ghana Cedi)</option>
                    <option>USD (US Dollar)</option>
                    <option>EUR (Euro)</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Active Academic Year</label>
                  <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} style={inputStyle}>
                    <option>2025/2026</option>
                    <option>2024/2025</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input 
                  type="checkbox" 
                  checked={autoReceipts} 
                  onChange={(e) => setAutoReceipts(e.target.checked)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Automatic Receipt Generation</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Automatically generate and email digital payment receipts upon transaction verification.</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'Notifications' && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Notification Channels</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Email Alerts</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Receive instant email summaries for incoming student bank transfers and pending requests.</span>
                  </div>
                  <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>SMS Notifications</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Get urgent text messages for high-value transaction flags or system alerts.</span>
                  </div>
                  <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Overdue Balance Reminders</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Automatic weekly reminders for student accounts exceeding 30 days overdue.</span>
                  </div>
                  <input type="checkbox" checked={overdueReminders} onChange={(e) => setOverdueReminders(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Update Notifications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY */}
        {activeTab === 'Security' && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Change Password</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input type="password" placeholder="••••••••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" placeholder="••••••••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input type="password" placeholder="••••••••••••" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccountantLayout>
  );
};