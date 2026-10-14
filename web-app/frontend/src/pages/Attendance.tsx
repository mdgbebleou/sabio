import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

interface AttendanceClassData {
  id: string;
  className: string;
  studentsCount: number;
  todayPAL: string;
  termPercentage: number;
  status: 'Stable' | 'Requires Attention';
}

interface StudentAttentionData {
  id: string;
  studentName: string;
  studentId: string;
  className: string;
  attendancePct: number;
  absentLateDays: string;
  trend: 'Declining' | 'Stable (Low)';
  recordedBy: string;
  lastDate: string;
}

interface CorrectionRow {
  id: string;
  original_status: string;
  new_status: string;
  reason: string | null;
  supporting_note: string | null;
  corrected_by_name: string | null;
  corrected_at: string;
}

interface TermOption {
  academic_year: string;
  term_name: string;
  start_date: string;
  end_date: string;
}

const fmtLongDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const fmtShortDate = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const Attendance: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'detail' | 'correct' | 'confirm' | 'export' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttentionData | null>(null);

  const [academicYear, setAcademicYear] = useState<string>('');
  const [termName, setTermName] = useState<string>('');
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<TermOption | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [classRows, setClassRows] = useState<AttendanceClassData[]>([]);
  const [attentionStudents, setAttentionStudents] = useState<StudentAttentionData[]>([]);
  const [todayPresent, setTodayPresent] = useState(0);
  const [todayAbsent, setTodayAbsent] = useState(0);
  const [todayLate, setTodayLate] = useState(0);
  const [todayRate, setTodayRate] = useState(0);
  const [termOverallPct, setTermOverallPct] = useState(0);
  const [lastWeekPct, setLastWeekPct] = useState(0);
  const [classesSubmitted, setClassesSubmitted] = useState(0);
  const [classesTotal, setClassesTotal] = useState(0);
  const [attentionCount, setAttentionCount] = useState(0);
  const [insights, setInsights] = useState({
    persistent: 0,
    declining: 0,
    classAlert: 0,
    classAlertName: '',
    classAlertPct: 0,
    latePattern: 0,
  });

  const [correctionStatus, setCorrectionStatus] = useState<'Present' | 'Absent' | 'Late' | 'Excused'>('Present');
  const [correctionReason, setCorrectionReason] = useState('Student was incorrectly marked absent');
  const [adminNote, setAdminNote] = useState('');
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null);
  const [corrections, setCorrections] = useState<CorrectionRow[]>([]);
  const [originalStatus, setOriginalStatus] = useState<string>('Absent');

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    const { data, error } = await supabase
      .from('academic_terms')
      .select('academic_year, term_name, start_date, end_date, structure_type, is_active')
      .order('start_date', { ascending: true });
    if (error) { console.error(error.message); return; }
    const rows = (data || []) as TermOption[];
    setTerms(rows);
    if (rows.length > 0) {
      const active = rows.find((r: any) => r.is_active) || rows[0];
      setAcademicYear(active.academic_year);
      setTermName(active.term_name);
      setSelectedTerm(active);
    } else {
      setIsLoading(false);
    }
  };

  const yearOptions = useMemo(() => {
    return Array.from(new Set(terms.map(t => t.academic_year)));
  }, [terms]);

  const termOptionsForYear = useMemo(() => {
    return terms.filter(t => t.academic_year === academicYear);
  }, [terms, academicYear]);

  useEffect(() => {
    if (!academicYear || !termName) return;
    const match = terms.find(t => t.academic_year === academicYear && t.term_name === termName);
    setSelectedTerm(match || null);
  }, [academicYear, termName, terms]);

  useEffect(() => {
    if (selectedTerm) fetchAll();
  }, [selectedTerm]);

  const fetchAll = async () => {
    if (!selectedTerm) return;
    try {
      setIsLoading(true);
      await Promise.all([
        fetchTodayStats(),
        fetchTermStats(),
        fetchClassStats(),
        fetchAttentionStudents(),
        fetchInsights(),
        fetchRecordingStatus(),
      ]);
    } catch (err) {
      console.error('Attendance fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodayStats = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', today);
    if (error) { console.error(error.message); return; }
    const rows = (data || []) as { status: string | null }[];
    const present = rows.filter(r => r.status === 'Present').length;
    const late = rows.filter(r => r.status === 'Late').length;
    const absent = rows.filter(r => r.status === 'Absent' || r.status === 'Excused').length;
    const total = rows.length;
    setTodayPresent(present);
    setTodayLate(late);
    setTodayAbsent(absent);
    setTodayRate(total > 0 ? Math.round(((present + late) / total) * 1000) / 10 : 0);
  };

  const fetchTermStats = async () => {
    if (!selectedTerm) return;
    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .gte('date', selectedTerm.start_date)
      .lte('date', selectedTerm.end_date);
    if (error) { console.error(error.message); return; }

    const rows = (data || []) as { date: string; status: string | null }[];
    const total = rows.length;
    const presentLike = rows.filter(r => r.status === 'Present' || r.status === 'Late').length;
    setTermOverallPct(total > 0 ? Math.round((presentLike / total) * 1000) / 10 : 0);

    const now = new Date();
    const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 7);

    const inLastWeek = rows.filter(r => {
      const d = new Date(r.date).getTime();
      return d >= lastWeekStart.getTime();
    });
    const lw = inLastWeek.length > 0
      ? Math.round((inLastWeek.filter(r => r.status === 'Present' || r.status === 'Late').length / inLastWeek.length) * 1000) / 10
      : 0;
    setLastWeekPct(lw);
  };

  const fetchClassStats = async () => {
    if (!selectedTerm) return;
    const today = new Date().toISOString().slice(0, 10);

    const { data: studentRows } = await supabase
      .from('students')
      .select('id, class_name');
    const studentsByClass: Record<string, string[]> = {};
    (studentRows || []).forEach((r: any) => {
      const cn = r.class_name || 'Unassigned';
      if (!studentsByClass[cn]) studentsByClass[cn] = [];
      studentsByClass[cn].push(r.id);
    });

    const { data: attRows } = await supabase
      .from('attendance')
      .select('student_id, date, status')
      .gte('date', selectedTerm.start_date)
      .lte('date', selectedTerm.end_date);

    const todayByStudent: Record<string, string> = {};
    (attRows || []).forEach((r: any) => {
      if (r.date === today) todayByStudent[r.student_id] = r.status;
    });

    const rows: AttendanceClassData[] = Object.entries(studentsByClass).map(([className, studentIds], idx) => {
      let present = 0, late = 0, absent = 0;
      studentIds.forEach(sid => {
        const s = todayByStudent[sid];
        if (s === 'Present') present++;
        else if (s === 'Late') late++;
        else if (s === 'Absent' || s === 'Excused') absent++;
      });

      let termPresent = 0, termTotal = 0;
      (attRows || []).forEach((r: any) => {
        if (studentIds.includes(r.student_id)) {
          termTotal++;
          if (r.status === 'Present' || r.status === 'Late') termPresent++;
        }
      });
      const termPct = termTotal > 0 ? Math.round((termPresent / termTotal) * 1000) / 10 : 0;

      const status: 'Stable' | 'Requires Attention' = termPct < 85 ? 'Requires Attention' : 'Stable';

      return {
        id: String(idx),
        className,
        studentsCount: studentIds.length,
        todayPAL: `${present} / ${absent} / ${late}`,
        termPercentage: termPct,
        status,
      };
    }).sort((a, b) => a.className.localeCompare(b.className));

    setClassRows(rows);
  };

  const fetchAttentionStudents = async () => {
    if (!selectedTerm) return;
    const { data: attRows } = await supabase
      .from('attendance')
      .select('student_id, date, status, recorded_by_name')
      .gte('date', selectedTerm.start_date)
      .lte('date', selectedTerm.end_date);

    const { data: studentRows } = await supabase
      .from('students')
      .select('id, custom_id, first_name, last_name, class_name');

    const studentMap: Record<string, any> = {};
    (studentRows || []).forEach((s: any) => { studentMap[s.id] = s; });

    const stats: Record<string, { present: number; late: number; absent: number; total: number; lastDate: string; recordedBy: string }> = {};
    (attRows || []).forEach((r: any) => {
      if (!stats[r.student_id]) stats[r.student_id] = { present: 0, late: 0, absent: 0, total: 0, lastDate: '', recordedBy: '' };
      stats[r.student_id].total++;
      if (r.status === 'Present') stats[r.student_id].present++;
      else if (r.status === 'Late') stats[r.student_id].late++;
      else stats[r.student_id].absent++;
      if (!stats[r.student_id].lastDate || r.date > stats[r.student_id].lastDate) {
        stats[r.student_id].lastDate = r.date;
        stats[r.student_id].recordedBy = r.recorded_by_name || '';
      }
    });

    const list: StudentAttentionData[] = [];
    Object.entries(stats).forEach(([sid, s]) => {
      const pct = s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 1000) / 10 : 0;
      if (pct < 85) {
        const st = studentMap[sid];
        if (!st) return;
        const trend: 'Declining' | 'Stable (Low)' = pct < 80 ? 'Declining' : 'Stable (Low)';
        list.push({
          id: sid,
          studentName: `${st.first_name || ''} ${st.last_name || ''}`.trim() || 'Unknown',
          studentId: st.custom_id || '—',
          className: st.class_name || '—',
          attendancePct: pct,
          absentLateDays: `${s.absent} / ${s.late}`,
          trend,
          recordedBy: s.recordedBy || '—',
          lastDate: s.lastDate,
        });
      }
    });

    list.sort((a, b) => a.attendancePct - b.attendancePct);
    setAttentionStudents(list);
    setAttentionCount(list.length);
  };

  const fetchInsights = async () => {
    const persistent = attentionStudents.length;

    const now = new Date();
    const d14 = new Date(now); d14.setDate(now.getDate() - 14);
    const d28 = new Date(now); d28.setDate(now.getDate() - 28);

    const { data: recent } = await supabase
      .from('attendance')
      .select('student_id, date, status')
      .gte('date', d28.toISOString().slice(0, 10));

    const buckets: Record<string, { recent: number; recentTotal: number; prev: number; prevTotal: number }> = {};
    (recent || []).forEach((r: any) => {
      if (!buckets[r.student_id]) buckets[r.student_id] = { recent: 0, recentTotal: 0, prev: 0, prevTotal: 0 };
      const isRecent = new Date(r.date).getTime() >= d14.getTime();
      if (isRecent) {
        buckets[r.student_id].recentTotal++;
        if (r.status === 'Present' || r.status === 'Late') buckets[r.student_id].recent++;
      } else {
        buckets[r.student_id].prevTotal++;
        if (r.status === 'Present' || r.status === 'Late') buckets[r.student_id].prev++;
      }
    });

    let declining = 0;
    Object.values(buckets).forEach(b => {
      const rPct = b.recentTotal > 0 ? (b.recent / b.recentTotal) * 100 : 0;
      const pPct = b.prevTotal > 0 ? (b.prev / b.prevTotal) * 100 : 0;
      if (b.prevTotal > 0 && b.recentTotal > 0 && (pPct - rPct) >= 10) declining++;
    });

    const worstClass = [...classRows].sort((a, b) => a.termPercentage - b.termPercentage)[0];

    const d7 = new Date(now); d7.setDate(now.getDate() - 7);
    const { data: lates } = await supabase
      .from('attendance')
      .select('student_id')
      .eq('status', 'Late')
      .gte('date', d7.toISOString().slice(0, 10));
    const lateByStudent: Record<string, number> = {};
    (lates || []).forEach((r: any) => { lateByStudent[r.student_id] = (lateByStudent[r.student_id] || 0) + 1; });
    const latePattern = Object.values(lateByStudent).filter(v => v >= 3).length;

    setInsights({
      persistent,
      declining,
      classAlert: worstClass && worstClass.termPercentage < 85 ? 1 : 0,
      classAlertName: worstClass?.className || '',
      classAlertPct: worstClass?.termPercentage || 0,
      latePattern,
    });
  };

  const fetchRecordingStatus = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data: classRowsAll } = await supabase.from('classes').select('id').eq('status', 'Active');
    const total = (classRowsAll || []).length;
    setClassesTotal(total);

    const { data: todayRows } = await supabase
      .from('attendance')
      .select('student_id')
      .eq('date', today);
    const uniqueStudents = new Set((todayRows || []).map((r: any) => r.student_id));

    const { data: studentRows } = await supabase.from('students').select('id, class_name');
    const classesWithData = new Set<string>();
    (studentRows || []).forEach((s: any) => {
      if (uniqueStudents.has(s.id)) classesWithData.add(s.class_name);
    });
    setClassesSubmitted(classesWithData.size);
  };

  const openStudentModal = async (student: StudentAttentionData, type: 'detail' | 'correct') => {
    setSelectedStudent(student);
    setActiveModal(type);
    setAdminNote('');
    setCorrectionStatus('Present');

    const { data: att } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', student.id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    setSelectedAttendance(att);

    if (att) {
      setOriginalStatus(att.status || 'Absent');
    }

    const { data: corr } = await supabase
      .from('attendance_corrections')
      .select('*')
      .eq('student_id', student.id)
      .order('corrected_at', { ascending: false })
      .limit(5);
    setCorrections((corr || []) as CorrectionRow[]);
  };

  const handleSaveCorrection = async () => {
    if (!selectedStudent || !selectedAttendance) {
      alert('No attendance record selected.');
      return;
    }
    try {
      setIsSavingCorrection(true);
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id || null;
      const userName = auth?.user?.email?.split('@')[0] || 'Admin';

      const { error: updErr } = await supabase
        .from('attendance')
        .update({ status: correctionStatus })
        .eq('id', selectedAttendance.id);
      if (updErr) throw updErr;

      const { error: insErr } = await supabase.from('attendance_corrections').insert([{
        attendance_id: selectedAttendance.id,
        student_id: selectedStudent.id,
        original_status: originalStatus,
        new_status: correctionStatus,
        reason: correctionReason,
        supporting_note: adminNote || null,
        corrected_by: userId,
        corrected_by_name: userName,
      }]);
      if (insErr) throw insErr;

      alert('Attendance corrected and logged.');
      setActiveModal(null);
      await fetchAll();
    } catch (err: any) {
      alert('Failed to save correction: ' + err.message);
    } finally {
      setIsSavingCorrection(false);
    }
  };

  const handleTodayClick = () => {
    const today = new Date().getTime();
    const matching = terms.find(t => {
      const s = new Date(t.start_date).getTime();
      const e = new Date(t.end_date).getTime();
      return today >= s && today <= e;
    });
    if (!matching) {
      alert('No configured term covers today. Check academic_terms in Supabase.');
      return;
    }
    setAcademicYear(matching.academic_year);
    setTermName(matching.term_name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = () => {
    if (attentionStudents.length === 0) {
      alert('No attention records to export.');
      return;
    }
    const header = ['Student Name', 'Student ID', 'Class', 'Attendance %', 'Absent / Late', 'Trend', 'Recorded By', 'Last Date'];
    const rows = attentionStudents.map(s => [
      s.studentName, s.studentId, s.className, `${s.attendancePct}%`, s.absentLateDays, s.trend, s.recordedBy, s.lastDate,
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-attention-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActiveModal(null);
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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '680px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  const trendDelta = Math.round((lastWeekPct - termOverallPct) * 10) / 10;

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Attendance Management</h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>
              {yearOptions.length === 0 ? <option>—</option> : yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>
              {termOptionsForYear.length === 0 ? <option>—</option> : termOptionsForYear.map(t => <option key={t.term_name} value={t.term_name}>{t.term_name}</option>)}
            </select>
            <button
              onClick={handleTodayClick}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Today
            </button>
            <Link
              to="/reports-analytics"
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Attendance Reports
            </Link>
            <button onClick={() => setActiveModal('export')} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>

          <div style={{ backgroundColor: '#002b49', borderRadius: '16px', padding: '20px', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: '800', textTransform: 'uppercase' }}>TODAY'S STATUS</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '2px' }}>{fmtLongDate(new Date())}</div>
              <div style={{ fontSize: '32px', fontWeight: '900', marginTop: '12px' }}>
                {isLoading ? '…' : `${todayRate}%`} <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 'normal' }}>School Attendance</span>
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px' }}>
                Present: <strong>{todayPresent}</strong> | Absent: <strong>{todayAbsent}</strong> | Late: <strong>{todayLate}</strong>
              </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: classesSubmitted === classesTotal && classesTotal > 0 ? '#4ade80' : '#fbbf24', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {classesSubmitted}/{classesTotal} classes submitted {classesSubmitted === classesTotal && classesTotal > 0 ? '(Complete)' : ''}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TERM ATTENDANCE</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{isLoading ? '…' : `${termOverallPct}%`}</div>
            <div style={{ fontSize: '11px', color: trendDelta >= 0 ? '#166534' : '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>
              {trendDelta >= 0 ? '📈' : '📉'} {trendDelta >= 0 ? '+' : ''}{trendDelta}% vs last week
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PRESENT TODAY</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{todayPresent}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Of {todayPresent + todayAbsent + todayLate} marked</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ABSENT TODAY</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: '8px' }}>{todayAbsent}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Excludes excused</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>LATE TODAY</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#d97706', marginTop: '8px' }}>{todayLate}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Arrived after register</div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: attentionCount > 0 ? '#fef2f2' : '#ffffff', borderColor: attentionCount > 0 ? '#fecaca' : '#e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: attentionCount > 0 ? '#991b1b' : '#64748b', textTransform: 'uppercase' }}>ATTENTION REQUIRED</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: attentionCount > 0 ? '#991b1b' : '#0f172a', marginTop: '8px' }}>{attentionCount}</div>
            <div style={{ fontSize: '11px', color: attentionCount > 0 ? '#7f1d1d' : '#64748b', marginTop: '4px' }}>{attentionCount > 0 ? 'Urgent review needed' : 'All within threshold'}</div>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Attendance Insights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#991b1b' }}>Persistent Absenteeism</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  {insights.persistent} student{insights.persistent === 1 ? '' : 's'} below 85% threshold.
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#d97706' }}>Attendance Decline</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  {insights.declining} student{insights.declining === 1 ? '' : 's'} dropped 10+ points in last 2 weeks.
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#991b1b' }}>Class Attendance Alert</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  {insights.classAlert > 0
                    ? <>{insights.classAlert} class below 85% ({insights.classAlertName} at {insights.classAlertPct}%).</>
                    : 'All classes above 85%.'}
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e40af' }}>Late Arrival Pattern</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  {insights.latePattern} student{insights.latePattern === 1 ? '' : 's'} with 3+ late marks this week.
                </p>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recording Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Today</span>
                  <strong>{classesSubmitted}/{classesTotal} ({classesTotal > 0 ? Math.round((classesSubmitted / classesTotal) * 100) : 0}%)</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${classesTotal > 0 ? (classesSubmitted / classesTotal) * 100 : 0}%`, height: '100%', backgroundColor: '#10b981' }}></div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                Live submission progress across all active classes.
              </div>
            </div>
          </div>

        </div>

        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Attendance by Class</h3>
          </div>

          {isLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading classes…</div>
          ) : classRows.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>N/A (No classes with enrolled students)</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>CLASS</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>STUDENTS</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>TODAY (P/A/L)</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>TERM %</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {classRows.map(cls => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{cls.className}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{cls.studentsCount}</td>
                    <td style={{ padding: '12px', fontWeight: '500', color: cls.status === 'Requires Attention' ? '#dc2626' : '#0f172a' }}>{cls.todayPAL}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: cls.termPercentage < 85 ? '#dc2626' : '#0f172a' }}>{cls.termPercentage}%</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: cls.status === 'Stable' ? '#dcfce7' : '#fee2e2',
                        color: cls.status === 'Stable' ? '#166534' : '#991b1b',
                        padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold'
                      }}>
                        {cls.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Students Requiring Attention</h3>
          </div>

          {isLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading…</div>
          ) : attentionStudents.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>
              N/A (No students below the 85% attendance threshold)
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>STUDENT</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>CLASS</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>ATTENDANCE %</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>ABSENT/LATE</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>TREND</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {attentionStudents.map(st => (
                  <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#0f172a' }}>{st.studentName}</td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>{st.className}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#dc2626' }}>{st.attendancePct}%</td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>{st.absentLateDays}</td>
                    <td style={{ padding: '14px 20px', color: '#dc2626', fontWeight: 'bold' }}>📉 {st.trend}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <button onClick={() => openStudentModal(st, 'detail')} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#1e40af', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {activeModal === 'detail' && selectedStudent && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Attendance Detail</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Detailed view of student attendance record.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#002b49', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                      {selectedStudent.studentName.split(' ').map(s => s[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{selectedStudent.studentName}</h4>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace', display: 'inline-block', marginTop: '4px' }}>
                        ID: {selectedStudent.studentId}
                      </span>
                      <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '12px' }}>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>CLASS</div>
                          <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{selectedStudent.className}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>TERM</div>
                          <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{termName || '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>ACADEMIC YEAR</div>
                          <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{academicYear || '—'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>LATEST RECORD</div>
                    {selectedAttendance ? (
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ color: '#64748b' }}>Date</span>
                          <strong style={{ color: '#0f172a' }}>{fmtShortDate(selectedAttendance.date)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ color: '#64748b' }}>Status</span>
                          <strong style={{ color: selectedAttendance.status === 'Present' ? '#166534' : selectedAttendance.status === 'Late' ? '#d97706' : '#dc2626' }}>
                            {selectedAttendance.status}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                          <span style={{ color: '#64748b' }}>Recorded By</span>
                          <strong style={{ color: '#0f172a' }}>{selectedAttendance.recorded_by_name || '—'}</strong>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No attendance record on file</div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>TERM SUMMARY</div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Attendance Rate</span>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{selectedStudent.attendancePct}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedStudent.attendancePct}%`, height: '100%', backgroundColor: selectedStudent.attendancePct < 85 ? '#dc2626' : '#166534' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>CORRECTION HISTORY</div>
                  {corrections.length === 0 ? (
                    <div style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>
                      No corrections on record.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {corrections.map(c => (
                        <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <strong style={{ color: '#0f172a' }}>Status Corrected</strong>
                            <span style={{ color: '#64748b', fontSize: '11px' }}>{fmtShortDate(c.corrected_at)}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                            Changed from <strong style={{ color: '#dc2626' }}>{c.original_status}</strong> to <strong style={{ color: '#166534' }}>{c.new_status}</strong>
                          </div>
                          {c.reason && (
                            <div style={{ fontSize: '11px', color: '#334155', fontStyle: 'italic' }}>"{c.reason}"</div>
                          )}
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>By <strong>{c.corrected_by_name || '—'}</strong></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Close</button>
                <button onClick={() => setActiveModal('correct')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Correct Attendance
                </button>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'correct' && selectedStudent && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Correct Attendance</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Original records are preserved for auditing purposes.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '12px' }}>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>CURRENT</span><br /><span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{originalStatus}</span></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>DATE</span><br /><strong>{fmtShortDate(selectedAttendance?.date)}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>STUDENT</span><br /><strong>{selectedStudent.studentName}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>RECORDED BY</span><br /><strong>{selectedAttendance?.recorded_by_name || '—'}</strong></div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>CORRECT ATTENDANCE TO</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {(['Present', 'Absent', 'Late', 'Excused'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setCorrectionStatus(st)}
                      style={{
                        padding: '10px', borderRadius: '8px',
                        border: correctionStatus === st ? '2px solid #002b49' : '1px solid #cbd5e1',
                        backgroundColor: correctionStatus === st ? '#f0f9ff' : '#ffffff',
                        fontWeight: 'bold', fontSize: '12px', color: '#0f172a', cursor: 'pointer'
                      }}>
                      {st} {correctionStatus === st && '✓'}
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reason for Correction *</label>
                  <select value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>Student was incorrectly marked absent</option>
                    <option>Late arrival verified by teacher</option>
                    <option>Medical excuse submitted</option>
                    <option>Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Supporting Note (Optional)</label>
                  <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add any supporting notes..." style={{ width: '100%', height: '60px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }} />
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px', fontSize: '11px', color: '#1e40af' }}>
                  ℹ️ This correction will be logged with your credential and a UTC timestamp.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal('confirm')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Review Adjustment →</button>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'confirm' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Confirm Attendance Adjustment</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: '10px', alignItems: 'center', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '10px', fontWeight: 'bold', color: '#991b1b', fontSize: '13px' }}>Original: {originalStatus}</div>
                  <div style={{ fontSize: '18px', color: '#64748b' }}>→</div>
                  <div style={{ backgroundColor: '#dcfce7', padding: '12px', borderRadius: '10px', fontWeight: 'bold', color: '#166534', fontSize: '13px' }}>Corrected: {correctionStatus}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>REASON</div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a', marginTop: '2px' }}>{correctionReason}</div>
                </div>

                {adminNote && (
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}>NOTE</div>
                    <div style={{ color: '#334155', marginTop: '2px', fontStyle: 'italic' }}>"{adminNote}"</div>
                  </div>
                )}

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', color: '#475569' }}>
                  🛡️ This action will be permanently recorded in the audit history.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('correct')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Back</button>
                <button
                  onClick={handleSaveCorrection}
                  disabled={isSavingCorrection}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', opacity: isSavingCorrection ? 0.6 : 1 }}>
                  {isSavingCorrection ? 'Saving…' : 'Confirm Adjustment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'export' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '640px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Export Attendance</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Download the current list of students requiring attention.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}>Attention records ✓</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{attentionStudents.length} records</div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>EXPORT FORMAT</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <button disabled style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc', fontWeight: 'bold', fontSize: '12px', color: '#94a3b8', cursor: 'not-allowed' }}>PDF (soon)</button>
                  <button disabled style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc', fontWeight: 'bold', fontSize: '12px', color: '#94a3b8', cursor: 'not-allowed' }}>Excel (soon)</button>
                  <button style={{ border: '2px solid #002b49', borderRadius: '10px', padding: '12px', backgroundColor: '#f0f9ff', fontWeight: 'bold', fontSize: '12px', color: '#002b49', cursor: 'pointer' }}>CSV ✓</button>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleExport} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Download CSV</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};