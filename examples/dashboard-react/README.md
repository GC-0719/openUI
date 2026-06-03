# Dashboard example (React)

This example shows how to build an **admin dashboard** with openUI: use the in-studio
**Dashboard** starter template, or consume `@openedui/react` in your own Vite app.

## Option A — Studio (recommended)

The fastest path uses the local studio and the built-in starter seed.

```bash
git clone https://github.com/GC-0719/openUI.git
cd openUI && npm install
npm run dev
```

1. Open **http://localhost:5173/studio/react**
2. Configure AI in **Settings** (or `OPENUI_AI_KEY=sk-... npm run dev`)
3. In the agent panel, under **Starter templates**, choose **Dashboard** → **Plan** or **Build**
4. The agent creates `src/pages/AnalyticsDashboard.jsx` (and related components) using kit components only

Preview the page via agent page tabs or `#/ai/AnalyticsDashboard` in the iframe.

## Option B — Kit in your own app

```bash
npm create vite@latest my-dashboard -- --template react
cd my-dashboard
npm install @openedui/react react react-dom react-router-dom
```

```jsx
// src/App.jsx
import { Button, Card, Badge } from '@openedui/react';
import '@openedui/react/styles.css';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {['Revenue', 'Users', 'Conversion', 'Tickets'].map((label) => (
          <Card key={label}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>—</div>
            <Badge variant="success">+12%</Badge>
          </Card>
        ))}
      </div>
      <Button style={{ marginTop: 24 }}>View report</Button>
    </div>
  );
}
```

See [docs/KIT_MIGRATION.md](../../docs/KIT_MIGRATION.md) for renames, theming, and semver.

## What the studio template builds

| Piece | Path (workspace) |
|-------|------------------|
| Main dashboard page | `src/pages/AnalyticsDashboard.jsx` |
| Optional stat/table components | `src/components/*` |
| Kit barrel exports | `src/components/ui/index.jsx` |

Rules enforced by the agent: kit components only, CSS variables (no hex), responsive grids.

## Next steps

- Wire real data via **MCP** — see [examples/mcp-postgres](../mcp-postgres/README.md)
- Run **Audit** tab in the studio against pasted JSX
- Export your kit from **Export** in the top bar
