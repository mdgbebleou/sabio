import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface TeacherData {
  id: string;
  customId: string;
  name: string;
  avatar?: string;
  department: string;
  subjects: string[];
  classes: string[];
  periodsPerWeek: number;
  loadBadge: 'Balanced' | 'High Load' | 'Low Load';
  hasConflict: boolean;
  status: 'Active' | 'On Leave' | 'Deactivated';
}

const mockTeachers: TeacherData[] = [
  {
    id: '1',
    customId: 'TCH-2041',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    department: 'Mathematics',
    subjects: ['Algebra', 'Calculus'],
    classes: ['Form 3A', '4B', '5C'],
    periodsPerWeek: 18,
    loadBadge: 'Balanced',
    hasConflict: false,
    status: 'Active',
  },
  {
    id: '2',
    customId: 'TCH-1892',
    name: 'Marcus Reed',
    department: 'Science',
    subjects: ['Physics'],
    classes: ['Form 4A', '4C', '5A', '5B'],
    periodsPerWeek: 26,
    loadBadge: 'High Load',
    hasConflict: true,
    status: 'Active',
  },
  {
    id: '3',
    customId: 'TCH-3011',
    name: 'Elena Lopez',
    department: 'Languages',
    subjects: ['Spanish'],
    classes: ['Form 1B', '2A', '3B'],
    periodsPerWeek: 14,
    loadBadge: 'Balanced',
    hasConflict: false,
    status: 'Active',
  },
  {
    id: '4',
    customId: 'TCH-1055',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    department: 'History',
    subjects: ['World History'],
    classes: [],
    periodsPerWeek: 0,
    loadBadge: 'Low Load',
    hasConflict: false,
    status: 'On Leave',
  },
];

