import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface ClassPerformance {
  id: string;
  className: string;
  studentsCount: number;
  avgScore: number;
  completion: number;
  change: string;
  status: 'Improving' | 'Review' | 'Stable';
}

interface PendingApproval {
  id: string;
  classSubject: string;
  subjectName: string;
  teacher: string;
  studentsCount: number;
  submittedDate: string;
  status: 'Pending Approval';
}

const mockClassPerformance: ClassPerformance[] = [
  { id: '1', className: 'Form 1A', studentsCount: 40, avgScore: 72, completion: 100, change: '+4.2%', status: 'Improving' },
  { id: '2', className: 'Form 2B', studentsCount: 38, avgScore: 54, completion: 100, change: '-14.0%', status: 'Review' },
  { id: '3', className: 'Form 3A', studentsCount: 42, avgScore: 75, completion: 96, change: '+0.5%', status: 'Stable' },
];

const mockPendingApprovals: PendingApproval[] = [
  { id: '1', classSubject: 'Form 2A', subjectName: 'Physics', teacher: 'Mr. R. Davies', studentsCount: 36, submittedDate: 'Dec 01, 2026', status: 'Pending Approval' },
  { id: '2', classSubject: 'Form 1C', subjectName: 'English Lit', teacher: 'Ms. S. Thomas', studentsCount: 41, submittedDate: 'Dec 02, 2026', status: 'Pending Approval' },
];

