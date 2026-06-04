# Security Policy

## openUI is a local development tool

openUI's dev server (`vite.config.js`) is powerful by design and is intended to
run **only on your local machine, for your own use**:

- It **reads and writes files** under the kit workspace (`/api/write-file`,
  `/api/create-folder`, `/api/rename-path`, `/api/delete-path`). A path-traversal
  guard keeps writes inside the workspace, but the surface is still a local
  filesystem API.
- **`/api/workspace-bind`** can symlink `kits/<kit>/workspace` to a folder you
  choose. Only bind projects you trust; validation blocks template folders and
  `node_modules`, but the linked tree is fully writable by the studio APIs.
- **`/api/mcp-wizard/scaffold`** generates MCP server code you run locally. OpenAPI
  mode will call whatever `API_BASE_URL` you set — only point it at APIs you trust.
- It can **spawn MCP server processes over stdio** (`/api/mcp-bridge`), executing
  the command you configure. Only connect MCP servers you trust.
- It **proxies AI requests** with the API key you provide.

**Do not expose the dev server to a network, a public host, or untrusted input.**
Do not run it as a hosted/multi-tenant service. Treat connected MCP commands and
AI keys as you would any local secret.

Maintainers: run **`npm run security:audit`** before release candidates. See
[docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md) for the full review
checklist (path traversal, MCP spawn, export ZIP, workspace bind).

## Reporting a vulnerability

Please report security issues privately to **gopichandyaragarla@gmail.com**
rather than opening a public issue. Include reproduction steps and impact. We
aim to acknowledge reports within a few days.

## Supported versions

openUI is pre-1.0; fixes land on `main`.
