import { useState, useEffect } from 'react';
import GoalTracker from './components/GoalTracker';
import DailySystem from './components/DailySystem';
import KPIBoard from './components/KPIBoard';
import HistoryPanel from './components/HistoryPanel';
import CalendarView from './components/CalendarView';
import useWindowSize from './hooks/useWindowSize';

const tabs = [
  { id: 'daily', label: 'Système Quotidien', icon: '⚡' },
  { id: 'goals', label: 'Objectifs', icon: '🎯' },
  { id: 'calendar', label: 'Calendrier', icon: '📅' },
  { id: 'kpi', label: 'KPI Board', icon: '📊' },
  { id: 'history', label: 'Historique', icon: '📈' },
];

function App() {
  const [activeTab, setActiveTab] = useState('daily');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isMobile, isTablet } = useWindowSize();

  // Auto-collapse on tablet, close drawer when leaving mobile
  useEffect(() => {
    if (isTablet) setSidebarCollapsed(true);
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile, isTablet]);

  const effectiveCollapsed = isMobile ? false : (isTablet ? true : sidebarCollapsed);
  const sidebarWidth = isMobile ? 240 : (effectiveCollapsed ? 64 : 240);
  const contentPad = isMobile ? 12 : isTablet ? 20 : 32;

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (isMobile) setDrawerOpen(false);
  };

  return (
    <div style={styles.app}>
      {/* Mobile backdrop */}
      {isMobile && drawerOpen && (
        <div style={styles.backdrop} onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile hamburger */}
      {isMobile && !drawerOpen && (
        <button style={styles.hamburger} onClick={() => setDrawerOpen(true)}>☰</button>
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: sidebarWidth,
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        ...(isMobile ? {
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-260px)',
          boxShadow: drawerOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
        } : {}),
      }}>
        {/* Brand */}
        <div style={{
          ...styles.brand,
          justifyContent: effectiveCollapsed && !isMobile ? 'center' : 'flex-start',
          padding: effectiveCollapsed && !isMobile ? '24px 0' : '24px 20px',
        }}>
          <div style={styles.logo}>W</div>
          {(!effectiveCollapsed || isMobile) && <span style={styles.brandName}>WAMB'S</span>}
        </div>

        {/* Collapse toggle (hidden on mobile) */}
        {!isMobile && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={styles.collapseBtn}
            title={effectiveCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          >
            {effectiveCollapsed ? '▶' : '◀'}
          </button>
        )}

        {/* Nav */}
        <nav style={{
          ...styles.nav,
          padding: effectiveCollapsed && !isMobile ? '8px 6px' : '16px 12px',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                ...styles.navItem,
                ...(activeTab === tab.id ? styles.navItemActive : {}),
                justifyContent: effectiveCollapsed && !isMobile ? 'center' : 'flex-start',
                padding: effectiveCollapsed && !isMobile ? '11px 0' : '11px 14px',
              }}
              title={effectiveCollapsed && !isMobile ? tab.label : undefined}
            >
              <span style={styles.navIcon}>{tab.icon}</span>
              {(!effectiveCollapsed || isMobile) && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          ...styles.sidebarFooter,
          justifyContent: effectiveCollapsed && !isMobile ? 'center' : 'flex-start',
          padding: effectiveCollapsed && !isMobile ? '16px 0' : '16px 20px',
        }}>
          <div style={styles.userAvatar}>PW</div>
          {(!effectiveCollapsed || isMobile) && (
            <div style={styles.userInfo}>
              <span style={styles.userName}>Poclaire Wamba</span>
              <span style={styles.userRole}>Geschäftsführer</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        ...styles.main,
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <header style={{
          ...styles.header,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 4 : 0,
          padding: isMobile ? '14px 16px' : '20px 32px',
          paddingLeft: isMobile ? 48 : undefined,
        }}>
          <h1 style={{ ...styles.pageTitle, fontSize: isMobile ? 16 : 20 }}>
            {tabs.find(t => t.id === activeTab)?.icon}{' '}
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <span style={styles.date}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: isMobile ? 'short' : 'long',
              day: 'numeric',
              month: isMobile ? 'short' : 'long',
              year: 'numeric',
            })}
          </span>
        </header>
        <div style={{ ...styles.content, padding: contentPad }}>
          {activeTab === 'daily' && <DailySystem />}
          {activeTab === 'goals' && <GoalTracker />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'kpi' && <KPIBoard />}
          {activeTab === 'history' && <HistoryPanel />}
        </div>
      </main>
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    zIndex: 99, transition: 'opacity 0.25s',
  },
  hamburger: {
    position: 'fixed', top: 14, left: 12, zIndex: 200,
    background: '#1e293b', color: '#fff', border: 'none',
    borderRadius: 8, width: 36, height: 36, fontSize: 18,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  sidebar: {
    background: '#1e293b',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderBottom: '1px solid #334155',
    minHeight: 84,
  },
  logo: {
    width: 36, height: 36, background: '#2563eb', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  brandName: { fontSize: 18, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' },
  collapseBtn: {
    background: 'transparent', border: 'none', color: '#64748b',
    fontSize: 12, cursor: 'pointer', padding: '6px 0', textAlign: 'center',
    fontFamily: 'inherit', transition: 'color 0.15s',
  },
  nav: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: 4,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    borderRadius: 8, border: 'none', background: 'transparent',
    color: '#94a3b8', fontSize: 14, fontWeight: 500, cursor: 'pointer',
    textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit',
    whiteSpace: 'nowrap', overflow: 'hidden',
  },
  navItemActive: { background: '#2563eb', color: '#fff' },
  navIcon: { fontSize: 18, flexShrink: 0 },
  sidebarFooter: {
    display: 'flex', alignItems: 'center', gap: 10,
    borderTop: '1px solid #334155',
  },
  userAvatar: {
    width: 34, height: 34, background: '#2563eb', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0,
  },
  userInfo: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  userName: { fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap' },
  userRole: { fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' },
  main: {
    flex: 1, background: '#f1f5f9', minHeight: '100vh',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    padding: '20px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0',
  },
  pageTitle: { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 },
  date: { fontSize: 13, color: '#64748b' },
  content: { padding: 32 },
};

export default App;
