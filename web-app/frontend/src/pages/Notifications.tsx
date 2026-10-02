import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'Finance' | 'Academic' | 'Attendance' | 'System' | 'Student' | 'Communication';
  priority: 'Critical' | 'Important' | 'Normal' | 'Info';
  timestamp: string;
  timeGroup: 'TODAY' | 'YESTERDAY';
  source: string;
  actionRequired?: boolean;
  isUnread?: boolean;
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Failed Batch Payment Processing',
    description: 'The automated tuition collection batch for 11th grade encountered an error connecting to the payment gateway. 42 transactions are currently pending retry.',
    category: 'Finance',
    priority: 'Critical',
    timestamp: '12 mins ago',
    timeGroup: 'TODAY',
    source: 'Finance Management Module',
    actionRequired: true,
    isUnread: true,
  },
  {
    id: '2',
    title: 'Unusual Grade Drop Detected',
    description: 'System flagged 15 students in AP Calculus AB (Class ID: MTH-401) with a mid-term grade drop exceeding 15% from historical averages.',
    category: 'Academic',
    priority: 'Important',
    timestamp: '2 hours ago',
    timeGroup: 'TODAY',
    source: 'Academic Analytics',
    actionRequired: false,
    isUnread: true,
  },
  {
    id: '3',
    title: 'Daily Attendance Report Generated',
    description: 'District-wide attendance finalized at 94.2%. 3 schools reported attendance below the 90% threshold.',
    category: 'Attendance',
    priority: 'Normal',
    timestamp: 'Yesterday, 4:15 PM',
    timeGroup: 'YESTERDAY',
    source: 'Attendance Module',
    actionRequired: false,
    isUnread: false,
  },
  {
    id: '4',
    title: 'Scheduled Maintenance Completed',
    description: 'Database optimization and weekly backup routines completed successfully without disruption.',
    category: 'System',
    priority: 'Info',
    timestamp: 'Yesterday, 2:00 AM',
    timeGroup: 'YESTERDAY',
    source: 'Infrastructure Services',
    actionRequired: false,
    isUnread: false,
  },
];

