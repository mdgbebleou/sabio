import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface AttendanceClassData {
  id: string;
  className: string;
  studentsCount: number;
  todayPAL: string; // Present / Absent / Late
  termPercentage: number;
  status: 'Stable' | 'Requires Attention';
}

interface StudentAttentionData {
  id: string;
  studentName: string;
  studentId: string;
  className: string;
  attendancePct: number;
  absentLateDays: string;
  trend: 'Declining' | 'Stable (Low)';
  recordedBy: string;
  lastDate: string;
}

const mockClasses: AttendanceClassData[] = [
  { id: '1', className: 'Form 1A', studentsCount: 32, todayPAL: '30 / 1 / 1', termPercentage: 95.2, status: 'Stable' },
  { id: '2', className: 'Form 2B', studentsCount: 28, todayPAL: '23 / 4 / 1', termPercentage: 81.0, status: 'Requires Attention' },
  { id: '3', className: 'Form 3A', studentsCount: 30, todayPAL: '29 / 1 / 0', termPercentage: 96.5, status: 'Stable' },
];

const mockAttentionStudents: StudentAttentionData[] = [
  { id: '1', studentName: 'Ama Mensah', studentId: 'STU-00248', className: 'Form 2A', attendancePct: 88.4, absentLateDays: '8 / 3', trend: 'Declining', recordedBy: 'Mr. Daniel Mensah', lastDate: 'Nov 23, 2026' },
  { id: '2', studentName: 'Alex Johnson', studentId: 'STU-00109', className: 'Form 2B', attendancePct: 78.5, absentLateDays: '8 / 3', trend: 'Declining', recordedBy: 'Mr. Davies', lastDate: 'Nov 22, 2026' },
  { id: '3', studentName: 'Sarah Williams', studentId: 'STU-00312', className: 'Form 1C', attendancePct: 84.0, absentLateDays: '4 / 6', trend: 'Stable (Low)', recordedBy: 'Ms. Thomas', lastDate: 'Nov 21, 2026' },
];

