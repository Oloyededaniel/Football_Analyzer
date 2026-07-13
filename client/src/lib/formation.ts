import type { Player, Position } from "../types";

export type SlotRole =
  | "GK"
  | "CB"
  | "LCB"
  | "RCB"
  | "LB"
  | "RB"
  | "LWB"
  | "RWB"
  | "CDM"
  | "CM"
  | "LCM"
  | "RCM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "ST"
  | "CF";

export type FormationSlot = {
  role: SlotRole;
  /** 0–100 left → right */
  x: number;
  /** 0–100 top (attack) → bottom (GK) */
  y: number;
};

export type FormationId =
  | "4-3-3"
  | "4-2-3-1"
  | "4-4-2"
  | "3-5-2"
  | "3-4-3"
  | "5-2-3"
  | "4-1-4-1";

export const FORMATION_IDS: FormationId[] = [
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "3-5-2",
  "3-4-3",
  "5-2-3",
  "4-1-4-1",
];

export const FORMATIONS: Record<FormationId, FormationSlot[]> = {
  "4-3-3": [
    { role: "GK", x: 50, y: 90 },
    { role: "LB", x: 12, y: 72 },
    { role: "LCB", x: 35, y: 76 },
    { role: "RCB", x: 65, y: 76 },
    { role: "RB", x: 88, y: 72 },
    { role: "LCM", x: 28, y: 52 },
    { role: "CM", x: 50, y: 48 },
    { role: "RCM", x: 72, y: 52 },
    { role: "LW", x: 16, y: 22 },
    { role: "ST", x: 50, y: 14 },
    { role: "RW", x: 84, y: 22 },
  ],
  "4-2-3-1": [
    { role: "GK", x: 50, y: 90 },
    { role: "LB", x: 12, y: 72 },
    { role: "LCB", x: 35, y: 76 },
    { role: "RCB", x: 65, y: 76 },
    { role: "RB", x: 88, y: 72 },
    { role: "CDM", x: 38, y: 58 },
    { role: "CDM", x: 62, y: 58 },
    { role: "LM", x: 16, y: 36 },
    { role: "CAM", x: 50, y: 34 },
    { role: "RM", x: 84, y: 36 },
    { role: "ST", x: 50, y: 14 },
  ],
  "4-4-2": [
    { role: "GK", x: 50, y: 90 },
    { role: "LB", x: 12, y: 72 },
    { role: "LCB", x: 35, y: 76 },
    { role: "RCB", x: 65, y: 76 },
    { role: "RB", x: 88, y: 72 },
    { role: "LM", x: 14, y: 48 },
    { role: "LCM", x: 38, y: 50 },
    { role: "RCM", x: 62, y: 50 },
    { role: "RM", x: 86, y: 48 },
    { role: "ST", x: 38, y: 18 },
    { role: "ST", x: 62, y: 18 },
  ],
  "3-5-2": [
    { role: "GK", x: 50, y: 90 },
    { role: "LCB", x: 28, y: 74 },
    { role: "CB", x: 50, y: 78 },
    { role: "RCB", x: 72, y: 74 },
    { role: "LWB", x: 10, y: 48 },
    { role: "CDM", x: 38, y: 54 },
    { role: "CM", x: 50, y: 46 },
    { role: "CDM", x: 62, y: 54 },
    { role: "RWB", x: 90, y: 48 },
    { role: "ST", x: 38, y: 16 },
    { role: "ST", x: 62, y: 16 },
  ],
  "3-4-3": [
    { role: "GK", x: 50, y: 90 },
    { role: "LCB", x: 28, y: 74 },
    { role: "CB", x: 50, y: 78 },
    { role: "RCB", x: 72, y: 74 },
    { role: "LM", x: 14, y: 50 },
    { role: "LCM", x: 38, y: 52 },
    { role: "RCM", x: 62, y: 52 },
    { role: "RM", x: 86, y: 50 },
    { role: "LW", x: 18, y: 20 },
    { role: "CF", x: 50, y: 14 },
    { role: "RW", x: 82, y: 20 },
  ],
  "5-2-3": [
    { role: "GK", x: 50, y: 90 },
    { role: "LWB", x: 8, y: 68 },
    { role: "LCB", x: 28, y: 76 },
    { role: "CB", x: 50, y: 78 },
    { role: "RCB", x: 72, y: 76 },
    { role: "RWB", x: 92, y: 68 },
    { role: "CM", x: 38, y: 50 },
    { role: "CM", x: 62, y: 50 },
    { role: "LW", x: 18, y: 22 },
    { role: "CF", x: 50, y: 14 },
    { role: "RW", x: 82, y: 22 },
  ],
  "4-1-4-1": [
    { role: "GK", x: 50, y: 90 },
    { role: "LB", x: 12, y: 72 },
    { role: "LCB", x: 35, y: 76 },
    { role: "RCB", x: 65, y: 76 },
    { role: "RB", x: 88, y: 72 },
    { role: "CDM", x: 50, y: 58 },
    { role: "LM", x: 14, y: 38 },
    { role: "LCM", x: 38, y: 40 },
    { role: "RCM", x: 62, y: 40 },
    { role: "RM", x: 86, y: 38 },
    { role: "ST", x: 50, y: 14 },
  ],
};

