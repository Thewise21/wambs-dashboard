import { useState, useEffect } from 'react';
import { fetchObjectivesProgress, updateObjective } from '../services/bigqueryApi';

const statuses = ['Non démarré', 'En cours', 'Avancé', 'Terminé'];
const statusColors = {
  'Non démarré': '#94a3b8',
  'En cours': '#2563eb',
  'Avancé': '#f59e0b',
  'Terminé': '#10b981',
};

const categoryColors = {
  Familiale: '#ec4899',
  Sociale: '#8b5cf6',
  Professionnel: '#2563eb',
  Financier: '#10b981',
};

const initialGoals = [
  // ── Familiale ──
  { id: 1, title: 'Santé Nael-Nathan + Rendez-vous', target: 100, current: 0, unit: '%', category: 'Familiale', status: 'Non démarré',
    subtasks: [
      { text: 'RDV médecin Nael-Nathan', done: false },
      { text: 'Suivi santé régulier', done: false },
    ]},
  { id: 2, title: 'Steuererklärungen Privat (Poclaire + Familie)', target: 100, current: 0, unit: '%', category: 'Familiale', status: 'Non démarré',
    subtasks: [
      { text: 'ESt Poclaire 2024+2025', done: false },
      { text: 'ESt Familie abschließen', done: false },
    ]},

  // ── Sociale ──
  { id: 3, title: 'Église 2x/mois', target: 8, current: 0, unit: 'visites', category: 'Sociale', status: 'Non démarré',
    subtasks: [
      { text: 'Planifier les dimanches', done: false },
    ]},
  { id: 4, title: 'ARTS + NKeng (3h/semaine)', target: 12, current: 0, unit: 'heures', category: 'Sociale', status: 'Non démarré',
    subtasks: [
      { text: 'ARTS: réunions mensuelles', done: false },
      { text: 'NKeng e.V.: tâches associatives', done: false },
    ]},

  // ── Professionnel ──
  { id: 5, title: '15 RDV/semaine (60/mois)', target: 60, current: 0, unit: 'RDV', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'Semaine 1: 15 RDV', done: false },
      { text: 'Semaine 2: 15 RDV', done: false },
      { text: 'Semaine 3: 15 RDV', done: false },
      { text: 'Semaine 4: 15 RDV', done: false },
    ]},
  { id: 6, title: '100 Déclarations fiscales', target: 100, current: 0, unit: 'déclarations', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'ESt 2024 batch (top mandants)', done: false },
      { text: 'ESt 2023 Nachträge', done: false },
      { text: 'ELSTER Entwürfe prüfen + übermitteln', done: false },
    ]},
  { id: 7, title: 'Business Plan WAMBS + P.A.G Services', target: 100, current: 0, unit: '%', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'Business Plan für Banken/Investoren', done: false },
      { text: 'P.A.G Services Konzept finalisieren', done: false },
    ]},
  { id: 8, title: '50 Comptabilités', target: 50, current: 0, unit: 'comptabilités', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'FiBu 2023-2025 alle Mandanten', done: false },
      { text: 'USt-VA Rückstände aufarbeiten', done: false },
      { text: 'EÜR 2024 fertigstellen', done: false },
    ]},
  { id: 9, title: 'Coordination Team (Fikret, Laura, Leonel)', target: 100, current: 0, unit: '%', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'Fikret: Sachbearbeiter Aufgaben verteilen', done: false },
      { text: 'Laura: Assistenz-Kommunikation', done: false },
      { text: 'Leonel: n8n Workflows + Sachbearbeitung', done: false },
    ]},
  { id: 10, title: 'Plan Reise April', target: 100, current: 0, unit: '%', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'Reiseplan April erstellen', done: false },
      { text: 'Mandantenbesuche planen', done: false },
    ]},
  { id: 11, title: 'Formation Johanna (Schülerin)', target: 100, current: 0, unit: '%', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'Einarbeitung Sachbearbeiterin', done: false },
      { text: 'ELSTER + TaxDome Schulung', done: false },
    ]},
  { id: 12, title: 'Simulateur Fiscal en ligne', target: 100, current: 0, unit: '%', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'Deployment GitHub Pages', done: false },
      { text: 'Tests + corrections', done: false },
    ]},
  { id: 13, title: 'TaxDome Konfiguration komplett', target: 100, current: 0, unit: '%', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'Pipelines finalisieren', done: false },
      { text: 'Inbox 771 messages traiter', done: false },
      { text: 'Automations n8n connecter', done: false },
    ]},
  { id: 14, title: 'Plan de travail Team complet', target: 100, current: 0, unit: '%', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'Rollen + Verträge definieren', done: false },
      { text: 'Wochenplan pro Mitarbeiter', done: false },
    ]},
  { id: 15, title: 'RDV Lenine (DK-Multiservices)', target: 100, current: 0, unit: '%', category: 'Professionnel', status: 'Non démarré',
    subtasks: [
      { text: 'Termin vereinbaren', done: false },
      { text: 'Angebot vorbereiten', done: false },
    ]},

  // ── Financier ──
  { id: 16, title: 'Recouvrement 36.850€', target: 36850, current: 0, unit: '€', category: 'Financier', status: 'Non démarré',
    subtasks: [
      { text: 'Yaqoob (Technotio) — 3.000€', done: false },
      { text: 'Hefny — 1.500€', done: false },
      { text: 'Salomov — 500€', done: false },
      { text: 'Rejin — 2.500€', done: false },
      { text: 'Kevin Des Roses — 2.500€', done: false },
      { text: 'Ola — 3.281€', done: false },
      { text: 'Esmail — 2.268€', done: false },
      { text: 'Hugues — 900€', done: false },
      { text: 'Emraz Hosen — 500€', done: false },
      { text: 'Patrick Pokam (P.A.G Services) — 5.000€', done: false },
      { text: 'Etienne Jeatoa (Germany Afrika Shipping) — 1.500€', done: false },
      { text: 'Credo — 800€', done: false },
      { text: 'Kuwan — 600€', done: false },
      { text: 'Varinder — 1.200€', done: false },
      { text: 'Romial Tumma — 750€', done: false },
      { text: 'Lenda Andre (La Services) — 1.000€', done: false },
      { text: 'Yannick Noudou — 500€', done: false },
      { text: 'Salif — 1.200€', done: false },
      { text: 'Samuel Opoku — 800€', done: false },
      { text: 'Suneyka — 600€', done: false },
      { text: 'Cleanset — 1.500€', done: false },
      { text: 'Linh + LUU — 2.000€', done: false },
      { text: 'Elborne — 650€', done: false },
      { text: 'Jesse Johnson — 1.500€', done: false },
    ]},
  { id: 17, title: 'Comptes bancaires en ordre', target: 100, current: 0, unit: '%', category: 'Financier', status: 'Non démarré',
    subtasks: [
      { text: 'Revolut, Wise, Tomorrow prüfen', done: false },
      { text: 'M-Pesa, Krypto abgleichen', done: false },
    ]},
  { id: 18, title: 'Facturation 15.000€', target: 15000, current: 0, unit: '€', category: 'Financier', status: 'Non démarré',
    subtasks: [
      { text: '5 factures/jour erstellen', done: false },
      { text: 'Alle offenen Rechnungen versenden', done: false },
    ]},
  { id: 19, title: '20 Nouveaux mandants', target: 20, current: 0, unit: 'mandants', category: 'Financier', status: 'Non démarré',
    subtasks: [
      { text: 'Prospection téléphonique', done: false },
      { text: 'Les Bâtisseurs contacts', done: false },
      { text: 'Partenariat CEF (Linh+LUU)', done: false },
    ]},
  { id: 20, title: '60 RDV Beratung im April', target: 60, current: 0, unit: 'RDV', category: 'Financier', status: 'Non démarré',
    subtasks: [
      { text: 'Calendly planifier', done: false },
      { text: '15 RDV/semaine maintenir', done: false },
    ]},
];

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const CURRENT_MONTH = 3; // April (0-indexed)

