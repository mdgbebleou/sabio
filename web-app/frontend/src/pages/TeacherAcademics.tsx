import React, { useState, useEffect, useCallback } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';
import {
  getMyClasses,
  getMyAssessments,
  getAssessment,
  saveScores,
  submitAssessment,
  getStudentScoresDetailed,
  getClassRank,
  getMyStudents,
} from '../services/teacherService';
import type {
  TeacherClass,
  AssessmentRow,
  AssessmentDetail,
  StudentScoreDetailed,
  TeacherStudent,
} from '../services/teacherService';

const gradeFor = (pct: number | null): { letter: string; color: string; bg: string; remark: string } => {
  if (pct === null) return { letter: '-', color: '#64748b', bg: '#f1f5f9', remark: 'No score' };
  if (pct >= 80) return { letter: 'A', color: '#166534', bg: '#dcfce7', remark: 'Excellent' };
  if (pct >= 70) return { letter: 'B', color: '#1e40af', bg: '#dbeafe', remark: 'Very Good' };
  if (pct >= 60) return { letter: 'C', color: '#b45309', bg: '#fef3c7', remark: 'Good' };
  if (pct >= 50) return { letter: 'D', color: '#d97706', bg: '#ffedd5', remark: 'Satisfactory' };
  return { letter: 'F', color: '#dc2626', bg: '#fef2f2', remark: 'Needs work' };
};

