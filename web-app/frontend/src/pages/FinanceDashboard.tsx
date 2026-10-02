import React, { useState } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';

interface Transaction {
  id: string;
  student: string;
  class: string;
  typeId: string;
  amount: string;
  status: 'Paid' | 'Pending';
}

interface OutstandingItem {
  id: string;
  student: string;
  class: string;
  balance: string;
  total: string;
  status: 'Overdue' | 'Partial' | 'Unpaid';
  since?: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', student: 'Daniel Mensah', class: 'JHS 3 A', typeId: 'Tuition Fee (TRX-8901)', amount: 'GHS 1,200', status: 'Paid' },
  { id: '2', student: 'Ama Owusu', class: 'Primary 4', typeId: 'Bus Fee (TRX-8902)', amount: 'GHS 450', status: 'Paid' },
  { id: '3', student: 'Kojo Asare', class: 'SHS 1', typeId: 'PTA Dues (TRX-8903)', amount: 'GHS 150', status: 'Pending' },
  { id: '4', student: 'Akua Boateng', class: 'Primary 6', typeId: 'Tuition Fee (TRX-8904)', amount: 'GHS 900', status: 'Paid' },
];

const mockOutstanding: OutstandingItem[] = [
  { id: '1', student: 'Kwame Asante', class: 'JHS 2', balance: 'GHS 1,500', total: 'Total: GHS 4,500', status: 'Overdue', since: 'Since Aug 10' },
  { id: '2', student: 'Grace Osei', class: 'SHS 2', balance: 'GHS 800', total: 'Total: GHS 3,200', status: 'Partial' },
  { id: '3', student: 'Samuel Tetteh', class: 'Primary 1', balance: 'GHS 1,200', total: 'Total: GHS 1,200', status: 'Unpaid' },
];

