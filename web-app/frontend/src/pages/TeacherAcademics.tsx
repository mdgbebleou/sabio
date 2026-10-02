import React, { useState } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';

interface StudentScore {
  id: string;
  name: string;
  studentId: string;
  ca: number;
  exam: number;
  avatar: string;
  remark: string;
}

interface SubjectDetail {
  subject: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

const initialScores: StudentScore[] = [
  { id: '1', name: 'Daniel Mensah', studentId: 'ST00124', ca: 27, exam: 62, avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=60', remark: 'Excellent' },
  { id: '2', name: 'Ama Owusu', studentId: 'ST00125', ca: 24, exam: 55, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60', remark: 'Very Good' },
  { id: '3', name: 'Kojo Asare', studentId: 'ST00126', ca: 19, exam: 43, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', remark: 'Good' },
  { id: '4', name: 'Michael Boateng', studentId: 'ST00127', ca: 26, exam: 58, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60', remark: 'Very Good' },
];

const danielSubjectBreakdown: SubjectDetail[] = [
  { subject: 'Integrated Science', ca: 27, exam: 62, total: 89, grade: 'A', remark: 'Excellent performance' },
  { subject: 'Mathematics', ca: 25, exam: 57, total: 82, grade: 'A', remark: 'Keep it up' },
  { subject: 'English Language', ca: 24, exam: 55, total: 79, grade: 'B', remark: 'Very Good' },
  { subject: 'Social Studies', ca: 20, exam: 52, total: 72, grade: 'B', remark: 'Good, but can improve' },
  { subject: 'Information Tech.', ca: 28, exam: 60, total: 88, grade: 'A', remark: 'Excellent' },
  { subject: 'French', ca: 15, exam: 50, total: 65, grade: 'C', remark: 'Requires more effort' },
  { subject: 'Religious & Moral Ed.', ca: 26, exam: 59, total: 85, grade: 'A', remark: 'Excellent' },
  { subject: 'Creative Arts', ca: 22, exam: 45, total: 67, grade: 'C', remark: 'Satisfactory' },
];

export const TeacherAcademics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'enter' | 'history'>('enter');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<string | null>(null);
  const [scores, setScores] = useState<StudentScore[]>(initialScores);

  const calculateGrade = (total: number) => {
    if (total >= 80) return { letter: 'A', color: '#166534', bg: '#dcfce7' };
    if (total >= 70) return { letter: 'B', color: '#1e40af', bg: '#dbeafe' };
    if (total >= 60) return { letter: 'C', color: '#b45309', bg: '#fef3c7' };
    if (total >= 50) return { letter: 'D', color: '#d97706', bg: '#ffedd5' };
    return { letter: 'F', color: '#dc2626', bg: '#fef2f2' };
  };

  const handleScoreChange = (id: string, field: 'ca' | 'exam', val: number) => {
    setScores(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

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
        
        {/* STUDENT RESULT DETAIL VIEW */}
        {selectedStudentDetail ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <button 
                  onClick={() => setSelectedStudentDetail(null)}
                  style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                >
                  ← Back to Results
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>Result Detail</h1>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>• Submitted</span>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Second Term Academic Result • 2025/2026</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  Print Result
                </button>
                <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  Request Correction
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80" alt="Daniel Mensah" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                <div>
                  <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>Daniel Mensah</strong>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>ID: ST00124</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>JHS 2A</span>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Second</span>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>OVERALL AVERAGE</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>81%</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>OVERALL GRADE</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>A</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CLASS POSITION</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>7<span style={{ fontSize: '14px', color: '#64748b' }}>/38</span></div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SUBJECTS TAKEN</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>8</div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Subject Breakdown</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>SUBJECT</th>
                    <th style={{ padding: '12px 20px' }}>CA (30)</th>
                    <th style={{ padding: '12px 20px' }}>EXAM (70)</th>
                    <th style={{ padding: '12px 20px' }}>TOTAL (100%)</th>
                    <th style={{ padding: '12px 20px' }}>GRADE</th>
                    <th style={{ padding: '12px 20px' }}>REMARK</th>
                  </tr>
                </thead>
                <tbody>
                  {danielSubjectBreakdown.map((item) => {
                    const gradeInfo = calculateGrade(item.total);
                    return (
                      <tr key={item.subject} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{item.subject}</td>
                        <td style={{ padding: '12px 20px', color: '#334155' }}>{item.ca}</td>
                        <td style={{ padding: '12px 20px', color: '#334155' }}>{item.exam}</td>
                        <td style={{ padding: '12px 20px', fontWeight: '800', color: '#0f172a' }}>{item.total}%</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ backgroundColor: gradeInfo.bg, color: gradeInfo.color, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                            {gradeInfo.letter}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', color: '#64748b' }}>{item.remark}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

            {activeTab === 'enter' && (
              <div>
                <div style={{ ...cardStyle, marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Select Class</label>
                      <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                        <option>JHS 2A</option>
                        <option>JHS 2B</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Select Subject</label>
                      <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                        <option>Integrated Science</option>
                        <option>Mathematics</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Select Assessment</label>
                      <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                        <option>Second Term Examination</option>
                        <option>Class Mid-Term Test</option>
                      </select>
                    </div>

                    <button style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', height: '35px' }}>
                      Load Data
                    </button>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                        <th style={{ padding: '12px 20px' }}>STUDENT</th>
                        <th style={{ padding: '12px 20px' }}>STUDENT ID</th>
                        <th style={{ padding: '12px 20px' }}>CA (30)</th>
                        <th style={{ padding: '12px 20px' }}>EXAM (70)</th>
                        <th style={{ padding: '12px 20px' }}>TOTAL (%)</th>
                        <th style={{ padding: '12px 20px' }}>GRADE</th>
                        <th style={{ padding: '12px 20px' }}>REMARK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((s) => {
                        const total = s.ca + s.exam;
                        const gradeInfo = calculateGrade(total);
                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{s.name}</td>
                            <td style={{ padding: '12px 20px', color: '#64748b' }}>{s.studentId}</td>
                            <td style={{ padding: '12px 20px' }}>
                              <input 
                                type="number" 
                                value={s.ca} 
                                onChange={(e) => handleScoreChange(s.id, 'ca', Number(e.target.value))}
                                style={{ width: '60px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }} 
                              />
                            </td>
                            <td style={{ padding: '12px 20px' }}>
                              <input 
                                type="number" 
                                value={s.exam} 
                                onChange={(e) => handleScoreChange(s.id, 'exam', Number(e.target.value))}
                                style={{ width: '60px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }} 
                              />
                            </td>
                            <td style={{ padding: '12px 20px', fontWeight: '800', color: '#0f172a' }}>{total}%</td>
                            <td style={{ padding: '12px 20px' }}>
                              <span style={{ backgroundColor: gradeInfo.bg, color: gradeInfo.color, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                {gradeInfo.letter}
                              </span>
                            </td>
                            <td style={{ padding: '12px 20px', color: '#64748b' }}>{s.remark}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                    Save Draft
                  </button>
                  <button style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                    Submit Results
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                      <th style={{ padding: '12px 20px' }}>DATE SUBMITTED</th>
                      <th style={{ padding: '12px 20px' }}>CLASS</th>
                      <th style={{ padding: '12px 20px' }}>SUBJECT</th>
                      <th style={{ padding: '12px 20px' }}>ASSESSMENT</th>
                      <th style={{ padding: '12px 20px' }}>AVERAGE</th>
                      <th style={{ padding: '12px 20px' }}>STATUS</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', color: '#64748b' }}>Aug 12, 2026</td>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>JHS 2A</td>
                      <td style={{ padding: '12px 20px' }}>Integrated Science</td>
                      <td style={{ padding: '12px 20px' }}>Second Term Exam</td>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>72%</td>
                      <td style={{ padding: '12px 20px' }}><span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>Submitted</span></td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <button onClick={() => setSelectedStudentDetail('1')} style={{ border: 'none', background: 'none', color: '#002b49', fontWeight: 'bold', cursor: 'pointer' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};