import { useState, useEffect, useCallback } from 'react';
import { fetchObjectivesProgress } from '../services/bigqueryApi';
import useWindowSize from '../hooks/useWindowSize';

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

const ICON_PALETTE = [
  '📋', '💰', '📞', '✅', '📝', '🏦', '💼', '🎓', '🏠', '⚖️',
  '📱', '🔔', '⏰', '🗓️', '📌', '🎯', '💡', '🔑', '📧', '📊',
];

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

const defaultGoals = [
  { id: 1, title: 'Santé Nael-Nathan', category: 'Familiale', span: 'full', status: 'Non démarré', customColor: null, icon: null },
  { id: 2, title: 'Steuererklärungen Privat', category: 'Familiale', span: 'full', status: 'Non démarré', customColor: null, icon: null },
  { id: 3, title: 'Église 2x/mois', category: 'Sociale', span: 'weekends', weekendDays: [1, 2, 3, 4], status: 'Non démarré', customColor: null, icon: null },
  { id: 4, title: 'ARTS + NKeng', category: 'Sociale', span: 'full', status: 'Non démarré', customColor: null, icon: null },
  { id: 5, title: '15 RDV/semaine', category: 'Professionnel', span: 'weekdays', status: 'Non démarré', customColor: null, icon: null },
  { id: 6, title: '100 Déclarations', category: 'Professionnel', span: 'weekdays', status: 'En cours', customColor: null, icon: null },
  { id: 7, title: 'Business Plan', category: 'Professionnel', span: 'partial', startDay: 14, endDay: 30, status: 'En cours', customColor: null, icon: null },
  { id: 8, title: '50 Comptabilités', category: 'Professionnel', span: 'partial', startDay: 7, endDay: 25, status: 'Non démarré', customColor: null, icon: null },
  { id: 9, title: 'Coordination Team', category: 'Professionnel', span: 'weekdays', status: 'Non démarré', customColor: null, icon: null },
  { id: 16, title: 'Recouvrement 36.850€', category: 'Financier', span: 'full', status: 'En cours', customColor: null, icon: null },
  { id: 18, title: 'Facturation 15.000€', category: 'Financier', span: 'partial', startDay: 1, endDay: 20, status: 'Non démarré', customColor: null, icon: null },
  { id: 20, title: '60 RDV Beratung', category: 'Financier', span: 'weekdays', status: 'Non démarré', customColor: null, icon: null },
];

