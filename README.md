<p align="center">
  <img src=".github/banner.svg" alt="openUI — a local-first AI sandbox for building production-ready frontends" width="100%" />
</p>

<p align="center">
  <a href="https://openui.live"><img src="https://img.shields.io/badge/live-openui.live-0a0a0a.svg" alt="Live site" /></a>
  <a href="https://github.com/GC-0719/openUI/actions/workflows/ci.yml"><img src="https://github.com/GC-0719/openUI/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@openedui/react"><img src="https://img.shields.io/npm/v/@openedui/react?label=%40openedui%2Freact&color=cb3837&logo=npm" alt="@openedui/react on npm" /></a>
  <a href="https://www.npmjs.com/package/@openedui/angular"><img src="https://img.shields.io/npm/v/@openedui/angular?label=%40openedui%2Fangular&color=cb3837&logo=npm" alt="@openedui/angular on npm" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  <img src="https://img.shields.io/badge/node-%3E%3D20-3c873a.svg" alt="Node >=20" />
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg" alt="React 19" />
  <img src="https://img.shields.io/badge/Angular-21-DD0031.svg" alt="Angular 21" />
</p>

# openUI

openUI is a studio you run on your own machine where an AI agent builds complete
frontends from a design-system kit — creating pages, components, hooks, and
services across a real project tree, wired to *your* backend through
[MCP](https://modelcontextprotocol.io). Edit files in a built-in IDE, preview
the running app live, then export or publish your kit under your own name.

> Bring your own AI key (Anthropic, OpenAI, Gemini, or a local LLM). Nothing
> leaves your machine except the AI calls you make.

---

## Features

- **Sandbox IDE** — recursive project file tree (create / rename / delete via
  in-app dialogs), code editor with undo/redo, and a live preview of the
  running app.
- **AI agent (Ask · Plan · Edit)** — explain, plan with a checklist, or write
  files across the workspace; review line diffs before applying batch edits.
- **Backend-aware via MCP** — connect a backend MCP server; the agent sees its
  tools and live data and builds a data layer + UI that match your fields.
- **Design-system kit** — 24 polished React components (Angular kit included),
  with a kit name and CSS prefix you can rename in one click.
- **Spec & Audit** — per-component AI specs on disk; audit pasted or open-file
  code against kit rules and loaded specs.
- **Component docs** — browse kit components with live previews at `/docs`.
- **Export & publish** — download a ZIP, push to GitHub, generate an MCP
  server, or publish your kit to npm **under your own name**.

## Quick start

Requires **Node 20+**.

```bash
git clone https://github.com/GC-0719/openUI.git
cd openUI
npm install
cp .env.example .env    # optional — document BYOK env vars
npm run dev             # React + Angular kits; full studio backend
```

Open the URL Vite prints (e.g. `http://localhost:5173/studio/react`) or click
**Open Studio** on the home page.

**BYOK — pick one:**

```bash
# Claude via env (key never stored in the browser)
OPENUI_AI_KEY=sk-ant-... npm run dev
# or paste OpenAI / Gemini / Claude / local LLM in Studio → Settings (AI)
```

| Route | What |
|-------|------|
| `/` | Landing (marketing) |
| `/studio/react` | React workspace studio |
| `/studio/angular` | Angular workspace studio (`npm run dev` enables both) |
| `/docs` | Component browser + code snippets |

> **Use `npm run dev` for the full studio.** The Vite dev server provides
> `/api/*` (files, AI, MCP, export, workspace bind, git status). `npm start` and
> [openui.live](https://openui.live) ship a **static** build only — visiting
> `/studio/*` there shows **Studio runs locally** (no agent writes, Audit backend,
> diff preview, or MCP). A yellow **Studio backend is offline** banner means the
> UI loaded without those APIs — switch to `npm run dev`.

> **One install is enough.** Root `npm install` runs the studio and previews
> **both** kits via the root Vite app. Per-kit `package.json` files are for
> **publishing** only ([RELEASING.md](RELEASING.md)).

`npm run dev:react` — React kit only (no Angular preview).  
`npm run dev:angular` — same as `npm run dev` (sets `VITE_OPENUI_ANGULAR=1`).

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Studio + both kits (recommended) |
| `npm run dev:react` / `dev:angular` | See above |
| `npm run build` / `build:react` / `build:angular` | Production bundles |
| `npm start` | Serve `dist/` with `server.js` (landing + RunLocally on `/studio`) |
| `npm run preview` | Preview production build locally |
| `npm test` | Vitest (parsers, path guards, prompts) |
| `npm run lint` | ESLint |
| `npm run gallery:sync` | Regenerate kit gallery index |
| `npm run security:audit` | Local security checklist script |

## Bring your own key (BYOK)

openUI does **not** sell or host API access. Inference goes through the **local
Vite dev server** (`/api/ai`) on your machine.

| How | Best for |
|-----|----------|
| **`OPENUI_AI_KEY` or `ANTHROPIC_API_KEY`** in `.env` / shell | Claude without storing the key in the browser |
| **Studio → Settings → API Key** | OpenAI, Gemini, Claude, or local servers (stored in `localStorage`) |
| **Local LLM** (Ollama, LM Studio) | No cloud key — base URL + model in Settings |

See [.env.example](.env.example). `GET /api/ai-config` reports whether an env
key is active (never returns the secret). In-app keys take precedence over env.

## AI providers

| Provider | Key source |
|----------|------------|
| Anthropic (Claude) | Env (`OPENUI_AI_KEY` / `ANTHROPIC_API_KEY`) **or** in-app Settings |
| OpenAI | In-app Settings only |
| Gemini | In-app Settings only |
| Local LLM | Base URL + model in Settings (API key optional) |

## Versioning

Pre-1.0 semver for the studio and `@openedui/*` kits:
[docs/VERSIONING.md](docs/VERSIONING.md).

| Git tag | What it marks |
|---------|----------------|
| **v0.2.0** | Current **main** — full studio (BYOK, MCP wizard, diff preview, B/W UI, 84 tests). Publishes `@openedui/*` **0.2.0** when `NPM_TOKEN` is set ([release workflow](.github/workflows/release.yml)). |
| **v0.1.1** | Earlier **kits-only** npm release (provenance); no 0.2.x studio features. |

See [CHANGELOG.md](CHANGELOG.md) and [GitHub Releases](https://github.com/GC-0719/openUI/releases).

## Examples

| Example | Description |
|---------|-------------|
| [examples/dashboard-react](examples/dashboard-react) | Dashboard starter in the studio or `@openedui/react` in your app |
| [examples/mcp-postgres](examples/mcp-postgres) | Prisma schema + MCP wizard flow for Postgres-backed agents |

Contributing? [docs/GOOD_FIRST_ISSUES.md](docs/GOOD_FIRST_ISSUES.md) ·
[CONTRIBUTING.md](CONTRIBUTING.md).

## Architecture

```
src/                 Studio app (React 19 + Vite + react-router)
  pages/             Home, Studio, Docs
  components/studio/ FileExplorer, CodeEditor, AIAgent, Audit, modals…
  services/        aiService (prompts/parsing), mcpClientService
kits/
  react/{template,workspace}    React kit (publishable @openedui/react)
  angular/{template,workspace}  Angular kit
vite.config.js       Dev backend: /api/ai, file CRUD, MCP bridge, export, git…
server.js            Production static host (npm start)
```

The **workspace** is your editable copy of a kit; the **template** is the
pristine source. The agent writes into the workspace via the dev server; the
preview iframe runs the workspace app.

## Using the kit in your own project

**React:**

```bash
npm install @openedui/react
```

```jsx
import { Button, Card, Badge } from '@openedui/react';
import '@openedui/react/styles.css';
```

**Angular** (standalone components):

```bash
npm install @openedui/angular
```

```ts
import { ButtonComponent, CardComponent } from '@openedui/angular';
import '@openedui/angular/styles.css';
```

## Export & publish your kit

In the studio, **Export** downloads a project ZIP (publishable `package/` named
after your kit + optional npm scope), pushes to GitHub, or generates an MCP
server. See [RELEASING.md](RELEASING.md).

## Troubleshooting

| Issue | What to do |
|-------|------------|
| **Hosted `/studio` shows “run locally”** | Run `npm run dev` and open `/studio/react` or `/studio/angular`. |
| **Yellow “Studio backend is offline”** | Same — need the Vite dev server, not `npm start` / openui.live alone. |
| **Angular preview blank** | Use `npm run dev` or `dev:angular` (not `dev:react` alone). |
| **Save or file tree errors** | Dev server must be running; failed writes keep tabs marked unsaved. |
| **Link your own repo** | Studio → folder icon → absolute path; symlinks `kits/<fw>/workspace` ([SECURITY.md](SECURITY.md)). |
| **Git badges (M / U / S)** | Workspace inside a git repo; requires `git` on PATH. |
| **MCP wizard** | Settings → MCP → wizard — OpenAPI or Prisma → ZIP + Claude config. |
| **Custom components** | File tree → boxes icon → barrel + spec ([docs/CUSTOM_COMPONENTS.md](docs/CUSTOM_COMPONENTS.md)). |
| **Local LLM** | Base URL + model in Settings; Audit and Spec use the same provider. |
| **MCP servers** | Only connect commands you trust ([SECURITY.md](SECURITY.md)). |
| **Prod build + studio UI on localhost** | `npm run build:react && npm start` mounts the studio shell on localhost only; APIs still need `npm run dev` unless you add `VITE_OPENUI_STUDIO=1` for UI-only testing. |

Copy [.env.example](.env.example) to `.env` for local BYOK and Angular flags.

## Deployment

[**openui.live**](https://openui.live) hosts the **landing + docs** static build
(Railway from `main`). The **studio backend stays local** — file/AI/MCP APIs
are not exposed on the public site. `npm run build:react` then `npm start` serves
`dist/` via `server.js`.

## Roadmap

Shipping toward **1.0** — real filesystem, MCP-aware agents, ownable kits.
[ROADMAP.md](ROADMAP.md).

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md)

## Security

The dev server reads/writes files and can spawn MCP processes. **Local dev
only** — do not expose to a network or untrusted users. [SECURITY.md](SECURITY.md)
· [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md).

## License

[MIT](LICENSE) © openUI contributors
