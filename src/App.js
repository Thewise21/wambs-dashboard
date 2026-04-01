import { useState } from 'react';
import GoalTracker from './components/GoalTracker';
import DailySystem from './components/DailySystem';
import KPIBoard from './components/KPIBoard';
import HistoryPanel from './components/HistoryPanel';
import CalendarView from './components/CalendarView';

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

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: sidebarWidth,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Brand */}
        <div style={{
          ...styles.brand,
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          padding: sidebarCollapsed ? '24px 0' : '24px 20px',
        }}>
          <div style={styles.logo}>W</div>
          {!sidebarCollapsed && <span style={styles.brandName}>WAMB'S</span>}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={styles.collapseBtn}
          title={sidebarCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>

        {/* Nav */}
        <nav style={{
          ...styles.nav,
          padding: sidebarCollapsed ? '8px 6px' : '16px 12px',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navItem,
                ...(activeTab === tab.id ? styles.navItemActive : {}),
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                padding: sidebarCollapsed ? '11px 0' : '11px 14px',
              }}
              title={sidebarCollapsed ? tab.label : undefined}
            >
              <span style={styles.navIcon}>{tab.icon}</span>
              {!sidebarCollapsed && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          ...styles.sidebarFooter,
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          padding: sidebarCollapsed ? '16px 0' : '16px 20px',
        }}>
          <div style={styles.userAvatar}>PW</div>
          {!sidebarCollapsed && (
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
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>
            {tabs.find(t => t.id === activeTab)?.icon}{' '}
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <span style={styles.date}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </header>
        <div style={styles.content}>
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
    width: 36,
    height: 36,
    background: '#2563eb',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  brandName: { fontSize: 18, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' },
  collapseBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: 12,
    cursor: 'pointer',
    padding: '6px 0',
    textAlign: 'center',
    fontFamily: 'inherit',
    transition: 'color 0.15s',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navItemActive: {
    background: '#2563eb',
    color: '#fff',
  },
  navIcon: { fontSize: 18, flexShrink: 0 },
  sidebarFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderTop: '1px solid #334155',
  },
  userAvatar: {
    width: 34,
    height: 34,
    background: '#2563eb',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  userName: { fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap' },
  userRole: { fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' },
  main: {
    flex: 1,
    background: '#f1f5f9',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
  },
  pageTitle: { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 },
  date: { fontSize: 13, color: '#64748b' },
  content: { padding: 32 },
};

export default App;
