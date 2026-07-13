/**
 * Apply preferred roles from eaFcCache.json only (no network).
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { prisma } from "../db.js";
import { preferredRoleFromEaFc, type EaFcCard } from "../adapters/eaFcRatings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dirname, "../../prisma/data/eaFcCache.json");

async function main() {
  if (!existsSync(CACHE_PATH)) {
    console.error("No eaFcCache.json found");
    process.exit(1);
  }
  const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Record<
    string,
    EaFcCard | null
  >;

  const players = await prisma.player.findMany({
    where: { preferredRole: null },
  });

  let set = 0;
  for (const p of players) {
    const key = p.name.trim().toLowerCase().normalize("NFC");
    const card = cache[key];
    if (!card) continue;
    const preferredRole = preferredRoleFromEaFc(card);
    if (!preferredRole) continue;
    await prisma.player.update({
      where: { id: p.id },
      data: { preferredRole },
    });
    set++;
  }

  const total = await prisma.player.count({ where: { preferredRole: { not: null } } });
  console.log(`Cache backfill set ${set} more roles. Total with role: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
