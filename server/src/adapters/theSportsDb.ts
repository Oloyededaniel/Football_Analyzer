/**
 * TheSportsDB free API — real squad names (limited on free key).
 * Docs: https://www.thesportsdb.com/api.php
 */

import { canonicalClubName, SEARCH_FALLBACKS } from "./clubNames.js";

const BASE = "https://www.thesportsdb.com/api/v1/json";

export type TsdPlayer = {
  idPlayer: string;
  strPlayer: string;
  strPosition?: string | null;
  strNationality?: string | null;
  dateBorn?: string | null;
  strThumb?: string | null;
};

function mapPosition(raw?: string | null): "GK" | "DEF" | "MID" | "FWD" {
  const p = (raw ?? "").toLowerCase();
  if (p.includes("goal")) return "GK";
  if (p.includes("back") || p.includes("defend") || p.includes("centre-back") || p.includes("full"))
    return "DEF";
  if (p.includes("mid") || p.includes("wing") && p.includes("back") === false) {
    if (p.includes("wing") && (p.includes("forward") || p.includes("attack"))) return "FWD";
    return "MID";
  }
  if (
    p.includes("forward") ||
    p.includes("striker") ||
    p.includes("attacker") ||
    p.includes("winger")
  )
    return "FWD";
  if (p.includes("manager") || p.includes("coach")) return "MID";
  return "MID";
}

function ageFromBorn(dateBorn?: string | null): number {
  if (!dateBorn) return 25;
  const d = new Date(dateBorn);
  if (Number.isNaN(d.getTime())) return 25;
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return Math.min(45, Math.max(16, age));
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export class TheSportsDbAdapter {
  constructor(private readonly apiKey = process.env.THESPORTSDB_API_KEY || "3") {}

  async searchTeam(name: string): Promise<{ idTeam: string; strTeam: string; strBadge?: string } | null> {
    const candidates = [
      canonicalClubName(name),
      name,
      ...(SEARCH_FALLBACKS[name] ?? []),
      ...(SEARCH_FALLBACKS[canonicalClubName(name)] ?? []),
    ];
    const tried = new Set<string>();

    for (const candidate of candidates) {
      const qName = candidate.trim();
      if (!qName || tried.has(qName.toLowerCase())) continue;
      tried.add(qName.toLowerCase());
      const q = encodeURIComponent(qName);
      const res = await fetch(`${BASE}/${this.apiKey}/searchteams.php?t=${q}`);
      if (!res.ok) continue;
      const data = (await res.json()) as {
        teams?: { idTeam: string; strTeam: string; strBadge?: string; strSport?: string }[];
      };
      await sleep(350);
      const football = (data.teams ?? []).find(
        (t) => !t.strSport || t.strSport.toLowerCase() === "soccer"
      );
      if (football) return football;
    }
    return null;
  }

  async lookupPlayers(teamId: string): Promise<
    {
      externalId: string;
      name: string;
      position: "GK" | "DEF" | "MID" | "FWD";
      age: number;
      nationality: string;
    }[]
  > {
    const res = await fetch(`${BASE}/${this.apiKey}/lookup_all_players.php?id=${teamId}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { player?: TsdPlayer[] };
    await sleep(400);
    const players = data.player ?? [];
    return players
      .filter((p) => p.strPlayer && !/manager|coach/i.test(p.strPosition ?? ""))
      .map((p) => ({
        externalId: `tsd:${p.idPlayer}`,
        name: p.strPlayer,
        position: mapPosition(p.strPosition),
        age: ageFromBorn(p.dateBorn),
        nationality: p.strNationality || "Unknown",
      }));
  }
}

/** Estimate FIFA-style ratings (APIs do not provide EA ratings). */
export function estimateAbilities(position: "GK" | "DEF" | "MID" | "FWD", seed: number) {
  let s = seed || 1;
  const r = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  const base = 68 + Math.floor(r() * 12);
  const bump = (n: number) => Math.min(92, Math.max(45, n + Math.floor(r() * 8) - 3));
  let pace = base,
    shooting = base,
    passing = base,
    dribbling = base,
    defending = base,
    physical = base;
  if (position === "GK") {
    pace = bump(base - 12);
    shooting = bump(base - 18);
    defending = bump(base + 10);
    physical = bump(base + 6);
  } else if (position === "DEF") {
    defending = bump(base + 12);
    physical = bump(base + 8);
    shooting = bump(base - 8);
  } else if (position === "MID") {
    passing = bump(base + 10);
    dribbling = bump(base + 6);
  } else {
    pace = bump(base + 10);
    shooting = bump(base + 12);
    dribbling = bump(base + 8);
    defending = bump(base - 10);
  }
  const overallRating = Math.round(
    (pace + shooting + passing + dribbling + defending + physical) / 6
  );
  return { pace, shooting, passing, dribbling, defending, physical, overallRating };
}
