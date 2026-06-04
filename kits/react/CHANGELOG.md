# @openedui/react changelog

Public API is defined in [public-api.manifest.json](../public-api.manifest.json).
See [KIT_STABILITY.md](../KIT_STABILITY.md) and [docs/KIT_MIGRATION.md](../../docs/KIT_MIGRATION.md).

## [1.0.0] - 2026-06-04

First **stable** release. Same 24 named exports; behavior and accessibility upgraded.

### Added

- `Button` — `forwardRef`, `aria-busy` / `aria-disabled` when loading.
- `Input` — `forwardRef`, optional `label` / `hint`, `aria-invalid` / `aria-describedby`, string `error` messages.
- `Modal` — `role="dialog"`, focus trap, Escape to close, `closeOnOverlay`, portal to `document.body`; accepts `open` alias for `isOpen`.
- `Dropdown` — `role="menu"` / `menuitem`, semantic `<button>` items, Escape; divider `role="separator"`.
- `Table` — optional `caption` prop.
- `.ou-sr-only` utility class in kit CSS.

### Changed

- `DropdownItem` is a `<button>` (was `<div>`) — ensure custom click handlers still work.

## [0.2.0] - 2026-06-03

### Added

- Frozen public API manifest and CI validation (template + workspace barrels).

## [0.1.1] - earlier

- Initial publishable 24-component React kit (`dist/openui-react.js`, `./styles.css`).
