import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  defaultRole?: string;
}

interface StudentOption {
  id: string;
  name: string;
  className: string;
  customId: string;
}

interface ClassOption {
  id: string;
  name: string;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded, defaultRole = 'Teacher' }) => {
  const [role, setRole] = useState(defaultRole);
  const [prevDefaultRole, setPrevDefaultRole] = useState(defaultRole);

  if (defaultRole !== prevDefaultRole) {
    setPrevDefaultRole(defaultRole);
    setRole(defaultRole);
  }
  
  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [defaultRelationship, setDefaultRelationship] = useState('Mother');
  const [assignClass, setAssignClass] = useState('');
  const [classesList, setClassesList] = useState<ClassOption[]>([]);

  // Contact Info
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');

  // Link Students (For Parent Role)
  const [studentsList, setStudentsList] = useState<StudentOption[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Portal Account Setup & Password
  const [generatedPassword] = useState(() => Math.random().toString(36).substring(2, 10) + '2026!');
  const [accountStatus, setAccountStatus] = useState<'Active' | 'Locked' | 'Deactivated'>('Active');
  const [sendActivationEmail, setSendActivationEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live students and classes from Supabase database on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const { data: studentsData } = await supabase.from('students').select('id, first_name, last_name, custom_id, class_name');
      if (studentsData) {
        setStudentsList(studentsData.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          className: (s.class_name as string) || 'Unassigned',
          customId: (s.custom_id as string) || ''
        })));
      }

      const { data: classesData } = await supabase.from('classes').select('id, name');
      if (classesData) {
        setClassesList(classesData.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          name: (c.name as string) || 'Unnamed Class'
        })));
      }
    };
    fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleStudentSelection = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(item => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email || !primaryPhone || !residentialAddress) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedAvatarUrl = null;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('sabio_profile')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from('sabio_profile')
          .getPublicUrl(filePath);

        uploadedAvatarUrl = publicURLData.publicUrl;
      }

      const generatedId = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: generatedPassword,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      const profilePayload: Record<string, unknown> = {
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        role: role.toLowerCase(),
        relationship: role === 'Parent' ? defaultRelationship : null,
        assign_class: role === 'Teacher' ? assignClass || null : null,
        primary_phone: primaryPhone.trim(),
        alternate_phone: alternatePhone.trim() || null,
        email: email.trim(),
        address: residentialAddress.trim(),
        avatar_url: uploadedAvatarUrl,
        status: accountStatus,
        fee_account_status: 'Good Standing',
        engagement: 'Moderate',
        custom_id: generatedId
      };

      if (userId) {
        profilePayload.id = userId;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([profilePayload], { onConflict: 'email' });

      if (profileError) throw profileError;

      if (sendActivationEmail) {
        console.log(`[Simulation] Activation email sent to ${email} with temporary password: ${generatedPassword}`);
      }

      alert(`Success! ${role} profile created successfully.\n\nTemporary Password: ${generatedPassword}`);
      onUserAdded();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('Detailed Supabase Error:', err);
      alert('Error creating user profile: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '720px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
      }}>
        
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add {role} Profile</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Create a new system user and configure profile credentials.</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>X</button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ padding: '24px', maxHeight: '72vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            
            {/* Role Switcher Tabs */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Select Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {['Teacher', 'Parent', 'Accountant', 'Administrator'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                      border: role === r ? '2px solid #002b49' : '1px solid #cbd5e1',
                      backgroundColor: role === r ? '#f0f9ff' : '#ffffff',
                      color: '#0f172a'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: PERSONAL INFORMATION */}
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '12px' }}>PERSONAL INFORMATION</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <label style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', backgroundColor: '#f8fafc', cursor: 'pointer', textAlign: 'center', height: '95px', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>Upload Avatar</span>
                <span style={{ fontSize: '9px', color: '#64748b', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{avatarFile ? avatarFile.name : 'JPG/PNG, max 2MB'}</span>
                <input type="file" accept="image/*" onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])} style={{ display: 'none' }} />
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>First Name *</label>
                  <input type="text" required placeholder="e.g. Ama" value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Last Name *</label>
                  <input type="text" required placeholder="e.g. Tetteh" value={lastName} onChange={e => setLastName(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Middle Name</label>
                  <input type="text" placeholder="Optional" value={middleName} onChange={e => setMiddleName(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>ID</label>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', marginTop: '2px' }}>
                    <input type="text" value="Auto-generated" disabled style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '11px', color: '#64748b', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            {role === 'Parent' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Default Relationship</label>
                <select value={defaultRelationship} onChange={e => setDefaultRelationship(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px' }}>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
            )}

            {role === 'Teacher' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Assign Class</label>
                <select value={assignClass} onChange={e => setAssignClass(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px' }}>
                  <option value="">Select Class from Database...</option>
                  {classesList.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* SECTION 2: CONTACT INFORMATION */}
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', margin: '18px 0 10px 0' }}>CONTACT INFORMATION</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Primary Phone *</label>
                <input type="text" required placeholder="020 000 0000" value={primaryPhone} onChange={e => setPrimaryPhone(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Alternate Phone</label>
                <input type="text" placeholder="Optional" value={alternatePhone} onChange={e => setAlternatePhone(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Contact Email *</label>
              <input type="email" required placeholder="ama.tetteh@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Residential Address *</label>
              <input type="text" required placeholder="Enter full address..." value={residentialAddress} onChange={e => setResidentialAddress(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
            </div>

            {/* SECTION 3: MULTI-SELECT STUDENT DROPDOWN (FOR PARENTS) */}
            {role === 'Parent' && (
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '2px' }}>Link Students (Select one or more)</label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}
                >
                  <span style={{ color: selectedStudentIds.length > 0 ? '#0f172a' : '#64748b' }}>
                    {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} student(s) selected` : 'Select students from database...'}
                  </span>
                  <span>v</span>
                </div>

                {isDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: '150px', overflowY: 'auto', marginTop: '4px' }}>
                    {studentsList.map(stu => {
                      const isSelected = selectedStudentIds.includes(stu.id);
                      return (
                        <div 
                          key={stu.id}
                          onClick={() => toggleStudentSelection(stu.id)}
                          style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', backgroundColor: isSelected ? '#f0f9ff' : '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}
                        >
                          <span>{stu.name} ({stu.customId}) - {stu.className}</span>
                          {isSelected && <span style={{ fontWeight: 'bold', color: '#0284c7' }}>Selected</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: PORTAL ACCOUNT SETUP */}
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', margin: '18px 0 10px 0' }}>PORTAL ACCOUNT SETUP</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Login Email</label>
                <input type="email" value={email} disabled placeholder="Auto-filled from contact email" style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', marginTop: '2px', backgroundColor: '#f1f5f9', color: '#64748b', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#334155' }}>Temporary Password</label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <input type="text" value={generatedPassword} readOnly style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#1e40af', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
                  <button 
                    type="button" 
                    onClick={() => navigator.clipboard.writeText(generatedPassword)} 
                    style={{ padding: '0 10px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Account Status:</span>
              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{accountStatus}</span>
              <button type="button" onClick={() => setAccountStatus(accountStatus === 'Active' ? 'Locked' : 'Active')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Change</button>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={sendActivationEmail} onChange={e => setSendActivationEmail(e.target.checked)} />
              Send account activation invitation with temporary password and login instructions.
            </label>

          </div>

          {/* Modal Footer Actions */}
          <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