const ROLE_POSITIONS: Record<SlotRole, Position[]> = {
  GK: ["GK"],
  CB: ["DEF"],
  LCB: ["DEF"],
  RCB: ["DEF"],
  LB: ["DEF"],
  RB: ["DEF"],
  LWB: ["DEF", "MID"],
  RWB: ["DEF", "MID"],
  CDM: ["MID"],
  CM: ["MID"],
  LCM: ["MID"],
  RCM: ["MID"],
  CAM: ["MID", "FWD"],
  LM: ["MID", "FWD"],
  RM: ["MID", "FWD"],
  LW: ["FWD", "MID"],
  RW: ["FWD", "MID"],
  ST: ["FWD"],
  CF: ["FWD"],
};

/** Fill specialized roles first so a striker isn't stolen by LW. */
const SLOT_FILL_PRIORITY: Record<SlotRole, number> = {
  GK: 0,
  ST: 1,
  CF: 1,
  CB: 2,
  LCB: 2,
  RCB: 2,
  CDM: 3,
  CAM: 4,
  CM: 5,
  LCM: 5,
  RCM: 5,
  LW: 6,
  RW: 6,
  LM: 7,
  RM: 7,
  LB: 8,
  RB: 8,
  LWB: 8,
  RWB: 8,
};

/** Roles that naturally substitute for each other. */
const ROLE_FAMILY: Record<string, SlotRole[]> = {
  GK: ["GK"],
  CB: ["CB", "LCB", "RCB"],
  LCB: ["LCB", "CB", "RCB"],
  RCB: ["RCB", "CB", "LCB"],
  LB: ["LB", "LWB", "LM"],
  RB: ["RB", "RWB", "RM"],
  LWB: ["LWB", "LB", "LM"],
  RWB: ["RWB", "RB", "RM"],
  CDM: ["CDM", "CM", "LCM", "RCM"],
  CM: ["CM", "LCM", "RCM", "CDM", "CAM"],
  LCM: ["LCM", "CM", "CDM", "CAM"],
  RCM: ["RCM", "CM", "CDM", "CAM"],
  CAM: ["CAM", "CM", "CF", "ST"],
  LM: ["LM", "LW", "LWB", "LCM"],
  RM: ["RM", "RW", "RWB", "RCM"],
  LW: ["LW", "LM"],
  RW: ["RW", "RM"],
  ST: ["ST", "CF"],
  CF: ["CF", "ST", "CAM"],
};

/**
 * Manual role overrides for players missing / wrong in EA cache.
 * Keys are lowercase full names.
 */
