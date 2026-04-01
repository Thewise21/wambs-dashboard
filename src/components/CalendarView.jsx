import { useState, useEffect } from 'react';
import { fetchObjectivesProgress } from '../services/bigqueryApi';

const categoryColors = {
  Familiale: '#ec4899',
  Sociale: '#8b5cf6',
  Professionnel: '#2563eb',
  Financier: '#10b981',
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// Default goals with scheduling info for calendar display
const defaultGoals = [
  { id: 1, title: 'Santé Nael-Nathan', category: 'Familiale', span: 'full', status: 'Non démarré' },
  { id: 2, title: 'Steuererklärungen Privat', category: 'Familiale', span: 'full', status: 'Non démarré' },
  { id: 3, title: 'Église 2x/mois', category: 'Sociale', span: 'weekends', weekendDays: [1, 2, 3, 4], status: 'Non démarré' },
  { id: 4, title: 'ARTS + NKeng', category: 'Sociale', span: 'full', status: 'Non démarré' },
  { id: 5, title: '15 RDV/semaine', category: 'Professionnel', span: 'weekdays', status: 'Non démarré' },
  { id: 6, title: '100 Déclarations', category: 'Professionnel', span: 'weekdays', status: 'En cours' },
  { id: 7, title: 'Business Plan', category: 'Professionnel', span: 'partial', startDay: 14, endDay: 30, status: 'En cours' },
  { id: 8, title: '50 Comptabilités', category: 'Professionnel', span: 'partial', startDay: 7, endDay: 25, status: 'Non démarré' },
  { id: 9, title: 'Coordination Team', category: 'Professionnel', span: 'weekdays', status: 'Non démarré' },
  { id: 16, title: 'Recouvrement 36.850€', category: 'Financier', span: 'full', status: 'En cours' },
  { id: 18, title: 'Facturation 15.000€', category: 'Financier', span: 'partial', startDay: 1, endDay: 20, status: 'Non démarré' },
  { id: 20, title: '60 RDV Beratung', category: 'Financier', span: 'weekdays', status: 'Non démarré' },
];

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [goals, setGoals] = useState(defaultGoals);
  const [viewMode, setViewMode] = useState('month'); // month | week
  const [hoveredGoal, setHoveredGoal] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  // Fetch live data from BigQuery
  useEffect(() => {
    fetchObjectivesProgress().then(data => {
      if (data && data.length > 0) {
        const merged = defaultGoals.map(dg => {
          const live = data.find(d => d.objective_id === dg.id);
          if (live) {
            return { ...dg, title: live.objective_name, status: live.status, category: live.category };
          }
          return dg;
        });
        setGoals(merged);
      }
    }).catch(() => {});
  }, []);

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // getDay() returns 0=Sun, we want 0=Mon
  let startDow = firstDayOfMonth.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

  // Build cell array
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startDow + 1;
    cells.push({
      dayNum,
      inMonth: dayNum >= 1 && dayNum <= daysInMonth,
      isToday: dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
      isWeekend: (i % 7) >= 5,
    });
  }

  // Which goals appear on which day
  function getGoalsForDay(dayNum, dayOfWeek) {
    if (dayNum < 1 || dayNum > daysInMonth) return [];
    return goals.filter(g => {
      if (g.span === 'full') return true;
      if (g.span === 'weekdays') return dayOfWeek < 5;
      if (g.span === 'weekends') return dayOfWeek >= 5;
      if (g.span === 'partial') return dayNum >= (g.startDay || 1) && dayNum <= (g.endDay || daysInMonth);
      return true;
    });
  }

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  // Category stats
  const catStats = {};
  Object.keys(categoryColors).forEach(c => {
    catStats[c] = goals.filter(g => g.category === c).length;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.navBtn} onClick={prevMonth}>◀</button>
          <h2 style={styles.title}>{MONTH_NAMES[month]} {year}</h2>
          <button style={styles.navBtn} onClick={nextMonth}>▶</button>
          <button style={styles.todayBtn} onClick={goToday}>Aujourd'hui</button>
        </div>
        <div style={styles.headerRight}>
          {['month', 'week'].map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              style={{
                ...styles.viewBtn,
                ...(viewMode === v ? styles.viewBtnActive : {}),
              }}
            >
              {v === 'month' ? 'Mois' : 'Semaine'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {Object.entries(categoryColors).map(([cat, color]) => (
          <div key={cat} style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: color }} />
            <span style={styles.legendLabel}>{cat}</span>
            <span style={styles.legendCount}>{catStats[cat]}</span>
          </div>
        ))}
        <div style={styles.legendSpacer} />
        <span style={styles.legendTotal}>{goals.length} objectifs</span>
      </div>

      {/* Calendar Grid */}
      <div style={styles.grid}>
        {/* Day headers */}
        {DAYS.map(d => (
          <div key={d} style={styles.dayHeader}>{d}</div>
        ))}

        {/* Cells */}
        {cells.map((cell, idx) => {
          const dayOfWeek = idx % 7;
          const dayGoals = cell.inMonth ? getGoalsForDay(cell.dayNum, dayOfWeek) : [];
          const maxVisible = 4;
          const overflow = dayGoals.length > maxVisible;

          return (
            <div
              key={idx}
              style={{
                ...styles.cell,
                ...(cell.isWeekend && cell.inMonth ? styles.cellWeekend : {}),
                ...(!cell.inMonth ? styles.cellOutside : {}),
                ...(cell.isToday ? styles.cellToday : {}),
              }}
            >
              {cell.inMonth && (
                <>
                  <div style={{
                    ...styles.dayNum,
                    ...(cell.isToday ? styles.dayNumToday : {}),
                  }}>
                    {cell.dayNum}
                  </div>
                  <div style={styles.barsContainer}>
                    {dayGoals.slice(0, maxVisible).map(g => (
                      <div
                        key={g.id}
                        style={{
                          ...styles.bar,
                          background: categoryColors[g.category] || '#94a3b8',
                          opacity: hoveredGoal && hoveredGoal !== g.id ? 0.3 : 1,
                        }}
                        onMouseEnter={() => setHoveredGoal(g.id)}
                        onMouseLeave={() => setHoveredGoal(null)}
                        title={`${g.title} (${g.status})`}
                      >
                        <span style={styles.barLabel}>{g.title}</span>
                      </div>
                    ))}
                    {overflow && (
                      <div style={styles.overflowLabel}>+{dayGoals.length - maxVisible} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Goal list sidebar */}
      <div style={styles.goalListSection}>
        <h3 style={styles.goalListTitle}>Objectifs actifs ce mois</h3>
        <div style={styles.goalList}>
          {goals.map(g => {
            const color = categoryColors[g.category] || '#94a3b8';
            const isHovered = hoveredGoal === g.id;
            return (
              <div
                key={g.id}
                style={{
                  ...styles.goalCard,
                  borderLeftColor: color,
                  background: isHovered ? '#f0f9ff' : '#fff',
                  transform: isHovered ? 'translateX(4px)' : 'none',
                }}
                onMouseEnter={() => setHoveredGoal(g.id)}
                onMouseLeave={() => setHoveredGoal(null)}
              >
                <div style={styles.goalCardTop}>
                  <span style={{ ...styles.goalBadge, background: `${color}15`, color }}>{g.category}</span>
                  <span style={{
                    ...styles.goalStatus,
                    color: g.status === 'En cours' ? '#2563eb' : g.status === 'Terminé' ? '#10b981' : '#94a3b8',
                  }}>{g.status}</span>
                </div>
                <span style={styles.goalName}>{g.title}</span>
                <span style={styles.goalSpan}>
                  {g.span === 'full' ? 'Tout le mois' :
                   g.span === 'weekdays' ? 'Lun–Ven' :
                   g.span === 'weekends' ? 'Week-ends' :
                   `Jour ${g.startDay}–${g.endDay}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 0 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerRight: { display: 'flex', gap: 4 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0, minWidth: 200 },
  navBtn: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '6px 12px', fontSize: 14, cursor: 'pointer', color: '#475569',
    fontFamily: 'inherit',
  },
  todayBtn: {
    background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
    padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  viewBtn: {
    background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6,
    padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: '#64748b',
    fontFamily: 'inherit', fontWeight: 500,
  },
  viewBtnActive: { background: '#2563eb', color: '#fff', borderColor: '#2563eb' },

  legend: {
    display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16,
    padding: '10px 16px', background: '#fff', borderRadius: 10,
    border: '1px solid #e2e8f0',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { fontSize: 12, color: '#475569' },
  legendCount: { fontSize: 11, fontWeight: 700, color: '#1e293b' },
  legendSpacer: { flex: 1 },
  legendTotal: { fontSize: 12, color: '#94a3b8', fontWeight: 600 },

  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2,
    marginBottom: 24,
  },
  dayHeader: {
    textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8',
    padding: '8px 0', textTransform: 'uppercase',
  },
  cell: {
    background: '#fff', border: '1px solid #f1f5f9', borderRadius: 4,
    minHeight: 100, padding: 4, position: 'relative', overflow: 'hidden',
    transition: 'box-shadow 0.15s',
  },
  cellWeekend: { background: '#fafbfc' },
  cellOutside: { background: '#f8fafc', opacity: 0.4 },
  cellToday: { border: '2px solid #2563eb', boxShadow: '0 0 0 1px #2563eb20' },
  dayNum: {
    fontSize: 11, color: '#94a3b8', marginBottom: 3, fontWeight: 500,
  },
  dayNumToday: {
    background: '#2563eb', color: '#fff', borderRadius: '50%',
    width: 20, height: 20, display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 700, fontSize: 10,
  },
  barsContainer: { display: 'flex', flexDirection: 'column', gap: 1 },
  bar: {
    height: 12, borderRadius: 3, padding: '0 4px', cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
    display: 'flex', alignItems: 'center',
  },
  barLabel: {
    fontSize: 7, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden',
    textOverflow: 'ellipsis', lineHeight: 1,
  },
  overflowLabel: {
    fontSize: 8, color: '#94a3b8', textAlign: 'center', marginTop: 1,
  },

  goalListSection: { marginTop: 8 },
  goalListTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12 },
  goalList: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 8,
  },
  goalCard: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '10px 12px', borderLeft: '4px solid', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  goalCardTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  goalBadge: { fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4 },
  goalStatus: { fontSize: 9, fontWeight: 600 },
  goalName: { fontSize: 12, fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: 2 },
  goalSpan: { fontSize: 10, color: '#94a3b8' },
};

export default CalendarView;
