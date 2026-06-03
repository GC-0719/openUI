# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
semantic versioning (pre-1.0: minor = features, patch = fixes).

## [Unreleased]

### Added
- [ROADMAP.md](ROADMAP.md) — path to 1.0, differentiation vs other AI UI tools, milestone checklist.

### Changed
- File explorer errors use in-app toasts instead of browser `alert()`.
- Studio top bar: clickable **Specs unavailable — retry** when AI specs fail to load.

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
