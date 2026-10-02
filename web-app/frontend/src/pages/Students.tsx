import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface StudentData {
  id: string;
  customId: string;
  name: string;
  avatar?: string;
  attentionFlag?: 'ATTENTION REQUIRED' | 'WARNING' | null;
  className: string;
  parentName: string;
  academicScore: string;
  academicTrend: 'up' | 'down' | 'flat';
  attendanceScore: string;
  attendanceWarning?: boolean;
  feeStatus: 'Paid' | 'Overdue' | 'Partial';
  feeAmountOverdue?: string;
  engagement: 'High' | 'Moderate' | 'Low';
  status: 'Active Enrolled' | 'Suspended' | 'Pending' | 'Deactivated';
}

const mockStudents: StudentData[] = [
  {
    id: '1',
    customId: '24-0192',
    name: 'Alex Carter',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    attentionFlag: 'ATTENTION REQUIRED',
    className: 'Form 2A',
    parentName: 'Sarah Carter',
    academicScore: '61%',
    academicTrend: 'down',
    attendanceScore: '64%',
    attendanceWarning: true,
    feeStatus: 'Paid',
    engagement: 'Low',
    status: 'Active Enrolled',
  },
  {
    id: '2',
    customId: '24-0145',
    name: 'Mia Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    attentionFlag: null,
    className: 'Form 2A',
    parentName: 'Carlos Rodriguez',
    academicScore: '88%',
    academicTrend: 'up',
    attendanceScore: '98%',
    attendanceWarning: false,
    feeStatus: 'Paid',
    engagement: 'High',
    status: 'Active Enrolled',
  },
  {
    id: '3',
    customId: '24-0321',
    name: 'Elijah James',
    attentionFlag: 'WARNING',
    className: 'Form 3C',
    parentName: 'Marcus James',
    academicScore: '75%',
    academicTrend: 'flat',
    attendanceScore: '92%',
    attendanceWarning: false,
    feeStatus: 'Overdue',
    feeAmountOverdue: '$450.00',
    engagement: 'Moderate',
    status: 'Active Enrolled',
  },
];

