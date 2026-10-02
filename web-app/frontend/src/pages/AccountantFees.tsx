import React, { useState } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface StudentFeeRecord {
  id: string;
  name: string;
  studentId: string;
  avatarBg: string;
  class: string;
  totalFees: string;
  amountPaid: string;
  balance: string;
  status: 'Paid' | 'Partially Paid' | 'Overdue' | 'Outstanding';
  dueDate: string;
}

const feeTrendData = [
  { month: 'Jan', expected: 45000, collected: 38000 },
  { month: 'Feb', expected: 50000, collected: 42000 },
  { month: 'Mar', expected: 55000, collected: 49000 },
  { month: 'Apr', expected: 48000, collected: 37000 },
  { month: 'May', expected: 52000, collected: 46000 },
  { month: 'Jun', expected: 60000, collected: 52000 },
  { month: 'Jul', expected: 65000, collected: 59000 },
  { month: 'Aug', expected: 60000, collected: 45000 },
];

const paymentStatusData = [
  { name: 'Paid', value: 86, color: '#10b981' },
  { name: 'Partial', value: 42, color: '#3b82f6' },
  { name: 'Outstanding', value: 58, color: '#f59e0b' },
  { name: 'Overdue', value: 24, color: '#ef4444' },
];

const mockFeeRecords: StudentFeeRecord[] = [
  { id: '1', name: 'Daniel Mensah', studentId: 'STU-1024', avatarBg: '#3b82f6', class: 'JHS 2', totalFees: 'GHS 4,500', amountPaid: 'GHS 4,500', balance: 'GHS 0', status: 'Paid', dueDate: 'Aug 10' },
  { id: '2', name: 'Ama Owusu', studentId: 'STU-1031', avatarBg: '#ec4899', class: 'JHS 2', totalFees: 'GHS 4,500', amountPaid: 'GHS 3,000', balance: 'GHS 1,500', status: 'Partially Paid', dueDate: 'Aug 10' },
  { id: '3', name: 'Kojo Asare', studentId: 'STU-1087', avatarBg: '#f97316', class: 'JHS 3', totalFees: 'GHS 5,000', amountPaid: 'GHS 2,000', balance: 'GHS 3,000', status: 'Overdue', dueDate: 'Aug 05' },
  { id: '4', name: 'Akua Boateng', studentId: 'STU-1102', avatarBg: '#8b5cf6', class: 'JHS 1', totalFees: 'GHS 4,200', amountPaid: 'GHS 0', balance: 'GHS 4,200', status: 'Outstanding', dueDate: 'Aug 15' },
];

const classOutstanding = [
  { className: 'JHS 1', amount: 'GHS 12,400', percentage: '45%' },
  { className: 'JHS 2', amount: 'GHS 18,250', percentage: '65%' },
  { className: 'JHS 3', amount: 'GHS 15,100', percentage: '55%' },
  { className: 'SHS 1', amount: 'GHS 22,000', percentage: '80%' },
  { className: 'SHS 2', amount: 'GHS 14,000', percentage: '50%' },
  { className: 'SHS 3', amount: 'GHS 5,000', percentage: '20%' },
];

export const AccountantFees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class');
  const [selectedStatus, setSelectedStatus] = useState('Status');

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
        
        {/* 4 TOP SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Expected</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 335,250</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>All assigned fees</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Collected</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 248,500</div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: '74%', height: '100%', backgroundColor: '#10b981' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>74%</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Outstanding</span>
              <span style={{ backgroundColor: '#fefce8', color: '#ca8a04', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 86,750</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Remaining balance</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Students W/ Balance</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>124 <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b' }}>Students</span></div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Require payment action</span>
          </div>

        </div>

        {/* TREND & DONUT CHARTS SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>
          
          {/* FEE COLLECTION TREND */}
          <div style={{ ...cardStyle, height: '100%', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Fee Collection Trend</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Compare expected fees with actual collections over the selected period.</span>
              </div>
              <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                Monthly
              </button>
            </div>

            <div style={{ width: '100%', height: '230px', flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }} />
                  <Bar dataKey="expected" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginTop: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} /> Expected Fees</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#0f172a', borderRadius: '2px' }} /> Collected Fees</span>
            </div>
          </div>

          {/* PAYMENT STATUS BREAKDOWN */}
          <div style={{ ...cardStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '380px' }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Payment Status Breakdown</h3>
            </div>

            <div style={{ width: '100%', height: '180px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }} />
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>210</div>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', fontWeight: 'bold', color: '#334155', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} /> Paid (86)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} /> Partial (42)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }} /> Outstanding (58)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} /> Overdue (24)</div>
            </div>
          </div>

        </div>

        {/* OUTSTANDING FEES BY CLASS */}
        <div style={{ ...cardStyle, marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Outstanding Fees by Class</h3>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '20px' }}>See which classes have the highest outstanding balances.</span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {classOutstanding.map((cls) => (
              <div key={cls.className} style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                  <span>{cls.className}</span>
                  <span style={{ color: '#d97706' }}>{cls.amount}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: cls.percentage, height: '100%', backgroundColor: '#f59e0b' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STUDENT FEE RECORDS TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Student Fee Records</h3>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: '240px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'none', outline: 'none', fontSize: '12px', width: '100%', color: '#0f172a' }}
                />
              </div>

              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
              >
                <option>Class</option>
                <option>JHS 1</option>
                <option>JHS 2</option>
                <option>JHS 3</option>
              </select>

              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
              >
                <option>Status</option>
                <option>Paid</option>
                <option>Partially Paid</option>
                <option>Overdue</option>
                <option>Outstanding</option>
              </select>

              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                More Filters
              </button>

              <button style={{ border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}>
                Clear
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px' }}>STUDENT</th>
                  <th style={{ padding: '12px 20px' }}>CLASS</th>
                  <th style={{ padding: '12px 20px' }}>TOTAL FEES</th>
                  <th style={{ padding: '12px 20px' }}>AMOUNT PAID</th>
                  <th style={{ padding: '12px 20px' }}>BALANCE</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px' }}>DUE DATE</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {mockFeeRecords.map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: record.avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                        {record.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{record.name}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{record.studentId}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{record.class}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{record.totalFees}</td>
                    <td style={{ padding: '12px 20px', color: '#166534', fontWeight: 'bold' }}>{record.amountPaid}</td>
                    <td style={{ padding: '12px 20px', color: record.balance === 'GHS 0' ? '#166534' : '#dc2626', fontWeight: 'bold' }}>{record.balance}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ 
                        backgroundColor: record.status === 'Paid' ? '#dcfce7' : record.status === 'Partially Paid' ? '#e0f2fe' : record.status === 'Overdue' ? '#fee2e2' : '#fef3c7', 
                        color: record.status === 'Paid' ? '#166534' : record.status === 'Partially Paid' ? '#0369a1' : record.status === 'Overdue' ? '#991b1b' : '#b45309', 
                        padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' 
                      }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', color: record.status === 'Overdue' ? '#dc2626' : '#64748b', fontWeight: record.status === 'Overdue' ? 'bold' : 'normal' }}>{record.dueDate}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                        <button title="View Details" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button title="Record Payment" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '10px' }}>
            <div>Showing <strong>1-10</strong> of <strong>124</strong> students</div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Previous</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>1</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>2</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>3</button>
              <span>...</span>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>13</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Next</button>
            </div>
          </div>

        </div>

      </div>
    </AccountantLayout>
  );
};