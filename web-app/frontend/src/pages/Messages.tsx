import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface Announcement {
  id: string;
  title: string;
  audience: string;
  priority: 'Normal' | 'Urgent' | 'Important' | 'High';
  publishedDate: string;
  reach: string;
  read: string;
}

const mockAnnouncements: Announcement[] = [
  { id: '1', title: 'Winter Break Schedule', audience: 'All Users', priority: 'Normal', publishedDate: 'Nov 28, 2026', reach: '99%', read: '88%' },
  { id: '2', title: 'Campus Power Outage', audience: 'Staff, Teachers', priority: 'Urgent', publishedDate: 'Nov 27, 2026', reach: '100%', read: '95%' },
  { id: '3', title: 'Parent-Teacher Meeting', audience: 'Parents, Teachers', priority: 'Important', publishedDate: 'Nov 25, 2026', reach: '97%', read: '54%' },
];

export const Messages: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'newAnnouncement' | 'sendMessage' | 'selectAudience' | 'confirmPublish' | 'deleteConfirm' | 'discardConfirm' | null>(null);
  const [selectedAudienceGroup, setSelectedAudienceGroup] = useState<'all' | 'parents' | 'teachers' | 'students' | 'classes' | 'groups'>('classes');

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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '720px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Announcements</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Create, manage and monitor school-wide announcements.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Communication History
            </button>
            <button 
              onClick={() => setActiveModal('sendMessage')} 
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Send Direct Message
            </button>
            <button 
              onClick={() => setActiveModal('newAnnouncement')} 
              style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Announcement
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACTIVE</span>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>12</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SCHEDULED</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>5</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>DRAFTS</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>3</div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ATTENTION REQUIRED</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#dc2626', marginTop: '8px' }}>4</div>
          </div>
        </div>

        {/* MIDDLE SECTION: REACH & INSIGHTS & AUDIENCE ENGAGEMENT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          
          {/* Global Reach */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Global Reach (Last 30 Days)</h3>
            
            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
              <div style={{ width: '86.4%', height: '100%', backgroundColor: '#002b49' }}></div>
              <div style={{ width: '11.8%', height: '100%', backgroundColor: '#93c5fd' }}></div>
              <div style={{ width: '1.8%', height: '100%', backgroundColor: '#dc2626' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px' }}>Delivered</span>
                <div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>98.2%</div>
              </div>
              <div>
                <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold' }}>● Read</span>
                <div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>86.4%</div>
              </div>
              <div>
                <span style={{ color: '#1e40af', fontSize: '11px', fontWeight: 'bold' }}>● Unread</span>
                <div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>13.6%</div>
              </div>
              <div>
                <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 'bold' }}>● Failed</span>
                <div style={{ fontWeight: '900', fontSize: '16px', color: '#dc2626' }}>1.8%</div>
              </div>
            </div>
          </div>

          {/* Communication Insights */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Communication Insights
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                <strong style={{ color: '#d97706', display: 'block' }}>Low Read Rate Detected</strong>
                <span style={{ color: '#475569' }}>"Parent-Teacher Meeting" is at 54% (vs 84% avg).</span>
              </div>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px' }}>
                <strong style={{ color: '#991b1b', display: 'block' }}>Delivery Issue Detected</strong>
                <span style={{ color: '#7f1d1d' }}>12 failed deliveries out of 620 total recipients.</span>
              </div>
            </div>
          </div>

          {/* Audience Engagement */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Audience Engagement</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>Parents</span>
                  <strong>92%</strong>
                </div>
                <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>Students</span>
                  <strong>96%</strong>
                </div>
                <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '96%', height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>Teachers</span>
                  <strong>99%</strong>
                </div>
                <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '99%', height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RECENT ANNOUNCEMENTS TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recent Announcements</h3>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>View All</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>ANNOUNCEMENT</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>AUDIENCE</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>PRIORITY</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>PUBLISHED</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>REACH</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>READ</th>
                <th style={{ padding: '14px 20px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {mockAnnouncements.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#0f172a' }}>{item.title}</td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>{item.audience}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      backgroundColor: item.priority === 'Urgent' ? '#fee2e2' : item.priority === 'Important' ? '#fef3c7' : '#e0e7ff',
                      color: item.priority === 'Urgent' ? '#991b1b' : item.priority === 'Important' ? '#92400e' : '#3730a3',
                      padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold'
                    }}>
                      {item.priority}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{item.publishedDate}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 'bold' }}>{item.reach}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 'bold', color: item.read === '54%' ? '#dc2626' : '#166534' }}>{item.read}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button onClick={() => setActiveModal('deleteConfirm')} style={{ border: 'none', background: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SCHEDULED FOR DELIVERY BANNER */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3730a3' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>Final Examination Timetable</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Target: Students, Parents • Dec 2, 2026 • 10:00 AM</div>
            </div>
          </div>
          <button style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Edit</button>
        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: NEW ANNOUNCEMENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'newAnnouncement' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '840px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>New Announcement</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Compose and distribute school-wide updates.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Left Form */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Announcement Title</label>
                      <input type="text" placeholder="Enter clear, concise title" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Priority</label>
                      <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                        <option>Normal</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Message</label>
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ backgroundColor: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                        <span>B</span> <span>I</span> <span>U</span> <span>•</span> <span>1.</span> <span>🔗</span>
                      </div>
                      <textarea placeholder="Compose your announcement here..." style={{ width: '100%', height: '140px', padding: '12px', border: 'none', outline: 'none', fontSize: '12px', resize: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Attachments</label>
                    <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', marginTop: '4px', cursor: 'pointer' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Click to upload or drag and drop</div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>PDF, JPG, PNG up to 10MB</div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar Details */}
                <div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>AUDIENCE</span>
                      <button onClick={() => setActiveModal('selectAudience')} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Edit</button>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>All Parents & Teachers</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>2 groups selected</div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>RECIPIENT ESTIMATE</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '4px 0' }}>342</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>● Active Accounts: <strong>330</strong></div>
                    <div style={{ fontSize: '11px', color: '#d97706', marginTop: '2px' }}>● Pending / Inactive: <strong>12</strong></div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>PUBLISHING</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                      <input type="radio" name="pub" defaultChecked /> Publish Immediately
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                      <input type="radio" name="pub" /> Schedule for Later
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('discardConfirm')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal('confirmPublish')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Continue →</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: SELECT AUDIENCE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'selectAudience' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '800px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Select Audience</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Target your communication precisely across the district.</p>
                </div>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>TARGET GROUPS</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <div onClick={() => setSelectedAudienceGroup('all')} style={{ border: selectedAudienceGroup === 'all' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '10px', padding: '10px', cursor: 'pointer', backgroundColor: selectedAudienceGroup === 'all' ? '#f0f9ff' : '#ffffff' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>All Users</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>4,250</div>
                    </div>
                    <div onClick={() => setSelectedAudienceGroup('parents')} style={{ border: selectedAudienceGroup === 'parents' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '10px', padding: '10px', cursor: 'pointer', backgroundColor: selectedAudienceGroup === 'parents' ? '#f0f9ff' : '#ffffff' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Parents</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>2,100</div>
                    </div>
                    <div onClick={() => setSelectedAudienceGroup('teachers')} style={{ border: selectedAudienceGroup === 'teachers' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '10px', padding: '10px', cursor: 'pointer', backgroundColor: selectedAudienceGroup === 'teachers' ? '#f0f9ff' : '#ffffff' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Teachers</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>150</div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '12px' }}>
                    <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Specific Classes</div>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>AP Biology - Section A (28 Students)</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Intro to Computer Science (24 Students)</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '12px' }}>AUDIENCE INTELLIGENCE</div>
                  <div style={{ fontSize: '12px', color: '#334155', marginBottom: '6px' }}>Total Selected: <strong>104</strong></div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>• Parents: 76</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>• Students: 28</div>
                  <div style={{ fontSize: '11px', color: '#d97706', marginTop: '8px' }}>⚡ Duplicates Removed: -12</div>
                  <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#002b49' }}>
                    Final Delivery Count: 92
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Audience</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: SEND DIRECT MESSAGE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'sendMessage' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>New Message</h3>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>To</label>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>All Parents (Grade 10)</option>
                  </select>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px', fontSize: '11px', color: '#1e40af', marginBottom: '16px' }}>
                  ℹ️ <strong>Broadcast Message Warning:</strong> This message will be sent to approximately 1,200 recipients.
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Subject</label>
                  <input type="text" placeholder="Enter message subject..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <textarea placeholder="Type your message here..." style={{ width: '100%', height: '100px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Send Message</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: CONFIRM PUBLISH MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'confirmPublish' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '520px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Confirm Publish</h3>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Please review the final details before distributing this announcement to the district.</p>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>TITLE</span>
                    <strong style={{ color: '#0f172a' }}>Standardized Testing Schedule</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>AUDIENCE</span>
                    <div><span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Parents</span> <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Students (G9-12)</span></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>RECIPIENTS</span>
                    <strong>~3,150 Users</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                    <span style={{ color: '#64748b' }}>PRIORITY</span>
                    <strong style={{ color: '#dc2626' }}>! High</strong>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Edit Details</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Publish Now</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 5: DELETE ANNOUNCEMENT CONFIRMATION */}
        {/* ========================================================================= */}
        {activeModal === 'deleteConfirm' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '480px' }}>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Delete Published Announcement?</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  "Winter Weather Closure Protocol" has already been delivered to 4,200 recipients. Deleting it will remove it from the portal, but copies sent via email cannot be recalled.
                </p>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginTop: '16px', fontSize: '11px', color: '#334155', textAlign: 'left' }}>
                  💡 <strong>Recommendation:</strong> Consider archiving this announcement instead to maintain historical records.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Archive Instead</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Delete Permanently</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 6: DISCARD DRAFT CONFIRMATION */}
        {/* ========================================================================= */}
        {activeModal === 'discardConfirm' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '420px', textAlign: 'center' }}>
              <div style={{ padding: '24px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Discard Draft?</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Are you sure you want to discard this draft? This action cannot be undone.
                </p>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Discard</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};