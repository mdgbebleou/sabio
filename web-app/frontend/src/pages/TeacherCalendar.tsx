import React, { useState } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  day: number;
  time: string;
  type: 'Meeting' | 'Exam' | 'Activity' | 'Deadline';
  location: string;
  description: string;
}

interface SchedulePeriod {
  id: string;
  subject: string;
  className: string;
  time: string;
  room: string;
  status: 'Completed' | 'Upcoming' | 'Free';
  duration: string;
}

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Staff Meeting', date: 'AUG 15', day: 15, time: '2:00 PM - 4:00 PM', type: 'Meeting', location: 'Main Conference Room', description: 'Monthly staff meeting to review academic progress, upcoming examinations, student attendance, and parent engagement activities.' },
  { id: '2', title: 'CA Score Submission Deadline', date: 'AUG 18', day: 18, time: 'All Day', type: 'Deadline', location: 'Teacher Portal', description: 'Final deadline for submitting Continuous Assessment scores for Term 2.' },
  { id: '3', title: 'Mid-Term Examinations Begin', date: 'AUG 20', day: 20, time: '8:00 AM Start', type: 'Exam', location: 'All Classrooms', description: 'Mid-term evaluation exams across all JHS levels.' },
  { id: '4', title: 'Parent-Teacher Meeting', date: 'AUG 28', day: 28, time: '1:00 PM - 5:00 PM', type: 'Activity', location: 'School Assembly Hall', description: 'Termly parent engagement and report review session.' },
];

const mockDailyTimeline: SchedulePeriod[] = [
  { id: 's1', subject: 'Integrated Science', className: 'JHS 2A', time: '8:00 AM - 8:45 AM', room: 'Room 204', status: 'Completed', duration: '45m' },
  { id: 's2', subject: 'Free Period', className: '-', time: '9:00 AM - 9:45 AM', room: '-', status: 'Free', duration: '45m' },
  { id: 's3', subject: 'Integrated Science', className: 'JHS 2B', time: '10:00 AM - 11:00 AM', room: 'Room 204', status: 'Upcoming', duration: '60m' },
  { id: 's4', subject: 'Biology', className: 'JHS 3A', time: '11:15 AM - 12:00 PM', room: 'Room 205', status: 'Upcoming', duration: '45m' },
];

