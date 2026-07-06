# Session State Snapshot

Last updated: 2026-07-06

This file captures the current working state of the project so the work can be resumed if the conversation is lost.

## Main conventions

- Use `sets/set-N/` for live set pages.
- Use `public/sets/set-N/` for deployed copies.
- Keep set-specific files inside each set's own `assets/` folder.
- Do not leave source-set labels or links behind when cloning a page to a new set.
- Set pages should keep folder URLs, not `.html`, on the deployed side.
- New sets should reuse the shared set template; only inject question data, options, images, and per-question metadata.

## Current generator files

- `build-set3-page.js`
- `build-set6-page.js`
- `build-set7-page.js`
- `question-page-container.js`

## Current structure note

- `SET_STRUCTURE.md` contains the canonical folder rules and the set-specific working notes.

## Working set status

### Set 3

- Generated pages exist at:
  - `sets/set-3/index.html`
  - `public/sets/set-3/index.html`
- Set 3 was rebuilt from the `set 3/` source folder.
- The build script now rewrites internal Set 9 references to Set 3.
- Reading image-backed items were copied into `sets/set-3/assets/` and mirrored in `public/sets/set-3/assets/`.

### Set 6

- Generated pages exist at:
  - `sets/set-6/index.html`
  - `public/sets/set-6/index.html`
- Set 6 was built from the `set 6/` source folder.
- The build script rewrites internal Set 9 references to Set 6.
- Source question counts currently parse as:
  - Reading: 45
  - Math: 38
  - Science: 50
  - English: 37

### Set 7

- Generated pages exist at:
  - `sets/set-7/index.html`
  - `public/sets/set-7/index.html`
- Set 7 was rebuilt on the shared set template and injects only the question data from the `set 7/` source folder.
- Extracted diagram assets were copied into `sets/set-7/assets/` and mirrored in `public/sets/set-7/assets/`.
- English multi-select questions are preserved in the generated page.

## Home page links

- `index.html` and `public/index.html` were updated so the visible Set 3, Set 6, and Set 7 cards no longer point to `set-9`.

## Compatibility and routing

- Set 9 compatibility files still exist:
  - `teas-version-7-set-9.html`
  - `teas-version-7-set-9/index.html`
  - `public/teas-version-7-set-9/index.html`
- `render.yaml` and `vercel.json` contain route rules for the set pages.

## Important source folders

- `set 3/`
- `set 6/`

These are the source folders currently used by the set builders.

## Important caution

When generating a new set from a template, rewrite all internal references from the source set, not just the title text. This includes:

- subject tab labels
- href targets
- route paths
- compatibility filenames
