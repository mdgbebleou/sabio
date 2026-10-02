import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'Academic' | 'Examination' | 'School Event';
  priority: 'Normal' | 'Important' | 'Critical';
  date: string;
  time: string;
  location: string;
  audience: string;
  description: string;
  conflict?: boolean;
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Staff Meeting',
    type: 'School Event',
    priority: 'Normal',
    date: 'Aug 18, 2026',
    time: '09:00 AM - 11:30 AM',
    location: 'Conference Room A',
    audience: 'All Teachers & Faculty',
    description: 'General staff alignment for the upcoming academic session.'
  },
  {
    id: '2',
    title: 'Term Begins',
    type: 'Academic',
    priority: 'Important',
    date: 'Aug 20, 2026',
    time: '08:00 AM',
    location: 'Main Campus',
    audience: 'All Students & Staff',
    description: 'Official commencement of the 2026/2027 Academic Year First Term.'
  },
  {
    id: '3',
    title: 'Mathematics Exam',
    type: 'Examination',
    priority: 'Critical',
    date: 'Aug 24, 2026',
    time: '08:00 AM - 10:00 AM',
    location: 'Room 3 - Science Block',
    audience: 'Form 2A, 2B',
    description: 'Mid-term assessment examination for Form 2 Mathematics.',
    conflict: true
  },
  {
    id: '4',
    title: 'Parent Orientation',
    type: 'School Event',
    priority: 'Important',
    date: 'Aug 28, 2026',
    time: '02:00 PM - 04:00 PM',
    location: 'Main Campus - Gymnasium',
    audience: 'All Grade 9-12 Parents & Faculty',
    description: 'Mandatory meeting for all high school faculty to meet with parents regarding mid-term progress.'
  }
];

