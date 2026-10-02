import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';

export type UserRole = 'Administrator' | 'Teacher' | 'Accountant';

export interface TabConfig {
  id: string;
  label: string;
}

interface ReusableSettingsProps {
  userRole?: UserRole;
  allowedTabs?: TabConfig[];
}

const DEFAULT_TABS_BY_ROLE: Record<UserRole, TabConfig[]> = {
  Administrator: [
    { id: 'overview', label: 'Overview & Health' },
    { id: 'profile', label: 'School Profile' },
    { id: 'academic', label: 'Academic & Grading' },
    { id: 'finance', label: 'Fee & Finance' },
    { id: 'attendance', label: 'Attendance & Communication' },
    { id: 'security', label: 'Preferences & Security' },
  ],
  Teacher: [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic & Grading Rules' },
    { id: 'attendance', label: 'Attendance & Notifications' },
  ],
  Accountant: [
    { id: 'overview', label: 'Overview' },
    { id: 'finance', label: 'Fee & Finance Setup' },
    { id: 'attendance', label: 'Communication Preferences' },
  ],
};

export const ReusableSettings: React.FC<ReusableSettingsProps> = ({
  userRole = 'Administrator',
  allowedTabs
}) => {
  const tabsToRender = allowedTabs || DEFAULT_TABS_BY_ROLE[userRole];
  const [activeTab, setActiveTab] = useState<string>(tabsToRender[0]?.id || 'overview');
  const [showImpactModal, setShowImpactModal] = useState(false);

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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '600px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION WITH ROLE BADGE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                {userRole} Settings
              </h1>
              <span style={{ backgroundColor: '#002b49', color: '#ffffff', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                {userRole} Mode
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Configure preferences, rules, and parameters allocated for your {userRole.toLowerCase()} account scope.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
              Discard Changes
            </button>
            <button 
              onClick={() => setShowImpactModal(true)} 
              style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* DYNAMIC TAB NAVIGATION */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto' }}>
          {tabsToRender.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #002b49' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? '#002b49' : '#64748b',
                fontWeight: activeTab === tab.id ? '800' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & HEALTH */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div>
            {userRole === 'Administrator' && (
              <div style={{ ...cardStyle, backgroundColor: '#f8fafc', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>System Configuration Health</h3>
                  </div>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    92% Complete
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SCHOOL PROFILE</span>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>Configured</div>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACADEMIC CAL</span>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>Configured</div>
                  </div>
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>FEE CONFIG</span>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#dc2626', marginTop: '4px' }}>Attention Req.</div>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ATTENDANCE</span>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>Configured</div>
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC CARD GRID BASED ON ROLE TABS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
              {tabsToRender.filter(t => t.id !== 'overview').map(tab => (
                <div key={tab.id} style={cardStyle}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{tab.label}</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Configure parameters for {tab.label.toLowerCase()}.</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{userRole} Access</span>
                    <button onClick={() => setActiveTab(tab.id)} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Manage →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SCHOOL PROFILE */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && userRole === 'Administrator' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Institutional Identity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>School Name</label>
                  <input type="text" defaultValue="SABIO Academy Achimota" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Registration Code</label>
                  <input type="text" defaultValue="LIN-4421-A" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>PREVIEW</div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#f8fafc', fontSize: '11px' }}>
                <strong style={{ fontSize: '14px', color: '#002b49', display: 'block' }}>SABIO ACADEMY ACHIMOTA</strong>
                <span style={{ color: '#64748b' }}>LIN-4421-A | admin@sabio.edu.gh</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: ACADEMIC & GRADING (ROLE RESTRICTED ENHANCEMENTS) */}
        {/* ========================================================================= */}
        {activeTab === 'academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {userRole === 'Teacher' ? 'Grading & Class Entry Rules' : 'Academic Year & Promotion Rules'}
              </h3>
              
              {userRole === 'Teacher' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Notify on Grade Submission Overdue</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Allow Draft Score Saving before final publish</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Minimum GPA Required</label>
                    <input type="text" defaultValue="2.0" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Max Failed Core Subjects</label>
                    <input type="text" defaultValue="2" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: FEE & FINANCE */}
        {/* ========================================================================= */}
        {activeTab === 'finance' && (userRole === 'Administrator' || userRole === 'Accountant') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Currency Config</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Base Currency</label>
                <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                  <option>GHS - Ghanaian Cedi</option>
                  <option>USD - US Dollar</option>
                </select>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Financial Controls</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Require Payment Verification</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Require Refund Approval</span>
                  <input type="checkbox" defaultChecked />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: ATTENDANCE & COMMUNICATION */}
        {/* ========================================================================= */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Threshold Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>MINIMUM (%)</label>
                  <input type="number" defaultValue={80} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>WARNING (%)</label>
                  <input type="number" defaultValue={85} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>CRITICAL (%)</label>
                  <input type="number" defaultValue={70} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Communication Setup</h3>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" defaultChecked /> Email</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" defaultChecked /> In-App</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> SMS</label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHANGE REVIEW MODAL */}
        {/* ========================================================================= */}
        {showImpactModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Confirm Settings Save</h3>
                <button onClick={() => setShowImpactModal(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                  You are about to save the updated settings for <strong>{userRole}</strong> context. These rules will immediately apply across active SMIS modules.
                </p>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowImpactModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setShowImpactModal(false)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm & Save</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};