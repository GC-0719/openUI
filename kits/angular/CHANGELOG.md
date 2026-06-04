# @openedui/angular changelog

Public API is defined in [public-api.manifest.json](../public-api.manifest.json).
See [KIT_STABILITY.md](../KIT_STABILITY.md) and [docs/KIT_MIGRATION.md](../../docs/KIT_MIGRATION.md).

## [1.0.0] - 2026-06-04

First **stable** release. Same manifest symbols; behavior aligned with React 1.0.

### Added

- `ButtonComponent` — `loading`, `outline` variant, `aria-busy` / `aria-disabled`.
- `InputComponent` — `required`, stable `id` + `for` on label, `aria-invalid` / `aria-describedby`.
- `ModalComponent` — dialog ARIA, Escape, initial focus, optional `[footer]` projection; `isOpen` input alias.
- `DropdownComponent` — menu ARIA, keyboard trigger, higher z-index; `DropdownItemComponent` `(select)` output.
- `TableComponent` — optional `caption`; `scope="col"` on headers.
- `.ou-sr-only` in kit CSS.

### Changed

- `DropdownItemComponent` emits `select` on click — wire `(select)` instead of relying on nested clicks only.

## [0.2.0] - 2026-06-03

### Added

- Frozen public API manifest and CI validation.

## [0.1.1] - earlier

- Initial publishable standalone Angular component kit (ng-packagr).
