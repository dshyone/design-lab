# Design Lab

Internal tool for the Ligentix product design team (Craig Wetherall, Chuka Ezeoke) to browse, share, and manage UI prototypes and design explorations built with Claude Code.

## Live URL
https://design-lab-rouge.vercel.app

## Repo
https://github.com/dshyone/design-lab (currently under Chuka's personal account; will move to Ligentia org)

## Stack
- Angular 17+ standalone components, signals-based state
- CSS custom properties (SwiftDS-aligned design tokens in `src/styles/tokens.css`)
- GitHub Contents API as backend (no server — reads/writes JSON files in this repo)
- Deployed to Vercel — auto-deploys on every push to `main`

## Architecture
```
GitHub repo (source of truth)
├── prototypes.json   — all prototype metadata
├── assets.json       — all reference asset metadata
├── prototypes/       — prototype files (each in its own subfolder)
└── assets/           — reusable SVGs, templates, components
```

## Routes
- `/` — prototype dashboard (card grid, tag filter, search)
- `/prototype/:id` — full-screen detail page (metadata + iframe preview + shareable link)
- `/assets` — reference assets area (SVGs, HTML templates, Angular components)

## Key files
- `src/app/core/services/github.service.ts` — GitHub API read/write (getPrototypes, savePrototypes, getAssets, saveAssets, uploadFile)
- `src/app/core/services/prototype.service.ts` — signal-based prototype state; addPrototype uploads file then updates JSON
- `src/app/core/services/asset.service.ts` — signal-based asset state
- `src/app/core/services/ui-state.service.ts` — cross-component Add button trigger (triggerAdd$ Subject)
- `src/app/features/dashboard/` — prototype grid; showModal/editingPrototype are signals (required for OnPush)
- `src/app/features/prototype-detail/` — shareable detail page; caches SafeResourceUrl to prevent iframe flicker
- `src/app/features/assets/` — assets tab
- `src/app/features/add-prototype/` — add/edit prototype modal with drag-and-drop HTML file upload
- `src/app/features/add-asset/` — add/edit asset modal
- `src/environments/environment.ts` — GitHub owner/repo/branch config
- `src/index.html` — has `<meta name="dl-shell">` so the detail page can detect when no prototype file exists

## Data models
```typescript
Prototype { id, title, tags[], creator, date, description, folder, thumbnail? }
Asset     { id, name, type, description, file, tags?, addedBy, date }
```

## Adding prototypes
- **Via UI**: Click "Add prototype" in the header. Drag-and-drop or browse for an `.html` file. The file is uploaded to `<folder>/index.html` on GitHub, then `prototypes.json` is updated. Requires a GitHub PAT (entered once per session, stored in `sessionStorage` as `dl_github_pat`).
- **Via CLI**: `node scripts/add-prototype.mjs --title "..." --folder "prototypes/..." --tags "..." --creator "Craig"`
- Folder is auto-slugified from the title; can be manually overridden.

## Adding assets
- **Via UI**: "Add asset" button on the Assets tab. Same PAT flow.
- **Via CLI**: `node scripts/add-asset.mjs --name "..." --file "assets/..." --type svg`

## Prototype preview (iframe)
- The detail page iframes `window.location.origin/<folder>/index.html` (served from Vercel's static output).
- `angular.json` includes `prototypes/` and `assets/` in the build assets array so files are bundled into the Vercel output.
- `vercel.json` rewrites only extensionless paths to `index.html` (`/((?!.*\..*).*)`), so `.html` prototype files are served directly.
- If no `index.html` exists for a prototype, Vercel serves the Angular shell. The shell has `<meta name="dl-shell">` so the detail page detects this on iframe load and shows "No explorations added yet".
- `SafeResourceUrl` is cached per folder in a `Map` — without this, Angular recreates the object on every change detection cycle, causing the iframe to reload (flicker).

## OnPush + signals pattern
All state that is mutated from RxJS subscriptions (e.g. `showModal`, `editingPrototype` in DashboardComponent) must be Angular signals, not plain properties. Plain property mutations are invisible to OnPush change detection until the next event cycle.

## Creators (fixed list)
Craig, Chuka

## GitHub config
Owner: `dshyone` | Repo: `design-lab` | Branch: `main`
Update `src/environments/environment.ts` and `environment.prod.ts` when transferring to Ligentia org.

## Deploying
Build: `npx @angular/cli build` (from the `design-lab` directory, with `source ~/.zshrc` to load Node).
Push triggers Vercel auto-deploy. Run push from the `design-lab` directory, not from `~`.

## PRD
Original PRD v0.2 is at `/Users/chukwukaezeoke/Downloads/Design_Lab_PRD_v0.2.docx`
v0 and v1 are shipped. Remaining items tracked in the PRD.

## Open items (as of April 2026)
- Transfer repo to Ligentia GitHub org (update environment files after)
- Creator filter (F-05) and sort controls (F-06) not yet built
- Figma component reference (F-13) — depends on Figma MCP availability
- Auth model for stakeholder sharing (F-15) — TBD
