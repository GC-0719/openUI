# Good first issues — contributor guide

openUI welcomes small, focused PRs. This guide explains how we label issues and what makes a good starter task.

## Labels to look for

| Label | Meaning |
|-------|---------|
| **`good first issue`** | Scoped work (usually &lt; ~200 lines), clear acceptance criteria, no deep studio/MCP internals required |
| **`help wanted`** | Maintainers want community help; may be larger than a first PR |
| **`documentation`** | Docs, README, examples, comments — no runtime behavior change |
| **`area: studio`** | `src/pages/Studio.jsx`, `src/components/studio/*`, studio CSS |
| **`area: kits`** | `kits/react/*`, `kits/angular/*`, gallery, publish manifests |
| **`area: mcp`** | MCP bridge, wizard, `server/mcp*.js`, export MCP server |
| **`area: dev-server`** | `vite.config.js` middleware, `server/*` modules |
| **`area: security`** | Path guards, spawn allowlists, audit scripts — read [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) first |

Search: [good first issue](https://github.com/GC-0719/openUI/labels/good%20first%20issue) · [help wanted](https://github.com/GC-0719/openUI/labels/help%20wanted)

## Maintainer: create labels on GitHub

Repo **Settings → Labels → New label**, or sync from [.github/labels.yml](../.github/labels.yml) with any [label-sync action](https://github.com/marketplace?type=actions&query=label+sync).

Suggested colors (GitHub defaults are fine if you skip sync):

- `good first issue` — `#7057ff`
- `help wanted` — `#008672`
- `documentation` — `#0075ca`
- `area: studio` — `#1d76db`
- `area: kits` — `#5319e7`
- `area: mcp` — `#0e8a16`
- `area: dev-server` — `#fbca04`
- `area: security` — `#d93f0b`

## What makes a good first issue?

1. **One problem** — e.g. “Add retry to git-status fetch” not “Refactor entire agent.”
2. **Testable** — unit test, manual steps in the issue, or screenshot for UI.
3. **Linked to [ROADMAP.md](../ROADMAP.md)** when it advances a milestone checkbox.
4. **No secrets** — never commit API keys; use `OPENUI_AI_KEY` locally only.

## Starter tasks (from the roadmap)

These are often split into separate GitHub issues:

- Docs: expand [examples/dashboard-react](../examples/dashboard-react/README.md) or [examples/mcp-postgres](../examples/mcp-postgres/README.md).
- Tests: add Vitest coverage for a `server/` helper or `src/utils/*` module.
- Studio UX: clearer empty states, keyboard shortcuts, accessibility on modals.
- Kits: one component spec JSON improvement or gallery snapshot tweak.
- Lint: fix `no-unused-vars` / hook warnings in a **single** file you touched (see [CONTRIBUTING.md](../CONTRIBUTING.md)).

## Development checklist (every PR)

```bash
npm install
npm run lint    # 0 errors required
npm test
npm run security:audit
npm run build:react
npm run dev     # manual studio smoke — see README
```

Full studio features (Audit, diff preview, workspace bind) require **`npm run dev`**, not `npm start` or the hosted site.

## Getting help

- Open a [Discussion](https://github.com/GC-0719/openUI/discussions) or comment on the issue before large refactors.
- Security: follow [SECURITY.md](../SECURITY.md) — no public issues for vulnerabilities.
