import React, { useState } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';

interface GeneratedReportRecord {
  id: string;
  reportName: string;
  period: string;
  generatedBy: string;
  date: string;
  format: 'PDF' | 'CSV';
}

const mockRecentlyGenerated: GeneratedReportRecord[] = [
  { id: '1', reportName: 'Fee Collection Report', period: 'Second Term - 25/26', generatedBy: 'Accountant', date: 'Aug 14, 2026', format: 'PDF' },
  { id: '2', reportName: 'Outstanding Fees Report', period: 'Second Term - 25/26', generatedBy: 'System Auto', date: 'Aug 12, 2026', format: 'CSV' },
];

export const AccountantReports: React.FC = () => {
  const [activeTimeTab, setActiveTimeTab] = useState('This Term');

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* PAGE HEADER & PRIMARY ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Financial Reports
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Generate, review, and export financial reports for your school.</span>
          </div>

          <button style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Generate Report
          </button>
        </div>

        {/* TIME RANGE FILTER BAR */}
        <div style={{ ...cardStyle, padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Today', 'This Week', 'This Month', 'This Term', 'Academic Year'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTimeTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: activeTimeTab === tab ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  backgroundColor: activeTimeTab === tab ? '#0f172a' : '#ffffff',
                  color: activeTimeTab === tab ? '#ffffff' : '#334155',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#334155', fontWeight: 'bold' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Aug 01, 2026 - Aug 14, 2026</span>
          </div>
        </div>

        {/* 4 TOP SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Collected</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 248,500</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>from 87 payments</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Outstanding</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 86,750</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>across 124 students</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Invoiced</span>
              <span style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 335,250</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>from 124 invoices</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Collection Rate</span>
              <span style={{ backgroundColor: '#f8fafc', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>74%</div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: '74%', height: '100%', backgroundColor: '#0f172a' }} />
            </div>
          </div>

        </div>

        {/* AVAILABLE REPORTS SECTION */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Available Reports</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            {/* CARD 1 */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: '#f1f5f9', color: '#0f172a', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Fee Collection Report</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                  Detailed breakdown of all fees collected during the selected term or period.
                </p>
              </div>
              <button style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                Generate <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>

            {/* CARD 2 */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: '#f1f5f9', color: '#0f172a', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Payment Report</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                  Log of individual payment transactions, methods, and reconciliation statuses.
                </p>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                View Report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            {/* CARD 3 */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Outstanding Fees</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                  List of students with overdue balances, aged by collection risk categories.
                </p>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                View Report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            {/* CARD 4 */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: '#f0fdf4', color: '#166534', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Income Summary</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                  High-level summary of total income versus expected financial targets.
                </p>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                View Report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

          </div>
        </div>

        {/* RECENTLY GENERATED TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recently Generated</h3>
            <button style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: 'bold', color: '#1d4ed8', cursor: 'pointer' }}>View All</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px' }}>REPORT NAME</th>
                  <th style={{ padding: '12px 20px' }}>PERIOD</th>
                  <th style={{ padding: '12px 20px' }}>GENERATED BY</th>
                  <th style={{ padding: '12px 20px' }}>DATE</th>
                  <th style={{ padding: '12px 20px' }}>FORMAT</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentlyGenerated.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', color: '#0f172a' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {item.reportName}
                    </td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.period}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.generatedBy}</td>
                    <td style={{ padding: '12px 20px', color: '#64748b' }}>{item.date}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ 
                        backgroundColor: item.format === 'PDF' ? '#fee2e2' : '#dcfce7', 
                        color: item.format === 'PDF' ? '#991b1b' : '#166534', 
                        padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' 
                      }}>
                        {item.format}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                        <button title="View Report" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button title="Download Report" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </AccountantLayout>
  );
};