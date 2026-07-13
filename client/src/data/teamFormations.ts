import type { FormationId } from "../lib/formation";

export type TeamTactics = {
  formation: FormationId;
  manager: string;
  /** Primary / secondary jersey colors for pitch tokens */
  kit: [string, string];
};

const DEFAULT_CLUB: TeamTactics = {
  formation: "4-3-3",
  manager: "Head Coach",
  kit: ["#14532d", "#f8fafc"],
};

const DEFAULT_NATION: TeamTactics = {
  formation: "4-2-3-1",
  manager: "Head Coach",
  kit: ["#1e293b", "#f8fafc"],
};

/** Preferred formation + manager for clubs and national teams we know well. */
export const TEAM_TACTICS: Record<string, TeamTactics> = {
  // Premier League
  Liverpool: { formation: "4-3-3", manager: "Arne Slot", kit: ["#c8102e", "#00b2a9"] },
  Arsenal: { formation: "4-3-3", manager: "Mikel Arteta", kit: ["#ef0107", "#ffffff"] },
  "Manchester City": { formation: "4-3-3", manager: "Pep Guardiola", kit: ["#6cabdd", "#1c2c5b"] },
  "Manchester United": { formation: "4-2-3-1", manager: "Ruben Amorim", kit: ["#da291c", "#000000"] },
  Chelsea: { formation: "4-2-3-1", manager: "Enzo Maresca", kit: ["#034694", "#ffffff"] },
  Tottenham: { formation: "4-3-3", manager: "Thomas Frank", kit: ["#132257", "#ffffff"] },
  "Tottenham Hotspur": { formation: "4-3-3", manager: "Thomas Frank", kit: ["#132257", "#ffffff"] },
  "Aston Villa": { formation: "4-2-3-1", manager: "Unai Emery", kit: ["#670e36", "#95bfe5"] },
  "Newcastle United": { formation: "4-3-3", manager: "Eddie Howe", kit: ["#241f20", "#ffffff"] },
  Brighton: { formation: "4-2-3-1", manager: "Fabian Hürzeler", kit: ["#0057b8", "#ffffff"] },
  "AFC Bournemouth": { formation: "4-2-3-1", manager: "Andoni Iraola", kit: ["#da291c", "#000000"] },

  // La Liga
  "Real Madrid": { formation: "4-3-3", manager: "Xabi Alonso", kit: ["#ffffff", "#00529f"] },
  Barcelona: { formation: "4-3-3", manager: "Hansi Flick", kit: ["#a50044", "#004d98"] },
  "Atlético Madrid": { formation: "3-5-2", manager: "Diego Simeone", kit: ["#ce3524", "#ffffff"] },
  "Athletic Club": { formation: "4-2-3-1", manager: "Ernesto Valverde", kit: ["#ee2523", "#ffffff"] },
  Villarreal: { formation: "4-4-2", manager: "Marcelino", kit: ["#ffe014", "#005ca9"] },

  // Serie A
  "Inter Milan": { formation: "3-5-2", manager: "Cristian Chivu", kit: ["#010E80", "#000000"] },
  "AC Milan": { formation: "4-2-3-1", manager: "Massimiliano Allegri", kit: ["#fb090b", "#000000"] },
  Juventus: { formation: "4-2-3-1", manager: "Igor Tudor", kit: ["#000000", "#ffffff"] },
  Napoli: { formation: "4-3-3", manager: "Antonio Conte", kit: ["#12A0D7", "#ffffff"] },
  Roma: { formation: "3-4-3", manager: "Claudio Ranieri", kit: ["#8B0000", "#F0A000"] },

  // Bundesliga
  "Bayern Munich": { formation: "4-2-3-1", manager: "Vincent Kompany", kit: ["#dc052d", "#ffffff"] },
  "Borussia Dortmund": { formation: "4-2-3-1", manager: "Niko Kovač", kit: ["#fde100", "#000000"] },
  "Bayer Leverkusen": { formation: "3-4-3", manager: "Erik ten Hag", kit: ["#e32221", "#000000"] },
  "RB Leipzig": { formation: "4-2-3-1", manager: "Ole Werner", kit: ["#dd0741", "#ffffff"] },

  // Ligue 1
  "Paris Saint-Germain": { formation: "4-3-3", manager: "Luis Enrique", kit: ["#004170", "#da291c"] },
  Marseille: { formation: "4-2-3-1", manager: "Roberto De Zerbi", kit: ["#2fa3e0", "#ffffff"] },
  Monaco: { formation: "4-2-3-1", manager: "Adi Hütter", kit: ["#e30613", "#ffffff"] },
  Lille: { formation: "4-2-3-1", manager: "Bruno Génésio", kit: ["#e01e13", "#001e96"] },

  // Nations
  Argentina: { formation: "4-3-3", manager: "Lionel Scaloni", kit: ["#75aadb", "#ffffff"] },
  France: { formation: "4-3-3", manager: "Didier Deschamps", kit: ["#002654", "#ed2939"] },
  England: { formation: "4-2-3-1", manager: "Thomas Tuchel", kit: ["#ffffff", "#cf081f"] },
  Brazil: { formation: "4-2-3-1", manager: "Carlo Ancelotti", kit: ["#ffdf00", "#009c3b"] },
  Spain: { formation: "4-3-3", manager: "Luis de la Fuente", kit: ["#aa151b", "#f1bf00"] },
  Portugal: { formation: "4-3-3", manager: "Roberto Martínez", kit: ["#006600", "#ff0000"] },
  Germany: { formation: "4-2-3-1", manager: "Julian Nagelsmann", kit: ["#ffffff", "#000000"] },
  Netherlands: { formation: "4-3-3", manager: "Ronald Koeman", kit: ["#ff6600", "#ffffff"] },
  Italy: { formation: "3-5-2", manager: "Luciano Spalletti", kit: ["#009246", "#ffffff"] },
  Belgium: { formation: "4-2-3-1", manager: "Rudi Garcia", kit: ["#fd2187", "#000000"] },
  Croatia: { formation: "4-2-3-1", manager: "Zlatko Dalić", kit: ["#ffffff", "#171796"] },
  Morocco: { formation: "4-3-3", manager: "Walid Regragui", kit: ["#c1272d", "#006233"] },
  Uruguay: { formation: "4-4-2", manager: "Marcelo Bielsa", kit: ["#75aadb", "#000000"] },
  Colombia: { formation: "4-2-3-1", manager: "Néstor Lorenzo", kit: ["#fcd116", "#003893"] },
  Mexico: { formation: "4-3-3", manager: "Javier Aguirre", kit: ["#006847", "#ce1126"] },
  USA: { formation: "4-3-3", manager: "Mauricio Pochettino", kit: ["#002868", "#bf0a30"] },
  Japan: { formation: "4-2-3-1", manager: "Hajime Moriyasu", kit: ["#000080", "#ffffff"] },
  Senegal: { formation: "4-3-3", manager: "Pape Thiaw", kit: ["#00853f", "#fdef42"] },
  Nigeria: { formation: "4-2-3-1", manager: "Eric Chelle", kit: ["#008751", "#ffffff"] },
};

export function getTeamTactics(
  teamName: string,
  teamType: "CLUB" | "COUNTRY"
): TeamTactics {
  return (
    TEAM_TACTICS[teamName] ??
    (teamType === "COUNTRY" ? DEFAULT_NATION : DEFAULT_CLUB)
  );
}
