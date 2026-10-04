import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  defaultRole?: string;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded, defaultRole = 'Teacher' }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(defaultRole);
  
  // Role-specific dynamic fields
  const [department, setDepartment] = useState('');
  const [linkedStudentId, setLinkedStudentId] = useState('');

  // Onboarding Options & Generated Credentials State
  const [sendEmailInvite, setSendEmailInvite] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultRole) setRole(defaultRole);
    const tempPass = 'Smis@' + Math.random().toString(36).slice(-8) + '2026!';
    setGeneratedPassword(tempPass);
  }, [defaultRole, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      alert('Please fill in First Name, Last Name, and Email.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Supabase Auth sign-up. The database trigger automatically captures this 
      // and creates the profile row in your database with the proper role and name!
      const { error: authError } = await supabase.auth.signUp({
        email,
        password: generatedPassword,
        options: {
          data: { 
            first_name: firstName, 
            last_name: lastName, 
            role 
          }
        }
      });

      if (authError) {
        alert(`Auth Error: ${authError.message}`);
        setIsSubmitting(false);
        return;
      }

      if (sendEmailInvite) {
        console.log(`[Simulation] Welcome email with temporary password (${generatedPassword}) sent to ${email}`);
      }

      alert(`Success! ${role} account created.\n\nTemporary Password: ${generatedPassword}`);
      onUserAdded(); 
      onClose(); 
    } catch (err: any) {
      console.error('Submission error:', err);
      alert('An unexpected error occurred during user provisioning.');
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
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add New {role}</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Provision system credentials, temporary password, and profile details.</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto' }}>
            
            {/* Role Switcher Tabs */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Select Target Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {['Teacher', 'Parent', 'Administrator', 'Accountant'].map(r => (
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

            {/* Core Universal Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>FIRST NAME *</label>
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>LAST NAME *</label>
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>EMAIL ADDRESS *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="user@gmail.com" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>PHONE NUMBER</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+233..." style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* SECURITY & CREDENTIALS */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Security & Credentials</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>GENERATED TEMP PASSWORD</span>
                  <code style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>{generatedPassword}</code>
                </div>
                <button 
                  type="button" 
                  onClick={() => navigator.clipboard.writeText(generatedPassword)} 
                  style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Copy
                </button>
              </div>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={sendEmailInvite} 
                  onChange={(e) => setSendEmailInvite(e.target.checked)} 
                />
                Automatically email login credentials & welcome invite to user
              </label>
            </div>

            {/* DYNAMIC ROLE-SPECIFIC FIELDS */}
            {role === 'Teacher' && (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', display: 'block', marginBottom: '8px' }}>Teacher Specific Details</span>
                <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>DEPARTMENT / FACULTY</label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Science & Mathematics" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
              </div>
            )}

            {role === 'Parent' && (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', display: 'block', marginBottom: '8px' }}>Parent Specific Details</span>
                <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>LINKED STUDENT ID (OPTIONAL)</label>
                <input type="text" value={linkedStudentId} onChange={e => setLinkedStudentId(e.target.value)} placeholder="e.g. STU-001" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }} />
              </div>
            )}

          </div>

          {/* Modal Footer Actions */}
          <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>
              {isSubmitting ? 'Provisioning...' : `Create ${role}`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
