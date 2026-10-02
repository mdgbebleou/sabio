import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface ParentData {
  id: string;
  customId: string;
  name: string;
  email: string;
  phone: string;
  linkedStudents: { name: string; className: string }[];
  engagement: 'High' | 'Moderate' | 'Low' | 'Inactive';
  lastActive: string;
  feeAccountStatus: 'Good Standing' | 'Arrears' | 'Pending Review';
  status: 'Active' | 'Locked' | 'Deactivated';
}

const mockParents: ParentData[] = [
  {
    id: '1',
    customId: 'PRN-24-8901',
    name: 'Sarah Jenkins',
    email: 's.jenkins@example.com',
    phone: '(555) 123-4567',
    linkedStudents: [{ name: 'Emily Jenkins', className: 'Grade 10' }, { name: 'Leo Jenkins', className: 'Grade 8' }],
    engagement: 'Low',
    lastActive: 'Oct 24, 2023 - 09:41 AM',
    feeAccountStatus: 'Good Standing',
    status: 'Active',
  },
  {
    id: '2',
    customId: 'P-84920',
    name: 'Robert Chen',
    email: 'r.chen@example.com',
    phone: '(555) 012-3456',
    linkedStudents: [{ name: 'Mia Chen', className: 'Grade 8' }],
    engagement: 'High',
    lastActive: '2 hours ago',
    feeAccountStatus: 'Good Standing',
    status: 'Active',
  },
  {
    id: '3',
    customId: 'PRN-24-8903',
    name: 'Marcus James',
    email: 'marcus.james@example.com',
    phone: '(555) 987-6543',
    linkedStudents: [{ name: 'Elijah James', className: 'Grade 11' }],
    engagement: 'Moderate',
    lastActive: 'Yesterday',
    feeAccountStatus: 'Arrears',
    status: 'Locked',
  },
];

