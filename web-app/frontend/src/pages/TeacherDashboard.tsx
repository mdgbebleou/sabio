import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherLayout } from '../components/TeacherLayout';
import {
  getDashboardCounts,
  getMyTasks,
  createTask,
  toggleTask,
  deleteTask,
  getTodaySchedule,
  createTimetableEntry,
  deleteTimetableEntry,
  getMyThreads,
  getUpcomingEvents,
  getMyClasses,
  getMyStudents,
  getRecentAnnouncements,
} from '../services/teacherService';
import type {
  TaskRow,
  TimetableEntry,
  MessageThreadRow,
  CalendarEventRow,
  TeacherClass,
  AnnouncementRow,
  DashboardCounts,
} from '../services/teacherService';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatTime = (t: string): string => {
  if (!t) return '';
  const [hStr, mStr] = t.split(':');
  const h = Number(hStr);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr ?? '00'} ${suffix}`;
};

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase() || '?';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [counts, setCounts] = useState<DashboardCounts>({
    classesToday: 0,
    attendancePending: 0,
    pendingResults: 0,
    unreadMessages: 0,
  });
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [schedule, setSchedule] = useState<TimetableEntry[]>([]);
  const [threads, setThreads] = useState<MessageThreadRow[]>([]);
  const [events, setEvents] = useState<CalendarEventRow[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [perf, setPerf] = useState<{ className: string; avg: number | null }[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Timetable modal
  const [isTtModalOpen, setIsTtModalOpen] = useState(false);
  const [ttSubject, setTtSubject] = useState('');
  const [ttClassId, setTtClassId] = useState('');
  const [ttDay, setTtDay] = useState<number>(new Date().getDay());
  const [ttStart, setTtStart] = useState('08:00');
  const [ttEnd, setTtEnd] = useState('08:45');
  const [ttRoom, setTtRoom] = useState('');
  const [savingTt, setSavingTt] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    boxSizing: 'border-box',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, t, s, th, ev, cls, ann] = await Promise.all([
        getDashboardCounts(),
        getMyTasks(),
        getTodaySchedule(),
        getMyThreads(),
        getUpcomingEvents(2),
        getMyClasses(),
        getRecentAnnouncements(3),
      ]);
      setCounts(c);
      setTasks(t);
      setSchedule(s);
      setThreads(th);
      setEvents(ev);
      setClasses(cls);
      setAnnouncements(ann);

      // compute per-class average from students
      const rows: { className: string; avg: number | null }[] = [];
      for (const cl of cls) {
        try {
          const students = await getMyStudents(cl.id);
          const scores = students
            .map((st) => st.averageScore)
            .filter((v): v is number => v != null);
          const avg =
            scores.length > 0
              ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
              : null;
          rows.push({ className: cl.name, avg });
        } catch {
          rows.push({ className: cl.name, avg: null });
        }
      }
      setPerf(rows);
    } catch (err: any) {
      setError(err?.message || 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // ---------- task handlers ----------
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setSavingTask(true);
    try {
      await createTask(newTaskTitle, newTaskDue || null);
      setNewTaskTitle('');
      setNewTaskDue('');
      setIsTaskModalOpen(false);
      setTasks(await getMyTasks());
    } catch (err: any) {
      alert(err?.message || 'Could not create task.');
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggleTask = async (t: TaskRow) => {
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
    try {
      await toggleTask(t.id, !t.done);
    } catch (err: any) {
      setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: t.done } : x)));
      alert(err?.message || 'Could not update task.');
    }
  };

  const handleDeleteTask = async (t: TaskRow) => {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    try {
      await deleteTask(t.id);
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err: any) {
      alert(err?.message || 'Could not delete task.');
    }
  };

  // ---------- timetable handlers ----------
  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttSubject.trim()) {
      alert('Subject is required.');
      return;
    }
    setSavingTt(true);
    try {
      await createTimetableEntry({
        classId: ttClassId || null,
        subject: ttSubject,
        dayOfWeek: ttDay,
        startTime: ttStart,
        endTime: ttEnd,
        room: ttRoom || null,
        academicYear: '2025/2026',
        term: 'Second Term',
      });
      setTtSubject('');
      setTtRoom('');
      setIsTtModalOpen(false);
      const [s, c] = await Promise.all([getTodaySchedule(), getDashboardCounts()]);
      setSchedule(s);
      setCounts(c);
    } catch (err: any) {
      alert(err?.message || 'Could not save timetable entry.');
    } finally {
      setSavingTt(false);
    }
  };

  const handleDeleteTimetable = async (entryId: string) => {
    if (!confirm('Remove this timetable entry?')) return;
    try {
      await deleteTimetableEntry(entryId);
      const [s, c] = await Promise.all([getTodaySchedule(), getDashboardCounts()]);
      setSchedule(s);
      setCounts(c);
    } catch (err: any) {
      alert(err?.message || 'Could not delete entry.');
    }
  };

  const todayDayName = DAY_NAMES[new Date().getDay()];

  return (
    <TeacherLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif", padding: 'clamp(16px, 3vw, 30px)' }}>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        {/* ROW 1: STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CLASSES TODAY</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{loading ? '—' : counts.classesToday}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002b49' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
          </div>

          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ATTENDANCE PENDING</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>{loading ? '—' : counts.attendancePending}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
            </div>
          </div>

          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PENDING RESULTS</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{loading ? '—' : counts.pendingResults}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002b49' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
          </div>

          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UNREAD MESSAGES</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{loading ? '—' : counts.unreadMessages}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002b49', position: 'relative' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {counts.unreadMessages > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: '#dc2626', borderRadius: '50%' }} />
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: ACTION SHORTCUTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <button
            onClick={() => navigate('/teacher/attendance')}
            style={{ backgroundColor: '#1e293b', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
            Take Attendance
          </button>

          <button
            onClick={() => navigate('/teacher/academics')}
            style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Enter Results
          </button>

          <button
            onClick={() => navigate('/teacher/class')}
            style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            My Classes
          </button>

          <button
            onClick={() => navigate('/teacher/messages')}
            style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Messages
          </button>
        </div>

        {/* ROW 3: SCHEDULE & TASKS */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '20px', alignItems: 'stretch' }}>

          {/* LEFT: TIMETABLE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Today's Schedule ({todayDayName})</h3>
                <button
                  onClick={() => setIsTtModalOpen(true)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  + Add Entry
                </button>
              </div>

              {loading && <div style={{ fontSize: '12px', color: '#64748b' }}>Loading…</div>}

              {!loading && schedule.length === 0 && (
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  No classes scheduled today. Click <strong>+ Add Entry</strong> to build your timetable.
                </div>
              )}

              {!loading && schedule.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {schedule.map((s) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f8fafc' }}>
                      <div style={{ minWidth: '90px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{formatTime(s.startTime)}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {s.endTime ? formatTime(s.endTime) : ''}
                        </div>
                      </div>
                      <div style={{ flex: 1, paddingLeft: '16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{s.subject}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {s.className || '—'}{s.room ? ` • ${s.room}` : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTimetable(s.id)}
                        title="Remove"
                        style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', padding: '4px 8px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: TASKS + MESSAGES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* TASKS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Pending Tasks</h3>
                </div>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '16px', fontWeight: '900', cursor: 'pointer', padding: '0 4px' }}
                  title="Add task"
                >
                  +
                </button>
              </div>

              {loading && <div style={{ fontSize: '12px', color: '#64748b' }}>Loading…</div>}

              {!loading && tasks.length === 0 && (
                <div style={{ fontSize: '12px', color: '#64748b' }}>No tasks yet. Click <strong>+</strong> to add one.</div>
              )}

              {!loading && tasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                  {tasks.map((t) => (
                    <div key={t.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => handleToggleTask(t)}
                        style={{ marginTop: '2px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 'bold', color: t.done ? '#94a3b8' : '#0f172a', textDecoration: t.done ? 'line-through' : 'none' }}>
                          {t.title}
                        </div>
                        {t.dueDate && (
                          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                            Due {new Date(`${t.dueDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(t)}
                        title="Delete"
                        style={{ border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '12px', padding: '0 4px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECENT MESSAGES */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recent Messages</h3>
                </div>
                <span
                  onClick={() => navigate('/teacher/messages')}
                  style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}
                >
                  View All
                </span>
              </div>

              {!loading && threads.length === 0 && (
                <div style={{ fontSize: '12px', color: '#64748b' }}>No messages yet.</div>
              )}

              {!loading && threads.slice(0, 2).map((th) => (
                <div
                  key={th.id}
                  onClick={() => navigate('/teacher/messages')}
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', marginBottom: '10px' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                    {initialsOf(th.parentName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>{th.parentName}</span>
                      {th.unreadCount > 0 && (
                        <span style={{ backgroundColor: '#002b49', color: '#fff', padding: '1px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                          {th.unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {th.subject}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ROW 4: ANNOUNCEMENTS | EVENTS | PERFORMANCE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          {/* ANNOUNCEMENTS */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Announcements</h3>
            </div>

            {!loading && announcements.length === 0 && (
              <div style={{ fontSize: '12px', color: '#64748b' }}>No announcements at the moment.</div>
            )}

            {!loading && announcements.map((a) => (
              <div key={a.id} style={{ paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '13px' }}>{a.title}</div>
                <div style={{ color: '#64748b', marginTop: '2px', lineHeight: '1.4', fontSize: '12px' }}>{a.body}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  {new Date(a.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>

          {/* UPCOMING EVENTS */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Upcoming Events</h3>
            </div>

            {!loading && events.length === 0 && (
              <div style={{ fontSize: '12px', color: '#64748b' }}>No upcoming events.</div>
            )}

            {!loading && events.map((ev) => {
              const d = new Date(`${ev.eventDate}T00:00:00`);
              const mon = Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              const day = Number.isNaN(d.getTime()) ? '' : String(d.getDate());
              return (
                <div
                  key={ev.id}
                  onClick={() => navigate('/teacher/calendar')}
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', marginBottom: '14px' }}
                >
                  <div style={{ backgroundColor: '#edf2f7', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', minWidth: '42px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{mon}</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{day}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{ev.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {ev.allDay ? 'All Day' : `${ev.startTime || '—'}${ev.location ? ` • ${ev.location}` : ''}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PERFORMANCE */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Performance</h3>
            </div>

            {!loading && perf.length === 0 && (
              <div style={{ fontSize: '12px', color: '#64748b' }}>No classes assigned.</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px' }}>
              {!loading && perf.map((p, i) => (
                <div key={`${p.className}-${i}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px', color: '#0f172a' }}>
                    <span>{p.className}</span>
                    <span>{p.avg == null ? '—' : `${p.avg}%`}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#edf2f7', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, p.avg ?? 0))}%`, height: '100%', backgroundColor: i % 2 === 0 ? '#002b49' : '#047857' }} />
                  </div>
                </div>
              ))}

              <button
                onClick={() => navigate('/teacher/academics')}
                style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', marginTop: '4px' }}
              >
                View Detailed Analytics
              </button>
            </div>
          </div>

        </div>

        {/* TASK MODAL */}
        {isTaskModalOpen && (
          <div style={overlayStyle} onClick={() => !savingTask && setIsTaskModalOpen(false)}>
            <div style={{ ...cardStyle, width: '100%', maxWidth: '480px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>New Task</h2>
              <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Title *</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Due date</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => !savingTask && setIsTaskModalOpen(false)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTask}
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: savingTask ? 'wait' : 'pointer', opacity: savingTask ? 0.7 : 1 }}
                  >
                    {savingTask ? 'Saving…' : 'Add Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TIMETABLE MODAL */}
        {isTtModalOpen && (
          <div style={overlayStyle} onClick={() => !savingTt && setIsTtModalOpen(false)}>
            <div style={{ ...cardStyle, width: '100%', maxWidth: '520px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>New Timetable Entry</h2>
              <form onSubmit={handleAddTimetable} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Subject *</label>
                  <input
                    type="text"
                    required
                    value={ttSubject}
                    onChange={(e) => setTtSubject(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Class</label>
                    <select
                      value={ttClassId}
                      onChange={(e) => setTtClassId(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    >
                      <option value="">— none —</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Day of week *</label>
                    <select
                      value={ttDay}
                      onChange={(e) => setTtDay(Number(e.target.value))}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    >
                      {DAY_NAMES.map((d, i) => (
                        <option key={i} value={i}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Start *</label>
                    <input
                      type="time"
                      required
                      value={ttStart}
                      onChange={(e) => setTtStart(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>End *</label>
                    <input
                      type="time"
                      required
                      value={ttEnd}
                      onChange={(e) => setTtEnd(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Room</label>
                  <input
                    type="text"
                    value={ttRoom}
                    onChange={(e) => setTtRoom(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => !savingTt && setIsTtModalOpen(false)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTt}
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: savingTt ? 'wait' : 'pointer', opacity: savingTt ? 0.7 : 1 }}
                  >
                    {savingTt ? 'Saving…' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};