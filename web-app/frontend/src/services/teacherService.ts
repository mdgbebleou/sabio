import { supabase } from './supabase';

export interface TeacherClass {
  id: string;
  name: string;
  grade: string | null;
}

export interface TeacherStudent {
  id: string;
  customId: string;
  firstName: string;
  lastName: string;
  name: string;
  initials: string;
  gender: string;
  age: number | null;
  status: string;
  avatar: string | null;
  classId: string | null;
  className: string | null;
  parentId: string | null;
  attendanceRate: number | null;
  averageScore: number | null;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface RosterEntry {
  studentId: string;
  name: string;
  customId: string;
  initials: string;
  avatar: string | null;
  status: AttendanceStatus;
  remark: string;
}

export interface AttendanceHistoryEntry {
  id: string;
  rawDate: string;
  date: string;
  classId: string;
  className: string;
  total: number;
  present: number;
  absent: number;
  late: number;
}

export type EventType = 'Meeting' | 'Exam' | 'Activity' | 'Deadline';

export interface CalendarEventRow {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  location: string;
  classId: string | null;
  isSchoolWide: boolean;
  createdBy: string | null;
}

export type ReportType = 'Progress Report' | 'Term Report' | 'Behaviour Report' | 'Other';

export interface StudentReportRow {
  id: string;
  studentId: string;
  title: string;
  reportType: ReportType;
  term: string | null;
  academicYear: string | null;
  notes: string | null;
  filePath: string;
  fileName: string | null;
  createdAt: string;
}

export interface GuardianInfo {
  name: string;
  phone: string | null;
  email: string | null;
}

export interface StudentScoreRow {
  id: string;
  subject: string;
  assessment: string;
  term: string;
  ca: number;
  exam: number;
  total: number;
}

const must = <T,>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? ([] as unknown)) as T;
};

export async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('You are not signed in.');
  return data.user.id;
}