function GoalTracker() {
  const [goals, setGoals] = useState(initialGoals);
  const [filter, setFilter] = useState('Tous');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', current: '0', unit: '', category: 'Professionnel', status: 'Non démarré' });

  useEffect(() => {
    fetchObjectivesProgress().then(data => {
      if (data && data.length > 0) {
        const liveGoals = data.map(obj => {
          const local = initialGoals.find(g => g.id === obj.objective_id);
          return {
            id: obj.objective_id,
            title: obj.objective_name,
            target: obj.target,
            current: obj.current_value,
            unit: obj.unit,
            category: obj.category,
            status: obj.status,
            subtasks: local ? local.subtasks : [],
          };
        });
        setGoals(liveGoals);
      }
    }).catch(() => {});
  }, []);

  const categories = ['Tous', ...Object.keys(categoryColors)];
  const filtered = filter === 'Tous' ? goals : goals.filter(g => g.category === filter);

  const totalPct = goals.length
    ? Math.round(goals.reduce((acc, g) => acc + Math.min((g.current / g.target) * 100, 100), 0) / goals.length)
    : 0;
  const doneCount = goals.filter(g => g.current >= g.target).length;

  const handleCurrentChange = (id, value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    setGoals(goals.map(g => {
      if (g.id !== id) return g;
      const current = Math.min(num, g.target);
      const pct = (current / g.target) * 100;
      let status = g.status;
      if (pct >= 100) status = 'Terminé';
      else if (pct >= 60) status = 'Avancé';
      else if (pct > 0) status = 'En cours';
      else status = 'Non démarré';
      updateObjective(id, current, status).catch(() => {});
      return { ...g, current, status };
    }));
    setEditingId(null);
  };

  const handleStatusChange = (id, status) => {
    const goal = goals.find(g => g.id === id);
    if (goal) updateObjective(id, goal.current, status).catch(() => {});
    setGoals(goals.map(g => g.id === id ? { ...g, status } : g));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target) return;
    setGoals([...goals, {
      id: Date.now(),
      title: newGoal.title,
      target: Number(newGoal.target),
      current: Number(newGoal.current) || 0,
      unit: newGoal.unit,
      category: newGoal.category,
      status: newGoal.status,
    }]);
    setNewGoal({ title: '', target: '', current: '0', unit: '', category: 'Professionnel', status: 'Non démarré' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleSubtaskToggle = (goalId, subtaskIdx) => {
    setGoals(goals.map(g => {
      if (g.id !== goalId || !g.subtasks) return g;
      const subtasks = g.subtasks.map((s, i) => i === subtaskIdx ? { ...s, done: !s.done } : s);
      return { ...g, subtasks };
    }));
  };

  const [expandedId, setExpandedId] = useState(null);

  return (
    <div style={styles.container}>
      {/* Header with summary */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Objectifs Avril 2026</h2>
          <p style={styles.subtitle}>{doneCount}/{goals.length} atteints — Progression globale {totalPct}%</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Fermer' : '+ Objectif'}
        </button>
      </div>

      {/* Month switcher */}
      <div style={styles.monthBar}>
        {MONTHS.map((m, i) => {
          const isActive = i === selectedMonth;
          const isPast = i < CURRENT_MONTH;
          const isFuture = i > CURRENT_MONTH;
          return (
            <button
              key={m}
              onClick={() => setSelectedMonth(i)}
              style={{
                ...styles.monthPill,
                ...(isActive ? styles.monthPillActive : {}),
                ...(isPast ? styles.monthPillPast : {}),
                ...(isFuture ? styles.monthPillFuture : {}),
              }}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Inactive month message */}
      {selectedMonth !== CURRENT_MONTH && (
        <div style={styles.monthNotice}>
          <span style={styles.monthNoticeIcon}>ℹ️</span>
          <span>Les objectifs pour {MONTHS[selectedMonth]} ne sont pas encore disponibles. Affichage du mois actif (Avril).</span>
        </div>
      )}

      {/* Global progress bar */}
      <div style={styles.globalBar}>
        <div style={styles.globalBarTrack}>
          <div style={{
            ...styles.globalBarFill,
            width: `${totalPct}%`,
            background: totalPct >= 80 ? '#10b981' : totalPct >= 50 ? '#f59e0b' : '#2563eb',
          }} />
        </div>
        <span style={styles.globalPct}>{totalPct}%</span>
      </div>

      {/* Status summary chips */}
      <div style={styles.statusSummary}>
        {statuses.map(s => {
          const count = goals.filter(g => g.status === s).length;
          return (
            <div key={s} style={styles.statusChip}>
              <span style={{ ...styles.statusDot, background: statusColors[s] }} />
              <span style={styles.statusLabel}>{s}</span>
              <span style={styles.statusCount}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input style={styles.input} placeholder="Titre de l'objectif" value={newGoal.title}
            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} />
          <div style={styles.formRow}>
            <input style={styles.input} type="number" placeholder="Cible" value={newGoal.target}
              onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Actuel" value={newGoal.current}
              onChange={e => setNewGoal({ ...newGoal, current: e.target.value })} />
            <input style={styles.input} placeholder="Unité (%, €, ...)" value={newGoal.unit}
              onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })} />
          </div>
          <div style={styles.formRow}>
            <select style={styles.input} value={newGoal.category}
              onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}>
              {Object.keys(categoryColors).map(c => <option key={c}>{c}</option>)}
            </select>
            <select style={styles.input} value={newGoal.status}
              onChange={e => setNewGoal({ ...newGoal, status: e.target.value })}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <button type="submit" style={styles.submitBtn}>Ajouter</button>
          </div>
        </form>
      )}

      {/* Category filters */}
      <div style={styles.filters}>
        {categories.map(c => (
          <button key={c}
            onClick={() => setFilter(c)}
            style={{
              ...styles.filterBtn,
              ...(filter === c ? styles.filterBtnActive : {}),
              ...(filter === c && c !== 'Tous' ? { background: categoryColors[c], borderColor: categoryColors[c] } : {}),
            }}>
            {c}
            {c !== 'Tous' && <span style={styles.filterCount}>
              {goals.filter(g => g.category === c).length}
            </span>}
          </button>
        ))}
      </div>

      {/* Goal cards */}
      <div style={styles.grid}>
        {filtered.map(goal => {
          const pct = Math.round((goal.current / goal.target) * 100);
          const done = pct >= 100;
          const catColor = categoryColors[goal.category] || '#64748b';
          const sColor = statusColors[goal.status];

          return (
            <div key={goal.id} style={{ ...styles.card, borderLeft: `4px solid ${catColor}` }}>
              {/* Card top: category + status + delete */}
              <div style={styles.cardTop}>
                <span style={{ ...styles.badge, background: `${catColor}18`, color: catColor }}>{goal.category}</span>
                <div style={styles.cardActions}>
                  <select
                    value={goal.status}
                    onChange={e => handleStatusChange(goal.id, e.target.value)}
                    style={{ ...styles.statusSelect, color: sColor, borderColor: sColor }}
                  >
                    {statuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(goal.id)} title="Supprimer">✕</button>
                </div>
              </div>

              {/* Title */}
              <h3 style={styles.goalTitle}>
                {done && <span style={styles.checkmark}>&#10003; </span>}
                {goal.title}
              </h3>

              {/* Progress bar */}
              <div style={styles.progressRow}>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${Math.min(pct, 100)}%`,
                    background: done ? '#10b981' : pct >= 60 ? '#f59e0b' : catColor,
                  }} />
                </div>
                <span style={{ ...styles.pct, color: done ? '#10b981' : '#1e293b' }}>{pct}%</span>
              </div>

              {/* Editable current value */}
              <div style={styles.cardBottom}>
                <div style={styles.valueEdit}>
                  {editingId === goal.id ? (
                    <input
                      type="number"
                      autoFocus
                      style={styles.editInput}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleCurrentChange(goal.id, editValue)}
                      onKeyDown={e => { if (e.key === 'Enter') handleCurrentChange(goal.id, editValue); }}
                    />
                  ) : (
                    <span
                      style={styles.currentValue}
                      onClick={() => { setEditingId(goal.id); setEditValue(String(goal.current)); }}
                      title="Cliquer pour modifier"
                    >
                      {goal.unit === '€' ? `€${goal.current.toLocaleString()}` : goal.current}
                    </span>
                  )}
                  <span style={styles.targetValue}>
                    / {goal.unit === '€' ? `€${goal.target.toLocaleString()}` : goal.target} {goal.unit !== '€' ? goal.unit : ''}
                  </span>
                </div>
                <div style={styles.quickBtns}>
                  {!done && goal.unit !== '€' && goal.unit !== '%' && (
                    <button style={{ ...styles.incBtn, color: catColor }}
                      onClick={() => handleCurrentChange(goal.id, goal.current + 1)}>+1</button>
                  )}
                  {!done && goal.unit === '%' && (
                    <>
                      <button style={{ ...styles.incBtn, color: catColor }}
                        onClick={() => handleCurrentChange(goal.id, goal.current + 5)}>+5%</button>
                      <button style={{ ...styles.incBtn, color: catColor }}
                        onClick={() => handleCurrentChange(goal.id, goal.current + 10)}>+10%</button>
                    </>
                  )}
                  {!done && goal.unit === '€' && (
                    <>
                      <button style={{ ...styles.incBtn, color: catColor }}
                        onClick={() => handleCurrentChange(goal.id, goal.current + 1000)}>+1k</button>
                      <button style={{ ...styles.incBtn, color: catColor }}
                        onClick={() => handleCurrentChange(goal.id, goal.current + 5000)}>+5k</button>
                    </>
                  )}
                </div>
              </div>

              {/* Subtasks */}
              {goal.subtasks && goal.subtasks.length > 0 && (
                <div style={styles.subtaskSection}>
                  <button
                    style={styles.subtaskToggle}
                    onClick={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                  >
                    {expandedId === goal.id ? '▾' : '▸'} {goal.subtasks.filter(s => s.done).length}/{goal.subtasks.length} sous-tâches
                  </button>
                  {expandedId === goal.id && (
                    <div style={styles.subtaskList}>
                      {goal.subtasks.map((st, idx) => (
                        <label key={idx} style={{ ...styles.subtaskItem, ...(st.done ? styles.subtaskDone : {}) }}>
                          <input
                            type="checkbox"
                            checked={st.done}
                            onChange={() => handleSubtaskToggle(goal.id, idx)}
                            style={styles.subtaskCheck}
                          />
                          <span style={st.done ? { textDecoration: 'line-through', opacity: 0.5 } : {}}>{st.text}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', margin: '4px 0 0' },
  addBtn: {
    background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
    padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  monthBar: {
    display: 'flex', gap: 3, background: '#f1f5f9', borderRadius: 10,
    padding: 3, marginBottom: 16,
  },
  monthPill: {
    flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 7,
    fontSize: 12, fontWeight: 500, color: '#94a3b8', cursor: 'pointer',
    border: 'none', background: 'transparent', fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  monthPillActive: {
    background: '#2563eb', color: '#fff', fontWeight: 700,
    boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
  },
  monthPillPast: { color: '#cbd5e1' },
  monthPillFuture: { color: '#d1d5db' },
  monthNotice: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
    background: '#eff6ff', borderRadius: 8, marginBottom: 12,
    fontSize: 12, color: '#2563eb', border: '1px solid #bfdbfe',
  },
  monthNoticeIcon: { fontSize: 14 },
  globalBar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  globalBarTrack: { flex: 1, height: 10, borderRadius: 5, background: '#e2e8f0' },
  globalBarFill: { height: '100%', borderRadius: 5, transition: 'width 0.4s ease' },
  globalPct: { fontSize: 14, fontWeight: 700, color: '#1e293b', minWidth: 40 },
  statusSummary: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  statusChip: {
    display: 'flex', alignItems: 'center', gap: 6, background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px',
  },
  statusDot: { width: 8, height: 8, borderRadius: '50%' },
  statusLabel: { fontSize: 13, color: '#475569' },
  statusCount: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
  form: {
    background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20,
    border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12,
  },
  formRow: { display: 'flex', gap: 12 },
  input: {
    flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 14, outline: 'none', background: '#f8fafc', fontFamily: 'inherit',
  },
  submitBtn: {
    background: '#10b981', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  filters: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
    border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 500,
    color: '#475569', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
  },
  filterBtnActive: { background: '#2563eb', color: '#fff', borderColor: '#2563eb' },
  filterCount: { fontSize: 11, opacity: 0.8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card: {
    background: '#fff', borderRadius: 12, padding: 20,
    border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12,
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardActions: { display: 'flex', alignItems: 'center', gap: 6 },
  badge: { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6 },
  statusSelect: {
    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
    border: '1px solid', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
  },
  deleteBtn: {
    background: 'none', border: 'none', color: '#cbd5e1', fontSize: 14,
    cursor: 'pointer', padding: '2px 4px', lineHeight: 1,
  },
  checkmark: { color: '#10b981' },
  goalTitle: { fontSize: 15, fontWeight: 600, color: '#1e293b', margin: 0, lineHeight: 1.3 },
  progressRow: { display: 'flex', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 8, borderRadius: 4, background: '#f1f5f9' },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s ease' },
  pct: { fontSize: 13, fontWeight: 700, minWidth: 36, textAlign: 'right' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  valueEdit: { display: 'flex', alignItems: 'baseline', gap: 4 },
  currentValue: {
    fontSize: 18, fontWeight: 700, color: '#1e293b', cursor: 'pointer',
    borderBottom: '1px dashed #cbd5e1', lineHeight: 1,
  },
  editInput: {
    width: 80, fontSize: 16, fontWeight: 700, padding: '2px 6px',
    border: '2px solid #2563eb', borderRadius: 6, outline: 'none', fontFamily: 'inherit',
  },
  targetValue: { fontSize: 13, color: '#94a3b8' },
  quickBtns: { display: 'flex', gap: 6 },
  incBtn: {
    background: 'none', border: '1px solid currentColor', borderRadius: 6,
    padding: '3px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  subtaskSection: { borderTop: '1px solid #f1f5f9', paddingTop: 8 },
  subtaskToggle: {
    background: 'none', border: 'none', fontSize: 12, color: '#64748b',
    cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontWeight: 500,
  },
  subtaskList: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 },
  subtaskItem: {
    display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: '#475569',
    cursor: 'pointer', lineHeight: 1.4,
  },
  subtaskDone: { opacity: 0.5 },
  subtaskCheck: { marginTop: 2, accentColor: '#10b981' },
};

export default GoalTracker;
