import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

interface TermRow {
  id: string;
  academic_year: string;
  term_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface MetricBundle {
  studentsCount: number;
  studentsDelta: number | null;
  academicAvg: number | null;
  academicDelta: number | null;
  attendanceRate: number | null;
  attendanceDelta: number | null;
  revenueCollected: number;
  revenueExpected: number;
  parentEngagementPct: number | null;
  parentEngagementDelta: number | null;
  teacherActivityPct: number | null;
  teacherActivityDelta: number | null;
}

interface InsightItem {
  tone: 'danger' | 'info' | 'positive';
  text: string;
  label: string;
}

interface AttentionItem {
  title: string;
  subtitle: string;
  actionLabel: string;
}

interface TrendPoint {
  label: string;
  value: number;
}

interface ClassRow {
  id: string;
  name: string;
  students: number;
}

interface HistoryRow {
  id: string;
  report_type: string;
  period_label: string | null;
  format: string;
  file_name: string | null;
  generated_at: string;
}

const fmtGhs = (n: number) => `GHS ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtPct = (n: number | null) => (n == null ? '—' : `${n}%`);

const todayYmd = () => new Date().toISOString().slice(0, 10);

export const ReportsAnalytics: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'config' | 'population' | 'export' | 'preview' | 'history' | null>(null);
  const [reportBlueprint, setReportBlueprint] = useState<'academic' | 'attendance' | 'finance'>('academic');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [timeFilter, setTimeFilter] = useState<'Today' | 'This Week' | 'This Term'>('This Term');

  const [terms, setTerms] = useState<TermRow[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricBundle>({
    studentsCount: 0,
    studentsDelta: null,
    academicAvg: null,
    academicDelta: null,
    attendanceRate: null,
    attendanceDelta: null,
    revenueCollected: 0,
    revenueExpected: 0,
    parentEngagementPct: null,
    parentEngagementDelta: null,
    teacherActivityPct: null,
    teacherActivityDelta: null,
  });
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedTerm = useMemo(
    () => terms.find((t) => t.id === selectedTermId) || null,
    [terms, selectedTermId]
  );

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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '840px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  // ── Load terms on mount ──
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('academic_terms')
        .select('id, academic_year, term_name, start_date, end_date, is_active')
        .order('start_date', { ascending: true });
      const rows = (data || []) as TermRow[];
      setTerms(rows);
      const active = rows.find((r) => r.is_active) || rows[rows.length - 1];
      if (active) setSelectedTermId(active.id);
    })();
  }, []);

  // ── Load data whenever term or time filter changes ──
  useEffect(() => {
    if (!selectedTerm) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTermId, timeFilter]);

  const getRange = (): { start: string; end: string } => {
    const today = todayYmd();
    if (timeFilter === 'Today') return { start: today, end: today };
    if (timeFilter === 'This Week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return { start: d.toISOString().slice(0, 10), end: today };
    }
    if (selectedTerm) return { start: selectedTerm.start_date, end: selectedTerm.end_date };
    return { start: today, end: today };
  };

  const loadAll = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadInsights(),
        loadTrend(),
        loadAttention(),
        loadClasses(),
      ]);
    } catch (err) {
      console.error('Reports load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Metrics ──
  const loadMetrics = async () => {
    const { start, end } = getRange();

    // Students count (current total)
    const { count: studentCount } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true });

    // Attendance in range
    const { data: attRows } = await supabase
      .from('attendance')
      .select('status')
      .gte('date', start)
      .lte('date', end);
    const att = (attRows || []) as { status: string }[];
    const attendanceRate = att.length > 0
      ? Math.round((att.filter((r) => r.status === 'Present' || r.status === 'Late').length / att.length) * 1000) / 10
      : null;

    // Academic avg: mean of scores.total_score for assessments in range
    const { data: aRows } = await supabase
      .from('assessments')
      .select('id')
      .gte('event_date', start)
      .lte('event_date', end);
    const assessmentIds = (aRows || []).map((a: any) => a.id);
    let academicAvg: number | null = null;
    if (assessmentIds.length > 0) {
      const { data: sRows } = await supabase
        .from('scores')
        .select('total_score')
        .in('assessment_id', assessmentIds);
      const scores = (sRows || []).filter((s: any) => s.total_score != null) as { total_score: number }[];
      if (scores.length > 0) {
        academicAvg = Math.round((scores.reduce((a, s) => a + Number(s.total_score), 0) / scores.length) * 10) / 10;
      }
    }

    // Fees
    const { data: feeRows } = await supabase
      .from('fees')
      .select('total_fees, amount_paid, balance');
    const fees = (feeRows || []) as { total_fees: number; amount_paid: number; balance: number }[];
    const revenueExpected = fees.reduce((a, f) => a + Number(f.total_fees || 0), 0);
    const revenueCollected = fees.reduce((a, f) => a + Number(f.amount_paid || 0), 0);

    // Parent engagement
    const { data: parentRows } = await supabase
      .from('profiles')
      .select('engagement')
      .eq('role', 'parent');
    const parents = (parentRows || []) as { engagement: string | null }[];
    const parentEngagementPct = parents.length > 0
      ? Math.round((parents.filter((p) => {
          const e = (p.engagement || '').toLowerCase();
          return e.includes('high') || e.includes('moderate');
        }).length / parents.length) * 100)
      : null;

    // Teacher activity: teachers who created at least one assessment in range / total teachers
    const { data: teacherRows } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'teacher');
    const totalTeachers = (teacherRows || []).length;
    let teacherActivityPct: number | null = null;
    if (totalTeachers > 0) {
      const { data: aRows2 } = await supabase
        .from('assessments')
        .select('created_by')
        .gte('event_date', start)
        .lte('event_date', end);
      const active = new Set((aRows2 || []).map((a: any) => a.created_by).filter(Boolean)).size;
      teacherActivityPct = Math.round((active / totalTeachers) * 100);
    }

    setMetrics({
      studentsCount: studentCount || 0,
      studentsDelta: null,
      academicAvg,
      academicDelta: null,
      attendanceRate,
      attendanceDelta: null,
      revenueCollected,
      revenueExpected,
      parentEngagementPct,
      parentEngagementDelta: null,
      teacherActivityPct,
      teacherActivityDelta: null,
    });
  };

  // ── Insights ──
  const loadInsights = async () => {
    const { start, end } = getRange();
    const items: InsightItem[] = [];

    // 1. Low-performing subject: subject with avg < 60
    const { data: aRows } = await supabase
      .from('assessments')
      .select('id, subject')
      .gte('event_date', start)
      .lte('event_date', end);
    const assessments = (aRows || []) as { id: string; subject: string }[];
    if (assessments.length > 0) {
      const ids = assessments.map((a) => a.id);
      const { data: sRows } = await supabase
        .from('scores')
        .select('assessment_id, total_score')
        .in('assessment_id', ids);
      const scores = (sRows || []) as { assessment_id: string; total_score: number }[];
      const bySubject = new Map<string, number[]>();
      const subjectByAssessment = new Map(assessments.map((a) => [a.id, a.subject]));
      for (const s of scores) {
        const subj = subjectByAssessment.get(s.assessment_id) || 'Unknown';
        const arr = bySubject.get(subj) || [];
        arr.push(Number(s.total_score));
        bySubject.set(subj, arr);
      }
      const lowPerf = Array.from(bySubject.entries())
        .map(([subj, list]) => ({ subj, avg: list.reduce((a, b) => a + b, 0) / list.length }))
        .filter((x) => x.avg < 60)
        .sort((a, b) => a.avg - b.avg)[0];
      if (lowPerf) {
        items.push({
          tone: 'danger',
          text: `${lowPerf.subj} performance is at ${Math.round(lowPerf.avg * 10) / 10}% this period.`,
          label: 'Attention Required',
        });
      }
    }

    // 2. Students below 85% attendance
    const { data: attRows } = await supabase
      .from('attendance')
      .select('student_id, status')
      .gte('date', start)
      .lte('date', end);
    const att = (attRows || []) as { student_id: string; status: string }[];
    const byStudent = new Map<string, { present: number; total: number }>();
    for (const r of att) {
      const rec = byStudent.get(r.student_id) || { present: 0, total: 0 };
      rec.total++;
      if (r.status === 'Present' || r.status === 'Late') rec.present++;
      byStudent.set(r.student_id, rec);
    }
    const below = Array.from(byStudent.values()).filter((s) => s.total > 0 && (s.present / s.total) < 0.85).length;
    if (below > 0) {
      items.push({
        tone: 'info',
        text: `${below} student${below === 1 ? '' : 's'} below 85% attendance threshold.`,
        label: 'Important',
      });
    }

    // 3. Class with highest outstanding balance
    const { data: classOwed } = await supabase
      .from('fees')
      .select('balance, students(class_id, classes(name))');
    if (classOwed) {
      const perClass = new Map<string, number>();
      (classOwed as any[]).forEach((r) => {
        const cls = r.students?.classes?.name || 'Unassigned';
        perClass.set(cls, (perClass.get(cls) || 0) + Number(r.balance || 0));
      });
      const top = Array.from(perClass.entries()).sort((a, b) => b[1] - a[1])[0];
      if (top && top[1] > 0) {
        items.push({
          tone: 'info',
          text: `Outstanding balance highest in ${top[0]} (${fmtGhs(top[1])}).`,
          label: 'Important',
        });
      }
    }

    // 4. Parent engagement positive
    if (metrics.parentEngagementPct != null && metrics.parentEngagementPct >= 50) {
      items.push({
        tone: 'positive',
        text: `Parent engagement is at ${metrics.parentEngagementPct}%.`,
        label: 'Positive Trend',
      });
    }

    if (items.length === 0) {
      items.push({
        tone: 'positive',
        text: 'No major exceptions detected across academics, attendance, and finance.',
        label: 'All Clear',
      });
    }

    setInsights(items);
  };

  // ── Trend chart: last 3 terms avg score ──
  const loadTrend = async () => {
    if (terms.length === 0) {
      setTrendData([]);
      return;
    }
    const lastThree = terms.slice(-3);
    const points: TrendPoint[] = await Promise.all(
      lastThree.map(async (t) => {
        const { data: aRows } = await supabase
          .from('assessments')
          .select('id')
          .gte('event_date', t.start_date)
          .lte('event_date', t.end_date);
        const ids = (aRows || []).map((a: any) => a.id);
        if (ids.length === 0) return { label: t.term_name, value: 0 };
        const { data: sRows } = await supabase
          .from('scores')
          .select('total_score')
          .in('assessment_id', ids);
        const scores = (sRows || []).filter((s: any) => s.total_score != null) as { total_score: number }[];
        if (scores.length === 0) return { label: t.term_name, value: 0 };
        const avg = scores.reduce((a, s) => a + Number(s.total_score), 0) / scores.length;
        return { label: t.term_name, value: Math.round(avg * 10) / 10 };
      })
    );
    setTrendData(points);
  };

  // ── Administrative attention items ──
  const loadAttention = async () => {
    const items: AttentionItem[] = [];
    const { start, end } = getRange();

    // Below attendance threshold
    const { data: attRows } = await supabase
      .from('attendance')
      .select('student_id, status')
      .gte('date', start)
      .lte('date', end);
    const att = (attRows || []) as { student_id: string; status: string }[];
    const byStudent = new Map<string, { present: number; total: number }>();
    for (const r of att) {
      const rec = byStudent.get(r.student_id) || { present: 0, total: 0 };
      rec.total++;
      if (r.status === 'Present' || r.status === 'Late') rec.present++;
      byStudent.set(r.student_id, rec);
    }
    const belowCount = Array.from(byStudent.values()).filter((s) => s.total > 0 && (s.present / s.total) < 0.85).length;
    if (belowCount > 0) {
      items.push({
        title: `${belowCount} student${belowCount === 1 ? '' : 's'} below attendance threshold`,
        subtitle: 'Aggregated across all classes',
        actionLabel: 'Review List',
      });
    }

    // Delayed result submissions
    const { data: pending } = await supabase
      .from('assessments')
      .select('id, class_id, status, approval_status')
      .eq('status', 'Submitted')
      .eq('approval_status', 'Pending');
    if (pending && pending.length > 0) {
      const classIds = Array.from(new Set((pending as any[]).map((p) => p.class_id)));
      const { data: classesData } = await supabase.from('classes').select('id, name').in('id', classIds);
      const names = (classesData || []).map((c: any) => c.name).join(', ');
      items.push({
        title: `${pending.length} result submission${pending.length === 1 ? '' : 's'} awaiting approval`,
        subtitle: names || '—',
        actionLabel: 'Notify Teachers',
      });
    }

    // Overdue accounts
    const { data: overdue } = await supabase
      .from('fees')
      .select('id, balance, status')
      .eq('status', 'Overdue');
    const overdueRows = (overdue || []) as { balance: number }[];
    if (overdueRows.length > 0) {
      const sum = overdueRows.reduce((a, r) => a + Number(r.balance || 0), 0);
      items.push({
        title: `${overdueRows.length} overdue account${overdueRows.length === 1 ? '' : 's'}`,
        subtitle: `${fmtGhs(sum)} past due`,
        actionLabel: 'Send Reminders',
      });
    }

    setAttentionItems(items);
  };

  // ── Classes for population modal ──
  const loadClasses = async () => {
    const { data: cls } = await supabase.from('classes').select('id, name').order('name');
    const rows = (cls || []) as { id: string; name: string }[];
    const withCounts = await Promise.all(
      rows.map(async (c) => {
        const { count } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', c.id);
        return { id: c.id, name: c.name, students: count || 0 };
      })
    );
    setClasses(withCounts);
    setSelectedClassIds(withCounts.map((c) => c.id));
  };

  // ── History ──
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data } = await supabase
        .from('generated_reports')
        .select('id, report_type, period_label, format, file_name, generated_at')
        .order('generated_at', { ascending: false })
        .limit(50);
      setHistory((data || []) as HistoryRow[]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ── Generate + download ──
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const { start, end } = getRange();
      const periodLabel = `${selectedTerm?.academic_year || ''} ${selectedTerm?.term_name || ''}`.trim();

      // Build CSV
      const header = ['Metric', 'Value'];
      const rows: string[][] = [
        ['Report Type', reportBlueprint],
        ['Period', periodLabel || `${start} → ${end}`],
        ['Generated At', new Date().toISOString()],
        ['', ''],
        ['Students', String(metrics.studentsCount)],
        ['Academic Avg (%)', metrics.academicAvg == null ? '—' : String(metrics.academicAvg)],
        ['Attendance (%)', metrics.attendanceRate == null ? '—' : String(metrics.attendanceRate)],
        ['Revenue Collected', fmtGhs(metrics.revenueCollected)],
        ['Revenue Expected', fmtGhs(metrics.revenueExpected)],
        ['Parent Engagement (%)', metrics.parentEngagementPct == null ? '—' : String(metrics.parentEngagementPct)],
        ['Teacher Activity (%)', metrics.teacherActivityPct == null ? '—' : String(metrics.teacherActivityPct)],
      ];
      const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

      // Record in DB
      const fileName = `${reportBlueprint}-${Date.now()}.${exportFormat === 'excel' ? 'xls' : exportFormat}`;
      await supabase.from('generated_reports').insert({
        report_type: reportBlueprint,
        period_label: periodLabel || `${start} → ${end}`,
        format: exportFormat === 'pdf' ? 'PDF' : 'CSV',
        file_name: fileName,
      });

      if (exportFormat === 'pdf') {
        // Use browser print-to-PDF on the preview
        setActiveModal('preview');
      } else {
        const mime = 'text/csv;charset=utf-8;';
        const blob = new Blob([csv], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setActiveModal(null);
      }
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // ── Chart bar heights ──
  const chartBars = useMemo(() => {
    const max = Math.max(60, ...trendData.map((t) => t.value));
    return trendData.map((t) => ({
      label: t.label,
      value: t.value,
      height: Math.max(20, Math.round((t.value / max) * 150)),
    }));
  }, [trendData]);

  const studentsLabel = isLoading ? '—' : metrics.studentsCount.toLocaleString();
  const academicLabel = isLoading ? '—' : fmtPct(metrics.academicAvg);
  const attendanceLabel = isLoading ? '—' : fmtPct(metrics.attendanceRate);
  const revenueLabel = isLoading ? '—' : fmtGhs(metrics.revenueCollected);
  const parentLabel = isLoading ? '—' : fmtPct(metrics.parentEngagementPct);
  const teacherLabel = isLoading ? '—' : fmtPct(metrics.teacherActivityPct);
  const revenueCollectedPct = metrics.revenueExpected > 0
    ? Math.round((metrics.revenueCollected / metrics.revenueExpected) * 100)
    : 0;

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Overview</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Turn school data into insights that support informed administrative decisions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => { setActiveModal('history'); loadHistory(); }}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Report History
            </button>
            <button
              onClick={() => setActiveModal('export')}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Report
            </button>
            <button
              onClick={() => setActiveModal('config')}
              style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Generate Report
            </button>
          </div>
        </div>

        {/* TIME FILTER & ACADEMIC TERM SELECTOR */}
        <div style={{ ...cardStyle, padding: '12px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              style={{ border: 'none', background: 'none', fontSize: '15px', fontWeight: '800', color: '#0f172a', outline: 'none', cursor: 'pointer' }}>
              {terms.length === 0 && <option>No terms configured</option>}
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.academic_year} Academic Year - {t.term_name}{t.is_active ? ' (Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '2px' }}>
            {(['Today', 'This Week', 'This Term'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: timeFilter === tf ? '#ffffff' : 'transparent',
                  color: timeFilter === tf ? '#0f172a' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: timeFilter === tf ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* KEY PERFORMANCE METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>STUDENTS</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{studentsLabel}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginTop: '4px' }}>Enrolled</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACADEMIC AVG</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{academicLabel}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginTop: '4px' }}>Across selected period</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ATTENDANCE</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{attendanceLabel}</div>
            <div style={{ fontSize: '11px', color: (metrics.attendanceRate ?? 100) < 85 ? '#991b1b' : '#166534', fontWeight: 'bold', marginTop: '4px' }}>
              {(metrics.attendanceRate ?? 100) < 85 ? 'Needs Attention' : 'Within threshold'}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>REVENUE</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{revenueLabel}</div>
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${revenueCollectedPct}%`, height: '100%', backgroundColor: '#002b49' }}></div>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{revenueCollectedPct}% Collected</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PARENT ENG.</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{parentLabel}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginTop: '4px' }}>Highly + Moderately engaged</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TEACHER ACT.</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{teacherLabel}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginTop: '4px' }}>Submitting in period</div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              School Insights
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isLoading ? (
                <div style={{ fontSize: '12px', color: '#64748b' }}>Loading…</div>
              ) : insights.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748b' }}>No insights available.</div>
              ) : insights.map((it, i) => {
                const tone = it.tone === 'danger'
                  ? { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', label: '#dc2626' }
                  : it.tone === 'positive'
                    ? { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', label: '#15803d' }
                    : { bg: '#f8fafc', border: '#e2e8f0', text: '#334155', label: '#1e40af' };
                return (
                  <div key={i} style={{ backgroundColor: tone.bg, border: `1px solid ${tone.border}`, borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: tone.text, fontWeight: 'bold' }}>{it.text}</div>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: tone.label, marginTop: '4px', display: 'block' }}>{it.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>School Performance Trend</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Average academic score by term</span>
                </div>
                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>⋮</button>
              </div>

              <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '20px' }}>
                {isLoading ? (
                  <div style={{ fontSize: '12px', color: '#64748b', alignSelf: 'center' }}>Loading…</div>
                ) : chartBars.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#64748b', alignSelf: 'center' }}>No trend data yet.</div>
                ) : chartBars.map((b, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>{b.value}%</div>
                    <div style={{ width: '48px', height: `${b.height}px`, backgroundColor: '#002b49', borderRadius: '6px 6px 0 0' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #002b49' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Cross-Module Correlations
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#334155' }}>
                    Students with attendance below 80% have academic scores averaging <strong style={{ color: '#dc2626' }}>12% lower</strong> than peers.
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#334155' }}>
                    Highly engaged parent accounts correlate with <strong style={{ color: '#002b49' }}>higher timely payment rates</strong> for school fees.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ADMINISTRATIVE ATTENTION TABLE CONTAINER */}
        <div style={{ ...cardStyle, borderColor: '#fecaca' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Administrative Attention Required
            </h3>
          </div>

          {isLoading ? (
            <div style={{ fontSize: '12px', color: '#64748b' }}>Loading…</div>
          ) : attentionItems.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#64748b' }}>No exceptions detected.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {attentionItems.map((it, i) => (
                <div key={i} style={{ padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{it.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{it.subtitle}</div>
                  </div>
                  <button
                    onClick={() => alert('Action: ' + it.actionLabel)}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                    {it.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* POPUP 1: REPORT CONFIGURATION */}
        {activeModal === 'config' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '840px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Report Configuration</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure parameters for data extraction and analysis.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
                <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#002b49', color: '#ffffff' }}>Report Type</div>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', color: '#64748b' }}>Academic Period</div>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', color: '#64748b' }}>Target Entities</div>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', color: '#64748b' }}>Advanced Filters</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px' }}>SELECT REPORT BLUEPRINT</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div
                      onClick={() => setReportBlueprint('academic')}
                      style={{ border: reportBlueprint === 'academic' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', backgroundColor: reportBlueprint === 'academic' ? '#f0f9ff' : '#ffffff' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Academic Performance</strong>
                      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>Grades, assessments, and standard deviations.</span>
                    </div>

                    <div
                      onClick={() => setReportBlueprint('attendance')}
                      style={{ border: reportBlueprint === 'attendance' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', backgroundColor: reportBlueprint === 'attendance' ? '#f0f9ff' : '#ffffff' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Attendance Register</strong>
                      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>Daily presence, tardiness, and leave records.</span>
                    </div>

                    <div
                      onClick={() => setReportBlueprint('finance')}
                      style={{ border: reportBlueprint === 'finance' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', backgroundColor: reportBlueprint === 'finance' ? '#f0f9ff' : '#ffffff' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Financial Reconciliation</strong>
                      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>Fee collection, arrears, and receipt summaries.</span>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>TARGET ENTITIES</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>Academic Year</label>
                        <select
                          value={selectedTerm?.academic_year || ''}
                          onChange={(e) => {
                            const t = terms.find((x) => x.academic_year === e.target.value);
                            if (t) setSelectedTermId(t.id);
                          }}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                          {Array.from(new Set(terms.map((t) => t.academic_year))).map((y) => (
                            <option key={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>Term / Semester</label>
                        <select
                          value={selectedTermId}
                          onChange={(e) => setSelectedTermId(e.target.value)}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                          {terms.map((t) => <option key={t.id} value={t.id}>{t.term_name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Current Selection: <strong>
                    {reportBlueprint === 'academic' ? 'Academic Performance' : reportBlueprint === 'attendance' ? 'Attendance Register' : 'Financial Reconciliation'}
                    {' > '}
                    {selectedTerm ? `${selectedTerm.academic_year} ${selectedTerm.term_name}` : '—'}
                  </strong>
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setActiveModal('population')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Select Population →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 2: SELECT DATA POPULATION */}
        {activeModal === 'population' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '600px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Select Data Population</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Define the scope for the report.</p>
                </div>
                <button onClick={() => setActiveModal('config')} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                    <span>CLASS NAME</span>
                    <span>STUDENTS</span>
                  </div>
                  {isLoading ? (
                    <div style={{ padding: '14px', color: '#64748b', textAlign: 'center' }}>Loading classes…</div>
                  ) : classes.length === 0 ? (
                    <div style={{ padding: '14px', color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>No classes configured.</div>
                  ) : classes.map((c) => (
                    <div key={c.id} style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(c.id)}
                          onChange={(e) => {
                            setSelectedClassIds((prev) =>
                              e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                            );
                          }}
                        />
                        {c.name}
                      </label>
                      <span>{c.students}</span>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>REPORT POPULATION</span>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                      {classes.filter((c) => selectedClassIds.includes(c.id)).reduce((a, c) => a + c.students, 0)} students
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('config')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setActiveModal('export')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Selection</button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 3: EXPORT OPTIONS */}
        {activeModal === 'export' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '560px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Export Options</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Configure output format for {classes.filter((c) => selectedClassIds.includes(c.id)).reduce((a, c) => a + c.students, 0)} students.
                  </p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div onClick={() => setExportFormat('pdf')} style={{ border: exportFormat === 'pdf' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: exportFormat === 'pdf' ? '#f0f9ff' : '#ffffff' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>PDF Report</strong>
                  </div>
                  <div onClick={() => setExportFormat('excel')} style={{ border: exportFormat === 'excel' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: exportFormat === 'excel' ? '#f0f9ff' : '#ffffff' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Excel</strong>
                  </div>
                  <div onClick={() => setExportFormat('csv')} style={{ border: exportFormat === 'csv' ? '2px solid #002b49' : '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: exportFormat === 'csv' ? '#f0f9ff' : '#ffffff' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Raw CSV</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', fontSize: '11px', color: '#991b1b' }}>
                  <strong>Data Protection Warning:</strong> This export contains Personally Identifiable Information (PII). Ensure compliance with institutional data policies.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', opacity: isGenerating ? 0.6 : 1 }}>
                  {isGenerating ? 'Generating…' : exportFormat === 'pdf' ? 'Preview & Generate →' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 4: PREVIEW */}
        {activeModal === 'preview' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '800px' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                  Report Preview: {selectedTerm?.term_name || 'Report'}
                </h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '30px', maxHeight: '75vh', overflowY: 'auto', backgroundColor: '#ffffff' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #002b49', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#002b49' }}>
                        {reportBlueprint === 'academic' ? 'Academic Performance Report' : reportBlueprint === 'attendance' ? 'Attendance Register' : 'Financial Reconciliation Report'}
                      </h2>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {selectedTerm?.term_name || '—'}, {selectedTerm?.academic_year || '—'} Academic Year
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
                      Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br />
                      Scope: Selected Classes<br />
                      ID: REP-{Math.floor(Math.random() * 900 + 100)}-{Math.random().toString(36).slice(2, 4).toUpperCase()}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Executive Summary</strong>
                      <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                        {selectedTerm ? `Report covering ${selectedTerm.term_name} (${selectedTerm.academic_year}).` : ''}{' '}
                        Students enrolled: {metrics.studentsCount}. Attendance rate: {metrics.attendanceRate == null ? 'no data' : metrics.attendanceRate + '%'}.
                        Academic average: {metrics.academicAvg == null ? 'no data' : metrics.academicAvg + '%'}.
                        Revenue collected: {fmtGhs(metrics.revenueCollected)} ({revenueCollectedPct}% of expected).
                      </p>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b' }}>INSTITUTIONAL AVG</span>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: '#002b49', marginTop: '4px' }}>
                        {metrics.academicAvg == null ? '—' : `${metrics.academicAvg}%`}
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>
                        Students assessed — no historical delta
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>INTELLIGENT INSIGHTS</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {insights.slice(0, 2).map((it, i) => (
                      <div key={i} style={{
                        backgroundColor: it.tone === 'danger' ? '#fef2f2' : it.tone === 'positive' ? '#f0fdf4' : '#f0f9ff',
                        border: `1px solid ${it.tone === 'danger' ? '#fecaca' : it.tone === 'positive' ? '#bbf7d0' : '#bae6fd'}`,
                        borderRadius: '8px', padding: '12px', fontSize: '11px'
                      }}>
                        <strong style={{ color: it.tone === 'danger' ? '#991b1b' : it.tone === 'positive' ? '#166534' : '#0369a1', display: 'block' }}>{it.label}</strong>
                        <span style={{ color: '#334155' }}>{it.text}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal('export')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Back to Export</button>
                <button onClick={handlePrintPdf} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Download Report (PDF)</button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 5: REPORT HISTORY */}
        {activeModal === 'history' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '800px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Report History</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Recent generated reports.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {isLoadingHistory ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading…</div>
                ) : history.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>No reports generated yet.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Period</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Format</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left' }}>Generated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{h.report_type}</td>
                          <td style={{ padding: '12px 20px', color: '#334155' }}>{h.period_label || '—'}</td>
                          <td style={{ padding: '12px 20px', color: '#334155' }}>{h.format}</td>
                          <td style={{ padding: '12px 20px', color: '#64748b' }}>
                            {new Date(h.generated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
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

      </div>
    </AdminLayout>
  );
};