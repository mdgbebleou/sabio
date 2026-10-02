import React, { useState } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';

interface AssessmentItem {
  id: string;
  title: string;
  class: string;
  subject: string;
  type: string;
  date: string;
  totalMarks: number;
  status: 'Published' | 'Draft';
  duration?: string;
  instructions?: string;
}

interface StudentResult {
  id: string;
  name: string;
  studentId: string;
  score: number | null;
  totalScore: number;
  grade: string;
  status: 'Submitted' | 'Pending';
  avatarInitials: string;
}

const mockAssessments: AssessmentItem[] = [
  { id: '1', title: 'Science Quiz 2: Cell Structure', class: 'JHS 2A', subject: 'Integrated Science', type: 'Quiz', date: 'Aug 14, 2026', totalMarks: 20, status: 'Published', duration: '45 mins', instructions: 'Answer all questions. Read each question carefully and show your working where required.' },
  { id: '2', title: 'Mid-Term Test', class: 'JHS 2B', subject: 'Integrated Science', type: 'Class Test', date: 'Aug 18, 2026', totalMarks: 30, status: 'Draft', duration: '60 mins', instructions: 'Covers Chapters 1 to 4.' },
  { id: '3', title: 'Biology Practical', class: 'JHS 3A', subject: 'Biology', type: 'Practical', date: 'Aug 20, 2026', totalMarks: 40, status: 'Published', duration: '90 mins', instructions: 'Laboratory experiment on plant cells.' },
];

const mockResults: StudentResult[] = [
  { id: '1', name: 'Alice Smith', studentId: 'S-1042', score: 18, totalScore: 20, grade: 'A', status: 'Submitted', avatarInitials: 'AS' },
  { id: '2', name: 'Bob Johnson', studentId: 'S-1055', score: 16, totalScore: 20, grade: 'B', status: 'Submitted', avatarInitials: 'BJ' },
  { id: '3', name: 'Charlie Williams', studentId: 'S-1089', score: 14, totalScore: 20, grade: 'C', status: 'Submitted', avatarInitials: 'CW' },
  { id: '4', name: 'Diana Miller', studentId: 'S-1102', score: null, totalScore: 20, grade: '-', status: 'Pending', avatarInitials: 'DM' },
  { id: '5', name: 'Ethan Brown', studentId: 'S-1115', score: 9, totalScore: 20, grade: 'F', status: 'Submitted', avatarInitials: 'EB' },
];