export const Notifications: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'rule' | 'detail' | 'clearAll' | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All Notifications');
  const [selectedIds, setSelectedIds] = useState<string[]>(['1']);

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(mockNotifications.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openDetailModal = (item: NotificationItem) => {
    setSelectedNotification(item);
    setActiveModal('detail');
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Notifications</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Stay informed about important events, exceptions and activities across the school.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => setActiveModal('rule')}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              Notification Rules
            </button>
            <button 
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Notification Settings
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          <div style={cardStyle}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL NOTIFICATIONS</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>128</div>
          </div>

          <div style={cardStyle}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>UNREAD</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1e40af', marginTop: '4px' }}>18</div>
          </div>

          <div style={cardStyle}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>IMPORTANT</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>7</div>
          </div>

          <div style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderBottomLeftRadius: '12px', fontSize: '10px', fontWeight: '800' }}>
              Needs Review
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACTION REQUIRED</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>5</div>
          </div>

        </div>

        {/* MAIN FEED & FILTERS */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
          
          {/* SEARCH & DROPDOWN FILTERS */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search by title, student, class, category..." 
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>

            <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', backgroundColor: '#ffffff' }}>
              <option>Status: All</option>
              <option>Unread Only</option>
              <option>Read</option>
            </select>

            <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', backgroundColor: '#ffffff' }}>
              <option>Priority: All</option>
              <option>Critical</option>
              <option>Important</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" /> Action Required Only
            </label>
          </div>

          {/* CATEGORY TABS */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0 12px', overflowX: 'auto' }}>
            {[
              { name: 'All Notifications', count: 18 },
              { name: 'Academic', count: 4 },
              { name: 'Attendance', count: 6 },
              { name: 'Finance', count: 3 },
              { name: 'Student', count: 2 },
              { name: 'Communication', count: null },
              { name: 'System', count: 3 },
            ].map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab.name ? '2px solid #002b49' : 'none',
                  fontWeight: activeTab === tab.name ? 'bold' : 'normal',
                  fontSize: '12px',
                  color: activeTab === tab.name ? '#002b49' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.name}
                {tab.count !== null && (
                  <span style={{ backgroundColor: activeTab === tab.name ? '#dbeafe' : '#e2e8f0', color: activeTab === tab.name ? '#1e40af' : '#475569', borderRadius: '10px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* BULK ACTION BAR */}
          <div style={{ padding: '10px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={selectedIds.length === mockNotifications.length} onChange={handleSelectAll} />
              <span style={{ color: '#475569', fontWeight: 'bold' }}>{selectedIds.length} item selected</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Mark as read
              </button>
              <button onClick={() => setActiveModal('clearAll')} style={{ border: 'none', background: 'none', color: '#dc2626', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Clear
              </button>
            </div>
          </div>

          {/* NOTIFICATION FEED LIST */}
          <div>
            {/* TODAY SECTION */}
            <div style={{ backgroundColor: '#f8fafc', padding: '8px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '800', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>TODAY</span>
              <span style={{ color: '#1e40af', cursor: 'pointer' }}>Mark all as read</span>
            </div>

            {mockNotifications.filter(n => n.timeGroup === 'TODAY').map(item => (
              <div 
                key={item.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  backgroundColor: item.priority === 'Critical' ? '#fffaf0' : '#ffffff',
                  borderLeft: item.priority === 'Critical' ? '4px solid #dc2626' : item.priority === 'Important' ? '4px solid #1e40af' : 'none'
                }}
              >
                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} style={{ marginTop: '4px' }} />

                <div style={{ flex: 1 }} onClick={() => openDetailModal(item)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    {item.isUnread && <span style={{ width: '6px', height: '6px', backgroundColor: '#1e40af', borderRadius: '50%' }}></span>}
                    
                    <span style={{
                      backgroundColor: item.priority === 'Critical' ? '#fee2e2' : item.priority === 'Important' ? '#fef3c7' : '#e0e7ff',
                      color: item.priority === 'Critical' ? '#991b1b' : item.priority === 'Important' ? '#92400e' : '#3730a3',
                      padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
                    }}>
                      {item.priority === 'Critical' ? '● CRITICAL' : item.priority === 'Important' ? '! IMPORTANT' : item.priority}
                    </span>

                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                      {item.category}
                    </span>

                    <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>{item.timestamp}</span>
                  </div>

                  <h4 style={{ margin: '4px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a', cursor: 'pointer' }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{item.description}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '10px', color: '#64748b' }}>
                    <span style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px' }}>System Detected</span>
                    <span>Source: {item.source}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {item.actionRequired && (
                    <span style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#991b1b', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                      ⚠️ Action Required
                    </span>
                  )}
                  <button onClick={() => openDetailModal(item)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#002b49', color: '#ffffff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Review Results
                  </button>
                </div>
              </div>
            ))}

            {/* YESTERDAY SECTION */}
            <div style={{ backgroundColor: '#f8fafc', padding: '8px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '800', color: '#64748b' }}>
              YESTERDAY
            </div>

            {mockNotifications.filter(n => n.timeGroup === 'YESTERDAY').map(item => (
              <div 
                key={item.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  backgroundColor: '#ffffff'
                }}
              >
                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} style={{ marginTop: '4px' }} />

                <div style={{ flex: 1 }} onClick={() => openDetailModal(item)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                      {item.priority}
                    </span>

                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                      {item.category}
                    </span>

                    <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>{item.timestamp}</span>
                  </div>

                  <h4 style={{ margin: '4px 0', fontSize: '14px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{item.description}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '10px', color: '#64748b' }}>
                    <span style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px' }}>System Detected</span>
                    <span>Source: {item.source}</span>
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* FOOTER PAGINATION */}
          <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
            <span>Showing 1 to 10 of 128 notifications</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', cursor: 'pointer' }}>&lt;</button>
              <button style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', cursor: 'pointer' }}>&gt;</button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: CONFIGURE NOTIFICATION RULE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'rule' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Configure Notification Rule</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Define system intelligence parameters and automated alerts.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Rule Name</label>
                    <input type="text" defaultValue="Attendance Below Threshold" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Monitor Event</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Student Attendance</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Status</label>
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="checkbox" defaultChecked />
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>Active</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>CONDITION LOGIC</div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#002b49', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>IF</span>
                    <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', flex: 1 }}>
                      <option>Attendance Percentage</option>
                    </select>
                    <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                      <option>Less Than</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="number" defaultValue={85} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', textAlign: 'center' }} />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>%</span>
                    </div>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>🗑️</button>
                  </div>

                  <button style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>+ Add 'AND' Condition</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Evaluation Frequency</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Daily</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Repeat Action</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Once per day</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Priority Level</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', color: '#991b1b', fontWeight: 'bold' }}>
                      <option>Important</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>NOTIFICATION CONTENT</div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Alert Title</label>
                    <input type="text" defaultValue="{count} Students Below Attendance Threshold" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Message Body</label>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Variables: &#123;count&#125;, &#123;threshold&#125;, &#123;date&#125;</span>
                    </div>
                    <textarea defaultValue="{count} students currently have an attendance rate below {threshold}%. Immediate review is required." style={{ width: '100%', height: '70px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>💾 Save Configuration</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: NOTIFICATION DETAIL MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'detail' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '640px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Attendance Threshold Alert</h3>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Category: Attendance</span>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Priority: Important</span>
                  <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Status: Unread</span>
                  <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>⚠️ Action Required</span>
                </div>

                <div style={{ borderLeft: '4px solid #dc2626', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '13px', color: '#0f172a', fontWeight: '500', marginBottom: '20px' }}>
                  18 students are currently below the configured attendance threshold of 85%.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>SYSTEM DETECTION LOGIC</div>
                    <code style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '4px', display: 'block', color: '#334155' }}>
                      IF (Student.AttendanceRate &lt; 85%)<br />THEN TriggerAlert
                    </code>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>AFFECTED DATA OVERVIEW</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'center' }}>
                      <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>18</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Students</div>
                      </div>
                      <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>4</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Classes</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase' }}>RECOMMENDED ACTION</div>
                    <div style={{ fontSize: '11px', color: '#1e40af', marginTop: '2px' }}>Review students whose attendance has fallen below the configured threshold to initiate interventions.</div>
                  </div>
                  <button style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', color: '#ffffff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    👁️ Review Attendance
                  </button>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>🕒 Created Aug 17, 2026</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Close</button>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Mark as Read</button>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Take Action</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: CLEAR ALL NOTIFICATIONS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'clearAll' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '480px' }}>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Clear All Notifications</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Clearing notifications removes them from your active view but does not delete underlying records.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '16px 0', fontSize: '11px', textAlign: 'left' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>TOTAL: <strong>128</strong></div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>UNREAD: <strong>18</strong></div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>IMPORTANT: <strong>7</strong></div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>ACTION REQ.: <strong>5</strong></div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#991b1b', textAlign: 'left' }}>
                  ⚠️ <strong>5 notifications still require administrative attention.</strong>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Clear All Anyway</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};