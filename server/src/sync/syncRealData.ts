/**
 * Sync REAL football data into SQLite.
 *
 * Sources (no paid keys required for core club data):
 * 1) football-data.co.uk CSV — top 5 league results (always)
 * 2) TheSportsDB — real player names / badges (free key, limited)
 * 3) FIFA ranking list — top 200 national teams (bundled)
 * 4) football-data.org — optional FOOTBALL_DATA_API_KEY for UCL / WC / EC + crests
 *
 * Usage: npm run sync:real -w server
 */

import "dotenv/config";
import { PrismaClient, TeamType, MatchType, Position } from "@prisma/client";
import { FIFA_TOP_200 } from "../../prisma/data/countries.js";
import { REAL_SQUADS } from "../../prisma/data/realPlayers.js";
import { REAL_NATIONAL_SQUADS } from "../../prisma/data/realNationalPlayers.js";
import {
  INTERNATIONAL_MATCHES,
  NATION_ALIASES,
} from "../../prisma/data/internationalMatches.js";
import { clubRankOrNull } from "../../prisma/data/clubFifaRanks.js";
import {
  fullClubSquad,
  fullNationalSquad,
} from "../../prisma/data/squadBench.js";
import { fetchTop5LeagueMatches } from "../adapters/footballDataCsv.js";
import {
  FootballDataOrgAdapter,
  FD_COMPETITIONS,
} from "../adapters/footballDataOrg.js";
import {
  TheSportsDbAdapter,
  estimateAbilities,
} from "../adapters/theSportsDb.js";
import {
  EaFcRatingsClient,
  abilitiesFromEaFc,
  preferredRoleFromEaFc,
} from "../adapters/eaFcRatings.js";
import { canonicalClubName } from "../adapters/clubNames.js";

