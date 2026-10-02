import React, { useState, useRef } from 'react';
import { TeacherLayout } from '../components/TeacherLayout';

interface AssignedClass {
  id: string;
  className: string;
  subject: string;
  studentsCount: number;
  schedule: string;
  status: 'Active' | 'Inactive';
}

const mockTeacherClasses: AssignedClass[] = [
  { id: '1', className: 'JHS 2A', subject: 'Integrated Science', studentsCount: 42, schedule: 'Mon 10:00 AM', status: 'Active' },
  { id: '2', className: 'JHS 2B', subject: 'Integrated Science', studentsCount: 38, schedule: 'Tue 08:30 AM', status: 'Active' },
  { id: '3', className: 'JHS 3A', subject: 'Biology', studentsCount: 40, schedule: 'Wed 11:15 AM', status: 'Active' },
  { id: '4', className: 'JHS 3B', subject: 'Biology', studentsCount: 35, schedule: 'Thu 09:15 AM', status: 'Active' },
];

export const TeacherProfile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile State with Picture URL
  const [profile, setProfile] = useState({
    fullName: 'Daniel Kwame Aryee',
    email: 'j.mensah@edupulse.edu.gh',
    phone: '+233 24 123 4567',
    office: 'Science Block - Room 204',
    officeHours: 'Tue & Thu, 2:00 PM - 4:00 PM',
    address: '12 Palm Street, Achimota, Accra',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  });

  // Modal & Menu States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Form States for Editing
  const [editForm, setEditForm] = useState({ ...profile });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Handle Profile Picture File Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditModalOpen(false);
  };

  // Handle Password Change Save
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password updated successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsPasswordModalOpen(false);
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  return (
    <TeacherLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* PAGE HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>My Profile</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              View your personal information, teaching assignments, and contact details.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
            {/* MORE BUTTON & DROPDOWN MENU */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ··· More
              </button>

              {isMoreMenuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '40px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, width: '160px', overflow: 'hidden' }}>
                  <button 
                    onClick={() => { setIsMoreMenuOpen(false); setIsPasswordModalOpen(true); }}
                    style={{ width: '100%', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                  >
                    Change Password
                  </button>
                </div>
              )}
            </div>

            {/* EDIT PROFILE BUTTON */}
            <button 
              onClick={() => { setEditForm({ ...profile }); setIsEditModalOpen(true); }}
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* MAIN TWO-COLUMN DASHBOARD GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* LEFT SIDEBAR COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* AVATAR & STATUS CARD */}
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.fullName} 
                  style={{ width: '110px', height: '110px', borderRadius: '16px', objectFit: 'cover' }}
                />
                <button
                  onClick={() => { setEditForm({ ...profile }); setIsEditModalOpen(true); }}
                  title="Change Profile Picture"
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    backgroundColor: '#002b49',
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </button>
              </div>

              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{profile.fullName}</h2>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '12px' }}>
                TCH00124 • Science Department
              </div>

              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' }}>
                Active
              </span>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                  <span>Profile Completion</span>
                  <span>100%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#002b49' }} />
                </div>
              </div>
            </div>

            {/* THREE STAT TILES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={cardStyle}>
                <div style={{ color: '#64748b', marginBottom: '4px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>155</div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginTop: '4px' }}>Total Students</span>
              </div>

              <div style={cardStyle}>
                <div style={{ color: '#64748b', marginBottom: '4px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>2</div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginTop: '4px' }}>Subjects</span>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: '#64748b', marginBottom: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>4</div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginTop: '4px' }}>Classes Assigned</span>
            </div>

            {/* CONTACT & OFFICE CARD */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Contact & Office</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>School Email</span>
                    <strong style={{ color: '#0f172a', fontSize: '12px' }}>{profile.email}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>Phone</span>
                    <strong style={{ color: '#0f172a', fontSize: '12px' }}>{profile.phone}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>Office</span>
                    <strong style={{ color: '#0f172a', fontSize: '12px' }}>{profile.office}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>Office Hours</span>
                    <strong style={{ color: '#0f172a', fontSize: '12px' }}>{profile.officeHours}</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN CONTENT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* PERSONAL INFORMATION BLOCK */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                Personal Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Full Name</span>
                  <strong style={{ fontSize: '14px', color: '#0f172a', marginTop: '2px', display: 'block' }}>{profile.fullName}</strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Gender</span>
                  <strong style={{ fontSize: '14px', color: '#0f172a', marginTop: '2px', display: 'block' }}>Male</strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Date of Birth</span>
                  <strong style={{ fontSize: '14px', color: '#0f172a', marginTop: '2px', display: 'block' }}>14 Aug 1985</strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Position</span>
                  <strong style={{ fontSize: '14px', color: '#0f172a', marginTop: '2px', display: 'block' }}>Subject Teacher</strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Employment Status</span>
                  <strong style={{ fontSize: '14px', color: '#0f172a', marginTop: '2px', display: 'block' }}>Full-Time</strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Residential Address</span>
                  <strong style={{ fontSize: '14px', color: '#0f172a', marginTop: '2px', display: 'block' }}>{profile.address}</strong>
                </div>
              </div>
            </div>

            {/* ASSIGNED SUBJECTS & CLASSES TABLE */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Assigned Subjects & Classes</h3>
                <button style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Full Schedule
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>Class</th>
                    <th style={{ padding: '12px 20px' }}>Subject</th>
                    <th style={{ padding: '12px 20px' }}>Students</th>
                    <th style={{ padding: '12px 20px' }}>Schedule</th>
                    <th style={{ padding: '12px 20px' }}>Status</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTeacherClasses.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', fontWeight: '800', color: '#0f172a' }}>{item.className}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{item.subject}</td>
                      <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{item.studentsCount}</td>
                      <td style={{ padding: '12px 20px', color: '#64748b' }}>{item.schedule}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* MODAL 1: EDIT PROFILE POPUP */}
        {isEditModalOpen && (
          <div style={overlayStyle}>
            <div style={{ ...cardStyle, width: '100%', maxWidth: '550px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Edit Profile Information</h2>
                <button onClick={() => setIsEditModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* PROFILE PICTURE UPLOAD BLOCK */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <img src={editForm.avatarUrl} alt="Avatar Preview" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      style={{ display: 'none' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}
                    >
                      Upload New Photo
                    </button>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>JPG or PNG, max 2MB.</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>School Email</label>
                    <input 
                      type="email" 
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                    <input 
                      type="text" 
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Office Location</label>
                  <input 
                    type="text" 
                    value={editForm.office}
                    onChange={(e) => setEditForm({ ...editForm, office: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Office Hours</label>
                  <input 
                    type="text" 
                    value={editForm.officeHours}
                    onChange={(e) => setEditForm({ ...editForm, officeHours: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Residential Address</label>
                  <input 
                    type="text" 
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CHANGE PASSWORD POPUP */}
        {isPasswordModalOpen && (
          <div style={overlayStyle}>
            <div style={{ ...cardStyle, width: '100%', maxWidth: '450px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Change Password</h2>
                <button onClick={() => setIsPasswordModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};