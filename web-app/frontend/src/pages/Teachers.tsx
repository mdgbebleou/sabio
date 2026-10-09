import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AddUserModal } from '../components/AddUserModal';
import {
  getAllTeachers,
  getClassesForAssign,
  assignClassToTeacher,
  unassignTeacherClasses,
  deactivateTeacher,
} from '../services/teacherService';
import type { AdminTeacherRow } from '../services/teacherService';



export const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<AdminTeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedWorkload, setSelectedWorkload] = useState('All');

  // Modal control
  const [activeModal, setActiveModal] = useState<'assign' | 'deactivate' | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacherRow | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Assign-class modal state
  const [classesList, setClassesList] = useState<{ id: string; name: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Deactivate modal state
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivating, setDeactivating] = useState(false);

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

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getAllTeachers();
      setTeachers(rows);
    } catch (err: any) {
      setError(err?.message || 'Could not load teachers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTeachers();
  }, [loadTeachers]);

  const handleOpenAssign = async (teacher: AdminTeacherRow) => {
    setSelectedTeacher(teacher);
    setSelectedClassId('');
    setActiveModal('assign');
    setOpenMenuId(null);
    try {
      const cls = await getClassesForAssign();
      setClassesList(cls);
    } catch (err: any) {
      alert(err?.message || 'Could not load classes.');
    }
  };

  const handleOpenDeactivate = (teacher: AdminTeacherRow) => {
    setSelectedTeacher(teacher);
    setDeactivateReason('');
    setActiveModal('deactivate');
    setOpenMenuId(null);
  };

  const handleAssign = async () => {
    if (!selectedTeacher || !selectedClassId) {
      alert('Pick a class to assign.');
      return;
    }
    setAssigning(true);
    try {
      await assignClassToTeacher(selectedTeacher.id, selectedClassId);
      setActiveModal(null);
      await loadTeachers();
    } catch (err: any) {
      alert(err?.message || 'Could not assign class.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!selectedTeacher) return;
    if (!confirm('Remove all class assignments from this teacher?')) return;
    try {
      await unassignTeacherClasses(selectedTeacher.id);
      setActiveModal(null);
      await loadTeachers();
    } catch (err: any) {
      alert(err?.message || 'Could not unassign classes.');
    }
  };

  const handleDeactivate = async () => {
    if (!selectedTeacher) return;
    setDeactivating(true);
    try {
      await deactivateTeacher(selectedTeacher.id);
      setActiveModal(null);
      await loadTeachers();
    } catch (err: any) {
      alert(err?.message || 'Could not deactivate teacher.');
    } finally {
      setDeactivating(false);
    }
  };

  // derived KPIs
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === 'ACTIVE' || t.status === 'Active').length;
  const totalAssignments = teachers.reduce((acc, t) => acc + t.classes.length, 0);
  const attentionCount = teachers.filter((t) => t.hasConflict || t.loadBadge === 'High Load').length;

  // filter options derived from data
  const departments = Array.from(new Set(teachers.map((t) => t.department).filter((d): d is string => !!d))).sort();
  

  const filtered = teachers
    .filter((t) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        t.fullName.toLowerCase().includes(q) ||
        t.customId.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q))
      );
    })
    .filter((t) => selectedDept === 'All' || t.department === selectedDept)
    .filter((t) => selectedWorkload === 'All' || t.loadBadge === selectedWorkload);

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Teachers</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage teaching staff, assignments, schedules and account activity.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => loadTeachers()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer'
              }}
            >
              Refresh
            </button>
            
            <button
              onClick={() => setIsAddUserOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#002b49', border: 'none', padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Teacher
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL TEACHERS</span>
              <div style={{ backgroundColor: '#e0e7ff', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3730a3" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{loading ? '—' : totalTeachers}</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACTIVE TEACHERS</span>
              <div style={{ backgroundColor: '#dcfce7', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{loading ? '—' : activeTeachers}</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSIGNMENTS</span>
              <div style={{ backgroundColor: '#e0f2fe', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{loading ? '—' : totalAssignments}</div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ATTENTION REQUIRED</span>
              <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>{loading ? '—' : attentionCount}</div>
          </div>
        </div>

        {/* FILTERS */}
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
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={selectedWorkload} onChange={(e) => setSelectedWorkload(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff', cursor: 'pointer' }}>
              <option value="All">Workload (All)</option>
              <option value="Balanced">Balanced</option>
              <option value="High Load">High Load</option>
              <option value="Low Load">Low Load</option>
            </select>

            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginLeft: 'auto' }}>
              {loading ? '' : `${filtered.length} of ${teachers.length}`}
            </span>
          </div>
        </div>

        {/* TABLE */}
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
                {loading && (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loadingâ€¦</td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No teachers match your filters.</td>
                  </tr>
                )}
                {!loading && filtered.map((teacher) => (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {teacher.avatarUrl ? (
                          <img src={teacher.avatarUrl} alt={teacher.fullName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {teacher.initials}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{teacher.fullName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{teacher.customId || teacher.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{teacher.department || '—'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {teacher.subjects.length > 0 ? teacher.subjects.join(', ') : 'No subjects'}
                      </div>
                    </td>

                    <td style={{ padding: '16px', fontWeight: '500', color: '#334155' }}>
                      {teacher.classes.length > 0
                        ? teacher.classes.map((c) => c.name).join(', ')
                        : <span style={{ color: '#94a3b8' }}>No classes assigned</span>}
                    </td>

                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
                        {teacher.periodsPerWeek == null ? '—' : `${teacher.periodsPerWeek} periods`}
                      </div>
                      {teacher.loadBadge && (
                        <span style={{
                          backgroundColor: teacher.loadBadge === 'Balanced' ? '#dcfce7' : teacher.loadBadge === 'High Load' ? '#fee2e2' : '#fef3c7',
                          color: teacher.loadBadge === 'Balanced' ? '#166534' : teacher.loadBadge === 'High Load' ? '#991b1b' : '#92400e',
                          padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '2px'
                        }}>
                          {teacher.loadBadge}
                        </span>
                      )}
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
                        color: teacher.status === 'ACTIVE' || teacher.status === 'Active' ? '#059669' : '#64748b',
                        fontWeight: 'bold', fontSize: '12px'
                      }}>
                        ● {teacher.status}
                      </span>
                    </td>

                    <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                      <button onClick={() => setOpenMenuId(openMenuId === teacher.id ? null : teacher.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>â‹®</button>

                      {openMenuId === teacher.id && (
                        <div style={{ position: 'absolute', right: '16px', top: '40px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '200px', overflow: 'hidden' }}>
                          <button onClick={() => handleOpenAssign(teacher)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            Assign Class
                          </button>
                          {teacher.classes.length > 0 && (
                            <button onClick={() => handleUnassign()} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#b45309', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                              Remove Class Assignments
                            </button>
                          )}
                          <button onClick={() => handleOpenDeactivate(teacher)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9' }}>
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

        {/* ASSIGN CLASS MODAL */}
        {activeModal === 'assign' && selectedTeacher && (
          <div style={modalOverlayStyle} onClick={() => !assigning && setActiveModal(null)}>
            <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Assign Class</h3>
                <button onClick={() => !assigning && setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>âœ•</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  {selectedTeacher.avatarUrl ? (
                    <img src={selectedTeacher.avatarUrl} alt={selectedTeacher.fullName} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      {selectedTeacher.initials}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{selectedTeacher.fullName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      ID: {selectedTeacher.customId || '—'} {selectedTeacher.department ? `â€¢ ${selectedTeacher.department}` : ''}
                    </div>
                  </div>
                </div>

                {selectedTeacher.classes.length > 0 && (
                  <>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>CURRENT CLASSES</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {selectedTeacher.classes.map((c) => (
                        <span key={c.id} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>● {c.name}</span>
                      ))}
                    </div>
                  </>
                )}

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Assign to Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px', boxSizing: 'border-box' }}
                  >
                    <option value="">Select a classâ€¦</option>
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                    Assigning will make this teacher the class teacher of the selected class. If another teacher already owns it, they'll be unassigned.
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => !assigning && setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAssign} disabled={assigning || !selectedClassId} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: assigning || !selectedClassId ? 'not-allowed' : 'pointer', opacity: assigning || !selectedClassId ? 0.6 : 1 }}>
                  {assigning ? 'Assigningâ€¦' : 'Assign Class'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEACTIVATE MODAL */}
        {activeModal === 'deactivate' && selectedTeacher && (
          <div style={modalOverlayStyle} onClick={() => !deactivating && setActiveModal(null)}>
            <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Deactivate Teacher
                </h3>
                <button onClick={() => !deactivating && setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>âœ•</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  {selectedTeacher.avatarUrl ? (
                    <img src={selectedTeacher.avatarUrl} alt={selectedTeacher.fullName} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      {selectedTeacher.initials}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{selectedTeacher.fullName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {selectedTeacher.customId || '—'}</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#991b1b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    This will revoke access and clear assignments
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#7f1d1d' }}>
                    The teacher will be marked as Deactivated and any class they currently own will be unassigned.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#991b1b' }}>{selectedTeacher.classes.length}</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#7f1d1d' }}>CLASSES</div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#991b1b' }}>{selectedTeacher.subjects.length}</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#7f1d1d' }}>SUBJECTS</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reason (optional)</label>
                  <textarea
                    rows={3}
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    placeholder="Enter any relevant details regarding this deactivationâ€¦"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => !deactivating && setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={handleDeactivate} disabled={deactivating} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#b91c1c', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: deactivating ? 'wait' : 'pointer', opacity: deactivating ? 0.7 : 1 }}>
                  {deactivating ? 'Deactivatingâ€¦' : 'DEACTIVATE TEACHER'}
                </button>
              </div>
            </div>
          </div>
        )}

        <AddUserModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onUserAdded={loadTeachers}
          defaultRole="Teacher"
        />

      </div>
    </AdminLayout>
  );
};


