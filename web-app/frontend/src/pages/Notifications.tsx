import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'Finance' | 'Academic' | 'Attendance' | 'System' | 'Student' | 'Communication' | 'General';
  priority: 'Critical' | 'Important' | 'Normal' | 'Info';
  timestamp: string;
  createdAt: string;
  timeGroup: 'TODAY' | 'YESTERDAY' | 'EARLIER';
  source: string;
  actionRequired?: boolean;
  isUnread?: boolean;
}

interface RuleFormState {
  id: string | null;
  name: string;
  monitor_event: string;
  condition_field: string;
  condition_operator: string;
  condition_value: string;
  evaluation_frequency: string;
  repeat_action: string;
  priority: 'Critical' | 'Important' | 'Normal' | 'Info';
  alert_title: string;
  message_body: string;
  is_active: boolean;
}

const emptyRule: RuleFormState = {
  id: null,
  name: '',
  monitor_event: 'Student Attendance',
  condition_field: 'Attendance Percentage',
  condition_operator: 'Less Than',
  condition_value: '85',
  evaluation_frequency: 'Daily',
  repeat_action: 'Once per day',
  priority: 'Important',
  alert_title: '{count} Students Below Attendance Threshold',
  message_body: '{count} students currently have an attendance rate below {threshold}%. Immediate review is required.',
  is_active: true,
};

// ── helpers ──
const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const groupByTime = (iso: string): 'TODAY' | 'YESTERDAY' | 'EARLIER' => {
  const d = new Date(iso);
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayStart = startOfDay(d);
  if (dayStart.getTime() === today.getTime()) return 'TODAY';
  if (dayStart.getTime() === yesterday.getTime()) return 'YESTERDAY';
  return 'EARLIER';
};

