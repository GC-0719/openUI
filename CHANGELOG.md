# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
semantic versioning (pre-1.0: minor = features, patch = fixes).

## [Unreleased]

### Added
- **0.9.x RC** — [docs/GOOD_FIRST_ISSUES.md](docs/GOOD_FIRST_ISSUES.md) and [.github/labels.yml](.github/labels.yml); [examples/dashboard-react](examples/dashboard-react) and [examples/mcp-postgres](examples/mcp-postgres); virtualized file explorer for 120+ workspace paths.
- **Studio run-mode clarity** — backend-offline banner, localhost studio shell on preview builds, README dev-only note.
- **Security RC checklist** — [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md) and `npm run security:audit` (CI); MCP stdio command allowlist; export walk path containment.
- **Custom kit components** — studio **New kit component** flow (`POST /api/register-component`), workspace `.openui/specs.json`, merged specs for the agent; see [docs/CUSTOM_COMPONENTS.md](docs/CUSTOM_COMPONENTS.md).
- **Kit gallery** — `kits/gallery/` index (24 components), `npm run gallery:sync`, CI coverage tests for React/Angular showcase previews.
- **Kit public API manifest** (`kits/public-api.manifest.json`) + CI tests — template/workspace barrels must match frozen `@openedui/react` / `@openedui/angular` exports (0.2.0).
- **Kit stability & migration docs** — `kits/KIT_STABILITY.md`, `docs/KIT_MIGRATION.md`, per-kit CHANGELOGs.
- **MCP wizard** (AI Settings → MCP) — scaffold a stdio MCP server from **OpenAPI JSON** (HTTP proxy tools) or **Prisma schema** (model introspection); download ZIP, copy Claude config, add to studio MCP list.
- **Starter templates** in the agent panel — Dashboard, Auth, and Settings seeds with **Plan** (checklist first) or **Build** (Edit mode) for React and Angular workspaces.
- **Git status in file tree** — `M` / `U` / `S` badges for modified, untracked, and staged files when the workspace is inside a git repo (`/api/git-status`).
- **Open existing project** — link `kits/<framework>/workspace` to an absolute folder on disk (symlink + path validation); studio folder button and `/api/workspace-bind`.
- **Agent diff preview** — review per-file line diffs before applying an Edit-mode file batch; auto-fix retries skip the modal.
- **`/api/validate-sources`** — TypeScript compiler checks for `.ts` files (Angular auto-fix); JSX still uses Vite probe.
- **`buildAgentPrompt` regression tests** for React and Angular prompts.
- **Agent memory panel** — edit, remove, or manually add individual facts; Memory toggle always available when AI is configured.
- **Audit panel** — React/Angular-aware rules, AI specs from disk, load open file, `parseAuditResult` helper.
- **Plan mode checklist** — structured plan with `- [ ]` tasks and **Build this plan** to run Edit mode against the approved plan.
- **Theme token editor** in the studio (palette button) — live CSS variable overrides, sync to `src/styles/theme-overrides.css`, agent sees active tokens.
- Unit tests for `buildThemeOverridesCss`.

### Added (earlier unreleased)
- [ROADMAP.md](ROADMAP.md) — path to 1.0, differentiation vs other AI UI tools, milestone checklist.

### Changed
- File explorer errors use in-app toasts instead of browser `alert()`.
- Studio top bar: clickable **Specs unavailable — retry** when AI specs fail to load.
- Undo, redo, and workspace reset use `apiPost` with toasts; history stacks only advance on success.

## [0.2.0] - 2026-06-03

### Added
- **`apiFetch` helper** and studio error surfacing for failed saves, writes, and file-tree loads.
- **Vitest** unit tests for `parseAgentResponse`, `parseAIChanges`, `stripJsonBlock`, and workspace path guards.
- **`.env.example`** and README troubleshooting section.
- **Dependabot** for npm dependencies.
- **`server/` modules** — HTTP helpers, path safety, and AI providers extracted from `vite.config.js`.

### Fixed
- **Audit panel** supports local LLM (uses `isConfigured` like the agent).
- **Angular agent parity** — barrel `index.ts` auto-export, framework-aware parse probe, `.component.ts` page detection.
- **Silent failures** — specs load, MCP/memory/workspace context, and file explorer show warnings or retry.

### Changed
- CI runs `npm test` after lint.

## [0.1.0] - initial release

### Added
- **Sandbox IDE** — recursive project file tree with create/rename/delete,
  backed by new dev-server endpoints (`/api/create-folder`, `/api/rename-path`,
  `/api/delete-path`) with a workspace-root traversal guard.
- **Full-build agent** — the AI agent now builds whole-app structure (pages,
  components, hooks, context, `lib/`/`services/`), not just kit pages.
- **MCP backend context** in the chat panel; the agent builds a data layer
  matching a connected backend's schema.
- **Landing page** for the studio.
- **`@openedui/react`** publishable component package (Vite library build).
- **`@openedui/angular`** publishable component package (ng-packagr / Angular
  Package Format), plus Angular agent parity (full-app builds + MCP service
  generation).
- **Publish-by-name export** — `/api/export` emits a publishable `package/`
  named from your kit name + optional npm scope, and bundles the whole `src/`.
- MIT license, README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, CI.

### Changed
- **Rebranded** from "Lumina Studio" to **openUI**, including the CSS prefix
  `l-` → `ou-` and env vars `LUMINA_*` → `OPENUI_*`. **(breaking)**