const initialsOf = (first?: string | null, last?: string | null) =>
  `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase();

const ageFrom = (dob?: string | null): number | null => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};

const toNum = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

type Row = Record<string, unknown>;

const mapStudent = (r: Row): TeacherStudent => ({
  id: r.id as string,
  customId: (r.custom_id as string) || '',
  firstName: (r.first_name as string) || '',
  lastName: (r.last_name as string) || '',
  name: `${(r.first_name as string) || ''} ${(r.last_name as string) || ''}`.trim(),
  initials: initialsOf(r.first_name as string, r.last_name as string),
  gender: (r.gender as string) || '—',
  age: ageFrom(r.dob as string | null),
  status: (r.status as string) || '',
  avatar: (r.avatar as string) || null,
  classId: (r.class_id as string) || null,
  className: (r.class_name as string) || null,
  parentId: (r.parent_id as string) || null,
  attendanceRate: toNum(r.attendance_rate),
  averageScore: toNum(r.average_score),
});

export const performanceOf = (avg: number | null): 'Excellent' | 'Good' | 'Average' | 'Needs Attention' | 'No Data' => {
  if (avg === null) return 'No Data';
  if (avg >= 85) return 'Excellent';
  if (avg >= 70) return 'Good';
  if (avg >= 62) return 'Average';
  return 'Needs Attention';
};

export async function getMyClasses(): Promise<TeacherClass[]> {
  const uid = await currentUserId();
  const rows = must<Row[]>(
    await supabase.from('classes').select('id, name, grade').eq('class_teacher_id', uid).order('name')
  );
  return rows.map((c) => ({ id: c.id as string, name: c.name as string, grade: (c.grade as string) || null }));
}

export async function getMyStudents(classId?: string): Promise<TeacherStudent[]> {
  const uid = await currentUserId();
  let q = supabase.from('teacher_student_overview').select('*').eq('class_teacher_id', uid);
  if (classId) q = q.eq('class_id', classId);
  const rows = must<Row[]>(await q.order('first_name'));
  return rows.map(mapStudent);
}

export async function getGuardian(parentId: string | null): Promise<GuardianInfo | null> {
  if (!parentId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('first_name, last_name, full_name, primary_phone, email')
    .eq('id', parentId)
    .maybeSingle();
  if (!data) return null;
  const name = (data.full_name as string) || `${data.first_name || ''} ${data.last_name || ''}`.trim();
  return { name: name || 'Guardian', phone: (data.primary_phone as string) || null, email: (data.email as string) || null };
}

export async function getStudentScores(studentId: string): Promise<StudentScoreRow[]> {
  const rows = must<Row[]>(
    await supabase
      .from('scores')
      .select('id, ca_score, exam_score, total_score, assessments(title, subject, term)')
      .eq('student_id', studentId)
  );
  return rows.map((r) => {
    const a = (r.assessments as Row | null) || {};
    return {
      id: r.id as string,
      subject: (a.subject as string) || '',
      assessment: (a.title as string) || '',
      term: (a.term as string) || '',
      ca: Number(r.ca_score),
      exam: Number(r.exam_score),
      total: Number(r.total_score),
    };
  });
}

export async function getRoster(classId: string, date: string): Promise<{ recorded: boolean; entries: RosterEntry[] }> {
  const students = must<Row[]>(
    await supabase
      .from('students')
      .select('id, custom_id, first_name, last_name, avatar')
      .eq('class_id', classId)
      .order('first_name')
  );

  const { data: session } = await supabase
    .from('attendance_sessions')
    .select('id')
    .eq('class_id', classId)
    .eq('date', date)
    .maybeSingle();

  const saved = new Map<string, Row>();
  if (session) {
    const recs = must<Row[]>(
      await supabase.from('attendance_records').select('student_id, status, remark').eq('session_id', session.id)
    );
    recs.forEach((r) => saved.set(r.student_id as string, r));
  }

  return {
    recorded: !!session,
    entries: students.map((s) => {
      const r = saved.get(s.id as string);
      return {
        studentId: s.id as string,
        name: `${s.first_name} ${s.last_name}`.trim(),
        customId: (s.custom_id as string) || '',
        initials: initialsOf(s.first_name as string, s.last_name as string),
        avatar: (s.avatar as string) || null,
        status: ((r?.status as AttendanceStatus) || 'Present') as AttendanceStatus,
        remark: ((r?.remark as string) || ''),
      };
    }),
  };
}

export async function saveAttendance(classId: string, date: string, entries: RosterEntry[]): Promise<void> {
  const uid = await currentUserId();
  const session = must<Row>(
    await supabase
      .from('attendance_sessions')
      .upsert({ class_id: classId, date, recorded_by: uid }, { onConflict: 'class_id,date' })
      .select('id')
      .single()
  );
  const payload = entries.map((e) => ({
    session_id: session.id,
    student_id: e.studentId,
    status: e.status,
    remark: e.remark || null,
  }));
  const { error } = await supabase.from('attendance_records').upsert(payload, { onConflict: 'session_id,student_id' });
  if (error) throw new Error(error.message);
}

export async function getAttendanceHistory(classId?: string): Promise<AttendanceHistoryEntry[]> {
  let q = supabase
    .from('attendance_sessions')
    .select('id, date, class_id, classes(name), attendance_records(status)')
    .order('date', { ascending: false })
    .limit(60);
  if (classId) q = q.eq('class_id', classId);
  const sessions = must<Row[]>(await q);

  const classIds = Array.from(new Set(sessions.map((s) => s.class_id as string)));
  const sizes = new Map<string, number>();
  await Promise.all(
    classIds.map(async (cid) => {
      const { count } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('class_id', cid);
      sizes.set(cid, count || 0);
    })
  );

  return sessions.map((s) => {
    const recs = (s.attendance_records as Row[]) || [];
    const d = new Date(`${s.date as string}T00:00:00`);
    return {
      id: s.id as string,
      rawDate: s.date as string,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      classId: s.class_id as string,
      className: ((s.classes as Row | null)?.name as string) || '',
      total: sizes.get(s.class_id as string) || recs.length,
      present: recs.filter((r) => r.status === 'Present').length,
      absent: recs.filter((r) => r.status === 'Absent').length,
      late: recs.filter((r) => r.status === 'Late').length,
    };
  });
}

const mapEvent = (r: Row): CalendarEventRow => ({
  id: r.id as string,
  title: r.title as string,
  description: (r.description as string) || '',
  eventType: r.event_type as EventType,
  eventDate: r.event_date as string,
  startTime: (r.start_time as string) || null,
  endTime: (r.end_time as string) || null,
  allDay: !!r.all_day,
  location: (r.location as string) || '',
  classId: (r.class_id as string) || null,
  isSchoolWide: !!r.is_school_wide,
  createdBy: (r.created_by as string) || null,
});

export async function getEvents(year: number, month: number): Promise<CalendarEventRow[]> {
  const pad = (n: number) => String(n).padStart(2, '0');
  const start = `${year}-${pad(month)}-01`;
  const next = month === 12 ? `${year + 1}-01-01` : `${year}-${pad(month + 1)}-01`;
  const rows = must<Row[]>(
    await supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', start)
      .lt('event_date', next)
      .order('event_date')
      .order('start_time')
  );
  return rows.map(mapEvent);
}

export async function getUpcomingEvents(limit = 6): Promise<CalendarEventRow[]> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = must<Row[]>(
    await supabase.from('calendar_events').select('*').gte('event_date', today).order('event_date').limit(limit)
  );
  return rows.map(mapEvent);
}

export interface NewEvent {
  title: string;
  description?: string;
  eventType: EventType;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean;
  location?: string;
  classId?: string | null;
}

export async function createEvent(e: NewEvent): Promise<CalendarEventRow> {
  const uid = await currentUserId();
  const row = must<Row>(
    await supabase
      .from('calendar_events')
      .insert({
        title: e.title.trim(),
        description: e.description?.trim() || null,
        event_type: e.eventType,
        event_date: e.eventDate,
        start_time: e.allDay ? null : e.startTime || null,
        end_time: e.allDay ? null : e.endTime || null,
        all_day: !!e.allDay,
        location: e.location?.trim() || null,
        class_id: e.classId || null,
        created_by: uid,
      })
      .select('*')
      .single()
  );
  return mapEvent(row);
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('calendar_events').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

const REPORT_BUCKET = 'student-reports';
const MAX_REPORT_BYTES = 10 * 1024 * 1024;

const mapReport = (r: Row): StudentReportRow => ({
  id: r.id as string,
  studentId: r.student_id as string,
  title: r.title as string,
  reportType: r.report_type as ReportType,
  term: (r.term as string) || null,
  academicYear: (r.academic_year as string) || null,
  notes: (r.notes as string) || null,
  filePath: r.file_path as string,
  fileName: (r.file_name as string) || null,
  createdAt: r.created_at as string,
});

export async function getReports(studentId: string): Promise<StudentReportRow[]> {
  const rows = must<Row[]>(
    await supabase.from('student_reports').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  );
  return rows.map(mapReport);
}

export interface NewReport {
  studentId: string;
  title: string;
  reportType: ReportType;
  term?: string;
  academicYear?: string;
  notes?: string;
  file: File;
}

export async function uploadReport(r: NewReport): Promise<StudentReportRow> {
  if (r.file.size > MAX_REPORT_BYTES) throw new Error('File is too large (max 10 MB).');
  const uid = await currentUserId();
  const safeName = r.file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const path = `${r.studentId}/${Date.now()}-${safeName}`;

  const up = await supabase.storage.from(REPORT_BUCKET).upload(path, r.file, { upsert: false, contentType: r.file.type || undefined });
  if (up.error) throw new Error(up.error.message);

  const ins = await supabase
    .from('student_reports')
    .insert({
      student_id: r.studentId,
      uploaded_by: uid,
      title: r.title.trim(),
      report_type: r.reportType,
      term: r.term?.trim() || null,
      academic_year: r.academicYear?.trim() || null,
      notes: r.notes?.trim() || null,
      file_path: path,
      file_name: r.file.name,
    })
    .select('*')
    .single();
  if (ins.error) {
    await supabase.storage.from(REPORT_BUCKET).remove([path]);
    throw new Error(ins.error.message);
  }
  return mapReport(ins.data as Row);
}

export async function getReportUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(REPORT_BUCKET).createSignedUrl(filePath, 60 * 10);
  if (error || !data) throw new Error(error?.message || 'Could not open file');
  return data.signedUrl;
}

export async function deleteReport(report: StudentReportRow): Promise<void> {
  const { error } = await supabase.from('student_reports').delete().eq('id', report.id);
  if (error) throw new Error(error.message);
  await supabase.storage.from(REPORT_BUCKET).remove([report.filePath]);
}



// ---------- current teacher's own profile ----------

export interface MyProfile {
  id: string;
  email: string;
  role: string;
  status: string;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  customId: string;
  primaryPhone: string | null;
  alternatePhone: string | null;
  address: string | null;
  avatarUrl: string | null;
  assignClass: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  position: string | null;
  employmentStatus: string | null;
  office: string | null;
  officeHours: string | null;
}

const mapMyProfile = (r: Row): MyProfile => ({
  id: r.id as string,
  email: (r.email as string) || '',
  role: (r.role as string) || '',
  status: (r.status as string) || '',
  firstName: (r.first_name as string) || '',
  lastName: (r.last_name as string) || '',
  middleName: (r.middle_name as string) || '',
  fullName:
    (r.full_name as string) ||
    `${(r.first_name as string) || ''} ${(r.last_name as string) || ''}`.trim(),
  customId: (r.custom_id as string) || '',
  primaryPhone: (r.primary_phone as string) || null,
  alternatePhone: (r.alternate_phone as string) || null,
  address: (r.address as string) || null,
  avatarUrl: (r.avatar_url as string) || null,
  assignClass: (r.assign_class as string) || null,
  gender: (r.gender as string) || null,
  dateOfBirth: (r.date_of_birth as string) || null,
  position: (r.position as string) || null,
  employmentStatus: (r.employment_status as string) || null,
  office: (r.office as string) || null,
  officeHours: (r.office_hours as string) || null,
});

export async function getMyProfile(): Promise<MyProfile> {
  const uid = await currentUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, status, first_name, last_name, middle_name, full_name, custom_id, primary_phone, alternate_phone, address, avatar_url, assign_class, gender, date_of_birth, position, employment_status, office, office_hours')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Profile not found.');
  return mapMyProfile(data as Row);
}

export interface MyProfileUpdate {
  firstName: string;
  lastName: string;
  middleName?: string;
  primaryPhone?: string | null;
  alternatePhone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  position?: string | null;
  employmentStatus?: string | null;
  office?: string | null;
  officeHours?: string | null;
}

export async function updateMyProfile(patch: MyProfileUpdate): Promise<MyProfile> {
  const uid = await currentUserId();
  const row = must<Row>(
    await supabase
      .from('profiles')
      .update({
        first_name: patch.firstName.trim(),
        last_name: patch.lastName.trim(),
        middle_name: patch.middleName?.trim() || null,
        primary_phone: patch.primaryPhone?.trim() || null,
        alternate_phone: patch.alternatePhone?.trim() || null,
        address: patch.address?.trim() || null,
        avatar_url: patch.avatarUrl?.trim() || null,
        gender: patch.gender?.trim() || null,
        date_of_birth: patch.dateOfBirth?.trim() || null,
        position: patch.position?.trim() || null,
        employment_status: patch.employmentStatus?.trim() || null,
        office: patch.office?.trim() || null,
        office_hours: patch.officeHours?.trim() || null,
      })
      .eq('id', uid)
      .select('id, email, role, status, first_name, last_name, middle_name, full_name, custom_id, primary_phone, alternate_phone, address, avatar_url, assign_class, gender, date_of_birth, position, employment_status, office, office_hours')
      .single()
  );
  return mapMyProfile(row);
}

export async function updateMyPassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
// ---------- messages ----------

export interface MessageThreadRow {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  subject: string;
  lastMessageAt: string;
  unreadCount: number;
  preview: string;
}

export interface MessageRow {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  isMine: boolean;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
}

const nameOf = (r: Row | null | undefined): string => {
  if (!r) return '';
  return (
    (r.full_name as string) ||
    `${(r.first_name as string) || ''} ${(r.last_name as string) || ''}`.trim()
  );
};

export async function getMyThreads(): Promise<MessageThreadRow[]> {
  const uid = await currentUserId();

  const threads = must<Row[]>(
    await supabase
      .from('message_threads')
      .select('id, student_id, parent_id, subject, last_message_at')
      .eq('teacher_id', uid)
      .order('last_message_at', { ascending: false })
  );
  if (threads.length === 0) return [];

  const threadIds = threads.map((t) => t.id as string);
  const studentIds = Array.from(new Set(threads.map((t) => t.student_id as string)));
  const parentIds = Array.from(new Set(threads.map((t) => t.parent_id as string)));

  const [studentsRes, parentsRes, msgsRes] = await Promise.all([
    supabase.from('students').select('id, first_name, last_name').in('id', studentIds),
    supabase.from('profiles').select('id, first_name, last_name, full_name').in('id', parentIds),
    supabase
      .from('messages')
      .select('thread_id, content, created_at, is_read, sender_id')
      .in('thread_id', threadIds)
      .order('created_at', { ascending: true }),
  ]);

  const students = must<Row[]>(studentsRes);
  const parents = must<Row[]>(parentsRes);
  const msgs = must<Row[]>(msgsRes);

  const studentById = new Map(students.map((s) => [s.id as string, s]));
  const parentById = new Map(parents.map((p) => [p.id as string, p]));
  const msgsByThread = new Map<string, Row[]>();
  for (const m of msgs) {
    const tid = m.thread_id as string;
    const arr = msgsByThread.get(tid) || [];
    arr.push(m);
    msgsByThread.set(tid, arr);
  }

  return threads.map((r) => {
    const list = msgsByThread.get(r.id as string) || [];
    const last = list[list.length - 1];
    const unread = list.filter((m) => !m.is_read && m.sender_id !== uid).length;
    const student = studentById.get(r.student_id as string) || null;
    const parent = parentById.get(r.parent_id as string) || null;
    return {
      id: r.id as string,
      studentId: r.student_id as string,
      studentName:
        `${(student?.first_name as string) || ''} ${(student?.last_name as string) || ''}`.trim() ||
        'Student',
      parentId: r.parent_id as string,
      parentName: nameOf(parent) || 'Parent',
      subject: (r.subject as string) || '(no subject)',
      lastMessageAt: (r.last_message_at as string) || '',
      unreadCount: unread,
      preview: ((last?.content as string) || '').slice(0, 120),
    };
  });
}

export async function getThreadMessages(threadId: string): Promise<MessageRow[]> {
  const uid = await currentUserId();

  const msgs = must<Row[]>(
    await supabase
      .from('messages')
      .select(
        'id, thread_id, sender_id, content, is_read, created_at, attachment_path, attachment_name, attachment_size'
      )
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
  );
  if (msgs.length === 0) return [];

  const senderIds = Array.from(new Set(msgs.map((m) => m.sender_id as string)));
  const senders = must<Row[]>(
    await supabase.from('profiles').select('id, first_name, last_name, full_name').in('id', senderIds)
  );
  const senderById = new Map(senders.map((s) => [s.id as string, s]));

  return msgs.map((r) => {
    const sender = senderById.get(r.sender_id as string) || null;
    return {
      id: r.id as string,
      threadId: r.thread_id as string,
      senderId: r.sender_id as string,
      senderName: nameOf(sender) || 'User',
      content: (r.content as string) || '',
      isRead: !!r.is_read,
      createdAt: r.created_at as string,
      isMine: r.sender_id === uid,
      attachmentPath: (r.attachment_path as string) || null,
      attachmentName: (r.attachment_name as string) || null,
      attachmentSize: r.attachment_size == null ? null : Number(r.attachment_size),
    };
  });
}

export async function markThreadRead(threadId: string): Promise<void> {
  const uid = await currentUserId();
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('thread_id', threadId)
    .neq('sender_id', uid)
    .eq('is_read', false);
  if (error) throw new Error(error.message);
}

const MESSAGE_BUCKET = 'message-attachments';
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

async function uploadAttachment(
  threadId: string,
  file: File
): Promise<{ path: string; name: string; size: number }> {
  if (file.size > MAX_ATTACHMENT_BYTES) throw new Error('Attachment is too large (max 15 MB).');
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const path = `${threadId}/${Date.now()}-${safe}`;
  const up = await supabase.storage.from(MESSAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (up.error) throw new Error(up.error.message);
  return { path, name: file.name, size: file.size };
}

export async function sendMessage(
  threadId: string,
  content: string,
  file?: File | null
): Promise<MessageRow> {
  const uid = await currentUserId();
  let attach: { path: string; name: string; size: number } | null = null;
  if (file) attach = await uploadAttachment(threadId, file);

  const ins = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: uid,
      content: content.trim(),
      attachment_path: attach?.path ?? null,
      attachment_name: attach?.name ?? null,
      attachment_size: attach?.size ?? null,
    })
    .select(
      'id, thread_id, sender_id, content, is_read, created_at, attachment_path, attachment_name, attachment_size'
    )
    .single();

  if (ins.error) {
    if (attach) await supabase.storage.from(MESSAGE_BUCKET).remove([attach.path]);
    throw new Error(ins.error.message);
  }

  const r = ins.data as unknown as Row;
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name, full_name')
    .eq('id', uid)
    .maybeSingle();

  return {
    id: r.id as string,
    threadId: r.thread_id as string,
    senderId: r.sender_id as string,
    senderName: nameOf(senderProfile as Row | null) || 'You',
    content: (r.content as string) || '',
    isRead: !!r.is_read,
    createdAt: r.created_at as string,
    isMine: true,
    attachmentPath: (r.attachment_path as string) || null,
    attachmentName: (r.attachment_name as string) || null,
    attachmentSize: r.attachment_size == null ? null : Number(r.attachment_size),
  };
}

export async function createThread(
  studentId: string,
  subject: string,
  content: string,
  file?: File | null
): Promise<{ threadId: string; message: MessageRow }> {
  const uid = await currentUserId();

  const { data: student, error: sErr } = await supabase
    .from('students')
    .select('id, parent_id')
    .eq('id', studentId)
    .maybeSingle();
  if (sErr) throw new Error(sErr.message);
  if (!student) throw new Error('Student not found.');
  const parentId = student.parent_id as string | null;
  if (!parentId) throw new Error('This student has no parent/guardian on record.');

  const { data: existing } = await supabase
    .from('message_threads')
    .select('id')
    .eq('teacher_id', uid)
    .eq('parent_id', parentId)
    .eq('student_id', studentId)
    .maybeSingle();

  let threadId = (existing?.id as string) || '';

  if (!threadId) {
    const ins = await supabase
      .from('message_threads')
      .insert({
        student_id: studentId,
        teacher_id: uid,
        parent_id: parentId,
        subject: subject.trim() || 'New message',
      })
      .select('id')
      .single();
    if (ins.error) throw new Error(ins.error.message);
    threadId = (ins.data as Row).id as string;
  }

  const message = await sendMessage(threadId, content, file);
  return { threadId, message };
}

export async function getAttachmentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(MESSAGE_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error || !data) throw new Error(error?.message || 'Could not open attachment');
  return data.signedUrl;
}
export interface StudentScoreDetailed {
  id: string;
  assessmentId: string;
  assessment: string;
  subject: string;
  term: string;
  assessmentType: string | null;
  eventDate: string | null;
  ca: number;
  caMax: number;
  exam: number;
  examMax: number;
  total: number; // percentage 0-100
  status: 'Draft' | 'Submitted';
} 
export async function getStudentScoresDetailed(studentId: string): Promise<StudentScoreDetailed[]> {
  const rows = must<Row[]>(
    await supabase
      .from('scores')
      .select('id, assessment_id, ca_score, exam_score, total_score')
      .eq('student_id', studentId)
  );
  if (rows.length === 0) return [];

  const assessmentIds = Array.from(new Set(rows.map((r) => r.assessment_id as string)));

  const assessments = must<Row[]>(
    await supabase
      .from('assessments')
      .select('id, title, subject, term, assessment_type, event_date, ca_max, exam_max, status')
      .in('id', assessmentIds)
  );
  const aById = new Map(assessments.map((a) => [a.id as string, a]));

  return rows.map((r) => {
    const a = aById.get(r.assessment_id as string) || {};
    return {
      id: r.id as string,
      assessmentId: r.assessment_id as string,
      assessment: (a.title as string) || '',
      subject: (a.subject as string) || '',
      term: (a.term as string) || '',
      assessmentType: (a.assessment_type as string) || null,
      eventDate: (a.event_date as string) || null,
      ca: Number(r.ca_score),
      caMax: Number(a.ca_max ?? 30),
      exam: Number(r.exam_score),
      examMax: Number(a.exam_max ?? 70),
      total: Number(r.total_score),
      status: ((a.status as 'Draft' | 'Submitted') || 'Draft'),
    };
  });
}
// ---------- assessments & scores ----------

export interface AssessmentRow {
  id: string;
  title: string;
  subject: string;
  classId: string;
  className: string;
  academicYear: string;
  term: string;
  status: 'Draft' | 'Submitted';
  assessmentType: string | null;
  eventDate: string | null;
  durationMins: number | null;
  instructions: string | null;
  caMax: number;
  examMax: number;
  caWeight: number;
  examWeight: number;
  studentCount: number;
  scoredCount: number;
}

const mapAssessment = (r: Row, className: string, studentCount: number, scoredCount: number): AssessmentRow => ({
  id: r.id as string,
  title: (r.title as string) || '',
  subject: (r.subject as string) || '',
  classId: r.class_id as string,
  className,
  academicYear: (r.academic_year as string) || '',
  term: (r.term as string) || '',
  status: (r.status as 'Draft' | 'Submitted') || 'Draft',
  assessmentType: (r.assessment_type as string) || null,
  eventDate: (r.event_date as string) || null,
  durationMins: r.duration_mins == null ? null : Number(r.duration_mins),
  instructions: (r.instructions as string) || null,
  caMax: Number(r.ca_max ?? 30),
  examMax: Number(r.exam_max ?? 70),
  caWeight: Number(r.ca_weight ?? 0.3),
  examWeight: Number(r.exam_weight ?? 0.7),
  studentCount,
  scoredCount,
});

export async function getMyAssessments(): Promise<AssessmentRow[]> {
  const uid = await currentUserId();

  const classes = must<Row[]>(
    await supabase.from('classes').select('id, name').eq('class_teacher_id', uid)
  );
  if (classes.length === 0) return [];
  const classIds = classes.map((c) => c.id as string);
  const classNameById = new Map(classes.map((c) => [c.id as string, (c.name as string) || '']));

  const assessments = must<Row[]>(
    await supabase
      .from('assessments')
      .select(
        'id, title, subject, class_id, academic_year, term, status, assessment_type, event_date, duration_mins, instructions, ca_max, exam_max, ca_weight, exam_weight'
      )
      .in('class_id', classIds)
      .order('created_at', { ascending: false })
  );
  if (assessments.length === 0) return [];

  const assessmentIds = assessments.map((a) => a.id as string);

  const [studentsRes, scoresRes] = await Promise.all([
    supabase.from('students').select('id, class_id').in('class_id', classIds),
    supabase.from('scores').select('assessment_id').in('assessment_id', assessmentIds),
  ]);
  const students = must<Row[]>(studentsRes);
  const scores = must<Row[]>(scoresRes);

  const studentsByClass = new Map<string, number>();
  for (const s of students) {
    const cid = s.class_id as string;
    studentsByClass.set(cid, (studentsByClass.get(cid) || 0) + 1);
  }
  const scoredByAssessment = new Map<string, number>();
  for (const s of scores) {
    const aid = s.assessment_id as string;
    scoredByAssessment.set(aid, (scoredByAssessment.get(aid) || 0) + 1);
  }

  return assessments.map((a) =>
    mapAssessment(
      a,
      classNameById.get(a.class_id as string) || '',
      studentsByClass.get(a.class_id as string) || 0,
      scoredByAssessment.get(a.id as string) || 0
    )
  );
}

export interface NewAssessment {
  title: string;
  subject: string;
  classId: string;
  academicYear: string;
  term: string;
  assessmentType?: string | null;
  eventDate?: string | null;
  durationMins?: number | null;
  instructions?: string | null;
  caMax: number;
  examMax: number;
  caWeight: number;
  examWeight: number;
}

export async function createAssessment(a: NewAssessment): Promise<string> {
  const uid = await currentUserId();
  const ins = await supabase
    .from('assessments')
    .insert({
      title: a.title.trim(),
      subject: a.subject.trim(),
      class_id: a.classId,
      academic_year: a.academicYear,
      term: a.term,
      status: 'Draft',
      assessment_type: a.assessmentType?.trim() || null,
      event_date: a.eventDate || null,
      duration_mins: a.durationMins ?? null,
      instructions: a.instructions?.trim() || null,
      ca_max: a.caMax,
      exam_max: a.examMax,
      ca_weight: a.caWeight,
      exam_weight: a.examWeight,
      created_by: uid,
    })
    .select('id')
    .single();
  if (ins.error) throw new Error(ins.error.message);
  return (ins.data as Row).id as string;
}

export interface AssessmentDetail {
  assessment: AssessmentRow;
  roster: {
    studentId: string;
    name: string;
    customId: string;
    caScore: number | null;
    examScore: number | null;
    totalScore: number | null;
    remark: string | null;
  }[];
}

export async function getAssessment(assessmentId: string): Promise<AssessmentDetail> {
  const a = await supabase
    .from('assessments')
    .select(
      'id, title, subject, class_id, academic_year, term, status, assessment_type, event_date, duration_mins, instructions, ca_max, exam_max, ca_weight, exam_weight'
    )
    .eq('id', assessmentId)
    .maybeSingle();
  if (a.error) throw new Error(a.error.message);
  if (!a.data) throw new Error('Assessment not found.');

  const row = a.data as Row;
  const classId = row.class_id as string;

  const [classRes, studentsRes, scoresRes] = await Promise.all([
    supabase.from('classes').select('id, name').eq('id', classId).maybeSingle(),
    supabase
      .from('students')
      .select('id, first_name, last_name, custom_id')
      .eq('class_id', classId)
      .order('first_name'),
    supabase
      .from('scores')
      .select('student_id, ca_score, exam_score, total_score, remark')
      .eq('assessment_id', assessmentId),
  ]);
  if (classRes.error) throw new Error(classRes.error.message);
  const students = must<Row[]>(studentsRes);
  const scores = must<Row[]>(scoresRes);

  const scoreByStudent = new Map<string, Row>();
  for (const s of scores) scoreByStudent.set(s.student_id as string, s);

  const roster = students.map((s) => {
    const sc = scoreByStudent.get(s.id as string);
    return {
      studentId: s.id as string,
      name: `${(s.first_name as string) || ''} ${(s.last_name as string) || ''}`.trim(),
      customId: (s.custom_id as string) || '',
      caScore: sc?.ca_score == null ? null : Number(sc.ca_score),
      examScore: sc?.exam_score == null ? null : Number(sc.exam_score),
      totalScore: sc?.total_score == null ? null : Number(sc.total_score),
      remark: (sc?.remark as string) || null,
    };
  });

  const assessment = mapAssessment(
    row,
    ((classRes.data as Row | null)?.name as string) || '',
    students.length,
    scores.length
  );

  return { assessment, roster };
}

export interface ScoreEntry {
  studentId: string;
  caScore: number | null;
  examScore: number | null;
  remark?: string | null;
}

export async function saveScores(assessmentId: string, entries: ScoreEntry[]): Promise<void> {
  if (entries.length === 0) return;
  const payload = entries.map((e) => ({
    assessment_id: assessmentId,
    student_id: e.studentId,
    ca_score: e.caScore ?? 0,
    exam_score: e.examScore ?? 0,
    remark: e.remark?.trim() || null,
  }));
  const { error } = await supabase
    .from('scores')
    .upsert(payload, { onConflict: 'assessment_id,student_id' });
  if (error) throw new Error(error.message);
}

export async function submitAssessment(assessmentId: string): Promise<void> {
  const { error } = await supabase
    .from('assessments')
    .update({ status: 'Submitted' })
    .eq('id', assessmentId);
  if (error) throw new Error(error.message);
}

export async function deleteAssessment(assessmentId: string): Promise<void> {
  const { error } = await supabase.from('assessments').delete().eq('id', assessmentId);
  if (error) throw new Error(error.message);
}
export async function getClassRank(studentId: string): Promise<{ position: number; total: number } | null> {
  // find this student's class
  const { data: student, error: sErr } = await supabase
    .from('students')
    .select('id, class_id')
    .eq('id', studentId)
    .maybeSingle();
  if (sErr) throw new Error(sErr.message);
  if (!student || !student.class_id) return null;
  const classId = student.class_id as string;

  // all students in the class
  const peers = must<Row[]>(
    await supabase.from('students').select('id').eq('class_id', classId)
  );
  if (peers.length === 0) return null;
  const peerIds = peers.map((p) => p.id as string);

  // assessments for this class (only submitted count)
  const assessments = must<Row[]>(
    await supabase.from('assessments').select('id').eq('class_id', classId).eq('status', 'Submitted')
  );
  if (assessments.length === 0) return null;
  const assessmentIds = assessments.map((a) => a.id as string);

  // all scores for those assessments and those students
  const scores = must<Row[]>(
    await supabase
      .from('scores')
      .select('student_id, total_score')
      .in('assessment_id', assessmentIds)
      .in('student_id', peerIds)
  );

  const byStudent = new Map<string, number[]>();
  for (const s of scores) {
    const sid = s.student_id as string;
    const arr = byStudent.get(sid) || [];
    arr.push(Number(s.total_score));
    byStudent.set(sid, arr);
  }

  const averages: { id: string; avg: number }[] = [];
  for (const [sid, list] of byStudent) {
    if (list.length === 0) continue;
    const avg = list.reduce((a, b) => a + b, 0) / list.length;
    averages.push({ id: sid, avg });
  }
  if (averages.length === 0) return null;

  averages.sort((a, b) => b.avg - a.avg);
  const idx = averages.findIndex((a) => a.id === studentId);
  if (idx === -1) return null;

  return { position: idx + 1, total: peers.length };
}
// ---------- tasks, timetable, announcements, dashboard ----------

export interface TaskRow {
  id: string;
  title: string;
  dueDate: string | null;
  done: boolean;
  createdAt: string;
}

export async function getMyTasks(): Promise<TaskRow[]> {
  const uid = await currentUserId();
  const rows = must<Row[]>(
    await supabase
      .from('teacher_tasks')
      .select('id, title, due_date, done, created_at')
      .eq('teacher_id', uid)
      .order('done', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
  );
  return rows.map((r) => ({
    id: r.id as string,
    title: (r.title as string) || '',
    dueDate: (r.due_date as string) || null,
    done: !!r.done,
    createdAt: (r.created_at as string) || '',
  }));
}

export async function createTask(title: string, dueDate: string | null): Promise<TaskRow> {
  const uid = await currentUserId();
  const ins = await supabase
    .from('teacher_tasks')
    .insert({ teacher_id: uid, title: title.trim(), due_date: dueDate || null })
    .select('id, title, due_date, done, created_at')
    .single();
  if (ins.error) throw new Error(ins.error.message);
  const r = ins.data as Row;
  return {
    id: r.id as string,
    title: (r.title as string) || '',
    dueDate: (r.due_date as string) || null,
    done: !!r.done,
    createdAt: (r.created_at as string) || '',
  };
}

export async function toggleTask(taskId: string, done: boolean): Promise<void> {
  const { error } = await supabase.from('teacher_tasks').update({ done }).eq('id', taskId);
  if (error) throw new Error(error.message);
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('teacher_tasks').delete().eq('id', taskId);
  if (error) throw new Error(error.message);
}

export interface TimetableEntry {
  id: string;
  teacherId: string;
  classId: string | null;
  className: string | null;
  subject: string;
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  startTime: string; // HH:MM
  endTime: string;
  room: string | null;
  academicYear: string;
  term: string;
}

const mapTimetable = (r: Row, className: string | null): TimetableEntry => ({
  id: r.id as string,
  teacherId: r.teacher_id as string,
  classId: (r.class_id as string) || null,
  className,
  subject: (r.subject as string) || '',
  dayOfWeek: Number(r.day_of_week ?? 0),
  startTime: (r.start_time as string) || '',
  endTime: (r.end_time as string) || '',
  room: (r.room as string) || null,
  academicYear: (r.academic_year as string) || '',
  term: (r.term as string) || '',
});

export async function getWeeklyTimetable(): Promise<TimetableEntry[]> {
  const uid = await currentUserId();
  const rows = must<Row[]>(
    await supabase
      .from('timetable_entries')
      .select('id, teacher_id, class_id, subject, day_of_week, start_time, end_time, room, academic_year, term')
      .eq('teacher_id', uid)
      .order('day_of_week')
      .order('start_time')
  );
  if (rows.length === 0) return [];

  const classIds = Array.from(
    new Set(rows.map((r) => r.class_id as string).filter(Boolean))
  );
  const classNames = new Map<string, string>();
  if (classIds.length > 0) {
    const cls = must<Row[]>(
      await supabase.from('classes').select('id, name').in('id', classIds)
    );
    for (const c of cls) classNames.set(c.id as string, (c.name as string) || '');
  }

  return rows.map((r) => mapTimetable(r, classNames.get(r.class_id as string) || null));
}

export async function getTodaySchedule(): Promise<TimetableEntry[]> {
  const all = await getWeeklyTimetable();
  const today = new Date().getDay(); // 0 = Sunday
  return all.filter((e) => e.dayOfWeek === today);
}

export interface NewTimetableEntry {
  classId: string | null;
  subject: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  academicYear: string;
  term: string;
}

export async function createTimetableEntry(e: NewTimetableEntry): Promise<TimetableEntry> {
  const uid = await currentUserId();
  const ins = await supabase
    .from('timetable_entries')
    .insert({
      teacher_id: uid,
      class_id: e.classId,
      subject: e.subject.trim(),
      day_of_week: e.dayOfWeek,
      start_time: e.startTime,
      end_time: e.endTime,
      room: e.room?.trim() || null,
      academic_year: e.academicYear,
      term: e.term,
    })
    .select('id, teacher_id, class_id, subject, day_of_week, start_time, end_time, room, academic_year, term')
    .single();
  if (ins.error) throw new Error(ins.error.message);
  const r = ins.data as Row;

  let className: string | null = null;
  if (e.classId) {
    const { data: c } = await supabase.from('classes').select('name').eq('id', e.classId).maybeSingle();
    className = ((c as Row | null)?.name as string) || null;
  }
  return mapTimetable(r, className);
}

export async function deleteTimetableEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('timetable_entries').delete().eq('id', entryId);
  if (error) throw new Error(error.message);
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  audience: string;
  postedAt: string;
}

export async function getRecentAnnouncements(limit = 3): Promise<AnnouncementRow[]> {
  const rows = must<Row[]>(
    await supabase
      .from('announcements')
      .select('id, title, body, audience, posted_at, expires_at')
      .order('posted_at', { ascending: false })
      .limit(limit)
  );
  const now = Date.now();
  return rows
    .filter((r) => {
      const exp = r.expires_at as string | null;
      return !exp || new Date(exp).getTime() > now;
    })
    .map((r) => ({
      id: r.id as string,
      title: (r.title as string) || '',
      body: (r.body as string) || '',
      audience: (r.audience as string) || 'all',
      postedAt: (r.posted_at as string) || '',
    }));
}

export interface DashboardCounts {
  classesToday: number;
  attendancePending: number;
  pendingResults: number;
  unreadMessages: number;
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const uid = await currentUserId();

  const today = new Date().getDay();
  const todayYmd = new Date().toISOString().slice(0, 10);

  // classes today = timetable entries for today's weekday
  const schedule = must<Row[]>(
    await supabase
      .from('timetable_entries')
      .select('id, class_id')
      .eq('teacher_id', uid)
      .eq('day_of_week', today)
  );
  const classesToday = schedule.length;

  // attendance pending = of today's scheduled classes, how many have no attendance session for today
  let attendancePending = 0;
  if (schedule.length > 0) {
    const classIds = Array.from(
      new Set(schedule.map((s) => s.class_id as string).filter(Boolean))
    );
    if (classIds.length > 0) {
      const sessions = must<Row[]>(
        await supabase
          .from('attendance_sessions')
          .select('class_id')
          .in('class_id', classIds)
          .eq('date', todayYmd)
      );
      const recorded = new Set(sessions.map((s) => s.class_id as string));
      attendancePending = classIds.filter((id) => !recorded.has(id)).length;
    }
  }

  // pending results = draft assessments for the teacher's classes
  const classes = must<Row[]>(
    await supabase.from('classes').select('id').eq('class_teacher_id', uid)
  );
  let pendingResults = 0;
  if (classes.length > 0) {
    const classIds = classes.map((c) => c.id as string);
    const drafts = must<Row[]>(
      await supabase
        .from('assessments')
        .select('id')
        .in('class_id', classIds)
        .eq('status', 'Draft')
    );
    pendingResults = drafts.length;
  }

  // unread messages = threads where I'm teacher_id, count messages not mine and not read
  const threads = must<Row[]>(
    await supabase.from('message_threads').select('id').eq('teacher_id', uid)
  );
  let unreadMessages = 0;
  if (threads.length > 0) {
    const threadIds = threads.map((t) => t.id as string);
    const unread = must<Row[]>(
      await supabase
        .from('messages')
        .select('id')
        .in('thread_id', threadIds)
        .neq('sender_id', uid)
        .eq('is_read', false)
    );
    unreadMessages = unread.length;
  }

  return { classesToday, attendancePending, pendingResults, unreadMessages };
}