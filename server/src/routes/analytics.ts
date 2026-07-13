import { Router } from "express";
import { Position, TeamType } from "@prisma/client";
import { prisma } from "../db.js";

const router = Router();

router.get("/top-scorers", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 15, 50);
    const type = req.query.type as string | undefined;

    const teamTypeFilter =
      type === "club" || type === "CLUB"
        ? TeamType.CLUB
        : type === "country" || type === "COUNTRY"
          ? TeamType.COUNTRY
          : undefined;

    const events = await prisma.matchEvent.findMany({
      include: {
        player: {
          include: {
            team: { select: { id: true, name: true, type: true, logoUrl: true } },
            abilities: { select: { overallRating: true } },
          },
        },
      },
    });

    const totals = new Map<
      string,
      {
        playerId: string;
        name: string;
        position: string;
        team: { id: string; name: string; type: TeamType; logoUrl: string | null };
        goals: number;
        overallRating: number | null;
      }
    >();

    for (const e of events) {
      if (teamTypeFilter && e.player.team.type !== teamTypeFilter) continue;
      const existing = totals.get(e.playerId);
      if (existing) {
        existing.goals += e.goals;
      } else {
        totals.set(e.playerId, {
          playerId: e.player.id,
          name: e.player.name,
          position: e.player.position,
          team: e.player.team,
          goals: e.goals,
          overallRating: e.player.abilities?.overallRating ?? null,
        });
      }
    }

    const rows = [...totals.values()]
      .sort((a, b) => b.goals - a.goals)
      .slice(0, limit);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top scorers" });
  }
});

router.get("/best-win-pct", async (req, res) => {
  try {
    const type = req.query.type as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const where: Record<string, unknown> = {};
    if (type === "club" || type === "CLUB") where.type = TeamType.CLUB;
    if (type === "country" || type === "COUNTRY") where.type = TeamType.COUNTRY;

    const teams = await prisma.team.findMany({
      where,
      include: { seasonStats: true },
    });

    const ranked = teams
      .filter((t) => t.seasonStats)
      .map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        country: t.country,
        league: t.league,
        logoUrl: t.logoUrl,
        stats: t.seasonStats!,
      }))
      .sort((a, b) => b.stats.winPercentage - a.stats.winPercentage)
      .slice(0, limit);

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch win percentage leaders" });
  }
});

router.get("/top-players", async (req, res) => {
  try {
    const position = req.query.position as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 15, 50);
    const type = req.query.type as string | undefined;

    const wherePlayer: Record<string, unknown> = {};
    if (position && Object.values(Position).includes(position as Position)) {
      wherePlayer.position = position as Position;
    }
    if (type === "club" || type === "CLUB") {
      wherePlayer.team = { type: TeamType.CLUB };
    } else if (type === "country" || type === "COUNTRY") {
      wherePlayer.team = { type: TeamType.COUNTRY };
    }

    const players = await prisma.player.findMany({
      where: wherePlayer,
      include: {
        abilities: true,
        team: { select: { id: true, name: true, type: true, logoUrl: true } },
      },
    });

    const ranked = players
      .filter((p) => p.abilities)
      .sort((a, b) => (b.abilities!.overallRating ?? 0) - (a.abilities!.overallRating ?? 0))
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        age: p.age,
        nationality: p.nationality,
        team: p.team,
        abilities: p.abilities,
      }));

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top players" });
  }
});

export default router;
