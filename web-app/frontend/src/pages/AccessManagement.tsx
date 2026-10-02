import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'INACTIVE';
  mfaEnabled: boolean;
  riskLevel: 'Normal' | 'Alert' | 'Critical';
}

const mockUsers: UserRecord[] = [
  {
    id: 'USR-00481',
    name: 'Sarah Anderson',
    email: 'admin@school.edu',
    role: 'Administrator',
    status: 'ACTIVE',
    mfaEnabled: true,
    riskLevel: 'Normal',
  },
  {
    id: 'USR-00482',
    name: 'Michael Roberts',
    email: 'm.roberts@school.edu',
    role: 'Teacher',
    status: 'LOCKED',
    mfaEnabled: false,
    riskLevel: 'Alert',
  },
  {
    id: 'USR-00483',
    name: 'Jessica Lee',
    email: 'j.lee@parents.edu',
    role: 'Parent',
    status: 'ACTIVE',
    mfaEnabled: false,
    riskLevel: 'Normal',
  },
];

export const AccessManagement: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'create' | 'reset' | 'suspend' | 'activate' | 'role' | 'escalation' | 'permissions' | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord>(mockUsers[0]);
  const [selectedRoleType, setSelectedRoleType] = useState<string>('Teacher');

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
  };

  const modalContainerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '780px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  const openUserAction = (user: UserRecord, modalType: 'reset' | 'suspend' | 'activate' | 'role' | 'permissions') => {
    setSelectedUser(user);
    setActiveModal(modalType);
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              User & Access Management
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage system accounts, roles, permissions and access activity.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
              Manage Roles
            </button>
            <button style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
              Manage Permissions
            </button>
            <button 
              onClick={() => setActiveModal('create')} 
              style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add User
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL USERS</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>1,842</div>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACTIVE</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1e40af', marginTop: '4px' }}>1,776</div>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>INACTIVE</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#475569', marginTop: '4px' }}>42</div>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SUSPENDED</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>12</div>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>LOCKED</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>7</div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ALERTS</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>5</div>
            <span style={{ fontSize: '10px', color: '#991b1b', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Review</span>
          </div>
        </div>

        {/* USER DIRECTORY TABLE */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>User Directory</h3>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search by name, email, ID..." 
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px' }}>USER</th>
                  <th style={{ padding: '12px 20px' }}>ROLE</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px' }}>AUTHENTICATION</th>
                  <th style={{ padding: '12px 20px' }}>RISK LEVEL</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#002b49', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a', display: 'block' }}>{user.name}</strong>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#334155', fontWeight: '600' }}>{user.role}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        backgroundColor: user.status === 'ACTIVE' ? '#dbeafe' : user.status === 'LOCKED' ? '#fee2e2' : '#f1f5f9',
                        color: user.status === 'ACTIVE' ? '#1e40af' : user.status === 'LOCKED' ? '#991b1b' : '#475569',
                        padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#475569' }}>
                      {user.mfaEnabled ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a', fontWeight: '600' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                          MFA Enabled
                        </span>
                      ) : (
                        'Password only'
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {user.riskLevel === 'Alert' ? (
                        <span style={{ color: '#dc2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                          Alert
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>Normal</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openUserAction(user, 'permissions')} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Permissions</button>
                        <button onClick={() => openUserAction(user, 'role')} style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Role</button>
                        <button onClick={() => openUserAction(user, user.status === 'ACTIVE' ? 'suspend' : 'activate')} style={{ border: 'none', background: 'none', color: user.status === 'ACTIVE' ? '#dc2626' : '#166534', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                        <button onClick={() => openUserAction(user, 'reset')} style={{ border: 'none', background: 'none', color: '#475569', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Reset</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
            <span>Showing 1-3 of 1,842 users</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', cursor: 'pointer' }}>&lt;</button>
              <button style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', cursor: 'pointer' }}>1</button>
              <button style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', cursor: 'pointer' }}>2</button>
              <button style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', cursor: 'pointer' }}>&gt;</button>
            </div>
          </div>
        </div>

        {/* BOTTOM INSIGHTS & DISTRIBUTION ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Access Insights */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Access Insights
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px' }}>
                <strong style={{ color: '#991b1b', fontSize: '12px', display: 'block' }}>Repeated Failed Logins (Security Alert)</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#7f1d1d' }}>
                  7 accounts have recorded repeated failed login attempts from unrecognized IP addresses in the last 24 hours.
                </p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <strong style={{ color: '#0f172a', fontSize: '12px', display: 'block' }}>Inactive Accounts (Attention Required)</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#475569' }}>
                  14 active accounts have not logged in for more than 90 days. Consider suspending access.
                </p>
              </div>

              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px' }}>
                <strong style={{ color: '#1e3a8a', fontSize: '12px', display: 'block' }}>Permission Exceptions (Important)</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#1e40af' }}>
                  3 users have permissions that differ from the standard baseline associated with their assigned role.
                </p>
              </div>
            </div>
          </div>

          {/* User Distribution Progress */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>User Distribution</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>Parents</span>
                  <strong>1,248</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '68%', height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>Students</span>
                  <strong>508</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '28%', height: '100%', backgroundColor: '#475569' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>Teachers & Staff</span>
                  <strong>110</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '12%', height: '100%', backgroundColor: '#1e40af' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>Administrators</span>
                  <strong>12</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '4%', height: '100%', backgroundColor: '#dc2626' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: CREATE NEW USER MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'create' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '780px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Create New User</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Add a new user to the SMIS platform.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>USER INFORMATION</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>FIRST NAME *</label>
                        <input type="text" defaultValue="Jane" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>LAST NAME *</label>
                        <input type="text" defaultValue="Doe" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>EMAIL ADDRESS *</label>
                      <input type="email" defaultValue="jane.doe@example.com" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>PHONE NUMBER</label>
                      <input type="text" defaultValue="+1 (555) 000-0000" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>ROLE & ASSIGNMENT</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {['Student', 'Teacher', 'Parent', 'Administrator', 'Staff', 'Accountant'].map(role => (
                        <button 
                          key={role} 
                          type="button" 
                          onClick={() => setSelectedRoleType(role)}
                          style={{ 
                            padding: '10px 8px', 
                            borderRadius: '8px', 
                            border: selectedRoleType === role ? '2px solid #002b49' : '1px solid #cbd5e1', 
                            backgroundColor: selectedRoleType === role ? '#f0f9ff' : '#ffffff', 
                            fontSize: '11px', 
                            fontWeight: 'bold', 
                            color: '#0f172a', 
                            cursor: 'pointer' 
                          }}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>ACCESS PREVIEW</div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '8px' }}>Based on '{selectedRoleType}' role.</span>
                    
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Academics</span><strong>Full Edit</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Student Mgmt</span><strong>View Only</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Finance</span><strong>No Access</strong></div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>SECURITY & ONBOARDING</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Send Welcome Invitation</span>
                        <input type="checkbox" defaultChecked />
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Require Password Change</span>
                        <input type="checkbox" defaultChecked />
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Require Email Verification</span>
                        <input type="checkbox" defaultChecked />
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Enforce MFA</span>
                        <input type="checkbox" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Create User</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: RESET PASSWORD MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'reset' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '480px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Reset Password</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
                  Select a method to reset the password for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <label style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input type="radio" name="resetMethod" defaultChecked style={{ marginTop: '3px' }} />
                    <div>
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>SEND RESET LINK (RECOMMENDED)</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Sends a secure link to primary email address to create a new password.</span>
                    </div>
                  </label>

                  <label style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input type="radio" name="resetMethod" style={{ marginTop: '3px' }} />
                    <div>
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>GENERATE TEMPORARY PASSWORD</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Creates a one-time password forced to change upon next login.</span>
                    </div>
                  </label>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#64748b' }}>
                  <strong>Security Notice:</strong> This action will be logged in system audit trail. Active sessions will not be terminated automatically.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Execute Reset</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: SUSPEND ACCOUNT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'suspend' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '480px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>Suspend Account</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>REASON FOR SUSPENSION</label>
                  <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>Select Reason...</option>
                    <option>Security Policy Violation</option>
                    <option>Pending Investigation</option>
                    <option>Inactivity</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>DURATION</label>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="radio" name="dur" defaultChecked /> Indefinite</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="radio" name="dur" /> Specific Date</label>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#0f172a', fontWeight: 'bold', marginBottom: '16px' }}>
                  <input type="checkbox" defaultChecked /> SIGN OUT ACTIVE SESSIONS
                </label>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', fontSize: '11px', color: '#991b1b' }}>
                  <strong>SUSPENSION IMPACT:</strong> The user will instantly lose access to all SMIS modules. Automated communications will be halted.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Suspend Account</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: ACTIVATE ACCOUNT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'activate' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '480px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#166534' }}>Activate Account</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
                  You are about to restore access for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
                </p>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#64748b', fontSize: '10px' }}>READINESS CHECK</div>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Email Verified</span><strong>Verified</strong>
                  </div>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Role Assigned</span><strong>{selectedUser.role}</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#166534', fontWeight: 'bold', textAlign: 'center' }}>
                  Account is ready to activate
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#166534', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Activate Now</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 5: ASSIGN ROLE & PRIVILEGE ESCALATION MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'role' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '640px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Assign Role</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{selectedUser.name}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>ID: {selectedUser.id}</span>
                  </div>
                  <span style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>Current: {selectedUser.role}</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>NEW ROLE ASSIGNMENT</label>
                  <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>Administrator</option>
                    <option>Teacher</option>
                    <option>Accountant</option>
                    <option>Staff</option>
                  </select>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', fontSize: '11px', color: '#991b1b', marginBottom: '16px' }}>
                  <strong>Privilege Escalation Warning:</strong> You are about to assign a high-privilege role (Administrator). This grants sweeping access across system configurations.
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>REASON FOR ROLE CHANGE *</label>
                  <textarea placeholder="Required for audit logging... (min 20 characters)" style={{ width: '100%', height: '60px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Review & Confirm Escalation</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 6: EDIT PERMISSIONS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'permissions' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Edit Permissions</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure fine-grained access control for {selectedUser.name}.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '12px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', marginBottom: '10px' }}>STUDENT MANAGEMENT</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(5, 1fr)', gap: '8px', textAlign: 'center', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>Student Profiles</div>
                    <label><input type="radio" name="p1" /></label>
                    <label><input type="radio" name="p1" defaultChecked /></label>
                    <label><input type="radio" name="p1" /></label>
                    <label><input type="radio" name="p1" /></label>
                    <label><input type="radio" name="p1" /></label>
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', marginBottom: '10px' }}>ACADEMIC MANAGEMENT</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(5, 1fr)', gap: '8px', textAlign: 'center', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>Publish Results</div>
                    <label><input type="radio" name="p2" /></label>
                    <label><input type="radio" name="p2" /></label>
                    <label><input type="radio" name="p2" /></label>
                    <label><input type="radio" name="p2" /></label>
                    <label><input type="radio" name="p2" defaultChecked /></label>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}>Reset to Role Defaults</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Save Permissions</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};