const prisma = new PrismaClient();

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function logoFor(name: string, bg = "0f766e") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff`;
}

async function clearDb() {
  console.log("Clearing database...");
  await prisma.matchEvent.deleteMany();
  await prisma.seasonStats.deleteMany();
  await prisma.match.deleteMany();
  await prisma.playerAbilities.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
}

async function assignClubRanksFromForm() {
  console.log("Assigning remaining club FIFA ranks from form...");
  const clubs = await prisma.team.findMany({
    where: { type: TeamType.CLUB },
    include: { seasonStats: true },
  });
  const ranked = clubs
    .slice()
    .sort((a, b) => {
      const ar = a.fifaRank ?? 9999;
      const br = b.fifaRank ?? 9999;
      if (ar !== br && (a.fifaRank != null || b.fifaRank != null)) {
        if (a.fifaRank != null && b.fifaRank != null) return ar - br;
      }
      const as = a.seasonStats;
      const bs = b.seasonStats;
      const aScore =
        (as?.winPercentage ?? 0) * 10 + (as?.goalDifference ?? 0) + (as?.goalsFor ?? 0) * 0.1;
      const bScore =
        (bs?.winPercentage ?? 0) * 10 + (bs?.goalDifference ?? 0) + (bs?.goalsFor ?? 0) * 0.1;
      return bScore - aScore;
    });

  // Keep curated ranks; fill nulls with next available slots by form
  const used = new Set(ranked.map((c) => c.fifaRank).filter((r): r is number => r != null));
  let next = 1;
  const takeNext = () => {
    while (used.has(next)) next++;
    const n = next;
    used.add(n);
    next++;
    return n;
  };

  for (const club of ranked) {
    if (club.fifaRank != null) continue;
    await prisma.team.update({
      where: { id: club.id },
      data: { fifaRank: takeNext() },
    });
  }
}

async function recomputeSeasonStats() {
  console.log("Computing season stats from real results...");
  const matches = await prisma.match.findMany();
  const teams = await prisma.team.findMany({ select: { id: true } });
  const map = new Map<
    string,
    { wins: number; losses: number; draws: number; goalsFor: number; goalsAgainst: number }
  >();
  for (const t of teams) {
    map.set(t.id, { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0 });
  }
  for (const m of matches) {
    const home = map.get(m.homeTeamId);
    const away = map.get(m.awayTeamId);
    if (!home || !away) continue;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.wins++;
      away.losses++;
    } else if (m.homeScore < m.awayScore) {
      away.wins++;
      home.losses++;
    } else {
      home.draws++;
      away.draws++;
    }
  }
  await prisma.seasonStats.deleteMany();
  for (const [teamId, s] of map) {
    const played = s.wins + s.losses + s.draws;
    await prisma.seasonStats.create({
      data: {
        teamId,
        ...s,
        goalDifference: s.goalsFor - s.goalsAgainst,
        winPercentage: played === 0 ? 0 : Math.round((s.wins / played) * 1000) / 10,
      },
    });
  }
}

async function syncCsvLeagues() {
  const seasons = (process.env.FOOTBALL_CSV_SEASONS || "2526,2425")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`\n[1/5] Fetching real top-5 league results (CSV seasons: ${seasons.join(", ")})...`);
  const rows = await fetchTop5LeagueMatches(seasons);
  console.log(`  Total CSV matches: ${rows.length}`);

  const teamKey = (name: string, league: string) => `${league}::${name}`;
  const teamIds = new Map<string, string>();

  for (const m of rows) {
    for (const side of [
      { name: m.homeTeam, league: m.competition, country: m.country },
      { name: m.awayTeam, league: m.competition, country: m.country },
    ]) {
      const key = teamKey(side.name, side.league);
      if (teamIds.has(key)) continue;
      const team = await prisma.team.create({
        data: {
          name: side.name,
          type: TeamType.CLUB,
          country: side.country,
          league: side.league,
          logoUrl: logoFor(side.name),
          fifaRank: clubRankOrNull(side.name),
          externalId: `csv-team:${key}`,
          dataSource: "football-data.co.uk",
          confederation: "UEFA",
        },
      });
      teamIds.set(key, team.id);
    }
  }

  let created = 0;
  for (const m of rows) {
    const homeId = teamIds.get(teamKey(m.homeTeam, m.competition));
    const awayId = teamIds.get(teamKey(m.awayTeam, m.competition));
    if (!homeId || !awayId) continue;
    try {
      await prisma.match.create({
        data: {
          homeTeamId: homeId,
          awayTeamId: awayId,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          date: m.date,
          competition: m.competition,
          matchType: MatchType.CLUB,
          externalId: m.externalId,
        },
      });
      created++;
    } catch {
      // duplicate externalId across season re-runs
    }
  }
  console.log(`  Clubs: ${teamIds.size}, matches written: ${created}`);
  return teamIds;
}

async function syncFifaCountries() {
  console.log("\n[2/5] Seeding FIFA top 200 national teams (official ranking metadata)...");
  for (const nt of FIFA_TOP_200) {
    await prisma.team.create({
      data: {
        name: nt.name,
        type: TeamType.COUNTRY,
        country: nt.name,
        league: null,
        logoUrl: logoFor(nt.name, "1e3a5f"),
        fifaRank: nt.rank,
        confederation: nt.confederation,
        externalId: `fifa-rank:${nt.rank}:${nt.name}`,
        dataSource: "fifa-ranking",
      },
    });
  }
  console.log(`  Nations: ${FIFA_TOP_200.length}`);
}

function resolveNationName(name: string) {
  return NATION_ALIASES[name] ?? name;
}

async function syncInternationalMatches() {
  console.log("\n[3/5] Importing real international match results...");
  const nations = await prisma.team.findMany({
    where: { type: TeamType.COUNTRY },
    select: { id: true, name: true },
  });
  const byName = new Map(nations.map((n) => [n.name, n.id]));

  let created = 0;
  let skipped = 0;
  for (const m of INTERNATIONAL_MATCHES) {
    const homeName = resolveNationName(m.home);
    const awayName = resolveNationName(m.away);
    const homeId = byName.get(homeName);
    const awayId = byName.get(awayName);
    if (!homeId || !awayId) {
      skipped++;
      continue;
    }
    const externalId = `intl:${m.competition}:${m.date}:${homeName}:${awayName}`;
    try {
      await prisma.match.create({
        data: {
          homeTeamId: homeId,
          awayTeamId: awayId,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          date: new Date(`${m.date}T18:00:00.000Z`),
          competition: m.competition,
          matchType: MatchType.COUNTRY,
          externalId,
        },
      });
      created++;
    } catch {
      // duplicate
    }
  }
  console.log(`  International matches: ${created} (skipped unresolved: ${skipped})`);
}

async function syncFootballDataOrg() {
  const key = process.env.FOOTBALL_DATA_API_KEY?.trim();
  if (!key) {
    console.log(
      "\n[4/5] Skipping football-data.org (set FOOTBALL_DATA_API_KEY for live UCL / WC / Euro feeds)."
    );
    return;
  }

  console.log("\n[4/5] Syncing football-data.org competitions...");
  const api = new FootballDataOrgAdapter(key);

  for (const comp of FD_COMPETITIONS) {
    try {
      console.log(`  → ${comp.name} (${comp.code}) teams...`);
      const { teams } = await api.fetchCompetitionTeams(comp.code);
      for (const t of teams) {
        const externalId = `fd-team:${t.id}`;
        const existing = await prisma.team.findUnique({ where: { externalId } });
        const isCountry = comp.type === "COUNTRY";
        const data = {
          name: t.name,
          type: isCountry ? TeamType.COUNTRY : TeamType.CLUB,
          country: t.area?.name || comp.country,
          league: isCountry ? null : comp.name.includes("Champions") ? null : comp.name,
          logoUrl: t.crest || logoFor(t.name),
          confederation: isCountry ? undefined : "UEFA",
          dataSource: "football-data.org",
        };
        if (existing) {
          await prisma.team.update({ where: { id: existing.id }, data });
        } else {
          // Prefer updating CSV club of same name in same league when possible
          const byName = await prisma.team.findFirst({
            where: {
              name: t.name,
              type: isCountry ? TeamType.COUNTRY : TeamType.CLUB,
            },
          });
          if (byName) {
            await prisma.team.update({
              where: { id: byName.id },
              data: { ...data, externalId, logoUrl: t.crest || byName.logoUrl },
            });
          } else {
            await prisma.team.create({ data: { ...data, externalId } });
          }
        }
      }

      console.log(`  → ${comp.name} finished matches...`);
      const { matches } = await api.fetchCompetitionMatches(comp.code, "FINISHED");
      let n = 0;
      for (const m of matches) {
        if (m.score.fullTime.home == null || m.score.fullTime.away == null) continue;
        const home =
          (await prisma.team.findUnique({ where: { externalId: `fd-team:${m.homeTeam.id}` } })) ||
          (await prisma.team.findFirst({ where: { name: m.homeTeam.name } }));
        const away =
          (await prisma.team.findUnique({ where: { externalId: `fd-team:${m.awayTeam.id}` } })) ||
          (await prisma.team.findFirst({ where: { name: m.awayTeam.name } }));
        if (!home || !away) continue;
        const externalId = `fd-match:${m.id}`;
        const exists = await prisma.match.findUnique({ where: { externalId } });
        if (exists) continue;
        await prisma.match.create({
          data: {
            homeTeamId: home.id,
            awayTeamId: away.id,
            homeScore: m.score.fullTime.home,
            awayScore: m.score.fullTime.away,
            date: new Date(m.utcDate),
            competition: m.competition?.name || comp.name,
            matchType: comp.type === "COUNTRY" ? MatchType.COUNTRY : MatchType.CLUB,
            externalId,
          },
        });
        n++;
      }
      console.log(`    wrote ${n} matches`);

      // Scorers may require paid Deep Data — try and ignore failures
      try {
        const { scorers } = await api.fetchScorers(comp.code);
        for (const s of scorers) {
          const team =
            (await prisma.team.findUnique({ where: { externalId: `fd-team:${s.team.id}` } })) ||
            (await prisma.team.findFirst({ where: { name: s.team.name } }));
          if (!team) continue;
          const externalId = `fd-player:${s.player.id}`;
          let player = await prisma.player.findUnique({ where: { externalId } });
          const posRaw = (s.player.position || "").toUpperCase();
          const position: Position = posRaw.includes("GOAL")
            ? Position.GK
            : posRaw.includes("DEF")
              ? Position.DEF
              : posRaw.includes("MID")
                ? Position.MID
                : Position.FWD;
          if (!player) {
            player = await prisma.player.create({
              data: {
                name: s.player.name,
                teamId: team.id,
                position,
                age: 25,
                nationality: s.player.nationality || "Unknown",
                externalId,
                abilities: {
                  create: estimateAbilities(position, hash(s.player.name)),
                },
              },
            });
          }
          // Attach aggregate goals via a synthetic "season scorers" match event bucket
          // Use first match of team as carrier if needed — better: store on a placeholder match
          // Simpler: create MatchEvent on a dedicated stats match per competition
        }
        console.log(`    scorers available: ${scorers.length} (names stored as players)`);
      } catch {
        console.log(`    scorers unavailable on free tier for ${comp.code}`);
      }
    } catch (err) {
      console.warn(`  ${comp.code} failed:`, (err as Error).message);
    }
  }
}

async function syncBundledSquads() {
  console.log("\n[5/5] Importing curated squads + EA FC overall ratings...");
  const ea = new EaFcRatingsClient();
  let rated = 0;
  let estimated = 0;

  const resolveCard = async (
    name: string,
    position: Position,
    teamHint: string,
    seed: number
  ) => {
    const card = await ea.lookup(name, teamHint);
    if (card) {
      rated++;
      return {
        abilities: abilitiesFromEaFc(card),
        preferredRole: preferredRoleFromEaFc(card),
      };
    }
    estimated++;
    return {
      abilities: estimateAbilities(position, seed),
      preferredRole: null as string | null,
    };
  };

  const clubs = await prisma.team.findMany({ where: { type: TeamType.CLUB } });
  let playersTotal = 0;

  for (const club of clubs) {
    const base =
      REAL_SQUADS[club.name] ||
      REAL_SQUADS[canonicalClubName(club.name)] ||
      [];
    const roster = fullClubSquad(
      club.name,
      base.length ? base : REAL_SQUADS[canonicalClubName(club.name)]
    );
    if (!roster.length) continue;

    for (const p of roster) {
      const externalId = `roster:${club.name}:${p.name}`;
      const exists = await prisma.player.findUnique({ where: { externalId } });
      if (exists) continue;
      const resolved = await resolveCard(
        p.name,
        p.position as Position,
        club.name,
        hash(p.name)
      );
      await prisma.player.create({
        data: {
          name: p.name,
          teamId: club.id,
          position: p.position as Position,
          preferredRole: resolved.preferredRole,
          age: p.age,
          nationality: p.nationality,
          externalId,
          fifaRank: null,
          abilities: { create: resolved.abilities },
        },
      });
      playersTotal++;
    }
    console.log(`  · ${club.name}: ${roster.length} players`);
  }

  const nations = await prisma.team.findMany({ where: { type: TeamType.COUNTRY } });
  let natPlayers = 0;
  for (const nt of nations) {
    const base = REAL_NATIONAL_SQUADS[nt.name] ?? [];
    const roster = fullNationalSquad(nt.name, base);
    if (!roster.length) continue;
    for (const p of roster) {
      const externalId = `nat-roster:${nt.name}:${p.name}`;
      const exists = await prisma.player.findUnique({ where: { externalId } });
      if (exists) continue;
      const resolved = await resolveCard(
        p.name,
        p.position as Position,
        nt.name,
        hash(p.name) + 17
      );
      await prisma.player.create({
        data: {
          name: p.name,
          teamId: nt.id,
          position: p.position as Position,
          preferredRole: resolved.preferredRole,
          age: p.age,
          nationality: p.nationality,
          externalId,
          fifaRank: null,
          abilities: { create: resolved.abilities },
        },
      });
      natPlayers++;
    }
    console.log(`  · ${nt.name} (NT): ${roster.length} players`);
  }

  ea.flush();
  console.log(
    `  Club players: ${playersTotal}, national players: ${natPlayers} (EA FC rated: ${rated}, estimated fallback: ${estimated})`
  );
}

async function syncSquadsFromSportsDb(limitTeams?: number) {
  if (process.env.SYNC_SKIP_THESPORTSDB === "1") {
    console.log("  Skipping TheSportsDB enrichment (SYNC_SKIP_THESPORTSDB=1)");
    return;
  }

  console.log("  Enriching remaining clubs via TheSportsDB (optional)...");
  const tsd = new TheSportsDbAdapter();
  const clubs = await prisma.team.findMany({
    where: { type: TeamType.CLUB, players: { none: {} } },
    orderBy: { name: "asc" },
  });
  const targets = typeof limitTeams === "number" ? clubs.slice(0, limitTeams) : clubs;
  let playersTotal = 0;

  for (const club of targets) {
    try {
      const found = await tsd.searchTeam(club.name);
      if (!found) continue;
      if (found.strBadge) {
        await prisma.team.update({
          where: { id: club.id },
          data: { logoUrl: found.strBadge },
        });
      }
      const squad = await tsd.lookupPlayers(found.idTeam);
      for (const p of squad) {
        const exists = await prisma.player.findUnique({ where: { externalId: p.externalId } });
        if (exists) continue;
        await prisma.player.create({
          data: {
            name: p.name,
            teamId: club.id,
            position: p.position as Position,
            age: p.age,
            nationality: p.nationality,
            externalId: p.externalId,
            abilities: {
              create: estimateAbilities(p.position, hash(p.name)),
            },
          },
        });
        playersTotal++;
      }
      if (squad.length) console.log(`  · ${club.name}: +${squad.length} from TheSportsDB`);
    } catch (err) {
      console.warn(`  · ${club.name}:`, (err as Error).message);
      // Rate limit — stop further calls
      if (/429|1015|rate/i.test((err as Error).message)) {
        console.warn("  TheSportsDB rate-limited — stopping enrichment.");
        break;
      }
    }
  }
  console.log(`  TheSportsDB players imported: ${playersTotal}`);
}

async function main() {
  const skipSquads = process.env.SYNC_SKIP_SQUADS === "1";
  const squadLimit = process.env.SYNC_SQUAD_LIMIT
    ? Number(process.env.SYNC_SQUAD_LIMIT)
    : undefined;

  await clearDb();
  await syncCsvLeagues();
  await syncFifaCountries();
  await syncInternationalMatches();
  await syncFootballDataOrg();
  if (!skipSquads) {
    await syncBundledSquads();
    await syncSquadsFromSportsDb(squadLimit);
  } else {
    console.log("\n[5/5] Skipping squads (SYNC_SKIP_SQUADS=1)");
  }
  await recomputeSeasonStats();
  await assignClubRanksFromForm();

  const counts = {
    clubs: await prisma.team.count({ where: { type: TeamType.CLUB } }),
    countries: await prisma.team.count({ where: { type: TeamType.COUNTRY } }),
    players: await prisma.player.count(),
    matches: await prisma.match.count(),
  };
  console.log("\nReal data sync complete:", counts);
  console.log(
    "Tip: add FOOTBALL_DATA_API_KEY to server/.env for Champions League / World Cup / Euro results."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