export const Students: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedYear, setSelectedYear] = useState('23/24');
  const [selectedStatus, setSelectedStatus] = useState('Active');

  // Popup Modal States
  const [activeModal, setActiveModal] = useState<'add' | 'status' | 'deactivate' | 'assign' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form Field States
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', studentId: '', dob: '', gender: 'Male', academicYear: '2024-2025', grade: 'Form 1A', enrollmentDate: '', guardian: ''
  });
  const [statusChange, setStatusChange] = useState({ newStatus: '', notes: '' });
  const [deactivation, setDeactivation] = useState({ reason: '', date: '2026-08-16', notes: '' });
  const [assignment, setAssignment] = useState({ year: '2024 - 2025', term: 'Term 1 (Fall)', targetClass: 'Form 2A' });

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

  // Handlers
  const handleOpenAction = (type: 'status' | 'deactivate' | 'assign', student: StudentData) => {
    setSelectedStudent(student);
    setActiveModal(type);
    setOpenMenuId(null);
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Students</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage student records, enrollment, academic information and student status.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveModal('add')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#002b49', border: 'none', padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer'
              }}
            >
              + Add Student
            </button>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px',
              borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* TOP METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL STUDENTS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>1,248</span>
              <span style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>↑2.4%</span>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACTIVE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>1,210</span>
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Stable</span>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>NEW THIS TERM</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>38</span>
              <span style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>↑12%</span>
            </div>
          </div>
          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ATTENTION REQUIRED</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b' }}>42</span>
              <span style={{ color: '#991b1b', fontSize: '12px', fontWeight: 'bold' }}>Flagged</span>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '12px' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by name, ID, or parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>
          </div>
        </div>

        {/* STUDENTS TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'visible' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px', textAlign: 'left', width: '40px' }}><input type="checkbox" /></th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>STUDENT</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>CLASS</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>PARENT/GUARDIAN</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>ACADEMIC</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>ATTENDANCE</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>FEE STATUS</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>ENGAGEMENT</th>
                  <th style={{ padding: '16px', textAlign: 'center', width: '40px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                    <td style={{ padding: '16px' }}><input type="checkbox" /></td>
                    
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{student.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {student.customId}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px', color: '#334155', fontWeight: '500' }}>{student.className}</td>
                    <td style={{ padding: '16px', color: '#334155', fontWeight: '500' }}>{student.parentName}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>{student.academicScore}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>{student.attendanceScore}</td>
                    
                    <td style={{ padding: '16px' }}>
                      <span style={{ backgroundColor: student.feeStatus === 'Paid' ? '#dcfce7' : '#fee2e2', color: student.feeStatus === 'Paid' ? '#166534' : '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                        {student.feeStatus}
                      </span>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        {student.engagement}
                      </span>
                    </td>

                    {/* ACTION DROPDOWN MENU */}
                    <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}
                      >
                        ⋮
                      </button>

                      {openMenuId === student.id && (
                        <div style={{
                          position: 'absolute', right: '16px', top: '40px', backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                          zIndex: 100, minWidth: '180px', textTransform: 'none', overflow: 'hidden'
                        }}>
                          <button onClick={() => handleOpenAction('assign', student)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🏫 Assign Class
                          </button>
                          <button onClick={() => handleOpenAction('status', student)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🔄 Change Status
                          </button>
                          <button onClick={() => handleOpenAction('deactivate', student)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9' }}>
                            🚫 Deactivate Student
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

        {/* ========================================================================= */}
        {/* POPUP 1: ADD NEW STUDENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'add' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '680px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add New Student</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Enter details to enroll a new student into the system.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Personal Information */}
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
                  PERSONAL INFORMATION
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', cursor: 'pointer', backgroundColor: '#f8fafc' }}>
                    <span style={{ fontSize: '20px' }}>📷</span>
                    <span style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginTop: '4px' }}>Upload Photo (Max 2MB)</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>First Name *</label>
                      <input type="text" placeholder="e.g. Jane" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Student ID *</label>
                      <input type="text" placeholder="STU-XXXXX" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Last Name *</label>
                      <input type="text" placeholder="e.g. Doe" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Date of Birth *</label>
                      <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                {/* Enrollment Information */}
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '20px 0 14px 0' }}>
                  ENROLLMENT INFORMATION
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Academic Year *</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>2024-2025</option>
                      <option>2025-2026</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Class / Grade *</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Select Grade</option>
                      <option>Form 1A</option>
                      <option>Form 2A</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Enrollment Date *</label>
                    <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Parent / Guardian Linkage */}
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '20px 0 14px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>PARENT / GUARDIAN</span>
                  <span style={{ color: '#002b49', cursor: 'pointer', textTransform: 'none' }}>+ New Guardian</span>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <input type="text" placeholder="🔍 Search by name or email..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#64748b' }}>Linking an existing guardian profile simplifies contact management.</p>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>💾 Save Student</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: CHANGE STUDENT STATUS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'status' && selectedStudent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Change Student Status</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>{selectedStudent.name} (ID: STU-{selectedStudent.customId})</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Current -> New Status Visual Indicator */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CURRENT STATUS</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', marginTop: '2px' }}>● {selectedStudent.status}</div>
                  </div>
                  <div style={{ fontSize: '18px', color: '#94a3b8' }}>→</div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>NEW STATUS</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: statusChange.newStatus ? '#0f172a' : '#94a3b8', marginTop: '2px' }}>
                      {statusChange.newStatus || 'Pending selection...'}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Select New Status *</label>
                  <select 
                    value={statusChange.newStatus}
                    onChange={(e) => setStatusChange({ ...statusChange, newStatus: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  >
                    <option value="">Select status...</option>
                    <option value="Active Enrolled">Active Enrolled</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Administrative Notes</label>
                  <textarea 
                    placeholder="Add any relevant details regarding this status change..."
                    value={statusChange.notes}
                    onChange={(e) => setStatusChange({ ...statusChange, notes: e.target.value })}
                    style={{ width: '100%', height: '80px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>These notes will be appended to the student's historical record.</p>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Update Status</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: DEACTIVATE STUDENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'deactivate' && selectedStudent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Deactivate Student</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Suspend access and active enrollment.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Warning Banner */}
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#991b1b' }}>Not a permanent deletion</div>
                    <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '2px', lineHeight: '1.4' }}>
                      Deactivating this student will remove their access to the portal and suspend active course enrollments. All historical records will be securely preserved.
                    </div>
                  </div>
                </div>

                {/* Selected Student Card */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={selectedStudent.avatar || 'https://via.placeholder.com/40'} alt={selectedStudent.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedStudent.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>ID: STU-2023-0892</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#334155', fontWeight: 'bold' }}>
                    Grade 11<br /><span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>Class of '25</span>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reason for Deactivation *</label>
                  <select 
                    value={deactivation.reason}
                    onChange={(e) => setDeactivation({ ...deactivation, reason: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  >
                    <option value="">Select a reason...</option>
                    <option value="Transferred">Transferred to another school</option>
                    <option value="NonPayment">Non-payment of tuition</option>
                    <option value="Disciplinary">Disciplinary action</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Effective Date *</label>
                  <input 
                    type="date" 
                    value={deactivation.date}
                    onChange={(e) => setDeactivation({ ...deactivation, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px', boxSizing: 'border-box' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Additional Notes</label>
                  <textarea 
                    placeholder="Enter any relevant details or context for this deactivation..."
                    value={deactivation.notes}
                    onChange={(e) => setDeactivation({ ...deactivation, notes: e.target.value })}
                    style={{ width: '100%', height: '80px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#b91c1c', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🚫 Deactivate Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: ASSIGN CLASS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'assign' && selectedStudent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Assign Class</h3>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Student Info Bar */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <img src={selectedStudent.avatar || 'https://via.placeholder.com/40'} alt={selectedStudent.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{selectedStudent.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '12px', marginTop: '2px' }}>
                      <span>🪪 ID: STD-2023-0142</span>
                      <span>🎓 Current: {selectedStudent.className}</span>
                    </div>
                  </div>
                </div>

                {/* Assignment Details Form */}
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  NEW ASSIGNMENT DETAILS
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Academic Year</label>
                    <select value={assignment.year} onChange={(e) => setAssignment({ ...assignment, year: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>2024 - 2025</option>
                      <option>2025 - 2026</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Term</label>
                    <select value={assignment.term} onChange={(e) => setAssignment({ ...assignment, term: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Term 1 (Fall)</option>
                      <option>Term 2 (Spring)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Target Class</label>
                  <input 
                    type="text" 
                    value={assignment.targetClass} 
                    onChange={(e) => setAssignment({ ...assignment, targetClass: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                  />
                </div>

                {/* Selected Class Overview Card */}
                <div style={{ backgroundColor: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3730a3' }}>Selected Class Overview</span>
                    <span style={{ backgroundColor: '#ffffff', color: '#3730a3', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>Capacity: 38/40</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px', color: '#312e81', marginBottom: '12px' }}>
                    <div><strong>Homeroom Teacher:</strong><br />Mr. Anderson</div>
                    <div><strong>Room Location:</strong><br />Science Wing, Room 204</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold' }}>CURRENT</div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Form 1B</div>
                    </div>
                    <div style={{ fontSize: '16px', color: '#6366f1' }}>→</div>
                    <div>
                      <div style={{ fontSize: '9px', color: '#6366f1', fontWeight: 'bold' }}>NEW ASSIGNMENT</div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: '#3730a3' }}>Form 2A</div>
                    </div>
                  </div>
                </div>

                {/* Enrollment Update Notice */}
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '11px', color: '#991b1b', display: 'flex', gap: '8px' }}>
                  <span>ℹ️</span>
                  <div>
                    <strong>Enrollment Update Notice:</strong> Reassigning this student will automatically update their timetable and notify parents/guardians via the portal. Historical records will be preserved.
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ☑️ Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};