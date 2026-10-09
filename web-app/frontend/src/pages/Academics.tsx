import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import {
  getAcademicsDashboard,
  getActiveTerm,
  getGradeScale,
  replaceGradeScale,
  approveAssessment,
  rejectAssessment,
  publishAssessment,
} from '../services/teacherService';
import type {
  AcademicsDashboard,
  AcademicTerm,
  GradeScaleRow,
  AdminAssessmentRow,
} from '../services/teacherService';

const formatDate = (ymd: string | null): string => {
  if (!ymd) return '—';
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const daysBetween = (a: Date, b: Date): number => Math.ceil((b.getTime() - a.getTime()) / 86400000);

export const Academics: React.FC = () => {
  const [dashboard, setDashboard] = useState<AcademicsDashboard | null>(null);
  const [term, setTerm] = useState<AcademicTerm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modals
  const [activeModal, setActiveModal] = useState<'approve' | 'reject' | 'publish' | 'gradeScale' | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AdminAssessmentRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  // grade scale editor
  const [gradeRows, setGradeRows] = useState<GradeScaleRow[]>([]);
  const [savingGrades, setSavingGrades] = useState(false);

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, t] = await Promise.all([getAcademicsDashboard(), getActiveTerm()]);
      setDashboard(d);
      setTerm(t);
    } catch (err: any) {
      setError(err?.message || 'Could not load academics dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openApprove = (a: AdminAssessmentRow) => { setSelectedAssessment(a); setActiveModal('approve'); };
  const openReject = (a: AdminAssessmentRow) => { setSelectedAssessment(a); setRejectReason(''); setActiveModal('reject'); };
  

  const handleApprove = async () => {
    if (!selectedAssessment) return;
    setActionBusy(true);
    try {
      await approveAssessment(selectedAssessment.id);
      setActiveModal(null);
      await load();
    } catch (err: any) { alert(err?.message || 'Could not approve.'); }
    finally { setActionBusy(false); }
  };

  const handleReject = async () => {
    if (!selectedAssessment) return;
    setActionBusy(true);
    try {
      await rejectAssessment(selectedAssessment.id, rejectReason);
      setActiveModal(null);
      await load();
    } catch (err: any) { alert(err?.message || 'Could not reject.'); }
    finally { setActionBusy(false); }
  };

  const handlePublish = async () => {
    if (!selectedAssessment) return;
    setActionBusy(true);
    try {
      await publishAssessment(selectedAssessment.id);
      setActiveModal(null);
      await load();
    } catch (err: any) { alert(err?.message || 'Could not publish.'); }
    finally { setActionBusy(false); }
  };

  const openGradeScale = async () => {
    try {
      const rows = await getGradeScale();
      setGradeRows(rows);
      setActiveModal('gradeScale');
    } catch (err: any) { alert(err?.message || 'Could not load grade scale.'); }
  };

  const updateGradeRow = (idx: number, patch: Partial<GradeScaleRow>) => {
    setGradeRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const handleSaveGradeScale = async () => {
    // validate: no overlaps, ascending
    const sorted = [...gradeRows].sort((a, b) => b.minScore - a.minScore);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].minScore <= sorted[i + 1].maxScore) {
        alert(`Grade ranges overlap between ${sorted[i].grade} and ${sorted[i + 1].grade}.`);
        return;
      }
    }
    setSavingGrades(true);
    try {
      await replaceGradeScale(
        gradeRows.map((r) => ({ grade: r.grade, minScore: r.minScore, maxScore: r.maxScore, remark: r.remark }))
      );
      setActiveModal(null);
      await load();
    } catch (err: any) { alert(err?.message || 'Could not save grade scale.'); }
    finally { setSavingGrades(false); }
  };

  const d = dashboard;

  // Term status computation
  const deadline = term?.submissionDeadline || null;
  const daysRemaining = deadline
    ? daysBetween(new Date(), new Date(`${deadline}T00:00:00`))
    : null;
  const termProgressPct = term
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((Date.now() - new Date(`${term.startDate}T00:00:00`).getTime()) /
              (new Date(`${term.endDate}T00:00:00`).getTime() -
                new Date(`${term.startDate}T00:00:00`).getTime())) *
              100
          )
        )
      )
    : 0;

  // real computed insights
  const insights: { tone: 'warn' | 'danger' | 'info'; title: string; body: string }[] = [];
  if (d) {
    const noAssessmentClasses = d.classes.filter((c) => c.assessmentCount === 0).length;
    if (noAssessmentClasses > 0) {
      insights.push({
        tone: 'warn',
        title: 'Classes without assessments',
        body: `${noAssessmentClasses} class${noAssessmentClasses === 1 ? '' : 'es'} have no assessments yet.`,
      });
    }
    const lowPerf = d.classes.filter((c) => c.avgScore != null && c.avgScore < 60);
    if (lowPerf.length > 0) {
      insights.push({
        tone: 'danger',
        title: 'Low average performance',
        body: `${lowPerf.length} class${lowPerf.length === 1 ? '' : 'es'} average below 60% (${lowPerf
          .map((c) => c.className)
          .join(', ')}).`,
      });
    }
    if (d.pendingApprovalCount > 0) {
      insights.push({
        tone: 'info',
        title: 'Results awaiting approval',
        body: `${d.pendingApprovalCount} submitted assessment${d.pendingApprovalCount === 1 ? '' : 's'} need your review.`,
      });
    }
    const incomplete = d.classes.filter((c) => c.completionPct < 100 && c.assessmentCount > 0);
    if (incomplete.length > 0) {
      insights.push({
        tone: 'warn',
        title: 'Score entry incomplete',
        body: `${incomplete.length} class${incomplete.length === 1 ? '' : 'es'} still have scores missing.`,
      });
    }
    if (insights.length === 0) {
      insights.push({ tone: 'info', title: 'All clear', body: 'No issues detected across academics.' });
    }
  }

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Academic Management</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Monitor assessments, results, academic progress and result publishing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={term?.academicYear || ''}
              disabled
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', color: '#334155', backgroundColor: '#f8fafc' }}
            >
              <option>{term?.academicYear || '—'}</option>
            </select>
            <select
              value={term?.termName || ''}
              disabled
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', color: '#334155', backgroundColor: '#f8fafc' }}
            >
              <option>{term?.termName || '—'}</option>
            </select>
            <button
              onClick={openGradeScale}
              title="Grade Scale"
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* HERO BANNER */}
        {term && (
          <div style={{ backgroundColor: '#1e3a8a', borderRadius: '16px', padding: '20px 24px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '12px', borderRadius: '12px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{term.academicYear} — {term.termName}</h2>
                  <span style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>● Active</span>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                  {formatDate(term.startDate)} – {formatDate(term.endDate)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '32px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '24px' }}>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>RESULT SUBMISSION DEADLINE</div>
                <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px' }}>{formatDate(deadline)}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>TIME REMAINING</div>
                <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px', color: daysRemaining != null && daysRemaining < 0 ? '#fca5a5' : '#fde047' }}>
                  {daysRemaining == null ? '—' : daysRemaining < 0 ? `${-daysRemaining}d overdue` : `${daysRemaining} Days`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* METRICS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL ASSESSMENTS</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{loading ? '—' : d?.totalAssessments ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {d ? `${d.submittedCount} submitted, ${d.draftCount} draft` : ''}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>AVG SCORE (ALL)</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading || d?.avgScoreAll == null ? '—' : `${d.avgScoreAll}%`}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PENDING APPROVAL</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{loading ? '—' : d?.pendingApprovalCount ?? 0}</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PUBLISHED</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{loading ? '—' : d?.publishedCount ?? 0}</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>STUDENTS ASSESSED</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading || !d ? '—' : <>{d.studentsAssessed} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>/ {d.studentsTotal}</span></>}
            </div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: d && d.attentionCount > 0 ? '#fef2f2' : '#ffffff', borderColor: d && d.attentionCount > 0 ? '#fecaca' : '#e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: d && d.attentionCount > 0 ? '#991b1b' : '#64748b', textTransform: 'uppercase' }}>CLASSES NEEDING REVIEW</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: d && d.attentionCount > 0 ? '#991b1b' : '#0f172a', marginTop: '8px' }}>{loading ? '—' : d?.attentionCount ?? 0}</div>
          </div>
        </div>

        {/* PIPELINE */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Operations Pipeline</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '11px', color: '#002b49', textTransform: 'uppercase' }}>ASSESSMENT</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>{loading ? '—' : d?.totalAssessments ?? 0} Total</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{d ? `${d.submittedCount} submitted, ${d.draftCount} draft` : ''}</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '11px', color: '#002b49', textTransform: 'uppercase' }}>SUBMISSION</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#166534', margin: '6px 0 2px 0' }}>
                {loading || !d || d.totalAssessments === 0 ? '—' : `${Math.round((d.submittedCount / d.totalAssessments) * 100)}%`}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{d ? `${d.submittedCount} of ${d.totalAssessments}` : ''}</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '11px', color: '#002b49', textTransform: 'uppercase' }}>APPROVAL</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>{loading ? '—' : d?.approvedCount ?? 0} approved</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{d ? `${d.pendingApprovalCount} awaiting` : ''}</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '11px', color: '#002b49', textTransform: 'uppercase' }}>PUBLISHING</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#1e40af', margin: '6px 0 2px 0' }}>{loading ? '—' : d?.publishedCount ?? 0} published</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{d ? `${d.pendingApprovalCount + d.approvedCount} pending/ready` : ''}</div>
            </div>
          </div>
        </div>

        {/* INSIGHTS + SIDEBAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Intelligence Insights
            </div>

            {loading ? (
              <div style={{ fontSize: '12px', color: '#64748b' }}>Loading…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {insights.map((it, i) => {
                  const tone = it.tone === 'danger'
                    ? { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', sub: '#7f1d1d' }
                    : it.tone === 'warn'
                      ? { bg: '#fffbe3', border: '#fde047', color: '#854d0e', sub: '#713f12' }
                      : { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', sub: '#1e40af' };
                  return (
                    <div key={i} style={{ backgroundColor: tone.bg, border: `1px solid ${tone.border}`, borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontWeight: 'bold', color: tone.color, fontSize: '13px' }}>{it.title}</div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: tone.sub }}>{it.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Term progress */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Term Progress</h4>
              {term ? (
                <>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: `${termProgressPct}%`, height: '100%', backgroundColor: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{termProgressPct}% elapsed</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                    {formatDate(term.startDate)} → {formatDate(term.endDate)}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748b' }}>No active term.</div>
              )}
            </div>

            {/* Readiness checklist */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Readiness Checklist</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: term ? '#166534' : '#64748b', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Academic Period Configured
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: d && d.totalAssessments > 0 ? '#166534' : '#64748b', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Assessments Created ({d?.totalAssessments ?? 0})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: d && d.studentsTotal > 0 && d.studentsAssessed > 0 ? '#1e40af' : '#64748b', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {d && d.studentsTotal > 0 && d.studentsAssessed === d.studentsTotal
                      ? <polyline points="20 6 9 17 4 12"/>
                      : <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}
                  </svg>
                  Students Assessed ({d ? Math.round((d.studentsAssessed / Math.max(d.studentsTotal, 1)) * 100) : 0}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CLASS PERFORMANCE TABLE */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Class Performance Overview</h3>
          {loading ? (
            <div style={{ fontSize: '13px', color: '#64748b' }}>Loading…</div>
          ) : (d?.classes.length ?? 0) === 0 ? (
            <div style={{ fontSize: '13px', color: '#64748b' }}>No classes yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>CLASS</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>STUDENTS</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ASSESSMENTS</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>AVG SCORE</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>COMPLETION</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {d!.classes.map((cls) => (
                  <tr key={cls.classId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{cls.className}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{cls.studentsCount}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{cls.assessmentCount}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{cls.avgScore == null ? '—' : `${cls.avgScore}%`}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${cls.completionPct}%`, height: '100%', backgroundColor: '#10b981' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{cls.completionPct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: cls.status === 'Improving' ? '#dcfce7' : cls.status === 'Review' ? '#fee2e2' : '#f1f5f9',
                        color: cls.status === 'Improving' ? '#166534' : cls.status === 'Review' ? '#991b1b' : '#334155',
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

        {/* PENDING APPROVALS */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Results Awaiting Approval</h3>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>
              {d?.pendingApprovals.length ?? 0} item{(d?.pendingApprovals.length ?? 0) === 1 ? '' : 's'}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '24px', fontSize: '13px', color: '#64748b' }}>Loading…</div>
          ) : (d?.pendingApprovals.length ?? 0) === 0 ? (
            <div style={{ padding: '24px', fontSize: '13px', color: '#64748b' }}>
              No submitted assessments are waiting for review.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>ASSESSMENT</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>CLASS / SUBJECT</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>TEACHER</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>SCORES</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {d!.pendingApprovals.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#0f172a' }}>{a.title}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{a.className}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{a.subject}</div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>{a.teacherName}</td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>
                      {a.scoredCount} / {a.studentCount}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        backgroundColor: a.approvalStatus === 'Rejected' ? '#fee2e2' : '#fef3c7',
                        color: a.approvalStatus === 'Rejected' ? '#991b1b' : '#92400e',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                      }}>
                        {a.approvalStatus === 'Rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openApprove(a)}
                          style={{ backgroundColor: '#166534', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openReject(a)}
                          style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* APPROVED & PUBLISHED sub-list */}
          {!loading && d && d.approvedCount + d.publishedCount > 0 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                APPROVED / PUBLISHED SUMMARY
              </div>
              <div style={{ fontSize: '12px', color: '#334155' }}>
                {d.approvedCount} approved · {d.publishedCount} published
              </div>
            </div>
          )}
        </div>

        {/* APPROVE MODAL */}
        {activeModal === 'approve' && selectedAssessment && (
          <div style={modalOverlayStyle} onClick={() => !actionBusy && setActiveModal(null)}>
            <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Approve Results</h3>
                <button onClick={() => !actionBusy && setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedAssessment.title}</div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>{selectedAssessment.className} · {selectedAssessment.subject}</div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>Teacher: {selectedAssessment.teacherName}</div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>Scores: {selectedAssessment.scoredCount} / {selectedAssessment.studentCount}</div>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Approving this result set moves it to the publish queue.</p>
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => !actionBusy && setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={handleApprove} disabled={actionBusy} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#166534', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: actionBusy ? 'wait' : 'pointer', opacity: actionBusy ? 0.7 : 1 }}>
                  {actionBusy ? 'Approving…' : 'APPROVE'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECT MODAL */}
        {activeModal === 'reject' && selectedAssessment && (
          <div style={modalOverlayStyle} onClick={() => !actionBusy && setActiveModal(null)}>
            <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Reject Results</h3>
                <button onClick={() => !actionBusy && setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedAssessment.title}</div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>{selectedAssessment.className} · {selectedAssessment.subject}</div>
                </div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reason for rejection</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this submission is being sent back…"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => !actionBusy && setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={handleReject} disabled={actionBusy || !rejectReason.trim()} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#b91c1c', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: actionBusy || !rejectReason.trim() ? 'not-allowed' : 'pointer', opacity: actionBusy || !rejectReason.trim() ? 0.6 : 1 }}>
                  {actionBusy ? 'Rejecting…' : 'REJECT'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PUBLISH MODAL */}
        {activeModal === 'publish' && selectedAssessment && (
          <div style={modalOverlayStyle} onClick={() => !actionBusy && setActiveModal(null)}>
            <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Publish Results</h3>
                <button onClick={() => !actionBusy && setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedAssessment.title}</div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>{selectedAssessment.className} · {selectedAssessment.subject}</div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#991b1b', fontWeight: 'bold' }}>
                  ⚠️ Once published, results become visible to parents and students.
                </div>
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => !actionBusy && setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={handlePublish} disabled={actionBusy} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: actionBusy ? 'wait' : 'pointer', opacity: actionBusy ? 0.7 : 1 }}>
                  {actionBusy ? 'Publishing…' : 'PUBLISH RESULTS'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GRADE SCALE MODAL */}
        {activeModal === 'gradeScale' && (
          <div style={modalOverlayStyle} onClick={() => !savingGrades && setActiveModal(null)}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Grade Scale</h3>
                <button onClick={() => !savingGrades && setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>GRADE</th>
                      <th style={{ padding: '8px' }}>MIN</th>
                      <th style={{ padding: '8px' }}>MAX</th>
                      <th style={{ padding: '8px' }}>REMARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeRows.map((g, idx) => (
                      <tr key={g.id || idx}>
                        <td style={{ padding: '6px' }}>
                          <input
                            type="text"
                            value={g.grade}
                            onChange={(e) => updateGradeRow(idx, { grade: e.target.value })}
                            style={{ width: '50px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input
                            type="number"
                            value={g.minScore}
                            onChange={(e) => updateGradeRow(idx, { minScore: Number(e.target.value) })}
                            style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input
                            type="number"
                            value={g.maxScore}
                            onChange={(e) => updateGradeRow(idx, { maxScore: Number(e.target.value) })}
                            style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input
                            type="text"
                            value={g.remark || ''}
                            onChange={(e) => updateGradeRow(idx, { remark: e.target.value })}
                            style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => !savingGrades && setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={handleSaveGradeScale} disabled={savingGrades} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: savingGrades ? 'wait' : 'pointer', opacity: savingGrades ? 0.7 : 1 }}>
                  {savingGrades ? 'Saving…' : 'SAVE GRADE SCALE'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};