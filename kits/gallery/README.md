# Kit gallery

Storybook-style index for every public component in `@openedui/react` and `@openedui/angular`.

## View locally

1. From the repo root: `npm run dev` (or `npm run dev:react` / `dev:angular`).
2. Open [http://localhost:5173/kits/gallery/](http://localhost:5173/kits/gallery/) (port may vary).
3. Choose **React** or **Angular**, then click a component card.

Each card opens the kit workspace with `?preview=ComponentName`, which renders variant states in `ComponentShowcase` / `ShowcaseComponent`.

## CI

- `npm run gallery:sync` — regenerates `index.html` and `components.json` from [`public-api.manifest.json`](../public-api.manifest.json).
- `npm test` — `server/kitGallery.test.js` fails if template/workspace showcases miss any manifest component.

When you add a component to the public API, update the manifest, both barrels, **and** add a preview section in:

- `kits/react/template/src/pages/ComponentShowcase.jsx` (and workspace copy)
- `kits/angular/template/src/showcase.component.ts` (and workspace copy)

Then run `npm run gallery:sync`.

## Visual regression (optional)

This folder does not store screenshot baselines yet. To add Playwright visual regression, point tests at the preview URLs above after `npm run dev`.
