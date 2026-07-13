/** Map football-data.co.uk short names → canonical / TheSportsDB-friendly names. */
export const CLUB_ALIASES: Record<string, string> = {
  "Man United": "Manchester United",
  "Man City": "Manchester City",
  Newcastle: "Newcastle United",
  "Nott'm Forest": "Nottingham Forest",
  Wolves: "Wolverhampton Wanderers",
  Spurs: "Tottenham Hotspur",
  Tottenham: "Tottenham Hotspur",
  Brighton: "Brighton & Hove Albion",
  "West Ham": "West Ham United",
  "Sheffield United": "Sheffield United",
  "Sheffield Utd": "Sheffield United",
  Leicester: "Leicester City",
  Ipswich: "Ipswich Town",
  Norwich: "Norwich City",
  Leeds: "Leeds United",
  "Ath Madrid": "Atlético Madrid",
  "Ath Bilbao": "Athletic Club",
  Celta: "Celta Vigo",
  Sociedad: "Real Sociedad",
  Betis: "Real Betis",
  Espanol: "Espanyol",
  Vallecano: "Rayo Vallecano",
  Milan: "AC Milan",
  Inter: "Inter Milan",
  Verona: "Hellas Verona",
  Dortmund: "Borussia Dortmund",
  "M'gladbach": "Borussia Mönchengladbach",
  "Ein Frankfurt": "Eintracht Frankfurt",
  Mainz: "Mainz 05",
  "FC Koln": "FC Cologne",
  Cologne: "FC Cologne",
  Leverkusen: "Bayer Leverkusen",
  "Paris SG": "Paris Saint-Germain",
  "Paris Saint Germain": "Paris Saint-Germain",
  "St Etienne": "Saint-Etienne",
  Alaves: "Deportivo Alaves",
  Bournemouth: "AFC Bournemouth",
  Burnley: "Burnley",
  "St. Pauli": "FC St. Pauli",
};

/** Extra TheSportsDB search candidates when the primary name fails. */
export const SEARCH_FALLBACKS: Record<string, string[]> = {
  "Borussia Dortmund": ["Dortmund", "BVB"],
  "Borussia Mönchengladbach": ["Monchengladbach", "Gladbach"],
  "Brighton & Hove Albion": ["Brighton"],
  Bournemouth: ["AFC Bournemouth"],
  "AFC Bournemouth": ["Bournemouth"],
  Chelsea: ["Chelsea"],
  "Celta Vigo": ["Celta de Vigo", "Celta"],
  "Atlético Madrid": ["Atletico Madrid"],
  "Athletic Club": ["Athletic Bilbao"],
  "Paris Saint-Germain": ["Paris SG", "PSG"],
  "Saint-Étienne": ["Saint-Etienne", "St Etienne"],
  "Bayer Leverkusen": ["Leverkusen"],
  "Bayern Munich": ["Bayern Munchen", "FC Bayern Munich"],
  "Inter Milan": ["Inter", "FC Internazionale Milano"],
  "AC Milan": ["Milan"],
  "Nottingham Forest": ["Nottm Forest", "Nottingham"],
  "Wolverhampton Wanderers": ["Wolves"],
  "Tottenham Hotspur": ["Tottenham"],
  "West Ham United": ["West Ham"],
  "Newcastle United": ["Newcastle"],
  "Manchester United": ["Man United"],
  "Manchester City": ["Man City"],
  Alaves: ["Deportivo Alaves", "Alavés"],
  "Rayo Vallecano": ["Vallecano"],
  "Hellas Verona": ["Verona"],
  "Mainz 05": ["Mainz"],
  "Eintracht Frankfurt": ["Frankfurt"],
  "RB Leipzig": ["Leipzig"],
  "Union Berlin": ["1. FC Union Berlin"],
  "St. Pauli": ["FC St. Pauli", "St Pauli"],
};

export function canonicalClubName(name: string): string {
  return CLUB_ALIASES[name] ?? name;
}

export type LeagueCsv = {
  code: string;
  league: string;
  country: string;
  file: string;
};

/** football-data.co.uk division files for Europe’s top 5. */
export const TOP5_CSV_LEAGUES: LeagueCsv[] = [
  { code: "E0", league: "Premier League", country: "England", file: "E0.csv" },
  { code: "SP1", league: "La Liga", country: "Spain", file: "SP1.csv" },
  { code: "I1", league: "Serie A", country: "Italy", file: "I1.csv" },
  { code: "D1", league: "Bundesliga", country: "Germany", file: "D1.csv" },
  { code: "F1", league: "Ligue 1", country: "France", file: "F1.csv" },
];