export const TeacherAssessments: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'detail' | 'results'>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentItem>(mockAssessments[0]);

  // Filters for list view
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Form state for creating assessment
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState('JHS 2A');
  const [newSubject, setNewSubject] = useState('Integrated Science');
  const [newType, setNewType] = useState('Quiz');
  const [newDate, setNewDate] = useState('2026-08-14');
  const [newDuration, setNewDuration] = useState('45');
  const [newTotalMarks, setNewTotalMarks] = useState('20');
  const [newInstructions, setNewInstructions] = useState('');

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
        
        {/* ========================================================================= */}
        {/* VIEW 1: ASSESSMENTS LIST */}
        {/* ========================================================================= */}
        {activeView === 'list' && (
          <div>
            {/* PAGE HEADER */}
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

            {/* KPIS HEADER */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL ASSESSMENTS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>12</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>DRAFTS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>2</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>UPCOMING</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#b45309', marginTop: '4px' }}>4</div>
              </div>

              <div style={{ ...cardStyle, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>COMPLETED</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>6</div>
              </div>
            </div>

            {/* FILTER & TABLE BLOCK */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Search assessments..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', width: '240px' }}
                />

                <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                  <option value="All">Class: All</option>
                  <option value="JHS 2A">JHS 2A</option>
                  <option value="JHS 2B">JHS 2B</option>
                </select>

                <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                  <option value="All">Subject: All</option>
                  <option value="Integrated Science">Integrated Science</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>ASSESSMENT</th>
                    <th style={{ padding: '12px 20px' }}>CLASS</th>
                    <th style={{ padding: '12px 20px' }}>SUBJECT</th>
                    <th style={{ padding: '12px 20px' }}>TYPE</th>
                    <th style={{ padding: '12px 20px' }}>DATE</th>
                    <th style={{ padding: '12px 20px' }}>TOTAL MARKS</th>
                    <th style={{ padding: '12px 20px' }}>STATUS</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAssessments.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{item.title}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{item.class}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{item.subject}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{item.type}</td>
                      <td style={{ padding: '12px 20px', color: '#64748b' }}>{item.date}</td>
                      <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{item.totalMarks}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ 
                          backgroundColor: item.status === 'Published' ? '#dcfce7' : '#f1f5f9', 
                          color: item.status === 'Published' ? '#166534' : '#475569', 
                          padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' 
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <button 
                          onClick={() => { setSelectedAssessment(item); setActiveView('detail'); }}
                          style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CREATE ASSESSMENT */}
        {/* ========================================================================= */}
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
                    <select value={newClass} onChange={(e) => setNewClass(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}>
                      <option>JHS 2A</option>
                      <option>JHS 2B</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Subject *</label>
                    <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}>
                      <option>Integrated Science</option>
                      <option>Biology</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Assessment Type *</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}>
                      <option>Quiz</option>
                      <option>Class Test</option>
                      <option>Practical</option>
                      <option>Examination</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Date *</label>
                    <input 
                      type="date" 
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Start Time</label>
                    <input type="time" defaultValue="10:00" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Duration (mins)</label>
                    <input type="number" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Total Marks *</label>
                    <input type="number" value={newTotalMarks} onChange={(e) => setNewTotalMarks(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
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
                <button onClick={() => setActiveView('list')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => setActiveView('list')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  Save Draft
                </button>
                <button onClick={() => setActiveView('list')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  Create Assessment
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: ASSESSMENT DETAILS */}
        {/* ========================================================================= */}
        {activeView === 'detail' && (
          <div>
            <button 
              onClick={() => setActiveView('list')}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Assessments
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Academic Performance &gt; Assessments &gt; {selectedAssessment.title}</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{selectedAssessment.title}</h1>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>✓ {selectedAssessment.status}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setActiveView('results')}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}
                >
                  View Results
                </button>
                <button 
                  onClick={() => setActiveView('results')}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                >
                  Enter Results
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>CLASS</span>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{selectedAssessment.class}</strong>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>SUBJECT</span>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{selectedAssessment.subject}</strong>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>TYPE</span>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{selectedAssessment.type}</strong>
              </div>

              <div style={{ ...cardStyle, backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                <span style={{ fontSize: '10px', color: '#0369a1', fontWeight: 'bold', display: 'block' }}>TOTAL MARKS</span>
                <strong style={{ fontSize: '20px', color: '#002b49' }}>{selectedAssessment.totalMarks} pts</strong>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Instructions</h3>
              <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                {selectedAssessment.instructions || 'No special instructions recorded.'}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: ASSESSMENT RESULTS ANALYSIS & GRADES ENTRY */}
        {/* ========================================================================= */}
        {activeView === 'results' && (
          <div>
            <button 
              onClick={() => setActiveView('detail')}
              style={{ border: 'none', background: 'none', color: '#002b49', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
              ← Back to Assessment Detail
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>GRADE 10 • SECTION B • BIOLOGY</div>
                <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{selectedAssessment.title}</h1>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  Export CSV
                </button>
                <button style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  Edit Grades
                </button>
              </div>
            </div>

            {/* STATS HEADER */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>TOTAL STUDENTS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>38</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>SUBMITTED</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>35</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#b45309', fontWeight: 'bold', textTransform: 'uppercase' }}>PENDING</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#b45309', marginTop: '4px' }}>3</div>
              </div>

              <div style={{ ...cardStyle, backgroundColor: '#002b49', color: '#ffffff' }}>
                <span style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase' }}>CLASS AVERAGE</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>76%</div>
                <span style={{ fontSize: '10px', color: '#4ade80' }}>+2% from last quiz</span>
              </div>
            </div>

            {/* RESULTS LIST & SIDEBAR */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px', alignItems: 'start' }}>
              
              {/* STUDENT SCORES TABLE */}
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Student Results</h3>
                  <input type="text" placeholder="Search student..." style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                      <th style={{ padding: '12px 20px' }}>STUDENT</th>
                      <th style={{ padding: '12px 20px' }}>ID</th>
                      <th style={{ padding: '12px 20px' }}>SCORE</th>
                      <th style={{ padding: '12px 20px' }}>GRADE</th>
                      <th style={{ padding: '12px 20px' }}>STATUS</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockResults.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                              {r.avatarInitials}
                            </div>
                            <strong style={{ color: '#0f172a' }}>{r.name}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px', color: '#64748b' }}>{r.studentId}</td>
                        <td style={{ padding: '12px 20px' }}>
                          {r.score !== null ? (
                            <div>
                              <strong style={{ color: r.score < 10 ? '#dc2626' : '#0f172a' }}>{r.score} / {r.totalScore}</strong>
                              <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>{(r.score / r.totalScore) * 100}%</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>- / {r.totalScore}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 20px', fontWeight: 'bold', color: r.grade === 'A' ? '#166534' : r.grade === 'F' ? '#dc2626' : '#0f172a' }}>
                          {r.grade}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ backgroundColor: r.status === 'Submitted' ? '#dcfce7' : '#fef3c7', color: r.status === 'Submitted' ? '#166534' : '#b45309', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          {r.status === 'Pending' ? (
                            <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}>
                              Remind
                            </button>
                          ) : (
                            <button style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>⋮</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* GRADE DISTRIBUTION & ITEM ANALYSIS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Grade Distribution</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#166534', width: '15px' }}>A</span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '60%', height: '100%', backgroundColor: '#166534' }} /></div>
                      <span style={{ color: '#64748b' }}>12</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#0284c7', width: '15px' }}>B</span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '70%', height: '100%', backgroundColor: '#0284c7' }} /></div>
                      <span style={{ color: '#64748b' }}>14</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#475569', width: '15px' }}>C</span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '40%', height: '100%', backgroundColor: '#475569' }} /></div>
                      <span style={{ color: '#64748b' }}>8</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#b45309', width: '15px' }}>D</span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '15%', height: '100%', backgroundColor: '#b45309' }} /></div>
                      <span style={{ color: '#64748b' }}>3</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#dc2626', width: '15px' }}>F</span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '5%', height: '100%', backgroundColor: '#dc2626' }} /></div>
                      <span style={{ color: '#64748b' }}>1</span>
                    </div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Weakest Concepts</h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#64748b' }}>Based on question analysis</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '2px' }}>
                        <span>Mitochondrial Function (Q4, Q7)</span>
                        <span style={{ color: '#dc2626' }}>42% Correct</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: '42%', height: '100%', backgroundColor: '#dc2626' }} /></div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '2px' }}>
                        <span>Cell Wall Structure (Q12)</span>
                        <span style={{ color: '#b45309' }}>55% Correct</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: '55%', height: '100%', backgroundColor: '#b45309' }} /></div>
                    </div>
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