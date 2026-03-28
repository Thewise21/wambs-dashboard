import { useState } from 'react';
import GoalTracker from './components/GoalTracker';
import DailySystem from './components/DailySystem';
import KPIBoard from './components/KPIBoard';

const tabs = [
  { id: 'daily', label: 'Système Quotidien', icon: '⚡' },
  { id: 'goals', label: 'Objectifs', icon: '🎯' },
  { id: 'kpi', label: 'KPI Board', icon: '📊' },
];

function App() {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logo}>W</div>
          <span style={styles.brandName}>WAMB'S</span>
        </div>
        <nav style={styles.nav}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navItem,
                ...(activeTab === tab.id ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.userAvatar}>PW</div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>Poclaire Wamba</span>
            <span style={styles.userRole}>Steuerberater</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
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
          {activeTab === 'kpi' && <KPIBoard />}
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
    width: 240,
    background: '#1e293b',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '24px 20px',
    borderBottom: '1px solid #334155',
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
  },
  brandName: { fontSize: 18, fontWeight: 700, letterSpacing: 1 },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 14px',
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
  },
  navItemActive: {
    background: '#2563eb',
    color: '#fff',
  },
  navIcon: { fontSize: 18 },
  sidebarFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 20px',
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
  },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: 13, fontWeight: 600, color: '#e2e8f0' },
  userRole: { fontSize: 11, color: '#64748b' },
  main: {
    flex: 1,
    marginLeft: 240,
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
