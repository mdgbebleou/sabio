import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountantLayout } from '../components/AccountantLayout';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearMyNotifications,
} from '../services/teacherService';
import type { AppNotification } from '../services/teacherService';

const fmtDateTime = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const timeAgo = (iso: string): string => {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const groupOf = (iso: string): 'Today' | 'Yesterday' | 'Earlier' => {
  if (!iso) return 'Earlier';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Earlier';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return 'Earlier';
};

// Map notification type → icon + badge color
const styleForType = (type: string): { iconColor: string; badgeBg: string; badgeColor: string; label: string } => {
  switch (type) {
    case 'payment_received':
      return { iconColor: '#166534', badgeBg: '#dcfce7', badgeColor: '#166534', label: 'PAYMENT' };
    case 'payment_verification':
      return { iconColor: '#dc2626', badgeBg: '#fee2e2', badgeColor: '#991b1b', label: 'ACTION REQUIRED' };
    case 'balance_overdue':
      return { iconColor: '#f59e0b', badgeBg: '#fef3c7', badgeColor: '#b45309', label: 'OUTSTANDING' };
    case 'invoice':
      return { iconColor: '#0369a1', badgeBg: '#e0f2fe', badgeColor: '#0369a1', label: 'INVOICE' };
    case 'fee_structure':
      return { iconColor: '#002b49', badgeBg: '#e2e8f0', badgeColor: '#334155', label: 'FEE STRUCTURE' };
    case 'system':
    default:
      return { iconColor: '#64748b', badgeBg: '#f1f5f9', badgeColor: '#475569', label: 'SYSTEM' };
  }
};

const iconForType = (type: string, color: string): React.ReactNode => {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2 as const };
  switch (type) {
    case 'payment_received':
    case 'payment_verification':
      return <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
    case 'balance_overdue':
      return <svg {...common}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
    case 'invoice':
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'fee_structure':
      return <svg {...common}><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>;
    default:
      return <svg {...common}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
  }
};

const FILTERS = ['All', 'Unread', 'Payments', 'Outstanding Balances', 'Invoices', 'Fee Structures', 'System'] as const;
type Filter = typeof FILTERS[number];

const typeMatchesFilter = (type: string, filter: Filter): boolean => {
  if (filter === 'All') return true;
  if (filter === 'Unread') return true; // handled separately
  if (filter === 'Payments') return type === 'payment_received' || type === 'payment_verification';
  if (filter === 'Outstanding Balances') return type === 'balance_overdue';
  if (filter === 'Invoices') return type === 'invoice';
  if (filter === 'Fee Structures') return type === 'fee_structure';
  if (filter === 'System') return type === 'system';
  return true;
};

export const AccountantNotifications: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMyNotifications();
      setItems(list);
    } catch (err: any) {
      setError(err?.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // counts
  const total = items.length;
  const unread = items.filter((n) => !n.isRead).length;
  const payments = items.filter((n) => n.type === 'payment_received' || n.type === 'payment_verification').length;
  const pending = items.filter((n) => n.type === 'payment_verification' || n.type === 'balance_overdue').length;

  const filtered = useMemo(() => {
    return items
      .filter((n) => typeMatchesFilter(n.type, activeFilter))
      .filter((n) => (activeFilter === 'Unread' ? !n.isRead : true));
  }, [items, activeFilter]);

  // group by Today / Yesterday / Earlier
  const groups = useMemo(() => {
    const g: Record<'Today' | 'Yesterday' | 'Earlier', AppNotification[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    for (const n of filtered) g[groupOf(n.createdAt)].push(n);
    return g;
  }, [filtered]);

  const handleClick = async (n: AppNotification) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      } catch {
        /* ignore */
      }
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    } catch (err: any) {
      alert(err?.message || 'Could not mark all as read.');
    }
  };

  const handleClear = async () => {
    if (!confirm('Delete all notifications for your account? This cannot be undone.')) return;
    try {
      await clearMyNotifications();
      setItems([]);
    } catch (err: any) {
      alert(err?.message || 'Could not clear notifications.');
    }
  };

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Notifications
          </h1>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Stay updated on payments, student balances, and financial activities.</span>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* 4 KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Notifications</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{loading ? '-' : total}</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>All</span>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#1d4ed8', textTransform: 'uppercase' }}>Requires Attention</span>
              <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#1d4ed8', marginTop: '8px' }}>{loading ? '-' : unread}</div>
            <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Unread</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Transactions</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{loading ? '-' : payments}</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Payment</span>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase' }}>Pending Tasks</span>
              <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#dc2626', marginTop: '8px' }}>{loading ? '-' : pending}</div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Action Required</span>
          </div>

        </div>

        {/* FILTER BAR */}
        <div style={{ ...cardStyle, padding: '12px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {FILTERS.map((tab) => (
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
            <span
              onClick={handleMarkAllRead}
              style={{ color: '#0f172a', cursor: 'pointer' }}
            >
              Mark all as read
            </span>
            <span
              onClick={handleClear}
              style={{ color: '#64748b', cursor: 'pointer' }}
            >
              Clear notifications
            </span>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div style={{ ...cardStyle, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            {items.length === 0
              ? 'No notifications yet.'
              : 'No notifications match your filter.'}
          </div>
        ) : (
          <>
            {/* TODAY */}
            {groups.Today.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Today</h2>
                  <span style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                    {groups.Today.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {groups.Today.map((item) => <NotificationCard key={item.id} item={item} onClick={() => void handleClick(item)} />)}
                </div>
              </div>
            )}

            {/* YESTERDAY */}
            {groups.Yesterday.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Yesterday</h2>
                  <span style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                    {groups.Yesterday.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {groups.Yesterday.map((item) => <NotificationCard key={item.id} item={item} onClick={() => void handleClick(item)} />)}
                </div>
              </div>
            )}

            {/* EARLIER */}
            {groups.Earlier.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Earlier</h2>
                  <span style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                    {groups.Earlier.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {groups.Earlier.map((item) => <NotificationCard key={item.id} item={item} onClick={() => void handleClick(item)} />)}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </AccountantLayout>
  );
};

// ---------- notification card ----------

interface CardProps {
  item: AppNotification;
  onClick: () => void;
}

const NotificationCard: React.FC<CardProps> = ({ item, onClick }) => {
  const s = styleForType(item.type);
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    cursor: item.link ? 'pointer' : 'default',
  };

  return (
    <div style={cardStyle} onClick={item.link ? onClick : undefined}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
        {!item.isRead ? (
          <span style={{ width: '8px', height: '8px', backgroundColor: '#0f172a', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }} />
        ) : (
          <span style={{ width: '8px', flexShrink: 0 }} />
        )}

        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
          {iconForType(item.type, s.iconColor)}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.title}</strong>
            <span style={{
              backgroundColor: s.badgeBg,
              color: s.badgeColor,
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '9px',
              fontWeight: 900,
              letterSpacing: '0.5px'
            }}>
              {item.badge || s.label}
            </span>
          </div>

          <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>{item.message}</p>

          {item.link && (
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#002b49',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              View
            </button>
          )}
        </div>
      </div>

      <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }} title={fmtDateTime(item.createdAt)}>
        {timeAgo(item.createdAt)}
      </span>
    </div>
  );
};