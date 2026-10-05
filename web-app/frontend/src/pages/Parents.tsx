import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';
import { AddUserModal } from '../components/AddUserModal'; // Reusing your shared Add User modal

interface LinkedStudent {
  name: string;
  className: string;
}

interface ParentData {
  id: string;
  customId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  linkedStudents: LinkedStudent[];
  engagement: 'High' | 'Moderate' | 'Low' | 'Inactive';
  lastActive: string;
  feeAccountStatus: 'Good Standing' | 'Arrears' | 'Pending Review';
  status: 'Active' | 'Locked' | 'Deactivated';
}

interface StudentOption {
  id: string;
  name: string;
  className: string;
  customId: string;
}

export const Parents: React.FC = () => {
  const [parents, setParents] = useState<ParentData[]>([]);
  const [studentsList, setStudentsList] = useState<StudentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngagement, setSelectedEngagement] = useState('All');

  // KPI States
  const [totalParentsCount, setTotalParentsCount] = useState(0);
  const [activeParentsCount, setActiveParentsCount] = useState(0);
  const [attentionCount, setAttentionCount] = useState(0);

  // Modal Control States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'link' | 'reset' | 'deactivate' | null>(null);
  const [selectedParent, setSelectedParent] = useState<ParentData | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Link Student Modal State
  const [selectedStudentToLink, setSelectedStudentToLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '620px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  // Fetch Parents (profiles with role='parent'), their linked students, and student dropdown list sorted newest first
  const loadData = async () => {
    let isMounted = true;
    try {
      setIsLoading(true);

      // 1. Fetch Students for linking dropdown
      const { data: dbStudents } = await supabase
        .from('students')
        .select('id, first_name, last_name, custom_id, class_name')
        .order('created_at', { ascending: false });

      if (dbStudents && isMounted) {
        setStudentsList(dbStudents.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          className: (s.class_name as string) || 'Unassigned',
          customId: (s.custom_id as string) || ''
        })));
      }

      // 2. Fetch Parent Profiles and join their linked wards from students table
      const { data: dbParents, error: parentErr } = await supabase
        .from('profiles')
        .select(`
          *,
          students:students(first_name, last_name, class_name)
        `)
        .eq('role', 'parent')
        .order('created_at', { ascending: false });

      if (parentErr) throw parentErr;

      const formattedParents: ParentData[] = (dbParents || []).map((p: Record<string, unknown>) => {
        const rawStudents = (p.students as Array<Record<string, unknown>>) || [];
        const linkedWards: LinkedStudent[] = rawStudents.map(st => ({
          name: `${st.first_name || ''} ${st.last_name || ''}`.trim(),
          className: (st.class_name as string) || 'Unassigned'
        }));

        return {
          id: p.id as string,
          customId: (p.custom_id as string) || 'PRN-24-0000',
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || (p.full_name as string) || 'Unnamed Parent',
          email: (p.email as string) || '',
          phone: (p.primary_phone as string) || (p.phone as string) || '',
          avatarUrl: (p.avatar_url as string) || undefined,
          linkedStudents: linkedWards,
          engagement: (p.engagement as ParentData['engagement']) || 'Moderate',
          lastActive: p.updated_at ? new Date(p.updated_at as string).toLocaleDateString() : 'Recently',
          feeAccountStatus: (p.fee_account_status as ParentData['feeAccountStatus']) || 'Good Standing',
          status: (p.status as ParentData['status']) || 'Active',
        };
      });

      if (isMounted) {
        setParents(formattedParents);
        setTotalParentsCount(formattedParents.length);
        setActiveParentsCount(formattedParents.filter(p => p.status === 'Active').length);
        setAttentionCount(formattedParents.filter(p => p.engagement === 'Low' || p.status === 'Locked').length);
      }
    } catch (err) {
      console.error('Error fetching parents:', err);
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAction = (type: 'link' | 'reset' | 'deactivate', parent: ParentData) => {
    setSelectedParent(parent);
    setActiveModal(type);
    setOpenMenuId(null);
    setSelectedStudentToLink('');
  };

  // Execute Link Student to Parent
  const executeLinkStudent = async () => {
    if (!selectedParent || !selectedStudentToLink) {
      alert('Please select a student ward to link.');
      return;
    }
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('students')
        .update({ parent_id: selectedParent.id })
        .eq('id', selectedStudentToLink);

      if (error) throw error;
      alert('Student linked successfully!');
      setActiveModal(null);
      loadData();
    } catch (err: unknown) {
      alert('Error linking student: ' + String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Reset Account Simulation / Action
  const executeResetAccount = async () => {
    if (!selectedParent) return;
    alert(`Password reset instructions simulated and sent to ${selectedParent.email}`);
    setActiveModal(null);
  };

  // Execute Deactivate Account
  const executeDeactivateAccount = async () => {
    if (!selectedParent) return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'Deactivated' })
        .eq('id', selectedParent.id);

      if (error) throw error;
      alert('Parent account deactivated successfully!');
      setActiveModal(null);
      loadData();
    } catch (err: unknown) {
      alert('Error deactivating account: ' + String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredParents = parents.filter(parent => {
    const matchesSearch = 
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.customId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEngagement = selectedEngagement === 'All' || parent.engagement === selectedEngagement;

    return matchesSearch && matchesEngagement;
  });

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Parents</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage parent accounts, student relationships and school engagement from Supabase profiles.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#002b49', border: 'none', padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer'
              }}
            >
              + Add Parent
            </button>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL PARENTS</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{totalParentsCount}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACTIVE PARENTS</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{activeParentsCount}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ENGAGEMENT RATE</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>Live</div>
          </div>
          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ATTENTION REQUIRED</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>{attentionCount}</div>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by parent name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>
            <select value={selectedEngagement} onChange={(e) => setSelectedEngagement(e.target.value)} style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
              <option value="All">Engagement (All)</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* PARENTS TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'visible' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>PARENT / GUARDIAN</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>CONTACT DETAILS</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>LINKED WARDS</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>ENGAGEMENT</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>FEE ACCOUNT</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>LAST ACTIVE</th>
                  <th style={{ padding: '16px', textAlign: 'center', width: '40px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading parents from Supabase...</td>
                  </tr>
                ) : filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                      No parents found. Click "+ Add Parent" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((parent) => (
                    <tr key={parent.id} style={{ borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                            {parent.avatarUrl ? <img src={parent.avatarUrl} alt={parent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : parent.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{parent.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {parent.customId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#334155', fontWeight: '500' }}>{parent.email}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{parent.phone}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {parent.linkedStudents.length === 0 ? (
                          <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No linked students</span>
                        ) : (
                          parent.linkedStudents.map((ward, idx) => (
                            <div key={idx} style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', display: 'inline-block', marginRight: '4px', marginBottom: '2px' }}>
                              {ward.name} ({ward.className})
                            </div>
                          ))
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          backgroundColor: parent.engagement === 'High' ? '#dbeafe' : parent.engagement === 'Low' ? '#fee2e2' : '#f1f5f9',
                          color: parent.engagement === 'High' ? '#1e40af' : parent.engagement === 'Low' ? '#991b1b' : '#334155',
                          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                        }}>
                          {parent.engagement}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          backgroundColor: parent.feeAccountStatus === 'Good Standing' ? '#dcfce7' : '#fee2e2',
                          color: parent.feeAccountStatus === 'Good Standing' ? '#166534' : '#991b1b',
                          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                        }}>
                          {parent.feeAccountStatus}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#64748b' }}>{parent.lastActive}</td>
                      
                      <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => setOpenMenuId(openMenuId === parent.id ? null : parent.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>⋮</button>
                        {openMenuId === parent.id && (
                          <div style={{ position: 'absolute', right: '16px', top: '40px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '180px', overflow: 'hidden', textAlign: 'left' }}>
                            <button onClick={() => handleOpenAction('link', parent)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                              Link Student Ward
                            </button>
                            <button onClick={() => handleOpenAction('reset', parent)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', borderTop: '1px solid #f1f5f9' }}>
                              Reset Portal Account
                            </button>
                            <button onClick={() => handleOpenAction('deactivate', parent)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer', borderTop: '1px solid #f1f5f9' }}>
                              Deactivate Account
                            </button>
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

        {/* INTEGRATED SHARED ADD USER MODAL (DEFAULT ROLE: Parent) */}
        <AddUserModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onUserAdded={() => {
            loadData();
          }}
          defaultRole="Parent"
        />

        {/* POPUP 2: LINK PARENT TO STUDENT MODAL */}
        {activeModal === 'link' && selectedParent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Link Student Ward</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px' }}>{selectedParent.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {selectedParent.customId} • {selectedParent.phone}</div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>SELECT STUDENT WARD</div>
                <select 
                  value={selectedStudentToLink}
                  onChange={(e) => setSelectedStudentToLink(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '16px' }}
                >
                  <option value="">Choose student from database...</option>
                  {studentsList.map(stu => (
                    <option key={stu.id} value={stu.id}>{stu.name} ({stu.className})</option>
                  ))}
                </select>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={executeLinkStudent} disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>{isSubmitting ? 'Linking...' : 'Confirm Link'}</button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 3: RESET ACCOUNT MODAL */}
        {activeModal === 'reset' && selectedParent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Reset Parent Account</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ fontSize: '13px', color: '#334155' }}>Reset portal access and send new temporary credentials for <strong>{selectedParent.name}</strong>?</p>
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={executeResetAccount} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Reset Account</button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 4: DEACTIVATE ACCOUNT MODAL */}
        {activeModal === 'deactivate' && selectedParent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>Deactivate Parent Account</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ fontSize: '13px', color: '#334155' }}>Are you sure you want to deactivate <strong>{selectedParent.name}</strong>? They will no longer be able to log in.</p>
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={executeDeactivateAccount} disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#b91c1c', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>{isSubmitting ? 'Deactivating...' : 'Deactivate'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
