const CONFIG = {
  project: 'wambs-consulting',
  dataset: 'dashboard_analytics',
  API_BASE_URL: process.env.REACT_APP_API_URL || '/api',
  USE_MOCK: process.env.REACT_APP_USE_MOCK !== 'false',
};

// Mock data for demo mode
const MOCK = {
  weeklyHabits: [
    { week_start: '2026-03-23', habit_name: 'Morning Routine (6h)', total_days: 7, completed_days: 5, completion_rate: 71.4 },
    { week_start: '2026-03-23', habit_name: 'Deep Work (3h min)', total_days: 7, completed_days: 6, completion_rate: 85.7 },
    { week_start: '2026-03-23', habit_name: 'Inbox Zero', total_days: 7, completed_days: 4, completion_rate: 57.1 },
    { week_start: '2026-03-23', habit_name: 'Sport / Mouvement', total_days: 7, completed_days: 3, completion_rate: 42.9 },
    { week_start: '2026-03-23', habit_name: 'Lecture (30 min)', total_days: 7, completed_days: 7, completion_rate: 100 },
    { week_start: '2026-03-23', habit_name: 'Revue du soir', total_days: 7, completed_days: 6, completion_rate: 85.7 },
    { week_start: '2026-03-16', habit_name: 'Morning Routine (6h)', total_days: 7, completed_days: 4, completion_rate: 57.1 },
    { week_start: '2026-03-16', habit_name: 'Deep Work (3h min)', total_days: 7, completed_days: 5, completion_rate: 71.4 },
    { week_start: '2026-03-16', habit_name: 'Inbox Zero', total_days: 7, completed_days: 3, completion_rate: 42.9 },
    { week_start: '2026-03-16', habit_name: 'Sport / Mouvement', total_days: 7, completed_days: 2, completion_rate: 28.6 },
    { week_start: '2026-03-16', habit_name: 'Lecture (30 min)', total_days: 7, completed_days: 6, completion_rate: 85.7 },
    { week_start: '2026-03-16', habit_name: 'Revue du soir', total_days: 7, completed_days: 5, completion_rate: 71.4 },
    { week_start: '2026-03-09', habit_name: 'Morning Routine (6h)', total_days: 7, completed_days: 6, completion_rate: 85.7 },
    { week_start: '2026-03-09', habit_name: 'Deep Work (3h min)', total_days: 7, completed_days: 4, completion_rate: 57.1 },
    { week_start: '2026-03-09', habit_name: 'Inbox Zero', total_days: 7, completed_days: 5, completion_rate: 71.4 },
    { week_start: '2026-03-09', habit_name: 'Sport / Mouvement', total_days: 7, completed_days: 4, completion_rate: 57.1 },
    { week_start: '2026-03-09', habit_name: 'Lecture (30 min)', total_days: 7, completed_days: 5, completion_rate: 71.4 },
    { week_start: '2026-03-09', habit_name: 'Revue du soir', total_days: 7, completed_days: 4, completion_rate: 57.1 },
  ],
  kpiTrend: [
    { month_start: '2026-03-01', kpi_name: 'CA Mars', avg_value: 22000, target: 50000, unit: 'EUR' },
    { month_start: '2026-03-01', kpi_name: 'Mandants actifs', avg_value: 86, target: 100, unit: 'mandants' },
    { month_start: '2026-03-01', kpi_name: 'Declarations deposees', avg_value: 18, target: 50, unit: 'declarations' },
    { month_start: '2026-03-01', kpi_name: 'ELSTER Quote', avg_value: 36, target: 100, unit: 'pct' },
    { month_start: '2026-03-01', kpi_name: 'Taux recouvrement', avg_value: 28, target: 100, unit: 'pct' },
    { month_start: '2026-02-01', kpi_name: 'CA Mars', avg_value: 18500, target: 50000, unit: 'EUR' },
    { month_start: '2026-02-01', kpi_name: 'Mandants actifs', avg_value: 78, target: 100, unit: 'mandants' },
    { month_start: '2026-02-01', kpi_name: 'Declarations deposees', avg_value: 12, target: 50, unit: 'declarations' },
    { month_start: '2026-02-01', kpi_name: 'ELSTER Quote', avg_value: 28, target: 100, unit: 'pct' },
    { month_start: '2026-02-01', kpi_name: 'Taux recouvrement', avg_value: 22, target: 100, unit: 'pct' },
    { month_start: '2026-01-01', kpi_name: 'CA Mars', avg_value: 15000, target: 50000, unit: 'EUR' },
    { month_start: '2026-01-01', kpi_name: 'Mandants actifs', avg_value: 72, target: 100, unit: 'mandants' },
    { month_start: '2026-01-01', kpi_name: 'Declarations deposees', avg_value: 8, target: 50, unit: 'declarations' },
    { month_start: '2026-01-01', kpi_name: 'ELSTER Quote', avg_value: 20, target: 100, unit: 'pct' },
    { month_start: '2026-01-01', kpi_name: 'Taux recouvrement', avg_value: 15, target: 100, unit: 'pct' },
  ],
  productivity: [
    { date: '2026-03-28', habits_done: 0, habits_total: 6, habit_rate: 0, deep_work_min: 300, total_planned_min: 825 },
    { date: '2026-03-27', habits_done: 5, habits_total: 6, habit_rate: 83.3, deep_work_min: 300, total_planned_min: 825 },
    { date: '2026-03-26', habits_done: 4, habits_total: 6, habit_rate: 66.7, deep_work_min: 240, total_planned_min: 825 },
    { date: '2026-03-25', habits_done: 6, habits_total: 6, habit_rate: 100, deep_work_min: 300, total_planned_min: 825 },
    { date: '2026-03-24', habits_done: 3, habits_total: 6, habit_rate: 50, deep_work_min: 180, total_planned_min: 825 },
    { date: '2026-03-23', habits_done: 5, habits_total: 6, habit_rate: 83.3, deep_work_min: 300, total_planned_min: 825 },
    { date: '2026-03-22', habits_done: 4, habits_total: 6, habit_rate: 66.7, deep_work_min: 240, total_planned_min: 825 },
  ],
  alerts: [
    { kpi_name: 'Inbox Messages', kpi_value: 640, target: 0, alert_status: 'WARNING: Inbox overload', unit: 'messages' },
    { kpi_name: 'Declarations deposees', kpi_value: 18, target: 50, pct_of_target: 36, alert_status: 'OK', unit: 'declarations' },
    { kpi_name: 'CA Mars', kpi_value: 22000, target: 50000, pct_of_target: 44, alert_status: 'OK', unit: 'EUR' },
    { kpi_name: 'Mandants actifs', kpi_value: 86, target: 100, pct_of_target: 86, alert_status: 'OK', unit: 'mandants' },
    { kpi_name: 'ELSTER Quote', kpi_value: 36, target: 100, pct_of_target: 36, alert_status: 'OK', unit: 'pct' },
    { kpi_name: 'Taux recouvrement', kpi_value: 28, target: 100, pct_of_target: 28, alert_status: 'OK', unit: 'pct' },
    { kpi_name: 'Objectifs atteints', kpi_value: 0, target: 16, pct_of_target: 0, alert_status: 'WARNING: Under 25% of target', unit: 'objectifs' },
    { kpi_name: 'TaxDome Tasks', kpi_value: 86, target: 0, alert_status: 'OK', unit: 'tasks' },
  ],
};

