import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  priority: 'Normal' | 'High' | 'Urgent' | 'Important';
  status: 'Draft' | 'Scheduled' | 'Published' | 'Archived';
  postedAt: string;
  scheduledAt: string | null;
  reach: number;
  read: number;
  attachmentCount: number;
}

interface AttachmentRow {
  id: string;
  announcement_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
}

interface AudienceCounts {
  all: number;
  parents: number;
  teachers: number;
  students: number;
}

interface NewAnnouncementForm {
  title: string;
  body: string;
  priority: 'Normal' | 'High' | 'Urgent';
  audience: string;
  publishMode: 'immediate' | 'scheduled';
  scheduledAt: string;
}

interface DirectMessageForm {
  recipient_group: string;
  subject: string;
  body: string;
}

const emptyForm: NewAnnouncementForm = {
  title: '',
  body: '',
  priority: 'Normal',
  audience: 'All Users',
  publishMode: 'immediate',
  scheduledAt: '',
};

const emptyDmForm: DirectMessageForm = {
  recipient_group: 'All Parents',
  subject: '',
  body: '',
};

const fmtDate = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtDateTime = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const fmtBytes = (n: number) => {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const publicAttachmentUrl = (path: string) =>
  supabase.storage.from('announcement-attachments').getPublicUrl(path).data.publicUrl;

export const Messages: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'newAnnouncement' | 'sendMessage' | 'selectAudience' | 'deleteConfirm' | 'discardConfirm' | 'history' | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const [form, setForm] = useState<NewAnnouncementForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<AttachmentRow[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [dmForm, setDmForm] = useState<DirectMessageForm>(emptyDmForm);
  const [isSendingDM, setIsSendingDM] = useState(false);

  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const [audienceCounts, setAudienceCounts] = useState<AudienceCounts>({ all: 0, parents: 0, teachers: 0, students: 0 });

  useEffect(() => {
    fetchAnnouncements();
    fetchAudienceCounts();
  }, []);

  const fetchAttachmentsFor = async (ids: string[]) => {
    if (ids.length === 0) return {} as Record<string, number>;
    const { data, error } = await supabase
      .from('announcement_attachments')
      .select('announcement_id')
      .in('announcement_id', ids);
    if (error) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    (data || []).forEach((r: any) => {
      counts[r.announcement_id] = (counts[r.announcement_id] || 0) + 1;
    });
    return counts;
  };

  const mapRow = (row: any, counts: Record<string, number>): Announcement => ({
    id: row.id,
    title: row.title || 'Untitled',
    body: row.body || '',
    audience: row.audience || '—',
    priority: (row.priority as Announcement['priority']) || 'Normal',
    status: (row.status as Announcement['status']) || 'Published',
    postedAt: row.posted_at,
    scheduledAt: row.scheduled_at || null,
    reach: Number(row.reach_percent ?? 0),
    read: Number(row.read_percent ?? 0),
    attachmentCount: counts[row.id] || 0,
  });

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .neq('status', 'Archived')
        .order('posted_at', { ascending: false });
      if (error) throw error;

      const ids = (data || []).map((r: any) => r.id);
      const counts = await fetchAttachmentsFor(ids);
      setAnnouncements((data || []).map((r: any) => mapRow(r, counts)));
    } catch (err: any) {
      console.error('fetchAnnouncements:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllAnnouncements = async () => {
    try {
      setIsLoadingHistory(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('posted_at', { ascending: false, nullsFirst: false });
      if (error) throw error;

      const ids = (data || []).map((r: any) => r.id);
      const counts = await fetchAttachmentsFor(ids);
      setAllAnnouncements((data || []).map((r: any) => mapRow(r, counts)));
    } catch (err: any) {
      console.error('fetchAllAnnouncements:', err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchAudienceCounts = async () => {
    try {
      const [parentsRes, teachersRes, studentsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'parent'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('students').select('*', { count: 'exact', head: true }),
      ]);
      const parents = parentsRes.count || 0;
      const teachers = teachersRes.count || 0;
      const students = studentsRes.count || 0;
      setAudienceCounts({ parents, teachers, students, all: parents + teachers + students });
    } catch (err) {
      console.error('fetchAudienceCounts failed', err);
    }
  };

  const activeCount = announcements.filter(a => a.status === 'Published').length;
  const scheduledCount = announcements.filter(a => a.status === 'Scheduled').length;
  const draftCount = announcements.filter(a => a.status === 'Draft').length;
  const attentionCount = announcements.filter(a => a.status === 'Published' && a.read < 60).length;

  const publishedAnnouncements = announcements.filter(a => a.status === 'Published');
  const avgReach = publishedAnnouncements.length
    ? Math.round(publishedAnnouncements.reduce((acc, a) => acc + a.reach, 0) / publishedAnnouncements.length * 10) / 10
    : 0;
  const avgRead = publishedAnnouncements.length
    ? Math.round(publishedAnnouncements.reduce((acc, a) => acc + a.read, 0) / publishedAnnouncements.length * 10) / 10
    : 0;
  const avgUnread = Math.max(0, Math.round((100 - avgRead) * 10) / 10);

  const lowReadAnnouncements = publishedAnnouncements.filter(a => a.read < 60);

  const audienceEngagement = useMemo(() => {
    const groups: Record<string, { total: number; sum: number }> = {};
    publishedAnnouncements.forEach(a => {
      const key = a.audience || 'Other';
      if (!groups[key]) groups[key] = { total: 0, sum: 0 };
      groups[key].total += 1;
      groups[key].sum += a.read;
    });
    return Object.entries(groups).map(([label, g]) => ({ label, avg: Math.round(g.sum / g.total) }));
  }, [publishedAnnouncements]);

  const nextScheduled = useMemo(() => {
    return announcements
      .filter(a => a.status === 'Scheduled' && a.scheduledAt)
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())[0] || null;
  }, [announcements]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const valid: File[] = [];
    for (const f of Array.from(files)) {
      if (f.size > 10 * 1024 * 1024) {
        alert(`${f.name} exceeds 10MB and was skipped.`);
        continue;
      }
      valid.push(f);
    }
    setPendingFiles(prev => [...prev, ...valid]);
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const loadExistingAttachments = async (announcementId: string) => {
    const { data, error } = await supabase
      .from('announcement_attachments')
      .select('*')
      .eq('announcement_id', announcementId);
    if (error) { console.error(error.message); return; }
    setExistingAttachments((data || []) as AttachmentRow[]);
  };

  const uploadAttachmentsFor = async (announcementId: string) => {
    for (const file of pendingFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${announcementId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from('announcement-attachments')
        .upload(path, file, { upsert: false });
      if (upErr) { console.error('Upload failed:', upErr.message); continue; }
      await supabase.from('announcement_attachments').insert([{
        announcement_id: announcementId,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
      }]);
    }
  };

  const deleteExistingAttachment = async (att: AttachmentRow) => {
    if (!confirm(`Remove ${att.file_name}?`)) return;
    try {
      await supabase.storage.from('announcement-attachments').remove([att.file_path]);
      await supabase.from('announcement_attachments').delete().eq('id', att.id);
      setExistingAttachments(prev => prev.filter(a => a.id !== att.id));
    } catch (err: any) {
      alert('Failed to remove attachment: ' + err.message);
    }
  };

  const openNewAnnouncement = () => {
    setForm(emptyForm);
    setEditingId(null);
    setPendingFiles([]);
    setExistingAttachments([]);
    setActiveModal('newAnnouncement');
  };

  const openEditAnnouncement = async (a: Announcement) => {
    setForm({
      title: a.title,
      body: a.body,
      priority: a.priority === 'Important' || a.priority === 'Urgent' ? (a.priority as any) : (a.priority as any) || 'Normal',
      audience: a.audience,
      publishMode: a.status === 'Scheduled' ? 'scheduled' : 'immediate',
      scheduledAt: a.scheduledAt ? new Date(a.scheduledAt).toISOString().slice(0, 16) : '',
    });
    setEditingId(a.id);
    setPendingFiles([]);
    setExistingAttachments([]);
    setActiveModal('newAnnouncement');
    await loadExistingAttachments(a.id);
  };

  const handleSaveAnnouncement = async () => {
    if (!form.title.trim()) { alert('Title is required.'); return; }
    if (!form.body.trim()) { alert('Message body is required.'); return; }
    if (form.publishMode === 'scheduled' && !form.scheduledAt) {
      alert('Please pick a scheduled date/time.');
      return;
    }

    try {
      setIsSaving(true);
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id || null;

      const isScheduled = form.publishMode === 'scheduled';
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        audience: form.audience,
        priority: form.priority,
        status: isScheduled ? 'Scheduled' : 'Published',
        posted_by: userId,
        posted_at: isScheduled ? null : new Date().toISOString(),
        scheduled_at: isScheduled ? new Date(form.scheduledAt).toISOString() : null,
      };

      if (editingId) {
        const { error } = await supabase.from('announcements').update(payload).eq('id', editingId);
        if (error) throw error;
        if (pendingFiles.length > 0) await uploadAttachmentsFor(editingId);
        alert('Announcement updated.');
      } else {
        const { data: inserted, error } = await supabase
          .from('announcements')
          .insert([{ ...payload, reach_percent: 0, read_percent: 0 }])
          .select()
          .single();
        if (error) throw error;
        if (inserted?.id && pendingFiles.length > 0) await uploadAttachmentsFor(inserted.id);
        alert(isScheduled ? 'Announcement scheduled.' : 'Announcement published.');
      }

      setActiveModal(null);
      setForm(emptyForm);
      setEditingId(null);
      setPendingFiles([]);
      setExistingAttachments([]);
      await fetchAnnouncements();
    } catch (err: any) {
      alert('Failed to save announcement: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteTarget) return;
    try {
      setIsBusy(true);
      const { data: atts } = await supabase
        .from('announcement_attachments')
        .select('file_path')
        .eq('announcement_id', deleteTarget.id);
      if (atts && atts.length > 0) {
        const paths = atts.map((a: any) => a.file_path);
        await supabase.storage.from('announcement-attachments').remove(paths);
      }
      const { error } = await supabase.from('announcements').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
      setActiveModal(null);
      await fetchAnnouncements();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleArchiveAnnouncement = async () => {
    if (!deleteTarget) return;
    try {
      setIsBusy(true);
      const { error } = await supabase
        .from('announcements')
        .update({ status: 'Archived' })
        .eq('id', deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
      setActiveModal(null);
      await fetchAnnouncements();
    } catch (err: any) {
      alert('Failed to archive: ' + err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const openSendMessage = () => {
    setDmForm(emptyDmForm);
    setActiveModal('sendMessage');
  };

  const handleSendDirectMessage = async () => {
    if (!dmForm.subject.trim()) { alert('Subject is required.'); return; }
    if (!dmForm.body.trim()) { alert('Message body is required.'); return; }
    try {
      setIsSendingDM(true);
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id || null;

      const recipientCount =
        dmForm.recipient_group === 'All Parents' ? audienceCounts.parents
        : dmForm.recipient_group === 'All Teachers' ? audienceCounts.teachers
        : dmForm.recipient_group === 'All Staff' ? audienceCounts.teachers
        : dmForm.recipient_group === 'All Users' ? audienceCounts.all
        : 0;

      const { error } = await supabase.from('direct_messages').insert([{
        sender_id: userId,
        recipient_group: dmForm.recipient_group,
        subject: dmForm.subject.trim(),
        body: dmForm.body.trim(),
        delivered_count: recipientCount,
      }]);
      if (error) throw error;

      setActiveModal(null);
      setDmForm(emptyDmForm);
      alert(`Message sent to ${recipientCount} recipients in ${dmForm.recipient_group}.`);
    } catch (err: any) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setIsSendingDM(false);
    }
  };

  const openHistory = async () => {
    setActiveModal('history');
    await fetchAllAnnouncements();
  };

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: '8px',
    border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box',
  };

  const statusBadge = (status: Announcement['status']) => {
    const map: Record<Announcement['status'], { bg: string; fg: string }> = {
      Published: { bg: '#dcfce7', fg: '#166534' },
      Scheduled: { bg: '#dbeafe', fg: '#1e40af' },
      Draft: { bg: '#f1f5f9', fg: '#475569' },
      Archived: { bg: '#fef3c7', fg: '#92400e' },
    };
    const c = map[status];
    return (
      <span style={{ backgroundColor: c.bg, color: c.fg, padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Announcements</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Create, manage and monitor school-wide announcements.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={openHistory} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Communication History
            </button>
            <button onClick={openSendMessage} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Send Direct Message
            </button>
            <button onClick={openNewAnnouncement} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Announcement
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACTIVE</span>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{isLoading ? '…' : activeCount}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SCHEDULED</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{isLoading ? '…' : scheduledCount}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>DRAFTS</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{isLoading ? '…' : draftCount}</div>
          </div>
          <div style={{ ...cardStyle, backgroundColor: attentionCount > 0 ? '#fef2f2' : '#ffffff', borderColor: attentionCount > 0 ? '#fecaca' : '#e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: attentionCount > 0 ? '#991b1b' : '#64748b', textTransform: 'uppercase' }}>ATTENTION REQUIRED</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={attentionCount > 0 ? '#dc2626' : '#64748b'} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: attentionCount > 0 ? '#dc2626' : '#0f172a', marginTop: '8px' }}>{isLoading ? '…' : attentionCount}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Global Reach (Published)</h3>
            {publishedAnnouncements.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '11px' }}>
                N/A (No published announcements yet)
              </div>
            ) : (
              <>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
                  <div style={{ width: `${avgRead}%`, height: '100%', backgroundColor: '#002b49' }}></div>
                  <div style={{ width: `${avgUnread}%`, height: '100%', backgroundColor: '#93c5fd' }}></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div><span style={{ color: '#64748b', fontSize: '11px' }}>Delivered</span><div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>{avgReach}%</div></div>
                  <div><span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold' }}>● Read</span><div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>{avgRead}%</div></div>
                  <div><span style={{ color: '#1e40af', fontSize: '11px', fontWeight: 'bold' }}>● Unread</span><div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>{avgUnread}%</div></div>
                  <div><span style={{ color: '#64748b', fontSize: '11px' }}>Published</span><div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>{publishedAnnouncements.length}</div></div>
                </div>
              </>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Communication Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              {lowReadAnnouncements.length === 0 && publishedAnnouncements.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>N/A (No data yet)</div>
              )}
              {lowReadAnnouncements.length === 0 && publishedAnnouncements.length > 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#166534', fontSize: '11px' }}>All published announcements are above the read-rate threshold.</div>
              )}
              {lowReadAnnouncements.slice(0, 3).map(a => (
                <div key={a.id} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                  <strong style={{ color: '#d97706', display: 'block' }}>Low Read Rate Detected</strong>
                  <span style={{ color: '#475569' }}>"{a.title}" is at {a.read}% read rate.</span>
                </div>
              ))}
              {lowReadAnnouncements.length > 3 && (
                <div style={{ textAlign: 'right', color: '#1e40af', fontWeight: 'bold' }}>+{lowReadAnnouncements.length - 3} more</div>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Audience Engagement</h3>
            {audienceEngagement.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '11px' }}>N/A (No published announcements yet)</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {audienceEngagement.map(group => (
                  <div key={group.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>{group.label}</span><strong>{group.avg}%</strong>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${group.avg}%`, height: '100%', backgroundColor: '#002b49' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recent Announcements</h3>
            <span onClick={openHistory} style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>View All</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading announcements…</div>
          ) : announcements.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>
              N/A (No announcements yet — click "Create Announcement" to start)
            </div>
          ) : (
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
                {announcements.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#0f172a' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {item.title}
                        {item.attachmentCount > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                            📎 {item.attachmentCount}
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>{item.audience}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        backgroundColor: item.priority === 'Urgent' ? '#fee2e2' : (item.priority === 'Important' || item.priority === 'High') ? '#fef3c7' : '#e0e7ff',
                        color: item.priority === 'Urgent' ? '#991b1b' : (item.priority === 'Important' || item.priority === 'High') ? '#92400e' : '#3730a3',
                        padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold'
                      }}>
                        {item.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>
                      {item.status === 'Scheduled' ? `Scheduled · ${fmtDate(item.scheduledAt)}` : item.status === 'Draft' ? 'Draft' : fmtDate(item.postedAt)}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 'bold' }}>{item.reach}%</td>
                    <td style={{ padding: '14px 20px', fontWeight: 'bold', color: item.read < 60 ? '#dc2626' : '#166534' }}>{item.read}%</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => openEditAnnouncement(item)} style={{ border: 'none', background: 'none', color: '#1e40af', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => { setDeleteTarget(item); setActiveModal('deleteConfirm'); }} style={{ border: 'none', background: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {nextScheduled && (
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3730a3' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{nextScheduled.title}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Target: {nextScheduled.audience} • {fmtDateTime(nextScheduled.scheduledAt)}</div>
              </div>
            </div>
            <button onClick={() => openEditAnnouncement(nextScheduled)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Edit</button>
          </div>
        )}

        {activeModal === 'newAnnouncement' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '840px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {editingId ? 'Edit Announcement' : 'New Announcement'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {editingId ? 'Update the details and re-save.' : 'Compose and distribute school-wide updates.'}
                  </p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Announcement Title</label>
                      <input type="text" placeholder="Enter clear, concise title" value={form.title}
                        onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Priority</label>
                      <select value={form.priority}
                        onChange={(e) => setForm(f => ({ ...f, priority: e.target.value as NewAnnouncementForm['priority'] }))}
                        style={inputStyle}>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Message</label>
                    <textarea placeholder="Compose your announcement here..." value={form.body}
                      onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
                      style={{ width: '100%', height: '160px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '12px', resize: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", marginTop: '4px' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>
                      Attachments {pendingFiles.length + existingAttachments.length > 0 && `(${pendingFiles.length + existingAttachments.length})`}
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFilesSelected(e.dataTransfer.files); }}
                      style={{
                        border: dragActive ? '2px dashed #002b49' : '2px dashed #cbd5e1',
                        borderRadius: '8px', padding: '20px', textAlign: 'center',
                        backgroundColor: dragActive ? '#f0f9ff' : '#f8fafc',
                        marginTop: '4px', cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                        Click to upload or drag and drop
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                        PDF, JPG, PNG up to 10MB
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => { handleFilesSelected(e.target.files); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      style={{ display: 'none' }}
                    />

                    {(existingAttachments.length > 0 || pendingFiles.length > 0) && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {existingAttachments.map(att => (
                          <div key={att.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}>
                            <a href={publicAttachmentUrl(att.file_path)} target="_blank" rel="noreferrer"
                              style={{ color: '#1e40af', fontWeight: 'bold', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              📎 {att.file_name}
                            </a>
                            <span style={{ color: '#64748b', marginRight: '10px' }}>{fmtBytes(att.file_size)}</span>
                            <button onClick={() => deleteExistingAttachment(att)}
                              style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', padding: 0 }}>
                              ✕
                            </button>
                          </div>
                        ))}
                        {pendingFiles.map((f, i) => (
                          <div key={`pending-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}>
                            <span style={{ color: '#1e40af', fontWeight: 'bold', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              📎 {f.name} <em style={{ fontWeight: 'normal', color: '#64748b' }}>(pending)</em>
                            </span>
                            <span style={{ color: '#64748b', marginRight: '10px' }}>{fmtBytes(f.size)}</span>
                            <button onClick={() => removePendingFile(i)}
                              style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', padding: 0 }}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>AUDIENCE</span>
                      <button onClick={() => setActiveModal('selectAudience')} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Edit</button>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>{form.audience}</div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>RECIPIENT ESTIMATE</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '4px 0' }}>
                      {form.audience === 'All Users' ? audienceCounts.all
                        : form.audience === 'Parents' ? audienceCounts.parents
                        : form.audience === 'Teachers' ? audienceCounts.teachers
                        : form.audience === 'Students' ? audienceCounts.students
                        : 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>● Active accounts</div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>PUBLISHING</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                      <input type="radio" name="pub" checked={form.publishMode === 'immediate'}
                        onChange={() => setForm(f => ({ ...f, publishMode: 'immediate' }))} /> Publish Immediately
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                      <input type="radio" name="pub" checked={form.publishMode === 'scheduled'}
                        onChange={() => setForm(f => ({ ...f, publishMode: 'scheduled' }))} /> Schedule for Later
                    </label>
                    {form.publishMode === 'scheduled' && (
                      <input type="datetime-local" value={form.scheduledAt}
                        onChange={(e) => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                        style={{ ...inputStyle, marginTop: '10px' }} />
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('discardConfirm')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveAnnouncement} disabled={isSaving}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', opacity: isSaving ? 0.6 : 1 }}>
                  {isSaving ? 'Saving…' : editingId ? 'Update →' : form.publishMode === 'scheduled' ? 'Schedule →' : 'Publish →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'selectAudience' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '800px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Select Audience</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Target your communication precisely.</p>
                </div>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>TARGET GROUPS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'All Users', count: audienceCounts.all },
                    { label: 'Parents', count: audienceCounts.parents },
                    { label: 'Teachers', count: audienceCounts.teachers },
                    { label: 'Students', count: audienceCounts.students },
                  ].map(g => {
                    const selected = form.audience === g.label;
                    return (
                      <div key={g.label} onClick={() => setForm(f => ({ ...f, audience: g.label }))}
                        style={{
                          border: selected ? '2px solid #002b49' : '1px solid #cbd5e1',
                          borderRadius: '10px', padding: '10px', cursor: 'pointer',
                          backgroundColor: selected ? '#f0f9ff' : '#ffffff',
                        }}>
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{g.label}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{g.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Audience</button>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'sendMessage' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>New Direct Message</h3>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>To</label>
                  <select value={dmForm.recipient_group}
                    onChange={(e) => setDmForm(f => ({ ...f, recipient_group: e.target.value }))}
                    style={{ ...inputStyle, padding: '10px 12px' }}>
                    <option>All Parents</option>
                    <option>All Teachers</option>
                    <option>All Staff</option>
                    <option>All Users</option>
                  </select>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px', fontSize: '11px', color: '#1e40af', marginBottom: '16px' }}>
                  ℹ️ This message will be sent to approximately <strong>{
                    dmForm.recipient_group === 'All Parents' ? audienceCounts.parents
                    : dmForm.recipient_group === 'All Teachers' ? audienceCounts.teachers
                    : dmForm.recipient_group === 'All Staff' ? audienceCounts.teachers
                    : audienceCounts.all
                  }</strong> recipients.
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Subject</label>
                  <input type="text" placeholder="Enter message subject..." value={dmForm.subject}
                    onChange={(e) => setDmForm(f => ({ ...f, subject: e.target.value }))}
                    style={inputStyle} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Message</label>
                  <textarea placeholder="Type your message here..." value={dmForm.body}
                    onChange={(e) => setDmForm(f => ({ ...f, body: e.target.value }))}
                    style={{ ...inputStyle, height: '120px', resize: 'none', fontFamily: "'Inter', sans-serif" }} />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSendDirectMessage} disabled={isSendingDM}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', opacity: isSendingDM ? 0.6 : 1 }}>
                  {isSendingDM ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'history' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '960px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Communication History</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>All announcements including archived and drafts.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '0', maxHeight: '70vh', overflowY: 'auto' }}>
                {isLoadingHistory ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading history…</div>
                ) : allAnnouncements.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>N/A (No history)</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Title</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Audience</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Priority</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Read</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allAnnouncements.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {a.title}
                              {a.attachmentCount > 0 && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                                  📎 {a.attachmentCount}
                                </span>
                              )}
                            </span>
                          </td>
                          <td style={{ padding: '12px 20px', color: '#334155' }}>{a.audience}</td>
                          <td style={{ padding: '12px 20px' }}>{statusBadge(a.status)}</td>
                          <td style={{ padding: '12px 20px', color: '#334155' }}>{a.priority}</td>
                          <td style={{ padding: '12px 20px', color: '#64748b' }}>{fmtDate(a.postedAt || a.scheduledAt)}</td>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold', color: a.read < 60 ? '#dc2626' : '#166534' }}>{a.read}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'deleteConfirm' && deleteTarget && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '480px' }}>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Delete Announcement?</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  "<strong>{deleteTarget.title}</strong>" will be removed. Copies sent via email cannot be recalled.
                </p>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginTop: '16px', fontSize: '11px', color: '#334155', textAlign: 'left' }}>
                  💡 <strong>Recommendation:</strong> Consider archiving this announcement instead to maintain historical records.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => { setActiveModal(null); setDeleteTarget(null); }} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleArchiveAnnouncement} disabled={isBusy} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', opacity: isBusy ? 0.6 : 1 }}>Archive Instead</button>
                <button onClick={handleDeleteAnnouncement} disabled={isBusy} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', opacity: isBusy ? 0.6 : 1 }}>Delete Permanently</button>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'discardConfirm' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '420px', textAlign: 'center' }}>
              <div style={{ padding: '24px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  {editingId ? 'Discard Changes?' : 'Discard Draft?'}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Are you sure? This action cannot be undone.
                </p>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={() => setActiveModal('newAnnouncement')} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Keep Editing</button>
                <button onClick={() => { setForm(emptyForm); setEditingId(null); setPendingFiles([]); setExistingAttachments([]); setActiveModal(null); }} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Discard</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};