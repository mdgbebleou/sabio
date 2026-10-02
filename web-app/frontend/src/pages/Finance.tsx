import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface ClassFinance {
  id: string;
  className: string;
  expected: string;
  collected: string;
  outstanding: string;
  rate: number;
  hasWarning?: boolean;
}

const mockClassFinance: ClassFinance[] = [
  { id: '1', className: 'Form 1A', expected: 'GHS 120,000', collected: 'GHS 105,000', outstanding: 'GHS 15,000', rate: 87.5 },
  { id: '2', className: 'Form 2A', expected: 'GHS 118,000', collected: 'GHS 94,400', outstanding: 'GHS 23,600', rate: 80.0 },
  { id: '3', className: 'Form 3A', expected: 'GHS 125,000', collected: 'GHS 84,500', outstanding: 'GHS 40,500', rate: 67.6, hasWarning: true },
];

export const Finance: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'detail' | 'record' | 'discount' | 'assign' | 'createStructure' | null>(null);
  
  // Record / Adjust Payment tab state
  const [paymentTab, setPaymentTab] = useState<'record' | 'adjust'>('record');

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
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Fee & Finance Management</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Monitor school fee collections, outstanding balances and financial activity.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>
              <option>2026/2027</option>
            </select>
            <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>
              <option>Term 1</option>
            </select>
            <button 
              onClick={() => setActiveModal('createStructure')} 
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Fee Configuration
            </button>
            <button style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Financial Reports
            </button>
          </div>
        </div>

        {/* FEE CYCLE STATUS BANNER */}
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <div>
              <span style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '15px' }}>2026/2027 — Term 1</span>
              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', marginLeft: '10px' }}>● Fee cycle: Active</span>
              <span style={{ fontSize: '12px', color: '#475569', marginLeft: '12px' }}>Sept 1 — Dec 18</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a' }}>25 Days remaining</span>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>ON TRACK</span>
          </div>
        </div>

        {/* TOP KPI CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>EXPECTED FEES</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 2,480,000</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Total fees expected</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>COLLECTED (80%)</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 1,984,000</div>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>📈 +6.4% vs prev term</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>OUTSTANDING (20%)</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 496,000</div>
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>286 Students • 18 Attention needed</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>COLLECTION RATE</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>80.0%</div>
            <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', backgroundColor: '#002b49' }}></div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: INSIGHTS & OUTSTANDING AGING */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          
          {/* Financial Insights */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Financial Insights</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#991b1b', fontSize: '13px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                  Collection Gap
                </div>
                <p style={{ margin: '6px 0 10px 0', fontSize: '12px', color: '#7f1d1d' }}>
                  Fee collection is 8% below expected rate for this period.
                </p>
                <span onClick={() => setActiveModal('discount')} style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Review Outstanding →</span>
              </div>

              <div style={{ backgroundColor: '#fffbe3', border: '1px solid #fde047', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#854d0e', fontSize: '13px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                  High Outstanding Balances
                </div>
                <p style={{ margin: '6px 0 10px 0', fontSize: '12px', color: '#713f12' }}>
                  18 accounts significantly above threshold (GHS 84,600 combined).
                </p>
                <span onClick={() => setActiveModal('detail')} style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Review Balances →</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Aging & Recent Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Outstanding Aging */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Outstanding Aging</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Current (0-30 days)</span>
                  <strong style={{ color: '#0f172a' }}>GHS 210,000</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#d97706', fontWeight: 'bold' }}>Overdue (31-60 days)</span>
                  <strong style={{ color: '#d97706' }}>GHS 186,000</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Significantly Overdue (90+)</span>
                  <strong style={{ color: '#dc2626' }}>GHS 100,000</strong>
                </div>
              </div>
            </div>

            {/* Recent Payments Quick Feed */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Recent Payments</h4>
                <button onClick={() => setActiveModal('record')} style={{ border: 'none', background: 'none', fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>+ Record</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div onClick={() => setActiveModal('detail')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}>Ama Mensah</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Form 2A • Mobile Money</div>
                  </div>
                  <strong style={{ color: '#166534', fontSize: '12px' }}>+GHS 1,200</strong>
                </div>

                <div onClick={() => setActiveModal('detail')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}>Kofi Osei</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Form 1B • Bank Transfer</div>
                  </div>
                  <strong style={{ color: '#166534', fontSize: '12px' }}>+GHS 3,500</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Quick Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => setActiveModal('assign')} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  📋 Manage Fee Structures
                </button>
                <button onClick={() => setActiveModal('discount')} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  🏷️ Waive / Discount Fee
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* CLASS COLLECTION PERFORMANCE TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Class Collection Performance</h3>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>View All Classes</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>CLASS</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>EXPECTED</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>COLLECTED</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>OUTSTANDING</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>RATE</th>
              </tr>
            </thead>
            <tbody>
              {mockClassFinance.map((cls) => (
                <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#0f172a' }}>
                    {cls.className} {cls.hasWarning && <span style={{ color: '#dc2626', marginLeft: '4px' }}>🚩</span>}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>{cls.expected}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#166534' }}>{cls.collected}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 'bold', color: cls.hasWarning ? '#dc2626' : '#334155' }}>{cls.outstanding}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: cls.rate < 70 ? '#dc2626' : '#0f172a', minWidth: '45px' }}>{cls.rate}%</span>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', maxWidth: '120px' }}>
                        <div style={{ width: `${cls.rate}%`, height: '100%', backgroundColor: cls.rate < 70 ? '#dc2626' : '#002b49' }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: PAYMENT DETAIL MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'detail' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Payment Detail</h3>
                      <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>COMPLETED</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>TXN-89247-B</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Adjust Payment</button>
                  <button style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}> Receipt</button>
                  <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b', marginLeft: '8px' }}>✕</button>
                </div>
              </div>

              <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                
                {/* Payer Information & Transaction Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '12px' }}>PAYER INFORMATION</div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Eleanor Vance" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Eleanor Vance</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Grade 10 - Section B</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div><span style={{ color: '#64748b' }}>Student ID</span><br /><strong>STU-24901</strong></div>
                      <div><span style={{ color: '#64748b' }}>Guardian</span><br /><strong>Marcus Vance</strong></div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>TRANSACTION DETAILS</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>$1,450.00</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>🏦 Bank Transfer (Wire)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div><span style={{ color: '#64748b' }}>Date</span><br /><strong>Oct 24, 2023, 09:15 AM</strong></div>
                      <div><span style={{ color: '#64748b' }}>Reference</span><br /><strong>REF-WI-992-A</strong></div>
                    </div>
                  </div>

                </div>

                {/* Fee Allocation Table */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase' }}>
                    FEE ALLOCATION
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left' }}>
                        <th style={{ padding: '10px 16px' }}>DESCRIPTION</th>
                        <th style={{ padding: '10px 16px' }}>TERM</th>
                        <th style={{ padding: '10px 16px' }}>AMOUNT APPLIED</th>
                        <th style={{ padding: '10px 16px' }}>REMAINING BALANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>Fall Term Tuition</td>
                        <td style={{ padding: '10px 16px', color: '#64748b' }}>Fall 2023</td>
                        <td style={{ padding: '10px 16px' }}>$1,200.00</td>
                        <td style={{ padding: '10px 16px', color: '#166534', fontWeight: 'bold' }}>$0.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>Technology Fee</td>
                        <td style={{ padding: '10px 16px', color: '#64748b' }}>Annual</td>
                        <td style={{ padding: '10px 16px' }}>$150.00</td>
                        <td style={{ padding: '10px 16px', color: '#166534', fontWeight: 'bold' }}>$0.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>Extracurricular Activity Fund</td>
                        <td style={{ padding: '10px 16px', color: '#64748b' }}>Fall 2023</td>
                        <td style={{ padding: '10px 16px' }}>$100.00</td>
                        <td style={{ padding: '10px 16px', color: '#dc2626', fontWeight: 'bold' }}>$50.00</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                        <td colSpan={2} style={{ padding: '10px 16px', textAlign: 'right' }}>Total Applied:</td>
                        <td style={{ padding: '10px 16px' }}>$1,450.00</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Audit Trail Info */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>AUDIT TRAIL</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '11px' }}>
                    <div><span style={{ color: '#64748b' }}>RECORDED BY</span><br /><strong>System Auto-Process (WebHook)</strong></div>
                    <div><span style={{ color: '#64748b' }}>RECORDED AT</span><br /><strong>2023-10-24 09:15:22 UTC</strong></div>
                    <div><span style={{ color: '#64748b' }}>SOURCE INFO</span><br /><strong>IP: 192.168.1.44 / Stripe Gateway</strong></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: RECORD OR ADJUST PAYMENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'record' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Record or Adjust Payment</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Transaction Management</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <button 
                    onClick={() => setPaymentTab('record')} 
                    style={{ flex: 1, padding: '10px', border: 'none', background: 'none', borderBottom: paymentTab === 'record' ? '2px solid #002b49' : 'none', fontWeight: 'bold', fontSize: '12px', color: paymentTab === 'record' ? '#002b49' : '#64748b', cursor: 'pointer' }}
                  >
                    RECORD NEW PAYMENT
                  </button>
                  <button 
                    onClick={() => setPaymentTab('adjust')} 
                    style={{ flex: 1, padding: '10px', border: 'none', background: 'none', borderBottom: paymentTab === 'adjust' ? '2px solid #002b49' : 'none', fontWeight: 'bold', fontSize: '12px', color: paymentTab === 'adjust' ? '#002b49' : '#64748b', cursor: 'pointer' }}
                  >
                    ADJUST EXISTING
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Student ID / Name</label>
                  <input type="text" placeholder="🔍 Search students..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Amount ($)</label>
                    <input type="number" placeholder="0.00" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Payment Method</label>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Select method...</option>
                      <option>Bank Transfer</option>
                      <option>Mobile Money</option>
                      <option>Cash</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reference Number</label>
                    <input type="text" placeholder="e.g. TXN-123456" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Date</label>
                    <input type="date" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Balance Impact */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>CURRENT OUTSTANDING</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>$1,250.00</div>
                  </div>
                  <div style={{ fontSize: '18px', color: '#64748b' }}>→</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>PROJECTED BALANCE</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>--</div>
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>ℹ️ This action will be logged in the financial audit trail.</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Process Transaction</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: WAIVE OR DISCOUNT FEE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'discount' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Waive or Discount Fee</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Adjust fee obligations for an individual student.</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Student</label>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Alex Johnson (Grade 12)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Fee Item</label>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Term 2 Tuition - GHS 1,200</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>ADJUSTMENT DETAILS</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Adjustment Type</label>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Fixed Amount Discount</option>
                      <option>Percentage Discount</option>
                      <option>Full Fee Waiver</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Value (GHS)</label>
                    <input type="number" defaultValue={200} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reason Code</label>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>Scholarship</option>
                    <option>Financial Hardship</option>
                    <option>Staff Child Discount</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Supporting Note</label>
                  <textarea placeholder="Provide context for this adjustment..." style={{ width: '100%', height: '60px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                {/* Calculation summary */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>ORIGINAL</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>GHS 1,200</div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>→</div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#dc2626' }}>DISCOUNT</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#dc2626' }}>GHS 200</div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>→</div>
                  <div style={{ backgroundColor: '#e0e7ff', border: '1px solid #c7d2fe', padding: '8px 14px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#3730a3', fontWeight: 'bold' }}>NEW BALANCE</div>
                    <div style={{ fontWeight: '900', fontSize: '16px', color: '#3730a3' }}>GHS 1,000</div>
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>👁️ Review Impact</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Adjustment</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: ASSIGN FEE STRUCTURE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'assign' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Assign Fee Structure</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure and allocate fees to specific student groups.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>1. SELECT FEE STRUCTURE</div>
                <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '20px' }}>
                  <option>Choose a predefined structure...</option>
                  <option>Tuition Fee 2026/2027</option>
                </select>

                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>2. TARGET AUDIENCE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '20px' }}>🎓</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Entire Grade</div>
                  </div>
                  <div style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '20px' }}>🏫</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#002b49' }}>Specific Class</div>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '20px' }}>👤</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Individual</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Select Class(es)</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>JHS 1A ✕</span>
                    <span style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>JHS 1B ✕</span>
                    <button style={{ border: '1px dashed #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>+ Add Class</button>
                  </div>
                </div>

                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>3. CUSTOM ADJUSTMENTS</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                  <input type="number" placeholder="GHS 0.00" style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <input type="radio" name="adj" defaultChecked /> Discount
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <input type="radio" name="adj" /> Surcharge
                  </label>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#1e3a8a' }}>Impact Analysis</div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e40af' }}>Assigning to 118 students</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#1e3a8a' }}>Total Projected Revenue</div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e40af' }}>GHS 118,000.00</div>
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>✓ Confirm Assignment</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 5: CREATE FEE STRUCTURE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'createStructure' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Create Fee Structure</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Define billing parameters and scope for a new institutional fee.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                {/* 1. Basic Info */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>1. BASIC INFORMATION</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '4px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Fee Name *</label>
                    <input type="text" defaultValue="Tuition Fall 2024" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #dc2626', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Category *</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Tuition</option>
                      <option>Facility Fee</option>
                    </select>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', marginBottom: '12px' }}>
                  ⚠️ A fee structure with this name already exists.
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Internal Description</label>
                  <textarea placeholder="Optional notes regarding this fee's purpose..." style={{ width: '100%', height: '50px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                {/* 2. Applicability Scope */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>2. APPLICABILITY SCOPE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Academic Year</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>2024 - 2025</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Term / Semester</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Fall Semester</option>
                    </select>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '20px', display: 'flex', gap: '16px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" defaultChecked /> All Grades</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> Specific Grades...</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> Specific Programs...</label>
                </div>

                {/* 3. Pricing & Rules */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>3. PRICING & RULES</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Base Amount</label>
                    <input type="number" placeholder="0.00 USD" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Late Fee Policy</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Fixed Amount ($50.00)</option>
                    </select>
                  </div>
                </div>

                {/* 4. Billing Schedule */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>4. BILLING SCHEDULE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Invoice Issue Date</label>
                    <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Payment Due Date</label>
                    <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>💾 Save Structure</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};