import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';

export type UserRole = 'Administrator' | 'Teacher' | 'Accountant' | 'Parent';

interface UserProfileData {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  avatarUrl: string;
  customId: string;
}

interface NotificationPrefs {
  email_messages: boolean;
  system_announcements: boolean;
}

interface ReusableProfileProps {
  userRole?: UserRole;
}

const defaultProfile: UserProfileData = {
  id: '',
  name: '',
  role: 'Administrator',
  title: '',
  email: '',
  phone: '',
  alternatePhone: '',
  address: '',
  avatarUrl: '',
  customId: '',
};

const defaultPrefs: NotificationPrefs = {
  email_messages: true,
  system_announcements: true,
};

// Inline SVG placeholder so we don't depend on an external service
const avatarFallback = (name: string) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? '')
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="48" fill="%23002b49"/><text x="50%" y="55%" font-family="Inter,sans-serif" font-size="36" font-weight="700" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${initials || '?'}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
};

export const ReusableProfile: React.FC<ReusableProfileProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications'>('personal');

  // Profile data + form draft
  const [profile, setProfile] = useState<UserProfileData>(defaultProfile);
  const [draft, setDraft] = useState<UserProfileData>(defaultProfile);
  const [draftPrefs, setDraftPrefs] = useState<NotificationPrefs>(defaultPrefs);

  // Loading / saving flags
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch current user + profile ──
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        console.warn('No authenticated user');
        return;
      }

      const authUser = authData.user;

      const { data: row, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileErr) throw profileErr;

      const merged: UserProfileData = {
        id: authUser.id,
        name:
          row?.full_name ||
          [row?.first_name, row?.last_name].filter(Boolean).join(' ') ||
          authUser.email?.split('@')[0] ||
          '',
        role: (row?.role as UserRole) || userRole || 'Administrator',
        title: row?.position || '',
        email: row?.email || authUser.email || '',
        phone: row?.primary_phone || '',
        alternatePhone: row?.alternate_phone || '',
        address: row?.address || '',
        avatarUrl: row?.avatar_url || '',
        customId: row?.custom_id || '',
      };

      const mergedPrefs: NotificationPrefs = {
        ...defaultPrefs,
        ...(row?.notification_prefs || {}),
      };

      setProfile(merged);
      setDraft(merged);
      setDraftPrefs(mergedPrefs);
    } catch (err: any) {
      console.error('Failed to load profile:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftChange = <K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  // ── Avatar upload ──
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!profile.id) { alert('No authenticated user.'); return; }
    if (!file.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB.'); return; }

    try {
      setIsUploadingAvatar(true);
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);
      if (updateErr) throw updateErr;

      // Cache-bust so browser shows new image immediately
      const busted = `${publicUrl}?t=${Date.now()}`;
      setProfile(prev => ({ ...prev, avatarUrl: busted }));
      setDraft(prev => ({ ...prev, avatarUrl: busted }));
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile.id) return;
    if (!confirm('Remove profile picture?')) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id);
      if (error) throw error;
      setProfile(prev => ({ ...prev, avatarUrl: '' }));
      setDraft(prev => ({ ...prev, avatarUrl: '' }));
    } catch (err: any) {
      alert('Failed to remove avatar: ' + err.message);
    }
  };

  // ── Save personal details ──
  const handleSavePersonal = async () => {
    if (!draft.id) { alert('No authenticated user.'); return; }
    try {
      setIsSavingPersonal(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: draft.name,
          primary_phone: draft.phone,
          alternate_phone: draft.alternatePhone,
          address: draft.address,
        })
        .eq('id', draft.id);

      if (error) throw error;

      setProfile(draft);
      alert('Profile updated.');
    } catch (err: any) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // ── Save notification prefs ──
  const handleSavePrefs = async () => {
    if (!draft.id) { alert('No authenticated user.'); return; }
    try {
      setIsSavingPrefs(true);
      const { error } = await supabase
        .from('profiles')
        .update({ notification_prefs: draftPrefs })
        .eq('id', draft.id);
      if (error) throw error;
      alert('Notification preferences saved.');
    } catch (err: any) {
      alert('Failed to save preferences: ' + err.message);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // ── Change password ──
  const handleUpdatePassword = async () => {
    if (!profile.email) { alert('No email on profile.'); return; }
    if (!currentPassword || !newPassword) { alert('Fill current and new password.'); return; }
    if (newPassword !== confirmPassword) { alert('New passwords do not match.'); return; }
    if (newPassword.length < 8) { alert('New password must be at least 8 characters.'); return; }

    try {
      setIsUpdatingPassword(true);

      // Verify current password by re-signing in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (signInErr) throw new Error('Current password is incorrect.');

      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;

      await supabase
        .from('profiles')
        .update({
          must_change_password: false,
          password_changed_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    marginTop: '4px',
    boxSizing: 'border-box',
  };

  const readonlyInputStyle: React.CSSProperties = {
    ...inputStyle,
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#64748b',
  };

  const primaryButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#002b49',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ffffff',
    cursor: 'pointer',
  };

  const avatarSrc = profile.avatarUrl || avatarFallback(profile.name || profile.email || 'User');

  if (isLoading) {
    return (
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
          My Account Profile
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
          Manage your personal details, login credentials, and notification preferences.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* LEFT USER SUMMARY CARD */}
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
            <img
              src={avatarSrc}
              alt={profile.name || 'User'}
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #002b49', display: 'block' }}
            />
            {isUploadingAvatar && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(15, 23, 42, 0.55)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                Uploading…
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#0f172a',
                cursor: 'pointer',
                opacity: isUploadingAvatar ? 0.6 : 1,
              }}
            >
              {isUploadingAvatar ? 'Uploading…' : 'Change Photo'}
            </button>
            {profile.avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#dc2626',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            style={{ display: 'none' }}
          />

          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            {profile.name || 'Unnamed User'}
          </h2>
          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>
            {profile.role}
          </span>
          {profile.customId && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>ID: {profile.customId}</div>
          )}
        </div>

        {/* RIGHT MAIN SETTINGS CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* TAB BAR */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0' }}>
            {[
              { id: 'personal', label: 'Personal Info' },
              { id: 'security', label: 'Security & Password' },
              { id: 'notifications', label: 'Notification Preferences' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  borderBottom: activeTab === t.id ? '2px solid #002b49' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === t.id ? '#002b49' : '#64748b',
                  fontWeight: activeTab === t.id ? '800' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Full Name</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => handleDraftChange('name', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Email Address</label>
                  <input
                    type="email"
                    value={draft.email}
                    readOnly
                    style={readonlyInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Phone Number</label>
                  <input
                    type="text"
                    value={draft.phone}
                    onChange={(e) => handleDraftChange('phone', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Designation / Title</label>
                  <input
                    type="text"
                    value={draft.title}
                    readOnly
                    style={readonlyInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Alternate Phone</label>
                  <input
                    type="text"
                    value={draft.alternatePhone}
                    onChange={(e) => handleDraftChange('alternatePhone', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Address</label>
                  <input
                    type="text"
                    value={draft.address}
                    onChange={(e) => handleDraftChange('address', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={handleSavePersonal}
                  disabled={isSavingPersonal}
                  style={{ ...primaryButtonStyle, opacity: isSavingPersonal ? 0.6 : 1 }}
                >
                  {isSavingPersonal ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Change Password</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  style={{ ...primaryButtonStyle, marginTop: '8px', alignSelf: 'flex-start', opacity: isUpdatingPassword ? 0.6 : 1 }}
                >
                  {isUpdatingPassword ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Communication & Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={draftPrefs.email_messages}
                    onChange={(e) => setDraftPrefs(prev => ({ ...prev, email_messages: e.target.checked }))}
                  />{' '}
                  Email alerts for direct messages
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={draftPrefs.system_announcements}
                    onChange={(e) => setDraftPrefs(prev => ({ ...prev, system_announcements: e.target.checked }))}
                  />{' '}
                  System announcements
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', marginTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={handleSavePrefs}
                  disabled={isSavingPrefs}
                  style={{ ...primaryButtonStyle, opacity: isSavingPrefs ? 0.6 : 1 }}
                >
                  {isSavingPrefs ? 'Saving…' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};