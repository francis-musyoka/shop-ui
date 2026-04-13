# Shop UI

Next.js 16 frontend for the Riverflow marketplace. Pairs with `online-shop-backend`.

## Prerequisites

- Node.js 20+
- npm
- `gitleaks` binary (for pre-commit secret scanning — optional but recommended)
- The backend running locally (see `online-shop-backend/README.md`)

## Setup

```bash
cp .env.example .env.local
# Edit .env.local to point at your local backend URL
npm install
```

## Scripts

| Command                           | What it does                                          |
| --------------------------------- | ----------------------------------------------------- |
| `npm run dev`                     | Start the Next.js dev server on http://localhost:3000 |
| `npm run build`                   | Production build                                      |
| `npm run start`                   | Run the production build                              |
| `npm run lint` / `lint:fix`       | ESLint                                                |
| `npm run format` / `format:check` | Prettier                                              |
| `npm run typecheck`               | `tsc --noEmit`                                        |
| `npm test` / `test:watch`         | Vitest                                                |

## Architecture

Key folders:

- `src/app/` — Next.js App Router pages and layouts
- `src/lib/api/` — typed backend client (added in Plan 02)
- `src/lib/auth/` — session helpers (added in Plan 03)
- `src/components/` — UI primitives (shadcn) and domain components

## Git hooks

Managed by `lefthook`. See `lefthook.yml`. Pre-commit runs prettier, eslint, tsc on staged files, blocks `.env`, checks lockfile sync, scans for secrets. Commit-msg enforces Conventional Commits. Pre-push runs the test suite.
