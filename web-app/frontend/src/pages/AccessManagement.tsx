import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';
import { AddUserModal } from '../components/AddUserModal';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';
  mfaEnabled: boolean;
  riskLevel: 'Normal' | 'Alert' | 'Critical';
}

export const AccessManagement: React.FC = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  
  // Filtering & Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Action Menu Dropdown State
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserRecord | null>(null);
  const [activeModalType, setActiveModalType] = useState<string | null>(null);

  // Close menu when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuUserId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching profiles:', error);
      } else if (data) {
        const mappedUsers: UserRecord[] = data.map((profile: any) => ({
          id: profile.id || 'USR-UNKNOWN',
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Unnamed User',
          email: profile.email || '',
          role: profile.role || 'Staff',
          status: profile.status || 'ACTIVE',
          mfaEnabled: profile.mfa_enabled || false,
          riskLevel: profile.risk_level || 'Normal'
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
              Monitor system accounts, security health, roles, and automated permissions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => setIsAddUserOpen(true)} 
              style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add User
            </button>
          </div>
        </div>

        {/* METRICS / FILTER CARDS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          
          <div 
            style={{ ...cardStyle, borderColor: statusFilter === 'ALL' ? '#002b49' : '#e2e8f0', backgroundColor: statusFilter === 'ALL' ? '#f0f9ff' : '#ffffff' }}
            onClick={() => setStatusFilter('ALL')}
          >
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Users</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{users.length}</div>
          </div>

          <div 
            style={{ ...cardStyle, borderColor: statusFilter === 'ACTIVE' ? '#1e40af' : '#e2e8f0', backgroundColor: statusFilter === 'ACTIVE' ? '#eff6ff' : '#ffffff' }}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase' }}>Active</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e40af', marginTop: '4px' }}>
              {users.filter(u => u.status === 'ACTIVE').length}
            </div>
          </div>

          <div 
            style={{ ...cardStyle, borderColor: statusFilter === 'INACTIVE' ? '#475569' : '#e2e8f0', backgroundColor: statusFilter === 'INACTIVE' ? '#f1f5f9' : '#ffffff' }}
            onClick={() => setStatusFilter('INACTIVE')}
          >
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Inactive</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#475569', marginTop: '4px' }}>
              {users.filter(u => u.status === 'INACTIVE').length}
            </div>
          </div>

          <div 
            style={{ ...cardStyle, borderColor: statusFilter === 'SUSPENDED' ? '#dc2626' : '#e2e8f0', backgroundColor: statusFilter === 'SUSPENDED' ? '#fef2f2' : '#ffffff' }}
            onClick={() => setStatusFilter('SUSPENDED')}
          >
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase' }}>Suspended</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>
              {users.filter(u => u.status === 'SUSPENDED').length}
            </div>
          </div>

          <div 
            style={{ ...cardStyle, borderColor: statusFilter === 'LOCKED' ? '#b45309' : '#e2e8f0', backgroundColor: statusFilter === 'LOCKED' ? '#fffbeb' : '#ffffff' }}
            onClick={() => setStatusFilter('LOCKED')}
          >
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>Locked</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#b45309', marginTop: '4px' }}>
              {users.filter(u => u.status === 'LOCKED').length}
            </div>
          </div>

        </div>

        {/* USERS CONTAINER */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Users</h3>
              {statusFilter !== 'ALL' && (
                <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', color: '#334155' }}>
                  Filtered by: {statusFilter} <button onClick={() => setStatusFilter('ALL')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '4px' }}>✕</button>
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Manual Status Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>Status:</span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="LOCKED">Locked</option>
                </select>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, role..." 
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', minHeight: '300px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px' }}>USER</th>
                  <th style={{ padding: '12px 20px' }}>ROLE</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px' }}>AUTHENTICATION</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading users from database...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No users found matching your criteria.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#002b49', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                            {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
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
                          backgroundColor: user.status === 'ACTIVE' ? '#dbeafe' : user.status === 'SUSPENDED' ? '#fee2e2' : user.status === 'LOCKED' ? '#fffbeb' : '#f1f5f9',
                          color: user.status === 'ACTIVE' ? '#1e40af' : user.status === 'SUSPENDED' ? '#991b1b' : user.status === 'LOCKED' ? '#92400e' : '#475569',
                          padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>
                        {user.mfaEnabled ? 'MFA Enabled' : 'Standard Password'}
                      </td>
                      
                      {/* THREE-DOTS ACTION MENU COLUMN */}
                      <td style={{ padding: '14px 20px', textAlign: 'right', position: 'relative' }}>
                        <button 
                          onClick={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                          style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold', color: '#334155' }}
                        >
                          ⋮
                        </button>

                        {activeMenuUserId === user.id && (
                          <div 
                            ref={menuRef}
                            style={{
                              position: 'absolute', right: '20px', top: '50px', backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                              zIndex: 50, width: '180px', textAlign: 'left', padding: '6px 0'
                            }}
                          >
                            <div style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>MANAGE USER</div>
                            
                            <button onClick={() => { setSelectedUserForAction(user); setActiveModalType('permissions'); setActiveMenuUserId(null); }} style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>Edit Permissions</button>
                            <button onClick={() => { setSelectedUserForAction(user); setActiveModalType('role'); setActiveMenuUserId(null); }} style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>Assign Role</button>
                            <button onClick={() => { setSelectedUserForAction(user); setActiveModalType('reset'); setActiveMenuUserId(null); }} style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>Reset Password</button>
                            <button onClick={() => { setSelectedUserForAction(user); setActiveModalType('sessions'); setActiveMenuUserId(null); }} style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>Force Sign Out</button>
                            <button onClick={() => { setSelectedUserForAction(user); setActiveModalType('audit'); setActiveMenuUserId(null); }} style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>View Audit Logs</button>

                            <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }}></div>

                            {user.status === 'ACTIVE' ? (
                              <button onClick={() => { setSelectedUserForAction(user); setActiveModalType('suspend'); setActiveMenuUserId(null); }} style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '11px', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Suspend Account</button>
                            ) : (
                              <button onClick={() => { setSelectedUserForAction(user); setActiveModalType('activate'); setActiveMenuUserId(null); }} style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '11px', color: '#166534', cursor: 'pointer', fontWeight: 'bold' }}>Activate Account</button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* UNIFIED DYNAMIC ADD USER MODAL */}
        <AddUserModal 
          isOpen={isAddUserOpen} 
          onClose={() => setIsAddUserOpen(false)} 
          onUserAdded={fetchUsers} 
          defaultRole="Teacher"
        />

        {/* ACTION MODAL POPUP PLACEHOLDER */}
        {activeModalType && selectedUserForAction && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Action: {activeModalType.toUpperCase()}</h3>
                <button onClick={() => setActiveModalType(null)} style={{ border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '24px', fontSize: '12px', color: '#334155' }}>
                Target User: <strong>{selectedUserForAction.name}</strong> ({selectedUserForAction.email})
                <p style={{ marginTop: '10px', color: '#64748b' }}>Execute advanced security and role workflows for this account securely via Supabase backend.</p>
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setActiveModalType(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { alert(`Successfully executed ${activeModalType} for ${selectedUserForAction.name}`); setActiveModalType(null); }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Action</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};