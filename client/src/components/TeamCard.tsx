import { Link } from "react-router-dom";
import type { Team } from "../types";
import { FormBadge } from "./ui";

export function TeamCard({ team }: { team: Team }) {
  const stats = team.seasonStats;
  return (
    <Link
      to={`/teams/${team.id}`}
      className="group block rounded-xl border border-ink-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-pitch-500/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        {team.logoUrl ? (
          <img src={team.logoUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pitch-100 font-display font-bold text-pitch-700">
            {team.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-base font-semibold text-ink-900 group-hover:text-pitch-700">
              {team.name}
            </h3>
            {team.fifaRank != null ? (
              <span
                className="shrink-0 rounded-md bg-pitch-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pitch-100"
                title={team.type === "COUNTRY" ? "FIFA World Ranking" : "FIFA Club Ranking"}
              >
                FIFA #{team.fifaRank}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-500">
            {team.type === "CLUB"
              ? `${team.league ?? "Club"} · ${team.country}`
              : `${team.confederation ?? "FIFA"} · National team`}
          </p>
        </div>
      </div>
      {stats ? (
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <p className="font-semibold text-ink-900">{stats.wins}</p>
            <p className="text-ink-500">W</p>
          </div>
          <div>
            <p className="font-semibold text-ink-900">{stats.draws}</p>
            <p className="text-ink-500">D</p>
          </div>
          <div>
            <p className="font-semibold text-ink-900">{stats.losses}</p>
            <p className="text-ink-500">L</p>
          </div>
          <div>
            <p className="font-semibold text-pitch-700">{stats.winPercentage}%</p>
            <p className="text-ink-500">Win%</p>
          </div>
        </div>
      ) : null}
    </Link>
  );
}

export function MatchRow({
  match,
  highlightTeamId,
}: {
  match: {
    id: string;
    date: string;
    competition: string;
    homeScore: number;
    awayScore: number;
    homeTeam: { id: string; name: string };
    awayTeam: { id: string; name: string };
  };
  highlightTeamId?: string;
}) {
  let badge: "W" | "D" | "L" | null = null;
  if (highlightTeamId) {
    const isHome = match.homeTeam.id === highlightTeamId;
    const forScore = isHome ? match.homeScore : match.awayScore;
    const against = isHome ? match.awayScore : match.homeScore;
    badge = forScore > against ? "W" : forScore < against ? "L" : "D";
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 py-3 last:border-0">
      {badge ? <FormBadge result={badge} /> : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-900">
          <Link to={`/teams/${match.homeTeam.id}`} className="hover:text-pitch-700">
            {match.homeTeam.name}
          </Link>
          <span className="mx-2 font-display font-bold">
            {match.homeScore}–{match.awayScore}
          </span>
          <Link to={`/teams/${match.awayTeam.id}`} className="hover:text-pitch-700">
            {match.awayTeam.name}
          </Link>
        </p>
        <p className="text-xs text-ink-500">
          {new Date(match.date).toLocaleDateString()} · {match.competition}
        </p>
      </div>
    </div>
  );
}
