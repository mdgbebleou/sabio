import React, { useState, useEffect, useMemo } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';
import { useNavigate } from 'react-router-dom';
import {
  getMyThreads,
  getRecentAnnouncements,
  getUpcomingEvents,
  getTodaySchedule,
  getMyAssessments,

} from '../services/teacherService';
import type {
  MessageThreadRow,
  AnnouncementRow,
  CalendarEventRow,
  TimetableEntry,
  AssessmentRow,
} from '../services/teacherService';

type CategoryFilter =
  | 'All'
  | 'Unread'
  | 'Academic'
  | 'Attendance'
  | 'Messages'
  | 'Announcements'
  | 'Calendar';

type Category = Exclude<CategoryFilter, 'All' | 'Unread'>;

interface NotificationItem {
  id: string;
  category: Category;
  title: string;
  message: string;
  fullDate: string;
  timeGroup: 'Today' | 'Yesterday' | 'Earlier';
  timeAgo: string;
  isUnread: boolean;
  actionLabel?: string;
  actionRoute?: string;
  timestamp: number;
}

const toTimestamp = (iso: string | null): number => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const timeGroupOf = (ts: number): 'Today' | 'Yesterday' | 'Earlier' => {
  const now = new Date();
  const d = new Date(ts);
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return 'Earlier';
};

