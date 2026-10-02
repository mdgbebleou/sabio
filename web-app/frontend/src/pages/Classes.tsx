import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface ClassData {
  id: string;
  code: string;
  name: string;
  grade: string;
  enrolledStudents: number;
  capacity: number;
  classTeacher?: {
    name: string;
    avatar?: string;
  };
  totalSubjects: number;
  assignedTeachersCount: number;
  status: 'Active' | 'Inactive';
}

const mockClasses: ClassData[] = [
  {
    id: '1',
    code: 'F2A',
    name: 'Form 2A',
    grade: 'Grade 11',
    enrolledStudents: 46,
    capacity: 40,
    classTeacher: {
      name: 'Mr. Mensah',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    totalSubjects: 8,
    assignedTeachersCount: 6,
    status: 'Active',
  },
  {
    id: '2',
    code: 'F1B',
    name: 'Form 1B',
    grade: 'Grade 10',
    enrolledStudents: 38,
    capacity: 40,
    classTeacher: undefined,
    totalSubjects: 8,
    assignedTeachersCount: 8,
    status: 'Active',
  },
  {
    id: '3',
    code: 'S101',
    name: 'Science 101',
    grade: 'Grade 10',
    enrolledStudents: 32,
    capacity: 40,
    classTeacher: {
      name: 'Dr. Smith',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    },
    totalSubjects: 6,
    assignedTeachersCount: 6,
    status: 'Active',
  },
];

export const Classes: React.FC = () => {
  const [classesList, setClassesList] = useState<ClassData[]>(mockClasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYear, setAcademicYear] = useState('23/24');
  const [term, setTerm] = useState('Term 1');
  const [gradeFilter, setGradeFilter] = useState('All');

  // Modal Control States
  const [activeModal, setActiveModal] = useState<'create' | 'addStudent' | 'assignSubject' | 'assignTeacher' | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  const handleOpenAction = (type: 'addStudent' | 'assignSubject' | 'assignTeacher', cls: ClassData) => {
    setSelectedClass(cls);
    setActiveModal(type);
    setOpenMenuId(null);
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Classes</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage classes, student enrollment, teachers and academic assignments.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px',
              borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>

            <button 
              onClick={() => setActiveModal('create')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#002b49', border: 'none', padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Class
            </button>
          </div>
        </div>

        {/* TOP KPI METRICS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          
          {/* Total Classes */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL CLASSES</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>24</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>24 active, 2 inactive</div>
          </div>

          {/* Total Students */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL STUDENTS</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>986</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Avg 41 per class</div>
          </div>

          {/* Teacher Coverage */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TEACHER COVERAGE</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>94%</div>
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>2 need attention</div>
          </div>

          {/* Attention Required */}
          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ATTENTION REQD</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>5</div>
            <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '4px' }}>Alerts & missing</div>
          </div>

        </div>

        {/* SECOND ROW ALERT INSIGHT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          {/* Capacity Alerts */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Capacity Alerts
            </div>
            <p style={{ fontSize: '12px', color: '#334155', margin: '8px 0 12px 0', lineHeight: '1.4' }}>
              2 classes are above the configured student capacity. Form 2A has 46 students against a capacity of 40.
            </p>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Review Classes</span>
          </div>

          {/* Missing Class Teachers */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#d97706', textTransform: 'uppercase' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
              Missing Class Teachers
            </div>
            <p style={{ fontSize: '12px', color: '#334155', margin: '8px 0 12px 0', lineHeight: '1.4' }}>
              1 class does not currently have a designated class teacher assigned for this term.
            </p>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Assign Teacher</span>
          </div>

          {/* Subject Coverage */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Subject Coverage
            </div>
            <p style={{ fontSize: '12px', color: '#334155', margin: '8px 0 12px 0', lineHeight: '1.4' }}>
              2 classes have incomplete subject assignments for the current academic period.
            </p>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Review Subjects</span>
          </div>

          {/* Teacher Coverage Alert */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Teacher Coverage
            </div>
            <p style={{ fontSize: '12px', color: '#334155', margin: '8px 0 12px 0', lineHeight: '1.4' }}>
              3 classes have subjects without an assigned teacher. Schedule optimization recommended.
            </p>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Review Assignments</span>
          </div>

        </div>

        {/* SEARCH AND FILTER BAR */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '12px' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by class name, code, teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>

            <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
              <option value="23/24">Academic Year (23/24)</option>
            </select>

            <select value={term} onChange={(e) => setTerm(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
            </select>

            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
              <option value="All">All Grades</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
            </select>

            <button style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              More Filters
            </button>

          </div>
        </div>

        {/* CLASSES DATA TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'visible' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>CLASS</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>STUDENTS & CAPACITY</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>CLASS TEACHER</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>ACADEMICS</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '16px', textAlign: 'center', width: '40px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {classesList.map((cls) => {
                  const isOverCapacity = cls.enrolledStudents > cls.capacity;
                  const overflowCount = cls.enrolledStudents - cls.capacity;

                  return (
                    <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Class Title & Code */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOverCapacity ? '#dc2626' : '#166534' }}></span>
                          <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{cls.name}</div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '16px' }}>{cls.code} • {cls.grade}</div>
                      </td>

                      {/* Capacity Progress Bar */}
                      <td style={{ padding: '16px', minWidth: '200px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                          <span>{cls.enrolledStudents}</span>
                          <span style={{ color: isOverCapacity ? '#dc2626' : '#64748b' }}>{cls.enrolledStudents}/{cls.capacity}</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min((cls.enrolledStudents / cls.capacity) * 100, 100)}%`,
                            height: '100%',
                            backgroundColor: isOverCapacity ? '#dc2626' : '#102a43'
                          }}></div>
                        </div>
                        {isOverCapacity ? (
                          <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginTop: '4px', display: 'inline-block' }}>
                            OVER CAPACITY +{overflowCount}
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginTop: '4px', display: 'inline-block' }}>
                            WITHIN CAPACITY
                          </span>
                        )}
                      </td>

                      {/* Class Teacher */}
                      <td style={{ padding: '16px' }}>
                        {cls.classTeacher ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={cls.classTeacher.avatar || 'https://via.placeholder.com/32'} alt={cls.classTeacher.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{cls.classTeacher.name}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 'bold' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
                            </div>
                            Not Assigned
                          </div>
                        )}
                      </td>

                      {/* Academics Coverage */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{cls.totalSubjects} Subjects</div>
                        <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          {cls.assignedTeachersCount}/{cls.totalSubjects} Teachers Assigned
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px' }}>
                        <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          {cls.status}
                        </span>
                      </td>

                      {/* Actions Menu */}
                      <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => setOpenMenuId(openMenuId === cls.id ? null : cls.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>⋮</button>
                        
                        {openMenuId === cls.id && (
                          <div style={{ position: 'absolute', right: '16px', top: '40px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '190px', overflow: 'hidden' }}>
                            <button onClick={() => handleOpenAction('addStudent', cls)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
                              Add Student to Class
                            </button>
                            <button onClick={() => handleOpenAction('assignSubject', cls)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                              Assign Subject
                            </button>
                            <button onClick={() => handleOpenAction('assignTeacher', cls)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              Assign Class Teacher
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: CREATE CLASS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'create' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Create Class</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Create a class and define its academic structure.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '12px' }}>CLASS INFORMATION</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Class Name</label>
                    <input type="text" placeholder="e.g., Form 2A" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Class Code</label>
                    <input type="text" placeholder="E.G., F2A" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Grade / Level</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Form 2</option>
                      <option>Form 1</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Academic Year</label>
                    <input type="text" value="2023/2024" disabled style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', marginTop: '4px', backgroundColor: '#f1f5f9', color: '#64748b', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Term</label>
                    <input type="text" value="Term 1" disabled style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', marginTop: '4px', backgroundColor: '#f1f5f9', color: '#64748b', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Class Capacity</label>
                    <input type="number" defaultValue={40} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Status</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>CLASS TEACHER</div>
                <input type="text" placeholder="Search teacher by name or ID..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '16px', boxSizing: 'border-box' }} />

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>REQUIRED SUBJECTS</div>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Mathematics ✕</span>
                  <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>English ✕</span>
                  <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Science ✕</span>
                  <button style={{ border: '1px dashed #cbd5e1', backgroundColor: '#ffffff', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>+ Add Subject</button>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>ENROLLMENT & CAPACITY</div>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
                    <input type="checkbox" defaultChecked />
                    Add Students Now (12 students selected via bulk import)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', fontSize: '12px' }}>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>Current</span><br /><strong>12</strong></div>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>Capacity</span><br /><strong>40</strong></div>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>Available</span><br /><strong style={{ color: '#166534' }}>28</strong></div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Create Class</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: ADD STUDENT TO CLASS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'addStudent' && selectedClass && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add Student to Class</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Assign a student to this class for the selected academic period.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Target Class Header */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>TARGET CLASS</div>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '16px' }}>{selectedClass.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>CAPACITY</div>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>38/40 <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'normal' }}>(2 spaces left)</span></div>
                  </div>
                </div>

                {/* Selected Student Preview */}
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>SELECT STUDENT</div>
                <div style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#002b49', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>KM</div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Kofi Mensah</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>ID: S-11045 • Current: Form 1B</div>
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>● ACTIVE</span>
                </div>

                {/* Transfer Info */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                    Transfer Student
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#64748b' }}>The student's class assignment will change from Form 1B to Form 2A.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '12px' }}>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>CURRENT ENROLLMENT</span><br /><strong>Form 1B</strong></div>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>STUDENT STATUS</span><br /><strong style={{ color: '#166534' }}>✓ Active</strong></div>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>CLASS CAPACITY</span><br /><strong>38/40</strong></div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Transfer Student →</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: ASSIGN SUBJECT TO CLASS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'assignSubject' && selectedClass && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Assign Subject</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Add a subject to this class and review teacher coverage.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Header Summary Box */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '12px' }}>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>CLASS</span><br /><strong>{selectedClass.name}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>GRADE</span><br /><strong>11</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: '10px' }}>YEAR</span><br /><strong>2023/2024</strong></div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>SELECT SUBJECT</div>
                <input type="text" placeholder="🔍 Mathematics (MATH101)" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Mathematics</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>MATH101</div>
                  </div>
                  <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>CORE</span>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>SUBJECT TEACHER</div>
                <input type="text" placeholder="🔍 Mr. Daniel Mensah" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Mr. Daniel Mensah</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Specialized in Mathematics</div>
                    </div>
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>✓ No conflict detected</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Current Workload: <strong>18 periods/wk</strong></div>
                </div>

                {/* Validation Summary */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>VALIDATION SUMMARY</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span>✓ Subject Eligibility</span>
                    <strong style={{ color: '#166534' }}>Available for this class level</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>✓ Projected Workload</span>
                    <div><strong>18 → 20 periods/wk</strong> <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginLeft: '6px' }}>WITHIN RANGE</span></div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Recommended
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Assign Subject</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: ASSIGN TEACHER MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'assignTeacher' && selectedClass && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Assign Teacher</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Assign a teacher to this class and review their current teaching workload.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Class Chips */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>📖 {selectedClass.name}</span>
                  <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>👥 38/40</span>
                  <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>📅 2023/2024</span>
                  <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>🕒 Term 1</span>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>SELECT TEACHER</div>
                <input type="text" placeholder="🔍 Daniel Mensah" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />

                <div style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Daniel Mensah" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Mr. Daniel Mensah</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Mathematics • 3 Classes</div>
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>✓ Available</span>
                </div>

                {/* Assignment Impact Box */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '12px' }}>ASSIGNMENT IMPACT</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>Current Workload</span><br /><strong style={{ fontSize: '16px' }}>18</strong> <span style={{ fontSize: '11px' }}>periods/wk</span></div>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>New Workload</span><br /><strong style={{ fontSize: '16px', color: '#002b49' }}>20</strong> <span style={{ fontSize: '11px' }}>periods/wk</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', marginBottom: '12px' }}>
                    <div>Workload Change: <strong>+2 periods/wk</strong></div>
                    <div>Schedule Conflict: <strong style={{ color: '#166534' }}>None detected</strong></div>
                  </div>

                  <div style={{ backgroundColor: '#dcfce7', padding: '10px', borderRadius: '8px', fontSize: '11px', color: '#166534', fontWeight: 'bold' }}>
                    ✓ Recommended: Teacher is available and the assignment is within the configured workload range.
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Assign Teacher →</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};