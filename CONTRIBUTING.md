# Contributing to openUI

Thanks for your interest in improving openUI!

## Development setup

Requires **Node 20+**.

```bash
npm install
npm run dev          # React studio (Vite dev server with the openUI backend)
npm run dev:angular  # Angular workspace
npm run build        # production build (React + Angular)
npm run lint         # ESLint
npm test             # Vitest (aiService parsers + path guards)
```

Set an AI key via `OPENUI_AI_KEY` (Anthropic) or in the in-app AI settings to
exercise the agent.

## Project layout

| Path | What |
|------|------|
| `src/` | the studio app (landing + IDE) |
| `src/services/aiService.js` | agent prompts, response parsing, validation |
| `src/components/studio/` | file tree, editor, agent panel, preview, audit |
| `kits/react/*`, `kits/angular/*` | the component kits (template = source, workspace = editable copy) |
| `vite.config.js` | the dev-server backend (AI proxy, file CRUD, MCP bridge, export) |

## Conventions

- Kit CSS classes use the `ou-` prefix; colors come from CSS variables
  (`var(--primary)`, `var(--text)`…) — no hardcoded hex.
- Keep changes focused; one logical change per PR.
- Commit messages: imperative summary, e.g. `fix: ...`, `feat: ...`,
  `refactor: ...`.
- Run `npm run lint`, `npm test`, `npm run security:audit`, and `npm run build` before opening a PR. Lint must pass
  with **0 errors**; there is a backlog of ~84 non-correctness warnings (mostly
  Fast-Refresh `only-export-components` hints on barrels/contexts/data files,
  plus a few intentional effect patterns) that we chip away at — please don't
  add new errors, and clearing nearby warnings is welcome.

## Good first issues

We tag starter-friendly work with **`good first issue`** and **`help wanted`**. See
[docs/GOOD_FIRST_ISSUES.md](docs/GOOD_FIRST_ISSUES.md) for label meanings, maintainer
setup (`.github/labels.yml`), and example tasks from [ROADMAP.md](ROADMAP.md).

## Pull requests

1. Fork and branch from `main`.
2. Make your change with a clear description of the problem and approach.
3. Ensure the build passes and the studio runs.
4. Open a PR using the template.

By contributing you agree your work is licensed under the [MIT License](LICENSE).
