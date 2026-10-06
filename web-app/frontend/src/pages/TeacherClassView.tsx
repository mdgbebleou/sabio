import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherLayout } from '../components/TeacherLayout';
import { getMyClasses, getMyStudents, performanceOf } from '../services/teacherService';
import type { TeacherStudent, TeacherClass } from '../services/teacherService';

export const TeacherClassView: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);
  const [] = useState<'overview' | 'academic' | 'attendance' | 'fees' | 'notes'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('');

  useEffect(() => {
    let isMounted = true;
    getMyClasses()
      .then((cls) => {
        if (!isMounted) return;
        setClasses(cls);
        if (cls.length === 1) {
          setSelectedClassId(cls[0].id);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || 'Failed to load classes');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    let isMounted = true;
    setLoading(true);
    setError(null);
    getMyStudents(selectedClassId)
      .then((data) => {
        if (isMounted) {
          setStudents(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || 'Failed to load students');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [selectedClassId]);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const getPerformanceBadge = (perf: ReturnType<typeof performanceOf>) => {
    switch (perf) {
      case 'Excellent':
        return { bg: '#dcfce7', color: '#166534' };
      case 'Good':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'Average':
        return { bg: '#e2e8f0', color: '#475569' };
      case 'Needs Attention':
        return { bg: '#fef2f2', color: '#dc2626' };
      default:
        return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const attendanceRates = students
    .map((s) => s.attendanceRate)
    .filter((v): v is number => v !== null && v !== undefined);
  const attendanceDisplay = attendanceRates.length > 0
    ? `${(attendanceRates.reduce((acc, v) => acc + v, 0) / attendanceRates.length).toFixed(1)}%`
    : '—';

  const averageScores = students
    .map((s) => s.averageScore)
    .filter((v): v is number => v !== null && v !== undefined);
  const averageScoreDisplay = averageScores.length > 0
    ? `${(averageScores.reduce((acc, v) => acc + v, 0) / averageScores.length).toFixed(1)}%`
    : '—';

  const needingAttentionCount = students.filter(
    (s) => performanceOf(s.averageScore) === 'Needs Attention'
  ).length;

  const filteredStudents = students
    .filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || (s.customId || '').toLowerCase().includes(q);
    })
    .filter((s) => {
      if (!performanceFilter) return true;
      return performanceOf(s.averageScore) === performanceFilter;
    });

  return (
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* VIEW 1: CLASS ROSTER */}
        {!selectedStudent ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                {classes.length === 0 ? (
                  <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    No class assigned
                  </h1>
                ) : classes.length === 1 ? (
                  <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    {classes[0].name} — Students
                  </h1>
                ) : (
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#0f172a',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="">Select a class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  {students.length} Students
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  More Options
                </button>
                <button 
                  onClick={() => navigate('/teacher/attendance')}
                  style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                >
                  Take Attendance
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL STUDENTS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{students.length}</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ATTENDANCE</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginTop: '6px' }}>{attendanceDisplay}</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CLASS AVERAGE</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{averageScoreDisplay}</div>
              </div>

              <div style={{ ...cardStyle, borderColor: '#fecaca', backgroundColor: '#fff5f5' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>NEEDING ATTENTION</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: '6px' }}>{needingAttentionCount}</div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search students (Name/ID)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <select 
                  value={performanceFilter} 
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155' }}
                >
                  <option value="">Performance: All</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>

                <button 
                  onClick={() => { setSearchQuery(''); setPerformanceFilter(''); }}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            </div>

            {error && (
              <div style={{ ...cardStyle, padding: '12px 16px', marginBottom: '20px', backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 16px' }}>STUDENT</th>
                    <th style={{ padding: '12px 16px' }}>STUDENT ID</th>
                    <th style={{ padding: '12px 16px' }}>ATTENDANCE</th>
                    <th style={{ padding: '12px 16px' }}>AVERAGE SCORE</th>
                    <th style={{ padding: '12px 16px' }}>PERFORMANCE</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        Loading…
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const perf = performanceOf(student.averageScore);
                      const badge = getPerformanceBadge(perf);
                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#0f172a' }}>{student.name}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600' }}>{student.customId}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                            {student.attendanceRate !== null && student.attendanceRate !== undefined ? `${student.attendanceRate}%` : '—'}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                            {student.averageScore !== null && student.averageScore !== undefined ? `${student.averageScore}%` : '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                              {perf}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button 
                              onClick={() => setSelectedStudent(student)}
                              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                            >
                              View Profile →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (

          /* VIEW 2: DETAILED STUDENT PROFILE */
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button 
                onClick={() => setSelectedStudent(null)}
                style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
              >
                ← Back to Students
              </button>
            </div>

            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{selectedStudent.name}</h2>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {selectedStudent.customId} • {selectedStudent.gender}, {selectedStudent.age ?? '—'} yrs • Class {selectedStudent.className || '—'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                    + Add Note
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>GUARDIAN NAME</span>
                    <div style={{ color: '#0f172a', fontWeight: '600' }}>Mrs. Grace Mensah</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>CONTACT NUMBER</span>
                    <div style={{ color: '#0f172a', fontWeight: '600' }}>+233 24 123 4567</div>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Academic Performance</h3>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  Average score: <strong>{selectedStudent.averageScore !== null && selectedStudent.averageScore !== undefined ? `${selectedStudent.averageScore}%` : '—'}</strong> • Overall standing: <strong>{performanceOf(selectedStudent.averageScore)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};