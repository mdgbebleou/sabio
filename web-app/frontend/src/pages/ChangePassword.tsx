import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyPassword } from '../services/teacherService';
import type { MyProfile } from '../services/teacherService';

const dashboardForRole = (role: string): string => {
  const r = role.toLowerCase();
  if (r === 'admin' || r === 'administrator') return '/dashboard';
  if (r === 'teacher') return '/teacher-dashboard';
  if (r === 'accountant') return '/finance-dashboard';
  if (r === 'parent') return '/parent-dashboard';
  return '/login';
};

export const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile();
        setMe(p);
        if (!p.mustChangePassword) {
          navigate(dashboardForRole(p.role));
        }
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPw.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await updateMyPassword(newPw);
      const role = me?.role || 'admin';
      navigate(dashboardForRole(role));
    } catch (err: any) {
      setError(err?.message || 'Could not update password.');
    } finally {
      setSaving(false);
    }
  };

  const firstName = me?.firstName || me?.fullName?.split(' ')[0] || 'there';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#f1f5f9',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 43, 73, 0.18), 0 0 1px 1px rgba(226, 232, 240, 0.8)',
        padding: '36px 32px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <img
            src="/logo.png"
            alt="SABIO"
            onError={(e) => { (e.target as any).style.display = 'none'; }}
            style={{ height: '40px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#002b49', letterSpacing: '-0.5px', lineHeight: 1 }}>SABIO</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>School Management System</div>
          </div>
        </div>

        <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
          Welcome, {loading ? '...' : firstName}
        </h1>
        <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
          For your security, please set a new password before continuing.
        </p>

        {loading ? (
          <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
            Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                New Password
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Confirm Password
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter password"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
              Show password
            </label>

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: '8px',
                backgroundColor: '#002b49',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 6px -1px rgba(0, 43, 73, 0.2)'
              }}
            >
              {saving ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
