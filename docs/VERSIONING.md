# Versioning policy (pre-1.0 → 1.0)

openUI follows [Semantic Versioning](https://semver.org/) for published packages and documented studio releases.

## Packages

| Package | Path | Current |
|---------|------|---------|
| openUI (repo) | root `package.json` | `0.2.0` (studio app) |
| `@openedui/react` | `kits/react/template` | `0.2.0` |
| `@openedui/angular` | `kits/angular/template` | `0.2.0` |

## Rules

- **Major** — breaking public kit API, barrel export removals, or incompatible studio workspace layout.
- **Minor** — new kit components, studio features, MCP tools (backward compatible).
- **Patch** — fixes, docs, security hardening, performance.

Pre-1.0 (`0.x`): minor releases may include small breaking changes; document them in `kits/*/CHANGELOG.md` and [KIT_MIGRATION.md](KIT_MIGRATION.md).

## 1.0 gate

Before tagging `1.0.0`:

1. CI green: `npm run lint` (0 errors), `npm test`, `npm run security:audit`, `npm run build:react`, kit template builds.
2. [ROADMAP.md](../ROADMAP.md) 1.0 checkboxes complete.
3. Kit manifests match barrels (`npm test` / `kitPublicApi`).

## Git tags & npm

| Tag | `package.json` | npm `@openedui/*` |
|-----|----------------|-------------------|
| `v0.2.0` | `0.2.0` (repo + kit templates) | Publish **0.2.0** on tag push (needs `NPM_TOKEN`) |
| `v0.1.1` | — | Kits **0.1.x** era (studio on main was behind) |

Cut a release: update [CHANGELOG.md](../CHANGELOG.md), ensure versions match
`kits/public-api.manifest.json`, then:

```bash
git tag -a v0.2.0 -m "openUI 0.2.0"
git push origin v0.2.0
```

## Hosted site

[openui.live](https://openui.live) ships the **marketing build** only (`npm run build` + `server.js`). Studio features require `npm run dev` locally.
