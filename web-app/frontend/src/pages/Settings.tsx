import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

interface PeriodItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Upcoming' | 'Completed';
}

interface AcademicTermDbRecord {
  id?: string;
  academic_year: string;
  term_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'security' | 'academic' | 'finance' | 'attendance'>('overview');
  const [showImpactModal, setShowImpactModal] = useState(false);

  // Two-step deletion modal state
  const [periodToDelete, setPeriodToDelete] = useState<{ id: string; name: string } | null>(null);

  // Academic Structure State (Term vs Semester)
  const [structureType, setStructureType] = useState<'term' | 'semester'>('term');
  const [academicYear, setAcademicYear] = useState('2026/2027');

  // Dynamic terms or semesters list
  const [periods, setPeriods] = useState<PeriodItem[]>([
    { id: '1', name: 'Term 1', startDate: '2026-09-01', endDate: '2026-12-18', status: 'Active' },
    { id: '2', name: 'Term 2', startDate: '2027-01-04', endDate: '2027-03-26', status: 'Upcoming' },
    { id: '3', name: 'Term 3', startDate: '2027-04-12', endDate: '2027-06-30', status: 'Upcoming' },
  ]);

  const handleStructureChange = (type: 'term' | 'semester') => {
    setStructureType(type);
    if (type === 'term') {
      setPeriods([
        { id: '1', name: 'Term 1', startDate: '2026-09-01', endDate: '2026-12-18', status: 'Active' },
        { id: '2', name: 'Term 2', startDate: '2027-01-04', endDate: '2027-03-26', status: 'Upcoming' },
        { id: '3', name: 'Term 3', startDate: '2027-04-12', endDate: '2027-06-30', status: 'Upcoming' },
      ]);
    } else {
      setPeriods([
        { id: '1', name: 'Semester 1', startDate: '2026-09-01', endDate: '2027-01-22', status: 'Active' },
        { id: '2', name: 'Semester 2', startDate: '2027-02-01', endDate: '2027-06-30', status: 'Upcoming' },
      ]);
    }
  };

