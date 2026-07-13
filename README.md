# Football Analyzer

Track and visualize performance for **club** and **national** teams: records, goals, player abilities, head-to-head results, and analytics.

**Default setup pulls real match results** (no paid API keys).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express |
| Database | SQLite via Prisma (swap-ready for Postgres) |
| State | React Context (team type filter + player compare selection) |

## Quick start (real data)

```bash
npm run setup    # install + db + sync:real
npm run dev
```

Or step by step:

```bash
npm install
npm run db:generate
npm run db:push
npm run sync:real
npm run dev
```

Then open:

- **App:** http://localhost:5173  
- **API:** http://localhost:3001/api/health  

`npm run sync:real` downloads current top-5 league results and can take a few minutes (squad fetch is rate-limited).

## Match predictor

Open **Predict** in the nav (or `/predict`). Pick two clubs or two nations to get:

- Most likely scoreline + expected goals (xG)
- Win / draw / away probabilities, Over/Under 2.5, BTTS
- Predicted possession, shots, shots on target, corners, fouls
- Recent form badges + H2H summary

Model: Poisson attack–defence rates from real results, adjusted by form, H2H, and FIFA rank (nations).

## Real data sources

| Source | What you get | Key required? |
|--------|----------------|---------------|
| [football-data.co.uk](https://www.football-data.co.uk/) CSV | **Real finished matches** — Premier League, La Liga, Serie A, Bundesliga, Ligue 1 (2024/25 + 2025/26 by default) | **No** |
| Bundled FIFA ranking list | Top 200 national teams + confederations (June 2026 cycle) | **No** |
| Bundled major-club squads | Real player names/positions for big clubs (Player Analyzer) | **No** |
| [TheSportsDB](https://www.thesportsdb.com/) | Optional extra squads/badges (often rate-limited on free key) | Free key `3` |
| [football-data.org](https://www.football-data.org/client/register) | UEFA Champions League, World Cup, Euro finished matches + crests | **Free** token (optional) |

### Optional: football-data.org (UCL / WC / Euro)

1. Register at https://www.football-data.org/client/register (free forever tier).  
2. Add to `server/.env`:

```env
FOOTBALL_DATA_API_KEY=your_token_here
```

3. Re-run:

```bash
npm run sync:real
```

### Ability ratings note

EA/FIFA-style 0–100 attribute ratings are **not** available from free APIs. Real player **names / positions / ages / nationality** are imported; radar values are **estimated** from position so the Player Analyzer UI still works.

### Mock fallback

```bash
npm run setup:mock   # or: npm run seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Install, push schema, **sync real data** |
| `npm run sync:real` | Re-download real results/squads into SQLite |
| `npm run seed` | Load generated mock data instead |
| `npm run setup:mock` | Install + mock seed |
| `npm run dev` | API + Vite client |
| `npm run db:push` | Apply Prisma schema |

Env knobs in `server/.env`:

- `FOOTBALL_CSV_SEASONS=2526,2425` — CSV seasons to import  
- `SYNC_SKIP_SQUADS=1` — skip TheSportsDB player download  
- `SYNC_SQUAD_LIMIT=20` — only first N clubs for faster testing  

## API overview

- `GET /api/teams?type=CLUB|COUNTRY&league=&country=&q=`  
- `GET /api/teams/:id` — detail, season stats, recent form, win% series  
- `GET /api/teams/:id/matches`  
- `GET /api/players?teamId=&q=&position=`  
- `GET /api/players/compare?ids=id1,id2`  
- `GET /api/matches?type=&teamId=`  
- `GET /api/matches/h2h?teamA=&teamB=`  
- `GET /api/analytics/top-scorers?type=`  
- `GET /api/analytics/best-win-pct?type=`  
- `GET /api/analytics/top-players?position=&type=`  

## Features

1. **Team Dashboard** — Club/Country toggle, search/filter, W-D-L from real results  
2. **Team Detail** — Record, goals, win% over time, recent form  
3. **Player Analyzer** — Real squad names (where available) + estimated ability radar  
4. **Comparison** — Overlay radars + attribute table  
5. **Match Analysis** — Real scores + head-to-head  
6. **Analytics** — Win% leaders; top scorers when goal events exist  

## Swap SQLite → Postgres later

1. In `server/prisma/schema.prisma`, set `provider = "postgresql"`.  
2. Set `DATABASE_URL` in `server/.env`.  
3. Run `npm run db:push` then `npm run sync:real`.

## Project layout

```
Football_Analyzer/
├── client/                 # React + Vite UI
├── server/
│   ├── prisma/             # schema + optional mock seed
│   └── src/
│       ├── adapters/       # CSV, football-data.org, TheSportsDB
│       ├── sync/           # syncRealData.ts
│       └── routes/         # REST API
└── package.json
```