export const Parents: React.FC = () => {
  const [parents, setParents] = useState<ParentData[]>(mockParents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEngagement, setSelectedEngagement] = useState('All');

  // Modal Control States
  const [activeModal, setActiveModal] = useState<'add' | 'link' | 'reset' | 'deactivate' | null>(null);
  const [selectedParent, setSelectedParent] = useState<ParentData | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form Input States
  const [resetOption, setResetOption] = useState<'password' | 'access' | 'activation'>('password');
  const [deactivateOption, setDeactivateOption] = useState<'keep' | 'unlink'>('keep');
  const [isPrimaryGuardian, setIsPrimaryGuardian] = useState(true);

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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '640px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  const handleOpenAction = (type: 'link' | 'reset' | 'deactivate', parent: ParentData) => {
    setSelectedParent(parent);
    setActiveModal(type);
    setOpenMenuId(null);
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Parents</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage parent accounts, student relationships and school engagement.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px',
              borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>

            <button 
              onClick={() => setActiveModal('add')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#002b49', border: 'none', padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Parent
            </button>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL PARENTS</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>986</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#1e40af', marginTop: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              +24 this term
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACTIVE PARENTS</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 22 4"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>912</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}><strong>92%</strong> registered</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ENGAGEMENT RATE</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>78%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#1e40af', marginTop: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              +4% vs last month
            </div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ATTENTION REQUIRED</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>74</div>
            <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '4px' }}>27 Low Engagement | 18 Inactive</div>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '12px' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search by parent name, email, phone, or ward..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>
            <select value={selectedEngagement} onChange={(e) => setSelectedEngagement(e.target.value)} style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
              <option value="All">Engagement (All)</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* PARENTS TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'visible' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px', textAlign: 'left', width: '40px' }}><input type="checkbox" /></th>
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
                {parents.map((parent) => (
                  <tr key={parent.id} style={{ borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                    <td style={{ padding: '16px' }}><input type="checkbox" /></td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{parent.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {parent.customId}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: '#334155', fontWeight: '500' }}>{parent.email}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{parent.phone}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {parent.linkedStudents.map((ward, idx) => (
                        <div key={idx} style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', display: 'inline-block', marginRight: '4px' }}>
                          {ward.name} ({ward.className})
                        </div>
                      ))}
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
                        <div style={{ position: 'absolute', right: '16px', top: '40px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '180px', overflow: 'hidden' }}>
                          <button onClick={() => handleOpenAction('link', parent)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                            Link Student Ward
                          </button>
                          <button onClick={() => handleOpenAction('reset', parent)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                            Reset Portal Account
                          </button>
                          <button onClick={() => handleOpenAction('deactivate', parent)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            Deactivate Account
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* POPUP 1: ADD PARENT PROFILE MODAL */}
        {activeModal === 'add' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add Parent Profile</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Create a new guardian record and link to existing students.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '14px' }}>PERSONAL INFORMATION</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', backgroundColor: '#f8fafc' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginTop: '4px' }}>JPG or PNG, max 2MB</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>First Name *</label>
                      <input type="text" placeholder="e.g. Jane" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Last Name *</label>
                      <input type="text" placeholder="e.g. Doe" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Middle Name</label>
                      <input type="text" placeholder="Optional" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Parent ID</label>
                      <input type="text" value="PRN-24-8901" disabled style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', marginTop: '4px', backgroundColor: '#f1f5f9', color: '#64748b', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Default Relationship</label>
                  <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>Select relationship...</option>
                    <option>Mother</option>
                    <option>Father</option>
                    <option>Guardian</option>
                  </select>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', margin: '20px 0 14px 0' }}>CONTACT INFORMATION</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Primary Phone *</label>
                    <input type="text" placeholder="(555) 123-4567" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Alternate Phone</label>
                    <input type="text" placeholder="Optional" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Contact Email *</label>
                  <input type="email" placeholder="jane.doe@example.com" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Residential Address *</label>
                  <input type="text" placeholder="Enter full address..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', margin: '20px 0 14px 0' }}>LINK TO STUDENTS</div>
                
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc', marginBottom: '16px' }}>
                  <table style={{ width: '100%', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left' }}>
                        <th>STUDENT</th>
                        <th>CLASS</th>
                        <th>PRIMARY GUARDIAN</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: '#0f172a', padding: '8px 0' }}>John Doe Jr. <br /><span style={{ fontSize: '10px', color: '#64748b' }}>STU-1029</span></td>
                        <td>Grade 10 - A</td>
                        <td>
                          <input type="checkbox" checked={isPrimaryGuardian} onChange={(e) => setIsPrimaryGuardian(e.target.checked)} />
                        </td>
                        <td style={{ color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Unlink</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', margin: '20px 0 14px 0' }}>PORTAL ACCOUNT SETUP</div>
                
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Login Email</label>
                      <input type="text" value="jane.doe@example.com" disabled style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', backgroundColor: '#ffffff', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Account Status</label>
                      <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 'bold', color: '#166534' }}>● Active</div>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Send account activation invitation email with temporary password</span>
                  </label>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Add Parent</button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 2: LINK PARENT TO STUDENT MODAL */}
        {activeModal === 'link' && selectedParent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Link Parent to Student</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#002b49', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedParent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px' }}>{selectedParent.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '12px', marginTop: '2px' }}>
                      <span>ID: {selectedParent.customId}</span>
                      <span>{selectedParent.phone}</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>1. SELECT STUDENT</div>
                <input type="text" placeholder="Search by student name or ID..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1e40af' }}>Mia Chen</div>
                    <div style={{ fontSize: '11px', color: '#1e3a8a' }}>Grade 8 • ID: S-11045</div>
                  </div>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>2. RELATIONSHIP DETAILS</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Relationship</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Guardian</option>
                    </select>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Primary Parent</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Main contact for emergencies</div>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Communication Access</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#0f172a' }}>
                    <label style={{ display: 'flex', gap: '6px' }}><input type="checkbox" defaultChecked /> Academic Results</label>
                    <label style={{ display: 'flex', gap: '6px' }}><input type="checkbox" defaultChecked /> Attendance</label>
                    <label style={{ display: 'flex', gap: '6px' }}><input type="checkbox" defaultChecked /> Fee Info</label>
                    <label style={{ display: 'flex', gap: '6px' }}><input type="checkbox" defaultChecked /> Announcements</label>
                  </div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', color: '#1e40af', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <div>You are about to link <strong>{selectedParent.name}</strong> to <strong>Mia Chen</strong> as Father. This will grant them portal access.</div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Link</button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 3: RESET PARENT ACCOUNT MODAL */}
        {activeModal === 'reset' && selectedParent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  Reset Parent Account
                </h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '12px' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>PARENT NAME</div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedParent.name}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>EMAIL ADDRESS</div>
                    <div style={{ color: '#334155' }}>{selectedParent.email}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>ACCOUNT STATUS</div>
                    <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Locked</span>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>LINKED STUDENTS</div>
                    <div style={{ color: '#334155' }}>Emily Jenkins (Grade 10), Leo Jenkins (Grade 8)</div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>RESET ACTION</div>

                <div onClick={() => setResetOption('password')} style={{ border: resetOption === 'password' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', marginBottom: '10px', cursor: 'pointer', backgroundColor: resetOption === 'password' ? '#f0f9ff' : '#ffffff' }}>
                  <label style={{ display: 'flex', gap: '10px', fontWeight: 'bold', color: '#0f172a', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" checked={resetOption === 'password'} onChange={() => setResetOption('password')} />
                    <span>Reset Password</span>
                  </label>
                  <p style={{ margin: '4px 0 0 24px', fontSize: '11px', color: '#64748b' }}>Generates a temporary password and sends a secure reset link to the registered email address.</p>
                </div>

                <div onClick={() => setResetOption('access')} style={{ border: resetOption === 'access' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', marginBottom: '10px', cursor: 'pointer', backgroundColor: resetOption === 'access' ? '#f0f9ff' : '#ffffff' }}>
                  <label style={{ display: 'flex', gap: '10px', fontWeight: 'bold', color: '#0f172a', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" checked={resetOption === 'access'} onChange={() => setResetOption('access')} />
                    <span>Reset Account Access</span>
                  </label>
                  <p style={{ margin: '4px 0 0 24px', fontSize: '11px', color: '#64748b' }}>Forces the user to re-verify their identity upon next login attempt. Clears active sessions.</p>
                </div>

                <div onClick={() => setResetOption('activation')} style={{ border: resetOption === 'activation' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', marginBottom: '16px', cursor: 'pointer', backgroundColor: resetOption === 'activation' ? '#f0f9ff' : '#ffffff' }}>
                  <label style={{ display: 'flex', gap: '10px', fontWeight: 'bold', color: '#0f172a', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" checked={resetOption === 'activation'} onChange={() => setResetOption('activation')} />
                    <span>Send Activation Link</span>
                  </label>
                  <p style={{ margin: '4px 0 0 24px', fontSize: '11px', color: '#64748b' }}>Resends the initial account setup email. Useful for accounts that were never finalized.</p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', color: '#475569', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <div><strong>Security Notice:</strong> Resetting access does not affect historical financial records, communication logs, or student relationships. All existing portal data is preserved.</div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Reset Account</button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 4: DEACTIVATE PARENT ACCOUNT MODAL */}
        {activeModal === 'deactivate' && selectedParent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    Deactivate Parent Account
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Review account details before taking action.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '12px' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>PARENT NAME</div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedParent.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>ID: PAR-2023-8891</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>ACCOUNT STATUS</div>
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>● Active</span>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>LINKED CHILDREN</div>
                    <div style={{ color: '#334155' }}>2 Active</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>LAST ACTIVE</div>
                    <div style={{ color: '#334155' }}>Oct 24, 2023 - 09:41 AM</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', color: '#334155', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <div><strong>Deactivating this account will prevent the parent from signing in.</strong> Their historical records, payment history, and communication logs will be preserved in the system.</div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    This parent is currently linked to active students.
                  </div>
                  
                  <label style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#7f1d1d', cursor: 'pointer', marginBottom: '6px' }}>
                    <input type="radio" checked={deactivateOption === 'keep'} onChange={() => setDeactivateOption('keep')} />
                    <span>Keep relationships active (for historical reporting)</span>
                  </label>

                  <label style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#7f1d1d', cursor: 'pointer' }}>
                    <input type="radio" checked={deactivateOption === 'unlink'} onChange={() => setDeactivateOption('unlink')} />
                    <span>Unlink from all active students immediately</span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reason for Deactivation *</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Select a reason...</option>
                      <option>Student Transferred</option>
                      <option>Requested by Guardian</option>
                      <option>Duplicate Profile</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Effective Date *</label>
                    <input type="date" defaultValue="2023-10-25" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Administrator Notes</label>
                  <textarea placeholder="Enter any relevant details about this deactivation..." style={{ width: '100%', height: '70px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#b91c1c', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Deactivate Account</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};