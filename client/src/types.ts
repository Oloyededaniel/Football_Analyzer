export type TeamType = "CLUB" | "COUNTRY";
export type MatchType = "CLUB" | "COUNTRY";
export type Position = "GK" | "DEF" | "MID" | "FWD";

export type SeasonStats = {
  id: string;
  teamId: string;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  winPercentage: number;
};

export type Team = {
  id: string;
  name: string;
  type: TeamType;
  country: string;
  league: string | null;
  logoUrl: string | null;
  fifaRank?: number | null;
  confederation?: string | null;
  seasonStats?: SeasonStats | null;
};

export type PlayerAbilities = {
  id: string;
  playerId: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  overallRating: number;
};

export type Player = {
  id: string;
  name: string;
  teamId: string;
  position: Position;
  /** Fine-grained role from EA FC when known (ST, LW, CB, …) */
  preferredRole?: string | null;
  age: number;
  nationality: string;
  fifaRank?: number | null;
  abilities?: PlayerAbilities | null;
  team?: Pick<Team, "id" | "name" | "type" | "logoUrl" | "country">;
};

export type MatchSide = Pick<Team, "id" | "name" | "logoUrl"> & { type?: TeamType };

export type Match = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  competition: string;
  matchType: MatchType;
  homeTeam: MatchSide;
  awayTeam: MatchSide;
};

export type TeamDetail = Team & {
  players: Player[];
  recentForm: { result: "W" | "D" | "L"; date: string; forScore: number; againstScore: number }[];
  recentMatches: Match[];
  winPctOverTime: { date: string; winPercentage: number; played: number }[];
};

export type H2HResponse = {
  teamA: Pick<Team, "id" | "name" | "logoUrl" | "type"> | null;
  teamB: Pick<Team, "id" | "name" | "logoUrl" | "type"> | null;
  matches: Match[];
  aggregate: {
    played: number;
    teamAWins: number;
    teamBWins: number;
    draws: number;
    teamAGoals: number;
    teamBGoals: number;
  };
};

export type TopScorer = {
  playerId: string;
  name: string;
  position: Position;
  team: Pick<Team, "id" | "name" | "type" | "logoUrl">;
  goals: number;
  overallRating: number | null;
};

export type WinPctLeader = {
  id: string;
  name: string;
  type: TeamType;
  country: string;
  league: string | null;
  logoUrl: string | null;
  stats: SeasonStats;
};

export type MatchPrediction = {
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
  form: { home: ("W" | "D" | "L")[]; away: ("W" | "D" | "L")[] };
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
