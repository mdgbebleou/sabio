import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 1024);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainMenuItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> 
    },
    { 
      label: 'Students', 
      path: '/students', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> 
    },
    { 
      label: 'Parents', 
      path: '/parents', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 
    },
    { 
      label: 'Teachers', 
      path: '/teachers', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 
    },
    { 
      label: 'Classes', 
      path: '/classes', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> 
    },
    { 
      label: 'Academics', 
      path: '/academics', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> 
    },
    { 
      label: 'School Calendar', 
      path: '/calendar', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> 
    },
    { 
      label: 'Attendance', 
      path: '/attendance', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg> 
    },
    { 
      label: 'Finance', 
      path: '/finance', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="2" y1="10" x2="22" y2="10"/></svg> 
    },
    { 
      label: 'Communication', 
      path: '/messages', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 
    },
    { 
      label: 'Reports', 
      path: '/reports-analytics', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> 
    }
  ];

  const systemMenuItems = [
    { 
      label: 'Access Management', 
      path: '/access-management', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="10" y="11" width="4" height="4" rx="1"/></svg> 
    },
    { 
      label: 'Settings', 
      path: '/settings', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> 
    }
  ];

  const theme = {
    bg: isDarkMode ? '#000000' : '#f8fafc',
    sidebarBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    border: isDarkMode ? '#262626' : '#e2e8f0',
    text: isDarkMode ? '#ffffff' : '#0f172a',
    subText: isDarkMode ? '#a3a3a3' : '#64748b',
    activeNavBg: isDarkMode ? '#1f1f1f' : '#dbeafe',
    activeNavText: isDarkMode ? '#38bdf8' : '#002b49',
    inputBg: isDarkMode ? '#121212' : '#f1f5f9',
    brandTitle: isDarkMode ? '#38bdf8' : '#0b2545',
    badgeBg: isDarkMode ? '#172554' : '#002b49',
    btnBg: isDarkMode ? '#2563eb' : '#002b49',
    iconColor: isDarkMode ? '#e5e5e5' : '#64748b'
  };

  const sidebarWidth = isCollapsed ? '70px' : '240px';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden', backgroundColor: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif", transition: 'all 0.2s ease' }}>
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside style={{ width: sidebarWidth, minWidth: sidebarWidth, backgroundColor: theme.sidebarBg, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: isCollapsed ? '16px 8px' : '16px 12px', boxSizing: 'border-box', overflowY: 'auto', transition: 'all 0.2s ease' }}>
        <div>
          {/* BRANDING HEADER */}
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: isCollapsed ? 0 : '8px' }}>
              <img src="/logo.png" alt="SABIO" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ height: '32px', objectFit: 'contain' }} />
              {!isCollapsed && (
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: theme.brandTitle, letterSpacing: '-0.5px' }}>SABIO</div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: theme.subText }}>Achimota District</div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div style={{ marginTop: '10px', backgroundColor: theme.badgeBg, color: '#ffffff', fontSize: '11px', fontWeight: 'bold', padding: '5px 10px', borderRadius: '5px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                Administration
              </div>
            )}
          </div>

          {/* MAIN NAVIGATION */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
            {mainMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={item.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: isCollapsed ? 'center' : 'flex-start',
                    gap: '10px',
                    padding: isCollapsed ? '10px' : '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? theme.activeNavText : theme.subText,
                    backgroundColor: isActive ? theme.activeNavBg : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
              );
            })}
          </nav>

          {/* SYSTEM NAVIGATION */}
          {!isCollapsed && (
            <div style={{ fontSize: '10px', fontWeight: '800', color: theme.subText, textTransform: 'uppercase', paddingLeft: '12px', marginBottom: '6px', letterSpacing: '0.5px' }}>
              SYSTEM
            </div>
          )}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {systemMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={item.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: isCollapsed ? 'center' : 'flex-start',
                    gap: '10px',
                    padding: isCollapsed ? '10px' : '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? theme.activeNavText : theme.subText,
                    backgroundColor: isActive ? theme.activeNavBg : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER */}
        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* PROFILE CLICKABLE ZONE */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/profile');
            }}
            title={isCollapsed ? 'Kwame Mensah Profile' : undefined}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justify: isCollapsed ? 'center' : 'flex-start', 
              gap: '8px', 
              padding: '6px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              backgroundColor: location.pathname === '/profile' ? theme.activeNavBg : 'transparent',
              transition: 'background-color 0.15s ease'
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60" 
              alt="Kwame Mensah" 
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: location.pathname === '/profile' ? theme.activeNavText : theme.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Kwame Mensah
                </span>
                <span style={{ fontSize: '10px', color: theme.subText, display: 'block' }}>Administrator</span>
              </div>
            )}
          </div>

          {/* LOGOUT BUTTON */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/login');
            }} 
            title={isCollapsed ? 'Logout' : undefined}
            style={{ 
              border: 'none', 
              background: 'none', 
              padding: '6px 8px', 
              display: 'flex', 
              alignItems: 'center', 
              justify: isCollapsed ? 'center' : 'flex-start', 
              gap: '8px', 
              cursor: 'pointer',
              borderRadius: '6px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {!isCollapsed && <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* RESPONSIVE TOP HEADER */}
        <header style={{ height: '60px', backgroundColor: theme.sidebarBg, borderBottom: `1px solid ${theme.border}`, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: '15px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '500px' }}>
            {/* SIDEBAR COLLAPSE TOGGLE BUTTON */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.iconColor }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>

            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '25px', padding: '7px 16px', flex: 1, minWidth: '160px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search students, staff, or documents..." 
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', color: theme.text, width: '100%' }}
              />
            </div>
          </div>

          {/* Action Buttons & Utility Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {windowWidth > 768 && (
              <button 
                onClick={() => navigate('/notifications')}
                style={{ backgroundColor: theme.btnBg, color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                + Create Announcement
              </button>
            )}

            <button 
              onClick={() => navigate('/students')}
              style={{ backgroundColor: theme.btnBg, color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {windowWidth < 640 ? '+ Add' : '+ Add Student'}
            </button>

            <div style={{ height: '20px', width: '1px', backgroundColor: theme.border, margin: '0 2px' }}></div>

            {/* Notifications Bell */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
            </div>

            {/* Dark Mode Icon */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              {isDarkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>

        </header>

        {/* SCROLLABLE WORKSPACE AREA */}
        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, width: '100%' }}>
            {children}
          </div>

          {/* FOOTER */}
          <footer style={{ height: '40px', backgroundColor: theme.sidebarBg, borderTop: `1px solid ${theme.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: theme.subText, flexShrink: 0 }}>
            <div><strong>© 2026 SABIO SMIS v2.4.0</strong></div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ cursor: 'pointer' }}>Support Center</span>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>User Manual</span>
            </div>
          </footer>
        </main>

      </div>

    </div>
  );
};