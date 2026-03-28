# WAMB'S Dashboard - Project Guide

## Project Overview
Dashboard personnel de productivité pour **WAMB'SCONSULTING** — cabinet de conseil fiscal (Steuerberatung).
Application React avec 3 vues : Système Quotidien, Objectifs, KPI Board.

## Tech Stack
- **Framework**: React 19 (Create React App)
- **Styling**: Inline styles (JS objects)
- **State**: React useState (local)

## Project Structure
```
src/
├── components/
│   ├── GoalTracker.jsx   # Suivi d'objectifs avec barres de progression
│   ├── DailySystem.jsx   # Habitudes + Time Blocks quotidiens
│   └── KPIBoard.jsx      # Tableau de KPIs avec sparklines
├── App.js                # Root: sidebar + navigation par onglets
├── index.js              # Entry point
└── index.css             # Reset CSS global
```

## Conventions
- **Language**: UI in French, code in English
- **Components**: Functional components with hooks only
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Styling**: Inline styles via JS objects (const styles = {...})
- **Colors**: Primary `#2563eb` (blue), Accent `#10b981` (green), Dark `#1e293b`

## Commands
- `npm start` — Dev server on localhost:3000
- `npm run build` — Production build
- `npm test` — Run tests

## Design Principles
- Clean, modern, professional look
- Responsive layout (sidebar collapses on mobile)
- Dark sidebar with light main content area
- Consistent spacing (8px grid)
