import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const StudentResultDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'SUBJECT_DETAIL'>('OVERVIEW');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  const subjects = [
    { name: 'Mathematics', score: 82, grade: 'A', status: 'Good', ca: 50, exam: 32 },
    { name: 'English Language', score: 76, grade: 'B', status: 'Good', ca: 48, exam: 28 },
    { name: 'Integrated Science', score: 79, grade: 'B', status: 'Good', ca: 49, exam: 30 },
    { name: 'Social Studies', score: 72, grade: 'B', status: 'Good', ca: 44, exam: 28 },
    { name: 'ICT', score: 88, grade: 'A', status: 'Excellent', ca: 54, exam: 34 }
  ];

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', display: 'flex', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        
        {viewMode === 'OVERVIEW' ? (
          /* Left Screen: Academic Performance List */
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#002b49', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>B</div>
                <span style={{ fontWeight: 'bold', color: '#002b49', fontSize: '15px' }}>Bright Academy</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Good morning, <strong>Adzovi</strong></span>
            </div>

            <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#0f172a', fontWeight: 'bold' }}>Academic Performance</h2>

            {/* Ward Card */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=60" alt="Daniel" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 'bold' }}>Daniel Mensah</h3>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>JHS 2 • 2026 Academic Year</div>
              </div>
            </div>

            {/* Overall Performance Bar */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Overall Performance</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                <span style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>78%</span>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>Good Progress</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Previous: 74% <strong style={{ color: '#166534' }}>[+4%]</strong></span>
              </div>
              <div style={{ backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#059669', height: '100%', width: '78%' }}></div>
              </div>
            </div>

            {/* Subject List */}
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'bold' }}>Subject Performance</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subjects.map((s, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setSelectedSubject(s.name); setViewMode('SUBJECT_DETAIL'); }}
                  style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{s.name}</span>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{s.score}%</strong>
                      <span style={{ marginLeft: '6px', fontSize: '11px', color: '#166534', fontWeight: 'bold' }}>({s.status})</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#e2e8f0', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: s.score >= 80 ? '#1e3a8a' : '#059669', height: '100%', width: `${s.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Right Screen: Mid-Term Examination Result Details */
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <button onClick={() => setViewMode('OVERVIEW')} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>←</button>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>Result Details</h3>
              <span>🔔</span>
            </div>

            {/* Ward Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=60" alt="Daniel" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>Daniel Mensah</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>JHS 2 • BFA-2026-0142</div>
              </div>
            </div>

            {/* Exam Title & Large Score Circle */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>MID-TERM EXAMINATION</div>
              <h2 style={{ margin: '4px 0 15px 0', fontSize: '18px', color: '#1e3a8a' }}>{selectedSubject}</h2>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', marginBottom: '15px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a' }}>82%</span>
                <span style={{ padding: '4px 10px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>A</span>
              </div>

              <div style={{ fontSize: '11px', color: '#64748b' }}>📅 August 2, 2026</div>
            </div>

            {/* Score Breakdown Table */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'bold' }}>Score Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: '6px' }}>
                  <span style={{ color: '#64748b' }}>Classwork</span>
                  <strong>18 / 20</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: '6px' }}>
                  <span style={{ color: '#64748b' }}>Assignments</span>
                  <strong>17 / 20</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: '6px' }}>
                  <span style={{ color: '#64748b' }}>Class Tests</span>
                  <strong>15 / 20</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: '6px' }}>
                  <span style={{ color: '#64748b' }}>Mid-Term Examination</span>
                  <strong>32 / 40</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', pt: '6px', color: '#1e3a8a', fontWeight: 'bold', fontSize: '14px' }}>
                  <span>Total Score</span>
                  <span>82 / 100</span>
                </div>
              </div>
            </div>

            {/* Teacher Feedback */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#0f172a', fontWeight: 'bold' }}>👤 Teacher Feedback</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569', fontStyle: 'italic', lineHeight: '1.5' }}>
                "Daniel has shown good improvement in Mathematics this term. He demonstrates a strong understanding of concepts covered. Continued practice with algebraic problem-solving is recommended."
              </p>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b', textAlign: 'right', fontWeight: 'bold' }}>
                Mr. James Aryee • Mathematics Teacher
              </div>
            </div>

            {/* Intelligent Information Support Card */}
            <div style={{ backgroundColor: '#dcfce7', borderRadius: '12px', padding: '14px', marginBottom: '20px', borderLeft: '4px solid #166534' }}>
              <h5 style={{ margin: '0 0 4px 0', color: '#166534', fontSize: '12px', fontWeight: 'bold' }}>💡 What this means</h5>
              <p style={{ margin: 0, fontSize: '12px', color: '#14532d', lineHeight: '1.4' }}>
                Daniel is currently performing above the expected level in Mathematics and has improved compared with his previous assessment.
              </p>
            </div>

            {/* Actions */}
            <button 
              onClick={() => window.print()}
              style={{ width: '100%', padding: '12px', backgroundColor: '#fff', border: '1px solid #1e3a8a', color: '#1e3a8a', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
            >
              📥 DOWNLOAD RESULT
            </button>
          </div>
        )}

      </div>
    </div>
  );
};