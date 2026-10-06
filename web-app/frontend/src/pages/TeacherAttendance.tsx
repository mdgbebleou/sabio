import React, { useState, useEffect } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';
import { getMyClasses, getRoster, saveAttendance, getAttendanceHistory } from '../services/teacherService';
import type { TeacherClass, RosterEntry, AttendanceStatus, AttendanceHistoryEntry } from '../services/teacherService';

export const TeacherAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [rosterRecorded, setRosterRecorded] = useState<boolean>(false);
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // History filters
  const [historyClassId, setHistoryClassId] = useState<string>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All Statuses');

  // Dynamic KPI counts
  const totalStudents = roster.length;
  const presentCount = roster.filter(r => r.status === 'Present').length;
  const absentCount = roster.filter(r => r.status === 'Absent').length;
  const lateCount = roster.filter(r => r.status === 'Late').length;

  useEffect(() => {
    let isMounted = true;
    getMyClasses()
      .then((cls) => {
        if (!isMounted) return;
        setClasses(cls);
        if (cls.length > 0) {
          setSelectedClassId(cls[0].id);
        }
      })
      .catch((err: any) => {
        if (isMounted) setError(err?.message || 'Failed to load classes.');
      });

    getAttendanceHistory()
      .then((h) => {
        if (!isMounted) return;
        setHistory(h);
      })
      .catch((err: any) => {
        if (isMounted) setError(err?.message || 'Failed to load attendance history.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      getAttendanceHistory()
        .then(setHistory)
        .catch((err: any) => setError(err?.message || 'Failed to load attendance history.'));
    }
  }, [activeTab]);

  useEffect(() => {
    if (!selectedClassId || !selectedDate) {
      setRoster([]);
      setRosterRecorded(false);
      return;
    }
    let isMounted = true;
    setLoading(true);
    setError(null);
    getRoster(selectedClassId, selectedDate)
      .then((data) => {
        if (!isMounted) return;
        setRoster(data.entries);
        setRosterRecorded(data.recorded);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load roster.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setRoster(prev => prev.map(item => item.studentId === studentId ? { ...item, status: newStatus } : item));
  };

  const handleMarkAllPresent = () => {
    setRoster(prev => prev.map(item => ({ ...item, status: 'Present' })));
  };

  async function handleSave() {
    if (!selectedClassId || !selectedDate || roster.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await saveAttendance(selectedClassId, selectedDate, roster);
      const data = await getRoster(selectedClassId, selectedDate);
      setRoster(data.entries);
      setRosterRecorded(data.recorded);
      alert('Attendance saved.');
    } catch (err: any) {
      setError(err?.message || 'Could not save attendance.');
    } finally {
      setSaving(false);
    }
  }

  const filteredHistory = history.filter(item => {
    if (historyClassId && historyClassId !== 'all') {
      return item.classId === historyClassId;
    }
    return true;
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const currentClassName = classes.find(c => c.id === selectedClassId)?.name;

  return (
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
              Classes {currentClassName ? `/ ${currentClassName} ` : ''}/ Attendance
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Attendance Management</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Record and manage daily attendance for your assigned classes.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 14px', fontSize: '11px', textAlign: 'right' }}>
            <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>ACADEMIC YEAR: 2025/2026</span>
            <strong style={{ color: '#002b49', fontSize: '12px' }}>Term: Second Term</strong>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('record')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeTab === 'record' ? '2px solid #002b49' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'record' ? '#002b49' : '#64748b',
              fontWeight: activeTab === 'record' ? '800' : '500',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Record Attendance
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid #002b49' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'history' ? '#002b49' : '#64748b',
              fontWeight: activeTab === 'history' ? '800' : '500',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Attendance History
          </button>
        </div>

        {/* TAB 1: RECORD ATTENDANCE */}
        {activeTab === 'record' && (
          <div>
            {/* SELECTION & KPIS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>
              
              {/* CLASS & DATE SELECTOR CARD */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Class & Date</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Select Class</label>
                  <select 
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#0f172a', fontWeight: '600' }}
                  >
                    {classes.length === 0 ? (
                      <option disabled value="">No class assigned</option>
                    ) : (
                      classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#0f172a', fontWeight: '600', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* SUMMARY COUNTERS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={cardStyle}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL STUDENTS</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{totalStudents}</div>
                </div>

                <div style={{ ...cardStyle, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>PRESENT</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#166534', marginTop: '8px' }}>{presentCount}</div>
                </div>

                <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ABSENT</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#dc2626', marginTop: '8px' }}>{absentCount}</div>
                </div>

                <div style={{ ...cardStyle, backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>LATE</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#b45309', marginTop: '8px' }}>{lateCount}</div>
                </div>
              </div>

            </div>

            {error && (
              <div style={{ ...cardStyle, padding: '12px 16px', marginBottom: '20px', backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626', fontSize: '13px' }}>
                {error}
              </div>
            )}

            {/* DAILY ATTENDANCE ROSTER TABLE */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Daily Attendance List</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Mark the attendance status for each student.</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Search student..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', width: '200px' }}
                  />
                  <button 
                    onClick={handleMarkAllPresent}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    ✓ Mark All Present
                  </button>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>STUDENT</th>
                    <th style={{ padding: '12px 20px' }}>STUDENT ID</th>
                    <th style={{ padding: '12px 20px' }}>STATUS</th>
                    <th style={{ padding: '12px 20px' }}>REMARK</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        Loading…
                      </td>
                    </tr>
                  ) : (
                    roster
                      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.customId || '').toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((student) => (
                        <tr key={student.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {student.avatar ? (
                                <img src={student.avatar} alt={student.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>
                                  {student.initials}
                                </div>
                              )}
                              <strong style={{ color: '#0f172a', fontSize: '13px' }}>{student.name}</strong>
                            </div>
                          </td>
                          <td style={{ padding: '12px 20px', color: '#64748b', fontWeight: '600' }}>{student.customId}</td>
                          <td style={{ padding: '12px 20px' }}>
                            <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                              <button
                                onClick={() => handleStatusChange(student.studentId, 'Present')}
                                style={{
                                  border: 'none',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  backgroundColor: student.status === 'Present' ? '#dcfce7' : 'transparent',
                                  color: student.status === 'Present' ? '#166534' : '#64748b'
                                }}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleStatusChange(student.studentId, 'Absent')}
                                style={{
                                  border: 'none',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  backgroundColor: student.status === 'Absent' ? '#fef2f2' : 'transparent',
                                  color: student.status === 'Absent' ? '#dc2626' : '#64748b'
                                }}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => handleStatusChange(student.studentId, 'Late')}
                                style={{
                                  border: 'none',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  backgroundColor: student.status === 'Late' ? '#fef3c7' : 'transparent',
                                  color: student.status === 'Late' ? '#b45309' : '#64748b'
                                }}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '12px 20px', color: '#64748b' }}>
                            {student.remark || '-'}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* SAVE FOOTER BAR */}
            <div style={{ ...cardStyle, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <strong style={{ color: '#0f172a' }}>{totalStudents}</strong> students • <span style={{ color: '#166534', fontWeight: 'bold' }}>{presentCount} Present</span> • <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{absentCount} Absent</span> • <span style={{ color: '#b45309', fontWeight: 'bold' }}>{lateCount} Late</span>
              </div>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving…' : (rosterRecorded ? 'Update Attendance' : 'Save Attendance')}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDANCE HISTORY */}
        {activeTab === 'history' && (
          <div>
            {/* HISTORY FILTER BAR */}
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Class</label>
                  <select 
                    value={historyClassId}
                    onChange={(e) => setHistoryClassId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="all">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Date Range</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="text" defaultValue="08/09/2026" style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>to</span>
                    <input type="text" defaultValue="08/12/2026" style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Status</label>
                  <select 
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option>All Statuses</option>
                    <option>Recorded</option>
                  </select>
                </div>

                <button style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', height: '35px' }}>
                  Apply Filters
                </button>
              </div>
            </div>

            {/* HISTORY LOG TABLE */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                  History{historyClassId !== 'all' && classes.find(c => c.id === historyClassId) ? ` - ${classes.find(c => c.id === historyClassId)?.name}` : ''}
                </h3>
                <button style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  Export Log
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>DATE</th>
                    <th style={{ padding: '12px 20px' }}>CLASS</th>
                    <th style={{ padding: '12px 20px' }}>TOTAL STUDENTS</th>
                    <th style={{ padding: '12px 20px' }}>PRESENT</th>
                    <th style={{ padding: '12px 20px' }}>ABSENT</th>
                    <th style={{ padding: '12px 20px' }}>LATE</th>
                    <th style={{ padding: '12px 20px' }}>STATUS</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{item.date}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{item.className}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{item.total}</td>
                      <td style={{ padding: '12px 20px', color: '#166534', fontWeight: 'bold' }}>{item.present}</td>
                      <td style={{ padding: '12px 20px', color: '#dc2626', fontWeight: 'bold' }}>{item.absent}</td>
                      <td style={{ padding: '12px 20px', color: '#b45309', fontWeight: 'bold' }}>{item.late}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                          ✓ Recorded
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <button style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                <span>Showing 1-{filteredHistory.length} of {filteredHistory.length} records</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button disabled style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', opacity: 0.5, cursor: 'not-allowed' }}>&lt;</button>
                  <button disabled style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', opacity: 0.5, cursor: 'not-allowed' }}>&gt;</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};