import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
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

  const teacherMenuItems = [
    { 
      label: 'Dashboard', 
      path: '/teacher-dashboard', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> 
    },
    { 
      label: 'My Class & Students', 
      path: '/teacher/class', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 
    },
    { 
      label: 'Academics & Grades', 
      path: '/teacher/academics', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> 
    },
    { 
    label: 'Assessments', 
    path: '/teacher/assessments', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> 
    },
    { 
      label: 'Class Attendance', 
      path: '/teacher/attendance', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg> 
    },
    { 
      label: 'School Calendar', 
      path: '/teacher/calendar', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 
    },
    { 
      label: 'Messages', 
      path: '/teacher/messages', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 
    },
    { 
      label: 'My Profile', 
      path: '/teacher/profile', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 
    }
  ];

  const theme = {
    bg: isDarkMode ? '#000000' : '#f8fafc',
    sidebarBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    border: isDarkMode ? '#262626' : '#e2e8f0',
    text: isDarkMode ? '#ffffff' : '#0f172a',
    subText: isDarkMode ? '#a3a3a3' : '#64748b',
    activeNavBg: isDarkMode ? '#1f1f1f' : '#f0f9ff',
    activeNavText: isDarkMode ? '#0284c7' : '#002b49',
    inputBg: isDarkMode ? '#121212' : '#f1f5f9',
    brandTitle: isDarkMode ? '#38bdf8' : '#002b49',
    badgeBg: isDarkMode ? '#0369a1' : '#dbeafe',
    badgeText: isDarkMode ? '#ffffff' : '#1e40af',
    btnBg: isDarkMode ? '#0284c7' : '#002b49',
    iconColor: isDarkMode ? '#e5e5e5' : '#64748b'
  };

  const sidebarWidth = isCollapsed ? '70px' : '240px';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden', backgroundColor: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      
      {/* TEACHER SIDEBAR */}
      <aside style={{ width: sidebarWidth, minWidth: sidebarWidth, backgroundColor: theme.sidebarBg, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: isCollapsed ? '16px 8px' : '16px 12px', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div>
          {/* BRANDING HEADER */}
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'flex-start' }}>
            <div 
              onClick={() => navigate('/teacher-dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: isCollapsed ? 0 : '8px', cursor: 'pointer' }}
            >
              <img src="/logo.png" alt="SABIO" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ height: '32px', objectFit: 'contain' }} />
              {!isCollapsed && (
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: theme.brandTitle, letterSpacing: '-0.5px' }}>SABIO</div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: theme.subText }}>Achimota District</div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div style={{ marginTop: '10px', backgroundColor: theme.badgeBg, color: theme.badgeText, fontSize: '11px', fontWeight: 'bold', padding: '5px 10px', borderRadius: '5px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                Teacher Portal
              </div>
            )}
          </div>

          {/* TEACHER NAVIGATION MENU */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
            {teacherMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={item.label}
                  onClick={(e) => {
                    e.preventDefault();
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
              e.preventDefault();
              e.stopPropagation();
              navigate('/teacher/profile');
            }}
            title={isCollapsed ? 'Sarah Jenkins Profile' : undefined}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justify: isCollapsed ? 'center' : 'flex-start', 
              gap: '8px', 
              padding: '6px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              backgroundColor: location.pathname === '/teacher/profile' ? theme.activeNavBg : 'transparent'
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60" 
              alt="Sarah Jenkins" 
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: theme.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Sarah Jenkins
                </span>
                <span style={{ fontSize: '10px', color: theme.subText, display: 'block' }}>Science Teacher</span>
              </div>
            )}
          </div>

          {/* LOGOUT BUTTON */}
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
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

      {/* WORKSPACE AREA */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
       {/* HEADER */}
<header style={{ height: '60px', backgroundColor: theme.sidebarBg, borderBottom: `1px solid ${theme.border}`, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: '15px' }}>
  
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '500px' }}>
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.iconColor }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '25px', padding: '7px 16px', flex: 1 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input 
        type="text" 
        placeholder="Search class roster, subjects, or notes..." 
        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', color: theme.text, width: '100%' }}
      />
    </div>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <button 
      onClick={() => navigate('/teacher/attendance')}
      style={{ backgroundColor: theme.btnBg, color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      Take Today's Attendance
    </button>

    {/* NOTIFICATION BELL SVG BUTTON */}
    <button
      onClick={() => navigate('/teacher/notifications')}
      title="Notifications"
      style={{ 
        border: 'none', 
        background: 'none', 
        cursor: 'pointer', 
        padding: '6px', 
        borderRadius: '6px', 
        display: 'flex', 
        alignItems: 'center', 
        justify: 'center', 
        position: 'relative', 
        color: theme.iconColor 
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {/* Red Unread Indicator Dot */}
      <span style={{ 
        position: 'absolute', 
        top: '4px', 
        right: '4px', 
        width: '8px', 
        height: '8px', 
        backgroundColor: '#ef4444', 
        borderRadius: '50%', 
        border: `2px solid ${theme.sidebarBg}` 
      }} />
    </button>

    {/* DARK MODE TOGGLE */}
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
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

          <footer style={{ height: '40px', backgroundColor: theme.sidebarBg, borderTop: `1px solid ${theme.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: theme.subText, flexShrink: 0 }}>
            <div><strong>© 2026 SABIO Teacher Portal</strong></div>
            <div>Academic Year 2026/2027 • First Term</div>
          </footer>
        </main>

      </div>

    </div>
  );
};
