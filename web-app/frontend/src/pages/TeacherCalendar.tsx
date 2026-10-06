import React, { useState, useEffect, useCallback } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';
import {
  getEvents,
  getUpcomingEvents,
  createEvent,
  deleteEvent,
  getWeeklyTimetable,
} from '../services/teacherService';
import type { CalendarEventRow, EventType, NewEvent, TimetableEntry } from '../services/teacherService';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const pad = (n: number) => String(n).padStart(2, '0');

const formatTime = (t: string | null): string => {
  if (!t) return '—';
  const [hStr, mStr] = t.split(':');
  const h = Number(hStr);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr ?? '00'} ${suffix}`;
};

const formatEventTime = (ev: CalendarEventRow): string => {
  if (ev.allDay) return 'All Day';
  if (!ev.startTime) return '—';
  return `${formatTime(ev.startTime)} – ${formatTime(ev.endTime)}`;
};

const formatLongDate = (ymd: string): string => {
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export const TeacherCalendar: React.FC = () => {
  const today = new Date();

  const [activeMainTab, setActiveMainTab] = useState<'calendar' | 'schedule'>('calendar');
  const [activeCalendarView, setActiveCalendarView] = useState<'month' | 'week' | 'agenda'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventRow | null>(null);

  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth() + 1);

  const [events, setEvents] = useState<CalendarEventRow[]>([]);
  const [upcoming, setUpcoming] = useState<CalendarEventRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    eventType: 'Activity' as EventType,
    eventDate: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    allDay: false,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
  });

  // Teaching schedule (from timetable)
  const [scheduleWeek, setScheduleWeek] = useState<TimetableEntry[]>([]);
  const [scheduleMode, setScheduleMode] = useState<'day' | 'week'>('day');
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const getEventBadgeStyle = (type: EventType) => {
    switch (type) {
      case 'Meeting': return { bg: '#dcfce7', color: '#166534' };
      case 'Exam': return { bg: '#fef2f2', color: '#dc2626' };
      case 'Deadline': return { bg: '#fef3c7', color: '#b45309' };
      case 'Activity': return { bg: '#dbeafe', color: '#1e40af' };
      default: return { bg: '#f1f5f9', color: '#334155' };
    }
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [monthEvents, upNext] = await Promise.all([
        getEvents(viewYear, viewMonth),
        getUpcomingEvents(6),
      ]);
      setEvents(monthEvents);
      setUpcoming(upNext);
    } catch (err: any) {
      setError(err?.message || 'Could not load events.');
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => {
    if (activeMainTab === 'calendar') void refresh();
  }, [activeMainTab, refresh]);

  useEffect(() => {
    if (activeMainTab !== 'schedule') return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const entries = await getWeeklyTimetable();
        setScheduleWeek(entries);
      } catch (err: any) {
        setError(err?.message || 'Could not load timetable.');
      } finally {
        setLoading(false);
      }
    })();
  }, [activeMainTab]);

  const goPrevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.eventDate) {
      alert('Title and date are required.');
      return;
    }
    setCreating(true);
    try {
      const payload: NewEvent = {
        title: form.title,
        eventType: form.eventType,
        eventDate: form.eventDate,
        allDay: form.allDay,
        startTime: form.allDay ? null : form.startTime,
        endTime: form.allDay ? null : form.endTime,
        location: form.location,
        description: form.description,
      };
      await createEvent(payload);
      setIsCreateOpen(false);
      setForm((f) => ({ ...f, title: '', description: '', location: '' }));
      await refresh();
    } catch (err: any) {
      alert(err?.message || 'Could not create event.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(selectedEvent.id);
      setSelectedEvent(null);
      await refresh();
    } catch (err: any) {
      alert(err?.message || 'Could not delete event.');
    }
  };

  const firstDay = new Date(viewYear, viewMonth - 1, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const isSameDay = (ymd: string, day: number) => {
    const parts = ymd.split('-');
    if (parts.length !== 3) return false;
    return Number(parts[0]) === viewYear && Number(parts[1]) === viewMonth && Number(parts[2]) === day;
  };
  const todayYmd = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const todayDow = today.getDay();
  const todayEntries = scheduleWeek.filter((e) => e.dayOfWeek === todayDow);
  const entriesForDay = (dow: number) => scheduleWeek.filter((e) => e.dayOfWeek === dow);

  return (
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* PAGE HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              {activeMainTab === 'calendar' ? 'School Calendar' : 'My Schedule'}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {activeMainTab === 'calendar'
                ? 'View upcoming school events, examinations, meetings, and teacher activities.'
                : 'Your weekly teaching timetable. Add or remove entries from the Dashboard.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 14px', fontSize: '11px', textAlign: 'right' }}>
              <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>ACADEMIC YEAR: 2025/2026</span>
              <strong style={{ color: '#002b49', fontSize: '12px' }}>Term: Second Term</strong>
            </div>

            {activeMainTab === 'calendar' && (
              <button
                onClick={() => setIsCreateOpen(true)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
              >
                + Add Activity
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <button
            onClick={() => { setActiveMainTab('calendar'); setSelectedEvent(null); setSelectedEntry(null); }}
            style={{ padding: '10px 20px', border: 'none', borderBottom: activeMainTab === 'calendar' ? '2px solid #002b49' : '2px solid transparent', backgroundColor: 'transparent', color: activeMainTab === 'calendar' ? '#002b49' : '#64748b', fontWeight: activeMainTab === 'calendar' ? '800' : '500', fontSize: '13px', cursor: 'pointer' }}
          >
            School Calendar
          </button>
          <button
            onClick={() => { setActiveMainTab('schedule'); setSelectedEvent(null); setSelectedEntry(null); }}
            style={{ padding: '10px 20px', border: 'none', borderBottom: activeMainTab === 'schedule' ? '2px solid #002b49' : '2px solid transparent', backgroundColor: 'transparent', color: activeMainTab === 'schedule' ? '#002b49' : '#64748b', fontWeight: activeMainTab === 'schedule' ? '800' : '500', fontSize: '13px', cursor: 'pointer' }}
          >
            Teaching Schedule
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* ================= MODE 1: SCHOOL CALENDAR ================= */}
        {activeMainTab === 'calendar' && !selectedEvent && (
          <div>
            <div style={{ ...cardStyle, padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                {(['month', 'week', 'agenda'] as const).map((v) => (
                  <button key={v} onClick={() => setActiveCalendarView(v)} style={{ border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer', backgroundColor: activeCalendarView === v ? '#ffffff' : 'transparent', color: activeCalendarView === v ? '#0f172a' : '#64748b', boxShadow: activeCalendarView === v ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
                    {v}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={goPrevMonth} style={{ border: 'none', background: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', color: '#64748b' }}>&lt;</button>
                <strong style={{ fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
                  {new Date(viewYear, viewMonth - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </strong>
                <button onClick={goNextMonth} style={{ border: 'none', background: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', color: '#64748b' }}>&gt;</button>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>All Events</span>
                <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Examinations</span>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Meetings</span>
              </div>
            </div>

            {loading && <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', fontWeight: 'bold' }}>Loading…</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px', alignItems: 'start' }}>
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'center', padding: '10px 0', fontSize: '11px', fontWeight: '800', color: '#64748b' }}>
                  <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(90px, auto)' }}>
                  {Array.from({ length: startWeekday }).map((_, i) => (
                    <div key={`lead-${i}`} style={{ borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '8px', backgroundColor: '#fafafa' }} />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayEvents = events.filter((e) => isSameDay(e.eventDate, day));
                    const cellYmd = `${viewYear}-${pad(viewMonth)}-${pad(day)}`;
                    const isToday = cellYmd === todayYmd;
                    return (
                      <div key={day} style={{ borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '8px', backgroundColor: isToday ? '#f0f9ff' : '#ffffff', minHeight: '85px' }}>
                        <div style={{ fontSize: '12px', fontWeight: isToday ? '900' : '600', color: isToday ? '#002b49' : '#334155', marginBottom: '4px' }}>
                          {day}{' '}
                          {isToday && <span style={{ fontSize: '9px', backgroundColor: '#002b49', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>TODAY</span>}
                        </div>
                        {dayEvents.map((ev) => {
                          const badge = getEventBadgeStyle(ev.eventType);
                          return (
                            <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ backgroundColor: badge.bg, color: badge.color, padding: '3px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Upcoming Events</h3>
                {upcoming.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#64748b' }}>No upcoming events.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {upcoming.map((ev) => {
                      const badge = getEventBadgeStyle(ev.eventType);
                      const d = new Date(`${ev.eventDate}T00:00:00`);
                      const mon = Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                      const day = Number.isNaN(d.getTime()) ? '' : String(d.getDate());
                      return (
                        <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                          <div style={{ backgroundColor: badge.bg, color: badge.color, padding: '8px', borderRadius: '8px', textAlign: 'center', minWidth: '45px' }}>
                            <span style={{ fontSize: '9px', fontWeight: '900', display: 'block' }}>{mon}</span>
                            <strong style={{ fontSize: '16px', fontWeight: '900' }}>{day}</strong>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</strong>
                            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>{formatEventTime(ev)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EVENT DETAIL */}
        {activeMainTab === 'calendar' && selectedEvent && (
          <div>
            <button onClick={() => setSelectedEvent(null)} style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
              ← Back to Calendar
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ backgroundColor: getEventBadgeStyle(selectedEvent.eventType).bg, color: getEventBadgeStyle(selectedEvent.eventType).color, padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                    {selectedEvent.eventType}
                  </span>
                </div>
                <h1 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{selectedEvent.title}</h1>
                {selectedEvent.description && (
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: '0 0 20px 0' }}>{selectedEvent.description}</p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>DATE</span>
                    <strong style={{ color: '#0f172a' }}>{formatLongDate(selectedEvent.eventDate)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>TIME</span>
                    <strong style={{ color: '#0f172a' }}>{formatEventTime(selectedEvent)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>LOCATION</span>
                    <strong style={{ color: '#0f172a' }}>{selectedEvent.location || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>AUDIENCE</span>
                    <strong style={{ color: '#0f172a' }}>{selectedEvent.isSchoolWide ? 'School-wide' : 'Teaching Staff'}</strong>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={handleDelete} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', fontSize: '12px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer' }}>
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODE 2: TEACHING SCHEDULE ================= */}
        {activeMainTab === 'schedule' && !selectedEntry && (
          <div>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TODAY'S CLASSES</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{todayEntries.length}</div>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>WEEKLY CLASSES</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>{scheduleWeek.length}</div>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SUBJECTS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {new Set(scheduleWeek.map((e) => e.subject)).size}
                </div>
              </div>
              <div style={{ ...cardStyle, backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>NEXT CLASS</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#002b49', marginTop: '4px' }}>
                  {todayEntries.length > 0 ? formatTime(todayEntries[0].startTime) : '—'}
                </div>
                <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: 'bold' }}>
                  {todayEntries.length > 0 ? todayEntries[0].subject : 'No classes today'}
                </span>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                  {scheduleMode === 'day'
                    ? `${DAY_NAMES[todayDow]}, ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : 'Week overview'}
                </h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setScheduleMode('day')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: scheduleMode === 'day' ? '#002b49' : '#fff', color: scheduleMode === 'day' ? '#fff' : '#0f172a', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Day
                  </button>
                  <button onClick={() => setScheduleMode('week')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: scheduleMode === 'week' ? '#002b49' : '#fff', color: scheduleMode === 'week' ? '#fff' : '#0f172a', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Week
                  </button>
                </div>
              </div>

              {loading && <div style={{ fontSize: '12px', color: '#64748b' }}>Loading…</div>}

              {!loading && scheduleMode === 'day' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {todayEntries.length === 0 && (
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      No classes scheduled for {DAY_NAMES[todayDow]}. Add entries from the Dashboard.
                    </div>
                  )}
                  {todayEntries.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedEntry(item)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ minWidth: '130px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                          {formatTime(item.startTime)} – {formatTime(item.endTime)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{item.subject}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {item.className || '—'}{item.room ? ` • ${item.room}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && scheduleMode === 'week' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {DAY_SHORT.map((label, dow) => (
                    <div key={dow} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', backgroundColor: dow === todayDow ? '#f0f9ff' : '#ffffff', minHeight: '160px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: dow === todayDow ? '#002b49' : '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                        {label}
                      </div>
                      {entriesForDay(dow).length === 0 && (
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>—</div>
                      )}
                      {entriesForDay(dow).map((e) => (
                        <div key={e.id} onClick={() => setSelectedEntry(e)} style={{ backgroundColor: '#edf2f7', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', fontSize: '10px', marginBottom: '6px', cursor: 'pointer' }}>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{e.subject}</div>
                          <div style={{ color: '#64748b', marginTop: '2px' }}>{formatTime(e.startTime)}</div>
                          {e.className && <div style={{ color: '#64748b' }}>{e.className}</div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CLASS SCHEDULE DETAIL */}
        {activeMainTab === 'schedule' && selectedEntry && (
          <div>
            <button onClick={() => setSelectedEntry(null)} style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
              ← Back to Schedule
            </button>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{selectedEntry.subject}</h1>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{DAY_NAMES[selectedEntry.dayOfWeek]} • {selectedEntry.className || '—'}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>TIME</span>
                  <strong style={{ color: '#0f172a' }}>{formatTime(selectedEntry.startTime)} – {formatTime(selectedEntry.endTime)}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>LOCATION</span>
                  <strong style={{ color: '#0f172a' }}>{selectedEntry.room || '—'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>TERM</span>
                  <strong style={{ color: '#0f172a' }}>{selectedEntry.academicYear} • {selectedEntry.term}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CREATE EVENT MODAL */}
        {isCreateOpen && (
          <div style={overlayStyle} onClick={() => !creating && setIsCreateOpen(false)}>
            <div style={{ ...cardStyle, width: '100%', maxWidth: '560px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add Activity</h2>
                <button onClick={() => !creating && setIsCreateOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Title *</label>
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Event Type</label>
                    <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}>
                      <option value="Meeting">Meeting</option>
                      <option value="Exam">Exam</option>
                      <option value="Activity">Activity</option>
                      <option value="Deadline">Deadline</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Date *</label>
                    <input type="date" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
                  <input type="checkbox" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} />
                  All day
                </label>

                {!form.allDay && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Start Time</label>
                      <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>End Time</label>
                      <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => !creating && setIsCreateOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={creating} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: creating ? 'wait' : 'pointer', opacity: creating ? 0.7 : 1 }}>
                    {creating ? 'Saving…' : 'Save Event'}
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