import "dotenv/config";
import { randomBytes } from "crypto";
import { PrismaClient, TeamType, MatchType, Position } from "@prisma/client";
import { TOP5_CLUBS } from "./data/clubs.js";
import { FIFA_TOP_200 } from "./data/countries.js";

const prisma = new PrismaClient();

function cuidLike() {
  return `c${randomBytes(12).toString("hex")}`;
}

const firstNames = [
  "James", "Lucas", "Mateo", "Noah", "Oliver", "Ethan", "Liam", "Hugo", "Leo", "Kai",
  "Marco", "Diego", "Andre", "Felix", "Jonas", "Nico", "Omar", "Ryan", "Tyler", "Viktor",
  "Adrian", "Bruno", "Carlos", "David", "Emil", "Fabio", "Gabriel", "Henrik", "Ivan", "Jorge",
  "Pedro", "Thiago", "Kylian", "Erling", "Jude", "Phil", "Rodri", "Luka", "Serge", "Achraf",
];

const lastNames = [
  "Silva", "Santos", "Garcia", "Martinez", "Lopez", "Fernandez", "Rossi", "Bianchi", "Muller", "Schmidt",
  "Andersen", "Nielsen", "Bernard", "Dupont", "Walsh", "Murphy", "Kowalski", "Nowak", "Petrov", "Ivanov",
  "Kim", "Park", "Tanaka", "Yamamoto", "Costa", "Almeida", "Torres", "Reyes", "Hansen", "Berg",
  "Mbappe", "Haaland", "Bellingham", "Salah", "Vinicius", "Rodri", "Modric", "Gnabry", "Hakimi", "Osimhen",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pickName(seed: number, i: number): string {
  const r = rng(seed + i * 97);
  return `${firstNames[Math.floor(r() * firstNames.length)]} ${lastNames[Math.floor(r() * lastNames.length)]}`;
}

function abilitiesFor(position: Position, seed: number, strengthBoost = 0) {
  const r = rng(seed);
  const base = 58 + Math.floor(r() * 18) + strengthBoost;
  const bump = (n: number) => Math.min(99, Math.max(35, n + Math.floor(r() * 10) - 4));

  let pace = base;
  let shooting = base;
  let passing = base;
  let dribbling = base;
  let defending = base;
  let physical = base;

  switch (position) {
    case "GK":
      pace = bump(base - 15);
      shooting = bump(base - 20);
      passing = bump(base - 5);
      dribbling = bump(base - 12);
      defending = bump(base + 12);
      physical = bump(base + 8);
      break;
    case "DEF":
      pace = bump(base);
      shooting = bump(base - 10);
      passing = bump(base);
      dribbling = bump(base - 5);
      defending = bump(base + 15);
      physical = bump(base + 10);
      break;
    case "MID":
      pace = bump(base + 2);
      shooting = bump(base + 2);
      passing = bump(base + 14);
      dribbling = bump(base + 8);
      defending = bump(base);
      physical = bump(base);
      break;
    case "FWD":
      pace = bump(base + 12);
      shooting = bump(base + 15);
      passing = bump(base);
      dribbling = bump(base + 10);
      defending = bump(base - 12);
      physical = bump(base + 5);
      break;
  }

  const overallRating = Math.round(
    (pace + shooting + passing + dribbling + defending + physical) / 6
  );
  return { pace, shooting, passing, dribbling, defending, physical, overallRating };
}

const clubRoster: { position: Position; count: number }[] = [
  { position: "GK", count: 2 },
  { position: "DEF", count: 5 },
  { position: "MID", count: 5 },
  { position: "FWD", count: 4 },
];

const countryRoster: { position: Position; count: number }[] = [
  { position: "GK", count: 2 },
  { position: "DEF", count: 4 },
  { position: "MID", count: 5 },
  { position: "FWD", count: 3 },
];

function buildRoster(
  teamKey: string,
  nationality: string,
  template: { position: Position; count: number }[],
  strengthBoost: number
) {
  const players: {
    id: string;
    name: string;
    position: Position;
    age: number;
    nationality: string;
    abilities: ReturnType<typeof abilitiesFor>;
  }[] = [];
  let idx = 0;
  for (const slot of template) {
    for (let i = 0; i < slot.count; i++) {
      const seed = hash(`${teamKey}-${slot.position}-${i}`);
      const r = rng(seed);
      const id = cuidLike();
      players.push({
        id,
        name: pickName(seed, idx++),
        position: slot.position,
        age: 18 + Math.floor(r() * 17),
        nationality,
        abilities: abilitiesFor(slot.position, seed, strengthBoost),
      });
    }
  }
  return players;
}

function scorePair(r: () => number): [number, number] {
  return [Math.floor(r() * 4), Math.floor(r() * 4)];
}

function assignGoals(
  homePlayers: { id: string; position: Position }[],
  awayPlayers: { id: string; position: Position }[],
  homeScore: number,
  awayScore: number,
  r: () => number
) {
  const events: { id: string; playerId: string; goals: number }[] = [];

  const scorers = (players: { id: string; position: Position }[], goals: number) => {
    const eligible = players.filter((p) => p.position !== "GK");
    if (!eligible.length || goals <= 0) return;
    const counts = new Map<string, number>();
    for (let i = 0; i < goals; i++) {
      const weights = eligible.map((p) =>
        p.position === "FWD" ? 5 : p.position === "MID" ? 3 : 1
      );
      const total = weights.reduce((a, b) => a + b, 0);
      let roll = r() * total;
      let chosen = eligible[0];
      for (let j = 0; j < eligible.length; j++) {
        roll -= weights[j];
        if (roll <= 0) {
          chosen = eligible[j];
          break;
        }
      }
      counts.set(chosen.id, (counts.get(chosen.id) ?? 0) + 1);
    }
    for (const [playerId, g] of counts) {
      events.push({ id: cuidLike(), playerId, goals: g });
    }
  };

  scorers(homePlayers, homeScore);
  scorers(awayPlayers, awayScore);
  return events;
}

type TeamRec = {
  id: string;
  name: string;
  type: TeamType;
  league: string | null;
  players: { id: string; position: Position }[];
};

async function main() {
  console.log("Clearing existing data...");
  await prisma.matchEvent.deleteMany();
  await prisma.seasonStats.deleteMany();
  await prisma.match.deleteMany();
  await prisma.playerAbilities.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();

  const teamRows: {
    id: string;
    name: string;
    type: TeamType;
    country: string;
    league: string | null;
    logoUrl: string;
    fifaRank: number | null;
    confederation: string | null;
  }[] = [];
  const playerRows: {
    id: string;
    name: string;
    teamId: string;
    position: Position;
    age: number;
    nationality: string;
  }[] = [];
  const abilityRows: {
    id: string;
    playerId: string;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    overallRating: number;
  }[] = [];

  const clubTeams: TeamRec[] = [];
  const countryTeams: TeamRec[] = [];

  console.log(`Seeding ${TOP5_CLUBS.length} top-5 league clubs...`);
  for (const club of TOP5_CLUBS) {
    const id = cuidLike();
    const boost = ["Manchester City", "Real Madrid", "Bayern Munich", "Inter Milan", "Paris Saint-Germain", "Liverpool", "Barcelona", "Arsenal"].includes(club.name)
      ? 8
      : 3;
    const roster = buildRoster(club.name, club.country, clubRoster, boost);
    teamRows.push({
      id,
      name: club.name,
      type: TeamType.CLUB,
      country: club.country,
      league: club.league,
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(club.name)}&background=0f766e&color=fff`,
      fifaRank: null,
      confederation: "UEFA",
    });
    for (const p of roster) {
      playerRows.push({
        id: p.id,
        name: p.name,
        teamId: id,
        position: p.position,
        age: p.age,
        nationality: p.nationality,
      });
      abilityRows.push({ id: cuidLike(), playerId: p.id, ...p.abilities });
    }
    clubTeams.push({
      id,
      name: club.name,
      type: TeamType.CLUB,
      league: club.league,
      players: roster.map((p) => ({ id: p.id, position: p.position })),
    });
  }

  console.log(`Seeding FIFA top ${FIFA_TOP_200.length} national teams...`);
  for (const nt of FIFA_TOP_200) {
    const id = cuidLike();
    const boost = Math.max(0, Math.round((201 - nt.rank) / 25));
    const roster = buildRoster(`NT-${nt.name}`, nt.name, countryRoster, boost);
    teamRows.push({
      id,
      name: nt.name,
      type: TeamType.COUNTRY,
      country: nt.name,
      league: null,
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nt.name)}&background=1e3a5f&color=fff`,
      fifaRank: nt.rank,
      confederation: nt.confederation,
    });
    for (const p of roster) {
      playerRows.push({
        id: p.id,
        name: p.name,
        teamId: id,
        position: p.position,
        age: p.age,
        nationality: p.nationality,
      });
      abilityRows.push({ id: cuidLike(), playerId: p.id, ...p.abilities });
    }
    countryTeams.push({
      id,
      name: nt.name,
      type: TeamType.COUNTRY,
      league: null,
      players: roster.map((p) => ({ id: p.id, position: p.position })),
    });
  }

  const chunk = async <T>(rows: T[], size: number, fn: (batch: T[]) => Promise<unknown>) => {
    for (let i = 0; i < rows.length; i += size) {
      await fn(rows.slice(i, i + size));
    }
  };

  await chunk(teamRows, 50, (batch) => prisma.team.createMany({ data: batch }));
  await chunk(playerRows, 100, (batch) => prisma.player.createMany({ data: batch }));
  await chunk(abilityRows, 100, (batch) => prisma.playerAbilities.createMany({ data: batch }));

  type MatchAcc = {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    date: Date;
    competition: string;
    matchType: MatchType;
  };

  const matchRows: MatchAcc[] = [];
  const eventRows: { id: string; matchId: string; playerId: string; goals: number }[] = [];

  const pushMatch = (
    home: TeamRec,
    away: TeamRec,
    competition: string,
    matchType: MatchType,
    date: Date,
    seedKey: string
  ) => {
    const r = rng(hash(seedKey));
    const [homeScore, awayScore] = scorePair(r);
    const matchId = cuidLike();
    matchRows.push({
      id: matchId,
      homeTeamId: home.id,
      awayTeamId: away.id,
      homeScore,
      awayScore,
      date,
      competition,
      matchType,
    });
    for (const e of assignGoals(home.players, away.players, homeScore, awayScore, r)) {
      eventRows.push({ ...e, matchId });
    }
  };

  console.log("Seeding domestic league matches...");
  const byLeague = new Map<string, TeamRec[]>();
  for (const t of clubTeams) {
    if (!t.league) continue;
    const list = byLeague.get(t.league) ?? [];
    list.push(t);
    byLeague.set(t.league, list);
  }

  let day = 0;
  for (const [league, teams] of byLeague) {
    // Single round-robin (each pair once) keeps volume manageable
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        day++;
        const date = new Date(Date.UTC(2025, 7, 16));
        date.setUTCDate(date.getUTCDate() + day);
        const homeFirst = (i + j) % 2 === 0;
        const home = homeFirst ? teams[i] : teams[j];
        const away = homeFirst ? teams[j] : teams[i];
        pushMatch(home, away, league, MatchType.CLUB, date, `${league}-${home.name}-${away.name}`);
      }
    }
  }

  console.log("Seeding UEFA Champions League fixtures...");
  const uclSeeds = [
    "Manchester City", "Real Madrid", "Bayern Munich", "Inter Milan",
    "Paris Saint-Germain", "Liverpool", "Barcelona", "Arsenal",
    "Atlético Madrid", "Borussia Dortmund", "Juventus", "AC Milan",
    "Napoli", "Bayer Leverkusen", "RB Leipzig", "Chelsea",
  ];
  const uclTeams = uclSeeds
    .map((n) => clubTeams.find((t) => t.name === n))
    .filter((t): t is TeamRec => Boolean(t));

  for (let i = 0; i < uclTeams.length; i++) {
    for (let j = i + 1; j < uclTeams.length; j++) {
      if ((i + j) % 3 !== 0) continue;
      const date = new Date(Date.UTC(2025, 8, 17 + ((i * 7 + j) % 90)));
      pushMatch(
        uclTeams[i],
        uclTeams[j],
        "UEFA Champions League",
        MatchType.CLUB,
        date,
        `UCL-${uclTeams[i].name}-${uclTeams[j].name}`
      );
    }
  }

  // Europa League sample
  const uelSeeds = [
    "Tottenham Hotspur", "Roma", "Fiorentina", "Athletic Club",
    "Real Sociedad", "Lazio", "Marseille", "Lyon", "Nice", "Eintracht Frankfurt",
  ];
  const uelTeams = uelSeeds
    .map((n) => clubTeams.find((t) => t.name === n))
    .filter((t): t is TeamRec => Boolean(t));
  for (let i = 0; i < uelTeams.length; i++) {
    for (let j = i + 1; j < uelTeams.length; j++) {
      if ((i + j) % 2 !== 0) continue;
      const date = new Date(Date.UTC(2025, 8, 25 + i + j));
      pushMatch(
        uelTeams[i],
        uelTeams[j],
        "UEFA Europa League",
        MatchType.CLUB,
        date,
        `UEL-${uelTeams[i].name}-${uelTeams[j].name}`
      );
    }
  }

  console.log("Seeding FIFA / UEFA international matches...");
  // World Cup 2026 style: top 48 play nearby ranked opponents
  const top48 = countryTeams.slice(0, 48);
  for (let i = 0; i < top48.length; i++) {
    for (const offset of [1, 2, 3, 5, 8]) {
      const j = (i + offset) % top48.length;
      if (j <= i) continue;
      const date = new Date(Date.UTC(2026, 5, 12 + ((i + offset) % 28)));
      pushMatch(
        top48[i],
        top48[j],
        "FIFA World Cup 2026",
        MatchType.COUNTRY,
        date,
        `WC26-${top48[i].name}-${top48[j].name}`
      );
    }
  }

  // UEFA Nations League style among UEFA countries (approx via confederation in teamRows)
  const uefaNations = countryTeams.filter((t) => {
    const row = teamRows.find((r) => r.id === t.id);
    return row?.confederation === "UEFA" && (row.fifaRank ?? 999) <= 60;
  });
  for (let i = 0; i < uefaNations.length; i++) {
    for (const offset of [1, 2, 4]) {
      const j = (i + offset) % uefaNations.length;
      if (j <= i) continue;
      const date = new Date(Date.UTC(2025, 8, 5 + ((i * offset) % 40)));
      pushMatch(
        uefaNations[i],
        uefaNations[j],
        "UEFA Nations League",
        MatchType.COUNTRY,
        date,
        `UNL-${uefaNations[i].name}-${uefaNations[j].name}`
      );
    }
  }

  // World Cup Qualifiers / friendlies for remaining nations (rank connectivity)
  for (let i = 0; i < countryTeams.length; i++) {
    for (const offset of [1, 2, 7]) {
      const j = (i + offset) % countryTeams.length;
      if (j === i) continue;
      // Avoid duplicating too many top-48 WC fixtures: skip if both already heavily covered
      if (i < 48 && j < 48 && offset <= 5) continue;
      const home = countryTeams[Math.min(i, j)];
      const away = countryTeams[Math.max(i, j)];
      const date = new Date(Date.UTC(2025, 2, 20));
      date.setUTCDate(date.getUTCDate() + i * 2 + offset);
      const competition =
        i < 80 && j < 80 ? "FIFA World Cup Qualifiers" : "International Friendly";
      pushMatch(
        home,
        away,
        competition,
        MatchType.COUNTRY,
        date,
        `INT-${home.name}-${away.name}-${offset}`
      );
    }
  }

  console.log(`Writing ${matchRows.length} matches and ${eventRows.length} goal events...`);
  await chunk(matchRows, 100, (batch) => prisma.match.createMany({ data: batch }));
  await chunk(eventRows, 200, (batch) => prisma.matchEvent.createMany({ data: batch }));

  console.log("Computing season stats...");
  const statsMap = new Map<
    string,
    { wins: number; losses: number; draws: number; goalsFor: number; goalsAgainst: number }
  >();
  for (const t of [...clubTeams, ...countryTeams]) {
    statsMap.set(t.id, { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0 });
  }
  for (const m of matchRows) {
    const home = statsMap.get(m.homeTeamId)!;
    const away = statsMap.get(m.awayTeamId)!;
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

  const statsRows = [...statsMap.entries()].map(([teamId, s]) => {
    const played = s.wins + s.losses + s.draws;
    return {
      id: cuidLike(),
      teamId,
      wins: s.wins,
      losses: s.losses,
      draws: s.draws,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalsFor - s.goalsAgainst,
      winPercentage: played === 0 ? 0 : Math.round((s.wins / played) * 1000) / 10,
    };
  });
  await chunk(statsRows, 100, (batch) => prisma.seasonStats.createMany({ data: batch }));

  const counts = {
    clubs: clubTeams.length,
    countries: countryTeams.length,
    players: playerRows.length,
    matches: matchRows.length,
    events: eventRows.length,
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
