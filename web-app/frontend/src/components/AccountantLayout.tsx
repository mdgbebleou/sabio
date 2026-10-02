import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AccountantLayoutProps {
  children: React.ReactNode;
}

export const AccountantLayout: React.FC<AccountantLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const accountantMenuItems = [
    { 
      label: 'Dashboard', 
      path: '/finance-dashboard', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> 
    },
    { 
      label: 'Fees', 
      path: '/accountant/fees', 
      // Updated to cash / banknote SVG icon
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg> 
    },
    { 
      label: 'Payments', 
      path: '/accountant/payments', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> 
    },
    { 
      label: 'Invoices', 
      path: '/accountant/invoices', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> 
    },
    { 
      label: 'Structures', 
      path: '/accountant/structures', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg> 
    },
    { 
      label: 'Balances', 
      path: '/accountant/balances', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> 
    },
    { 
      label: 'Reports', 
      path: '/accountant/reports', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> 
    },
    { 
      label: 'Settings', 
      path: '/accountant/settings', 
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
    activeNavText: isDarkMode ? '#60a5fa' : '#1e40af',
    btnBg: '#002b49',
    iconColor: isDarkMode ? '#e5e5e5' : '#64748b'
  };

  const sidebarWidth = isCollapsed ? '70px' : '240px';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden', backgroundColor: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: sidebarWidth, minWidth: sidebarWidth, backgroundColor: theme.sidebarBg, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: isCollapsed ? '16px 8px' : '16px 12px', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div>
          {/* BRANDING HEADER */}
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'flex-start' }}>
            <div 
              onClick={() => navigate('/finance-dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: isCollapsed ? 0 : '8px', cursor: 'pointer' }}
            >
              <img src="/logo.png" alt="SABIO" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ height: '32px', objectFit: 'contain' }} />
              {!isCollapsed && (
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#002b49', letterSpacing: '-0.5px' }}>SABIO</div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: theme.subText }}>Achimota District</div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div style={{ marginTop: '12px', backgroundColor: '#002b49', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '8px 12px', borderRadius: '6px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                Accountant
              </div>
            )}
          </div>

          {/* MENU ITEMS */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
            {accountantMenuItems.map((item) => {
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
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '12px',
                    padding: isCollapsed ? '10px' : '10px 12px',
                    borderRadius: '8px',
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
        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/accountant/profile');
            }}
            title={isCollapsed ? 'Mavis Donko' : undefined}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isCollapsed ? 'center' : 'flex-start', 
              gap: '10px', 
              padding: '6px 8px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              backgroundColor: location.pathname === '/accountant/profile' ? theme.activeNavBg : 'transparent'
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60" 
              alt="Mavis Donko" 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: theme.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Mavis Donko
                </span>
                <span style={{ fontSize: '10px', color: theme.subText, display: 'block' }}>Accountant</span>
              </div>
            )}
          </div>

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
              padding: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isCollapsed ? 'center' : 'flex-start', 
              gap: '10px', 
              cursor: 'pointer',
              borderRadius: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {!isCollapsed && <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: isDarkMode ? '#121212' : '#f1f5f9', border: `1px solid ${theme.border}`, borderRadius: '25px', padding: '7px 16px', flex: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search records, students, invoices..." 
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', color: theme.text, width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => navigate('/accountant/payments')}
              style={{ backgroundColor: theme.btnBg, color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Record Payment
            </button>

            <button
              onClick={() => navigate('/accountant/notifications')}
              title="Notifications"
              style={{ 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer', 
                padding: '6px', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative', 
                color: theme.iconColor 
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
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

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: theme.iconColor }}
            >
              {isDarkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>

        </header>

        {/* WORKSPACE & FOOTER */}
        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, width: '100%' }}>
            {children}
          </div>

          <footer style={{ height: '40px', backgroundColor: theme.sidebarBg, borderTop: `1px solid ${theme.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: theme.subText, flexShrink: 0 }}>
            <div><strong>© 2026 Sabio SMIS v2.4.0</strong></div>
            <div style={{ display: 'flex', gap: '20px' }}>
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