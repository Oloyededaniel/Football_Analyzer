/**
 * Real match results from football-data.co.uk (no API key).
 * Season path e.g. 2526 = 2025/26.
 */

import { TOP5_CSV_LEAGUES, canonicalClubName, type LeagueCsv } from "./clubNames.js";

export type CsvMatch = {
  competition: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: Date;
  externalId: string;
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseDate(ddmmyyyy: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddmmyyyy.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3]);
  return new Date(Date.UTC(year, month, day, 15, 0, 0));
}

export async function fetchLeagueCsv(
  season: string,
  league: LeagueCsv
): Promise<CsvMatch[]> {
  const url = `https://www.football-data.co.uk/mmz4281/${season}/${league.file}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const idx = (name: string) => header.indexOf(name);
  const iDate = idx("Date");
  const iHome = idx("HomeTeam");
  const iAway = idx("AwayTeam");
  const iFTHG = idx("FTHG");
  const iFTAG = idx("FTAG");

  if ([iDate, iHome, iAway, iFTHG, iFTAG].some((i) => i < 0)) {
    throw new Error(`Unexpected CSV header for ${league.league}`);
  }

  const matches: CsvMatch[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = parseCsvLine(lines[r]);
    const homeRaw = cols[iHome]?.trim();
    const awayRaw = cols[iAway]?.trim();
    const hs = Number(cols[iFTHG]);
    const as = Number(cols[iFTAG]);
    const date = parseDate(cols[iDate] ?? "");
    if (!homeRaw || !awayRaw || !date || Number.isNaN(hs) || Number.isNaN(as)) continue;

    const homeTeam = canonicalClubName(homeRaw);
    const awayTeam = canonicalClubName(awayRaw);
    matches.push({
      competition: league.league,
      country: league.country,
      homeTeam,
      awayTeam,
      homeScore: hs,
      awayScore: as,
      date,
      externalId: `csv:${season}:${league.code}:${homeTeam}:${awayTeam}:${cols[iDate]}`,
    });
  }
  return matches;
}

export async function fetchTop5LeagueMatches(seasons: string[]): Promise<CsvMatch[]> {
  const all: CsvMatch[] = [];
  for (const season of seasons) {
    for (const league of TOP5_CSV_LEAGUES) {
      try {
        const rows = await fetchLeagueCsv(season, league);
        console.log(`  CSV ${season}/${league.file}: ${rows.length} matches`);
        all.push(...rows);
      } catch (err) {
        console.warn(`  skip ${season}/${league.file}:`, (err as Error).message);
      }
    }
  }
  return all;
}