export const Academics: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'createAssessment' | 'approveResults' | 'publishResults' | 'gradeScale' | null>(null);
  
  // Grade scale state for validation error demo
  const [gradeScale, setGradeScale] = useState([
    { grade: 'A', min: 70, max: 100, remark: 'Excellent' },
    { grade: 'B', min: 60, max: 75, remark: 'Very Good' }, // Overlap with C
    { grade: 'C', min: 50, max: 65, remark: 'Good' },
    { grade: 'D', min: 45, max: 49, remark: 'Fair' },
    { grade: 'E', min: 40, max: 44, remark: 'Pass' },
    { grade: 'F', min: 0, max: 39, remark: 'Fail' },
  ]);

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

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Academic Management</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Monitor assessments, results, academic progress and result publishing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>
              <option>2026/2027</option>
            </select>
            <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>
              <option>Term 1</option>
            </select>
            <button onClick={() => setActiveModal('gradeScale')} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Report
            </button>
          </div>
        </div>

        {/* HERO ACADEMIC STATUS BANNER */}
        <div style={{ backgroundColor: '#1e3a8a', borderRadius: '16px', padding: '20px 24px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '12px', borderRadius: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>2026/2027 — Term 1</h2>
                <span style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>● Active</span>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Sep 1, 2026 - Dec 18, 2026</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '24px' }}>
            <div>
              <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>RESULT SUBMISSION DEADLINE</div>
              <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px' }}>Dec 10, 2026</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>TIME REMAINING</div>
              <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px', color: '#fde047' }}>7 Days</div>
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL ASSESSMENTS</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>128</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>112 completed, 16 in prog</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>RESULT COMPLETION</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>91%</div>
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: '91%', height: '100%', backgroundColor: '#10b981' }}></div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PENDING APPROVAL</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>18</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', marginTop: '4px', cursor: 'pointer' }}>Review Results →</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PUBLISHED RESULTS</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>74%</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>26% pending</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>STUDENTS ASSESSED</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>942 <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>/ 986</span></div>
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>⚠️ 44 pending</div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ACADEMIC ATTENTION</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>12</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#991b1b', marginTop: '4px', cursor: 'pointer' }}>Review Insights →</div>
          </div>
        </div>

        {/* OPERATIONS PIPELINE */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Operations Pipeline</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '11px', color: '#002b49', textTransform: 'uppercase' }}>ASSESSMENT</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>128 Total</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>112 done, 16 in prog</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '11px', color: '#002b49', textTransform: 'uppercase' }}>SUBMISSION</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#166534', margin: '6px 0 2px 0' }}>91% Complete</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>113 sub, 11 pend</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '11px', color: '#002b49', textTransform: 'uppercase' }}>APPROVAL</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>86% Approved</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>97 ok, 16 wait, 3 ret</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '11px', color: '#002b49', textTransform: 'uppercase' }}>PUBLISHING</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#1e40af', margin: '6px 0 2px 0' }}>74% Published</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>84 pub, 21 rdy, 8 no</div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: INTELLIGENCE INSIGHTS & SIDEBAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          
          {/* Intelligence Insights */}
          <div style={cardStyle}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Intelligence Insights
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: '#fffbe3', border: '1px solid #fde047', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', color: '#854d0e', fontSize: '13px' }}>Result Submission Gap</div>
                <p style={{ margin: '4px 0 8px 0', fontSize: '11px', color: '#713f12' }}>11 sets pending across 5 classes and 7 subjects. This is blocking the approval pipeline.</p>
                <button onClick={() => setActiveModal('approveResults')} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Review Results →</button>
              </div>

              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '13px' }}>Significant Performance Drop</div>
                <p style={{ margin: '4px 0 8px 0', fontSize: '11px', color: '#7f1d1d' }}>Form 2B Mathematics average is down 14% vs previous period (68% → 54%).</p>
                <button style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Review Results →</button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '13px' }}>Anomalous Grade Distribution</div>
                <p style={{ margin: '4px 0 8px 0', fontSize: '11px', color: '#64748b' }}>Form 3A Mathematics distribution is significantly different from historical norms (skewed high).</p>
                <button style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>View Results →</button>
              </div>
            </div>
          </div>

          {/* Sidebar: Readiness Checklist & Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Readiness Checklist */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Readiness Checklist</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Academic Period Configured
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Assessment Records Created (128)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Student Results (91% Complete)
                </div>
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Quick Actions</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => setActiveModal('createAssessment')} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', textAlign: 'center' }}>
                  + Create Assessment
                </button>
                <button onClick={() => setActiveModal('approveResults')} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', textAlign: 'center' }}>
                  ✓ Review Results
                </button>
                <button onClick={() => setActiveModal('approveResults')} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', textAlign: 'center' }}>
                  📑 Approve Results
                </button>
                <button onClick={() => setActiveModal('publishResults')} style={{ backgroundColor: '#002b49', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', textAlign: 'center' }}>
                  🚀 Publish Results
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* CLASS PERFORMANCE OVERVIEW TABLE */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Class Performance Overview</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>CLASS</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>STUDENTS</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>AVG SCORE</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>COMPLETION</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>CHANGE</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mockClassPerformance.map((cls) => (
                <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{cls.className}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{cls.studentsCount}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{cls.avgScore}%</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${cls.completion}%`, height: '100%', backgroundColor: '#10b981' }}></div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{cls.completion}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: cls.change.startsWith('+') ? '#166534' : '#dc2626' }}>{cls.change}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: cls.status === 'Improving' ? '#dcfce7' : cls.status === 'Review' ? '#fee2e2' : '#f1f5f9', color: cls.status === 'Improving' ? '#166534' : cls.status === 'Review' ? '#991b1b' : '#334155', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                      {cls.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RESULTS AWAITING APPROVAL TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Results Awaiting Approval</h3>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>View All (16) →</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>CLASS / SUBJECT</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>TEACHER</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>STUDENTS</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>SUBMITTED</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>STATUS</th>
                <th style={{ padding: '14px 20px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {mockPendingApprovals.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.classSubject}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.subjectName}</div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#334155', fontWeight: '500' }}>{item.teacher}</td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>{item.studentsCount}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{item.submittedDate}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                      Pending Approval
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button onClick={() => setActiveModal('approveResults')} style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Review & Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: CREATE ASSESSMENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'createAssessment' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Create Assessment</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Create an assessment and define how it will contribute to student results.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '12px' }}>1. ASSESSMENT INFORMATION</div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Assessment Name *</label>
                  <input type="text" placeholder="e.g., Mathematics Mid-Term" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Type *</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Select Type</option>
                      <option>Mid-Term Exam</option>
                      <option>Final Exam</option>
                      <option>Quiz</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Academic Year *</label>
                    <input type="text" value="2026/2027" disabled style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', marginTop: '4px', backgroundColor: '#f1f5f9', color: '#64748b', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', margin: '20px 0 12px 0' }}>2. ASSESSMENT SCOPE</div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Grade / Level *</label>
                  <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>Select Grade</option>
                    <option>Form 1</option>
                    <option>Form 2</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Classes *</label>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Form 1A ✕</span>
                    <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Form 1B ✕</span>
                    <input type="text" placeholder="Add classes..." style={{ border: 'none', outline: 'none', fontSize: '12px', flex: 1 }} />
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', margin: '20px 0 12px 0' }}>3. ASSESSMENT CONFIGURATION</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Maximum Score *</label>
                    <input type="number" defaultValue={100} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Weight (Contribution to Final Grade) *</label>
                    <input type="number" defaultValue={30} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Readiness Summary Banner */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginTop: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '6px' }}>ASSESSMENT READINESS SUMMARY</div>
                  <div style={{ fontSize: '11px', color: '#334155' }}>✓ Subject and Classes defined (Form 1A, 1B - Mathematics).</div>
                  <div style={{ fontSize: '11px', color: '#334155' }}>✓ Weighting configuration valid (30% of final grade).</div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Create Assessment</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: APPROVE RESULTS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'approveResults' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Approve Results</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Review the result set before approving it for publication.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#166534', marginBottom: '16px', display: 'inline-block' }}>
                  ✓ READY FOR APPROVAL
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '12px' }}>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>CLASS</span><br /><strong>Form 2A</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>SUBJECT</span><br /><strong>Mathematics</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>ASSESSMENT</span><br /><strong>End-of-Term Exam</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>TEACHER</span><br /><strong>Mr. Mensah</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>STUDENTS</span><br /><strong>40</strong></div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>INTELLIGENCE VERIFICATION</div>
                
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Student Results</span><strong style={{ color: '#166534' }}>40/40 Complete ✓</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Missing Results</span><strong style={{ color: '#166534' }}>0 ✓</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Invalid Scores</span><strong style={{ color: '#166534' }}>0 ✓</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Grade Calculation</span><strong style={{ color: '#166534' }}>Valid ✓</strong></div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>ADMIN REVIEW NOTE (OPTIONAL)</label>
                  <textarea placeholder="Add any final notes before publication..." style={{ width: '100%', height: '60px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>APPROVE RESULTS</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: PUBLISH RESULTS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'publishResults' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Publish Results</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Publish approved results to authorized users.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#166534', marginBottom: '16px', display: 'inline-block' }}>
                  ● Ready to Publish
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>PUBLICATION READINESS CHECK</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Approval Status</div>
                    <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '13px' }}>✓ Approved</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Result Completion</div>
                    <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '13px' }}>100%</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#1e40af', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                  <span>👁️</span>
                  <div>Explicitly state that results will become visible to Students, Parents, and Authorized Staff immediately upon publication.</div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#991b1b', fontWeight: 'bold' }}>
                  ⚠️ Once published, authorized users will be able to view these results.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>PUBLISH RESULTS</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: CHANGE GRADE SCALE MODAL (With Overlap Validation Error) */}
        {/* ========================================================================= */}
        {activeModal === 'gradeScale' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Change Grade Scale</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure the grading rules used to convert scores into grades.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>SCOPE</label>
                  <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>School-wide</option>
                  </select>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '11px', color: '#475569', marginBottom: '16px' }}>
                  ℹ️ <strong>EXISTING RESULTS DETECTED:</strong> This grading scale is currently used by 6 result sets.
                </div>

                {/* Overlap Error Warning Banner */}
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#991b1b', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  GRADE CONFIGURATION ERROR: Ranges for grades 'B' and 'C' overlap.
                </div>

                {/* Grade Scale Rules Table */}
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>GRADE</th>
                      <th style={{ padding: '8px' }}>MINIMUM (0-100)</th>
                      <th style={{ padding: '8px' }}>MAXIMUM (0-100)</th>
                      <th style={{ padding: '8px' }}>REMARK</th>
                      <th style={{ padding: '8px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeScale.map((item, idx) => {
                      const isOverlapped = item.grade === 'B' || item.grade === 'C';

                      return (
                        <tr key={idx}>
                          <td style={{ padding: '6px' }}>
                            <input type="text" value={item.grade} disabled style={{ width: '50px', padding: '6px', borderRadius: '6px', border: isOverlapped ? '1px solid #dc2626' : '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }} />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input type="number" defaultValue={item.min} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: isOverlapped ? '1px solid #dc2626' : '1px solid #cbd5e1', textAlign: 'center' }} />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input type="number" defaultValue={item.max} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: isOverlapped ? '1px solid #dc2626' : '1px solid #cbd5e1', textAlign: 'center' }} />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input type="text" defaultValue={item.remark} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>SAVE GRADE SCALE</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};