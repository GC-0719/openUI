# Security review checklist (0.9.x RC)

Use this before tagging a **release candidate** or merging large changes to the dev-server backend (`vite.config.js` + `server/`).

Automated checks: `npm run security:audit` (also runs in CI).

## Threat model (local dev)

openUI is **not** a hosted multi-tenant service. The Vite dev server is a **local root-equivalent** tool for one developer on one machine. Risks are:

- Path traversal → read/write outside the kit workspace
- MCP stdio spawn → arbitrary command execution as the dev user
- Export ZIP → leaking files outside workspace into a downloadable archive
- Workspace bind symlink → widening write scope to an entire user project
- AI proxy → exfiltration of API keys if the server is exposed to a network

**Mitigation baseline:** never expose port 5173 (or custom Vite port) to LAN/internet; only bind trusted folders; only use MCP commands you would run manually.

---

## 1. Path traversal (`resolveIn` / `resolveWs`)

| Check | How to verify |
|-------|----------------|
| All `/api/*` file writes use `resolveWs` or `resolveIn` | Grep `vite.config.js` for `writeFileSync` / `rmSync` without resolver |
| `..` segments rejected | `npm test` — `server/pathSafety.test.js` |
| Invalid `kit` rejected | `safeKit()` returns null for unknown kits |
| Custom component paths stay under `src/components/ui` | `server/customComponent.test.js` |

**Manual:** `POST /api/write-file` with `path: "../../package.json"` must return 400.

---

## 2. MCP stdio spawn (`/api/mcp-bridge`)

| Check | How to verify |
|-------|----------------|
| Metacharacters blocked (`;`, `|`, `` ` ``, `$`, …) | `server/mcpCommandSafety.test.js` |
| Allowlist: `node`, `npx`, `python`, `python3`, `uv`, `uvx` only | `validateMcpStdioCommand` |
| 12s timeout on stdio requests | `stdioMCPRequest` in `vite.config.js` |
| User warned in SECURITY.md | Linked from README |

**Manual:** In AI Settings → MCP, test connection with command `node /path/to/mcp/index.js` (OK) vs `node a.js; whoami` (rejected).

---

## 3. Export ZIP (`/api/export` + client JSZip)

| Check | How to verify |
|-------|----------------|
| Server walk stays under workspace root | `isPathInsideRoot` in export `readPath` |
| Only reads from `src/` tree (relative) | No user-supplied path segments in walk |
| ZIP built client-side from JSON payload | No server-side zip slip |
| Junk dirs skipped (`node_modules`, `.DS_Store`) | `readPath` filters |

**Manual:** Export after agent edits; open ZIP — paths should be under `src/`, no `../`.

---

## 4. Workspace bind (`/api/workspace-bind`)

| Check | How to verify |
|-------|----------------|
| Absolute path required | `validateExternalRoot` |
| Template + `node_modules` blocked | `server/workspaceBind.test.js` |
| Symlink documented as full write scope | SECURITY.md |

---

## 5. MCP wizard scaffold (`/api/mcp-wizard/scaffold`)

| Check | How to verify |
|-------|----------------|
| Generated code has no `child_process` / `eval` | `runSecurityAudit` |
| OpenAPI tools only `fetch` user `API_BASE_URL` | Review `server/mcpScaffold.js` output |
| Spec size capped (512KB) | `MAX_SPEC_CHARS` |

---

## 6. Secrets & network

| Check | How to verify |
|-------|----------------|
| API keys in localStorage (optional in-app BYOK) | User choice; not committed to git |
| Optional env keys (`OPENUI_AI_KEY`, `ANTHROPIC_API_KEY`) | Dev server only; never exposed via `/api/ai-config` |
| `/api/ai` merges env key only when body omits `apiKey` and provider is `claude` | See `server/aiEnvKey.js` |
| AI proxy not authenticated for anonymous use | Dev server binds localhost by default |
| `.env` gitignored | `.gitignore` |

---

## RC sign-off

| Reviewer | Date | `npm run security:audit` | `npm test` | Notes |
|----------|------|---------------------------|------------|-------|
| | | ☐ pass | ☐ pass | |

---

## Reporting vulnerabilities

See [SECURITY.md](../SECURITY.md) for private disclosure contact.
