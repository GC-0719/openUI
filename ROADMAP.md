# openUI roadmap → 1.0

openUI is a **local-first AI studio** that writes into a **real project tree**, previews a **running app**, and builds UI **against your backend** via MCP — then lets you **export your own design-system package** (npm + MCP server). That combination is the north star for 1.0.

## What makes openUI different

| Capability | openUI | Typical AI UI builders (v0, Bolt, Lovable, etc.) |
|------------|--------|--------------------------------------------------|
| Files live on disk | Yes — full tree, git-friendly | Often ephemeral / hosted sandbox |
| Your backend schema | MCP tools + live data in the agent prompt | Generic REST guesses or manual paste |
| Ownable design system | Rename kit + prefix; publish `@your-scope/your-kit` | Vendor components or one-off codegen |
| Local LLM | Ollama / OpenAI-compatible | Cloud-only or limited |
| Export artifact | ZIP + MCP server + publishable package | Deploy link or vendor lock-in |
| Framework kits | React + Angular from one studio | Usually React-only |

**1.0 means:** a contributor or team can rely on openUI weekly — stable studio, stable kits, documented security model, tests on critical paths, and clear upgrade notes.

---

## Release train (pre-1.0)

### 0.2.x — Reliability & trust

- [x] API error surfacing (saves, writes, file tree)
- [x] Vitest on parsers + path guards
- [x] Angular agent parity (barrel, parse probe, pages)
- [x] `server/` module split from `vite.config.js`
- [x] Studio toasts instead of `alert()` for file ops
- [x] Specs load retry + clearer banners
- [x] Undo/redo and reset-template use `apiPost` + error feedback
- [x] Ratchet ESLint warnings down in touched files (queueMicrotask for intentional effect loads)

### 0.3.x — Agent quality & design-system depth

- [x] **Theme token editor** in studio (CSS variables synced to workspace + agent prompts)
- [x] **Plan mode** exports a markdown checklist before Edit runs
- [x] **Audit panel** supports Angular templates + uses kit specs from disk
- [x] Stronger **parse validation** for Angular (TypeScript compiler feedback in dev server)
- [x] **Agent memory** UI: edit/remove single facts, not only “forget all”
- [x] Snapshot tests for `buildAgentPrompt` (regression guard)

### 0.4.x — Workflow & uniqueness *(complete)*

- [x] **Open in existing repo** — point workspace at a user folder (with strict path guard)
- [x] **Git status** in file tree (modified / untracked badges)
- [x] **Diff preview** before applying agent file batch
- [x] **Starter templates** (dashboard, auth, settings) as one-click agent seeds
- [x] **MCP wizard** — scaffold a minimal MCP server from OpenAPI or Prisma schema

### 0.5.x — Kits & publishing

- [x] Semver-stable `@openedui/react` / `@openedui/angular` APIs
- [x] Changelog + migration guide for kit consumers
- [x] Visual regression or Storybook-style kit gallery in CI
- [ ] Documented **custom component** flow (add to workspace → auto-barrel → spec JSON)

### 0.9.x — Release candidate

- [ ] Security review checklist (path traversal, MCP spawn, export ZIP)
- [ ] Contributor guide: “good first issue” labels in GitHub
- [ ] Example apps: `examples/dashboard-react`, `examples/mcp-postgres`
- [ ] Performance: large workspace tree (500+ files) stays usable

### 1.0.0 — Stable

- [ ] Studio + kits semver policy published
- [ ] No breaking changes without major bump
- [ ] CI: lint (0 errors), test, build, kit builds, optional audit
- [ ] Hosted [openui.live](https://openui.live) = docs + download only (studio stays local)

---

## How to help

Pick a checkbox above, open an issue referencing **ROADMAP.md**, and follow [CONTRIBUTING.md](CONTRIBUTING.md). Small, focused PRs match how we ship.

**Compare ideas?** If a feature doesn’t strengthen *real files*, *MCP-aware builds*, or *ownable kits*, it’s probably out of scope for core — consider a plugin or example instead.
