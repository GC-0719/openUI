# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
semantic versioning (pre-1.0: minor = features, patch = fixes).

## [Unreleased]

_Nothing yet._

## [0.2.0] - 2026-06-04

Studio and kit release tagged as **v0.2.0** (GitHub tag + `@openedui/react` /
`@openedui/angular` publish via [RELEASING.md](RELEASING.md)). Supersedes the
earlier **v0.1.1** npm tag for kits only.

### Added

- **Minimal B/W landing** — monochrome [Home](src/pages/Home.jsx) and docs/studio shell.
- **Bring your own key (BYOK)** — `GET /api/ai-config`, env Claude fallback on `/api/ai`, Settings UI, env badge in studio.
- **Studio run-mode clarity** — backend-offline banner; full studio only on `npm run dev` (hosted `/studio` → RunLocally).
- **Security** — [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md), `npm run security:audit`, MCP command allowlist, export path containment.
- **Examples** — [examples/dashboard-react](examples/dashboard-react), [examples/mcp-postgres](examples/mcp-postgres); [docs/GOOD_FIRST_ISSUES.md](docs/GOOD_FIRST_ISSUES.md).
- **Custom kit components** — `POST /api/register-component`, `.openui/specs.json` ([docs/CUSTOM_COMPONENTS.md](docs/CUSTOM_COMPONENTS.md)).
- **Kit gallery** — `kits/gallery/`, `npm run gallery:sync`, CI preview coverage tests.
- **Kit public API manifest** — `kits/public-api.manifest.json` + CI barrel lock at 0.2.0.
- **MCP wizard** — OpenAPI / Prisma scaffold, ZIP download, studio MCP list integration.
- **Starter templates** — Dashboard, Auth, Settings (Plan or Build) for React and Angular.
- **Git status in file tree** — `M` / `U` / `S` badges via `/api/git-status`.
- **Open existing project** — workspace bind/symlink to an absolute folder (`/api/workspace-bind`).
- **Agent diff preview** — review line diffs before applying Edit-mode writes.
- **`/api/validate-sources`** — TypeScript checks for Angular auto-fix.
- **Agent memory panel** — edit, add, remove, forget-all (in-app confirm modal).
- **Audit panel** — React/Angular rules, specs from disk, load open file.
- **Plan mode checklist** — `- [ ]` tasks and **Build this plan**.
- **Theme token editor** — live CSS variables synced to `theme-overrides.css`.
- **Studio dialogs** — `StudioConfirmModal` / `StudioPromptModal` (no browser `confirm`/`prompt`).
- **Provider icons** — Claude, OpenAI, Gemini, local, OpenUI agent mark.
- **`apiFetch`**, Vitest suite (84 tests), `server/` modules split from Vite config.
- **`.env.example`**, [docs/VERSIONING.md](docs/VERSIONING.md), [ROADMAP.md](ROADMAP.md), Dependabot.
- Virtualized file explorer for large workspaces (120+ paths).

### Changed

- **README** — routes, npm scripts, BYOK, dev vs hosted studio, troubleshooting.
- **Banner** — monochrome `.github/banner.svg` and `public/banner.svg`.
- Modal footer buttons — `.ai-settings-btn` secondary/primary styles across studio modals.
- File explorer errors → toasts; specs retry in top bar; undo/redo/reset via `apiPost`.
- CI runs `npm test` and `npm run security:audit` after lint.

### Fixed

- **Studio light theme** — contrast across agent, audit, export, MCP wizard, code editor.
- **Audit panel** — local LLM via `isConfigured`.
- **Angular agent parity** — barrel auto-export, framework-aware probe, `.component.ts` pages.
- **Silent failures** — specs, MCP/memory/workspace context, file tree load/retry.

## [0.1.1] - 2025 (npm)

First provenance-signed publish of `@openedui/react` and `@openedui/angular` to npm
(Git tag `v0.1.1` only — no studio features from 0.2.0).

## [0.1.0] - initial release

### Added

- **Sandbox IDE** — file tree with create/rename/delete and workspace guards.
- **Full-build agent** — pages, components, hooks, `lib/` across the project.
- **MCP backend context** in the agent panel.
- **Landing page** and **`@openedui/react`** / **`@openedui/angular`** packages.
- **Publish-by-name export** — ZIP + npm scope from kit name.
- MIT license, README, CONTRIBUTING, SECURITY, CI.

### Changed

- **Rebranded** from "Lumina Studio" to **openUI** (`l-` → `ou-`, `LUMINA_*` → `OPENUI_*`). **(breaking)**
