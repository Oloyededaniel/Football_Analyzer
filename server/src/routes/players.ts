import { Router } from "express";
import { Position } from "@prisma/client";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const teamId = req.query.teamId as string | undefined;
    const q = (req.query.q as string | undefined)?.trim();
    const position = req.query.position as string | undefined;
    const type = req.query.type as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 200, 500);

    const where: Record<string, unknown> = {};
    if (teamId) where.teamId = teamId;
    if (q) where.name = { contains: q };
    if (position && Object.values(Position).includes(position as Position)) {
      where.position = position as Position;
    }
    if (!teamId && (type === "club" || type === "CLUB")) {
      where.team = { type: "CLUB" };
    } else if (!teamId && (type === "country" || type === "COUNTRY")) {
      where.team = { type: "COUNTRY" };
    }

    // Without a team filter, cap results so the UI stays responsive on large seeds.
    const players = await prisma.player.findMany({
      where,
      include: {
        abilities: true,
        team: { select: { id: true, name: true, type: true, logoUrl: true } },
      },
      orderBy: teamId
        ? [{ abilities: { overallRating: "desc" } }, { position: "asc" }, { name: "asc" }]
        : [{ abilities: { overallRating: "desc" } }, { name: "asc" }],
      take: teamId ? undefined : limit,
    });

    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

router.get("/compare", async (req, res) => {
  try {
    const idsParam = (req.query.ids as string | undefined) ?? "";
    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length < 2) {
      return res.status(400).json({ error: "Provide at least 2 player ids via ?ids=" });
    }

    const players = await prisma.player.findMany({
      where: { id: { in: ids } },
      include: {
        abilities: true,
        team: { select: { id: true, name: true, type: true, logoUrl: true } },
      },
    });

    // Preserve request order
    const ordered = ids
      .map((id) => players.find((p) => p.id === id))
      .filter(Boolean);

    res.json(ordered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compare players" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: req.params.id },
      include: {
        abilities: true,
        team: { select: { id: true, name: true, type: true, logoUrl: true, country: true } },
      },
    });
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch player" });
  }
});

export default router;