export const Notifications: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'rule' | 'detail' | 'clearAll' | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All Notifications');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Data
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [actionOnly, setActionOnly] = useState(false);

  // Rules
  const [ruleForm, setRuleForm] = useState<RuleFormState>(emptyRule);
  const [isSavingRule, setIsSavingRule] = useState(false);

  // ── Fetch notifications for the current user ──
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: NotificationItem[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title || 'Untitled notification',
        description: row.message || '',
        category: (row.category as NotificationItem['category']) || 'General',
        priority: (row.priority as NotificationItem['priority']) || 'Normal',
        timestamp: relativeTime(row.created_at),
        createdAt: row.created_at,
        timeGroup: groupByTime(row.created_at),
        source: row.source || 'System',
        actionRequired: !!row.action_required,
        isUnread: !row.is_read,
      }));

      setNotifications(mapped);
    } catch (err: any) {
      console.error('Failed to load notifications:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived ──
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => n.isUnread).length;
  const importantCount = notifications.filter(n => n.priority === 'Critical' || n.priority === 'Important').length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Notifications': totalCount };
    notifications.forEach(n => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [notifications, totalCount]);

  // Apply search + filters + tab
  const visibleNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeTab !== 'All Notifications' && n.category !== activeTab) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hit =
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.source.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q);
        if (!hit) return false;
      }

      if (statusFilter === 'Unread Only' && !n.isUnread) return false;
      if (statusFilter === 'Read' && n.isUnread) return false;

      if (priorityFilter !== 'All' && n.priority !== priorityFilter) return false;

      if (actionOnly && !n.actionRequired) return false;

      return true;
    });
  }, [notifications, activeTab, searchQuery, statusFilter, priorityFilter, actionOnly]);

  const todays = visibleNotifications.filter(n => n.timeGroup === 'TODAY');
  const yesterdays = visibleNotifications.filter(n => n.timeGroup === 'YESTERDAY');
  const earlier = visibleNotifications.filter(n => n.timeGroup === 'EARLIER');

  // ── Selection ──
  const allVisibleIds = visibleNotifications.map(n => n.id);
  const isAllSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.includes(id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(allVisibleIds);
    else setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // ── Actions ──
  const markSelectedAsRead = async () => {
    const ids = selectedIds.length > 0 ? selectedIds : allVisibleIds;
    if (ids.length === 0) return;
    try {
      setIsBusy(true);
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', ids);
      if (error) throw error;
      setSelectedIds([]);
      await fetchNotifications();
    } catch (err: any) {
      alert('Failed to mark as read: ' + err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const markGroupAsRead = async (group: 'TODAY' | 'YESTERDAY' | 'EARLIER') => {
    const ids = notifications.filter(n => n.timeGroup === group && n.isUnread).map(n => n.id);
    if (ids.length === 0) return;
    try {
      setIsBusy(true);
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', ids);
      if (error) throw error;
      await fetchNotifications();
    } catch (err: any) {
      alert('Failed to mark group as read: ' + err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleClear = async () => {
    // "Clear" = mark all as read (matches modal promise: does not delete records)
    try {
      setIsBusy(true);
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '');
      if (error) throw error;
      setActiveModal(null);
      setSelectedIds([]);
      await fetchNotifications();
    } catch (err: any) {
      alert('Failed to clear: ' + err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const openDetailModal = (item: NotificationItem) => {
    setSelectedNotification(item);
    setActiveModal('detail');
    // Fire-and-forget: mark this one as read
    if (item.isUnread) {
      supabase.from('notifications').update({ is_read: true }).eq('id', item.id).then(() => {
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isUnread: false } : n));
      });
    }
  };

  // ── Rules ──
  const openRulesModal = async () => {
    setActiveModal('rule');
    try {
      const { data, error } = await supabase
        .from('notification_rules')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setRuleForm({
          id: data.id,
          name: data.name || '',
          monitor_event: data.monitor_event || 'Student Attendance',
          condition_field: data.condition_field || 'Attendance Percentage',
          condition_operator: data.condition_operator || 'Less Than',
          condition_value: data.condition_value || '85',
          evaluation_frequency: data.evaluation_frequency || 'Daily',
          repeat_action: data.repeat_action || 'Once per day',
          priority: data.priority || 'Important',
          alert_title: data.alert_title || '',
          message_body: data.message_body || '',
          is_active: data.is_active ?? true,
        });
      } else {
        setRuleForm(emptyRule);
      }
    } catch (err: any) {
      console.error('Failed to load rules:', err.message);
    }
  };

  const handleSaveRule = async () => {
    if (!ruleForm.name.trim()) { alert('Rule name is required.'); return; }
    try {
      setIsSavingRule(true);
      const payload = {
        name: ruleForm.name,
        monitor_event: ruleForm.monitor_event,
        condition_field: ruleForm.condition_field,
        condition_operator: ruleForm.condition_operator,
        condition_value: ruleForm.condition_value,
        evaluation_frequency: ruleForm.evaluation_frequency,
        repeat_action: ruleForm.repeat_action,
        priority: ruleForm.priority,
        alert_title: ruleForm.alert_title,
        message_body: ruleForm.message_body,
        is_active: ruleForm.is_active,
      };

      const { error } = ruleForm.id
        ? await supabase.from('notification_rules').update(payload).eq('id', ruleForm.id)
        : await supabase.from('notification_rules').insert([payload]);

      if (error) throw error;
      setActiveModal(null);
      alert('Rule saved.');
    } catch (err: any) {
      alert('Failed to save rule: ' + err.message);
    } finally {
      setIsSavingRule(false);
    }
  };

  // ── Styles ──
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: '8px',
    border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box',
  };

  const renderItem = (item: NotificationItem, isToday: boolean) => (
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

      <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => openDetailModal(item)}>
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

        <h4 style={{ margin: '4px 0', fontSize: '14px', fontWeight: isToday ? '800' : '700', color: isToday ? '#0f172a' : '#334155' }}>
          {item.title}
        </h4>
        <p style={{ margin: 0, fontSize: '12px', color: isToday ? '#475569' : '#64748b', lineHeight: '1.4' }}>
          {item.description}
        </p>

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
  );

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
              onClick={openRulesModal}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              Notification Rules
            </button>
            <button
              onClick={openRulesModal}
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
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{isLoading ? '…' : totalCount}</div>
          </div>

          <div style={cardStyle}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>UNREAD</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1e40af', marginTop: '4px' }}>{isLoading ? '…' : unreadCount}</div>
          </div>

          <div style={cardStyle}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>IMPORTANT</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>{isLoading ? '…' : importantCount}</div>
          </div>

          <div style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderBottomLeftRadius: '12px', fontSize: '10px', fontWeight: '800' }}>
              Needs Review
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACTION REQUIRED</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{isLoading ? '…' : actionRequiredCount}</div>
          </div>

        </div>

        {/* MAIN FEED & FILTERS */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>

          {/* SEARCH & DROPDOWN FILTERS */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, student, class, category..."
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', backgroundColor: '#ffffff' }}
            >
              <option value="All">Status: All</option>
              <option value="Unread Only">Unread Only</option>
              <option value="Read">Read</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', backgroundColor: '#ffffff' }}
            >
              <option value="All">Priority: All</option>
              <option value="Critical">Critical</option>
              <option value="Important">Important</option>
              <option value="Normal">Normal</option>
              <option value="Info">Info</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={actionOnly} onChange={(e) => setActionOnly(e.target.checked)} /> Action Required Only
            </label>
          </div>

          {/* CATEGORY TABS */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0 12px', overflowX: 'auto' }}>
            {[
              'All Notifications',
              'Academic',
              'Attendance',
              'Finance',
              'Student',
              'Communication',
              'System',
            ].map(tab => {
              const count = categoryCounts[tab] || 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    borderBottom: activeTab === tab ? '2px solid #002b49' : 'none',
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    fontSize: '12px',
                    color: activeTab === tab ? '#002b49' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab}
                  {count > 0 && (
                    <span style={{ backgroundColor: activeTab === tab ? '#dbeafe' : '#e2e8f0', color: activeTab === tab ? '#1e40af' : '#475569', borderRadius: '10px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* BULK ACTION BAR */}
          <div style={{ padding: '10px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
              <span style={{ color: '#475569', fontWeight: 'bold' }}>{selectedIds.length} item{selectedIds.length === 1 ? '' : 's'} selected</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={markSelectedAsRead}
                disabled={isBusy}
                style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: isBusy ? 0.6 : 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {selectedIds.length > 0 ? 'Mark as read' : 'Mark all visible as read'}
              </button>
              <button onClick={() => setActiveModal('clearAll')} style={{ border: 'none', background: 'none', color: '#dc2626', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Clear
              </button>
            </div>
          </div>

          {/* NOTIFICATION FEED LIST */}
          <div>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading notifications…</div>
            ) : visibleNotifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
                N/A (No notifications match your filters)
              </div>
            ) : (
              <>
                {todays.length > 0 && (
                  <>
                    <div style={{ backgroundColor: '#f8fafc', padding: '8px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '800', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>TODAY</span>
                      <span onClick={() => markGroupAsRead('TODAY')} style={{ color: '#1e40af', cursor: 'pointer' }}>Mark all as read</span>
                    </div>
                    {todays.map(item => renderItem(item, true))}
                  </>
                )}

                {yesterdays.length > 0 && (
                  <>
                    <div style={{ backgroundColor: '#f8fafc', padding: '8px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '800', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>YESTERDAY</span>
                      <span onClick={() => markGroupAsRead('YESTERDAY')} style={{ color: '#1e40af', cursor: 'pointer' }}>Mark all as read</span>
                    </div>
                    {yesterdays.map(item => renderItem(item, false))}
                  </>
                )}

                {earlier.length > 0 && (
                  <>
                    <div style={{ backgroundColor: '#f8fafc', padding: '8px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '800', color: '#64748b' }}>
                      EARLIER
                    </div>
                    {earlier.map(item => renderItem(item, false))}
                  </>
                )}
              </>
            )}
          </div>

          {/* FOOTER PAGINATION */}
          <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
            <span>
              Showing {visibleNotifications.length} of {totalCount} notification{totalCount === 1 ? '' : 's'}
            </span>
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
                    <input
                      type="text"
                      value={ruleForm.name}
                      onChange={(e) => setRuleForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Attendance Below Threshold"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Monitor Event</label>
                    <select
                      value={ruleForm.monitor_event}
                      onChange={(e) => setRuleForm(f => ({ ...f, monitor_event: e.target.value }))}
                      style={inputStyle}
                    >
                      <option>Student Attendance</option>
                      <option>Fee Balance</option>
                      <option>Academic Performance</option>
                      <option>Parent Engagement</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Status</label>
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="checkbox" checked={ruleForm.is_active} onChange={(e) => setRuleForm(f => ({ ...f, is_active: e.target.checked }))} />
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>Active</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>CONDITION LOGIC</div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#002b49', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>IF</span>
                    <select
                      value={ruleForm.condition_field}
                      onChange={(e) => setRuleForm(f => ({ ...f, condition_field: e.target.value }))}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', flex: 1 }}
                    >
                      <option>Attendance Percentage</option>
                      <option>Fee Balance Amount</option>
                      <option>Average Score</option>
                    </select>
                    <select
                      value={ruleForm.condition_operator}
                      onChange={(e) => setRuleForm(f => ({ ...f, condition_operator: e.target.value }))}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option>Less Than</option>
                      <option>Greater Than</option>
                      <option>Equal To</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        value={ruleForm.condition_value}
                        onChange={(e) => setRuleForm(f => ({ ...f, condition_value: e.target.value }))}
                        style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>%</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Evaluation Frequency</label>
                    <select
                      value={ruleForm.evaluation_frequency}
                      onChange={(e) => setRuleForm(f => ({ ...f, evaluation_frequency: e.target.value }))}
                      style={inputStyle}
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Real-time</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Repeat Action</label>
                    <select
                      value={ruleForm.repeat_action}
                      onChange={(e) => setRuleForm(f => ({ ...f, repeat_action: e.target.value }))}
                      style={inputStyle}
                    >
                      <option>Once per day</option>
                      <option>Once per week</option>
                      <option>Every occurrence</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Priority Level</label>
                    <select
                      value={ruleForm.priority}
                      onChange={(e) => setRuleForm(f => ({ ...f, priority: e.target.value as RuleFormState['priority'] }))}
                      style={{ ...inputStyle, color: '#991b1b', fontWeight: 'bold' }}
                    >
                      <option value="Important">Important</option>
                      <option value="Critical">Critical</option>
                      <option value="Normal">Normal</option>
                      <option value="Info">Info</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>NOTIFICATION CONTENT</div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Alert Title</label>
                    <input
                      type="text"
                      value={ruleForm.alert_title}
                      onChange={(e) => setRuleForm(f => ({ ...f, alert_title: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Message Body</label>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Variables: {'{count}'}, {'{threshold}'}, {'{date}'}</span>
                    </div>
                    <textarea
                      value={ruleForm.message_body}
                      onChange={(e) => setRuleForm(f => ({ ...f, message_body: e.target.value }))}
                      style={{ ...inputStyle, height: '70px', resize: 'none' }}
                    />
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button
                  onClick={handleSaveRule}
                  disabled={isSavingRule}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', opacity: isSavingRule ? 0.6 : 1 }}
                >
                  {isSavingRule ? 'Saving…' : '💾 Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: NOTIFICATION DETAIL MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'detail' && selectedNotification && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '640px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{selectedNotification.title}</h3>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Category: {selectedNotification.category}</span>
                  <span style={{
                    backgroundColor: selectedNotification.priority === 'Critical' ? '#fee2e2' : selectedNotification.priority === 'Important' ? '#fef3c7' : '#e0e7ff',
                    color: selectedNotification.priority === 'Critical' ? '#991b1b' : selectedNotification.priority === 'Important' ? '#92400e' : '#3730a3',
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                  }}>Priority: {selectedNotification.priority}</span>
                  <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    Status: {selectedNotification.isUnread ? 'Unread' : 'Read'}
                  </span>
                  {selectedNotification.actionRequired && (
                    <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>⚠️ Action Required</span>
                  )}
                </div>

                <div style={{ borderLeft: '4px solid #dc2626', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '13px', color: '#0f172a', fontWeight: '500', marginBottom: '20px' }}>
                  {selectedNotification.description}
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#ffffff', marginBottom: '20px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>SOURCE</div>
                  <div style={{ fontSize: '12px', color: '#0f172a' }}>{selectedNotification.source}</div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>🕒 {new Date(selectedNotification.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Close</button>
                  <button
                    onClick={async () => {
                      await supabase.from('notifications').update({ is_read: true }).eq('id', selectedNotification.id);
                      setNotifications(prev => prev.map(n => n.id === selectedNotification.id ? { ...n, isUnread: false } : n));
                      setActiveModal(null);
                    }}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                  >
                    Mark as Read
                  </button>
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
                  Clearing notifications marks them as read but does not delete underlying records.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '16px 0', fontSize: '11px', textAlign: 'left' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>TOTAL: <strong>{totalCount}</strong></div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>UNREAD: <strong>{unreadCount}</strong></div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>IMPORTANT: <strong>{importantCount}</strong></div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>ACTION REQ.: <strong>{actionRequiredCount}</strong></div>
                </div>

                {actionRequiredCount > 0 && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#991b1b', textAlign: 'left' }}>
                    ⚠️ <strong>{actionRequiredCount} notification{actionRequiredCount === 1 ? '' : 's'} still require administrative attention.</strong>
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button
                  onClick={handleClear}
                  disabled={isBusy}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', opacity: isBusy ? 0.6 : 1 }}
                >
                  {isBusy ? 'Clearing…' : 'Clear All Anyway'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};