# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
semantic versioning (pre-1.0: minor = features, patch = fixes).

## [Unreleased]

### Added
- **Sandbox IDE** — recursive project file tree with create/rename/delete,
  backed by new dev-server endpoints (`/api/create-folder`, `/api/rename-path`,
  `/api/delete-path`) with a workspace-root traversal guard.
- **Full-build agent** — the AI agent now builds whole-app structure (pages,
  components, hooks, context, `lib/`/`services/`), not just kit pages.
- **MCP backend context** in the chat panel; the agent builds a data layer
  matching a connected backend's schema.
- **Landing page** for the studio.
- **`@openui/react`** publishable component package (Vite library build).
- **Publish-by-name export** — `/api/export` emits a publishable `package/`
  named from your kit name + optional npm scope, and bundles the whole `src/`.
- MIT license, README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, CI.

### Changed
- **Rebranded** from "Lumina Studio" to **openUI**, including the CSS prefix
  `l-` → `ou-` and env vars `LUMINA_*` → `OPENUI_*`. **(breaking)**
