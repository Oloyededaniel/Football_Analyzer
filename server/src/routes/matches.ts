import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/h2h", async (req, res) => {
  try {
    const teamA = req.query.teamA as string | undefined;
    const teamB = req.query.teamB as string | undefined;

    if (!teamA || !teamB) {
      return res.status(400).json({ error: "teamA and teamB are required" });
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: teamA, awayTeamId: teamB },
          { homeTeamId: teamB, awayTeamId: teamA },
        ],
      },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } },
      },
      orderBy: { date: "desc" },
    });

    let teamAWins = 0;
    let teamBWins = 0;
    let draws = 0;
    let teamAGoals = 0;
    let teamBGoals = 0;

    for (const m of matches) {
      const aIsHome = m.homeTeamId === teamA;
      const aScore = aIsHome ? m.homeScore : m.awayScore;
      const bScore = aIsHome ? m.awayScore : m.homeScore;
      teamAGoals += aScore;
      teamBGoals += bScore;
      if (aScore > bScore) teamAWins++;
      else if (aScore < bScore) teamBWins++;
      else draws++;
    }

    const [teamAInfo, teamBInfo] = await Promise.all([
      prisma.team.findUnique({
        where: { id: teamA },
        select: { id: true, name: true, logoUrl: true, type: true },
      }),
      prisma.team.findUnique({
        where: { id: teamB },
        select: { id: true, name: true, logoUrl: true, type: true },
      }),
    ]);

    res.json({
      teamA: teamAInfo,
      teamB: teamBInfo,
      matches,
      aggregate: {
        played: matches.length,
        teamAWins,
        teamBWins,
        draws,
        teamAGoals,
        teamBGoals,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch head-to-head" });
  }
});

router.get("/", async (req, res) => {
  try {
    const teamId = req.query.teamId as string | undefined;
    const type = req.query.type as string | undefined;

    const where: Record<string, unknown> = {};
    if (teamId) {
      where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    }
    if (type === "club" || type === "CLUB") where.matchType = "CLUB";
    if (type === "country" || type === "COUNTRY") where.matchType = "COUNTRY";

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true, type: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true, type: true } },
      },
      orderBy: { date: "desc" },
      take: 100,
    });

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

export default router;
