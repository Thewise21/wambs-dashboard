import { useState, useEffect } from 'react';
import { fetchTodayKpis, fetchKpiTrend } from '../services/bigqueryApi';

const initialKPIs = [
  { id: 1, label: 'Mandants actifs', value: 72, target: 100, format: 'number', trend: [65, 68, 70, 71, 72] },
  { id: 2, label: 'CA Mensuel', value: 38450, target: 45000, format: 'currency', trend: [32000, 35000, 36500, 38000, 38450] },
  { id: 3, label: 'Dossiers terminés', value: 38, target: 50, format: 'number', trend: [20, 25, 30, 34, 38] },
  { id: 4, label: 'Heures facturables', value: 128, target: 160, format: 'hours', trend: [110, 118, 122, 125, 128] },
  { id: 5, label: 'Taux satisfaction', value: 4.6, target: 5, format: 'rating', trend: [4.2, 4.3, 4.5, 4.5, 4.6] },
  { id: 6, label: 'Délai moyen', value: 8, target: 5, format: 'days', trend: [14, 12, 10, 9, 8], inverse: true },
];

const formatValue = (value, format) => {
  switch (format) {
    case 'currency': return `€${value.toLocaleString()}`;
    case 'hours': return `${value}h`;
    case 'rating': return `${value}/5`;
    case 'days': return `${value}j`;
    default: return value;
  }
};

function MiniSparkline({ data, color, width = 80, height = 28 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const unitFormatMap = {
  'EUR': 'currency', 'mandants': 'number', 'declarations': 'number',
  'pct': 'rating', 'tasks': 'number', 'messages': 'number', 'objectifs': 'number',
};

function KPIBoard() {
  const [kpis, setKpis] = useState(initialKPIs);
  const [view, setView] = useState('grid');

  useEffect(() => {
    Promise.all([fetchTodayKpis(), fetchKpiTrend(3)]).then(([todayKpis, trendData]) => {
      if (todayKpis && todayKpis.length > 0) {
        const liveKpis = todayKpis.map((k, i) => {
          const trendValues = trendData
            ? trendData.filter(t => t.kpi_name === k.kpi_name).map(t => t.avg_value).reverse()
            : [];
          if (trendValues.length > 0 && !trendValues.includes(k.kpi_value)) trendValues.push(k.kpi_value);
          return {
            id: i + 1,
            label: k.kpi_name,
            value: k.kpi_value,
            target: k.pct_of_target ? Math.round(k.kpi_value / (k.pct_of_target / 100)) : 0,
            format: unitFormatMap[k.unit] || 'number',
            trend: trendValues.length >= 2 ? trendValues : [k.kpi_value * 0.8, k.kpi_value * 0.9, k.kpi_value],
            inverse: k.kpi_name.includes('Délai') || k.kpi_name.includes('Inbox'),
          };
        });
        setKpis(liveKpis);
      }
    }).catch(() => {});
  }, []);

  const overallScore = Math.round(
    kpis.reduce((acc, k) => {
      const pct = k.inverse
        ? Math.min((k.target / k.value) * 100, 100)
        : Math.min((k.value / k.target) * 100, 100);
      return acc + pct;
    }, 0) / kpis.length
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>KPI Board</h2>
          <p style={styles.subtitle}>Performance globale</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.scoreCircle}>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" fill="none"
                stroke={overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 150.8} 150.8`}
                transform="rotate(-90 28 28)" />
            </svg>
            <span style={styles.scoreText}>{overallScore}%</span>
          </div>
          <div style={styles.viewToggle}>
            <button style={{ ...styles.viewBtn, ...(view === 'grid' ? styles.viewBtnActive : {}) }}
              onClick={() => setView('grid')}>&#9638;</button>
            <button style={{ ...styles.viewBtn, ...(view === 'list' ? styles.viewBtnActive : {}) }}
              onClick={() => setView('list')}>&#9776;</button>
          </div>
        </div>
      </div>

      <div style={view === 'grid' ? styles.grid : styles.list}>
        {kpis.map(kpi => {
          const pct = kpi.inverse
            ? Math.round(Math.min((kpi.target / kpi.value) * 100, 100))
            : Math.round(Math.min((kpi.value / kpi.target) * 100, 100));
          const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
          const prevValue = kpi.trend[kpi.trend.length - 2];
          const diff = kpi.value - prevValue;
          const diffPct = prevValue ? ((diff / prevValue) * 100).toFixed(1) : 0;
          const isUp = kpi.inverse ? diff <= 0 : diff >= 0;

          return (
            <div key={kpi.id} style={view === 'grid' ? styles.card : styles.listItem}>
              <div style={styles.cardHeader}>
                <span style={styles.label}>{kpi.label}</span>
                <span style={{ ...styles.statusDot, background: color }} />
              </div>
              <div style={styles.valueRow}>
                <span style={styles.value}>{formatValue(kpi.value, kpi.format)}</span>
                <MiniSparkline data={kpi.trend} color={color} />
              </div>
              <div style={styles.targetRow}>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${pct}%`, background: color }} />
                </div>
              </div>
              <div style={styles.cardFooter}>
                <span style={styles.targetText}>Cible: {formatValue(kpi.target, kpi.format)}</span>
                <span style={{ ...styles.trend, color: isUp ? '#10b981' : '#ef4444' }}>
                  {isUp ? '↑' : '↓'} {Math.abs(diffPct)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', margin: '4px 0 0' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  scoreCircle: { position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  scoreText: { position: 'absolute', fontSize: 14, fontWeight: 700, color: '#1e293b' },
  viewToggle: { display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 2 },
  viewBtn: {
    background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer',
    borderRadius: 6, fontSize: 16, color: '#94a3b8',
  },
  viewBtnActive: { background: '#fff', color: '#1e293b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: '#fff', borderRadius: 12, padding: 20,
    border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12,
  },
  listItem: {
    background: '#fff', borderRadius: 12, padding: '16px 20px',
    border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8,
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: 500, color: '#64748b' },
  statusDot: { width: 8, height: 8, borderRadius: '50%' },
  valueRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  value: { fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 },
  targetRow: { display: 'flex', alignItems: 'center', gap: 8 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, background: '#f1f5f9' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s ease' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  targetText: { fontSize: 12, color: '#94a3b8' },
  trend: { fontSize: 12, fontWeight: 600 },
};

export default KPIBoard;
