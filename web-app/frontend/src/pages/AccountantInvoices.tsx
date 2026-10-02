import React, { useState } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  studentName: string;
  studentId: string;
  className: string;
  feeType: string;
  amount: string;
  dueDate: string;
  status: 'Paid' | 'Sent' | 'Partially Paid' | 'Overdue' | 'Draft';
}

const mockInvoices: InvoiceRecord[] = [
  { id: '1', invoiceNumber: 'INV-2026-001', studentName: 'Daniel Mensah', studentId: 'STU-1024', className: 'JHS 2', feeType: 'Second Term Tuition', amount: 'GHS 4,500', dueDate: 'Aug 10, 2026', status: 'Paid' },
  { id: '2', invoiceNumber: 'INV-2026-002', studentName: 'Ama Owusu', studentId: 'STU-1031', className: 'JHS 2', feeType: 'Second Term Tuition', amount: 'GHS 4,500', dueDate: 'Aug 10, 2026', status: 'Partially Paid' },
  { id: '3', invoiceNumber: 'INV-2026-003', studentName: 'Kojo Asare', studentId: 'STU-1087', className: 'JHS 3', feeType: 'Second Term Tuition & Bus', amount: 'GHS 5,200', dueDate: 'Aug 05, 2026', status: 'Overdue' },
  { id: '4', invoiceNumber: 'INV-2026-004', studentName: 'Akua Boateng', studentId: 'STU-1102', className: 'JHS 1', feeType: 'Second Term Tuition', amount: 'GHS 4,200', dueDate: 'Aug 25, 2026', status: 'Sent' },
  { id: '5', invoiceNumber: 'INV-2026-005', studentName: 'Kwame Asante', studentId: 'STU-1115', className: 'SHS 1', feeType: 'Development Levy & Boarding', amount: 'GHS 6,000', dueDate: 'Sep 01, 2026', status: 'Draft' },
];

export const AccountantInvoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedClass, setSelectedClass] = useState('All Classes');

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
              Invoice Management
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Generate, track, and manage student fee invoices across all terms.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Invoices
            </button>
            <button style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create New Invoice
            </button>
          </div>
        </div>

        {/* 4 SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Invoiced</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 335,250</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>210 total invoices generated</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Paid Invoices</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 248,500</div>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>156 invoices fully settled</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Pending / Sent</span>
              <span style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 56,000</div>
            <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>30 invoices awaiting payment</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Overdue Invoices</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>GHS 30,750</div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>24 invoices past due date</span>
          </div>

        </div>

        {/* INVOICES TABLE SECTION */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>All Invoices</h3>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: '240px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search invoice or student..." 
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
                <option>All Classes</option>
                <option>JHS 1</option>
                <option>JHS 2</option>
                <option>JHS 3</option>
                <option>SHS 1</option>
              </select>

              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
              >
                <option>All Statuses</option>
                <option>Paid</option>
                <option>Sent</option>
                <option>Partially Paid</option>
                <option>Overdue</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px' }}>INVOICE ID</th>
                  <th style={{ padding: '12px 20px' }}>STUDENT</th>
                  <th style={{ padding: '12px 20px' }}>CLASS</th>
                  <th style={{ padding: '12px 20px' }}>FEE TYPE</th>
                  <th style={{ padding: '12px 20px' }}>AMOUNT</th>
                  <th style={{ padding: '12px 20px' }}>DUE DATE</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#002b49' }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{inv.studentName}</strong>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{inv.studentId}</span>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{inv.className}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{inv.feeType}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{inv.amount}</td>
                    <td style={{ padding: '12px 20px', color: inv.status === 'Overdue' ? '#dc2626' : '#64748b', fontWeight: inv.status === 'Overdue' ? 'bold' : 'normal' }}>{inv.dueDate}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ 
                        backgroundColor: inv.status === 'Paid' ? '#dcfce7' : inv.status === 'Partially Paid' ? '#e0f2fe' : inv.status === 'Overdue' ? '#fee2e2' : inv.status === 'Sent' ? '#fef3c7' : '#f1f5f9', 
                        color: inv.status === 'Paid' ? '#166534' : inv.status === 'Partially Paid' ? '#0369a1' : inv.status === 'Overdue' ? '#991b1b' : inv.status === 'Sent' ? '#b45309' : '#475569', 
                        padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' 
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                        <button title="View Invoice" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button title="Download PDF" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                        <button title="Send Reminder" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#002b49', padding: '4px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '10px' }}>
            <div>Showing <strong>1-5</strong> of <strong>210</strong> invoices</div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Previous</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>1</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>2</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>3</button>
              <span>...</span>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>21</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Next</button>
            </div>
          </div>

        </div>

      </div>
    </AccountantLayout>
  );
};