export const Calendar: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'create' | 'details' | 'edit' | 'audience' | 'delete' | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(mockEvents[3]);
  const [activeTab, setActiveTab] = useState<'Month' | 'Week' | 'Day' | 'Agenda'>('Month');
  const [hasConflict, setHasConflict] = useState(true);

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

  const handleOpenDetails = (eventItem: CalendarEvent) => {
    setSelectedEvent(eventItem);
    setActiveModal('details');
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>School Calendar</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage academic dates, examinations, and important school events.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
              Academic Calendar
            </button>
            <button style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
              Examination Dates
            </button>
            <button 
              onClick={() => setActiveModal('create')} 
              style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Event
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>TODAY'S EVENTS</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>3</div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>UPCOMING</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>14</div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>EXAMINATIONS</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>8</div>
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b' }}>ATTENTION REQUIRED</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626' }}>2</div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE ACADEMIC TERM BANNER */}
        <div style={{ backgroundColor: '#002b49', color: '#ffffff', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>ACTIVE</span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>2026/2027 Academic Year - First Term</h2>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              September 1, 2026 — December 18, 2026
            </p>
          </div>

          <div style={{ textAlign: 'right', minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: '#cbd5e1' }}>
              <span>Term Progress</span>
              <strong>42%</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '42%', height: '100%', backgroundColor: '#38bdf8' }}></div>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>76 days remaining</span>
          </div>
        </div>

        {/* MAIN CALENDAR LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          
          {/* CALENDAR GRID CONTAINER */}
          <div style={cardStyle}>
            {/* TOOLBAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>&lt;</button>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>August 2026</h3>
                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>&gt;</button>
                <button style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Today</button>
              </div>

              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                {(['Month', 'Week', 'Day', 'Agenda'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                      color: activeTab === tab ? '#0f172a' : '#64748b',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* MONTH GRID */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Day Labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#64748b', padding: '10px 0' }}>
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>

              {/* Grid Days */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(5, minmax(80px, 1fr))', fontSize: '12px' }}>
                {/* Previous month padding days */}
                {[26, 27, 28, 29, 30, 31].map(d => (
                  <div key={`prev-${d}`} style={{ borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '8px', color: '#cbd5e1', backgroundColor: '#fafafa' }}>{d}</div>
                ))}

                {/* August days */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const eventForDay = mockEvents.filter(e => e.date.includes(`Aug ${day}`));
                  return (
                    <div key={day} style={{ borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '6px', backgroundColor: day === 20 ? '#f0f9ff' : '#ffffff', minHeight: '85px' }}>
                      <div style={{ fontWeight: day === 20 ? 'bold' : 'normal', color: day === 20 ? '#0284c7' : '#334155', marginBottom: '4px' }}>{day}</div>
                      
                      {eventForDay.map(ev => (
                        <div
                          key={ev.id}
                          onClick={() => handleOpenDetails(ev)}
                          style={{
                            backgroundColor: ev.type === 'Academic' ? '#002b49' : ev.type === 'Examination' ? '#94a3b8' : '#e0e7ff',
                            color: ev.type === 'School Event' ? '#3730a3' : '#ffffff',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            marginBottom: '2px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {ev.time.split(' - ')[0]} {ev.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LEGEND */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '11px', color: '#64748b', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#002b49', borderRadius: '50%' }}></span> Academic</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#94a3b8', borderRadius: '50%' }}></span> Examination</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#e0e7ff', borderRadius: '50%' }}></span> School Event</div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: UPCOMING & INSIGHTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Upcoming Events Box */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Upcoming Events</h3>
                <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: 'bold', cursor: 'pointer' }}>View All</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mockEvents.map(ev => (
                  <div key={ev.id} onClick={() => handleOpenDetails(ev)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', minWidth: '40px' }}>
                      <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>{ev.date.split(' ')[0]}</span>
                      <strong style={{ fontSize: '16px', color: '#0f172a' }}>{ev.date.split(' ')[1].replace(',', '')}</strong>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ev.title}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{ev.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Insights */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Calendar Insights</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px' }}>
                  <strong style={{ color: '#991b1b', fontSize: '11px', display: 'block' }}>Scheduling Conflict Detected</strong>
                  <p style={{ margin: '4px 0 8px 0', fontSize: '11px', color: '#7f1d1d' }}>
                    Mathematics Examination vs Parent Meeting (Room 3, Aug 24).
                  </p>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#991b1b', cursor: 'pointer', textDecoration: 'underline' }}>Resolve Conflict</span>
                </div>

                <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px' }}>
                  <strong style={{ color: '#92400e', fontSize: '11px', display: 'block' }}>Examination Schedule Warning</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#78350f' }}>
                    Form 2A Mathematics vs Science overlap detected.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: CREATE NEW EVENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'create' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '680px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Create New Event</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Schedule an activity, academic session, or facility booking.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Event Title *</label>
                  <input type="text" defaultValue="Advanced Physics Lab Seminar" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Event Type</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Academic / Lecture</option>
                      <option>Examination</option>
                      <option>School Event</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Host / Organizer</label>
                    <input type="text" defaultValue="Dr. Emily Chen (Science Dept)" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Description (Optional)</label>
                  <textarea defaultValue="Mandatory lab seminar for AP Physics students regarding upcoming semester project requirements." style={{ width: '100%', height: '70px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>TIME & LOCATION</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Date</label>
                      <input type="text" defaultValue="10/24/2026" style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Facility / Location</label>
                      <input type="text" defaultValue="Science Block - Room 3" style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Start Time</label>
                      <input type="text" defaultValue="02:00 PM" style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>End Time</label>
                      <input type="text" defaultValue="03:30 PM" style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                {hasConflict && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px' }}>
                    <strong style={{ color: '#991b1b', fontSize: '12px', display: 'block' }}>Critical Scheduling Conflict</strong>
                    <span style={{ fontSize: '11px', color: '#7f1d1d' }}>The selected time and location overlap with an existing mandatory event: <strong>Science Department Staff Meeting</strong> (13:30 - 15:00).</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal('audience')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Next: Select Audience →</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: EVENT DETAILS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'details' && selectedEvent && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '640px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Event Details</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Review event information and status.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>Scheduled</span>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>{selectedEvent.priority}</span>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>{selectedEvent.type}</span>
                </div>

                <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{selectedEvent.title}</h2>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: '800' }}>TIME & LOCATION</span>
                    <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{selectedEvent.date}</div>
                    <div style={{ color: '#475569' }}>{selectedEvent.time}</div>
                    <div style={{ color: '#475569', marginTop: '4px' }}>{selectedEvent.location}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: '800' }}>AUDIENCE</span>
                    <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{selectedEvent.audience}</div>
                    <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>286 total, 280 active</div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>DESCRIPTION</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>{selectedEvent.description}</p>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setActiveModal('delete')} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer' }}>Cancel Event</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Close</button>
                  <button onClick={() => setActiveModal('edit')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Edit Event</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: EDIT EVENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'edit' && selectedEvent && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '680px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Edit Event</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Update details for existing event.</p>
                </div>
                <button onClick={() => setActiveModal('details')} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '11px', color: '#991b1b' }}>
                  <strong>Communication Impact:</strong> This event has already been communicated to 286 recipients. Changing details may require an updated notification.
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Event Title</label>
                  <input type="text" defaultValue={selectedEvent.title} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Date</label>
                    <input type="text" defaultValue={selectedEvent.date} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Location / Room Venue</label>
                    <input type="text" defaultValue={selectedEvent.location} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Description</label>
                  <textarea defaultValue={selectedEvent.description} style={{ width: '100%', height: '80px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setActiveModal('details')} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal('details')} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Update Event Only</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Update & Notify Audience</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: SELECT AUDIENCE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'audience' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Select Audience</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure visibility and notifications for this event.</p>
                </div>
                <button onClick={() => setActiveModal('create')} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>All Users</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Broadcast to entire school community.</span>
                  </div>
                  <div style={{ border: '2px solid #002b49', borderRadius: '12px', padding: '14px', backgroundColor: '#f0f9ff', cursor: 'pointer' }}>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>Parents</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Guardians and registered family members.</span>
                  </div>
                  <div style={{ border: '2px solid #002b49', borderRadius: '12px', padding: '14px', backgroundColor: '#f0f9ff', cursor: 'pointer' }}>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>Teachers</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Faculty and instructional staff.</span>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>Students</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Enrolled students across all grades.</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>AUDIENCE SUMMARY</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>292</div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Potential Recipients</span>

                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', marginTop: '16px', fontSize: '11px', color: '#991b1b' }}>
                    <strong>Audience Gap Detected:</strong> 6 parent accounts are currently unlinked.
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('create')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Audience & Save</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 5: REMOVE / CANCEL EVENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'delete' && selectedEvent && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '480px' }}>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Remove Event</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  You are about to remove '{selectedEvent.title}'. How would you like to proceed?
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', textAlign: 'left' }}>
                  <label style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input type="radio" name="cancelType" defaultChecked style={{ marginTop: '3px' }} />
                    <div>
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>CANCEL EVENT</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Keeps the event in history but marks it as cancelled.</span>
                    </div>
                  </label>

                  <label style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input type="radio" name="cancelType" style={{ marginTop: '3px' }} />
                    <div>
                      <strong style={{ fontSize: '12px', color: '#991b1b', display: 'block' }}>DELETE PERMANENTLY</strong>
                      <span style={{ fontSize: '11px', color: '#7f1d1d' }}>Removes all records completely. This action cannot be undone.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('details')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Keep Event</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Proceed</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};