export const Teachers: React.FC = () => {
  //const [teachers, setTeachers] = useState<TeacherData[]>(mockTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  //const [selectedClass, setSelectedClass] = useState('All');
  const [selectedWorkload, setSelectedWorkload] = useState('All');

  // Modal Control States
  const [activeModal, setActiveModal] = useState<'add' | 'assign' | 'deactivate' | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Deactivate form options state
  const [deactivateOption, setDeactivateOption] = useState<'pending' | 'reassign'>('pending');

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

  const handleOpenAction = (type: 'assign' | 'deactivate', teacher: TeacherData) => {
    setSelectedTeacher(teacher);
    setActiveModal(type);
    setOpenMenuId(null);
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Teachers</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage teaching staff, assignments, schedules and account activity.
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
              onClick={() => setActiveModal('add')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#002b49', border: 'none', padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Teacher
            </button>
          </div>
        </div>

        {/* TOP SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL TEACHERS</span>
              <div style={{ backgroundColor: '#e0e7ff', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3730a3" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>76</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', marginTop: '4px', cursor: 'pointer' }}>View All →</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACTIVE TEACHERS</span>
              <div style={{ backgroundColor: '#dcfce7', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>72</div>
            <div style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>↑ 2 this month</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSIGNMENTS</span>
              <div style={{ backgroundColor: '#e0f2fe', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>148</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', marginTop: '4px', cursor: 'pointer' }}>View Schedule Matrix →</div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ATTENTION REQUIRED</span>
              <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>9</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#991b1b', marginTop: '4px', cursor: 'pointer' }}>Review Issues →</div>
          </div>

        </div>

        {/* OPERATIONS & WORKLOAD DISTRIBUTION SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          
          {/* Operations Insights */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Teaching Operations Insights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Schedule Conflicts
                  </div>
                  <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>3</span>
                </div>
                <p style={{ margin: '8px 0 10px 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>Two classes assigned to same teacher during same period.</p>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Resolve Conflicts</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
                    Unassigned Teachers
                  </div>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>4</span>
                </div>
                <p style={{ margin: '8px 0 10px 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>Teachers currently have no active class assignment.</p>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Assign Classes</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    Workload Imbalance
                  </div>
                  <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>6</span>
                </div>
                <p style={{ margin: '8px 0 10px 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>School Avg: 18 | Highest: 27</p>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Review Loads</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Incomplete Records
                  </div>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>4</span>
                </div>
                <p style={{ margin: '8px 0 10px 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>Missing critical contact or qualification details.</p>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Update Profiles</span>
              </div>

            </div>
          </div>

          {/* Teaching Load Distribution */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Teaching Load</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Distribution across staff</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#059669' }}>● Balanced</span>
                  <strong>61</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '80%', height: '100%', backgroundColor: '#10b981' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#dc2626' }}>● High Load (&gt;24)</span>
                  <strong>9</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', backgroundColor: '#ef4444' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#d97706' }}>● Low Load (&lt;12)</span>
                  <strong>6</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '10%', height: '100%', backgroundColor: '#f59e0b' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SEARCH AND FILTER CONTROLS */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '12px' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search teachers by name, ID, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>

            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
              <option value="All">Department (All)</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
            </select>

            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
              <option value="All">Subject (All)</option>
              <option value="Physics">Physics</option>
              <option value="Calculus">Calculus</option>
            </select>

            <select value={selectedWorkload} onChange={(e) => setSelectedWorkload(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
              <option value="All">Workload (All)</option>
              <option value="Balanced">Balanced</option>
              <option value="High Load">High Load</option>
            </select>

          </div>
        </div>

        {/* TEACHERS DATA TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'visible' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>TEACHER</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>DEPT / SUBJECT</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>CLASSES</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>LOAD</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>SCHEDULE</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '16px', textAlign: 'center', width: '40px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {teacher.avatar ? (
                          <img src={teacher.avatar} alt={teacher.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{teacher.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{teacher.customId}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{teacher.department}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{teacher.subjects.join(', ')}</div>
                    </td>

                    <td style={{ padding: '16px', fontWeight: '500', color: '#334155' }}>
                      {teacher.classes.length > 0 ? teacher.classes.join(', ') : <span style={{ color: '#94a3b8' }}>No classes assigned</span>}
                    </td>

                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{teacher.periodsPerWeek} periods</div>
                      <span style={{
                        backgroundColor: teacher.loadBadge === 'Balanced' ? '#dcfce7' : teacher.loadBadge === 'High Load' ? '#fee2e2' : '#fef3c7',
                        color: teacher.loadBadge === 'Balanced' ? '#166534' : teacher.loadBadge === 'High Load' ? '#991b1b' : '#92400e',
                        padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '2px'
                      }}>
                        {teacher.loadBadge}
                      </span>
                    </td>

                    <td style={{ padding: '16px' }}>
                      {teacher.hasConflict ? (
                        <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          Conflict Detected
                        </span>
                      ) : (
                        <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          No Conflict
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span style={{
                        color: teacher.status === 'Active' ? '#059669' : '#64748b',
                        fontWeight: 'bold', fontSize: '12px'
                      }}>
                        ● {teacher.status}
                      </span>
                    </td>

                    <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                      <button onClick={() => setOpenMenuId(openMenuId === teacher.id ? null : teacher.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>⋮</button>
                      
                      {openMenuId === teacher.id && (
                        <div style={{ position: 'absolute', right: '16px', top: '40px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '180px', overflow: 'hidden' }}>
                          <button onClick={() => handleOpenAction('assign', teacher)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            Assign Subject
                          </button>
                          <button onClick={() => handleOpenAction('deactivate', teacher)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            Deactivate Teacher
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: ADD NEW TEACHER MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'add' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '820px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add New Teacher</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Complete all mandatory fields to register a new faculty member into the system.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '400px' }}>
                {/* Stepper Sidebar */}
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                  <div style={{ color: '#002b49', backgroundColor: '#e0e7ff', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Personal Info
                  </div>
                  <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>Contact Info</div>
                  <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>Professional</div>
                  <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>Initial Assignment</div>
                  <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>Account Setup</div>
                </div>

                {/* Main Form Fields */}
                <div style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    1. Personal Information
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>First Name *</label>
                      <input type="text" placeholder="e.g. Jane" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Last Name *</label>
                      <input type="text" placeholder="e.g. Doe" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Teacher ID *</label>
                      <input type="text" value="TCH-2024-089" disabled style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', marginTop: '4px', backgroundColor: '#f1f5f9', color: '#64748b', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Date of Birth</label>
                      <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  {/* Impact Analysis Widget */}
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginTop: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>4. INITIAL ASSIGNMENT IMPACT</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                      <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Current Workload</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>0 <span style={{ fontSize: '10px', fontWeight: 'normal' }}>periods/wk</span></div>
                      </div>
                      <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>New Workload</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#1e40af' }}>18 <span style={{ fontSize: '10px', fontWeight: 'normal' }}>periods/wk</span></div>
                      </div>
                      <div style={{ backgroundColor: '#dcfce7', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold' }}>✓ No Conflicts</div>
                        <div style={{ fontSize: '10px', color: '#15803d' }}>Schedule is optimal</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Save & Add Teacher</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: ASSIGN SUBJECT TO TEACHER MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'assign' && selectedTeacher && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Assign Subject to Teacher</h3>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Teacher Profile Box */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <img src={selectedTeacher.avatar || 'https://via.placeholder.com/40'} alt={selectedTeacher.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>Mr. Daniel Mensah</div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '12px', marginTop: '2px' }}>
                      <span>🪪 ID: TCH-2023-042</span>
                      <span>🏫 Department: Sciences</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>CURRENT SUBJECTS</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>● Physics (Grade 10)</span>
                  <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>● Physics (Grade 11)</span>
                  <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>● Chemistry (Grade 10)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Subject</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Advanced Physics</option>
                      <option>General Chemistry</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Academic Period</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>2023/2024 - Term 2</option>
                    </select>
                  </div>
                </div>

                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Assign to Classes</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '6px 0 16px 0' }}>
                  <div style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" defaultChecked /> 12-Sci-A
                  </div>
                  <div style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" defaultChecked /> 12-Sci-B
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" /> 12-Sci-C
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" /> 12-Gen-A
                  </div>
                </div>

                {/* Impact Analysis Banner */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase' }}>IMPACT ANALYSIS</span>
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>✓ Recommended</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '10px' }}>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>Current Workload</span><br /><strong>18 periods/wk</strong></div>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>New Workload</span><br /><strong style={{ color: '#1e40af' }}>22 periods/wk</strong></div>
                    <div><span style={{ color: '#64748b', fontSize: '10px' }}>Change</span><br /><strong style={{ color: '#166534' }}>📈 +4</strong></div>
                  </div>

                  <div style={{ backgroundColor: '#dcfce7', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', color: '#166534', display: 'flex', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <strong>Schedule Conflict Status:</strong> No scheduling conflicts detected. Teacher has availability during required periods.
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Assign Subject</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: DEACTIVATE TEACHER MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'deactivate' && selectedTeacher && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Deactivate Teacher
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <img src={selectedTeacher.avatar || 'https://via.placeholder.com/40'} alt={selectedTeacher.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>Sarah Jenkins</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>ID: TCH-8492 • Senior Science Educator</div>
                    <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginTop: '2px', display: 'inline-block' }}>Science Department</span>
                  </div>
                </div>

                {/* Warning Card */}
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#991b1b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Active Assignments Detected
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#7f1d1d' }}>Deactivating this teacher will impact ongoing classes. Please select how to handle their current workload.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#991b1b' }}>3</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#7f1d1d' }}>CLASSES</div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#991b1b' }}>2</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#7f1d1d' }}>SUBJECTS</div>
                    </div>
                  </div>

                  <label style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#7f1d1d', fontWeight: 'bold', cursor: 'pointer', marginBottom: '6px' }}>
                    <input type="radio" checked={deactivateOption === 'pending'} onChange={() => setDeactivateOption('pending')} />
                    <span>Keep assignments pending reassignment</span>
                  </label>
                  <div style={{ fontSize: '11px', color: '#991b1b', marginLeft: '24px', marginBottom: '8px' }}>Classes will temporarily have no assigned teacher.</div>

                  <label style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#7f1d1d', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input type="radio" checked={deactivateOption === 'reassign'} onChange={() => setDeactivateOption('reassign')} />
                    <span>Reassign now</span>
                  </label>
                  <div style={{ fontSize: '11px', color: '#991b1b', marginLeft: '24px' }}>You will be prompted to select replacement teachers next.</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>REASON FOR DEACTIVATION</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Select a reason...</option>
                      <option>Resignation</option>
                      <option>Contract Ended</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>EFFECTIVE DATE</label>
                    <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>ADDITIONAL NOTES</label>
                  <textarea placeholder="Enter any relevant details regarding this deactivation..." style={{ width: '100%', height: '60px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#b91c1c', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>DEACTIVATE TEACHER</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};