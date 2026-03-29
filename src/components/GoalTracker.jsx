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
  Production: '#2563eb',
  Finance: '#10b981',
  Commercial: '#f59e0b',
  Organisation: '#8b5cf6',
  Stratégie: '#ec4899',
  Formation: '#06b6d4',
};

const initialGoals = [
  { id: 1, title: '50 Déclarations fiscales', target: 50, current: 18, unit: 'déclarations', category: 'Production', status: 'En cours',
    subtasks: [
      { text: 'Top Mandanten: Patrick Pokam (PAG), Yaqoob (Technotio), Sanuel Opoku, Suneyka, Oneyka, Signature Essential (Valdo), Yannick Noudou, Michael, Drehmoment, Romial Tumma, Lenda Andre (La Services), Elborne, Etienne (Germany Afrika Shipping), Jesse Johnson', done: false },
      { text: 'ESt 2023 Nachträge (Steuerjahr 2018-2020)', done: false },
      { text: 'ELSTER Entwürfe prüfen + Bescheide erstellen', done: false },
      { text: 'Dropbox Steuererklärung scannen/signieren', done: false },
      { text: 'USt-Vor. für 12 Mandanten (Lenda, Alisa Saric, Etienne, Clifford, WAMBS, Franck Jongo, Bruno, Patrick, Bernard, Simplice, Elvice, Kuwan)', done: false },
      { text: 'Einspruch Mariam Yaqoob 2023', done: false },
    ]},
  { id: 2, title: '30 Comptabilités', target: 30, current: 9, unit: 'comptabilités', category: 'Production', status: 'En cours',
    subtasks: [
      { text: 'Buchhaltung ESt 2023 Fälle', done: false },
      { text: 'Abrechnung 2024+2025 Studenten', done: false },
      { text: 'FiBu 2023-2025 alle Mandanten', done: false },
      { text: 'USt-VA 2020-2026 prüfen', done: false },
      { text: 'EÜR 2024 Arnauld Dassie (Lucio Vermietung) übermitteln', done: false },
      { text: 'WAMBS Consulting: AR+ER+Bank (Revolut, Wise, Tomorrow, M-Pesa, Krypto)', done: false },
      { text: 'Doppelbuchhaltung Workflow erstellen', done: false },
    ]},
  { id: 3, title: '30 Beratungsgespräche', target: 30, current: 11, unit: 'entretiens', category: 'Commercial', status: 'En cours',
    subtasks: [
      { text: '9 RDV Calendly planifiés (18-31 mars)', done: false },
      { text: 'Passer 10 appels prospection', done: false },
      { text: 'Beratungsterminplan 2026 erstellen', done: false },
      { text: 'Beratungsgespräch Patrick Pokam/P.A.G vorbereiten', done: false },
    ]},
  { id: 4, title: 'Finaliser process automatisation', target: 100, current: 40, unit: '%', category: 'Organisation', status: 'En cours',
    subtasks: [
      { text: 'N8N Workflow: Zoom→G-Drive→Plaud→Perplexity→Claude→ChatGPT→BigQuery', done: false },
      { text: 'Workflow Monthly Accounting, Lohnabrechnungen, USt-VA Monthly Bills', done: false },
      { text: 'Workflow Profi DAVG Analyse für jeden Mandanten', done: false },
      { text: 'Pipeline ESt Neue Mandant (8 Schritte)', done: false },
      { text: 'OCR Tecerat in N8N', done: false },
      { text: 'Extract ELSTER Zertifikate → Dropbox Kanzlei_Elster', done: false },
    ]},
  { id: 5, title: 'Paiements ouverts', target: 100, current: 25, unit: '%', category: 'Finance', status: 'En cours',
    subtasks: [
      { text: 'URGENT: Hefny Zahlung klären', done: false },
      { text: 'URGENT: Esmail Zahlung klären 2.267,84€', done: false },
      { text: 'Hugues Zahlung klären 900€', done: false },
      { text: 'Ola Zahlung klären 3.281€', done: false },
      { text: 'Emraz Hosen 500€ Anzahlung prüfen', done: false },
      { text: 'Rejin: Zahlungsvereinbarung Hälfte bis 31.03.26', done: false },
      { text: 'Kevin Des Roses: Monatlich 300€ ab 01.03.2026', done: false },
    ]},
  { id: 6, title: '5 RDV Les Bâtisseurs', target: 5, current: 1, unit: 'RDV', category: 'Commercial', status: 'En cours',
    subtasks: [
      { text: 'Follow-Up 20.03 (Calendly planifié)', done: false },
      { text: 'Contact Jeannick Engille (Dir. Technique)', done: true },
      { text: 'Contact Ebrissone Edmond (Chef Projet TelKom)', done: true },
      { text: 'Contact Stancey Obiang (Expert Impôt)', done: true },
      { text: 'Message à tous les Bâtisseurs', done: false },
    ]},
  { id: 7, title: 'Contact FA dossiers ouverts', target: 100, current: 30, unit: '%', category: 'Production', status: 'En cours',
    subtasks: [
      { text: 'Elvis Kameni: Stand ESt 2023 beim FA anfragen', done: false },
      { text: 'Eric Constant: Einspruch 2024 ESt (Ablehnung Zusammenveranlagung)', done: false },
      { text: 'Kevin Des Roses: Einspruch 2023 DRINGEND', done: false },
      { text: 'Alle FA Unterlagen/Analyse + Klärungsplan erstellen', done: false },
      { text: 'Judicael Fall prüfen', done: false },
    ]},
  { id: 8, title: 'Marketing Plan', target: 100, current: 10, unit: '%', category: 'Stratégie', status: 'Non démarré',
    subtasks: [
      { text: 'Business Plan PAG für Banken/Investoren (Abercane) erstellen', done: false },
      { text: 'IMPACT-Formel Präsentation über mich erstellen', done: false },
      { text: 'Meine Fähigkeiten konkret beschreiben (Profil)', done: false },
      { text: 'Gettaxed App Projekt (1h/jour)', done: false },
    ]},
  { id: 9, title: 'Organisation fichiers', target: 100, current: 20, unit: '%', category: 'Organisation', status: 'En cours',
    subtasks: [
      { text: 'Chinedu: Dropbox Folder Privat/Unternehmer scannen+klassifizieren', done: false },
      { text: 'Elvis Kameni: Dropbox Folder prüfen/scannen/organisieren', done: false },
      { text: 'Alisa Saric: Unterlagen 2019-2026 von Apple in Dropbox', done: false },
      { text: 'WAMBS: Invoice to Go + Belege hochladen + Analyse', done: false },
    ]},
  { id: 10, title: 'Organiser programmes', target: 100, current: 15, unit: '%', category: 'Organisation', status: 'Non démarré',
    subtasks: [
      { text: 'Organisation Meeting WAMBS 2026', done: false },
      { text: 'Ausbildungsplan 2026 erstellen', done: false },
      { text: 'Beratungsterminplan für 2026 erstellen', done: false },
    ]},
  { id: 11, title: 'Plan de travail Team', target: 100, current: 35, unit: '%', category: 'Stratégie', status: 'En cours',
    subtasks: [
      { text: 'Einrichtung, Organisation, Rolle, Verträge aller WAMBS+Müller Team', done: false },
      { text: 'Fikret: Sachbearbeiter', done: false },
      { text: 'Laura: Assistentin', done: false },
      { text: 'Leonel: Werkstudent (Sachbearbeiter)', done: false },
      { text: 'Johanna: Schülerin 16J (Sachbearbeiterin)', done: false },
      { text: 'Caroline: Elternzeit', done: false },
      { text: 'Leonel/Fikret: Mandantenprüfungen + ELSTER Bewertungen ergänzen', done: false },
    ]},
  { id: 12, title: 'Partenariat CEF', target: 100, current: 10, unit: '%', category: 'Commercial', status: 'Non démarré',
    subtasks: [
      { text: 'Projekt Linh+Luu: Partnerschaftsvertrag (mind. 5 Jahre, Bonus-Modell)', done: false },
      { text: 'Projekt Linh+Luu: Büromaterialien + EDV + KI Tools auflisten', done: false },
      { text: 'Patrick Pokam: Partnerschafts-Vertrag mit WAMBS klären', done: false },
    ]},
  { id: 13, title: 'Toutes les factures', target: 100, current: 50, unit: '%', category: 'Finance', status: 'En cours',
    subtasks: [
      { text: 'Rechnungen+Versand prüfen', done: false },
      { text: 'Contrôler 10 factures/jour', done: false },
      { text: 'Salif: Rechnungen 2024+2025 erstellen und schicken', done: false },
      { text: 'Alle Emails für WAMBS+Poclaire Rechnungen prüfen', done: false },
      { text: "J'établis 5 factures/jour", done: false },
    ]},
  { id: 14, title: 'Revenus 50 000€', target: 50000, current: 22000, unit: '€', category: 'Finance', status: 'En cours',
    subtasks: [
      { text: 'Salomov: Rechnung ESt 2024 erstellen + schicken', done: false },
      { text: 'Rejin: Abtretungserklärung 2024+2025', done: false },
      { text: 'Kevin Des Roses: Abtretungserklärungen 2024-2025', done: false },
      { text: 'Eric Constant: Angebot ESt+Buchhaltung+EÜR 2025', done: false },
    ]},
  { id: 15, title: 'Recouvrement 30 000€', target: 30000, current: 8500, unit: '€', category: 'Finance', status: 'En cours',
    subtasks: [
      { text: 'Offene Rechnungen 2017-heute (Patrick Pokam) klären', done: false },
      { text: 'Rejin: Zahlungsvereinbarung Hälfte bis 31.03.26, ab 01.05 300€', done: false },
      { text: 'Kevin Des Roses: Monatlich 300€ ab 01.03.2026', done: false },
      { text: 'Salomov: Zahlungsvereinbarung klären und folgen', done: false },
      { text: 'Emraz Hosen: 500€ Anzahlung + Gesamtfall Analyse', done: false },
    ]},
  { id: 16, title: 'Plan étude Steuerberatungsprüfung', target: 100, current: 5, unit: '%', category: 'Formation', status: 'Non démarré',
    subtasks: [
      { text: 'Ausbildungsplan 2026 erstellen', done: false },
      { text: 'Reiseplan 2026 erstellen', done: false },
      { text: 'Lire au moins 1h par jour', done: false },
    ]},
];

function GoalTracker() {
  const [goals, setGoals] = useState(initialGoals);
  const [filter, setFilter] = useState('Tous');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', current: '0', unit: '', category: 'Production', status: 'Non démarré' });

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
    setNewGoal({ title: '', target: '', current: '0', unit: '', category: 'Production', status: 'Non démarré' });
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
          <h2 style={styles.title}>Objectifs Mars 2026</h2>
          <p style={styles.subtitle}>{doneCount}/{goals.length} atteints — Progression globale {totalPct}%</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Fermer' : '+ Objectif'}
        </button>
      </div>

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
