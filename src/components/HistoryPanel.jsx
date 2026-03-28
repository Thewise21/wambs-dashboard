import { useState, useEffect } from 'react';
import { fetchHabitsHistory, fetchKpiTrend, fetchDailyProductivity, fetchAlerts } from '../services/bigqueryApi';

function Sparkline({ data, color = '#2563eb', width = 120, height = 32 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r="3" fill={color} />
    </svg>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={styles.progressBg}>
      <div style={{ ...styles.progressFill, width: `${pct}%`, background: color }} />
    </div>
  );
}

function HistoryPanel() {
  const [habits, setHabits] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [productivity, setProductivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    Promise.all([
      fetchHabitsHistory(),
      fetchKpiTrend(),
      fetchDailyProductivity(),
      fetchAlerts(),
    ]).then(([h, k, p, a]) => {
      setHabits(h);
      setKpis(k);
      setProductivity(p);
      setAlerts(a);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={styles.container}><p style={styles.loading}>Chargement des donnees BigQuery...</p></div>;
  }

  const tabs = [
    { id: 'alerts', label: 'Alertes', icon: '!' },
    { id: 'kpis', label: 'KPI Trends', icon: '~' },
    { id: 'habits', label: 'Habitudes', icon: '#' },
    { id: 'productivity', label: 'Productivite', icon: '%' },
  ];

  // Group habits by name for sparklines
  const habitNames = [...new Set(habits.map(h => h.habit_name))];
  const habitsByName = {};
  habitNames.forEach(name => {
    habitsByName[name] = habits
      .filter(h => h.habit_name === name)
      .sort((a, b) => a.week_start.localeCompare(b.week_start))
      .map(h => h.completion_rate);
  });

  // Group KPIs by name for sparklines
  const kpiNames = [...new Set(kpis.map(k => k.kpi_name))];
  const kpisByName = {};
  kpiNames.forEach(name => {
    const rows = kpis.filter(k => k.kpi_name === name).sort((a, b) => a.month_start.localeCompare(b.month_start));
    kpisByName[name] = {
      values: rows.map(r => r.avg_value),
      target: rows[0]?.target,
      unit: rows[0]?.unit,
      current: rows[rows.length - 1]?.avg_value,
    };
  });

  const alertColor = (status) => {
    if (status.startsWith('ALERT')) return '#ef4444';
    if (status.startsWith('WARNING')) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Historique & Analytics</h2>
          <p style={styles.subtitle}>BigQuery - dashboard_analytics</p>
        </div>
        <div style={styles.badge}>LIVE</div>
      </div>

      <div style={styles.tabBar}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}>
            <span style={styles.tabIcon}>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'alerts' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Alertes KPI (v_kpi_alerts)</h3>
          <div style={styles.alertList}>
            {alerts.map((a, i) => (
              <div key={i} style={{ ...styles.alertCard, borderLeftColor: alertColor(a.alert_status) }}>
                <div style={styles.alertHeader}>
                  <span style={{ ...styles.alertDot, background: alertColor(a.alert_status) }} />
                  <span style={styles.alertName}>{a.kpi_name}</span>
                  <span style={{ ...styles.alertBadge, background: `${alertColor(a.alert_status)}15`, color: alertColor(a.alert_status) }}>
                    {a.alert_status}
                  </span>
                </div>
                <div style={styles.alertBody}>
                  <span style={styles.alertValue}>{typeof a.kpi_value === 'number' ? a.kpi_value.toLocaleString() : a.kpi_value}</span>
                  <span style={styles.alertUnit}>{a.unit}</span>
                  {a.pct_of_target != null && (
                    <span style={styles.alertPct}>{a.pct_of_target}% of target</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'kpis' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Tendances KPI mensuelles (v_monthly_kpi_trend)</h3>
          <div style={styles.kpiGrid}>
            {kpiNames.map(name => {
              const kpi = kpisByName[name];
              return (
                <div key={name} style={styles.kpiCard}>
                  <div style={styles.kpiHeader}>
                    <span style={styles.kpiName}>{name}</span>
                    <span style={styles.kpiCurrent}>
                      {kpi.current?.toLocaleString()} {kpi.unit === 'EUR' ? 'EUR' : kpi.unit === 'pct' ? '%' : ''}
                    </span>
                  </div>
                  <Sparkline data={kpi.values} color={kpi.current >= (kpi.target * 0.5) ? '#10b981' : '#f59e0b'} width={160} height={36} />
                  {kpi.target > 0 && (
                    <ProgressBar value={kpi.current} max={kpi.target} color={kpi.current >= kpi.target * 0.5 ? '#10b981' : '#f59e0b'} />
                  )}
                  {kpi.target > 0 && (
                    <span style={styles.kpiTarget}>Objectif: {kpi.target.toLocaleString()}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'habits' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Taux de completion hebdomadaire (v_weekly_habits)</h3>
          <div style={styles.habitGrid}>
            {habitNames.map(name => {
              const rates = habitsByName[name];
              const current = rates[rates.length - 1] || 0;
              return (
                <div key={name} style={styles.habitCard}>
                  <div style={styles.habitHeader}>
                    <span style={styles.habitName}>{name}</span>
                    <span style={{ ...styles.habitRate, color: current >= 80 ? '#10b981' : current >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {current}%
                    </span>
                  </div>
                  <Sparkline data={rates} color={current >= 80 ? '#10b981' : current >= 50 ? '#f59e0b' : '#ef4444'} width={140} height={28} />
                  <ProgressBar value={current} max={100} color={current >= 80 ? '#10b981' : current >= 50 ? '#f59e0b' : '#ef4444'} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'productivity' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Productivite quotidienne (v_daily_productivity)</h3>
          <div style={styles.prodTable}>
            <div style={styles.prodHeader}>
              <span style={{ ...styles.prodCell, fontWeight: 600 }}>Date</span>
              <span style={{ ...styles.prodCell, fontWeight: 600 }}>Habitudes</span>
              <span style={{ ...styles.prodCell, fontWeight: 600 }}>Taux</span>
              <span style={{ ...styles.prodCell, fontWeight: 600 }}>Deep Work</span>
              <span style={{ ...styles.prodCell, fontWeight: 600 }}>Total plan.</span>
            </div>
            {productivity.map((p, i) => (
              <div key={i} style={{ ...styles.prodRow, background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                <span style={styles.prodCell}>{p.date}</span>
                <span style={styles.prodCell}>{p.habits_done}/{p.habits_total}</span>
                <span style={{ ...styles.prodCell, color: p.habit_rate >= 80 ? '#10b981' : p.habit_rate >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                  {p.habit_rate}%
                </span>
                <span style={styles.prodCell}>{p.deep_work_min} min</span>
                <span style={styles.prodCell}>{p.total_planned_min} min</span>
              </div>
            ))}
          </div>
          <div style={styles.prodSummary}>
            <Sparkline data={productivity.map(p => p.habit_rate).reverse()} color="#2563eb" width={200} height={40} />
            <span style={styles.prodLabel}>Tendance taux habitudes (7 derniers jours)</span>
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <span style={styles.footerText}>Source: wambs-consulting.dashboard_analytics</span>
        <span style={styles.footerText}>Snapshot quotidien a 17:00 via n8n</span>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', margin: '4px 0 0' },
  badge: { background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12, letterSpacing: 1 },
  loading: { color: '#64748b', fontSize: 14 },
  tabBar: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab: {
    padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff',
    fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer', transition: 'all 0.15s',
  },
  tabActive: { background: '#2563eb', color: '#fff', borderColor: '#2563eb' },
  tabIcon: { fontWeight: 700, marginRight: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#1e293b', margin: '0 0 14px' },
  // Alerts
  alertList: { display: 'flex', flexDirection: 'column', gap: 10 },
  alertCard: {
    padding: '14px 18px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
    borderLeftWidth: 4, borderLeftStyle: 'solid',
  },
  alertHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  alertDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  alertName: { fontSize: 14, fontWeight: 600, color: '#1e293b', flex: 1 },
  alertBadge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 },
  alertBody: { display: 'flex', alignItems: 'baseline', gap: 8 },
  alertValue: { fontSize: 20, fontWeight: 700, color: '#1e293b' },
  alertUnit: { fontSize: 12, color: '#94a3b8' },
  alertPct: { fontSize: 12, color: '#64748b', marginLeft: 'auto' },
  // KPIs
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 },
  kpiCard: { padding: 16, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' },
  kpiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  kpiName: { fontSize: 13, fontWeight: 500, color: '#64748b' },
  kpiCurrent: { fontSize: 16, fontWeight: 700, color: '#1e293b' },
  kpiTarget: { fontSize: 11, color: '#94a3b8', marginTop: 6, display: 'block' },
  // Habits
  habitGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  habitCard: { padding: 14, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' },
  habitHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  habitName: { fontSize: 13, fontWeight: 500, color: '#1e293b' },
  habitRate: { fontSize: 15, fontWeight: 700 },
  // Productivity
  prodTable: { borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' },
  prodHeader: { display: 'flex', background: '#f1f5f9', padding: '10px 0' },
  prodRow: { display: 'flex', padding: '8px 0', borderTop: '1px solid #f1f5f9' },
  prodCell: { flex: 1, fontSize: 13, color: '#1e293b', padding: '0 14px' },
  prodSummary: { marginTop: 16, display: 'flex', alignItems: 'center', gap: 16 },
  prodLabel: { fontSize: 12, color: '#64748b' },
  // Progress bar
  progressBg: { height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 6 },
  progressFill: { height: 4, borderRadius: 2, transition: 'width 0.3s' },
  // Footer
  footer: { display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' },
  footerText: { fontSize: 11, color: '#94a3b8' },
};

export default HistoryPanel;
