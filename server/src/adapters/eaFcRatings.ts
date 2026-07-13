/**
 * Live EA Sports FC ratings via msmc community API (present game data).
 * https://api.msmc.cc/api/fc25/...
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const BASE = "https://api.msmc.cc/api/fc25";

export type EaFcCard = {
  name: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  team?: string;
  position?: string;
};

type CacheFile = Record<string, EaFcCard | null>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dirname, "../../prisma/data/eaFcCache.json");

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function cacheKey(name: string) {
  return name.trim().toLowerCase().normalize("NFC");
}

function stripDiacritics(s: string) {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

function nameVariants(name: string): string[] {
  const n = name.trim();
  const variants = [n, stripDiacritics(n)];
  // Prefer given + last for long names that often miss (e.g. "Martin Ødegaard")
  const parts = n.split(/\s+/);
  if (parts.length > 2) {
    variants.push(`${parts[0]} ${parts[parts.length - 1]}`);
    variants.push(stripDiacritics(`${parts[0]} ${parts[parts.length - 1]}`));
  }
  return [...new Set(variants.filter(Boolean))];
}

function loadCache(): CacheFile {
  try {
    if (existsSync(CACHE_PATH)) {
      return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as CacheFile;
    }
  } catch {
    /* ignore */
  }
  return {};
}

function saveCache(cache: CacheFile) {
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function parseCard(raw: Record<string, string>): EaFcCard | null {
  const overall = Number(raw.OVR);
  if (!Number.isFinite(overall) || overall <= 0) return null;
  const num = (k: string, fallback: number) => {
    const v = Number(raw[k]);
    return Number.isFinite(v) ? v : fallback;
  };
  return {
    name: raw.Name || "",
    overall,
    pace: num("PAC", overall),
    shooting: num("SHO", Math.max(40, overall - 10)),
    passing: num("PAS", overall - 5),
    dribbling: num("DRI", overall - 3),
    defending: num("DEF", Math.max(30, overall - 20)),
    physical: num("PHY", overall - 5),
    team: raw.Team,
    position: raw.Position,
  };
}

function pickBest(
  results: Record<string, string>[],
  hintTeam?: string
): EaFcCard | null {
  const cards = results.map(parseCard).filter((c): c is EaFcCard => Boolean(c));
  if (!cards.length) return null;
  if (hintTeam) {
    const needle = hintTeam.toLowerCase();
    const firstToken = needle.split(/\s+/)[0];
    const match = cards.find((c) =>
      (c.team ?? "").toLowerCase().includes(firstToken)
    );
    if (match) return match;
  }
  return cards.sort((a, b) => b.overall - a.overall)[0];
}

export class EaFcRatingsClient {
  private cache: CacheFile;
  private dirty = false;

  constructor() {
    this.cache = loadCache();
  }

  /** Drop cached misses so the next lookup retries the API. */
  clearMisses() {
    let changed = false;
    for (const [k, v] of Object.entries(this.cache)) {
      if (v === null) {
        delete this.cache[k];
        changed = true;
      }
    }
    if (changed) this.dirty = true;
  }

  private async fetchName(
    query: string,
    hintTeam?: string
  ): Promise<{ card: EaFcCard | null; permanentMiss: boolean }> {
    const url = `${BASE}/player/name/${encodeURIComponent(query)}`;
    try {
      const res = await fetch(url);
      // API limit: 150 req / 300s ≈ 1 every 2s
      await sleep(2100);
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after") || 70);
        console.warn(`  EA FC rate limited — waiting ${retryAfter}s…`);
        await sleep(retryAfter * 1000);
        return this.fetchName(query, hintTeam);
      }
      if (res.status === 404) {
        return { card: null, permanentMiss: true };
      }
      if (!res.ok) {
        return { card: null, permanentMiss: false };
      }
      const data = (await res.json()) as
        | Record<string, string>
        | Record<string, string>[]
        | { error?: string };

      if (
        !data ||
        (typeof data === "object" &&
          "error" in data &&
          (data as { error?: string }).error)
      ) {
        const err = (data as { error?: string })?.error ?? "";
        if (/too many requests/i.test(err)) {
          console.warn("  EA FC rate limited — waiting 70s…");
          await sleep(70_000);
          return this.fetchName(query, hintTeam);
        }
        return { card: null, permanentMiss: true };
      }

      const list = Array.isArray(data) ? data : [data as Record<string, string>];
      return { card: pickBest(list, hintTeam), permanentMiss: true };
    } catch {
      return { card: null, permanentMiss: false };
    }
  }

  async lookup(name: string, hintTeam?: string): Promise<EaFcCard | null> {
    const key = cacheKey(name);
    if (key in this.cache) return this.cache[key];

    for (const variant of nameVariants(name)) {
      const { card, permanentMiss } = await this.fetchName(variant, hintTeam);
      if (card) {
        this.cache[key] = card;
        this.dirty = true;
        return card;
      }
      if (!permanentMiss) {
        // Transient failure — do not cache a miss
        return null;
      }
    }

    this.cache[key] = null;
    this.dirty = true;
    return null;
  }

  flush() {
    if (this.dirty) saveCache(this.cache);
    this.dirty = false;
  }
}

export function abilitiesFromEaFc(card: EaFcCard) {
  return {
    pace: card.pace,
    shooting: card.shooting,
    passing: card.passing,
    dribbling: card.dribbling,
    defending: card.defending,
    physical: card.physical,
    overallRating: card.overall,
  };
}

/** Normalize EA FC position strings into pitch roles used by the lineup engine. */
export function preferredRoleFromEaFc(card: EaFcCard): string | null {
  const raw = (card.position ?? "").toUpperCase().trim();
  if (!raw) return null;
  const map: Record<string, string> = {
    GK: "GK",
    CB: "CB",
    RCB: "RCB",
    LCB: "LCB",
    LB: "LB",
    RB: "RB",
    LWB: "LWB",
    RWB: "RWB",
    CDM: "CDM",
    CM: "CM",
    RCM: "RCM",
    LCM: "LCM",
    CAM: "CAM",
    LM: "LM",
    RM: "RM",
    LW: "LW",
    RW: "RW",
    LF: "LW",
    RF: "RW",
    ST: "ST",
    CF: "CF",
    LS: "ST",
    RS: "ST",
  };
  return map[raw] ?? raw;
}
