import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

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

interface GradeData {
  id: string;
  code: string;
  name: string;
  description: string;
  classesCount: number;
  totalStudents: number;
  status: 'Active' | 'Inactive';
}

export const Classes: React.FC = () => {
  // View mode switcher: 'classes' or 'grades'
  const [viewMode, setViewMode] = useState<'classes' | 'grades'>('classes');

  const [classesList, setClassesList] = useState<ClassData[]>([]);
  const [gradesList, setGradesList] = useState<GradeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYear, setAcademicYear] = useState('2023/2024');
  const [term, setTerm] = useState('Term 1');
  const [gradeFilter, setGradeFilter] = useState('All');
  
  // Grade-specific status filter state
  const [gradeStatusFilter, setGradeStatusFilter] = useState('All');

  // KPI Metrics states
  const [totalClassesCount, setTotalClassesCount] = useState(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [totalGradesCount, setTotalGradesCount] = useState(0);

  // Modal Control States
  const [activeModal, setActiveModal] = useState<'createClass' | 'createGrade' | 'addStudent' | 'assignSubject' | 'assignTeacher' | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form state for creating a new class
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [newClassCapacity, setNewClassCapacity] = useState(40);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating a new grade
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeCode, setNewGradeCode] = useState('');
  const [newGradeDesc, setNewGradeDesc] = useState('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

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

  // Fetch Data Effect with corrected query columns
  useEffect(() => {
    let isMounted = true;

    const loadAcademicData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch grades from Supabase
        const { data: gradesData, error: gradesError } = await supabase.from('grades').select('*');
        if (gradesError) throw gradesError;

        // 2. Fetch classes from Supabase with safe profile columns (first_name, last_name)
        let classesQuery = supabase.from('classes').select('*, profiles:class_teacher_id(first_name, last_name)');
        if (gradeFilter !== 'All') {
          classesQuery = classesQuery.eq('grade', gradeFilter);
        }

        const { data: classesData, error: classesError } = await classesQuery;
        if (classesError) throw classesError;

        // 3. Fetch student counts per class from the students table
        const { data: studentsData, error: studentsError } = await supabase.from('students').select('id, class_id');
        if (studentsError) throw studentsError;

        const studentCountMap: { [key: string]: number } = {};
        (studentsData || []).forEach((st: Record<string, unknown>) => {
          const classId = st.class_id as string;
          if (classId) {
            studentCountMap[classId] = (studentCountMap[classId] || 0) + 1;
          }
        });

        const formattedClasses: ClassData[] = (classesData || []).map((cls: Record<string, unknown>) => {
          const teacherProfile = cls.profiles as Record<string, unknown> | null;
          const teacherName = teacherProfile 
            ? `${teacherProfile.first_name || ''} ${teacherProfile.last_name || ''}`.trim() 
            : undefined;

          return {
            id: cls.id as string,
            code: cls.code as string,
            name: cls.name as string,
            grade: cls.grade as string,
            enrolledStudents: studentCountMap[cls.id as string] || 0,
            capacity: (cls.capacity as number) || 40,
            classTeacher: teacherName && teacherName.length > 0 ? { name: teacherName } : undefined,
            totalSubjects: 8,
            assignedTeachersCount: 8,
            status: (cls.status as 'Active' | 'Inactive') || 'Active',
          };
        });

        // Format grades from Supabase table with live class & student counts
        const formattedGrades: GradeData[] = (gradesData || []).map((g: Record<string, unknown>) => {
          const relatedClasses = formattedClasses.filter(c => c.grade === g.name);
          return {
            id: g.id as string,
            code: g.code as string,
            name: g.name as string,
            description: (g.description as string) || 'N/A',
            classesCount: relatedClasses.length,
            totalStudents: relatedClasses.reduce((acc, curr) => acc + curr.enrolledStudents, 0),
            status: (g.status as 'Active' | 'Inactive') || 'Active',
          };
        });

        if (isMounted) {
          setClassesList(formattedClasses);
          setTotalClassesCount(formattedClasses.length);
          setTotalStudentsCount((studentsData || []).length);
          setGradesList(formattedGrades);
          setTotalGradesCount(formattedGrades.length);

          setNewClassGrade(prev => (!prev && formattedGrades.length > 0 ? formattedGrades[0].name : prev));
        }
      } catch (err) {
        console.error('Error fetching academic data:', err);
        if (isMounted) {
          setClassesList([]);
          setGradesList([]);
          setTotalClassesCount(0);
          setTotalStudentsCount(0);
          setTotalGradesCount(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAcademicData();

    return () => {
      isMounted = false;
    };
  }, [academicYear, term, gradeFilter]);

  const handleCreateClass = async () => {
    if (!newClassName || !newClassCode) {
      alert('Please fill in the class name and class code.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('classes').insert([
        {
          name: newClassName.trim(),
          code: newClassCode.trim().toUpperCase(),
          grade: newClassGrade,
          capacity: Number(newClassCapacity),
          academic_year: academicYear,
          term: term,
          status: 'Active',
        }
      ]);

      if (error) throw error;

      alert('Class created successfully!');
      setActiveModal(null);
      setNewClassName('');
      setNewClassCode('');
      window.location.reload(); 
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error creating class:', errorMessage);
      alert('Failed to create class: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGrade = async () => {
    if (!newGradeName || !newGradeCode) {
      alert('Please fill in the grade name and code.');
      return;
    }

    try {
      setIsSubmittingGrade(true);
      const { error } = await supabase.from('grades').insert([
        {
          name: newGradeName.trim(),
          code: newGradeCode.trim().toUpperCase(),
          description: newGradeDesc.trim(),
          status: 'Active',
        }
      ]);

      if (error) throw error;

      alert('Grade added successfully to database!');
      setActiveModal(null);
      setNewGradeName('');
      setNewGradeCode('');
      setNewGradeDesc('');
      window.location.reload(); 
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error creating grade:', errorMessage);
      alert('Failed to create grade: ' + errorMessage);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const handleOpenAction = (type: 'addStudent' | 'assignSubject' | 'assignTeacher', cls: ClassData) => {
    setActiveModal(type);
    setOpenMenuId(null);
    console.log('Selected class for action:', cls.id);
  };

  const filteredClasses = classesList.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.classTeacher?.name && cls.classTeacher.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGrades = gradesList.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = gradeStatusFilter === 'All' || g.status === gradeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Academic Structure</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Switch between managing Grades and specific Classes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {viewMode === 'classes' ? (
              <button 
                onClick={() => setActiveModal('createClass')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  backgroundColor: '#002b49', border: 'none', padding: '8px 16px',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer'
                }}
              >
                + Create Class
              </button>
            ) : (
              <button 
                onClick={() => setActiveModal('createGrade')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  backgroundColor: '#002b49', border: 'none', padding: '8px 16px',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer'
                }}
              >
                + Add Grade
              </button>
            )}
          </div>
        </div>

        {/* VIEW SWITCHER TABS (Classes vs Grades) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <button
            onClick={() => setViewMode('classes')}
            style={{
              padding: '8px 20px', borderRadius: '10px', border: 'none',
              backgroundColor: viewMode === 'classes' ? '#002b49' : '#f1f5f9',
              color: viewMode === 'classes' ? '#ffffff' : '#334155',
              fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            Classes ({totalClassesCount})
          </button>
          <button
            onClick={() => setViewMode('grades')}
            style={{
              padding: '8px 20px', borderRadius: '10px', border: 'none',
              backgroundColor: viewMode === 'grades' ? '#002b49' : '#f1f5f9',
              color: viewMode === 'grades' ? '#ffffff' : '#334155',
              fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            Grades ({totalGradesCount})
          </button>
        </div>

        {/* TOP KPI METRICS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL CLASSES</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{totalClassesCount}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Active database records</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL GRADES</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{totalGradesCount}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Academic tiers</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL STUDENTS</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{totalStudentsCount}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Enrolled across classes</div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ATTENTION REQD</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>0</div>
            <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '4px' }}>No active alerts</div>
          </div>

        </div>

        {/* SEARCH AND FILTER BAR */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={viewMode === 'classes' ? "Search by class name, code, teacher..." : "Search by grade name or code..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>

            {viewMode === 'classes' ? (
              <>
                <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                  <option value="2023/2024">Academic Year (2023/2024)</option>
                  <option value="2026/2027">Academic Year (2026/2027)</option>
                </select>

                <select value={term} onChange={(e) => setTerm(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                </select>

                <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                  <option value="All">All Grades</option>
                  {gradesList.map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <select value={gradeStatusFilter} onChange={(e) => setGradeStatusFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </>
            )}

          </div>
        </div>

        {/* DATA TABLE VIEW: CLASSES OR GRADES */}
        {viewMode === 'classes' ? (
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading classes from database...</td>
                    </tr>
                  ) : filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                        N/A (No classes found in the database. Click "+ Create Class" to add one.)
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((cls) => {
                      const isOverCapacity = cls.enrolledStudents > cls.capacity;

                      return (
                        <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOverCapacity ? '#dc2626' : '#166534' }}></span>
                              <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{cls.name}</div>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '16px' }}>{cls.code} • {cls.grade}</div>
                          </td>

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
                          </td>

                          <td style={{ padding: '16px' }}>
                            {cls.classTeacher ? (
                              <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{cls.classTeacher.name}</div>
                            ) : (
                              <div style={{ color: '#dc2626', fontWeight: 'bold' }}>Not Assigned</div>
                            )}
                          </td>

                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{cls.totalSubjects} Subjects</div>
                          </td>

                          <td style={{ padding: '16px' }}>
                            <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                              {cls.status}
                            </span>
                          </td>

                          <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                            <button onClick={() => setOpenMenuId(openMenuId === cls.id ? null : cls.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>⋮</button>
                            
                            {openMenuId === cls.id && (
                              <div style={{ position: 'absolute', right: '16px', top: '40px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '190px', overflow: 'hidden' }}>
                                <button onClick={() => handleOpenAction('addStudent', cls)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                                  Add Student to Class
                                </button>
                                <button onClick={() => handleOpenAction('assignSubject', cls)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                                  Assign Subject
                                </button>
                                <button onClick={() => handleOpenAction('assignTeacher', cls)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', borderTop: '1px solid #f1f5f9' }}>
                                  Assign Class Teacher
                                </button>
                              </div>
                            )}
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
          <div style={{ ...cardStyle, padding: 0, overflow: 'visible' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px', textAlign: 'left' }}>GRADE NAME</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>CODE</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>DESCRIPTION</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>CLASSES COUNT</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>TOTAL STUDENTS</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading grades from database...</td>
                    </tr>
                  ) : filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                        N/A (No grades found matching your filter. Click "+ Add Grade" to create one.)
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map((g) => (
                      <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold', color: '#0f172a' }}>{g.name}</td>
                        <td style={{ padding: '16px', color: '#64748b' }}>{g.code}</td>
                        <td style={{ padding: '16px', color: '#334155' }}>{g.description}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>{g.classesCount}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#166534' }}>{g.totalStudents}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP: CREATE CLASS MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'createClass' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Create Class</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Create a class and assign its grade level.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Class Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Form 2A" 
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Class Code *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., F2A" 
                      value={newClassCode}
                      onChange={(e) => setNewClassCode(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Grade Level</label>
                    <select 
                      value={newClassGrade}
                      onChange={(e) => setNewClassGrade(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}
                    >
                      {gradesList.map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Class Capacity</label>
                    <input 
                      type="number" 
                      value={newClassCapacity}
                      onChange={(e) => setNewClassCapacity(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreateClass} disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  {isSubmitting ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP: CREATE GRADE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'createGrade' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add Grade Level</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Define an academic tier in the database.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Grade Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Grade 12" 
                      value={newGradeName}
                      onChange={(e) => setNewGradeName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Grade Code *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., G-12" 
                      value={newGradeCode}
                      onChange={(e) => setNewGradeCode(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Final year secondary level" 
                    value={newGradeDesc}
                    onChange={(e) => setNewGradeDesc(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreateGrade} disabled={isSubmittingGrade} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  {isSubmittingGrade ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
