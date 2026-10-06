import React, { useState, useEffect, useCallback } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';
import {
  getMyAssessments,
  createAssessment,
  getAssessment,
  saveScores,
  submitAssessment,
  deleteAssessment,
  getMyClasses,
} from '../services/teacherService';
import type {
  AssessmentRow,
  AssessmentDetail,
  TeacherClass,
} from '../services/teacherService';

type View = 'list' | 'create' | 'detail' | 'results';

type AssessmentType = 'Quiz' | 'Class Test' | 'Practical' | 'Examination';

interface TypeDefaults {
  caMax: number;
  examMax: number;
  caWeight: number;
  examWeight: number;
}

const TYPE_DEFAULTS: Record<AssessmentType, TypeDefaults> = {
  Quiz: { caMax: 20, examMax: 0, caWeight: 1, examWeight: 0 },
  'Class Test': { caMax: 20, examMax: 30, caWeight: 0.4, examWeight: 0.6 },
  Practical: { caMax: 40, examMax: 0, caWeight: 1, examWeight: 0 },
  Examination: { caMax: 30, examMax: 70, caWeight: 0.3, examWeight: 0.7 },
};

const gradeFor = (pct: number | null): { letter: string; color: string; bg: string } => {
  if (pct === null) return { letter: '-', color: '#64748b', bg: '#f1f5f9' };
  if (pct >= 80) return { letter: 'A', color: '#166534', bg: '#dcfce7' };
  if (pct >= 70) return { letter: 'B', color: '#1e40af', bg: '#dbeafe' };
  if (pct >= 60) return { letter: 'C', color: '#b45309', bg: '#fef3c7' };
  if (pct >= 50) return { letter: 'D', color: '#d97706', bg: '#ffedd5' };
  return { letter: 'F', color: '#dc2626', bg: '#fef2f2' };
};

