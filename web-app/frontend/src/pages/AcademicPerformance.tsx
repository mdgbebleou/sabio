import React, { useState } from 'react';

export const AcademicPerformancePage: React.FC = () => {
  const [viewState, setViewState] = useState<'OVERVIEW' | 'RESULT_DETAIL'>('OVERVIEW');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  const handleDownloadResultPDF = () => {
    window.open('http://127.0.0.1:8000/api/academics/report-card/pdf/1/', '_blank');
  };

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', display: 'flex', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        
        {/* VIEW 1: ACADEMIC PERFORMANCE OVERVIEW (Academic Performance.png) */}
        {viewState === 'OVERVIEW' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fafafa' }}>
            
            {/* Top App Header */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
                </div>
                <span style={{ fontWeight: '800', fontSize: '15px', color: '#1e3a8a' }}>Bright Academy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                  Good morning,<br /><strong style={{ color: '#0f172a' }}>Adzovi</strong>
                </div>
                <div style={{ position: 'relative' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', backgroundColor: '#dc2626', borderRadius: '50%' }}></div>
                </div>
              </div>
            </div>

            {/* Content Stream */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 80px 20px' }}>
              
              <h1 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>Academic Performance</h1>

              {/* Student Selector Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=60" alt="Student Avatar" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>Daniel Mensah</h3>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>JHS 2 • 2026 Academic Year</div>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>

              {/* Overall Performance Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a', fontWeight: 'bold' }}>Overall Performance</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a8a' }}>78%</span>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px' }}>Good Progress</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Previous: 74% <strong style={{ color: '#16a34a' }}>(+4%)</strong></span>
                </div>

                {/* Progress Bar */}
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '78%', backgroundColor: '#047857', height: '100%' }}></div>
                </div>
              </div>

              {/* Subject Performance List */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>Subject Performance</h3>
              </div>

              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
                {[
                  { name: 'Mathematics', score: '82%', status: 'Good', pct: 82, color: '#047857' },
                  { name: 'English Language', score: '76%', status: 'Good', pct: 76, color: '#047857' },
                  { name: 'Integrated Science', score: '79%', status: 'Good', pct: 79, color: '#047857' },
                  { name: 'Social Studies', score: '72%', status: 'Good', pct: 72, color: '#d97706' },
                  { name: 'ICT', score: '88%', status: 'Excellent', pct: 88, color: '#1e3a8a' }
                ].map((subj, idx) => (
                  <div
                    key={subj.name}
                    onClick={() => { setSelectedSubject(subj.name); setViewState('RESULT_DETAIL'); }}
                    style={{ padding: '16px', borderBottom: idx !== 4 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{subj.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                        {subj.score} <span style={{ fontSize: '11px', fontWeight: 'normal', color: subj.pct >= 85 ? '#1e3a8a' : '#166534' }}>({subj.status})</span>
                      </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${subj.pct}%`, backgroundColor: subj.color, height: '100%' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Subjects Trigger */}
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => setViewState('RESULT_DETAIL')}
                  style={{ border: 'none', background: 'none', color: '#1e3a8a', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  View All Subjects →
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: RESULT DETAILS (Academic Result Detail.png) */}
        {viewState === 'RESULT_DETAIL' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fafafa' }}>
            
            {/* Header Bar */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff' }}>
              <button onClick={() => setViewState('OVERVIEW')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <h2 style={{ margin: 0, fontSize: '17px', color: '#1e3a8a', fontWeight: '800' }}>Result Details</h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>

            {/* Content Stream */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 80px 20px' }}>
              
              {/* Student Info Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=60" alt="Student" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>Daniel Mensah</h3>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    <span style={{ backgroundColor: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>JHS 2</span> • BFA-2026-0142
                  </div>
                </div>
              </div>

              {/* Assessment Hero Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MID-TERM EXAMINATION</span>
                  <span style={{ backgroundColor: '#6ee7b7', color: '#065f46', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px' }}>Good Performance</span>
                </div>

                <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1e3a8a', fontWeight: '800' }}>{selectedSubject}</h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '800', color: '#0f172a' }}>82<span style={{ fontSize: '20px' }}>%</span></span>
                  <div style={{ backgroundColor: '#e0e7ff', color: '#1e3a8a', fontSize: '22px', fontWeight: '800', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    A
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  August 2, 2026
                </div>

                {/* Circular Trend Indicator Icon */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px solid #047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  </div>
                </div>
              </div>

              {/* Improvement & Class Average Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Improvement</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                    +6% <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>from previous</span>
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Class Average</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>74%</div>
                </div>
              </div>

              {/* Score Breakdown Table Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>Score Breakdown</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span>Classwork</span>
                    <strong style={{ color: '#0f172a' }}>18 / 20</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span>Assignments</span>
                    <strong style={{ color: '#0f172a' }}>17 / 20</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span>Class Tests</span>
                    <strong style={{ color: '#0f172a' }}>15 / 20</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <span>Mid-Term Examination</span>
                    <strong style={{ color: '#0f172a' }}>32 / 40</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a', paddingTop: '4px' }}>
                    <span>Total Score</span>
                    <span>82 / 100</span>
                  </div>
                </div>
              </div>

              {/* Teacher Feedback Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>Teacher Feedback</h3>
                </div>

                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#334155', lineHeight: '1.5', fontStyle: 'italic' }}>
                  "Daniel has shown good improvement in Mathematics this term. He demonstrates a strong understanding of the concepts covered. Continued practice with algebraic problem-solving is recommended."
                </p>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e3a8a', color: '#fff', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    KM
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Mr. James Aryee</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Mathematics Teacher • Aug 3, 2026</div>
                  </div>
                </div>
              </div>

              {/* What This Means (Intelligent Insight Card) */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>What this means</h3>
                </div>

                <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', fontSize: '13px', color: '#166534', lineHeight: '1.5' }}>
                  Daniel is currently performing above the expected level in Mathematics and has improved compared with his previous assessment.
                </div>
              </div>

              {/* Previous Results List Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>Previous Results</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Mid-Term Examination</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Aug 02</div>
                      </div>
                    </div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>82% &gt;</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Class Test</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Jul 20</div>
                      </div>
                    </div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>76% &gt;</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Assignment</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Jul 12</div>
                      </div>
                    </div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>79% &gt;</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={handleDownloadResultPDF}
                style={{ width: '100%', padding: '14px', border: '1.5px solid #1e3a8a', backgroundColor: '#fff', color: '#1e3a8a', borderRadius: '25px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                DOWNLOAD RESULT
              </button>

              <div style={{ textAlign: 'center' }}>
                <button style={{ border: 'none', background: 'none', color: '#1e3a8a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                  VIEW ACADEMIC HISTORY
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div style={{ height: '65px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ cursor: 'pointer', color: '#64748b' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Home</div>
          </div>
          <div style={{ cursor: 'pointer', color: '#1e3a8a' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Academics</div>
          </div>
          <div style={{ cursor: 'pointer', color: '#64748b' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Fees</div>
          </div>
          <div style={{ cursor: 'pointer', color: '#64748b' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Messages</div>
          </div>
          <div style={{ cursor: 'pointer', color: '#64748b' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>More</div>
          </div>
        </div>

      </div>
    </div>
  );
};