const ROLE_OVERRIDES: Record<string, SlotRole> = {
  "wojciech szczęsny": "GK",
  "vinícius júnior": "LW",
  "vinicius junior": "LW",
  "jude bellingham": "CAM",
  "declan rice": "CDM",
  "rodri": "CDM",
  "aurélien tchouaméni": "CDM",
  "joshua kimmich": "RB",
  "alphonso davies": "LB",
  "trent alexander-arnold": "RB",
  "andy robertson": "LB",
  "josko gvardiol": "LB",
  "alejandro balde": "LB",
  "éder militão": "CB",
  "eder militao": "CB",
  "dani carvajal": "RB",
  "kim min-jae": "CB",
  "ben white": "RB",
  "gabriel magalhães": "CB",
  "kai havertz": "ST",
  "omar marmoush": "ST",
  "cody gakpo": "LW",
  "darwin núñez": "ST",
  "nicola zalewski": "LM",
};

export type PlacedPlayer = {
  slot: FormationSlot;
  player: Player;
};

export type LineupResult = {
  formation: FormationId;
  starters: PlacedPlayer[];
  bench: Player[];
};

function ovr(p: Player) {
  return p.abilities?.overallRating ?? 0;
}

function normalizeRole(role: string | null | undefined): string | null {
  if (!role) return null;
  const r = role.toUpperCase().trim();
  if (r === "LF") return "LW";
  if (r === "RF") return "RW";
  if (r === "LS" || r === "RS") return "ST";
  return r;
}

function playerPreferredRole(player: Player): string | null {
  const override = ROLE_OVERRIDES[player.name.trim().toLowerCase().normalize("NFC")];
  if (override) return override;
  return normalizeRole(player.preferredRole);
}

function abilityFit(player: Player, role: SlotRole): number {
  const a = player.abilities;
  if (!a) return ovr(player);
  const { pace, shooting, passing, dribbling, defending, physical, overallRating } = a;
  switch (role) {
    case "GK":
      return overallRating * 1.2 + defending * 0.15;
    case "CB":
    case "LCB":
    case "RCB":
      return defending * 1.2 + physical * 0.5 + overallRating * 0.35;
    case "LB":
    case "RB":
    case "LWB":
    case "RWB":
      return defending * 0.7 + pace * 0.5 + passing * 0.3 + overallRating * 0.35;
    case "CDM":
      return defending * 0.8 + passing * 0.5 + physical * 0.3 + overallRating * 0.45;
    case "CM":
    case "LCM":
    case "RCM":
      return passing * 0.8 + dribbling * 0.3 + defending * 0.25 + overallRating * 0.55;
    case "CAM":
      return passing * 0.6 + dribbling * 0.5 + shooting * 0.4 + overallRating * 0.45;
    case "LM":
    case "RM":
      return pace * 0.5 + passing * 0.4 + dribbling * 0.4 + overallRating * 0.45;
    case "LW":
    case "RW":
      return pace * 0.7 + dribbling * 0.6 + shooting * 0.25 + overallRating * 0.45;
    case "ST":
    case "CF":
      return shooting * 1.2 + physical * 0.35 + dribbling * 0.2 + overallRating * 0.5;
    default:
      return overallRating;
  }
}

function isStrongConflict(preferred: string, role: SlotRole): boolean {
  if ((preferred === "ST" || preferred === "CF") && (role === "LW" || role === "RW" || role === "LM" || role === "RM")) {
    return true;
  }
  if ((preferred === "LW" || preferred === "RW") && (role === "CB" || role === "LCB" || role === "RCB" || role === "CDM")) {
    return true;
  }
  if (preferred === "GK" && role !== "GK") return true;
  if (role === "GK" && preferred !== "GK") return true;
  return false;
}

