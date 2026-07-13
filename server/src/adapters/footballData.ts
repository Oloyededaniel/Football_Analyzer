/**
 * Adapter entry — real sources live in sibling modules.
 * - footballDataCsv.ts      → football-data.co.uk (no key)
 * - footballDataOrg.ts      → football-data.org (free API token)
 * - theSportsDb.ts          → TheSportsDB squads (free key)
 */

export { fetchTop5LeagueMatches } from "./footballDataCsv.js";
export { FootballDataOrgAdapter, FD_COMPETITIONS } from "./footballDataOrg.js";
export { TheSportsDbAdapter, estimateAbilities } from "./theSportsDb.js";
