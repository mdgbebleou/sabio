import React, { useState } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';
import { useNavigate } from 'react-router-dom';

type CategoryFilter = 'All' | 'Unread' | 'Academic' | 'Attendance' | 'Messages' | 'Announcements' | 'Calendar' | 'System';

interface NotificationItem {
  id: string;
  category: 'Academic' | 'Attendance' | 'Messages' | 'Announcements' | 'Calendar' | 'System';
  title: string;
  message: string;
  timeAgo: string;
  fullDate: string;
  isUnread: boolean;
  timeGroup: 'Today' | 'Yesterday' | 'Earlier';
  actionLabel?: string;
  actionRoute?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    category: 'Academic',
    title: 'Academic Result Update',
    message: 'Science Quiz 2 results for JHS 2A have been submitted.',
    timeAgo: '10m ago',
    fullDate: 'August 13, 2026 • 10:42 AM',
    isUnread: true,
    timeGroup: 'Today',
    actionLabel: 'View Results',
    actionRoute: '/teacher/assessments'
  },
  {
    id: '2',
    category: 'Messages',
    title: 'New Message',
    message: 'Mrs. Ama Mensah sent you a new message.',
    timeAgo: '25m ago',
    fullDate: 'August 13, 2026 • 10:27 AM',
    isUnread: true,
    timeGroup: 'Today',
    actionLabel: 'Open Inbox',
    actionRoute: '/teacher/messages'
  },
  {
    id: '3',
    category: 'Attendance',
    title: 'Attendance Reminder',
    message: 'Attendance has not yet been recorded for JHS 2B.',
    timeAgo: '1h ago',
    fullDate: 'August 13, 2026 • 09:30 AM',
    isUnread: true,
    timeGroup: 'Today',
    actionLabel: 'Record Attendance',
    actionRoute: '/teacher/attendance'
  },
  {
    id: '4',
    category: 'Calendar',
    title: 'Upcoming Event',
    message: 'Staff meeting starts tomorrow at 2:00 PM.',
    timeAgo: 'Yesterday',
    fullDate: 'August 12, 2026 • 02:00 PM',
    isUnread: false,
    timeGroup: 'Yesterday',
    actionLabel: 'View Event',
    actionRoute: '/teacher/calendar'
  },
  {
    id: '5',
    category: 'System',
    title: 'System Update',
    message: 'Your profile was successfully updated.',
    timeAgo: 'Aug 12, 2026',
    fullDate: 'August 12, 2026 • 08:15 AM',
    isUnread: false,
    timeGroup: 'Earlier'
  }
];

export const TeacherNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const handleToggleUnread = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: !n.isUnread } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return n.isUnread;
    return n.category === activeFilter;
  });

  const getCategoryColor = (category: NotificationItem['category']) => {
    switch (category) {
      case 'Academic': return { bg: '#e0e7ff', text: '#3730a3' };
      case 'Attendance': return { bg: '#fef3c7', text: '#92400e' };
      case 'Messages': return { bg: '#dcfce7', text: '#166534' };
      case 'Announcements': return { bg: '#fee2e2', text: '#991b1b' };
      case 'Calendar': return { bg: '#dbeafe', text: '#1e40af' };
      case 'System': return { bg: '#f1f5f9', text: '#475569' };
    }
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
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* DETAIL VIEW */}
        {selectedNotification ? (
          <div>
            <button 
              onClick={() => setSelectedNotification(null)}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Notifications
            </button>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ 
                  backgroundColor: getCategoryColor(selectedNotification.category).bg, 
                  color: getCategoryColor(selectedNotification.category).text, 
                  padding: '4px 12px', 
                  borderRadius: '12px', 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase' 
                }}>
                  {selectedNotification.category}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{selectedNotification.fullDate}</span>
              </div>

              <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                {selectedNotification.title}
              </h1>

              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                {selectedNotification.message}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedNotification.actionRoute && (
                  <button 
                    onClick={() => navigate(selectedNotification.actionRoute!)}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                  >
                    {selectedNotification.actionLabel || 'View Details'}
                  </button>
                )}
                <button 
                  onClick={() => handleToggleUnread(selectedNotification.id)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                >
                  {selectedNotification.isUnread ? 'Mark as Read' : 'Mark as Unread'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN NOTIFICATIONS LIST VIEW */
          <div>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Notifications</h1>
                  {unreadCount > 0 && (
                    <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Stay updated with important activity and reminders from your school system.
                </p>
              </div>

              <button 
                onClick={handleMarkAllAsRead}
                style={{ border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#002b49', cursor: 'pointer' }}
              >
                ✓ Mark all as read
              </button>
            </div>

            {/* CATEGORY FILTERS */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
              {(['All', 'Unread', 'Academic', 'Attendance', 'Messages', 'Announcements', 'Calendar', 'System'] as CategoryFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderBottom: activeFilter === filter ? '2px solid #002b49' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeFilter === filter ? '#002b49' : '#64748b',
                    fontWeight: activeFilter === filter ? '800' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* TIME-GROUPED LIST */}
            {['Today', 'Yesterday', 'Earlier'].map((group) => {
              const groupItems = filteredNotifications.filter(n => n.timeGroup === group);
              if (groupItems.length === 0) return null;

              return (
                <div key={group} style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>
                    {group}
                  </span>

                  <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                    {groupItems.map((item, index) => {
                      const colors = getCategoryColor(item.category);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.isUnread) handleToggleUnread(item.id);
                            setSelectedNotification(item);
                          }}
                          style={{
                            padding: '16px 20px',
                            borderBottom: index !== groupItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                            backgroundColor: item.isUnread ? '#f8fafc' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'flex-start',
                            gap: '16px',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ backgroundColor: colors.bg, color: colors.text, padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                                {item.category}
                              </span>
                              {item.isUnread && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284c7', display: 'inline-block' }} />
                              )}
                            </div>

                            <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                              {item.title}
                            </strong>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                              {item.message}
                            </p>

                            {item.actionRoute && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(item.actionRoute!);
                                }}
                                style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#002b49', fontSize: '11px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                              >
                                {item.actionLabel || 'Take Action'}
                              </button>
                            )}
                          </div>

                          <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {item.timeAgo}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};