export const TeacherCalendar: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'calendar' | 'schedule'>('calendar');
  const [activeCalendarView, setActiveCalendarView] = useState<'month' | 'week' | 'agenda'>('month');
  const [scheduleMode, setScheduleMode] = useState<'day' | 'week'>('day');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState<SchedulePeriod | null>(null);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const getEventBadgeStyle = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'Meeting': return { bg: '#dcfce7', color: '#166534' };
      case 'Exam': return { bg: '#fef2f2', color: '#dc2626' };
      case 'Deadline': return { bg: '#fef3c7', color: '#b45309' };
      case 'Activity': return { bg: '#dbeafe', color: '#1e40af' };
    }
  };

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
                : 'View your teaching timetable, classes, subjects, rooms, and teaching periods.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 14px', fontSize: '11px', textAlign: 'right' }}>
              <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>ACADEMIC YEAR: 2025/2026</span>
              <strong style={{ color: '#002b49', fontSize: '12px' }}>Term: Second Term</strong>
            </div>

            {activeMainTab === 'calendar' && (
              <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                + Add Activity
              </button>
            )}
          </div>
        </div>

        {/* MAIN MODE TOGGLE (CALENDAR VS TIMETABLE SCHEDULE) */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <button
            onClick={() => { setActiveMainTab('calendar'); setSelectedEvent(null); setSelectedClassDetail(null); }}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeMainTab === 'calendar' ? '2px solid #002b49' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeMainTab === 'calendar' ? '#002b49' : '#64748b',
              fontWeight: activeMainTab === 'calendar' ? '800' : '500',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            School Calendar
          </button>
          <button
            onClick={() => { setActiveMainTab('schedule'); setSelectedEvent(null); setSelectedClassDetail(null); }}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeMainTab === 'schedule' ? '2px solid #002b49' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeMainTab === 'schedule' ? '#002b49' : '#64748b',
              fontWeight: activeMainTab === 'schedule' ? '800' : '500',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Teaching Schedule
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: SCHOOL CALENDAR */}
        {/* ========================================================================= */}
        {activeMainTab === 'calendar' && !selectedEvent && (
          <div>
            {/* CALENDAR CONTROLS BAR */}
            <div style={{ ...cardStyle, padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                {(['month', 'week', 'agenda'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setActiveCalendarView(v)}
                    style={{
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                      backgroundColor: activeCalendarView === v ? '#ffffff' : 'transparent',
                      color: activeCalendarView === v ? '#0f172a' : '#64748b',
                      boxShadow: activeCalendarView === v ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button style={{ border: 'none', background: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', color: '#64748b' }}>&lt;</button>
                <strong style={{ fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>August 2026</strong>
                <button style={{ border: 'none', background: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', color: '#64748b' }}>&gt;</button>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>All Events</span>
                <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Examinations</span>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Meetings</span>
              </div>
            </div>

            {/* CALENDAR GRID & SIDEBAR */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px', alignItems: 'start' }}>
              
              {/* MONTH GRID */}
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'center', padding: '10px 0', fontSize: '11px', fontWeight: '800', color: '#64748b' }}>
                  <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(90px, auto)' }}>
                  {/* Blank lead days */}
                  {[26, 27, 28, 29, 30, 31].map(d => (
                    <div key={`p-${d}`} style={{ borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '8px', color: '#cbd5e1', fontSize: '12px' }}>{d}</div>
                  ))}

                  {/* August 1 to 31 */}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const event = mockEvents.find(e => e.day === day);
                    const isToday = day === 13;
                    return (
                      <div 
                        key={day} 
                        style={{ 
                          borderRight: '1px solid #f1f5f9', 
                          borderBottom: '1px solid #f1f5f9', 
                          padding: '8px', 
                          backgroundColor: isToday ? '#f0f9ff' : '#ffffff',
                          minHeight: '85px'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: isToday ? '900' : '600', color: isToday ? '#002b49' : '#334155', marginBottom: '4px' }}>
                          {day} {isToday && <span style={{ fontSize: '9px', backgroundColor: '#002b49', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>TODAY</span>}
                        </div>

                        {event && (
                          <div 
                            onClick={() => setSelectedEvent(event)}
                            style={{ 
                              backgroundColor: getEventBadgeStyle(event.type).bg, 
                              color: getEventBadgeStyle(event.type).color, 
                              padding: '3px 6px', 
                              borderRadius: '4px', 
                              fontSize: '10px', 
                              fontWeight: 'bold', 
                              cursor: 'pointer',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {event.title}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* UPCOMING EVENTS LIST */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Upcoming Events</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mockEvents.map((ev) => {
                    const badge = getEventBadgeStyle(ev.type);
                    return (
                      <div 
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                      >
                        <div style={{ backgroundColor: badge.bg, color: badge.color, padding: '8px', borderRadius: '8px', textAlign: 'center', minWidth: '45px' }}>
                          <span style={{ fontSize: '9px', fontWeight: '900', display: 'block' }}>{ev.date.split(' ')[0]}</span>
                          <strong style={{ fontSize: '16px', fontWeight: '900' }}>{ev.date.split(' ')[1]}</strong>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>{ev.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* EVENT DETAIL SUB-VIEW */}
        {activeMainTab === 'calendar' && selectedEvent && (
          <div>
            <button 
              onClick={() => setSelectedEvent(null)}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Calendar
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ backgroundColor: getEventBadgeStyle(selectedEvent.type).bg, color: getEventBadgeStyle(selectedEvent.type).color, padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                    {selectedEvent.type}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>Upcoming</span>
                </div>

                <h1 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{selectedEvent.title}</h1>
                <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: '0 0 20px 0' }}>{selectedEvent.description}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>DATE</span>
                    <strong style={{ color: '#0f172a' }}>August {selectedEvent.day}, 2026</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>TIME</span>
                    <strong style={{ color: '#0f172a' }}>{selectedEvent.time}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>LOCATION</span>
                    <strong style={{ color: '#0f172a' }}>{selectedEvent.location}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>AUDIENCE</span>
                    <strong style={{ color: '#0f172a' }}>Teaching Staff</strong>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                    Set Reminder
                  </button>
                  <button style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                    Download Event Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: TEACHING SCHEDULE / TIMETABLE */}
        {/* ========================================================================= */}
        {activeMainTab === 'schedule' && !selectedClassDetail && (
          <div>
            {/* SCHEDULE HEADER KPIS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TODAY'S CLASSES</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>3</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TEACHING HOURS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>3h 00m</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>FREE PERIODS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>1</div>
              </div>

              <div style={{ ...cardStyle, backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>NEXT CLASS</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#002b49', marginTop: '4px' }}>10:00 AM</div>
                <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: 'bold' }}>JHS 2B • Room 204</span>
              </div>
            </div>

            {/* TIMELINE VIEW */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Thursday, August 13, 2026</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => setScheduleMode('day')}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: scheduleMode === 'day' ? '#002b49' : '#fff', color: scheduleMode === 'day' ? '#fff' : '#0f172a', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Day
                  </button>
                  <button 
                    onClick={() => setScheduleMode('week')}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: scheduleMode === 'week' ? '#002b49' : '#fff', color: scheduleMode === 'week' ? '#fff' : '#0f172a', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Week
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {mockDailyTimeline.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => item.status !== 'Free' && setSelectedClassDetail(item)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justify: 'space-between', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0',
                      backgroundColor: item.status === 'Free' ? '#f8fafc' : '#ffffff',
                      cursor: item.status !== 'Free' ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ minWidth: '130px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                        {item.time}
                      </div>

                      <div>
                        <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{item.subject}</strong>
                        {item.status !== 'Free' && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{item.className} • {item.room}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {item.status === 'Completed' && (
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>✓ Completed</span>
                      )}
                      {item.status === 'Upcoming' && (
                        <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>Upcoming</span>
                      )}
                      {item.status === 'Free' && (
                        <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>No Class</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CLASS SCHEDULE DETAIL VIEW */}
        {activeMainTab === 'schedule' && selectedClassDetail && (
          <div>
            <button 
              onClick={() => setSelectedClassDetail(null)}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Schedule
            </button>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{selectedClassDetail.subject}</h1>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Class {selectedClassDetail.className} • Period 3</span>
                </div>
                <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  Prepare Lesson Plan
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>TIME</span>
                  <strong style={{ color: '#0f172a' }}>{selectedClassDetail.time}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>LOCATION</span>
                  <strong style={{ color: '#0f172a' }}>Science Block — {selectedClassDetail.room}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>ENROLLED STUDENTS</span>
                  <strong style={{ color: '#0f172a' }}>38 Students</strong>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};