const timeAgoOf = (ts: number): string => {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fullDateOf = (ts: number): string => {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const TeacherNotifications: React.FC = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<CategoryFilter>('All');
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('teacher_read_notifications');
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as string[];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const persistRead = (next: Set<string>) => {
    setReadIds(next);
    try {
      localStorage.setItem('teacher_read_notifications', JSON.stringify(Array.from(next)));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = () => {
    const next = new Set(readIds);
    for (const it of items) next.add(it.id);
    persistRead(next);
  };

  const markOneRead = (id: string) => {
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    persistRead(next);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [threads, anns, events, today, assessments] = await Promise.all([
          getMyThreads().catch(() => [] as MessageThreadRow[]),
          getRecentAnnouncements(10).catch(() => [] as AnnouncementRow[]),
          getUpcomingEvents(5).catch(() => [] as CalendarEventRow[]),
          getTodaySchedule().catch(() => [] as TimetableEntry[]),
          getMyAssessments().catch(() => [] as AssessmentRow[]),
        ]);
        if (cancelled) return;

        const collected: NotificationItem[] = [];

        // Messages — one item per thread with unread
        for (const t of threads) {
          const ts = toTimestamp(t.lastMessageAt);
          if (t.unreadCount > 0) {
            collected.push({
              id: `msg-${t.id}`,
              category: 'Messages',
              title: 'New Message',
              message: `${t.parentName}: ${t.subject}`,
              fullDate: fullDateOf(ts),
              timeGroup: timeGroupOf(ts),
              timeAgo: timeAgoOf(ts),
              isUnread: true,
              actionLabel: 'View Messages',
              actionRoute: '/teacher/messages',
              timestamp: ts,
            });
          }
        }

        // Announcements
        for (const a of anns) {
          const ts = toTimestamp(a.postedAt);
          collected.push({
            id: `ann-${a.id}`,
            category: 'Announcements',
            title: a.title,
            message: a.body.length > 140 ? `${a.body.slice(0, 140)}…` : a.body,
            fullDate: fullDateOf(ts),
            timeGroup: timeGroupOf(ts),
            timeAgo: timeAgoOf(ts),
            isUnread: false,
            timestamp: ts,
          });
        }

        // Calendar — upcoming events
        for (const ev of events) {
          const ts = toTimestamp(`${ev.eventDate}T08:00:00`);
          collected.push({
            id: `evt-${ev.id}`,
            category: 'Calendar',
            title: ev.title,
            message: `${ev.eventType}${ev.location ? ` • ${ev.location}` : ''}`,
            fullDate: fullDateOf(ts),
            timeGroup: timeGroupOf(ts),
            timeAgo: timeAgoOf(ts),
            isUnread: false,
            actionLabel: 'View Calendar',
            actionRoute: '/teacher/calendar',
            timestamp: ts,
          });
        }

        // Attendance — today's scheduled classes with no attendance recorded for today
        if (today.length > 0) {
          const todayYmd = new Date().toISOString().slice(0, 10);
          const classIds = Array.from(
            new Set(today.map((e) => e.classId).filter((x): x is string => !!x))
          );
          if (classIds.length > 0) {
            // one notification per class today that isn't confirmed - we don't
            // distinguish here; the attendance page shows which are recorded.
            collected.push({
              id: `att-${todayYmd}`,
              category: 'Attendance',
              title: 'Attendance Check',
              message: `You have ${today.length} class${today.length === 1 ? '' : 'es'} scheduled today. Mark attendance in the Attendance page.`,
              fullDate: fullDateOf(Date.now()),
              timeGroup: 'Today',
              timeAgo: 'today',
              isUnread: false,
              actionLabel: 'Open Attendance',
              actionRoute: '/teacher/attendance',
              timestamp: Date.now(),
            });
          }
        }

        // Academic — draft assessments (pending submission)
        const drafts = assessments.filter((a) => a.status === 'Draft');
        for (const a of drafts) {
          collected.push({
            id: `asmt-${a.id}`,
            category: 'Academic',
            title: 'Assessment Pending Submission',
            message: `${a.title} (${a.subject} • ${a.className}) has ${a.scoredCount}/${a.studentCount} scores entered.`,
            fullDate: fullDateOf(Date.now()),
            timeGroup: 'Today',
            timeAgo: 'today',
            isUnread: false,
            actionLabel: 'Open Assessments',
            actionRoute: '/teacher/assessments',
            timestamp: Date.now(),
          });
        }

        // sort newest first
        collected.sort((a, b) => b.timestamp - a.timestamp);
        // apply read state
        for (const it of collected) {
          if (readIds.has(it.id)) it.isUnread = false;
        }
        setItems(collected);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not load notifications.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = useMemo(() => {
    if (filter === 'All') return items;
    if (filter === 'Unread') return items.filter((i) => i.isUnread);
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const grouped = useMemo(() => {
    const groups: Record<'Today' | 'Yesterday' | 'Earlier', NotificationItem[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    for (const it of visible) groups[it.timeGroup].push(it);
    return groups;
  }, [visible]);

  const unreadCount = items.filter((i) => i.isUnread).length;

  const filterTabs: CategoryFilter[] = [
    'All',
    'Unread',
    'Academic',
    'Attendance',
    'Messages',
    'Announcements',
    'Calendar',
  ];

  const categoryIcon = (c: Category) => {
    switch (c) {
      case 'Academic':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        );
      case 'Attendance':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>
        );
      case 'Messages':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        );
      case 'Announcements':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        );
      case 'Calendar':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        );
      default:
        return null;
    }
  };

  const categoryColor = (c: Category) => {
    switch (c) {
      case 'Academic': return { bg: '#dbeafe', color: '#1e40af' };
      case 'Attendance': return { bg: '#dcfce7', color: '#166534' };
      case 'Messages': return { bg: '#ede9fe', color: '#5b21b6' };
      case 'Announcements': return { bg: '#fef3c7', color: '#b45309' };
      case 'Calendar': return { bg: '#e0f2fe', color: '#0369a1' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Notifications</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#002b49', cursor: 'pointer' }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* FILTER TABS */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {filterTabs.map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #002b49' : '1px solid #cbd5e1',
                  backgroundColor: isActive ? '#002b49' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {loading && <div style={{ fontSize: '13px', color: '#64748b' }}>Loading…</div>}

        {!loading && visible.length === 0 && (
          <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            Nothing to show in <strong>{filter}</strong>.
          </div>
        )}

        {!loading && visible.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(['Today', 'Yesterday', 'Earlier'] as const).map((group) => {
              const list = grouped[group];
              if (list.length === 0) return null;
              return (
                <div key={group}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {group}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {list.map((it) => {
                      const col = categoryColor(it.category);
                      return (
                        <div
                          key={it.id}
                          onClick={() => {
                            markOneRead(it.id);
                            if (it.actionRoute) navigate(it.actionRoute);
                          }}
                          style={{
                            ...cardStyle,
                            padding: '16px 18px',
                            display: 'flex',
                            gap: '14px',
                            alignItems: 'flex-start',
                            cursor: it.actionRoute ? 'pointer' : 'default',
                            borderLeft: it.isUnread ? '4px solid #002b49' : '1px solid #e2e8f0',
                          }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: col.bg, color: col.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {categoryIcon(it.category)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: col.color, backgroundColor: col.bg, padding: '2px 8px', borderRadius: '8px' }}>
                                  {it.category}
                                </span>
                                <strong style={{ fontSize: '13px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {it.title}
                                </strong>
                                {it.isUnread && (
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', flexShrink: 0 }} />
                                )}
                              </div>
                              <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>{it.timeAgo}</span>
                            </div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                              {it.message}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{it.fullDate}</span>
                              {it.actionLabel && (
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#002b49' }}>
                                  {it.actionLabel} →
                                </span>
                              )}
                            </div>
                          </div>
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