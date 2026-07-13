import { Router } from "express";
import { TeamType } from "@prisma/client";
import { prisma } from "../db.js";

const router = Router();

function formFromMatches(
  matches: {
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    date: Date;
  }[],
  teamId: string
) {
  return matches.map((m) => {
    const isHome = m.homeTeamId === teamId;
    const forScore = isHome ? m.homeScore : m.awayScore;
    const againstScore = isHome ? m.awayScore : m.homeScore;
    let result: "W" | "D" | "L" = "D";
    if (forScore > againstScore) result = "W";
    else if (forScore < againstScore) result = "L";
    return { result, date: m.date, forScore, againstScore };
  });
}

function winPctSeries(
  matches: {
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    date: Date;
  }[],
  teamId: string
) {
  let wins = 0;
  let played = 0;
  return matches.map((m) => {
    played++;
    const isHome = m.homeTeamId === teamId;
    const forScore = isHome ? m.homeScore : m.awayScore;
    const againstScore = isHome ? m.awayScore : m.homeScore;
    if (forScore > againstScore) wins++;
    return {
      date: m.date,
      winPercentage: Math.round((wins / played) * 1000) / 10,
      played,
    };
  });
}

router.get("/", async (req, res) => {
  try {
    const type = req.query.type as string | undefined;
    const league = req.query.league as string | undefined;
    const country = req.query.country as string | undefined;
    const confederation = req.query.confederation as string | undefined;
    const q = (req.query.q as string | undefined)?.trim();

    const sort = (req.query.sort as string | undefined) ?? "alpha";

    const where: Record<string, unknown> = {};
    if (type === "club" || type === "CLUB") where.type = TeamType.CLUB;
    if (type === "country" || type === "COUNTRY") where.type = TeamType.COUNTRY;
    if (league) where.league = league;
    if (country) where.country = country;
    if (confederation) where.confederation = confederation;
    if (q) {
      where.name = { contains: q };
    }

    const isCountry = where.type === TeamType.COUNTRY;
    const orderBy =
      sort === "grouped"
        ? isCountry
          ? [{ confederation: "asc" as const }, { fifaRank: "asc" as const }, { name: "asc" as const }]
          : [{ league: "asc" as const }, { fifaRank: "asc" as const }, { name: "asc" as const }]
        : [{ name: "asc" as const }];

    const teams = await prisma.team.findMany({
      where,
      include: { seasonStats: true },
      orderBy,
    });

    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

router.get("/filters", async (_req, res) => {
  try {
    const teams = await prisma.team.findMany({
      select: { league: true, country: true, type: true, confederation: true },
    });
    const leagues = [...new Set(teams.map((t) => t.league).filter(Boolean))].sort() as string[];
    const countries = [...new Set(teams.filter((t) => t.type === TeamType.CLUB).map((t) => t.country))].sort();
    const confederations = [
      ...new Set(teams.map((t) => t.confederation).filter(Boolean)),
    ].sort() as string[];
    res.json({ leagues, countries, confederations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch filters" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        seasonStats: true,
        players: {
          include: { abilities: true },
          orderBy: [{ position: "asc" }, { name: "asc" }],
        },
      },
    });
    if (!team) return res.status(404).json({ error: "Team not found" });

    const recentMatches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
      },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } },
      },
      orderBy: { date: "desc" },
      take: 10,
    });

    const chronological = [...recentMatches].reverse();
    const form = formFromMatches(chronological, team.id);
    const winPctOverTime = winPctSeries(
      await prisma.match.findMany({
        where: { OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }] },
        orderBy: { date: "asc" },
      }),
      team.id
    );

    res.json({
      ...team,
      recentForm: form,
      recentMatches,
      winPctOverTime,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

router.get("/:id/matches", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: req.params.id }, { awayTeamId: req.params.id }],
      },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } },
      },
      orderBy: { date: "desc" },
    });
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

export default router;
