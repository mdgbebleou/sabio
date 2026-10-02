import React from 'react';
import { TeacherLayout } from '../components/TeacherLayout';

export const TeacherDashboard: React.FC = () => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  };

  return (
    <TeacherLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* ROW 1: TOP SUMMARY STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          {/* Classes Today */}
          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CLASSES TODAY</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>4</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002b49' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
          </div>

          {/* Attendance Pending */}
          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ATTENDANCE PENDING</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>3</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
            </div>
          </div>

          {/* Pending Results */}
          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PENDING RESULTS</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>2</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002b49' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
          </div>

          {/* Unread Messages */}
          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UNREAD MESSAGES</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>5</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002b49', position: 'relative' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: '#dc2626', borderRadius: '50%' }}></span>
            </div>
          </div>

        </div>

        {/* ROW 2: ACTION BUTTON SHORTCUTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <button style={{ backgroundColor: '#1e293b', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
            Take Attendance
          </button>

          <button style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Enter Results
          </button>

          <button style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            My Classes
          </button>

          <button style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Messages
          </button>
        </div>

        {/* ROW 3: SCHEDULE & TASKS */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '20px', alignItems: 'stretch' }}>
          
          {/* Left: Alert & Timetable Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Attendance Required</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>JHS 2A - Mathematics • 8:00 AM (Overdue)</div>
                </div>
              </div>
              <button style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Mark Now</button>
            </div>

            {/* Today's Schedule Card (Stretched with flex: 1 to match height) */}
            <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Today's Schedule</h3>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}>View Full Timetable</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ minWidth: '80px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>8:00 AM</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>45 mins</div>
                    </div>
                    <div style={{ flex: 1, paddingLeft: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Mathematics</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>JHS 2A • Room 102</div>
                    </div>
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Completed</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ minWidth: '80px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>10:00 AM</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>45 mins</div>
                    </div>
                    <div style={{ flex: 1, paddingLeft: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Mathematics</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>JHS 3A • Room 105</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ backgroundColor: '#edf2f7', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' }}>Ongoing</span>
                      <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 'bold', marginTop: '4px', cursor: 'pointer' }}>Open Resources</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ minWidth: '80px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>1:00 PM</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>45 mins</div>
                    </div>
                    <div style={{ flex: 1, paddingLeft: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>ICT</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>JHS 1B • Computer Lab</div>
                    </div>
                    <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Upcoming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Tasks & Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Pending Tasks</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <input type="checkbox" style={{ marginTop: '2px', cursor: 'pointer' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Submit JHS 3A Math Mid-term Results</div>
                    <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '11px', marginTop: '2px' }}>Due Today, 5:00 PM</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <input type="checkbox" style={{ marginTop: '2px', cursor: 'pointer' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Review Parent Message (Mr. Osei)</div>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>Received yesterday</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <input type="checkbox" style={{ marginTop: '2px', cursor: 'pointer' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Prepare lesson notes for Week 4</div>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>Due Friday</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recent Messages</h3>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}>View All</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>AM</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Adzovi Mensah (Parent)</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>9:15 AM</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      Question regarding John's recent assignment...
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>AC</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Academic Coordinator</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>Yesterday</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      Reminder: Staff meeting agenda attached.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 4: ANNOUNCEMENTS | UPCOMING EVENTS | PERFORMANCE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Announcements */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Announcements</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>End of Term Exams Schedule Released</div>
                <div style={{ color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>The timetable for the upcoming end of term examinations has been...</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Posted 2 hours ago</div>
              </div>

              <div>
                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Mandatory Staff Meeting</div>
                <div style={{ color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>All teaching staff are required to attend the brief meeting in the main...</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Posted Yesterday</div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Upcoming Events</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#edf2f7', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', minWidth: '42px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>AUG</div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>14</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Staff Briefing</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>4:00 PM - Main Hall</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#edf2f7', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', minWidth: '42px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>AUG</div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>20</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>PTA Meeting</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>9:00 AM - Online</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Performance</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px', color: '#0f172a' }}>
                  <span>JHS 2A - Math Avg</span>
                  <span>78%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#edf2f7', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '78%', height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px', color: '#0f172a' }}>
                  <span>JHS 3A - Math Avg</span>
                  <span>82%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#edf2f7', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '82%', height: '100%', backgroundColor: '#047857' }}></div>
                </div>
              </div>

              <button style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', marginTop: '4px' }}>
                View Detailed Analytics
              </button>
            </div>
          </div>

        </div>

      </div>
    </TeacherLayout>
  );
};