import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';
import {
  getMyThreads,
  getThreadMessages,
  markThreadRead,
  sendMessage,
  createThread,
  getAttachmentUrl,
  getMyStudents,
} from '../services/teacherService';
import type { MessageThreadRow, MessageRow, TeacherStudent } from '../services/teacherService';

const FOCUSED_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const formatBytes = (n: number | null): string => {
  if (n == null) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTimestamp = (iso: string): { time: string; date: string } => {
  if (!iso) return { time: '', date: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { time: '', date: '' };
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return { time, date: 'Today' };
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return { time, date: 'Yesterday' };
  return { time, date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
};

export const TeacherMessages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Focused' | 'Other'>('Focused');
  const [activeView, setActiveView] = useState<'inbox' | 'broadcast' | 'compose'>('inbox');

  const [threads, setThreads] = useState<MessageThreadRow[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);

  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState('');
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const replyFileInputRef = useRef<HTMLInputElement | null>(null);

  // Compose state
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [composeStudentId, setComposeStudentId] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeFile, setComposeFile] = useState<File | null>(null);
  const composeFileInputRef = useRef<HTMLInputElement | null>(null);
  const [composing, setComposing] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    setError(null);
    try {
      const list = await getMyThreads();
      setThreads(list);
      if (list.length > 0 && !selectedThreadId) {
        setSelectedThreadId(list[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not load messages.');
    } finally {
      setLoadingThreads(false);
    }
  }, [selectedThreadId]);

  useEffect(() => {
    void loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeView !== 'inbox' || !selectedThreadId) return;
    let cancelled = false;
    (async () => {
      setLoadingMessages(true);
      try {
        const list = await getThreadMessages(selectedThreadId);
        if (!cancelled) setMessages(list);
        await markThreadRead(selectedThreadId);
        // refresh thread list to update unread badge
        const refreshed = await getMyThreads();
        if (!cancelled) setThreads(refreshed);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not load conversation.');
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedThreadId, activeView]);

  // load students when compose view opens
  useEffect(() => {
    if (activeView !== 'compose') return;
    (async () => {
      try {
        const list = await getMyStudents();
        setStudents(list);
        if (list.length > 0 && !composeStudentId) setComposeStudentId(list[0].id);
      } catch (err: any) {
        setError(err?.message || 'Could not load students.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  const focusedThreads = threads.filter((t) => {
    if (t.unreadCount > 0) return true;
    if (!t.lastMessageAt) return false;
    const d = new Date(t.lastMessageAt).getTime();
    return !Number.isNaN(d) && Date.now() - d < FOCUSED_WINDOW_MS;
  });
  const otherThreads = threads.filter((t) => !focusedThreads.includes(t));
  const visibleThreads = activeTab === 'Focused' ? focusedThreads : otherThreads;
  const selectedThread = threads.find((t) => t.id === selectedThreadId) || null;

  const handleSendReply = async () => {
    if (!selectedThreadId) return;
    if (!replyText.trim() && !replyFile) return;
    setSending(true);
    setError(null);
    try {
      const created = await sendMessage(selectedThreadId, replyText || '(attachment)', replyFile);
      setMessages((prev) => [...prev, created]);
      setReplyText('');
      setReplyFile(null);
      if (replyFileInputRef.current) replyFileInputRef.current.value = '';
      const refreshed = await getMyThreads();
      setThreads(refreshed);
    } catch (err: any) {
      setError(err?.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const handleOpenAttachment = async (path: string) => {
    try {
      const url = await getAttachmentUrl(path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert(err?.message || 'Could not open attachment.');
    }
  };

  const handleComposeSend = async () => {
    if (!composeStudentId || (!composeBody.trim() && !composeFile)) {
      alert('Pick a student and write a message.');
      return;
    }
    setComposing(true);
    setError(null);
    try {
      const { threadId } = await createThread(
        composeStudentId,
        composeSubject || 'New message',
        composeBody || '(attachment)',
        composeFile
      );
      setComposeSubject('');
      setComposeBody('');
      setComposeFile(null);
      if (composeFileInputRef.current) composeFileInputRef.current.value = '';
      await loadThreads();
      setSelectedThreadId(threadId);
      setActiveView('inbox');
    } catch (err: any) {
      setError(err?.message || 'Could not send message.');
    } finally {
      setComposing(false);
    }
  };

  return (
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
              Messages &gt; {activeView === 'inbox' ? 'Inbox' : activeView === 'broadcast' ? 'Class Communication' : 'New Message'}
            </div>
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

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* VIEW 1: INBOX */}
        {activeView === 'inbox' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', minHeight: '650px', alignItems: 'stretch' }}>

            {/* THREAD LIST */}
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
                {loadingThreads && (
                  <div style={{ padding: '16px', fontSize: '12px', color: '#64748b' }}>Loading…</div>
                )}
                {!loadingThreads && visibleThreads.length === 0 && (
                  <div style={{ padding: '16px', fontSize: '12px', color: '#64748b' }}>No conversations here.</div>
                )}
                {visibleThreads.map((thread) => {
                  const isSelected = selectedThreadId === thread.id;
                  const { time } = formatTimestamp(thread.lastMessageAt);
                  return (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                        borderLeft: isSelected ? '4px solid #002b49' : '4px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{thread.parentName}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{time}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                        Re: {thread.studentName}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {thread.subject}
                        {thread.unreadCount > 0 && (
                          <span style={{ marginLeft: '6px', backgroundColor: '#002b49', color: '#fff', padding: '1px 6px', borderRadius: '8px', fontSize: '10px' }}>
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                        {thread.preview || '—'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CONVERSATION PANEL */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {!selectedThread ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  Select a conversation to view messages.
                </div>
              ) : (
                <>
                  <div>
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{selectedThread.subject}</h2>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          <strong>{selectedThread.parentName}</strong> · Re: {selectedThread.studentName}
                        </div>
                      </div>
                    </div>

                    {loadingMessages && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Loading…</div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                      {messages.map((m) => {
                        const { time, date } = formatTimestamp(m.createdAt);
                        return (
                          <div
                            key={m.id}
                            style={{
                              alignSelf: m.isMine ? 'flex-end' : 'flex-start',
                              maxWidth: '80%',
                              backgroundColor: m.isMine ? '#002b49' : '#f1f5f9',
                              color: m.isMine ? '#ffffff' : '#0f172a',
                              padding: '12px 14px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              lineHeight: '1.5',
                            }}
                          >
                            <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px', fontWeight: 'bold' }}>
                              {m.senderName} · {date}, {time}
                            </div>
                            <div style={{ whiteSpace: 'pre-line' }}>{m.content}</div>

                            {m.attachmentPath && m.attachmentName && (
                              <div
                                onClick={() => handleOpenAttachment(m.attachmentPath!)}
                                style={{
                                  marginTop: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  backgroundColor: m.isMine ? 'rgba(255,255,255,0.12)' : '#ffffff',
                                  border: m.isMine ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                }}
                              >
                                <span style={{ fontWeight: 'bold', color: m.isMine ? '#ffffff' : '#dc2626' }}>📎</span>
                                <div>
                                  <strong style={{ display: 'block' }}>{m.attachmentName}</strong>
                                  <span style={{ fontSize: '10px', opacity: 0.75 }}>{formatBytes(m.attachmentSize)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {!loadingMessages && messages.length === 0 && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>No messages yet.</div>
                      )}
                    </div>
                  </div>

                  {/* REPLY EDITOR */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', backgroundColor: '#ffffff' }}>
                      <input
                        type="file"
                        ref={replyFileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => setReplyFile(e.target.files?.[0] ?? null)}
                      />
                      <button
                        type="button"
                        onClick={() => replyFileInputRef.current?.click()}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}
                      >
                        📎 Attach File
                      </button>
                      {replyFile && (
                        <span style={{ fontSize: '11px', color: '#0f172a', alignSelf: 'center' }}>
                          {replyFile.name} <button type="button" onClick={() => { setReplyFile(null); if (replyFileInputRef.current) replyFileInputRef.current.value = ''; }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '11px' }}>×</button>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Type your reply here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', padding: '12px', fontSize: '12px', backgroundColor: 'transparent', resize: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                      <button
                        type="button"
                        disabled={sending || (!replyText.trim() && !replyFile)}
                        onClick={handleSendReply}
                        style={{ padding: '6px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: sending ? 'wait' : 'pointer', opacity: sending || (!replyText.trim() && !replyFile) ? 0.6 : 1 }}
                      >
                        {sending ? 'Sending…' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: BROADCAST (not wired) */}
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
              <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b' }}>
                Send a broadcast announcement to students or parents connected to your class.
              </p>

              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: 'bold' }}>
                Broadcast isn't available yet — use New Message to reach a specific parent.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: COMPOSE */}
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Student (their parent will be the recipient)</label>
                <select
                  value={composeStudentId}
                  onChange={(e) => setComposeStudentId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                >
                  {students.length === 0 && <option value="">No students available</option>}
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.customId})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Subject</label>
                <input
                  type="text"
                  placeholder="Enter message subject..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Message</label>
                <textarea
                  rows={6}
                  placeholder="Type your message here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', padding: '12px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input
                  type="file"
                  ref={composeFileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => setComposeFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => composeFileInputRef.current?.click()}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                >
                  📎 Attach File
                </button>
                {composeFile && (
                  <span style={{ marginLeft: '10px', fontSize: '11px', color: '#0f172a' }}>
                    {composeFile.name}{' '}
                    <button type="button" onClick={() => { setComposeFile(null); if (composeFileInputRef.current) composeFileInputRef.current.value = ''; }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '11px' }}>×</button>
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveView('inbox')}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={composing}
                  onClick={handleComposeSend}
                  style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: composing ? 'wait' : 'pointer', opacity: composing ? 0.7 : 1 }}
                >
                  {composing ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};