function getGoalColor(goal) {
  return goal.customColor || categoryColors[goal.category] || '#94a3b8';
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekNumber(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [goals, setGoals] = useState(defaultGoals);
  const [viewMode, setViewMode] = useState('month');
  const [hoveredGoal, setHoveredGoal] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date(2026, 3, 1)));
  const { isMobile, isTablet } = useWindowSize();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  // Escape key closes fullscreen / popups
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (editingGoal) setEditingGoal(null);
      else if (selectedDay !== null) setSelectedDay(null);
      else if (isExpanded) setIsExpanded(false);
    }
  }, [isExpanded, selectedDay, editingGoal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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

  let startDow = firstDayOfMonth.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

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
  const goToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setCurrentWeekStart(getMonday(today));
  };

  // Week navigation
  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };
  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  // Sync month↔week when switching views
  const switchView = (v) => {
    if (v === 'week' && viewMode === 'month') {
      setCurrentWeekStart(getMonday(new Date(year, month, Math.min(today.getDate(), daysInMonth))));
    }
    setViewMode(v);
  };

  // Goal customization
  const updateGoal = (goalId, updates) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g));
  };

  // Category stats
  const catStats = {};
  Object.keys(categoryColors).forEach(c => {
    catStats[c] = goals.filter(g => g.category === c).length;
  });

  // Week view data
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }
  const weekNum = getWeekNumber(currentWeekStart);
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Responsive bar/cell sizing
  const barHeight = isExpanded ? 18 : (isTablet ? 8 : 12);
  const cellMinHeight = isExpanded ? 140 : (isMobile ? 52 : isTablet ? 80 : 100);
  const maxVisible = isExpanded ? 6 : (isMobile ? 0 : isTablet ? 5 : 4);
  const barFontSize = isExpanded ? 9 : 7;

  const containerStyle = isExpanded ? {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: '#f8fafc', padding: isMobile ? 8 : 24, overflow: 'auto',
  } : { padding: 0 };

  return (
    <div style={containerStyle}>
      {/* ─── Header ─── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, flexWrap: 'wrap' }}>
          {viewMode === 'month' ? (
            <>
              <button style={s.navBtn} onClick={prevMonth}>◀</button>
              <h2 style={{ ...s.title, fontSize: isMobile ? 16 : 22, minWidth: isMobile ? 140 : 200 }}>
                {MONTH_NAMES[month]} {year}
              </h2>
              <button style={s.navBtn} onClick={nextMonth}>▶</button>
            </>
          ) : (
            <>
              <button style={s.navBtn} onClick={prevWeek}>◀</button>
              <h2 style={{ ...s.title, fontSize: isMobile ? 14 : 22, minWidth: isMobile ? 'auto' : 280 }}>
                Semaine {weekNum} — {currentWeekStart.getDate()} {MONTH_NAMES[currentWeekStart.getMonth()].slice(0, 3)}–{weekEnd.getDate()} {MONTH_NAMES[weekEnd.getMonth()].slice(0, 3)}
              </h2>
              <button style={s.navBtn} onClick={nextWeek}>▶</button>
            </>
          )}
          <button style={s.todayBtn} onClick={goToday}>Aujourd'hui</button>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {['month', 'week'].map(v => (
            <button
              key={v}
              onClick={() => switchView(v)}
              style={{ ...s.viewBtn, ...(viewMode === v ? s.viewBtnActive : {}) }}
            >
              {v === 'month' ? 'Mois' : 'Semaine'}
            </button>
          ))}
          {/* Fullscreen toggle (hidden on mobile) */}
          {!isMobile && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ ...s.navBtn, marginLeft: 8, fontSize: 16 }}
              title={isExpanded ? 'Quitter plein écran' : 'Plein écran'}
            >
              {isExpanded ? '✕' : '⛶'}
            </button>
          )}
        </div>
      </div>

      {/* ─── Legend ─── */}
      <div style={{
        display: 'flex', gap: isMobile ? 8 : 16, alignItems: 'center',
        marginBottom: 16, padding: isMobile ? '8px 10px' : '10px 16px',
        background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
        overflowX: isMobile ? 'auto' : 'visible', whiteSpace: 'nowrap',
      }}>
        {Object.entries(categoryColors).map(([cat, color]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ fontSize: isMobile ? 10 : 12, color: '#475569' }}>{cat}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{catStats[cat]}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{goals.length} objectifs</span>
      </div>

      {/* ─── MONTH VIEW ─── */}
      {viewMode === 'month' && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2,
          marginBottom: isExpanded ? 0 : 24,
        }}>
          {/* Day headers */}
          {DAYS.map(d => (
            <div key={d} style={s.dayHeader}>{isMobile ? d[0] : d}</div>
          ))}

          {/* Cells */}
          {cells.map((cell, idx) => {
            const dayOfWeek = idx % 7;
            const dayGoals = cell.inMonth ? getGoalsForDay(cell.dayNum, dayOfWeek) : [];

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isMobile && cell.inMonth && dayGoals.length > 0) {
                    setSelectedDay({ dayNum: cell.dayNum, dayOfWeek, goals: dayGoals });
                  }
                }}
                style={{
                  background: cell.isWeekend && cell.inMonth ? '#fafbfc' : '#fff',
                  border: cell.isToday ? '2px solid #2563eb' : '1px solid #f1f5f9',
                  boxShadow: cell.isToday ? '0 0 0 1px #2563eb20' : 'none',
                  borderRadius: 4,
                  minHeight: cellMinHeight,
                  padding: isMobile ? 2 : 4,
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: cell.inMonth ? 1 : 0.4,
                  cursor: isMobile && cell.inMonth && dayGoals.length > 0 ? 'pointer' : 'default',
                  transition: 'box-shadow 0.15s',
                }}
              >
                {cell.inMonth && (
                  <>
                    <div style={{
                      fontSize: isMobile ? 9 : 11, color: '#94a3b8', marginBottom: isMobile ? 1 : 3, fontWeight: 500,
                      ...(cell.isToday ? {
                        background: '#2563eb', color: '#fff', borderRadius: '50%',
                        width: isMobile ? 16 : 20, height: isMobile ? 16 : 20,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: isMobile ? 8 : 10,
                      } : {}),
                    }}>
                      {cell.dayNum}
                    </div>

                    {/* MOBILE: colored dots */}
                    {isMobile && (
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 2, padding: '0 2px',
                      }}>
                        {dayGoals.slice(0, 4).map(g => (
                          <div key={g.id} style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: getGoalColor(g),
                            opacity: hoveredGoal && hoveredGoal !== g.id ? 0.3 : 1,
                          }} />
                        ))}
                        {dayGoals.length > 4 && (
                          <span style={{ fontSize: 6, color: '#94a3b8' }}>+{dayGoals.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* TABLET: thin bars, no labels */}
                    {isTablet && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {dayGoals.slice(0, maxVisible).map(g => (
                          <div
                            key={g.id}
                            style={{
                              height: barHeight, borderRadius: 2,
                              background: getGoalColor(g),
                              opacity: hoveredGoal && hoveredGoal !== g.id ? 0.3 : 1,
                              transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={() => setHoveredGoal(g.id)}
                            onMouseLeave={() => setHoveredGoal(null)}
                            title={`${g.icon ? g.icon + ' ' : ''}${g.title} (${g.status})`}
                          />
                        ))}
                        {dayGoals.length > maxVisible && (
                          <div style={{ fontSize: 7, color: '#94a3b8', textAlign: 'center' }}>
                            +{dayGoals.length - maxVisible}
                          </div>
                        )}
                      </div>
                    )}

                    {/* DESKTOP / EXPANDED: full bars with labels */}
                    {!isMobile && !isTablet && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {dayGoals.slice(0, maxVisible).map(g => (
                          <div
                            key={g.id}
                            style={{
                              height: barHeight, borderRadius: 3, padding: '0 4px',
                              cursor: 'pointer', display: 'flex', alignItems: 'center',
                              background: getGoalColor(g),
                              opacity: hoveredGoal && hoveredGoal !== g.id ? 0.3 : 1,
                              transition: 'opacity 0.15s, transform 0.1s',
                            }}
                            onMouseEnter={() => setHoveredGoal(g.id)}
                            onMouseLeave={() => setHoveredGoal(null)}
                            title={`${g.icon ? g.icon + ' ' : ''}${g.title} (${g.status})`}
                          >
                            <span style={{
                              fontSize: barFontSize, color: '#fff',
                              whiteSpace: 'nowrap', overflow: 'hidden',
                              textOverflow: 'ellipsis', lineHeight: 1,
                            }}>
                              {g.icon ? `${g.icon} ` : ''}{g.title}
                            </span>
                          </div>
                        ))}
                        {dayGoals.length > maxVisible && (
                          <div style={{ fontSize: 8, color: '#94a3b8', textAlign: 'center', marginTop: 1 }}>
                            +{dayGoals.length - maxVisible} more
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── WEEK VIEW ─── */}
      {viewMode === 'week' && (
        <div style={{
          display: isMobile ? 'flex' : 'grid',
          gridTemplateColumns: isMobile ? undefined : 'repeat(7, 1fr)',
          flexDirection: isMobile ? 'column' : undefined,
          gap: isMobile ? 8 : 4,
          marginBottom: isExpanded ? 0 : 24,
        }}>
          {weekDays.map((wd, i) => {
            const dayNum = wd.getDate();
            const wdMonth = wd.getMonth();
            const wdYear = wd.getFullYear();
            const wdDaysInMonth = new Date(wdYear, wdMonth + 1, 0).getDate();
            const isWdToday = dayNum === today.getDate() && wdMonth === today.getMonth() && wdYear === today.getFullYear();
            const isWeekend = i >= 5;

            // Get goals for this day
            const dayGoals = goals.filter(g => {
              if (g.span === 'full') return true;
              if (g.span === 'weekdays') return !isWeekend;
              if (g.span === 'weekends') return isWeekend;
              if (g.span === 'partial') return dayNum >= (g.startDay || 1) && dayNum <= (g.endDay || wdDaysInMonth);
              return true;
            });

            return (
              <div key={i} style={{
                background: '#fff', borderRadius: 8,
                border: isWdToday ? '2px solid #2563eb' : '1px solid #e2e8f0',
                padding: isMobile ? 10 : 8,
                minHeight: isMobile ? 'auto' : (isExpanded ? 400 : 300),
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Day header */}
                <div style={{
                  textAlign: 'center', marginBottom: 8,
                  paddingBottom: 6, borderBottom: '1px solid #f1f5f9',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    {DAYS[i]}
                  </div>
                  <div style={{
                    fontSize: 20, fontWeight: 700,
                    color: isWdToday ? '#2563eb' : '#1e293b',
                    ...(isWdToday ? {
                      background: '#2563eb', color: '#fff', borderRadius: '50%',
                      width: 32, height: 32, display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                    } : {}),
                  }}>
                    {dayNum}
                  </div>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>
                    {MONTH_NAMES[wdMonth].slice(0, 3)}
                  </div>
                </div>

                {/* Goal cards */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'auto' }}>
                  {dayGoals.map(g => {
                    const color = getGoalColor(g);
                    return (
                      <div
                        key={g.id}
                        style={{
                          background: `${color}10`,
                          borderLeft: `3px solid ${color}`,
                          borderRadius: 6, padding: '6px 8px',
                          cursor: 'pointer',
                          opacity: hoveredGoal && hoveredGoal !== g.id ? 0.4 : 1,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={() => setHoveredGoal(g.id)}
                        onMouseLeave={() => setHoveredGoal(null)}
                        onClick={() => setEditingGoal(g.id)}
                      >
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                          {g.icon ? `${g.icon} ` : ''}{g.title}
                        </div>
                        <span style={{
                          fontSize: 8, fontWeight: 600, padding: '1px 5px',
                          borderRadius: 4,
                          background: g.status === 'En cours' ? '#dbeafe' : g.status === 'Terminé' ? '#d1fae5' : '#f1f5f9',
                          color: g.status === 'En cours' ? '#2563eb' : g.status === 'Terminé' ? '#10b981' : '#94a3b8',
                        }}>
                          {g.status}
                        </span>
                      </div>
                    );
                  })}
                  {dayGoals.length === 0 && (
                    <div style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', padding: 16 }}>
                      Aucun objectif
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Goal List (hidden in expanded mode) ─── */}
      {!isExpanded && (
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
            Objectifs actifs ce mois
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 8,
          }}>
            {goals.map(g => {
              const color = getGoalColor(g);
              const isHovered = hoveredGoal === g.id;
              return (
                <div
                  key={g.id}
                  style={{
                    background: isHovered ? '#f0f9ff' : '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '10px 12px',
                    borderLeft: `4px solid ${color}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    transform: isHovered ? 'translateX(4px)' : 'none',
                  }}
                  onMouseEnter={() => setHoveredGoal(g.id)}
                  onMouseLeave={() => setHoveredGoal(null)}
                  onClick={() => setEditingGoal(g.id)}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 4,
                  }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: '2px 6px',
                      borderRadius: 4, background: `${color}15`, color,
                    }}>{g.category}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 600,
                      color: g.status === 'En cours' ? '#2563eb' : g.status === 'Terminé' ? '#10b981' : '#94a3b8',
                    }}>{g.status}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: 2 }}>
                    {g.icon ? `${g.icon} ` : ''}{g.title}
                  </span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>
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
      )}

      {/* ─── Mobile Bottom Sheet ─── */}
      {isMobile && selectedDay && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 1001, transition: 'opacity 0.2s',
            }}
            onClick={() => setSelectedDay(null)}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff', borderRadius: '16px 16px 0 0',
            padding: '16px 16px 24px', zIndex: 1002,
            maxHeight: '60vh', overflow: 'auto',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          }}>
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: '#e2e8f0', margin: '0 auto 12px',
            }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
              {selectedDay.dayNum} {MONTH_NAMES[month]} {year}
            </h3>
            {selectedDay.goals.map(g => {
              const color = getGoalColor(g);
              return (
                <div key={g.id} style={{
                  borderLeft: `4px solid ${color}`,
                  background: `${color}08`,
                  borderRadius: 8, padding: '10px 12px', marginBottom: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {g.icon ? `${g.icon} ` : ''}{g.title}
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginTop: 4,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 6px',
                      borderRadius: 4, background: `${color}15`, color,
                    }}>{g.category}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: g.status === 'En cours' ? '#2563eb' : g.status === 'Terminé' ? '#10b981' : '#94a3b8',
                    }}>{g.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ─── Goal Customization Popup ─── */}
      {editingGoal && (() => {
        const goal = goals.find(g => g.id === editingGoal);
        if (!goal) return null;
        const color = getGoalColor(goal);
        return (
          <>
            <div
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
                zIndex: 2000,
              }}
              onClick={() => setEditingGoal(null)}
            />
            <div style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff', borderRadius: 16,
              padding: 24, zIndex: 2001,
              width: isMobile ? 'calc(100% - 32px)' : 360,
              maxHeight: '80vh', overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 16,
              }}>
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 6px',
                    borderRadius: 4, background: `${color}15`, color,
                    display: 'inline-block', marginBottom: 6,
                  }}>{goal.category}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    {goal.icon ? `${goal.icon} ` : ''}{goal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingGoal(null)}
                  style={{
                    background: 'none', border: 'none', fontSize: 18,
                    cursor: 'pointer', color: '#94a3b8', padding: '0 4px',
                  }}
                >✕</button>
              </div>

              {/* Color picker */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Couleur
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {COLOR_PALETTE.map(c => (
                    <button
                      key={c}
                      onClick={() => updateGoal(goal.id, { customColor: c })}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: c, border: goal.customColor === c ? '3px solid #1e293b' : '2px solid transparent',
                        cursor: 'pointer', transition: 'transform 0.1s',
                        transform: goal.customColor === c ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon picker */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Icône
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
                  {ICON_PALETTE.map(ic => (
                    <button
                      key={ic}
                      onClick={() => updateGoal(goal.id, { icon: ic })}
                      style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: goal.icon === ic ? '#e0f2fe' : '#f8fafc',
                        border: goal.icon === ic ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        fontSize: 16, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.1s',
                        transform: goal.icon === ic ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >{ic}</button>
                  ))}
                </div>
              </div>

              {/* Reset button */}
              <button
                onClick={() => updateGoal(goal.id, { customColor: null, icon: null })}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 8,
                  background: '#f1f5f9', border: '1px solid #e2e8f0',
                  fontSize: 12, fontWeight: 600, color: '#64748b',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Réinitialiser
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
}

const s = {
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
  dayHeader: {
    textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8',
    padding: '8px 0', textTransform: 'uppercase',
  },
};

export default CalendarView;
