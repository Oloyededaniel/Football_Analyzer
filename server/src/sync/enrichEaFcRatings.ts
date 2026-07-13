/**
 * Re-fetch EA FC ratings for players missing cache hits (slow / rate-limited).
 * For offline role backfill use: npx tsx src/sync/backfillRolesFromCache.ts
 */
import { prisma } from "../db.js";
import {
  EaFcRatingsClient,
  abilitiesFromEaFc,
  preferredRoleFromEaFc,
} from "../adapters/eaFcRatings.js";

async function main() {
  const ea = new EaFcRatingsClient();

  const players = await prisma.player.findMany({
    include: { abilities: true, team: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  let updated = 0;
  let missed = 0;
  let same = 0;

  console.log(`Enriching ${players.length} players from EA FC (cache-first)...`);

  for (const p of players) {
    const card = await ea.lookup(p.name, p.team?.name);
    if (!card) {
      missed++;
      continue;
    }
    const preferredRole = preferredRoleFromEaFc(card);
    const data = abilitiesFromEaFc(card);
    const ratingsSame =
      p.abilities &&
      p.abilities.overallRating === data.overallRating &&
      p.abilities.pace === data.pace;
    const roleSame = p.preferredRole === preferredRole;

    if (ratingsSame && roleSame) {
      same++;
      continue;
    }

    await prisma.player.update({
      where: { id: p.id },
      data: { preferredRole, fifaRank: null },
    });

    if (p.abilities) {
      await prisma.playerAbilities.update({
        where: { playerId: p.id },
        data,
      });
    } else {
      await prisma.playerAbilities.create({
        data: { playerId: p.id, ...data },
      });
    }

    updated++;
    if (updated % 25 === 0) {
      console.log(`  updated ${updated}…`);
      ea.flush();
    }
  }

  ea.flush();
  console.log(`Done. updated=${updated}, alreadyMatched=${same}, noEaCard=${missed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
