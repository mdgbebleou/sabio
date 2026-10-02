import React, { useState } from 'react';

export type UserRole = 'Administrator' | 'Teacher' | 'Accountant' | 'Parent';

interface UserProfileData {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

interface ReusableProfileProps {
  userRole: UserRole;
  userData?: Partial<UserProfileData>;
}

const DEFAULT_USERS: Record<UserRole, UserProfileData> = {
  Administrator: {
    id: 'ADM-0001',
    name: 'Kwame Mensah',
    role: 'Administrator',
    title: 'System Administrator',
    email: 'admin@school.edu.gh',
    phone: '+233 24 123 4567',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  Teacher: {
    id: 'TCH-0042',
    name: 'Sarah Jenkins',
    role: 'Teacher',
    title: 'Science Teacher',
    email: 'sarah.jenkins@school.edu.gh',
    phone: '+233 20 987 6543',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  Accountant: {
    id: 'ACC-0012',
    name: 'Kofi Annan',
    role: 'Accountant',
    title: 'Finance & Accounts Officer',
    email: 'kofi.annan@school.edu.gh',
    phone: '+233 27 555 1234',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  Parent: {
    id: 'PRN-0105',
    name: 'Mrs. Adozovi Mensah',
    role: 'Parent',
    title: 'Parent / Guardian',
    email: 'ama.mensah@email.com',
    phone: '+233 24 000 1122',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
};

export const ReusableProfile: React.FC<ReusableProfileProps> = ({ userRole, userData }) => {
  const user = { ...DEFAULT_USERS[userRole], ...userData };
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications'>('personal');

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
          My Account Profile
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
          Manage your personal details, login credentials, and notification preferences.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT USER SUMMARY CARD */}
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #002b49', marginBottom: '12px' }}
          />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{user.name}</h2>
          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>
            {user.role}
          </span>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>ID: {user.id}</div>
        </div>

        {/* RIGHT MAIN SETTINGS CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TAB BAR */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0' }}>
            {[
              { id: 'personal', label: 'Personal Info' },
              { id: 'security', label: 'Security & Password' },
              { id: 'notifications', label: 'Notification Preferences' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  borderBottom: activeTab === t.id ? '2px solid #002b49' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === t.id ? '#002b49' : '#64748b',
                  fontWeight: activeTab === t.id ? '800' : '500',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Full Name</label>
                  <input type="text" defaultValue={user.name} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Email Address</label>
                  <input type="email" defaultValue={user.email} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Phone Number</label>
                  <input type="text" defaultValue={user.phone} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Designation / Title</label>
                  <input type="text" defaultValue={user.title} readOnly style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box', color: '#64748b' }} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Change Password</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Current Password</label>
                  <input type="password" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>New Password</label>
                  <input type="password" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
                <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', marginTop: '8px', alignSelf: 'flex-start' }}>
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Communication & Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" defaultChecked /> Email alerts for direct messages
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" defaultChecked /> System announcements
                </label>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};