export const FinanceDashboard: React.FC = () => {
  const [collectionTab, setCollectionTab] = useState<'Monthly' | 'Termly' | 'Yearly'>('Monthly');

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
        
        {/* TOP WELCOME & SELECTORS HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Good Morning, Mavis
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
              <option>2025/2026 Academic Year</option>
            </select>
            <select style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
              <option>Second Term</option>
            </select>
          </div>
        </div>

        {/* 4 TOP METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Fees Collected</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '4px', borderRadius: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 248,500</div>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>+12.5% vs last term</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Outstanding Fees</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px', borderRadius: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 86,750</div>
            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>
              124 students
            </span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Payments This Month</span>
              <span style={{ backgroundColor: '#f0f9ff', color: '#0284c7', padding: '4px', borderRadius: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 42,300</div>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>
              87 transactions
            </span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Overdue Payments</span>
              <span style={{ backgroundColor: '#fefce8', color: '#ca8a04', padding: '4px', borderRadius: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 31,200</div>
            <span style={{ backgroundColor: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>
              46 students
            </span>
          </div>

        </div>

        {/* MIDDLE SECTION: EXPANDED GRAPH & SIDE PANELS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>
          
          {/* EXPANDED FEE COLLECTION OVERVIEW & REAL GRAPH */}
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '430px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Fee Collection Overview</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Detailed collection metrics and trends over time</span>
              </div>
              
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                {(['Monthly', 'Termly', 'Yearly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCollectionTab(tab)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: collectionTab === tab ? '#ffffff' : 'transparent',
                      color: collectionTab === tab ? '#0f172a' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: collectionTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>74%</div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>Total Progress</span>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px', display: 'flex', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>EXPECTED</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>GHS 335,250</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>COLLECTED</span>
                  <strong style={{ fontSize: '13px', color: '#166534' }}>GHS 248,500</strong>
                </div>
              </div>
            </div>

            {/* REAL EXPANDED MULTI-COLUMN GRAPH */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#64748b', marginBottom: '16px', fontWeight: 'bold' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} /> Expected</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#002b49', borderRadius: '2px' }} /> Collected</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#fca5a5', borderRadius: '2px' }} /> Outstanding</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', gap: '12px' }}>
                {[
                  { month: 'Jan', exp: '80%', col: '60%', out: '20%' },
                  { month: 'Feb', exp: '85%', col: '70%', out: '25%' },
                  { month: 'Mar', exp: '95%', col: '90%', out: '10%' },
                  { month: 'Apr', exp: '80%', col: '65%', out: '20%' },
                  { month: 'May', exp: '100%', col: '90%', out: '15%' },
                  { month: 'Jun', exp: '90%', col: '75%', out: '15%' },
                  { month: 'Jul', exp: '85%', col: '80%', out: '10%' },
                ].map((bar, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '170px', width: '100%', justifyContent: 'center' }}>
                      <div title={`Expected: ${bar.exp}`} style={{ width: '22%', height: bar.exp, backgroundColor: '#e2e8f0', borderRadius: '3px 3px 0 0' }} />
                      <div title={`Collected: ${bar.col}`} style={{ width: '22%', height: bar.col, backgroundColor: '#002b49', borderRadius: '3px 3px 0 0' }} />
                      <div title={`Outstanding: ${bar.out}`} style={{ width: '22%', height: bar.out, backgroundColor: '#fca5a5', borderRadius: '3px 3px 0 0' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIGHT-MODE QUICK ACTIONS & FINANCIAL ALERTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* QUICK ACTIONS CARD (UPDATED TO LIGHT THEME) */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 10px', color: '#0f172a', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Record Payment</span>
                </button>
                <button style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 10px', color: '#0f172a', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Create Invoice</span>
                </button>
                <button style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 10px', color: '#0f172a', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Fee Records</span>
                </button>
                <button style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 10px', color: '#0f172a', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Financial Reports</span>
                </button>
              </div>
            </div>

            {/* FINANCIAL ALERTS CARD */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Financial Alerts</h3>
                <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>3 New</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#dc2626', marginTop: '2px' }}>⚠️</span>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block' }}>Overdue Payments</strong>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>46 students have overdue balances exceeding 30 days.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#ca8a04', marginTop: '2px' }}>🛡</span>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block' }}>Verification Required</strong>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>12 manual bank transfer slips require your approval.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#0284c7', marginTop: '2px' }}>ℹ</span>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block' }}>Term Collection Status</strong>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>You are 26% away from the Second Term collection target.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: RESPONSIVE TABLES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', alignItems: 'start' }}>
          
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recent Transactions</h3>
              <button style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>View All</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '400px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>STUDENT</th>
                    <th style={{ padding: '12px 20px' }}>TYPE / ID</th>
                    <th style={{ padding: '12px 20px' }}>AMOUNT</th>
                    <th style={{ padding: '12px 20px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{tx.student}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{tx.class}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{tx.typeId}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{tx.amount}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ 
                          backgroundColor: tx.status === 'Paid' ? '#dcfce7' : '#fef3c7', 
                          color: tx.status === 'Paid' ? '#166534' : '#b45309', 
                          padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' 
                        }}>
                          {tx.status === 'Paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Critical Outstanding</h3>
              <button style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>View All</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '400px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>STUDENT</th>
                    <th style={{ padding: '12px 20px' }}>BALANCE</th>
                    <th style={{ padding: '12px 20px' }}>STATUS</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOutstanding.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{item.student}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{item.class}</span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <strong style={{ color: '#dc2626', display: 'block' }}>{item.balance}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{item.total}</span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ 
                          backgroundColor: item.status === 'Overdue' ? '#fee2e2' : item.status === 'Partial' ? '#e0f2fe' : '#f1f5f9', 
                          color: item.status === 'Overdue' ? '#991b1b' : item.status === 'Partial' ? '#0369a1' : '#475569', 
                          padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' 
                        }}>
                          {item.status} {item.since ? `(${item.since})` : ''}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>
                          Remind
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </AccountantLayout>
  );
};