import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';
import {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
  getMyPreferences,
  saveMyPreferences,
} from '../services/teacherService';
import type { MyProfile, UserPreferences } from '../services/teacherService';

export const AccountantSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Notifications' | 'Security'>('Notifications');

  // Profile
  const [me, setMe] = useState<MyProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preferences
  const [prefs, setPrefs] = useState<UserPreferences>({
    currency: 'GHS (Ghana Cedi)',
    fiscalYear: null,
    autoReceipts: true,
    emailAlerts: true,
    smsAlerts: false,
    overdueReminders: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
    marginBottom: '20px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 800,
    color: '#334155',
    display: 'block',
    marginBottom: '6px',
    textTransform: 'uppercase',
  };

  const load = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const [profile, p] = await Promise.all([
        getMyProfile().catch(() => null),
        getMyPreferences().catch(() => null),
      ]);
      if (profile) {
        setMe(profile);
        setAvatarUrl(profile.avatarUrl);
      }
      if (p) setPrefs(p);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Max 2 MB.');
      return;
    }
    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!me || !pendingFile) return;
    setSavingAvatar(true);
    try {
      const saved = await updateMyProfile({
        firstName: me.firstName,
        lastName: me.lastName,
        primaryPhone: me.primaryPhone,
        avatarUrl: avatarUrl,
      });
      setMe(saved);
      setAvatarUrl(saved.avatarUrl);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('Photo updated.');
    } catch (err: any) {
      alert(err?.message || 'Could not save photo.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleCancelAvatar = () => {
    setAvatarUrl(me?.avatarUrl ?? null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!me) return;
    if (!confirm('Remove your profile photo?')) return;
    setSavingAvatar(true);
    try {
      const saved = await updateMyProfile({
        firstName: me.firstName,
        lastName: me.lastName,
        primaryPhone: me.primaryPhone,
        avatarUrl: null,
      });
      setMe(saved);
      setAvatarUrl(null);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(err?.message || 'Could not remove photo.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingPrefs(true);
    try {
      const saved = await saveMyPreferences({
        emailAlerts: prefs.emailAlerts,
        smsAlerts: prefs.smsAlerts,
        overdueReminders: prefs.overdueReminders,
      });
      setPrefs(saved);
      alert('Notification preferences saved.');
    } catch (err: any) {
      alert(err?.message || 'Could not save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPw.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      alert('New passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await updateMyPassword(newPw);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      alert('Password updated.');
    } catch (err: any) {
      alert(err?.message || 'Could not update password.');
    } finally {
      setSavingPw(false);
    }
  };

  const initials = ((me?.firstName?.[0] ?? '') + (me?.lastName?.[0] ?? '')).toUpperCase() || '?';
  const displayName = me?.fullName || 'Loading...';
  const displayRole = me?.role ? me.role.charAt(0).toUpperCase() + me.role.slice(1) : 'Accountant';
  const hasPendingAvatar = pendingFile !== null;

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Accountant Settings
          </h1>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Manage your profile, notification channels, and login credentials.
          </span>
        </div>

        {/* ACCOUNT CARD */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Avatar block */}
            <div style={{ position: 'relative' }}>
              {loadingProfile ? (
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' }}
                />
              ) : (
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: '3px solid #e2e8f0' }}>
                  {initials}
                </div>
              )}
            </div>

            {/* Name / role / email */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                {displayName}
              </h2>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                {displayRole}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {me?.email || ''}
              </div>
            </div>

            {/* Photo actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!hasPendingAvatar ? (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Upload Photo
                  </button>
                  {avatarUrl && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={savingAvatar}
                      style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: 'bold', cursor: savingAvatar ? 'wait' : 'pointer' }}
                    >
                      Remove Photo
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveAvatar}
                    disabled={savingAvatar}
                    style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', cursor: savingAvatar ? 'wait' : 'pointer', opacity: savingAvatar ? 0.7 : 1 }}
                  >
                    {savingAvatar ? 'Saving...' : 'Save Photo'}
                  </button>
                  <button
                    onClick={handleCancelAvatar}
                    disabled={savingAvatar}
                    style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontSize: '12px', fontWeight: 'bold', cursor: savingAvatar ? 'wait' : 'pointer' }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {(['Notifications', 'Security'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === tab ? '1px solid #002b49' : '1px solid #cbd5e1',
                backgroundColor: activeTab === tab ? '#002b49' : '#ffffff',
                color: activeTab === tab ? '#ffffff' : '#334155',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: NOTIFICATIONS */}
        {activeTab === 'Notifications' && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Notification Channels</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Email Alerts</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Receive instant email summaries for incoming student bank transfers and pending requests.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.emailAlerts}
                    onChange={(e) => setPrefs({ ...prefs, emailAlerts: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>SMS Notifications</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Get urgent text messages for high-value transaction flags or system alerts.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.smsAlerts}
                    onChange={(e) => setPrefs({ ...prefs, smsAlerts: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Overdue Balance Reminders</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Automatic weekly reminders for student accounts exceeding 30 days overdue.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.overdueReminders}
                    onChange={(e) => setPrefs({ ...prefs, overdueReminders: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSaveNotifications}
                  disabled={savingPrefs}
                  style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', fontWeight: 'bold', cursor: savingPrefs ? 'wait' : 'pointer', opacity: savingPrefs ? 0.7 : 1 }}
                >
                  {savingPrefs ? 'Saving...' : 'Update Notifications'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY */}
        {activeTab === 'Security' && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Change Password</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter current password"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="At least 6 characters"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Re-enter new password"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSavePassword}
                  disabled={savingPw}
                  style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', fontWeight: 'bold', cursor: savingPw ? 'wait' : 'pointer', opacity: savingPw ? 0.7 : 1 }}
                >
                  {savingPw ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccountantLayout>
  );
};