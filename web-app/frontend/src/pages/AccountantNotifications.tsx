import React, { useState } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';

interface NotificationItem {
  id: string;
  title: string;
  badgeText?: string;
  badgeType?: 'danger' | 'warning' | 'info' | 'primary';
  message: string;
  timestamp: string;
  isUnread: boolean;
  group: 'Today' | 'Yesterday';
  actions: { label: string; primary?: boolean }[];
  iconSvg: React.ReactNode;
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Payment verification required',
    badgeText: 'ACTION REQUIRED',
    badgeType: 'danger',
    message: 'A GHS 1,800 bank transfer from Kojo Asare requires verification.',
    timestamp: '9:18 AM',
    isUnread: true,
    group: 'Today',
    actions: [{ label: 'Review Payment', primary: true }],
    iconSvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  },
  {
    id: '2',
    title: 'Student balance overdue',
    badgeText: 'OUTSTANDING BALANCE',
    badgeType: 'warning',
    message: 'Ama Owusu has an outstanding balance of GHS 1,500 that is 4 days overdue.',
    timestamp: '8:35 AM',
    isUnread: true,
    group: 'Today',
    actions: [{ label: 'View Balance', primary: true }, { label: 'Send Reminder' }],
    iconSvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
  },
  {
    id: '3',
    title: 'Payment received',
    badgeText: 'PAYMENT',
    badgeType: 'info',
    message: 'GHS 2,500 payment received from Daniel Mensah for School Fees.',
    timestamp: '10:42 AM',
    isUnread: false,
    group: 'Today',
    actions: [{ label: 'View Payment', primary: false }],
    iconSvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
  },
  {
    id: '4',
    title: 'Refund requested',
    badgeText: 'ACTION REQUIRED',
    badgeType: 'danger',
    message: 'A refund request of GHS 500 has been submitted for Daniel Mensah.',
    timestamp: '3:25 PM',
    isUnread: false,
    group: 'Yesterday',
    actions: [{ label: 'Review Request', primary: true }],
    iconSvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
  },
  {
    id: '5',
    title: 'Fee structure updated',
    badgeText: 'FEE STRUCTURE',
    badgeType: 'primary',
    message: 'The JHS 2 Second Term fee structure was updated.',
    timestamp: '1:10 PM',
    isUnread: false,
    group: 'Yesterday',
    actions: [{ label: 'View Fee Structure', primary: false }],
    iconSvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
  },
];

export const AccountantNotifications: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

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
        
        {/* PAGE HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Notifications
          </h1>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Stay updated on payments, student balances, and financial activities.</span>
        </div>

        {/* 4 SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Notifications</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>124</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>All</span>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#1d4ed8', textTransform: 'uppercase' }}>Requires Attention</span>
              <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#1d4ed8', marginTop: '8px' }}>8</div>
            <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Unread</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Transactions</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>42</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Payment</span>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase' }}>Pending Tasks</span>
              <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#dc2626', marginTop: '8px' }}>6</div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Action Required</span>
          </div>

        </div>

        {/* FILTER & ACTIONS BAR */}
        <div style={{ ...cardStyle, padding: '12px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Unread', 'Payments', 'Outstanding Balances', 'Invoices', 'Fee Structures', 'System'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: activeFilter === tab ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  backgroundColor: activeFilter === tab ? '#0f172a' : '#ffffff',
                  color: activeFilter === tab ? '#ffffff' : '#334155',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 'bold' }}>
            <span style={{ color: '#0f172a', cursor: 'pointer' }}>Mark all as read</span>
            <span style={{ color: '#64748b', cursor: 'pointer' }}>Clear notifications</span>
          </div>
        </div>

        {/* TODAY GROUP */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Today</h2>
            <span style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>3</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockNotifications.filter(n => n.group === 'Today').map((item) => (
              <div key={item.id} style={{ ...cardStyle, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                  {item.isUnread && <span style={{ width: '8px', height: '8px', backgroundColor: '#0f172a', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }} />}
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                    {item.iconSvg}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.title}</strong>
                      {item.badgeText && (
                        <span style={{ 
                          backgroundColor: item.badgeType === 'danger' ? '#fee2e2' : item.badgeType === 'warning' ? '#fef3c7' : '#e0f2fe', 
                          color: item.badgeType === 'danger' ? '#991b1b' : item.badgeType === 'warning' ? '#b45309' : '#0369a1', 
                          padding: '2px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '900', letterSpacing: '0.5px' 
                        }}>
                          {item.badgeText}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>{item.message}</p>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {item.actions.map((action, idx) => (
                        <button 
                          key={idx}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: action.primary ? 'none' : '1px solid #cbd5e1',
                            backgroundColor: action.primary ? '#002b49' : '#ffffff',
                            color: action.primary ? '#ffffff' : '#334155',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* YESTERDAY GROUP */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Yesterday</h2>
            <span style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>2</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockNotifications.filter(n => n.group === 'Yesterday').map((item) => (
              <div key={item.id} style={{ ...cardStyle, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ width: '8px', flexShrink: 0 }} />
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                    {item.iconSvg}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.title}</strong>
                      {item.badgeText && (
                        <span style={{ 
                          backgroundColor: item.badgeType === 'danger' ? '#fee2e2' : '#f1f5f9', 
                          color: item.badgeType === 'danger' ? '#991b1b' : '#334155', 
                          padding: '2px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '900', letterSpacing: '0.5px' 
                        }}>
                          {item.badgeText}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>{item.message}</p>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {item.actions.map((action, idx) => (
                        <button 
                          key={idx}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: action.primary ? 'none' : '1px solid #cbd5e1',
                            backgroundColor: action.primary ? '#002b49' : '#ffffff',
                            color: action.primary ? '#ffffff' : '#334155',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AccountantLayout>
  );
};