  const handleAddPeriod = () => {
    const nextNumber = periods.length + 1;
    const prefix = structureType === 'term' ? 'Term' : 'Semester';
    const newPeriod: PeriodItem = {
      id: Date.now().toString(),
      name: `${prefix} ${nextNumber}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'Upcoming'
    };
    setPeriods([...periods, newPeriod]);
  };

  const confirmDeletePeriod = () => {
    if (!periodToDelete) return;
    setPeriods(periods.filter(p => p.id !== periodToDelete.id));
    setPeriodToDelete(null);
  };

  // Real Supabase Save Handler for Academic Configuration
  const handleSaveConfiguration = async () => {
    try {
      const recordsToSave: AcademicTermDbRecord[] = periods.map((p) => ({
        academic_year: academicYear,
        term_name: p.name,
        start_date: p.startDate,
        end_date: p.endDate,
        is_active: p.status === 'Active'
      }));

      const { error } = await supabase
        .from('academic_terms')
        .upsert(recordsToSave, { onConflict: 'academic_year,term_name' });

      if (error) {
        console.error('Error saving academic terms:', error);
        alert('Failed to save configuration: ' + error.message);
      } else {
        setShowImpactModal(false);
        alert('Academic structure saved successfully to database!');
      }
    } catch (err) {
      console.error('Unexpected error saving configuration:', err);
      alert('An unexpected error occurred while saving.');
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('academic_terms').select('*');
        if (!error && data && data.length > 0) {
          const formattedPeriods: PeriodItem[] = data.map((item: AcademicTermDbRecord & { id?: string }, index: number) => ({
            id: item.id || index.toString(),
            name: item.term_name,
            startDate: item.start_date,
            endDate: item.end_date,
            status: item.is_active ? 'Active' : 'Upcoming'
          }));
          setPeriods(formattedPeriods);
          if (data[0].academic_year) {
            setAcademicYear(data[0].academic_year);
          }
        }
      } catch (err) {
        console.error('Error fetching academic terms:', err);
      }
    };

    fetchSettings();
  }, []);

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
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '600px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>School Settings</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Configure school information, academic structures, financial settings, grading, attendance, and security preferences.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
              Discard Changes
            </button>
            <button 
              onClick={() => setShowImpactModal(true)} 
              style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* SUB-PAGE TAB NAVIGATION */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview & Health' },
            { id: 'profile', label: 'School Profile' },
            { id: 'academic', label: 'Academic & Grading' },
            { id: 'finance', label: 'Fee & Finance' },
            { id: 'attendance', label: 'Attendance & Communication' },
            { id: 'security', label: 'Preferences & Security' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'profile' | 'security' | 'academic' | 'finance' | 'attendance')}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #002b49' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? '#002b49' : '#64748b',
                fontWeight: activeTab === tab.id ? '800' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ ...cardStyle, backgroundColor: '#f8fafc', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>System Configuration Health</h3>
                </div>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                  92% Complete
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SCHOOL PROFILE</span>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>Configured</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ACADEMIC CAL</span>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>Configured</div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>FEE CONFIG</span>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#dc2626', marginTop: '4px' }}>Attention Req.</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>GRADING SCALE</span>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>Configured</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ATTENDANCE</span>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>Configured</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>School Profile</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Basic info, logo, contact details, and institutional identity.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Updated recently</span>
                  <button onClick={() => setActiveTab('profile')} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Manage -&gt;</button>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Academic & Grading</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Promotion rules, operational terms or semesters, and scales.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>A-F Standard</span>
                  <button onClick={() => setActiveTab('academic')} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Manage -&gt;</button>
                </div>
              </div>

              <div style={{ ...cardStyle, borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Fee & Finance</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Currencies, payment methods, verification rules, and receipts.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 'bold' }}>Action Needed</span>
                  <button onClick={() => setActiveTab('finance')} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Manage -&gt;</button>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Attendance & Communication</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Thresholds, intelligence triggers, quiet hours, and channels.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Active</span>
                  <button onClick={() => setActiveTab('attendance')} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Manage -&gt;</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Institutional Identity</h3>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b', fontSize: '10px' }}>
                    OFFICIAL LOGO
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                      <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}>Upload New</button>
                      <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', fontSize: '11px', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer' }}>Remove</button>
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Recommended format: PNG or SVG, min 400x400px.</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>School Name</label>
                    <input type="text" defaultValue="SABIO Academy Achimota" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>School Code (Registration No.)</label>
                    <input type="text" defaultValue="LIN-4421-A" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>School Type</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Public Secondary</option>
                      <option>Private K-12</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Principal / Head Administrator</label>
                    <input type="text" defaultValue="Dr. Sarah Jenkins" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>DOCUMENT HEADER PREVIEW</div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#f8fafc', fontSize: '11px' }}>
                <strong style={{ fontSize: '14px', color: '#002b49', display: 'block' }}>SABIO ACADEMY ACHIMOTA</strong>
                <span style={{ color: '#64748b', display: 'block', marginTop: '2px' }}>LIN-4421-A | admin@sabio.edu.gh</span>
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC TAB */}
        {activeTab === 'academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Academic Cycle Structure</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>System Architecture Mode</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => handleStructureChange('term')}
                      style={{
                        padding: '10px', borderRadius: '8px',
                        border: structureType === 'term' ? '2px solid #002b49' : '1px solid #cbd5e1',
                        backgroundColor: structureType === 'term' ? '#f0f9ff' : '#ffffff',
                        color: structureType === 'term' ? '#002b49' : '#334155',
                        fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
                      }}
                    >
                      Three-Term System (3 Terms)
                    </button>
                    <button
                      onClick={() => handleStructureChange('semester')}
                      style={{
                        padding: '10px', borderRadius: '8px',
                        border: structureType === 'semester' ? '2px solid #002b49' : '1px solid #cbd5e1',
                        backgroundColor: structureType === 'semester' ? '#f0f9ff' : '#ffffff',
                        color: structureType === 'semester' ? '#002b49' : '#334155',
                        fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
                      }}
                    >
                      Two-Semester System (2 Semesters)
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Academic Year Designation</label>
                  <select 
                    value={academicYear} 
                    onChange={(e) => setAcademicYear(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', backgroundColor: '#ffffff' }}
                  >
                    <option>2026/2027</option>
                    <option>2025/2026</option>
                  </select>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Promotion & Grading Rules</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Minimum GPA Required</label>
                    <input type="text" defaultValue="2.0" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Max Failed Core Subjects</label>
                    <input type="text" defaultValue="2" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    {structureType === 'term' ? 'Term Breakdown Metadata' : 'Semester Breakdown Metadata'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                    Configure exact structural date ranges and active operational period for the current year.
                  </p>
                </div>
                <button 
                  onClick={handleAddPeriod}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}
                >
                  + Add Period
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '10px' }}>PERIOD NAME</th>
                    <th style={{ padding: '10px' }}>START DATE</th>
                    <th style={{ padding: '10px' }}>END DATE</th>
                    <th style={{ padding: '10px' }}>STATUS</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.name}</td>
                      <td style={{ padding: '10px' }}>
                        <input 
                          type="date" 
                          value={p.startDate} 
                          onChange={(e) => {
                            const updated = periods.map(item => item.id === p.id ? { ...item, startDate: e.target.value } : item);
                            setPeriods(updated);
                          }} 
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} 
                        />
                      </td>
                      <td style={{ padding: '10px' }}>
                        <input 
                          type="date" 
                          value={p.endDate} 
                          onChange={(e) => {
                            const updated = periods.map(item => item.id === p.id ? { ...item, endDate: e.target.value } : item);
                            setPeriods(updated);
                          }} 
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} 
                        />
                      </td>
                      <td style={{ padding: '10px' }}>
                        <select 
                          value={p.status}
                          onChange={(e) => {
                            const updated = periods.map(item => item.id === p.id ? { ...item, status: e.target.value as PeriodItem['status'] } : item);
                            setPeriods(updated);
                          }}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#fff' }}
                        >
                          <option value="Active">Active</option>
                          <option value="Upcoming">Upcoming</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button 
                          onClick={() => setPeriodToDelete({ id: p.id, name: p.name })}
                          style={{ border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Currency Config</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Base Currency</label>
                <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                  <option>GHS - Ghanaian Cedi</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Display Symbol</label>
                <input type="text" defaultValue="GHS" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Payment Methods</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Cash</strong>
                  <span style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold' }}>ACTIVE</span>
                </div>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Mobile Money</strong>
                  <span style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold' }}>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Threshold Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>MINIMUM (%)</label>
                <input type="number" defaultValue={80} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Regional Settings</h3>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>SYSTEM TIMEZONE</label>
              <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                <option>Africa/Accra (GMT)</option>
              </select>
            </div>
          </div>
        )}

        {/* DELETION MODAL */}
        {periodToDelete && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>Confirm Period Deletion</h3>
                <button onClick={() => setPeriodToDelete(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ fontSize: '12px', color: '#334155' }}>Are you sure you want to delete <strong>{periodToDelete.name}</strong>?</p>
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setPeriodToDelete(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button onClick={confirmDeletePeriod} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* IMPACT MODAL */}
        {showImpactModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>Save Academic Configuration</h3>
                <button onClick={() => setShowImpactModal(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ fontSize: '12px', color: '#334155' }}>This will save your configured terms/semesters to the database and update your active academic schedule.</p>
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowImpactModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveConfiguration} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm & Save</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
