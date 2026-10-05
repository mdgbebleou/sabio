import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

interface StudentData {
  id: string;
  customId: string;
  name: string;
  avatar?: string;
  attentionFlag?: 'ATTENTION REQUIRED' | 'WARNING' | null;
  className: string;
  classId?: string;
  parentName: string;
  academicScore: string;
  academicTrend: 'up' | 'down' | 'flat';
  attendanceScore: string;
  attendanceWarning?: boolean;
  feeStatus: 'Paid' | 'Overdue' | 'Partial';
  feeAmountOverdue?: string;
  engagement: 'High' | 'Moderate' | 'Low';
  status: 'Active Enrolled' | 'Suspended' | 'Pending' | 'Deactivated';
}

interface ClassOption {
  id: string;
  name: string;
  grade: string;
}

interface GuardianOption {
  id: string;
  name: string;
}

export const Students: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [guardiansList, setGuardiansList] = useState<GuardianOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // KPI Count States
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [newStudentsCount, setNewStudentsCount] = useState(0);

  // Popup Modal States
  const [activeModal, setActiveModal] = useState<'add' | 'status' | 'deactivate' | 'assign' | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form Field States for Adding a Student
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [generatedStudentId, setGeneratedStudentId] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState('Male');
  const [newClassId, setNewClassId] = useState('');
  const [newGuardianId, setNewGuardianId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '620px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  // Fetch Students, Classes, and Guardians from Supabase
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch classes for dropdown selection
        const { data: dbClasses, error: classErr } = await supabase.from('classes').select('id, name, grade');
        if (classErr) throw classErr;
        if (isMounted) setClassesList(dbClasses || []);

        // 2. Fetch guardians and sort newest first (supporting both profiles or guardians tables)
        let formattedGuardians: GuardianOption[] = [];
        const { data: dbGuardians, error: guardErr } = await supabase
          .from('guardians')
          .select('id, full_name, created_at')
          .order('created_at', { ascending: false });

        if (!guardErr && dbGuardians && dbGuardians.length > 0) {
          formattedGuardians = dbGuardians.map((g: Record<string, unknown>) => ({
            id: g.id as string,
            name: (g.full_name as string) || 'Unnamed Guardian'
          }));
        } else {
          // Fallback to profiles table if guardians table is empty/missing
          const { data: dbProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, first_name, last_name, created_at')
            .order('created_at', { ascending: false });

          if (dbProfiles) {
            formattedGuardians = dbProfiles.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              name: (p.full_name as string) || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User Profile'
            }));
          }
        }

        if (isMounted) setGuardiansList(formattedGuardians);

        // 3. Fetch students from Supabase along with their assigned class & guardian info
        const { data: dbStudents, error: studentErr } = await supabase
          .from('students')
          .select('*, classes:class_id(name, grade), guardians:parent_id(full_name)');
        if (studentErr) throw studentErr;

        const formattedStudents: StudentData[] = (dbStudents || []).map((st: Record<string, unknown>) => {
          const cls = st.classes as Record<string, unknown> | null;
          const className = cls ? (cls.name as string) : ((st.class_name as string) || 'Unassigned');

          const guard = st.guardians as Record<string, unknown> | null;
          const parentName = guard ? (guard.full_name as string) : ((st.guardian_name as string) || 'Not Assigned');

          return {
            id: st.id as string,
            customId: (st.custom_id as string) || (st.id as string).slice(0, 8),
            name: `${st.first_name || ''} ${st.last_name || ''}`.trim(),
            avatar: (st.avatar as string) || undefined,
            attentionFlag: null,
            className: className,
            classId: (st.class_id as string) || undefined,
            parentName: parentName,
            academicScore: '78%',
            academicTrend: 'up',
            attendanceScore: '92%',
            feeStatus: 'Paid',
            engagement: 'High',
            status: (st.status as StudentData['status']) || 'Active Enrolled',
          };
        });

        if (isMounted) {
          setStudents(formattedStudents);
          setTotalStudentsCount(formattedStudents.length);
          setActiveStudentsCount(formattedStudents.filter(s => s.status === 'Active Enrolled').length);
          setNewStudentsCount(formattedStudents.filter(s => s.status === 'Pending' || s.status === 'Active Enrolled').length);
        }
      } catch (err) {
        console.error('Error fetching students data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Generate system student ID whenever the Add modal opens
  const handleOpenAddModal = () => {
    const randomId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedStudentId(randomId);
    setActiveModal('add');
  };

  const handleCreateStudent = async () => {
    if (!newFirstName || !newLastName || !newClassId) {
      alert('Please fill in First Name, Last Name, and assign a Class.');
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedClassObj = classesList.find(c => c.id === newClassId);
      const resolvedClassName = selectedClassObj ? selectedClassObj.name : 'Unassigned';

      const { error } = await supabase.from('students').insert([
        {
          first_name: newFirstName.trim(),
          last_name: newLastName.trim(),
          custom_id: generatedStudentId,
          dob: newDob || null,
          gender: newGender,
          class_id: newClassId,
          class_name: resolvedClassName,
          parent_id: newGuardianId || '00000000-0000-0000-0000-000000000000',
          status: 'Active Enrolled',
        }
      ]);

      if (error) throw error;

      alert('Student added successfully!');
      setActiveModal(null);
      setNewFirstName('');
      setNewLastName('');
      setNewClassId('');
      setNewGuardianId('');
      window.location.reload();
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err 
        ? (err as { message: string }).message 
        : String(err);
      console.error('Error creating student:', err);
      alert('Failed to create student: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAction = () => {
    setOpenMenuId(null);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Students</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage live student records, database enrollment, and academic status.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleOpenAddModal}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#002b49', border: 'none', padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer'
              }}
            >
              + Add Student
            </button>
          </div>
        </div>

        {/* TOP METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL STUDENTS</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{totalStudentsCount}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACTIVE</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{activeStudentsCount}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ENROLLED RECORDS</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{newStudentsCount}</div>
          </div>
          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ATTENTION REQUIRED</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>0</div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by name, ID, or guardian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            </div>
          </div>
        </div>

        {/* STUDENTS TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'visible' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>STUDENT</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>CLASS</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>PARENT/GUARDIAN</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>ACADEMIC</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>ATTENDANCE</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>FEE STATUS</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '16px', textAlign: 'center', width: '40px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading students from database...</td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                      No students found. Click "+ Add Student" to register one.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{student.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {student.customId}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px', color: '#334155', fontWeight: '500' }}>{student.className}</td>
                      <td style={{ padding: '16px', color: '#334155', fontWeight: '500' }}>{student.parentName}</td>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{student.academicScore}</td>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{student.attendanceScore}</td>
                      
                      <td style={{ padding: '16px' }}>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          {student.feeStatus}
                        </span>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                          {student.status}
                        </span>
                      </td>

                      <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}
                        >
                          ⋮
                        </button>

                        {openMenuId === student.id && (
                          <div style={{
                            position: 'absolute', right: '16px', top: '40px', backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                            zIndex: 100, minWidth: '180px', textAlign: 'left', overflow: 'hidden'
                          }}>
                            <button onClick={handleOpenAction} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                              🏫 Assign Class
                            </button>
                            <button onClick={handleOpenAction} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                              🔄 Change Status
                            </button>
                            <button onClick={handleOpenAction} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer', borderTop: '1px solid #f1f5f9' }}>
                              🚫 Deactivate Student
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL: ADD NEW STUDENT */}
        {/* ========================================================================= */}
        {activeModal === 'add' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '680px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add New Student</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Enroll a student into the Supabase database.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '14px' }}>
                  PERSONAL INFORMATION
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>First Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jane" 
                      value={newFirstName} 
                      onChange={(e) => setNewFirstName(e.target.value)} 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Last Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Doe" 
                      value={newLastName} 
                      onChange={(e) => setNewLastName(e.target.value)} 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>System Student ID</label>
                    <input 
                      type="text" 
                      value={generatedStudentId} 
                      readOnly 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 'bold', cursor: 'not-allowed', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Date of Birth</label>
                    <input 
                      type="date" 
                      value={newDob} 
                      onChange={(e) => setNewDob(e.target.value)} 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Gender</label>
                  <select 
                    value={newGender} 
                    onChange={(e) => setNewGender(e.target.value)} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', margin: '20px 0 14px 0' }}>
                  ENROLLMENT & RELATIONSHIPS
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Assign Class *</label>
                  <select 
                    value={newClassId} 
                    onChange={(e) => setNewClassId(e.target.value)} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}
                  >
                    <option value="">Select a class...</option>
                    {classesList.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name} ({cls.grade})</option>
                    ))}
                  </select>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>You can modify or reassign classes later from the action menu.</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Parent / Guardian Name</label>
                  <select 
                    value={newGuardianId} 
                    onChange={(e) => setNewGuardianId(e.target.value)} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}
                  >
                    <option value="">Select parent or guardian...</option>
                    {guardiansList.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>You can link a parent or guardian now, or update this assignment later.</p>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreateStudent} disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                  {isSubmitting ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
