import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'security' | 'academic' | 'finance' | 'attendance' | 'students'>('overview');
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Form states for adding student and linking parent
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [className, setClassName] = useState('Grade 10');
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [parentResults, setParentResults] = useState<Array<{ id: string; first_name?: string; last_name?: string; full_name?: string; email?: string }>>([]);
  const [selectedParent, setSelectedParent] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic student list state loaded strictly from Supabase (Zero hardcoded data)
  const [studentsList, setStudentsList] = useState<Array<any>>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

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

  const generateSecureStudentId = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `STU-${randomHex}-${randomNum}`;
  };

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const { data, error } = await supabase
        .from('students')
        .select('id, custom_id, first_name, last_name, class_name, status, profiles:parent_id(full_name, email)');

      if (error) throw error;
      setStudentsList(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudentsList([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const searchParents = async (query: string) => {
    setParentSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setParentResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, full_name, email')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      if (!error && data) {
        setParentResults(data);
      }
    } catch (err) {
      console.error('Error searching parents:', err);
    }
  };

  const handleSaveStudent = async () => {
    if (!firstName || !lastName || !selectedParent) {
      alert('Please fill in all required fields and select a parent/guardian.');
      return;
    }

    try {
      setIsSubmitting(true);
      const studentId = generateSecureStudentId();

      const { error } = await supabase
        .from('students')
        .insert([
          {
            custom_id: studentId,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            class_name: className,
            parent_id: selectedParent.id,
            status: 'Active Enrolled',
            academictrend: 'flat',
            engagement: 'Moderate',
          }
        ]);

      if (error) throw error;

      alert('Student successfully enrolled and linked to parent.');
      setShowAddStudentModal(false);
      setFirstName('');
      setLastName('');
      setSelectedParent(null);
      setParentSearchQuery('');
      fetchStudents();
    } catch (err: any) {
      console.error('Failed to save student:', err.message);
      alert('Failed to save student: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>School Settings</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Configure school information, academic rules, financial settings, grading, attendance, security preferences, and student enrollment.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowAddStudentModal(true)} 
              style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#16a34a', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
            >
              + Add Student & Link Parent
            </button>
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
            { id: 'students', label: 'Student Management' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

        {/* ========================================================================= */}
        {/* SUB-PAGE 1: OVERVIEW & HEALTH */}
        {/* ========================================================================= */}
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
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Updated 2d ago</span>
                  <button onClick={() => setActiveTab('profile')} style={{ border: 'none', background: 'none', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Manage -&gt;</button>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Academic & Grading</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Promotion rules, operational terms, and letter scales.</p>
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

        {/* ========================================================================= */}
        {/* SUB-PAGE 2: SCHOOL PROFILE & IDENTITY */}
        {/* ========================================================================= */}
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

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Contact & Location</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Official Email</label>
                    <input type="email" defaultValue="admin@sabio.edu.gh" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Primary Phone</label>
                    <input type="text" defaultValue="+233 30 200 1234" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Street Address</label>
                  <input type="text" defaultValue="Achimota District, Main Bypass Road" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>DOCUMENT HEADER PREVIEW</div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#f8fafc', fontSize: '11px' }}>
                <strong style={{ fontSize: '14px', color: '#002b49', display: 'block' }}>SABIO ACADEMY ACHIMOTA</strong>
                <span style={{ color: '#64748b', display: 'block', marginTop: '2px' }}>LIN-4421-A | admin@sabio.edu.gh</span>
                <span style={{ color: '#64748b', display: 'block' }}>Achimota District, Greater Accra Region</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-PAGE 3: ACADEMIC & GRADING CONFIGURATION */}
        {/* ========================================================================= */}
        {activeTab === 'academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Current Academic Year</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Year Designation</label>
                  <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>2026/2027</option>
                    <option>2025/2026</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Start Date</label>
                    <input type="text" defaultValue="09/01/2026" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>End Date</label>
                    <input type="text" defaultValue="06/30/2027" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Promotion Rules</h3>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>
                  <input type="checkbox" defaultChecked /> Require administrative approval for borderline cases
                </label>
              </div>

            </div>

            {/* TERM CONFIGURATION TABLE */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Term Configuration</h3>
                <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}>+ Add Term</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '10px' }}>TERM NAME</th>
                    <th style={{ padding: '10px' }}>START DATE</th>
                    <th style={{ padding: '10px' }}>END DATE</th>
                    <th style={{ padding: '10px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>First Term (Fall)</td>
                    <td style={{ padding: '10px' }}>Sep 1, 2026</td>
                    <td style={{ padding: '10px' }}>Dec 18, 2026</td>
                    <td style={{ padding: '10px' }}><span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>Active</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Second Term (Winter)</td>
                    <td style={{ padding: '10px' }}>Jan 4, 2027</td>
                    <td style={{ padding: '10px' }}>Mar 26, 2027</td>
                    <td style={{ padding: '10px' }}><span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>Upcoming</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-PAGE 4: FEE & FINANCE SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'finance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Currency Config</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Base Currency</label>
                  <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>GHS - Ghanaian Cedi</option>
                    <option>USD - US Dollar</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Display Symbol</label>
                  <input type="text" defaultValue="GH₵" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Financial Control</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Require Payment Verification</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Require Refund Approval</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Automated Receipt Generation</span>
                    <input type="checkbox" />
                  </label>
                </div>
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
                  <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Bank Transfer</strong>
                  <span style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold' }}>ACTIVE</span>
                </div>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Mobile Money</strong>
                  <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 'bold' }}>INACTIVE</span>
                </div>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc' }}>
                  <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Credit Card</strong>
                  <span style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold' }}>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-PAGE 5: ATTENDANCE & COMMUNICATION */}
        {/* ========================================================================= */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Threshold Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>MINIMUM (%)</label>
                    <input type="number" defaultValue={80} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>WARNING (%)</label>
                    <input type="number" defaultValue={85} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>CRITICAL (%)</label>
                    <input type="number" defaultValue={70} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Attendance Intelligence</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Low Attendance Alert</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Critical Escalation Trigger</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Communication Setup</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>DEFAULT CHANNELS</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" defaultChecked /> Email</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" defaultChecked /> In-App</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> SMS</label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Who can send global announcements?</label>
                <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                  <option>Administrators Only</option>
                  <option>Admins & Department Heads</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-PAGE 6: PREFERENCES & SECURITY */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Regional Settings</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>SYSTEM TIMEZONE</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Africa/Accra (GMT)</option>
                      <option>UTC / Greenwich Mean Time</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>DATE FORMAT</label>
                    <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Security Policy</h3>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px' }}>PASSWORD REQUIREMENTS</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Minimum Length</label>
                      <input type="number" defaultValue={12} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Expiry (Days)</label>
                      <input type="number" defaultValue={90} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#334155', fontWeight: 'bold' }}>
                    <input type="checkbox" defaultChecked /> Require Complexity (Uppercase, number, special char)
                  </label>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Data & Audit</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                System logs and user actions are recorded under District Security Policy.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-PAGE 7: STUDENT MANAGEMENT & PARENT LINKING */}
        {/* ========================================================================= */}
        {activeTab === 'students' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Student Records & Parent Links</h3>
              <button 
                onClick={() => setShowAddStudentModal(true)} 
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
              >
                + Add New Student
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Manage student enrollments and associate guardians securely via Supabase.
            </p>

            {isLoadingStudents ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading student records...</div>
            ) : studentsList.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '12px', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                N/A (No student records found)
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '10px' }}>STUDENT ID</th>
                    <th style={{ padding: '10px' }}>FULL NAME</th>
                    <th style={{ padding: '10px' }}>CLASS</th>
                    <th style={{ padding: '10px' }}>PARENT / GUARDIAN</th>
                    <th style={{ padding: '10px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map((st) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#002b49' }}>{st.custom_id}</td>
                      <td style={{ padding: '10px' }}>{st.first_name} {st.last_name}</td>
                      <td style={{ padding: '10px' }}>{st.class_name}</td>
                      <td style={{ padding: '10px' }}>{st.profiles?.full_name || st.profiles?.email || 'N/A'}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD STUDENT MODAL */}
        {/* ========================================================================= */}
        {showAddStudentModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add New Student</h3>
                <button onClick={() => setShowAddStudentModal(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>First Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dogbeda" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Last Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Gati" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Student ID (Auto-Generated)</label>
                    <input 
                      type="text" 
                      disabled 
                      placeholder="System will generate securely" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box', color: '#64748b' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Class / Grade *</label>
                    <select 
                      value={className} 
                      onChange={(e) => setClassName(e.target.value)} 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}
                    >
                      <option>Grade 7</option>
                      <option>Grade 8</option>
                      <option>Grade 9</option>
                      <option>Grade 10</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Parent / Guardian *</label>
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={parentSearchQuery} 
                    onChange={(e) => searchParents(e.target.value)} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                  />
                  {selectedParent && (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#166534', backgroundColor: '#dcfce7', padding: '6px 10px', borderRadius: '6px' }}>
                      Linked Guardian: <strong>{selectedParent.name}</strong> ({selectedParent.email})
                    </div>
                  )}
                  {parentResults.length > 0 && !selectedParent && (
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px', backgroundColor: '#ffffff', maxHeight: '150px', overflowY: 'auto' }}>
                      {parentResults.map((p) => {
                        const displayName = p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unnamed Parent';
                        return (
                          <div 
                            key={p.id} 
                            onClick={() => {
                              setSelectedParent({ id: p.id, name: displayName, email: p.email || 'N/A' });
                              setParentResults([]);
                              setParentSearchQuery(displayName);
                            }}
                            style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                          >
                            <strong>{displayName}</strong> <span style={{ color: '#64748b' }}>({p.email || 'No email'})</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                    Linking an existing guardian profile simplifies contact management.
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowAddStudentModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button 
                  onClick={handleSaveStudent} 
                  disabled={isSubmitting} 
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHANGE REVIEW MODAL */}
        {/* ========================================================================= */}
        {showImpactModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>High-Impact Configuration Change</h3>
                <button onClick={() => setShowImpactModal(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '11px', color: '#991b1b' }}>
                  <strong>Warning:</strong> You are modifying academic rule thresholds. This will trigger a background recalculation of all historical GPAs tied to this scale across 1,248 student profiles.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowImpactModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setShowImpactModal(false)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Apply Change (Requires Auth)</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
