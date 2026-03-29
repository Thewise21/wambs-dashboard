require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();
const PORT = process.env.PORT || 3001;
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID || 'wambs-consulting';
const DATASET = process.env.GOOGLE_DATASET || 'dashboard_analytics';

// BigQuery client
const bigquery = new BigQuery({ projectId: PROJECT_ID });

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH'],
}));
app.use(express.json());

// Helper: flatten BigQuery DATE/TIMESTAMP objects { value: "..." } to plain strings
function flattenRow(row) {
  const flat = {};
  for (const [key, val] of Object.entries(row)) {
    flat[key] = val && typeof val === 'object' && 'value' in val ? val.value : val;
  }
  return flat;
}

// Helper: run a BigQuery query and flatten results
async function runQuery(sql) {
  const [rows] = await bigquery.query({ query: sql, location: 'EU' });
  return rows.map(flattenRow);
}

// ─── Health check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: PROJECT_ID, dataset: DATASET, timestamp: new Date().toISOString() });
});

// ─── Weekly habits history ───
app.get('/api/habits', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const sql = `
      SELECT * FROM \`${PROJECT_ID}.${DATASET}.v_weekly_habits\`
      WHERE week_start >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
      ORDER BY week_start DESC, habit_name
    `;
    const rows = await runQuery(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching habits:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Monthly KPI trend ───
app.get('/api/kpi-trend', async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;
    const sql = `
      SELECT * FROM \`${PROJECT_ID}.${DATASET}.v_monthly_kpi_trend\`
      WHERE month_start >= DATE_SUB(CURRENT_DATE(), INTERVAL ${months} MONTH)
      ORDER BY month_start DESC, kpi_name
    `;
    const rows = await runQuery(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching KPI trend:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Objectives progress ───
app.get('/api/objectives', async (req, res) => {
  try {
    const sql = `
      SELECT * FROM \`${PROJECT_ID}.${DATASET}.v_objectives_progress\`
      ORDER BY category, objective_name
    `;
    const rows = await runQuery(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching objectives:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Daily productivity ───
app.get('/api/productivity', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const sql = `
      SELECT * FROM \`${PROJECT_ID}.${DATASET}.v_daily_productivity\`
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
      ORDER BY date DESC
    `;
    const rows = await runQuery(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching productivity:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── KPI alerts ───
app.get('/api/alerts', async (req, res) => {
  try {
    const sql = `
      SELECT * FROM \`${PROJECT_ID}.${DATASET}.v_kpi_alerts\`
      ORDER BY alert_status DESC, kpi_name
    `;
    const rows = await runQuery(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching alerts:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Today's habits (for DailySystem) ───
app.get('/api/today-habits', async (req, res) => {
  try {
    const sql = `
      SELECT habit_id, habit_name, icon,
        LOGICAL_OR(completed) as completed,
        MAX(streak) as streak
      FROM \`${PROJECT_ID}.${DATASET}.daily_habits_log\`
      WHERE date = CURRENT_DATE()
      GROUP BY habit_id, habit_name, icon
      ORDER BY habit_id
    `;
    const rows = await runQuery(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching today habits:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Toggle a habit ───
app.patch('/api/habits/:habitId', async (req, res) => {
  try {
    const habitId = parseInt(req.params.habitId);
    const { completed } = req.body;
    const sql = `
      UPDATE \`${PROJECT_ID}.${DATASET}.daily_habits_log\`
      SET completed = ${completed}
      WHERE date = CURRENT_DATE() AND habit_id = ${habitId}
    `;
    await runQuery(sql);
    res.json({ success: true, habit_id: habitId, completed });
  } catch (err) {
    console.error('Error toggling habit:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Today's KPIs (for KPIBoard) ───
app.get('/api/today-kpis', async (req, res) => {
  try {
    const sql = `
      SELECT kpi_name, kpi_value, unit, pct_of_target, alert_status
      FROM \`${PROJECT_ID}.${DATASET}.v_kpi_alerts\`
      ORDER BY kpi_name
    `;
    const rows = await runQuery(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching today KPIs:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Update objective progress ───
app.patch('/api/objectives/:objectiveId', async (req, res) => {
  try {
    const objectiveId = parseInt(req.params.objectiveId);
    const { current_value, status } = req.body;
    const sql = `
      UPDATE \`${PROJECT_ID}.${DATASET}.objectives\`
      SET current_value = ${current_value}, status = '${status}', updated_at = CURRENT_TIMESTAMP()
      WHERE objective_id = ${objectiveId}
    `;
    await runQuery(sql);
    res.json({ success: true, objective_id: objectiveId, current_value, status });
  } catch (err) {
    console.error('Error updating objective:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Submit daily snapshot ───
app.post('/api/snapshot', async (req, res) => {
  try {
    const { habits, timeblocks, session } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const queries = [];

    // Insert habits
    if (habits && habits.length > 0) {
      const values = habits.map(h =>
        `('${today}', ${h.id}, '${h.name}', '${h.icon}', ${h.completed}, ${h.streak || 0})`
      ).join(', ');
      queries.push(`INSERT INTO \`${PROJECT_ID}.${DATASET}.daily_habits_log\` (date, habit_id, habit_name, icon, completed, streak) VALUES ${values}`);
    }

    // Insert timeblocks
    if (timeblocks && timeblocks.length > 0) {
      const values = timeblocks.map(t =>
        `('${today}', '${t.start}', '${t.task}', '${t.type}', ${t.duration})`
      ).join(', ');
      queries.push(`INSERT INTO \`${PROJECT_ID}.${DATASET}.timeblock_tracking\` (date, block_start, task, type, planned_duration) VALUES ${values}`);
    }

    // Insert session
    if (session) {
      queries.push(`INSERT INTO \`${PROJECT_ID}.${DATASET}.session_log\` (date, session_start, tasks_completed, files_modified, skills_used, notes) VALUES ('${today}', CURRENT_TIMESTAMP(), ${session.tasks || 0}, ${session.files || 0}, '${session.skills || 'manual'}', '${session.notes || ''}')`);
    }

    // Execute all queries
    for (const sql of queries) {
      await runQuery(sql);
    }

    res.json({ success: true, date: today, queries_executed: queries.length });
  } catch (err) {
    console.error('Error submitting snapshot:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Raw SQL query (admin only, for debugging) ───
app.post('/api/query', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL query required' });
    // Safety: only allow SELECT queries
    if (!sql.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(403).json({ error: 'Only SELECT queries allowed' });
    }
    const rows = await runQuery(sql);
    res.json({ rows, count: rows.length });
  } catch (err) {
    console.error('Error executing query:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`WAMBS Dashboard API running on port ${PORT}`);
  console.log(`Project: ${PROJECT_ID} | Dataset: ${DATASET}`);
  console.log(`Endpoints: /api/health, /api/habits, /api/kpi-trend, /api/objectives, /api/productivity, /api/alerts, /api/snapshot`);
});
