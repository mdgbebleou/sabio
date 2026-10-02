import React, { useState } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';

interface Student {
  id: string;
  name: string;
  studentId: string;
  attendance: string;
  averageScore: string;
  performance: 'Good' | 'Needs Attention' | 'Excellent' | 'Average';
  status: 'Active' | 'Inactive';
  avatarInitials: string;
  gender: string;
  age: number;
}

const mockStudents: Student[] = [
  { id: '1', name: 'Daniel Mensah', studentId: 'ST00124', attendance: '96%', averageScore: '81%', performance: 'Good', status: 'Active', avatarInitials: 'DM', gender: 'Male', age: 14 },
  { id: '2', name: 'Ama Owusu', studentId: 'ST00125', attendance: '94%', averageScore: '76%', performance: 'Good', status: 'Active', avatarInitials: 'AO', gender: 'Female', age: 14 },
  { id: '3', name: 'Kojo Asare', studentId: 'ST00126', attendance: '87%', averageScore: '61%', performance: 'Needs Attention', status: 'Active', avatarInitials: 'KA', gender: 'Male', age: 15 },
  { id: '4', name: 'Michael Boateng', studentId: 'ST00127', attendance: '91%', averageScore: '73%', performance: 'Good', status: 'Active', avatarInitials: 'MB', gender: 'Male', age: 14 },
  { id: '5', name: 'Abena Frimpong', studentId: 'ST00128', attendance: '98%', averageScore: '88%', performance: 'Excellent', status: 'Active', avatarInitials: 'AF', gender: 'Female', age: 14 },
  { id: '6', name: 'Kwame Asante', studentId: 'ST00129', attendance: '78%', averageScore: '57%', performance: 'Needs Attention', status: 'Active', avatarInitials: 'KA', gender: 'Male', age: 15 },
  { id: '7', name: 'Efua Atu', studentId: 'ST00130', attendance: '93%', averageScore: '69%', performance: 'Average', status: 'Active', avatarInitials: 'EM', gender: 'Female', age: 14 },
  { id: '8', name: 'Yaw Osei', studentId: 'ST00131', attendance: '89%', averageScore: '64%', performance: 'Average', status: 'Active', avatarInitials: 'YO', gender: 'Male', age: 14 },
];

export const TeacherClassView: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'academic' | 'attendance' | 'fees' | 'notes'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('');

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const getPerformanceBadge = (perf: Student['performance']) => {
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

  return (
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* VIEW 1: CLASS ROSTER (JHS 2A) */}
        {!selectedStudent ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                  JHS 2A — Students
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Integrated Science • 38 Students
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  More Options
                </button>
                <button style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  Take Attendance
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL STUDENTS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>38</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ATTENDANCE</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginTop: '6px' }}>94%</div>
              </div>

              <div style={cardStyle}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CLASS AVERAGE</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>72%</div>
              </div>

              <div style={{ ...cardStyle, borderColor: '#fecaca', backgroundColor: '#fff5f5' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>NEEDING ATTENTION</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', marginTop: '6px' }}>5</div>
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
                  {mockStudents
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
                    .filter(s => !performanceFilter || s.performance === performanceFilter)
                    .map((student) => {
                      const badge = getPerformanceBadge(student.performance);
                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#0f172a' }}>{student.name}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600' }}>{student.studentId}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{student.attendance}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{student.averageScore}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                              {student.performance}
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
                    })}
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
                    {selectedStudent.studentId} • {selectedStudent.gender}, {selectedStudent.age} yrs • Class JHS 2A
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
                  Average score: <strong>{selectedStudent.averageScore}</strong> • Overall standing: <strong>{selectedStudent.performance}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};