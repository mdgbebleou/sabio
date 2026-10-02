import React, { useState } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface PaymentTransaction {
  id: string;
  student: string;
  studentInitials: string;
  avatarBg: string;
  transactionId: string;
  feeCategory: string;
  amount: string;
  method: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Verification Required';
}

const trendDataDaily = [
  { time: 'Mon', amount: 1200 },
  { time: 'Tue', amount: 2400 },
  { time: 'Wed', amount: 1800 },
  { time: 'Thu', amount: 4500 },
  { time: 'Fri', amount: 3200 },
  { time: 'Sat', amount: 5100 },
  { time: 'Sun', amount: 8450 },
];

const trendDataWeekly = [
  { time: 'Week 1', amount: 15400 },
  { time: 'Week 2', amount: 22100 },
  { time: 'Week 3', amount: 18900 },
  { time: 'Week 4', amount: 31200 },
];

const trendDataMonthly = [
  { time: 'Jan', amount: 42000 },
  { time: 'Feb', amount: 48000 },
  { time: 'Mar', amount: 58000 },
  { time: 'Apr', amount: 45000 },
  { time: 'May', amount: 55000 },
  { time: 'Jun', amount: 60000 },
  { time: 'Jul', amount: 68000 },
];

const paymentMethodsData = [
  { name: 'Mobile Money', value: 45, color: '#0f172a' },
  { name: 'Bank Transfer', value: 20, color: '#3b82f6' },
  { name: 'Cash', value: 15, color: '#64748b' },
  { name: 'Card', value: 7, color: '#cbd5e1' },
];

const mockPayments: PaymentTransaction[] = [
  { id: '1', student: 'Daniel Mensah', studentInitials: 'DM', avatarBg: '#3b82f6', transactionId: 'PAY-10482', feeCategory: 'School Fees', amount: 'GHS 2,500', method: 'Mobile Money', date: 'Aug 14, 2026', status: 'Completed' },
  { id: '2', student: 'Ama Owusu', studentInitials: 'AO', avatarBg: '#ec4899', transactionId: 'PAY-10481', feeCategory: 'PTA Levy', amount: 'GHS 500', method: 'Cash', date: 'Aug 14, 2026', status: 'Completed' },
  { id: '3', student: 'Kojo Asare', studentInitials: 'KA', avatarBg: '#f97316', transactionId: 'PAY-10480', feeCategory: 'School Fees', amount: 'GHS 1,800', method: 'Bank Transfer', date: 'Aug 13, 2026', status: 'Pending' },
  { id: '4', student: 'Akua Boateng', studentInitials: 'AB', avatarBg: '#8b5cf6', transactionId: 'PAY-10479', feeCategory: 'School Fees', amount: 'GHS 3,000', method: 'Mobile Money', date: 'Aug 13, 2026', status: 'Verification Required' },
];

export const AccountantPayments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const getTrendData = () => {
    if (timeframe === 'Weekly') return trendDataWeekly;
    if (timeframe === 'Monthly') return trendDataMonthly;
    return trendDataDaily;
  };

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
        
        {/* PAGE TITLE & SUBTITLE */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Payments
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            View and manage all fee payments received by the school
          </p>
        </div>

        {/* 4 TOP SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Payments</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 248,500</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>87 transactions</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Today's Collections</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 8,450</div>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>12 payments</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Pending Verification</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>5 Payments</div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Require review</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Refunded</span>
              <span style={{ backgroundColor: '#f0f9ff', color: '#0284c7', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 3,200</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>4 transactions</span>
          </div>

        </div>

        {/* CHARTS SECTION (PAYMENT COLLECTION OVERVIEW & PAYMENT METHODS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>
          
          {/* PAYMENT COLLECTION OVERVIEW (RECHARTS AREA CHART) */}
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Payment Collection Overview</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Track incoming collections over time</span>
              </div>
              
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                {(['Daily', 'Weekly', 'Monthly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTimeframe(tab)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: timeframe === tab ? '#ffffff' : 'transparent',
                      color: timeframe === tab ? '#0f172a' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: timeframe === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: '260px', flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }} />
                  <Area type="monotone" dataKey="amount" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PAYMENT METHODS (RECHARTS DONUT CHART) */}
          <div style={{ ...cardStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '380px' }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Payment Methods</h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Distribution by channel</span>
            </div>

            <div style={{ width: '100%', height: '190px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }} />
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>87</div>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', fontWeight: 'bold', color: '#334155', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#0f172a', borderRadius: '50%' }} /> Mobile Money</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} /> Bank Transfer</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#64748b', borderRadius: '50%' }} /> Cash</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#cbd5e1', borderRadius: '50%' }} /> Card</div>
            </div>
          </div>

        </div>

        {/* PAYMENTS TRANSACTIONS TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          
          {/* TABLE CONTROLS BAR */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: '280px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search payments..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '12px', width: '100%', color: '#0f172a' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter
              </button>

              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>

              <button style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              </button>
            </div>
          </div>

          {/* TABLE DATA */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px' }}>STUDENT</th>
                  <th style={{ padding: '12px 20px' }}>TRANSACTION ID</th>
                  <th style={{ padding: '12px 20px' }}>FEE CATEGORY</th>
                  <th style={{ padding: '12px 20px' }}>AMOUNT</th>
                  <th style={{ padding: '12px 20px' }}>METHOD</th>
                  <th style={{ padding: '12px 20px' }}>DATE</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: item.avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                        {item.studentInitials}
                      </div>
                      <strong style={{ color: '#0f172a' }}>{item.student}</strong>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{item.transactionId}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.feeCategory}</td>
                    <td style={{ padding: '12px 20px', color: '#0f172a', fontWeight: 'bold' }}>{item.amount}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.method}</td>
                    <td style={{ padding: '12px 20px', color: '#64748b' }}>{item.date}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ 
                        backgroundColor: item.status === 'Completed' ? '#dcfce7' : item.status === 'Pending' ? '#fef3c7' : '#fee2e2', 
                        color: item.status === 'Completed' ? '#166534' : item.status === 'Pending' ? '#b45309' : '#991b1b', 
                        padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' 
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '10px' }}>
            <div>Showing <strong>1 to 4</strong> of <strong>87</strong> results</div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Prev</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>1</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>2</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>3</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Next</button>
            </div>
          </div>

        </div>

      </div>
    </AccountantLayout>
  );
};