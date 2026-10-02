import React, { useState } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface OutstandingStudentRecord {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  totalFees: string;
  paid: string;
  outstanding: string;
  dueDate: string;
  dueSubText: string;
  status: 'Overdue' | 'Severely Overdue' | 'Due Soon';
}

const agingAnalysisData = [
  { range: 'Not Yet Due', amount: 38000, color: '#0f172a' },
  { range: '1-30 Days', amount: 22000, color: '#cbd5e1' },
  { range: '31-60 Days', amount: 11000, color: '#94a3b8' },
  { range: '61-90 Days', amount: 7000, color: '#cbd5e1' },
  { range: '90+ Days', amount: 9500, color: '#dc2626' },
];

const classLevelBalances = [
  { className: 'JHS 1', amount: 'GHS 12,400', percentage: '45%' },
  { className: 'JHS 2', amount: 'GHS 15,200', percentage: '60%' },
  { className: 'JHS 3', amount: 'GHS 9,800', percentage: '35%' },
  { className: 'SHS 1', amount: 'GHS 22,100', percentage: '85%' },
  { className: 'SHS 2', amount: 'GHS 18,500', percentage: '70%' },
  { className: 'SHS 3', amount: 'GHS 8,750', percentage: '30%' },
];

const mockOutstandingStudents: OutstandingStudentRecord[] = [
  { id: '1', studentName: 'Daniel Mensah', studentId: 'STU-1024', class: 'JHS 2', totalFees: '4,500', paid: '3,000', outstanding: '1,500', dueDate: 'Aug 10', dueSubText: '4 days overdue', status: 'Overdue' },
  { id: '2', studentName: 'Ama Owusu', studentId: 'STU-1031', class: 'JHS 2', totalFees: '4,500', paid: '3,500', outstanding: '1,000', dueDate: 'Aug 10', dueSubText: '4 days overdue', status: 'Overdue' },
  { id: '3', studentName: 'Kojo Asare', studentId: 'STU-1087', class: 'JHS 3', totalFees: '5,000', paid: '2,000', outstanding: '3,000', dueDate: 'Jul 20', dueSubText: '25 days overdue', status: 'Severely Overdue' },
  { id: '4', studentName: 'Akua Boateng', studentId: 'STU-1102', class: 'JHS 1', totalFees: '4,200', paid: '0', outstanding: '4,200', dueDate: 'Aug 20', dueSubText: 'Due in 6 days', status: 'Due Soon' },
];

export const AccountantBalances: React.FC = () => {
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
        
        {/* PAGE HEADER & PRIMARY ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Student Account Balances
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Monitor individual ledger balances, advance credits, and outstanding debts.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Balances
            </button>
            <button style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Send Bulk Reminders
            </button>
          </div>
        </div>

        {/* 4 TOP METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Outstanding</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 86,750</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>124 students</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Overdue Amount</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 31,200</div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>46 students</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Due Soon</span>
              <span style={{ backgroundColor: '#fefce8', color: '#ca8a04', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 18,450</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>32 students</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Long-Term Outstanding</span>
              <span style={{ backgroundColor: '#f8fafc', color: '#475569', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 12,800</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>17 students over 60 days</span>
          </div>

        </div>

        {/* CHARTS SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>
          
          {/* OUTSTANDING BALANCE ANALYSIS (AGING CHART) */}
          <div style={{ ...cardStyle, height: '100%', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Outstanding Balance Analysis</h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </div>

            <div style={{ width: '100%', height: '260px', flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingAnalysisData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {agingAnalysisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BY CLASS LEVEL */}
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>By Class Level</h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-around', flex: 1 }}>
              {classLevelBalances.map((cls) => (
                <div key={cls.className}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
                    <span>{cls.className}</span>
                    <span style={{ color: '#0f172a' }}>{cls.amount}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: cls.percentage, height: '100%', backgroundColor: '#002b49' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* STUDENTS WITH OUTSTANDING BALANCES TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Students With Outstanding Balances</h3>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: '240px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search student name, ID..." 
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
                <option>Overdue</option>
                <option>Severely Overdue</option>
                <option>Due Soon</option>
              </select>

              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                More Filters
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px', width: '40px' }}><input type="checkbox" /></th>
                  <th style={{ padding: '12px 20px' }}>Student</th>
                  <th style={{ padding: '12px 20px' }}>Class</th>
                  <th style={{ padding: '12px 20px' }}>Total Fees</th>
                  <th style={{ padding: '12px 20px' }}>Paid</th>
                  <th style={{ padding: '12px 20px' }}>Outstanding</th>
                  <th style={{ padding: '12px 20px' }}>Due Date</th>
                  <th style={{ padding: '12px 20px' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockOutstandingStudents.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px' }}><input type="checkbox" /></td>
                    <td style={{ padding: '12px 20px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{item.studentName}</strong>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{item.studentId}</span>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{item.class}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.totalFees}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.paid}</td>
                    <td style={{ padding: '12px 20px', fontWeight: '900', color: '#dc2626' }}>{item.outstanding}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ color: '#0f172a', fontWeight: 'bold', display: 'block' }}>{item.dueDate}</span>
                      <span style={{ fontSize: '10px', color: item.status === 'Due Soon' ? '#ca8a04' : '#dc2626', fontWeight: 'bold' }}>{item.dueSubText}</span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ 
                        backgroundColor: item.status === 'Severely Overdue' ? '#fee2e2' : item.status === 'Overdue' ? '#fee2e2' : '#fef3c7', 
                        color: item.status === 'Severely Overdue' ? '#991b1b' : item.status === 'Overdue' ? '#991b1b' : '#b45309', 
                        padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' 
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                        <button title="View Details" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '10px' }}>
            <div>Showing <strong>1 to 4</strong> of <strong>124 entries</strong></div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Prev</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>1</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>2</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>3</button>
              <span>...</span>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Next</button>
            </div>
          </div>

        </div>

      </div>
    </AccountantLayout>
  );
};