const fmtDate = (ymd: string | null): string => {
  if (!ymd) return '—';
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface StudentDetail {
  student: TeacherStudent;
  scores: StudentScoreDetailed[];
  average: number | null;
  gradeLetter: string;
  gradeColor: string;
  gradeBg: string;
  subjectsTaken: number;
  rank: { position: number; total: number } | null;
}

export const TeacherAcademics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'enter' | 'history'>('enter');

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');

  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [scoreEdits, setScoreEdits] = useState<Record<string, { ca: string; exam: string }>>({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  // initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cls, asmts] = await Promise.all([getMyClasses(), getMyAssessments()]);
        setClasses(cls);
        setAssessments(asmts);
        if (cls.length > 0) setSelectedClassId(cls[0].id);
      } catch (err: any) {
        setError(err?.message || 'Could not load data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // when class changes, load students for that class
  useEffect(() => {
    if (!selectedClassId) return;
    (async () => {
      try {
        const list = await getMyStudents(selectedClassId);
        setStudents(list);
      } catch (err: any) {
        setError(err?.message || 'Could not load students.');
      }
    })();
  }, [selectedClassId]);

  // when assessment changes, load its roster
  const loadAssessment = useCallback(async (assessmentId: string) => {
    if (!assessmentId) {
      setDetail(null);
      setScoreEdits({});
      return;
    }
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssessment(selectedAssessmentId);
  }, [selectedAssessmentId, loadAssessment]);

  const handleScoreChange = (studentId: string, field: 'ca' | 'exam', val: string) => {
    setScoreEdits((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: val },
    }));
  };

  const handleSave = async () => {
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
      await loadAssessment(detail.assessment.id);
      // refresh assessments list so counts update
      const asmts = await getMyAssessments();
      setAssessments(asmts);
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
      await loadAssessment(detail.assessment.id);
      const asmts = await getMyAssessments();
      setAssessments(asmts);
      alert('Assessment submitted.');
    } catch (err: any) {
      alert(err?.message || 'Could not submit.');
    } finally {
      setSubmitting(false);
    }
  };

  const openStudentDetail = async (studentId: string) => {
    setLoadingStudent(true);
    setError(null);
    try {
      const [student, scores, rank] = await Promise.all([
        students.find((s) => s.id === studentId) || null,
        getStudentScoresDetailed(studentId),
        getClassRank(studentId).catch(() => null),
      ]);
      if (!student) throw new Error('Student not found.');

      // Option (b): only Submitted assessments count toward the average
      const submitted = scores.filter((s) => s.status === 'Submitted');
      const avg =
        submitted.length > 0
          ? Math.round((submitted.reduce((sum, s) => sum + s.total, 0) / submitted.length) * 10) / 10
          : null;
      const g = gradeFor(avg);
      const subjects = new Set(scores.map((s) => s.subject).filter(Boolean));

      setStudentDetail({
        student,
        scores,
        average: avg,
        gradeLetter: g.letter,
        gradeColor: g.color,
        gradeBg: g.bg,
        subjectsTaken: subjects.size,
        rank,
      });
    } catch (err: any) {
      setError(err?.message || 'Could not load student detail.');
    } finally {
      setLoadingStudent(false);
    }
  };

  const filteredAssessmentsForClass = selectedClassId
    ? assessments.filter((a) => a.classId === selectedClassId)
    : assessments;

  const historyRows = assessments.filter((a) => a.status === 'Submitted');

  return (
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* STUDENT RESULT DETAIL VIEW */}
        {studentDetail ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <button
                  onClick={() => setStudentDetail(null)}
                  style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                >
                  ← Back to Results
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>Result Detail</h1>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                    • {studentDetail.scores.filter((s) => s.status === 'Submitted').length} Submitted
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Academic Result • 2025/2026</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                >
                  Print Result
                </button>
                <button
                  onClick={() => alert('Correction requests are not available yet.')}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                >
                  Request Correction
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                {studentDetail.student.avatar ? (
                  <img
                    src={studentDetail.student.avatar}
                    alt={studentDetail.student.name}
                    style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                    {studentDetail.student.initials}
                  </div>
                )}
                <div>
                  <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>{studentDetail.student.name}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>ID: {studentDetail.student.customId}</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                      {studentDetail.student.className || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>OVERALL AVERAGE</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {studentDetail.average == null ? '—' : `${studentDetail.average}%`}
                </div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>OVERALL GRADE</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: studentDetail.gradeColor, marginTop: '4px' }}>
                  {studentDetail.gradeLetter}
                </div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CLASS POSITION</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {studentDetail.rank ? (
                    <>{studentDetail.rank.position}<span style={{ fontSize: '14px', color: '#64748b' }}>/{studentDetail.rank.total}</span></>
                  ) : (
                    '—'
                  )}
                </div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SUBJECTS TAKEN</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {studentDetail.subjectsTaken}
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Subject Breakdown</h3>
              </div>
              {studentDetail.scores.length === 0 ? (
                <div style={{ padding: '20px', fontSize: '13px', color: '#64748b' }}>No scores recorded for this student yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                      <th style={{ padding: '12px 20px' }}>SUBJECT</th>
                      <th style={{ padding: '12px 20px' }}>CA</th>
                      <th style={{ padding: '12px 20px' }}>EXAM</th>
                      <th style={{ padding: '12px 20px' }}>TOTAL (%)</th>
                      <th style={{ padding: '12px 20px' }}>GRADE</th>
                      <th style={{ padding: '12px 20px' }}>REMARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentDetail.scores.map((s) => {
                      const g = gradeFor(s.total);
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>
                            {s.subject}
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal', marginTop: '2px' }}>
                              {s.assessment} {s.status === 'Draft' && <span style={{ color: '#b45309', fontWeight: 'bold' }}>• Draft</span>}
                            </div>
                          </td>
                          <td style={{ padding: '12px 20px', color: '#334155' }}>{s.ca} / {s.caMax}</td>
                          <td style={{ padding: '12px 20px', color: '#334155' }}>{s.exam} / {s.examMax}</td>
                          <td style={{ padding: '12px 20px', fontWeight: '800', color: '#0f172a' }}>{s.total.toFixed(1)}%</td>
                          <td style={{ padding: '12px 20px' }}>
                            <span style={{ backgroundColor: g.bg, color: g.color, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                              {g.letter}
                            </span>
                          </td>
                          <td style={{ padding: '12px 20px', color: '#64748b' }}>{g.remark}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (

          /* MAIN ACADEMIC DASHBOARD */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Academic Performance</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Enter, review, and submit academic results for your students.
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 14px', fontSize: '11px', textAlign: 'right' }}>
                <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>ACADEMIC YEAR: 2025/2026</span>
                <strong style={{ color: '#002b49', fontSize: '12px' }}>Term: Second Term</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <button
                onClick={() => setActiveTab('enter')}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderBottom: activeTab === 'enter' ? '2px solid #002b49' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === 'enter' ? '#002b49' : '#64748b',
                  fontWeight: activeTab === 'enter' ? '800' : '500',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Enter Results
              </button>
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderBottom: activeTab === 'history' ? '2px solid #002b49' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === 'history' ? '#002b49' : '#64748b',
                  fontWeight: activeTab === 'history' ? '800' : '500',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Result History
              </button>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {activeTab === 'enter' && (
              <div>
                <div style={{ ...cardStyle, marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Select Class</label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => { setSelectedClassId(e.target.value); setSelectedAssessmentId(''); }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}
                      >
                        {classes.length === 0 && <option value="">No class assigned</option>}
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Select Assessment</label>
                      <select
                        value={selectedAssessmentId}
                        onChange={(e) => setSelectedAssessmentId(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}
                      >
                        <option value="">— pick an assessment —</option>
                        {filteredAssessmentsForClass.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title} • {a.subject} {a.status === 'Draft' ? '(Draft)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => loadAssessment(selectedAssessmentId)}
                      disabled={!selectedAssessmentId}
                      style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: selectedAssessmentId ? 'pointer' : 'not-allowed', height: '35px', opacity: selectedAssessmentId ? 1 : 0.6 }}
                    >
                      Reload
                    </button>
                  </div>
                </div>

                {loading && <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Loading…</div>}

                {!loading && !detail && (
                  <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    Pick an assessment above to enter or review its results.
                  </div>
                )}

                {!loading && detail && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '13px', color: '#334155' }}>
                        <strong style={{ color: '#0f172a' }}>{detail.assessment.title}</strong> • {detail.assessment.className} • {detail.assessment.subject}
                        <span style={{ marginLeft: '10px', backgroundColor: detail.assessment.status === 'Submitted' ? '#dcfce7' : '#f1f5f9', color: detail.assessment.status === 'Submitted' ? '#166534' : '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                          {detail.assessment.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        CA out of {detail.assessment.caMax} • Exam out of {detail.assessment.examMax}
                      </div>
                    </div>

                    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                            <th style={{ padding: '12px 20px' }}>STUDENT</th>
                            <th style={{ padding: '12px 20px' }}>STUDENT ID</th>
                            <th style={{ padding: '12px 20px' }}>CA ({detail.assessment.caMax})</th>
                            <th style={{ padding: '12px 20px' }}>EXAM ({detail.assessment.examMax})</th>
                            <th style={{ padding: '12px 20px' }}>TOTAL (%)</th>
                            <th style={{ padding: '12px 20px' }}>GRADE</th>
                            <th style={{ padding: '12px 20px' }}>REMARK</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.roster.map((r) => {
                            const edit = scoreEdits[r.studentId] || { ca: '', exam: '' };
                            const g = gradeFor(r.totalScore);
                            const editable = detail.assessment.status === 'Draft';
                            return (
                              <tr key={r.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>
                                  <button
                                    onClick={() => void openStudentDetail(r.studentId)}
                                    style={{ border: 'none', background: 'none', color: '#002b49', fontWeight: 'bold', cursor: 'pointer', padding: 0, fontSize: '12px', textDecoration: 'underline' }}
                                  >
                                    {r.name}
                                  </button>
                                </td>
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
                                <td style={{ padding: '12px 20px', color: '#64748b' }}>{g.remark}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {detail.assessment.status === 'Draft' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
                        >
                          {saving ? 'Saving…' : 'Save Draft'}
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                        >
                          {submitting ? 'Submitting…' : 'Submit Results'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                {historyRows.length === 0 ? (
                  <div style={{ padding: '24px', fontSize: '13px', color: '#64748b' }}>
                    No submitted assessments yet. Once you submit results in the Assessments page, they'll appear here.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                        <th style={{ padding: '12px 20px' }}>DATE</th>
                        <th style={{ padding: '12px 20px' }}>CLASS</th>
                        <th style={{ padding: '12px 20px' }}>SUBJECT</th>
                        <th style={{ padding: '12px 20px' }}>ASSESSMENT</th>
                        <th style={{ padding: '12px 20px' }}>SCORES</th>
                        <th style={{ padding: '12px 20px' }}>STATUS</th>
                        <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows.map((a) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 20px', color: '#64748b' }}>{fmtDate(a.eventDate)}</td>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{a.className}</td>
                          <td style={{ padding: '12px 20px' }}>{a.subject}</td>
                          <td style={{ padding: '12px 20px' }}>{a.title}</td>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{a.scoredCount}/{a.studentCount}</td>
                          <td style={{ padding: '12px 20px' }}>
                            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                              Submitted
                            </span>
                          </td>
                          <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                            <button
                              onClick={() => { setActiveTab('enter'); setSelectedClassId(a.classId); setSelectedAssessmentId(a.id); }}
                              style={{ border: 'none', background: 'none', color: '#002b49', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
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
            )}

            {loadingStudent && (
              <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#002b49', color: '#fff', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', zIndex: 200 }}>
                Loading student…
              </div>
            )}
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};