/**
 * Match score + stats predictor.
 * Uses a Dixon–Coles–style independent Poisson model from team attack/defence rates,
 * adjusted by FIFA rank (nations) and recent form / H2H.
 */

import { prisma } from "../db.js";

export type PredictionResult = {
  homeTeam: { id: string; name: string; type: string; fifaRank: number | null; logoUrl: string | null };
  awayTeam: { id: string; name: string; type: string; fifaRank: number | null; logoUrl: string | null };
  predictedScore: { home: number; away: number };
  expectedGoals: { home: number; away: number };
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
    btts: number;
  };
  scoreMatrix: { home: number; away: number; probability: number }[];
  predictedStats: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    corners: { home: number; away: number };
    fouls: { home: number; away: number };
  };
  form: {
    home: ("W" | "D" | "L")[];
    away: ("W" | "D" | "L")[];
  };
  h2h: {
    played: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    avgGoals: number;
  };
  confidence: number;
  model: string;
};

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function roundPct(n: number) {
  return Math.round(n * 1000) / 10;
}

async function teamRates(teamId: string) {
  const matches = await prisma.match.findMany({
    where: { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
    orderBy: { date: "desc" },
  });

  let gf = 0;
  let ga = 0;
  let played = 0;
  const form: ("W" | "D" | "L")[] = [];

  for (const m of matches) {
    const isHome = m.homeTeamId === teamId;
    const forScore = isHome ? m.homeScore : m.awayScore;
    const against = isHome ? m.awayScore : m.homeScore;
    gf += forScore;
    ga += against;
    played++;
    if (form.length < 5) {
      form.push(forScore > against ? "W" : forScore < against ? "L" : "D");
    }
  }

  const avgFor = played ? gf / played : 1.2;
  const avgAgainst = played ? ga / played : 1.2;
  return { avgFor, avgAgainst, played, form, matches };
}

export async function predictMatch(homeTeamId: string, awayTeamId: string): Promise<PredictionResult> {
  if (homeTeamId === awayTeamId) {
    throw new Error("Pick two different teams");
  }

  const [homeTeam, awayTeam] = await Promise.all([
    prisma.team.findUnique({ where: { id: homeTeamId } }),
    prisma.team.findUnique({ where: { id: awayTeamId } }),
  ]);
  if (!homeTeam || !awayTeam) throw new Error("Team not found");
  if (homeTeam.type !== awayTeam.type) {
    throw new Error("Compare club vs club or country vs country");
  }

  const [home, away] = await Promise.all([teamRates(homeTeamId), teamRates(awayTeamId)]);

  // League/scope averages
  const scopeMatches = await prisma.match.findMany({
    where: { matchType: homeTeam.type === "CLUB" ? "CLUB" : "COUNTRY" },
    take: 2000,
  });
  let scopeGf = 0;
  for (const m of scopeMatches) scopeGf += m.homeScore + m.awayScore;
  const scopeAvg = scopeMatches.length ? scopeGf / (scopeMatches.length * 2) : 1.35;
  const homeAdv = homeTeam.type === "CLUB" ? 1.12 : 1.05;

  let attackHome = home.avgFor / scopeAvg;
  let defenseHome = home.avgAgainst / scopeAvg;
  let attackAway = away.avgFor / scopeAvg;
  let defenseAway = away.avgAgainst / scopeAvg;

  // FIFA rank adjustment for nations (lower rank = stronger)
  if (homeTeam.type === "COUNTRY" && homeTeam.fifaRank && awayTeam.fifaRank) {
    const rankDiff = awayTeam.fifaRank - homeTeam.fifaRank; // positive => home stronger
    const adj = clamp(1 + rankDiff * 0.004, 0.75, 1.35);
    attackHome *= adj;
    defenseAway *= adj;
    attackAway /= adj;
    defenseHome /= adj;
  }

  // Recent form nudge
  const formScore = (f: ("W" | "D" | "L")[]) =>
    f.reduce((s, r) => s + (r === "W" ? 1 : r === "D" ? 0.4 : 0), 0) / Math.max(1, f.length);
  const formAdj = 1 + (formScore(home.form) - formScore(away.form)) * 0.12;
  attackHome *= formAdj;
  attackAway /= formAdj;

  // H2H
  const h2hMatches = await prisma.match.findMany({
    where: {
      OR: [
        { homeTeamId, awayTeamId },
        { homeTeamId: awayTeamId, awayTeamId: homeTeamId },
      ],
    },
  });
  let h2hHomeWins = 0;
  let h2hAwayWins = 0;
  let h2hDraws = 0;
  let h2hGoals = 0;
  for (const m of h2hMatches) {
    h2hGoals += m.homeScore + m.awayScore;
    const homeIsA = m.homeTeamId === homeTeamId;
    const a = homeIsA ? m.homeScore : m.awayScore;
    const b = homeIsA ? m.awayScore : m.homeScore;
    if (a > b) h2hHomeWins++;
    else if (a < b) h2hAwayWins++;
    else h2hDraws++;
  }
  if (h2hMatches.length >= 2) {
    const h2hEdge = (h2hHomeWins - h2hAwayWins) / h2hMatches.length;
    attackHome *= 1 + h2hEdge * 0.08;
    attackAway *= 1 - h2hEdge * 0.08;
  }

  let lambdaHome = clamp(attackHome * defenseAway * scopeAvg * homeAdv, 0.2, 4.5);
  let lambdaAway = clamp(attackAway * defenseHome * scopeAvg, 0.15, 4.2);

  // If little history, fall back toward averages
  if (home.played < 3 || away.played < 3) {
    lambdaHome = clamp((lambdaHome + scopeAvg * homeAdv) / 2, 0.4, 3);
    lambdaAway = clamp((lambdaAway + scopeAvg) / 2, 0.3, 3);
  }

  const maxGoals = 6;
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over25 = 0;
  let btts = 0;
  const matrix: { home: number; away: number; probability: number }[] = [];

  for (let hg = 0; hg <= maxGoals; hg++) {
    for (let ag = 0; ag <= maxGoals; ag++) {
      const p = poissonPmf(hg, lambdaHome) * poissonPmf(ag, lambdaAway);
      matrix.push({ home: hg, away: ag, probability: p });
      if (hg > ag) homeWin += p;
      else if (hg < ag) awayWin += p;
      else draw += p;
      if (hg + ag >= 3) over25 += p;
      if (hg > 0 && ag > 0) btts += p;
    }
  }

  const totalP = homeWin + draw + awayWin || 1;
  homeWin /= totalP;
  draw /= totalP;
  awayWin /= totalP;

  matrix.sort((a, b) => b.probability - a.probability);
  const top = matrix[0];
  const predictedScore = { home: top.home, away: top.away };

  // Expected match stats (heuristic from strength + lambda)
  const strengthHome = lambdaHome / (lambdaHome + lambdaAway);
  const possessionHome = Math.round(clamp(38 + strengthHome * 24 + (homeAdv - 1) * 20, 35, 68));
  const possessionAway = 100 - possessionHome;
  const shotsHome = Math.round(clamp(7 + lambdaHome * 4.2, 5, 22));
  const shotsAway = Math.round(clamp(6 + lambdaAway * 4.0, 4, 20));
  const sotHome = Math.round(clamp(shotsHome * (0.32 + strengthHome * 0.1), 1, 12));
  const sotAway = Math.round(clamp(shotsAway * (0.3 + (1 - strengthHome) * 0.1), 1, 11));
  const cornersHome = Math.round(clamp(3 + lambdaHome * 1.4, 2, 10));
  const cornersAway = Math.round(clamp(2.5 + lambdaAway * 1.3, 1, 9));
  const foulsHome = Math.round(clamp(11 + (1 - strengthHome) * 4, 8, 18));
  const foulsAway = Math.round(clamp(11 + strengthHome * 4, 8, 18));

  const sampleSize = Math.min(home.played, away.played);
  const confidence = clamp(0.35 + sampleSize * 0.04 + (h2hMatches.length > 0 ? 0.08 : 0), 0.35, 0.88);

  return {
    homeTeam: {
      id: homeTeam.id,
      name: homeTeam.name,
      type: homeTeam.type,
      fifaRank: homeTeam.fifaRank,
      logoUrl: homeTeam.logoUrl,
    },
    awayTeam: {
      id: awayTeam.id,
      name: awayTeam.name,
      type: awayTeam.type,
      fifaRank: awayTeam.fifaRank,
      logoUrl: awayTeam.logoUrl,
    },
    predictedScore,
    expectedGoals: { home: round1(lambdaHome), away: round1(lambdaAway) },
    probabilities: {
      homeWin: roundPct(homeWin),
      draw: roundPct(draw),
      awayWin: roundPct(awayWin),
      over25: roundPct(over25),
      under25: roundPct(1 - over25),
      btts: roundPct(btts),
    },
    scoreMatrix: matrix.slice(0, 8).map((s) => ({
      ...s,
      probability: roundPct(s.probability / totalP),
    })),
    predictedStats: {
      possession: { home: possessionHome, away: possessionAway },
      shots: { home: shotsHome, away: shotsAway },
      shotsOnTarget: { home: sotHome, away: sotAway },
      corners: { home: cornersHome, away: cornersAway },
      fouls: { home: foulsHome, away: foulsAway },
    },
    form: { home: home.form, away: away.form },
    h2h: {
      played: h2hMatches.length,
      homeWins: h2hHomeWins,
      awayWins: h2hAwayWins,
      draws: h2hDraws,
      avgGoals: h2hMatches.length ? round1(h2hGoals / h2hMatches.length) : 0,
    },
    confidence: roundPct(confidence),
    model: "Poisson attack–defence (form + H2H + FIFA rank)",
  };
}
