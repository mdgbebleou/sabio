import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

export const ReportsAnalytics: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'config' | 'population' | 'export' | 'preview' | null>(null);
  const [reportBlueprint, setReportBlueprint] = useState<'academic' | 'attendance' | 'finance'>('academic');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [timeFilter, setTimeFilter] = useState<'Today' | 'This Week' | 'This Term'>('This Term');

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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '840px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Overview</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Turn school data into insights that support informed administrative decisions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Report History
            </button>
            <button 
              onClick={() => setActiveModal('export')} 
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Report
            </button>
            <button 
              onClick={() => setActiveModal('config')} 
              style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Generate Report
            </button>
          </div>
        </div>

        {/* TIME FILTER & ACADEMIC TERM SELECTOR */}
        <div style={{ ...cardStyle, padding: '12px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <select style={{ border: 'none', background: 'none', fontSize: '15px', fontWeight: '800', color: '#0f172a', outline: 'none', cursor: 'pointer' }}>
              <option>2026/2027 Academic Year - First Term</option>
              <option>2025/2026 Academic Year - Third Term</option>
            </select>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '2px' }}>
            {(['Today', 'This Week', 'This Term'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: timeFilter === tf ? '#ffffff' : 'transparent',
                  color: timeFilter === tf ? '#0f172a' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: timeFilter === tf ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* KEY PERFORMANCE METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>STUDENTS</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>1,248</div>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>↑ 4.2% vs last term</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACADEMIC AVG</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>78.6%</div>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>↑ 3.8%</div>
          </div>

          <div style={{ ...cardStyle, borderLeft: '4px solid #dc2626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ATTENDANCE</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>86.4%</div>
            <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 'bold', marginTop: '4px' }}>↓ 2.1% Needs Attention</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>REVENUE</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>GHS 1.84M</div>
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: '82%', height: '100%', backgroundColor: '#002b49' }}></div>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>82% Collected</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PARENT ENG.</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>74%</div>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>↑ 9.6%</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TEACHER ACT.</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>91%</div>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>↑ 4.1%</div>
          </div>
        </div>

        {/* MIDDLE SECTION: SCHOOL INSIGHTS & PERFORMANCE TREND */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
          
          {/* School Insights */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              School Insights
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: 'bold' }}>Mathematics performance declined by 7.2% in Form 2.</div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626', marginTop: '4px', display: 'block' }}>Attention Required</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '12px', color: '#334155' }}>18 students below 85% attendance threshold.</div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e40af', marginTop: '4px', display: 'block' }}>Important</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '12px', color: '#334155' }}>Outstanding balances increased by 14% - 62% in 3 classes.</div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e40af', marginTop: '4px', display: 'block' }}>Important</span>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold' }}>Parent engagement increased to 81%.</div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#15803d', marginTop: '4px', display: 'block' }}>Positive Trend</span>
              </div>
            </div>
          </div>

          {/* School Performance Trend Chart & Correlations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>School Performance Trend</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Comparing Term 1, 2, & 3 vs Previous Year</span>
                </div>
                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>⋮</button>
              </div>

              {/* Bar Chart Representation */}
              <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '48px', height: '100px', backgroundColor: '#002b49', borderRadius: '6px 6px 0 0' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>T1</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '48px', height: '130px', backgroundColor: '#002b49', borderRadius: '6px 6px 0 0' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>T2</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '48px', height: '150px', backgroundColor: '#002b49', borderRadius: '6px 6px 0 0' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>T3</span>
                </div>
              </div>
            </div>

            {/* Cross-Module Correlations */}
            <div style={{ ...cardStyle, borderLeft: '4px solid #002b49' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Cross-Module Correlations
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#334155' }}>
                    Students with attendance below 80% have academic scores averaging <strong style={{ color: '#dc2626' }}>12% lower</strong> than peers.
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#334155' }}>
                    Highly engaged parent accounts correlate with <strong style={{ color: '#002b49' }}>higher timely payment rates</strong> for school fees.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ADMINISTRATIVE ATTENTION REQUIRED TABLE CONTAINER */}
        <div style={{ ...cardStyle, borderColor: '#fecaca' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Administrative Attention Required
            </h3>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>View All Exceptions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>18 Students below attendance threshold</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Across 5 different classes</div>
              </div>
              <button style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                Review List
              </button>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Delayed result submissions</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Form 2B, Form 3A, Form 1C</div>
              </div>
              <button style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                Notify Teachers
              </button>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>124 Overdue Accounts</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Exceeding 30 days past due date</div>
              </div>
              <button style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                Send Reminders
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: REPORT CONFIGURATION MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'config' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '840px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Report Configuration</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure parameters for data extraction and analysis.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
                {/* Left Step Menu */}
                <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#002b49', color: '#ffffff' }}>Report Type</div>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', color: '#64748b' }}>Academic Period</div>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', color: '#64748b' }}>Target Entities</div>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', color: '#64748b' }}>Advanced Filters</div>
                </div>

                {/* Main Config Options */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px' }}>SELECT REPORT BLUEPRINT</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div 
                      onClick={() => setReportBlueprint('academic')} 
                      style={{ border: reportBlueprint === 'academic' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', backgroundColor: reportBlueprint === 'academic' ? '#f0f9ff' : '#ffffff' }}
                    >
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Academic Performance</strong>
                      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>Grades, assessments, and standard deviations.</span>
                    </div>

                    <div 
                      onClick={() => setReportBlueprint('attendance')} 
                      style={{ border: reportBlueprint === 'attendance' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', backgroundColor: reportBlueprint === 'attendance' ? '#f0f9ff' : '#ffffff' }}
                    >
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Attendance Register</strong>
                      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>Daily presence, tardiness, and leave records.</span>
                    </div>

                    <div 
                      onClick={() => setReportBlueprint('finance')} 
                      style={{ border: reportBlueprint === 'finance' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', backgroundColor: reportBlueprint === 'finance' ? '#f0f9ff' : '#ffffff' }}
                    >
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Financial Reconciliation</strong>
                      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>Fee collection, arrears, and receipt summaries.</span>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>TARGET ENTITIES</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>Academic Year</label>
                        <select style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                          <option>2026 - 2027 (Current)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>Term / Semester</label>
                        <select style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                          <option>Term 1</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Current Selection: <strong>Academic Performance &gt; 2026-2027 Term 1</strong></span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setActiveModal('population')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Select Population →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: SELECT DATA POPULATION MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'population' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '600px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Select Data Population</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Define the scope for the End of Term Academic Report.</p>
                </div>
                <button onClick={() => setActiveModal('config')} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                    <span>CLASS NAME</span>
                    <span>STUDENTS</span>
                  </div>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked /> 10A - Science</label>
                    <span>32</span>
                  </div>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked /> 10B - Arts</label>
                    <span>28</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>REPORT POPULATION</span>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>60 Unique Students</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('config')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setActiveModal('export')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Selection</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: EXPORT OPTIONS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'export' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '560px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Export Options</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure output format for the selected 60 students.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div onClick={() => setExportFormat('pdf')} style={{ border: exportFormat === 'pdf' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: exportFormat === 'pdf' ? '#f0f9ff' : '#ffffff' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>PDF Report</strong>
                  </div>
                  <div onClick={() => setExportFormat('excel')} style={{ border: exportFormat === 'excel' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: exportFormat === 'excel' ? '#f0f9ff' : '#ffffff' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Excel</strong>
                  </div>
                  <div onClick={() => setExportFormat('csv')} style={{ border: exportFormat === 'csv' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: exportFormat === 'csv' ? '#f0f9ff' : '#ffffff' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Raw CSV</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', fontSize: '11px', color: '#991b1b' }}>
                  <strong>Data Protection Warning:</strong> This export contains Personally Identifiable Information (PII). Ensure compliance with institutional data policies.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal('preview')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Preview & Generate →</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: REPORT PREVIEW MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'preview' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '800px' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Report Preview: Term 1 Academic Performance</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '30px', maxHeight: '75vh', overflowY: 'auto', backgroundColor: '#ffffff' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #002b49', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#002b49' }}>Academic Performance Report</h2>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Term 1, 2026-2027 Academic Year</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
                      Generated: Sep 22, 2026<br />Scope: Selected Classes<br />ID: REP-894-2A
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Executive Summary</strong>
                      <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                        Overall academic performance for Term 1 demonstrates a stable trajectory with an institutional average of 82.4%. Mathematics and Sciences show a 4% improvement over the previous term.
                      </p>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b' }}>INSTITUTIONAL AVG</span>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: '#002b49', marginTop: '4px' }}>82.4%</div>
                      <span style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold' }}>↑ +2.1%</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>INTELLIGENT INSIGHTS</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px', fontSize: '11px' }}>
                      <strong style={{ color: '#0369a1', display: 'block' }}>STEM Improvement</strong>
                      <span style={{ color: '#334155' }}>Grade 10 Physics scores improved by 12% following lab upgrades.</span>
                    </div>

                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', fontSize: '11px' }}>
                      <strong style={{ color: '#991b1b', display: 'block' }}>Attendance Correlation</strong>
                      <span style={{ color: '#7f1d1d' }}>Students with &lt;90% attendance in Grade 8 History average 15% below class median.</span>
                    </div>
                  </div>

                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('export')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Back to Export</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Download Report (PDF)</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};