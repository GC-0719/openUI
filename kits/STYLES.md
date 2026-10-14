# Kit stylesheet source of truth

## Rule

`kits/<framework>/template/src/styles/*.css` is the **canonical** stylesheet.
`kits/<framework>/workspace/src/styles/*.css` must be **byte-identical** —
it is a mirror, not a fork.

- The template is what publishes to npm (`@openedui/react`, `@openedui/angular`).
- The workspace is the copy the studio agent edits and the preview iframe runs.
- Theme edits never touch these files — they go to `theme-overrides.css`
  (see `src/utils/themeSync.js`), which the studio injects after the kit import.
- To change kit styles, edit the **template**, then run `npm run styles:sync`
  to mirror it into the workspace.

## Enforcement

`npm run styles:check` (runs in CI) fails if any workspace copy drifts from
its template. `npm run styles:sync` re-syncs.

## Studio app shell

`src/styles/openui.css` is a thin wrapper: it `@import`s the React kit
template stylesheet and only overrides the `:root` theme tokens (monochrome
studio chrome). Do not add component rules there.