export const Attendance: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'detail' | 'correct' | 'confirm' | 'export' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttentionData | null>(null);

  // Form states for corrections & exports
  const [correctionStatus, setCorrectionStatus] = useState<'Present' | 'Absent' | 'Late' | 'Excused'>('Present');
  const [correctionReason, setCorrectionReason] = useState('Student was incorrectly marked absent');
  const [adminNote, setAdminNote] = useState('Student was present according to register. Confirmed by 1st period teacher (Mr. Davis) via internal comms.');

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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '680px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  const openStudentModal = (student: StudentAttentionData, type: 'detail' | 'correct') => {
    setSelectedStudent(student);
    setActiveModal(type);
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Attendance Management</h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>
              <option>2026/2027</option>
            </select>
            <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>
              <option>Term 1</option>
            </select>
            <button style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Today
            </button>
            <button style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Attendance Reports
            </button>
            <button onClick={() => setActiveModal('export')} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>

        {/* HERO ATTENDANCE CARD & METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          {/* Today Status Hero Box */}
          <div style={{ backgroundColor: '#002b49', borderRadius: '16px', padding: '20px', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: '800', textTransform: 'uppercase' }}>TODAY'S STATUS</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '2px' }}>Monday, November 23, 2026</div>
              <div style={{ fontSize: '32px', fontWeight: '900', marginTop: '12px' }}>94.2% <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 'normal' }}>School Attendance</span></div>
              <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px' }}>Present: <strong>928</strong> | Absent: <strong>42</strong> | Late: <strong>16</strong></div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#4ade80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              24/24 classes submitted (Complete)
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>OVERALL ATTENDANCE</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>92.8%</div>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>📈 +0.4% from last week</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PRESENT TODAY</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>928</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Target: &gt;950</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ABSENT TODAY</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: '8px' }}>42</div>
            <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>📈 +5 from average</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>LATE TODAY</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#d97706', marginTop: '8px' }}>16</div>
            <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>📉 -2 from average</div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ATTENTION REQUIRED</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>14</div>
            <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '4px' }}>Urgent review needed</div>
          </div>

        </div>

        {/* INSIGHTS AND RECORDING STATUS */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Attendance Insights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#991b1b' }}>Persistent Absenteeism</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>8 students below 85% threshold.</p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#d97706' }}>Attendance Decline</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>5 students with ~16% drop in last 4 weeks.</p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#991b1b' }}>Class Attendance Alert</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>3 classes significantly below avg (Form 2B at 81%).</p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e40af' }}>Late Arrival Pattern</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>12 students with 3+ late marks this week.</p>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recording Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Today</span>
                  <strong>24/24 (100%)</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#10b981' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>This Week</span>
                  <strong>118/120 (98%)</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '98%', height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>This Term</span>
                  <strong>96%</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '96%', height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ATTENDANCE BY CLASS TABLE */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Attendance by Class</h3>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>View All Classes</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>CLASS</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>STUDENTS</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>TODAY (P/A/L)</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>TERM %</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mockClasses.map((cls) => (
                <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{cls.className}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{cls.studentsCount}</td>
                  <td style={{ padding: '12px', fontWeight: '500', color: cls.status === 'Requires Attention' ? '#dc2626' : '#0f172a' }}>{cls.todayPAL}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: cls.termPercentage < 85 ? '#dc2626' : '#0f172a' }}>{cls.termPercentage}%</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: cls.status === 'Stable' ? '#dcfce7' : '#fee2e2',
                      color: cls.status === 'Stable' ? '#166534' : '#991b1b',
                      padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold'
                    }}>
                      {cls.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* STUDENTS REQUIRING ATTENTION TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Students Requiring Attention</h3>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>View All Flags</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>STUDENT</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>CLASS</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>ATTENDANCE %</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>ABSENT/LATE DAYS</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>TREND</th>
                <th style={{ padding: '14px 20px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {mockAttentionStudents.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#0f172a' }}>{st.studentName}</td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>{st.className}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#dc2626' }}>{st.attendancePct}%</td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>{st.absentLateDays}</td>
                  <td style={{ padding: '14px 20px', color: '#dc2626', fontWeight: 'bold' }}>📉 {st.trend}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button onClick={() => openStudentModal(st, 'detail')} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#1e40af', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* ========================================================================= */}
        {/* POPUP 1: ATTENDANCE DETAIL MODAL (MATCHING EXACT DESIGN) */}
        {/* ========================================================================= */}
        {activeModal === 'detail' && selectedStudent && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              
              {/* Modal Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Attendance Detail</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Detailed view of student attendance record.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                
                {/* 1. Student Info Banner */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', position: 'relative', marginBottom: '20px' }}>
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Original Record</span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" 
                      alt={selectedStudent.studentName} 
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }} 
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{selectedStudent.studentName}</h4>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace', display: 'inline-block', marginTop: '4px' }}>
                        ID: {selectedStudent.studentId}
                      </span>

                      <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '12px' }}>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>CLASS</div>
                          <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{selectedStudent.className}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>TERM</div>
                          <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>Term 1</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>ACADEMIC YEAR</div>
                          <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>2026/2027</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Grid: Record Details & Session Context / Term Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  
                  {/* Record Details Column */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      RECORD DETAILS
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                        <span style={{ color: '#64748b' }}>Date</span>
                        <strong style={{ color: '#0f172a' }}>Nov 23, 2026 (Monday)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                        <span style={{ color: '#64748b' }}>Status</span>
                        <span style={{ color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Present
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                        <span style={{ color: '#64748b' }}>Check-in Time</span>
                        <strong style={{ color: '#0f172a' }}>7:42 AM</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#ffffff' }}>
                        <span style={{ color: '#64748b' }}>Recorded By</span>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#0f172a', display: 'block' }}>Mr. Daniel Mensah</strong>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>at 7:48 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Context & Term Summary Column */}
                  <div>
                    {/* Session Context */}
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      SESSION CONTEXT
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                        <span style={{ color: '#64748b' }}>Subject/Session</span>
                        <strong style={{ color: '#0f172a' }}>Morning Session</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#ffffff' }}>
                        <span style={{ color: '#64748b' }}>Entry Method</span>
                        <strong style={{ color: '#0f172a' }}>Teacher Entry</strong>
                      </div>
                    </div>

                    {/* Term Summary */}
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                      TERM SUMMARY
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', backgroundColor: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Term Attendance Rate</span>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>91.4%</span>
                      </div>

                      {/* Progress bar with status fill */}
                      <div style={{ height: '8px', backgroundColor: '#dc2626', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '10px' }}>
                        <div style={{ width: '91.4%', height: '100%', backgroundColor: '#166534' }}></div>
                      </div>

                      <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534', fontWeight: 'bold' }}>● 42 Present</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 'bold' }}>● 3 Absent</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155', fontWeight: 'bold' }}>● 1 Late</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. Adjustment History */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ADJUSTMENT HISTORY
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '13px' }}>Status Corrected</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Changed from <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Absent</span> to <span style={{ color: '#166534', fontWeight: 'bold' }}>Present</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>Nov 24, 2026, 09:15 AM</span>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', margin: '10px 0 8px 0', fontSize: '12px', color: '#334155', fontFamily: 'monospace' }}>
                      "Attendance was incorrectly recorded due to late arrival during morning assembly."
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      By <strong>Sarah Osei (Admin)</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => setActiveModal(null)} 
                  style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                >
                  Close
                </button>
                
                <button 
                  onClick={() => setActiveModal('correct')} 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Correct Attendance
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: CORRECT ATTENDANCE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'correct' && selectedStudent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Correct Attendance</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Original records are preserved for auditing purposes. All corrections are logged.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Original Record Card */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '12px' }}>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>STATUS</span><br /><span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Absent</span></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>DATE</span><br /><strong>Nov 23, 2026</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>STUDENT</span><br /><strong>{selectedStudent.studentName}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>RECORDED BY</span><br /><strong>{selectedStudent.recordedBy}</strong></div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>CORRECT ATTENDANCE TO</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {(['Present', 'Absent', 'Late', 'Excused', 'Clear'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setCorrectionStatus(st as any)}
                      style={{
                        padding: '10px', borderRadius: '8px', border: correctionStatus === st ? '2px solid #002b49' : '1px solid #cbd5e1',
                        backgroundColor: correctionStatus === st ? '#f0f9ff' : '#ffffff', fontWeight: 'bold', fontSize: '12px', color: '#0f172a', cursor: 'pointer'
                      }}
                    >
                      {st} {correctionStatus === st && '✓'}
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reason for Correction *</label>
                  <select value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>Student was incorrectly marked absent</option>
                    <option>Late arrival verified by teacher</option>
                    <option>Medical excuse submitted</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Supporting Note (Optional)</label>
                  <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} style={{ width: '100%', height: '60px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                {/* System Impact Box */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', marginBottom: '8px' }}>SYSTEM IMPACT</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                    <div><span style={{ color: '#1e3a8a', fontSize: '10px' }}>Attendance Rate</span><br /><strong style={{ fontSize: '16px', color: '#1e40af' }}>90.7%</strong> <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold' }}>+2.3%</span></div>
                    <div><span style={{ color: '#1e3a8a', fontSize: '10px' }}>Threshold Status</span><br /><span style={{ backgroundColor: '#1e40af', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>Above 85%</span></div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal('confirm')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Review Adjustment →</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: CONFIRM ATTENDANCE ADJUSTMENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'confirm' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Confirm Attendance Adjustment</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: '10px', alignItems: 'center', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '10px', fontWeight: 'bold', color: '#991b1b', fontSize: '13px' }}>Original: Absent</div>
                  <div style={{ fontSize: '18px', color: '#64748b' }}>→</div>
                  <div style={{ backgroundColor: '#dcfce7', padding: '12px', borderRadius: '10px', fontWeight: 'bold', color: '#166534', fontSize: '13px' }}>Corrected: Present</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>SELECTED REASON</div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a', marginTop: '2px' }}>{correctionReason}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>ADMINISTRATOR NOTE</div>
                  <div style={{ color: '#334155', marginTop: '2px', fontStyle: 'italic' }}>"{adminNote}"</div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '11px', color: '#1e40af' }}>
                  ℹ️ <strong>Impact Summary:</strong> Term attendance rate changes by <strong>+2.3%</strong>. The student is now above the critical warning threshold (85%).
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', color: '#475569' }}>
                  🛡️ <strong>Audit Trail:</strong> This action, including your credential and a UTC timestamp, will be permanently recorded in the system audit history.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>I confirm that this attendance adjustment is accurate.</span>
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Adjustment</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: EXPORT ATTENDANCE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'export' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '640px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Export Attendance</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure and generate attendance reports for external systems.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>REPORT SCOPE</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}>Current filtered records ✓</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>142 records match</div>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}>Specific Class / Group</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Select from directory</div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>EXPORT FORMAT</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <button style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', backgroundColor: '#ffffff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>PDF Document</button>
                  <button style={{ border: '2px solid #002b49', borderRadius: '10px', padding: '12px', backgroundColor: '#f0f9ff', fontWeight: 'bold', fontSize: '12px', color: '#002b49', cursor: 'pointer' }}>Excel (.xlsx) ✓</button>
                  <button style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', backgroundColor: '#ffffff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>CSV Data</button>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', fontSize: '11px', color: '#991b1b' }}>
                  ⚠️ <strong>Data Completeness Notice:</strong> 7 records have missing daily marks within the selected date range. They will be exported with null values.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Generate Export</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};