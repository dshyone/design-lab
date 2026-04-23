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
├── prototypes/       — prototype files live here
└── assets/           — reusable SVGs, templates, components
```

## Routes
- `/` — prototype dashboard (card grid, tag filter, search)
- `/prototype/:id` — full-screen detail page (metadata + iframe preview + shareable link)
- `/assets` — reference assets area (SVGs, HTML templates, Angular components)

## Key files
- `src/app/core/services/github.service.ts` — GitHub API read/write
- `src/app/core/services/prototype.service.ts` — signal-based prototype state
- `src/app/core/services/asset.service.ts` — signal-based asset state
- `src/app/core/services/ui-state.service.ts` — cross-component Add trigger
- `src/app/features/dashboard/` — prototype grid
- `src/app/features/prototype-detail/` — shareable detail page
- `src/app/features/assets/` — assets tab
- `src/app/features/add-prototype/` — add/edit prototype modal
- `src/app/features/add-asset/` — add/edit asset modal
- `src/environments/environment.ts` — GitHub owner/repo/branch config

## Data models
```typescript
Prototype { id, title, tags[], creator, date, description, folder, thumbnail? }
Asset     { id, name, type, description, file, tags?, addedBy, date }
```

## Adding content
- **Via UI**: "Add prototype" / "Add asset" button requires a GitHub PAT (entered once per session, stored in sessionStorage under key `dl_github_pat`)
- **Via CLI**: `node scripts/add-prototype.mjs --title "..." --folder "prototypes/..." --tags "..." --creator "Craig"`
- **Via CLI**: `node scripts/add-asset.mjs --name "..." --file "assets/..." --type svg`

## Creators (fixed list)
Craig, Chuka

## GitHub config
Owner: `dshyone` | Repo: `design-lab` | Branch: `main`
Update `src/environments/environment.ts` and `environment.prod.ts` when transferring to Ligentia org.

## PRD
Original PRD v0.2 is at `/Users/chukwukaezeoke/Downloads/Design_Lab_PRD_v0.2.docx`
v0 and v1 are shipped. Remaining v1 items and future work tracked in the PRD.

## Open items (as of April 2026)
- Add prototype UX flow not yet fully specced in PRD — revisit
- Transfer repo to Ligentia GitHub org (update environment files after)
- Creator filter (F-05) and sort controls (F-06) not yet built
- Figma component reference (F-13) — depends on Figma MCP availability
- Auth model for stakeholder sharing (F-15) — TBD
