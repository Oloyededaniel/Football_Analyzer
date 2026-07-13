/**
 * football-data.org v4 adapter (free tier with API token).
 * Register: https://www.football-data.org/client/register
 */

const BASE = "https://api.football-data.org/v4";

export const FD_COMPETITIONS = [
  { code: "PL", name: "Premier League", type: "CLUB" as const, country: "England" },
  { code: "PD", name: "La Liga", type: "CLUB" as const, country: "Spain" },
  { code: "SA", name: "Serie A", type: "CLUB" as const, country: "Italy" },
  { code: "BL1", name: "Bundesliga", type: "CLUB" as const, country: "Germany" },
  { code: "FL1", name: "Ligue 1", type: "CLUB" as const, country: "France" },
  { code: "CL", name: "UEFA Champions League", type: "CLUB" as const, country: "Europe" },
  { code: "EC", name: "UEFA European Championship", type: "COUNTRY" as const, country: "Europe" },
  { code: "WC", name: "FIFA World Cup", type: "COUNTRY" as const, country: "World" },
] as const;

export type FdTeam = {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
  area?: { name?: string };
  clubColors?: string;
};

export type FdMatch = {
  id: number;
  utcDate: string;
  status: string;
  competition?: { name?: string; code?: string };
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export class FootballDataOrgAdapter {
  constructor(private readonly apiKey: string) {}

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "X-Auth-Token": this.apiKey },
    });
    if (res.status === 429) {
      await sleep(65000);
      return this.get(path);
    }
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`football-data.org ${path}: ${res.status} ${body}`);
    }
    // Free tier: 10 calls/min — be polite
    await sleep(6500);
    return res.json() as Promise<T>;
  }

  async fetchCompetitionTeams(code: string) {
    return this.get<{ teams: FdTeam[] }>(`/competitions/${code}/teams`);
  }

  async fetchCompetitionMatches(code: string, status = "FINISHED") {
    return this.get<{ matches: FdMatch[] }>(
      `/competitions/${code}/matches?status=${status}`
    );
  }

  async fetchScorers(code: string) {
    return this.get<{
      scorers: {
        player: { id: number; name: string; nationality?: string; position?: string; dateOfBirth?: string };
        team: { id: number; name: string; crest?: string };
        goals: number;
      }[];
    }>(`/competitions/${code}/scorers?limit=20`);
  }
}
