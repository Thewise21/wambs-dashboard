import { useState } from 'react';

const defaultHabits = [
  { id: 1, name: 'Morning Routine (6h)', icon: '☀️', done: false, streak: 12 },
  { id: 2, name: 'Deep Work (3h min)', icon: '🎯', done: false, streak: 8 },
  { id: 3, name: 'Inbox Zero', icon: '📧', done: false, streak: 5 },
  { id: 4, name: 'Sport / Mouvement', icon: '💪', done: false, streak: 3 },
  { id: 5, name: 'Lecture (30 min)', icon: '📖', done: false, streak: 15 },
  { id: 6, name: 'Revue du soir', icon: '🌙', done: false, streak: 10 },
];

const timeBlocks = [
  { time: '03:30', task: 'Morning Routine — Réveil & Préparation', type: 'routine', duration: 45 },
  { time: '04:15', task: 'TaxDome + Emails (Inbox Zero)', type: 'admin', duration: 45 },
  { time: '05:00', task: 'Deep Work — Steuererklärungen', type: 'deep', duration: 120 },
  { time: '07:00', task: 'Message Reviews', type: 'admin', duration: 120 },
  { time: '09:00', task: 'Deep Work — ELSTER / Dossiers', type: 'deep', duration: 180 },
  { time: '12:00', task: 'Pause déjeuner', type: 'break', duration: 60 },
  { time: '13:00', task: 'Appels & Meetings mandants', type: 'meeting', duration: 120 },
  { time: '15:00', task: 'Admin & Facturation', type: 'admin', duration: 60 },
  { time: '16:00', task: 'Formation / Lecture pro', type: 'learning', duration: 45 },
  { time: '16:45', task: 'Revue du soir & Planification', type: 'routine', duration: 30 },
];

const typeColors = {
  routine: '#8b5cf6',
  admin: '#64748b',
  deep: '#2563eb',
  meeting: '#f59e0b',
  break: '#94a3b8',
  learning: '#10b981',
};

const today = new Date();
const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function DailySystem() {
  const [habits, setHabits] = useState(defaultHabits);
  const [note, setNote] = useState('');

  const toggleHabit = (id) => {
    setHabits(habits.map(h =>
      h.id === id ? { ...h, done: !h.done } : h
    ));
  };

  const completedCount = habits.filter(h => h.done).length;
  const dayProgress = Math.round((completedCount / habits.length) * 100);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Système Quotidien</h2>
          <p style={styles.subtitle}>
            {dayNames[today.getDay()]} {today.getDate()}/{today.getMonth() + 1}/{today.getFullYear()}
          </p>
        </div>
        <div style={styles.dayScore}>
          <div style={styles.scoreRing}>
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="24" cy="24" r="20" fill="none"
                stroke={dayProgress >= 80 ? '#10b981' : dayProgress >= 50 ? '#f59e0b' : '#2563eb'}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${(dayProgress / 100) * 125.6} 125.6`}
                transform="rotate(-90 24 24)" />
            </svg>
            <span style={styles.scoreNum}>{completedCount}/{habits.length}</span>
          </div>
        </div>
      </div>

      <div style={styles.twoCol}>
        {/* Left: Habits */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Habitudes du jour</h3>
          <div style={styles.habitList}>
            {habits.map(h => (
              <div key={h.id} style={{ ...styles.habitItem, opacity: h.done ? 0.6 : 1 }}
                onClick={() => toggleHabit(h.id)}>
                <div style={{ ...styles.checkbox, ...(h.done ? styles.checkboxDone : {}) }}>
                  {h.done && '✓'}
                </div>
                <span style={styles.habitIcon}>{h.icon}</span>
                <div style={styles.habitInfo}>
                  <span style={{ ...styles.habitName, textDecoration: h.done ? 'line-through' : 'none' }}>
                    {h.name}
                  </span>
                  <span style={styles.streak}>🔥 {h.streak}j</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.noteBox}>
            <h4 style={styles.noteLabel}>Note du jour</h4>
            <textarea
              style={styles.noteInput}
              rows={3}
              placeholder="Réflexions, wins, leçons..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Time Blocks */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Time Blocks</h3>
          <div style={styles.timeline}>
            {timeBlocks.map((block, i) => (
              <div key={i} style={styles.timeBlock}>
                <span style={styles.blockTime}>{block.time}</span>
                <div style={{
                  ...styles.blockBar,
                  borderLeft: `3px solid ${typeColors[block.type]}`,
                  background: `${typeColors[block.type]}08`,
                }}>
                  <span style={styles.blockTask}>{block.task}</span>
                  <span style={styles.blockDuration}>{block.duration} min</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.legend}>
            {Object.entries(typeColors).map(([type, color]) => (
              <span key={type} style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: color }} />
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', margin: '4px 0 0' },
  dayScore: { display: 'flex', alignItems: 'center', gap: 8 },
  scoreRing: { position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  scoreNum: { position: 'absolute', fontSize: 11, fontWeight: 700, color: '#1e293b' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  section: {},
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#1e293b', margin: '0 0 12px' },
  habitList: { display: 'flex', flexDirection: 'column', gap: 8 },
  habitItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
    background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, border: '2px solid #cbd5e1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  checkboxDone: { background: '#10b981', borderColor: '#10b981' },
  habitIcon: { fontSize: 18 },
  habitInfo: { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  habitName: { fontSize: 14, fontWeight: 500, color: '#1e293b' },
  streak: { fontSize: 12, color: '#94a3b8' },
  noteBox: { marginTop: 20 },
  noteLabel: { fontSize: 13, fontWeight: 600, color: '#64748b', margin: '0 0 8px' },
  noteInput: {
    width: '100%', padding: 12, border: '1px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
    background: '#fff', boxSizing: 'border-box',
  },
  timeline: { display: 'flex', flexDirection: 'column', gap: 6 },
  timeBlock: { display: 'flex', gap: 12, alignItems: 'stretch' },
  blockTime: { fontSize: 12, color: '#94a3b8', fontWeight: 500, width: 40, paddingTop: 8, flexShrink: 0 },
  blockBar: {
    flex: 1, padding: '8px 14px', borderRadius: '0 8px 8px 0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  blockTask: { fontSize: 13, fontWeight: 500, color: '#1e293b' },
  blockDuration: { fontSize: 11, color: '#94a3b8' },
  legend: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b', textTransform: 'capitalize' },
  legendDot: { width: 6, height: 6, borderRadius: '50%' },
};

export default DailySystem;
