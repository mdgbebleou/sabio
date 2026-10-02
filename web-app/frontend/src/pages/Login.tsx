import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // POST request to Django login
      const response = await api.post('/api/users/login/', { email, password });
      const resData = response.data;

      console.log("Django Login Response Payload:", resData);

      // Check for token in various Django REST formats
      const token = resData.access || resData.token || resData.key || resData.jwt;

      if (token) {
        // Save token for authenticated requests
        localStorage.setItem('token', token);
      } else {
        // If Django login doesn't return a token, save a session marker so requests proceed
        console.warn("No token key returned in Django response. Continuing session with user data.");
        localStorage.setItem('token', 'session-active');
      }

      // Store User Info
      const role = resData.role || resData.user?.role || 'Admin';
      const userEmail = resData.username || resData.email || email;
      const firstName = resData.first_name || 'User';

      localStorage.setItem('user_role', role);
      localStorage.setItem('user_email', userEmail);
      localStorage.setItem('user_first_name', firstName);

      // Navigate to correct page based on Role
      if (role === 'Teacher') navigate('/teacher-dashboard');
      else if (role === 'Accountant') navigate('/finance-dashboard');
      else if (role === 'Parent') navigate('/parent-dashboard');
      else navigate('/users'); // Admin / Default

    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.detail || error.response.data.error || 'Invalid email or password.');
      } else {
        setErrorMessage('Unable to connect to authentication server. Ensure Django is running on port 8000.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f1f5f9',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2394a3b8' fill-opacity='0.18'%3E%3Cpath d='M20 25l15-7 15 7-15 7zM35 34v6c3 1.5 7 1.5 10 0v-6' stroke='%2394a3b8' stroke-width='1.5' fill='none'/%3E%3Cpath d='M80 15h30v8H80z' stroke='%2394a3b8' stroke-width='1.5' fill='none'/%3E%3Cline x1='88' y1='15' x2='88' y2='19' stroke='%2394a3b8' stroke-width='1.5'/%3E%3Cline x1='96' y1='15' x2='96' y2='21' stroke='%2394a3b8' stroke-width='1.5'/%3E%3Cline x1='104' y1='15' x2='104' y2='19' stroke='%2394a3b8' stroke-width='1.5'/%3E%3Cpath d='M15 80l20-20 5 5-20 20-7 2z' stroke='%2394a3b8' stroke-width='1.5' fill='none'/%3E%3Cpath d='M85 85l-8 12a3 3 0 002 4h18a3 3 0 002-4l-8-12v-8h-6z' stroke='%2394a3b8' stroke-width='1.5' fill='none'/%3E%3Cpath d='M50 70c-4-2-8-2-12 0v18c4-2 8-2 12 0M50 70c4-2 8-2 12 0v18c-4-2-8-2-12 0M50 70v18' stroke='%2394a3b8' stroke-width='1.5' fill='none'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1100px',
        height: '100%',
        maxHeight: '680px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 43, 73, 0.18), 0 0 1px 1px rgba(226, 232, 240, 0.8)',
        overflow: 'hidden'
      }}>
        {/* LEFT IMAGE PANEL */}
        <div style={{
          flex: '1.1',
          position: 'relative',
          backgroundImage: 'url("/login-hero.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '40px',
          borderTopLeftRadius: '24px',
          borderBottomLeftRadius: '24px'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.18)', zIndex: 1 }}></div>
          <div style={{ position: 'relative', zIndex: 2, color: '#ffffff', fontSize: '28px', fontFamily: 'Georgia, serif', fontStyle: 'italic', textShadow: '0 2px 4px rgba(0,0,0,0.4)', maxWidth: '280px', lineHeight: '1.25' }}>
            Better Learning<br />Brighter Futures
            <div style={{ height: '3px', width: '70px', backgroundColor: '#f59e0b', marginTop: '10px', borderRadius: '2px' }}></div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={{ flex: '1', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px', boxSizing: 'border-box', overflowY: 'auto' }}>
          <div style={{ maxWidth: '380px', width: '100%', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <img src="/logo.png" alt="SABIO Logo" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ height: '44px', objectFit: 'contain' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#002b49', letterSpacing: '-0.5px', lineHeight: 1 }}>SABIO</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>School Management System</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Sign In</h1>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {errorMessage && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                  {errorMessage}
                </div>
              )}

              <div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '14px' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '13px 14px 13px 44px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', color: '#0f172a', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '14px' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '13px 44px 13px 44px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', color: '#0f172a', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <span onClick={() => alert("Please contact your system administrator to reset your password.")} style={{ fontSize: '12px', color: '#0284c7', fontWeight: 'bold', cursor: 'pointer' }}>
                    Forgot Password?
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '6px', boxShadow: '0 4px 6px -1px rgba(0, 43, 73, 0.2)' }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};