async function apiFetch(endpoint) {
  if (CONFIG.USE_MOCK) return null;
  const res = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchHabitsHistory(days = 30) {
  const data = await apiFetch(`/habits?days=${days}`);
  return data || MOCK.weeklyHabits;
}

export async function fetchKpiTrend(months = 3) {
  const data = await apiFetch(`/kpi-trend?months=${months}`);
  return data || MOCK.kpiTrend;
}

export async function fetchObjectivesProgress() {
  const data = await apiFetch('/objectives');
  return data || [];
}

export async function updateObjective(objectiveId, currentValue, status) {
  if (CONFIG.USE_MOCK) {
    console.log('[Mock] Update objective:', objectiveId, currentValue, status);
    return { success: true, mock: true };
  }
  const res = await fetch(`${CONFIG.API_BASE_URL}/objectives/${objectiveId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_value: currentValue, status }),
  });
  return res.json();
}

export async function fetchDailyProductivity(days = 30) {
  const data = await apiFetch(`/productivity?days=${days}`);
  return data || MOCK.productivity;
}

export async function fetchAlerts() {
  const data = await apiFetch('/alerts');
  return data || MOCK.alerts;
}

export async function fetchTodayHabits() {
  const data = await apiFetch('/today-habits');
  return data || [];
}

export async function toggleHabitApi(habitId, completed) {
  if (CONFIG.USE_MOCK) {
    console.log('[Mock] Toggle habit:', habitId, completed);
    return { success: true, mock: true };
  }
  const res = await fetch(`${CONFIG.API_BASE_URL}/habits/${habitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  return res.json();
}

export async function fetchTodayKpis() {
  const data = await apiFetch('/today-kpis');
  return data || [];
}

export async function submitDailySnapshot(snapshotData) {
  if (CONFIG.USE_MOCK) {
    console.log('[Mock] Daily snapshot submitted:', snapshotData);
    return { success: true, mock: true };
  }
  const res = await fetch(`${CONFIG.API_BASE_URL}/snapshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshotData),
  });
  return res.json();
}
