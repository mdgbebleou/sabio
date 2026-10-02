import React, { useState } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';

interface MessageThread {
  id: string;
  senderName: string;
  senderEmail: string;
  role: string;
  subject: string;
  preview: string;
  time: string;
  date: string;
  avatarUrl?: string;
  unread: boolean;
  category: 'Focused' | 'Other';
  fullText: string;
  attachmentName?: string;
  attachmentSize?: string;
}

const mockThreads: MessageThread[] = [
  {
    id: '1',
    senderName: 'Mrs. Adozovi Mensah',
    senderEmail: 'ama.mensah@email.com',
    role: 'Parent of Daniel Mensah',
    subject: "Regarding Daniel's Performance",
    preview: "Good morning, I was reviewing Daniel's recent test scores and noticed a slight drop in...",
    time: '10:42 AM',
    date: 'Today',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60',
    unread: true,
    category: 'Focused',
    fullText: "Good morning,\n\nI hope you are having a productive week.\n\nI was reviewing Daniel's recent test scores on the portal this morning and noticed a slight drop in his math grades over the last two assignments. He usually enjoys math, so I wanted to reach out and see if there is an area he's specifically struggling with, or if there's any extra practice we can do at home.\n\nI'd love to schedule a quick chat or phone call sometime this week if you have availability. Wednesday or Thursday afternoon works best for me.\n\nThank you for all your hard work with the class.\n\nBest regards,\nAdozovi Mensah",
    attachmentName: 'Daniel_Progress_Report.pdf',
    attachmentSize: '1.2 MB'
  },
  {
    id: '2',
    senderName: 'Mr. Kwame Asare',
    senderEmail: 'kwame.asare@school.edu',
    role: 'Science Teacher',
    subject: 'Science Project Deadline Extension',
    preview: 'Can we discuss extending the deadline for the group science project? Several students...',
    time: 'Yesterday',
    date: 'Yesterday',
    unread: false,
    category: 'Focused',
    fullText: 'Hello Sarah,\n\nSeveral students have asked for additional time to complete the lab experiments for the Science Fair project. Could we extend the submission window by two days?'
  },
  {
    id: '3',
    senderName: 'School Administrator',
    senderEmail: 'admin@school.edu',
    role: 'Administration',
    subject: 'Updated Staff Meeting Schedule',
    preview: 'Please note the changes to next week\'s staff meeting. We will be meeting in the main hall...',
    time: 'Oct 24',
    date: 'Oct 24',
    unread: false,
    category: 'Other',
    fullText: 'Dear Teachers,\n\nPlease review the updated agenda for the upcoming staff meeting on Thursday.'
  }
];

