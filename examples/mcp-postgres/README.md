# MCP + Postgres example

Connect openUI’s agent to a **Postgres-backed MCP server** so Edit-mode builds use real
tables and columns instead of guessed fields.

## Overview

```mermaid
flowchart LR
  Studio[openUI Studio] --> Bridge[Vite /api/mcp-bridge]
  Bridge --> MCP[MCP stdio server]
  MCP --> PG[(Postgres)]
```

1. Run a small MCP server that exposes SQL or row tools for your schema.
2. Register it in **AI Settings → MCP**.
3. Ask the agent to build UI that matches your schema.

## Quick start with the MCP wizard

1. `npm run dev` → open **http://localhost:5173/studio/react**
2. **Settings → MCP → MCP wizard**
3. Paste a **Prisma schema** (see `schema.prisma` in this folder) or **OpenAPI** for a REST layer
4. Download the generated server ZIP, install deps, and add the printed Claude/studio config

## Sample Prisma schema

`schema.prisma` defines a minimal `User` and `Order` model. Point `DATABASE_URL` at a local Postgres:

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/openui_demo"
```

Use the wizard output or adapt the generated stdio server to run:

```bash
cd path/to/generated-mcp-server
npm install
node index.js   # command shown in wizard / mcp config
```

## Studio MCP config (stdio)

In **AI Settings → MCP**, add a server like:

| Field | Example |
|-------|---------|
| Name | `postgres-demo` |
| Transport | stdio |
| Command | `node` |
| Args | `["/absolute/path/to/your-mcp-server/index.js"]` |
| Env | `DATABASE_URL=postgresql://...` |

Commands are validated against an allowlist — see [docs/SECURITY_CHECKLIST.md](../../docs/SECURITY_CHECKLIST.md).

## Agent prompt ideas

After MCP tools appear in the agent context:

- “List tables from the MCP server and build an orders admin page with a filterable table.”
- “Create `src/pages/Customers.jsx` using kit Table; columns must match the `User` model fields.”

Use **Plan** mode first for a checklist, then **Build this plan**.

## Security notes

- Run MCP servers **locally** only; never commit database passwords.
- The studio proxies tool calls through your machine — same trust model as running `psql` locally.
- For production apps, generate UI in openUI then move API calls into your own backend.

## Related

- [examples/dashboard-react](../dashboard-react/README.md) — UI shell without backend
- [docs/SECURITY_CHECKLIST.md](../../docs/SECURITY_CHECKLIST.md) — MCP spawn rules
- Starter **Dashboard** template in the agent panel (data can be mock until MCP is wired)
