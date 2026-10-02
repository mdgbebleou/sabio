import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { userService, type UserDTO } from '../services/userService';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error("API Service Error:", err);
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'Authentication failed. Please log in again.'
          : 'Could not connect to Django backend server. Ensure server is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(search) || 
                          (user.email && user.email.toLowerCase().includes(search)) || 
                          (user.custom_id && user.custom_id.toLowerCase().includes(search));

    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Admin': return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
      case 'Teacher': return { backgroundColor: '#e0f2fe', color: '#0369a1' };
      case 'Accountant': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Parent': return { backgroundColor: '#fef3c7', color: '#92400e' };
      default: return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Active': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Suspended': return { backgroundColor: '#ffe4e6', color: '#9f1239' };
      case 'Pending': return { backgroundColor: '#fef3c7', color: '#92400e' };
      default: return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* PAGE HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              User Management & Access Control
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage system accounts, roles (Admin, Teacher, Accountant, Parent), and privileges.
            </p>
          </div>

          <button style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create New User
          </button>
        </div>

        {/* FILTERS & SEARCH BAR */}
        <div style={{ ...cardStyle, padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

          <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search by Name, Email, or User ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: '12px', color: '#0f172a', width: '100%' }}
            />
          </div>

          {/* Corrected Roles: Admin, Teacher, Accountant, Parent */}
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ flex: '1 1 120px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', color: '#334155', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Teacher">Teacher</option>
            <option value="Accountant">Accountant</option>
            <option value="Parent">Parent</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ flex: '1 1 120px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', color: '#334155', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>

          <button 
            onClick={fetchUsers}
            style={{ border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            🔄 Refresh
          </button>

        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
            ⚠️ {error}
          </div>
        )}

        {/* RESPONSIVE TABLE CONTAINER */}
        <div style={{ ...cardStyle, overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 8px', fontWeight: '800' }}>USER ID</th>
                <th style={{ padding: '12px 8px', fontWeight: '800' }}>USER NAME</th>
                <th style={{ padding: '12px 8px', fontWeight: '800' }}>EMAIL ADDRESS</th>
                <th style={{ padding: '12px 8px', fontWeight: '800' }}>ROLE</th>
                <th style={{ padding: '12px 8px', fontWeight: '800' }}>STATUS</th>
                <th style={{ padding: '12px 8px', fontWeight: '800' }}>LAST ACTIVE</th>
                <th style={{ padding: '12px 8px', fontWeight: '800', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 'bold' }}>
                    Loading database records...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>

                    <td style={{ padding: '14px 8px', fontWeight: 'bold', color: '#002b49', fontFamily: 'monospace' }}>
                      {u.custom_id}
                    </td>

                    <td style={{ padding: '14px 8px', fontWeight: 'bold', color: '#0f172a' }}>
                      {u.first_name} {u.last_name}
                    </td>

                    <td style={{ padding: '14px 8px', color: '#475569' }}>
                      {u.email}
                    </td>

                    <td style={{ padding: '14px 8px' }}>
                      <span style={{ ...getRoleBadgeStyle(u.role || 'Admin'), padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        {u.role || 'Admin'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 8px' }}>
                      <span style={{ ...getStatusBadgeStyle(u.status || 'Active'), padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        {u.status || 'Active'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 8px', color: '#64748b', fontSize: '12px' }}>
                      {u.last_active || 'N/A'}
                    </td>

                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                        <button style={{ border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                          Edit
                        </button>
                        <button style={{ border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', color: '#0369a1', cursor: 'pointer' }}>
                          Reset Key
                        </button>
                        <button style={{ border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', color: u.status === 'Suspended' ? '#166534' : '#dc2626', cursor: 'pointer' }}>
                          {u.status === 'Suspended' ? 'Unlock' : 'Lock'}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold' }}>
                    No users found in database. Click "Create New User" to populate real data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
};