export const TeacherMessages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Focused' | 'Other'>('Focused');
  const [activeView, setActiveView] = useState<'inbox' | 'broadcast' | 'compose'>('inbox');
  const [selectedThread, setSelectedThread] = useState<MessageThread>(mockThreads[0]);
  const [replyText, setReplyText] = useState('');

  // Class Broadcast Form State
  const [broadcastClass, setBroadcastClass] = useState('JHS 2A');
  const [broadcastAudience, setBroadcastAudience] = useState<'Parents' | 'Students' | 'Parents & Students'>('Parents');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Compose DM Form State
  const [recipientQuery, setRecipientQuery] = useState('Ama M');
  const [dmSubject, setDmSubject] = useState('');
  const [dmBody, setDmBody] = useState('');

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
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Messages &gt; {activeView === 'inbox' ? 'Inbox' : activeView === 'broadcast' ? 'Class Communication' : 'New Message'}</div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              {activeView === 'inbox' ? 'Inbox' : activeView === 'broadcast' ? 'Class Communication' : 'New Message'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveView('broadcast')}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#002b49', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              📢 Class Communication
            </button>
            <button 
              onClick={() => setActiveView('compose')}
              style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
            >
              + New Message
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: INBOX & SPLIT CONVERSATION DETAIL */}
        {/* ========================================================================= */}
        {activeView === 'inbox' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', minHeight: '650px', alignItems: 'stretch' }}>
            
            {/* THREAD LIST PANEL */}
            <div style={{ ...cardStyle, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <button 
                  onClick={() => setActiveTab('Focused')}
                  style={{ flex: 1, padding: '12px', border: 'none', borderBottom: activeTab === 'Focused' ? '2px solid #002b49' : '2px solid transparent', backgroundColor: 'transparent', fontWeight: 'bold', fontSize: '12px', color: activeTab === 'Focused' ? '#002b49' : '#64748b', cursor: 'pointer' }}
                >
                  Focused
                </button>
                <button 
                  onClick={() => setActiveTab('Other')}
                  style={{ flex: 1, padding: '12px', border: 'none', borderBottom: activeTab === 'Other' ? '2px solid #002b49' : '2px solid transparent', backgroundColor: 'transparent', fontWeight: 'bold', fontSize: '12px', color: activeTab === 'Other' ? '#002b49' : '#64748b', cursor: 'pointer' }}
                >
                  Other
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {mockThreads
                  .filter(t => t.category === activeTab)
                  .map((thread) => {
                    const isSelected = selectedThread.id === thread.id;
                    return (
                      <div
                        key={thread.id}
                        onClick={() => setSelectedThread(thread)}
                        style={{
                          padding: '16px',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                          borderLeft: isSelected ? '4px solid #002b49' : '4px solid transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '13px', color: '#0f172a' }}>{thread.senderName}</strong>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{thread.time}</span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {thread.subject}
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                          {thread.preview}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* CONVERSATION READING & REPLY PANEL */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* THREAD HEADER */}
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {selectedThread.avatarUrl ? (
                      <img src={selectedThread.avatarUrl} alt={selectedThread.senderName} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#002b49', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                        {selectedThread.senderName.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{selectedThread.subject}</h2>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        <strong>{selectedThread.senderName}</strong> &lt;{selectedThread.senderEmail}&gt;
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', color: '#64748b' }}>{selectedThread.date}, {selectedThread.time}</span>
                </div>

                {/* THREAD CONTENT */}
                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: '24px' }}>
                  {selectedThread.fullText}
                </div>

                {/* ATTACHMENT BLOCK */}
                {selectedThread.attachmentName && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '8px' }}>1 Attachment</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: '#dc2626' }}>PDF</span>
                      <div>
                        <strong style={{ display: 'block', color: '#0f172a' }}>{selectedThread.attachmentName}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{selectedThread.attachmentSize}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* REPLY RICH EDITOR */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', backgroundColor: '#ffffff' }}>
                  <button style={{ border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer' }}>B</button>
                  <button style={{ border: 'none', background: 'none', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
                  <button style={{ border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer' }}>U</button>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>📎 Attach File</button>
                </div>
                <textarea 
                  rows={3} 
                  placeholder="Type your reply here..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ width: '100%', border: 'none', outline: 'none', padding: '12px', fontSize: '12px', backgroundColor: 'transparent', resize: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                  <button style={{ padding: '6px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                    Send Reply
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CLASS COMMUNICATION BROADCAST */}
        {/* ========================================================================= */}
        {activeView === 'broadcast' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button 
              onClick={() => setActiveView('inbox')}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Inbox
            </button>

            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Class Communication</h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b' }}>Send a broadcast announcement to students or parents connected to your class.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Select Class</label>
                  <select 
                    value={broadcastClass} 
                    onChange={(e) => setBroadcastClass(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#0f172a', fontWeight: 'bold' }}
                  >
                    <option>JHS 2A</option>
                    <option>JHS 2B</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Select Audience</label>
                  <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {(['Parents', 'Students', 'Parents & Students'] as const).map((aud) => (
                      <button
                        key={aud}
                        onClick={() => setBroadcastAudience(aud)}
                        style={{
                          flex: 1,
                          border: 'none',
                          padding: '7px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          backgroundColor: broadcastAudience === aud ? '#ffffff' : 'transparent',
                          color: broadcastAudience === aud ? '#0f172a' : '#64748b'
                        }}
                      >
                        {aud}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g., Upcoming Field Trip Information" 
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Message</label>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                    <span>B</span><span>I</span><span>U</span><span>📎 Attach File</span>
                  </div>
                  <textarea 
                    rows={6} 
                    placeholder="Type your broadcast message here..." 
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    style={{ width: '100%', border: 'none', outline: 'none', padding: '12px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  You are sending to: <strong>{broadcastClass}</strong> • Audience: <strong>{broadcastAudience}</strong> • Recipients: <strong>38</strong>
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                    Save Draft
                  </button>
                  <button style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                    Send to Class
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: COMPOSE DIRECT MESSAGE */}
        {/* ========================================================================= */}
        {activeView === 'compose' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              onClick={() => setActiveView('inbox')}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Inbox
            </button>

            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>New Message</h2>

              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Recipient</label>
                <input 
                  type="text" 
                  value={recipientQuery}
                  onChange={(e) => setRecipientQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>PARENTS</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>AM</div>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Mrs. Adozovi Mensah</strong>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Parent of Daniel Mensah (Grade 8)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Subject</label>
                <input 
                  type="text" 
                  placeholder="Enter message subject..." 
                  value={dmSubject}
                  onChange={(e) => setDmSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Message</label>
                <textarea 
                  rows={6} 
                  placeholder="Type your message here..." 
                  value={dmBody}
                  onChange={(e) => setDmBody(e.target.value)}
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', padding: '12px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  Save Draft
                </button>
                <button style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  Send Message
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};