const formatDate = (ymd: string | null): string => {
  if (!ymd) return '—';
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const TeacherAssessments: React.FC = () => {
  

  const [activeView, setActiveView] = useState<View>('list');
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('All');

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newClassId, setNewClassId] = useState('');
  const [newSubject, setNewSubject] = useState('Integrated Science');
  const [newType, setNewType] = useState<AssessmentType>('Quiz');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newDuration, setNewDuration] = useState('45');
  const [newCaMax, setNewCaMax] = useState(String(TYPE_DEFAULTS.Quiz.caMax));
  const [newExamMax, setNewExamMax] = useState(String(TYPE_DEFAULTS.Quiz.examMax));
  const [newCaWeight, setNewCaWeight] = useState(String(TYPE_DEFAULTS.Quiz.caWeight));
  const [newExamWeight, setNewExamWeight] = useState(String(TYPE_DEFAULTS.Quiz.examWeight));
  const [newInstructions, setNewInstructions] = useState('');
  const [creating, setCreating] = useState(false);

  // Detail / results
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [scoreEdits, setScoreEdits] = useState<Record<string, { ca: string; exam: string }>>({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, cls] = await Promise.all([getMyAssessments(), getMyClasses()]);
      setAssessments(rows);
      setClasses(cls);
      if (cls.length > 0 && !newClassId) setNewClassId(cls[0].id);
    } catch (err: any) {
      setError(err?.message || 'Could not load assessments.');
    } finally {
      setLoading(false);
    }
  }, [newClassId]);

  useEffect(() => {
    if (activeView === 'list') void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  const applyTypeDefaults = (t: AssessmentType) => {
    const d = TYPE_DEFAULTS[t];
    setNewCaMax(String(d.caMax));
    setNewExamMax(String(d.examMax));
    setNewCaWeight(String(d.caWeight));
    setNewExamWeight(String(d.examWeight));
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newClassId) {
      alert('Title and class are required.');
      return;
    }
    const caW = Number(newCaWeight);
    const exW = Number(newExamWeight);
    if (Math.abs(caW + exW - 1) > 0.001) {
      alert('CA weight + Exam weight must equal 1.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createAssessment({
        title: newTitle,
        subject: newSubject,
        classId: newClassId,
        academicYear: '2025/2026',
        term: 'Second Term',
        assessmentType: newType,
        eventDate: newDate || null,
        durationMins: newDuration ? Number(newDuration) : null,
        instructions: newInstructions || null,
        caMax: Number(newCaMax),
        examMax: Number(newExamMax),
        caWeight: caW,
        examWeight: exW,
      });
      // reset form
      setNewTitle('');
      setNewInstructions('');
      setActiveView('list');
    } catch (err: any) {
      alert(err?.message || 'Could not create assessment.');
    } finally {
      setCreating(false);
    }
  };

  const openDetail = async (assessmentId: string) => {
    setActiveView('detail');
    setLoadingDetail(true);
    setError(null);
    try {
      const d = await getAssessment(assessmentId);
      setDetail(d);
      const edits: Record<string, { ca: string; exam: string }> = {};
      for (const r of d.roster) {
        edits[r.studentId] = {
          ca: r.caScore == null ? '' : String(r.caScore),
          exam: r.examScore == null ? '' : String(r.examScore),
        };
      }
      setScoreEdits(edits);
    } catch (err: any) {
      setError(err?.message || 'Could not load assessment.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleScoreChange = (studentId: string, field: 'ca' | 'exam', val: string) => {
    setScoreEdits((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: val },
    }));
  };

  const handleSaveScores = async () => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const entries = detail.roster.map((r) => {
        const edit = scoreEdits[r.studentId] || { ca: '', exam: '' };
        return {
          studentId: r.studentId,
          caScore: edit.ca === '' ? null : Number(edit.ca),
          examScore: edit.exam === '' ? null : Number(edit.exam),
          remark: null,
        };
      });
      await saveScores(detail.assessment.id, entries);
      const refreshed = await getAssessment(detail.assessment.id);
      setDetail(refreshed);
      const edits: Record<string, { ca: string; exam: string }> = {};
      for (const r of refreshed.roster) {
        edits[r.studentId] = {
          ca: r.caScore == null ? '' : String(r.caScore),
          exam: r.examScore == null ? '' : String(r.examScore),
        };
      }
      setScoreEdits(edits);
      alert('Scores saved.');
    } catch (err: any) {
      alert(err?.message || 'Could not save scores.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!detail) return;
    if (!confirm('Submit this assessment? Scores will be locked from editing.')) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitAssessment(detail.assessment.id);
      const refreshed = await getAssessment(detail.assessment.id);
      setDetail(refreshed);
      alert('Assessment submitted.');
    } catch (err: any) {
      alert(err?.message || 'Could not submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (!confirm('Delete this assessment and all its scores?')) return;
    try {
      await deleteAssessment(detail.assessment.id);
      setDetail(null);
      setActiveView('list');
    } catch (err: any) {
      alert(err?.message || 'Could not delete assessment.');
    }
  };

  const filteredAssessments = assessments
    .filter((a) => classFilter === 'All' || a.classId === classFilter)
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q);
    });

  const totalCount = assessments.length;
  const draftCount = assessments.filter((a) => a.status === 'Draft').length;
  const submittedCount = assessments.filter((a) => a.status === 'Submitted').length;

  // score distribution for results view (computed from detail)
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  if (detail) {
    for (const r of detail.roster) {
      if (r.totalScore == null) continue;
      const g = gradeFor(r.totalScore).letter;
      if (g in distribution) distribution[g as keyof typeof distribution]++;
    }
  }
  const scoredCount = detail?.roster.filter((r) => r.totalScore != null).length ?? 0;
  const pendingCount = (detail?.roster.length ?? 0) - scoredCount;
  const avgPct = detail && scoredCount > 0
    ? Math.round(
        detail.roster
          .filter((r) => r.totalScore != null)
          .reduce((sum, r) => sum + (r.totalScore || 0), 0) / scoredCount
      )
    : null;

  return (
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* ================= LIST ================= */}
        {activeView === 'list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Assessments</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Create and manage assessments for your assigned classes and subjects.
                </p>
              </div>
              <button
                onClick={() => setActiveView('create')}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
              >
                + Create Assessment
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL ASSESSMENTS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{totalCount}</div>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>DRAFTS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{draftCount}</div>
              </div>
              <div style={{ ...cardStyle, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>SUBMITTED</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>{submittedCount}</div>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CLASSES</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{classes.length}</div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', width: '240px' }}
                />
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="All">Class: All</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {loading && (
                <div style={{ padding: '16px 20px', fontSize: '12px', color: '#64748b' }}>Loading…</div>
              )}

              {!loading && filteredAssessments.length === 0 && (
                <div style={{ padding: '24px 20px', fontSize: '13px', color: '#64748b' }}>
                  No assessments yet. Click <strong>Create Assessment</strong> to add one.
                </div>
              )}

              {!loading && filteredAssessments.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                      <th style={{ padding: '12px 20px' }}>ASSESSMENT</th>
                      <th style={{ padding: '12px 20px' }}>CLASS</th>
                      <th style={{ padding: '12px 20px' }}>SUBJECT</th>
                      <th style={{ padding: '12px 20px' }}>TYPE</th>
                      <th style={{ padding: '12px 20px' }}>DATE</th>
                      <th style={{ padding: '12px 20px' }}>SCORES</th>
                      <th style={{ padding: '12px 20px' }}>STATUS</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssessments.map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{a.title}</td>
                        <td style={{ padding: '12px 20px', color: '#334155' }}>{a.className}</td>
                        <td style={{ padding: '12px 20px', color: '#334155' }}>{a.subject}</td>
                        <td style={{ padding: '12px 20px', color: '#334155' }}>{a.assessmentType || '—'}</td>
                        <td style={{ padding: '12px 20px', color: '#64748b' }}>{formatDate(a.eventDate)}</td>
                        <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>
                          {a.scoredCount}/{a.studentCount}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{
                            backgroundColor: a.status === 'Submitted' ? '#dcfce7' : '#f1f5f9',
                            color: a.status === 'Submitted' ? '#166534' : '#475569',
                            padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
                          }}>
                            {a.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => void openDetail(a.id)}
                            style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ================= CREATE ================= */}
        {activeView === 'create' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button
              onClick={() => setActiveView('list')}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Assessments
            </button>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Create Assessment</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Create a new assessment for one of your assigned classes.</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '10px' }}>STATUS: Draft</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Assessment Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Midterm Physics Exam"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Class *</label>
                    <select
                      value={newClassId}
                      onChange={(e) => setNewClassId(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    >
                      {classes.length === 0 && <option value="">No class assigned</option>}
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Subject *</label>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Assessment Type</label>
                    <select
                      value={newType}
                      onChange={(e) => {
                        const t = e.target.value as AssessmentType;
                        setNewType(t);
                        applyTypeDefaults(t);
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    >
                      <option value="Quiz">Quiz</option>
                      <option value="Class Test">Class Test</option>
                      <option value="Practical">Practical</option>
                      <option value="Examination">Examination</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>CA Max</label>
                    <input
                      type="number"
                      value={newCaMax}
                      onChange={(e) => setNewCaMax(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Exam Max</label>
                    <input
                      type="number"
                      value={newExamMax}
                      onChange={(e) => setNewExamMax(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>CA Weight</label>
                    <input
                      type="number"
                      step="0.05"
                      value={newCaWeight}
                      onChange={(e) => setNewCaWeight(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Exam Weight</label>
                    <input
                      type="number"
                      step="0.05"
                      value={newExamWeight}
                      onChange={(e) => setNewExamWeight(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                  Weights must total <strong>1.0</strong>. Currently {(Number(newCaWeight) || 0) + (Number(newExamWeight) || 0)}. Set <strong>Exam Max = 0</strong> for CA-only assessments (quizzes, practicals).
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Duration (minutes)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Description / Instructions</label>
                  <textarea
                    rows={4}
                    placeholder="Enter specific instructions or details for this assessment..."
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  onClick={() => setActiveView('list')}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: creating ? 'wait' : 'pointer', opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? 'Creating…' : 'Create Assessment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= DETAIL ================= */}
        {activeView === 'detail' && (
          <div>
            <button
              onClick={() => { setDetail(null); setActiveView('list'); }}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Assessments
            </button>

            {loadingDetail && <div style={{ fontSize: '12px', color: '#64748b' }}>Loading…</div>}

            {!loadingDetail && detail && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      Assessments &gt; {detail.assessment.title}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{detail.assessment.title}</h1>
                      <span style={{
                        backgroundColor: detail.assessment.status === 'Submitted' ? '#dcfce7' : '#f1f5f9',
                        color: detail.assessment.status === 'Submitted' ? '#166534' : '#475569',
                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                      }}>
                        {detail.assessment.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {detail.assessment.status === 'Draft' && (
                      <button
                        onClick={handleDelete}
                        style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', fontSize: '12px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={() => setActiveView('results')}
                      style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                    >
                      {detail.assessment.status === 'Draft' ? 'Enter Results' : 'View Results'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={cardStyle}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>CLASS</span>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>{detail.assessment.className}</strong>
                  </div>
                  <div style={cardStyle}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>SUBJECT</span>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>{detail.assessment.subject}</strong>
                  </div>
                  <div style={cardStyle}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>TYPE</span>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>{detail.assessment.assessmentType || '—'}</strong>
                  </div>
                  <div style={{ ...cardStyle, backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                    <span style={{ fontSize: '10px', color: '#0369a1', fontWeight: 'bold', display: 'block' }}>CA / EXAM</span>
                    <strong style={{ fontSize: '20px', color: '#002b49' }}>
                      {detail.assessment.caMax} / {detail.assessment.examMax}
                    </strong>
                  </div>
                </div>

                {detail.assessment.instructions && (
                  <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Instructions</h3>
                    <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                      {detail.assessment.instructions}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= RESULTS ================= */}
        {activeView === 'results' && detail && (
          <div>
            <button
              onClick={() => setActiveView('detail')}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Assessment Detail
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  {detail.assessment.className} • {detail.assessment.subject}
                </div>
                <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{detail.assessment.title}</h1>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {detail.assessment.status === 'Draft' && (
                  <button
                    onClick={handleSaveScores}
                    disabled={saving}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving…' : 'Save Draft'}
                  </button>
                )}
                {detail.assessment.status === 'Draft' && (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? 'Submitting…' : 'Submit Results'}
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>TOTAL STUDENTS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{detail.roster.length}</div>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>SCORED</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>{scoredCount}</div>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#b45309', fontWeight: 'bold', textTransform: 'uppercase' }}>PENDING</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#b45309', marginTop: '4px' }}>{pendingCount}</div>
              </div>
              <div style={{ ...cardStyle, backgroundColor: '#002b49', color: '#ffffff' }}>
                <span style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase' }}>CLASS AVERAGE</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>
                  {avgPct == null ? '—' : `${avgPct}%`}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px', alignItems: 'start' }}>
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Student Results</h3>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                      <th style={{ padding: '12px 20px' }}>STUDENT</th>
                      <th style={{ padding: '12px 20px' }}>ID</th>
                      <th style={{ padding: '12px 20px' }}>CA ({detail.assessment.caMax})</th>
                      <th style={{ padding: '12px 20px' }}>EXAM ({detail.assessment.examMax})</th>
                      <th style={{ padding: '12px 20px' }}>TOTAL %</th>
                      <th style={{ padding: '12px 20px' }}>GRADE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.roster.map((r) => {
                      const edit = scoreEdits[r.studentId] || { ca: '', exam: '' };
                      const g = gradeFor(r.totalScore);
                      const editable = detail.assessment.status === 'Draft';
                      return (
                        <tr key={r.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{r.name}</td>
                          <td style={{ padding: '12px 20px', color: '#64748b' }}>{r.customId}</td>
                          <td style={{ padding: '12px 20px' }}>
                            {editable ? (
                              <input
                                type="number"
                                value={edit.ca}
                                onChange={(e) => handleScoreChange(r.studentId, 'ca', e.target.value)}
                                style={{ width: '70px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }}
                              />
                            ) : (
                              <span>{r.caScore ?? '—'}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 20px' }}>
                            {editable ? (
                              <input
                                type="number"
                                value={edit.exam}
                                onChange={(e) => handleScoreChange(r.studentId, 'exam', e.target.value)}
                                style={{ width: '70px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }}
                              />
                            ) : (
                              <span>{r.examScore ?? '—'}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 20px', fontWeight: '800', color: '#0f172a' }}>
                            {r.totalScore == null ? '—' : `${r.totalScore.toFixed(1)}%`}
                          </td>
                          <td style={{ padding: '12px 20px' }}>
                            <span style={{ backgroundColor: g.bg, color: g.color, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                              {g.letter}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Grade Distribution</h3>
                  {(['A', 'B', 'C', 'D', 'F'] as const).map((letter) => {
                    const total = Math.max(scoredCount, 1);
                    const count = distribution[letter];
                    const pct = Math.round((count / total) * 100);
                    const g = gradeFor(letter === 'A' ? 85 : letter === 'B' ? 75 : letter === 'C' ? 65 : letter === 'D' ? 55 : 40);
                    return (
                      <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                        <span style={{ color: g.color, width: '15px' }}>{letter}</span>
                        <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: g.color }} />
                        </div>
                        <span style={{ color: '#64748b' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Item Analysis</h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#64748b' }}>
                    Question-level analysis isn't available yet.
                  </p>
                  <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 'bold' }}>
                    Coming in a future update.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};