function pickBestForRole(
  pool: Player[],
  used: Set<string>,
  role: SlotRole
): Player | null {
  const available = pool.filter((p) => !used.has(p.id));
  if (!available.length) return null;

  // Goalkeepers: always best OVR among GKs
  if (role === "GK") {
    const gks = available.filter((p) => p.position === "GK");
    return [...gks].sort((a, b) => ovr(b) - ovr(a) || a.name.localeCompare(b.name))[0] ?? null;
  }

  const macroOk = (p: Player) => ROLE_POSITIONS[role].includes(p.position);

  const exact = available.filter((p) => playerPreferredRole(p) === role && macroOk(p));
  const family = available.filter((p) => {
    const pref = playerPreferredRole(p);
    if (!macroOk(p)) return false;
    if (!pref) return false;
    if (pref === role) return false;
    return (ROLE_FAMILY[pref] ?? []).includes(role) && !isStrongConflict(pref, role);
  });
  const unset = available.filter((p) => !playerPreferredRole(p) && macroOk(p));
  const flexible = available.filter((p) => {
    const pref = playerPreferredRole(p);
    if (!macroOk(p)) return false;
    if (!pref) return false;
    if (pref === role) return false;
    if ((ROLE_FAMILY[pref] ?? []).includes(role)) return false;
    return !isStrongConflict(pref, role);
  });

  const tiers = [exact, [...family, ...unset], flexible];
  for (const tier of tiers) {
    if (!tier.length) continue;
    return [...tier].sort(
      (a, b) =>
        abilityFit(b, role) - abilityFit(a, role) ||
        ovr(b) - ovr(a) ||
        a.name.localeCompare(b.name)
    )[0];
  }

  // Last resort: any non-GK outfielder
  const rest = available.filter((p) => p.position !== "GK");
  return [...rest].sort((a, b) => ovr(b) - ovr(a))[0] ?? null;
}

/** Choose a formation that fits the squad shape when no preferred formation is set. */
export function inferFormation(players: Player[]): FormationId {
  // Use only the likely starting pool (top OVR per group) so deep benches don't force 5-at-the-back
  const byPos = { GK: [] as Player[], DEF: [] as Player[], MID: [] as Player[], FWD: [] as Player[] };
  for (const p of players) byPos[p.position].push(p);
  for (const key of Object.keys(byPos) as (keyof typeof byPos)[]) {
    byPos[key].sort((a, b) => ovr(b) - ovr(a));
  }
  const n = {
    DEF: byPos.DEF.slice(0, 5).length,
    MID: byPos.MID.slice(0, 5).length,
    FWD: byPos.FWD.slice(0, 4).length,
  };
  if (n.DEF >= 5 && n.FWD >= 3 && n.MID <= 2) return "5-2-3";
  if (n.DEF >= 3 && n.MID >= 5 && n.FWD >= 2) return "3-5-2";
  if (n.MID >= 5 && n.FWD >= 1) return "4-2-3-1";
  if (n.FWD >= 2 && n.MID >= 4) return "4-4-2";
  return "4-3-3";
}

export function buildLineup(
  players: Player[],
  formationId?: FormationId | null
): LineupResult {
  const formation = formationId ?? inferFormation(players);
  const slots = FORMATIONS[formation];
  const pool = [...players];
  const used = new Set<string>();

  const ordered = slots
    .map((slot, index) => ({ slot, index }))
    .sort(
      (a, b) =>
        SLOT_FILL_PRIORITY[a.slot.role] - SLOT_FILL_PRIORITY[b.slot.role] ||
        a.index - b.index
    );

  const placedByIndex: (PlacedPlayer | null)[] = slots.map(() => null);

  for (const { slot, index } of ordered) {
    const player = pickBestForRole(pool, used, slot.role);
    if (!player) continue;
    used.add(player.id);
    placedByIndex[index] = { slot, player };
  }

  const starters = placedByIndex.filter((p): p is PlacedPlayer => Boolean(p));
  const bench = pool
    .filter((p) => !used.has(p.id))
    .sort((a, b) => ovr(b) - ovr(a) || a.name.localeCompare(b.name));

  return { formation, starters, bench };
}

export function shortPitchName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].toUpperCase();
  const first = parts[0][0]?.toUpperCase() ?? "";
  const last = parts[parts.length - 1].toUpperCase();
  return `${first}. ${last}`;
}

/** Exported for tests / debugging */
export { playerPreferredRole, pickBestForRole };
