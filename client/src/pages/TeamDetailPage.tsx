import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { TeamDetail } from "../types";
import { WinPctLineChart } from "../components/Charts";
import { MatchRow } from "../components/TeamCard";
import {
  Card,
  EmptyState,
  FormBadge,
  Loading,
  PageHeader,
  StatTile,
} from "../components/ui";

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .getTeam(id)
      .then((data) => {
        if (!cancelled) setTeam(data as TeamDetail);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <Loading label="Loading team..." />;
  if (error || !team) {
    return <EmptyState title="Team not found" description={error ?? undefined} />;
  }

  const stats = team.seasonStats;

  return (
    <div>
      <PageHeader
        title={team.name}
        subtitle={`${
          team.type === "CLUB"
            ? `${team.league ?? "Club"} · FIFA club #${team.fifaRank ?? "—"}`
            : `FIFA #${team.fifaRank ?? "—"} · ${team.confederation ?? "National team"}`
        } · ${team.country}`}
        actions={
          <Link
            to={`/players?teamId=${team.id}`}
            className="rounded-lg bg-pitch-700 px-3 py-2 text-sm font-semibold text-white hover:bg-pitch-800"
          >
            View players
          </Link>
        }
      />

      <div className="mb-6 flex items-center gap-4">
        {team.logoUrl ? (
          <img src={team.logoUrl} alt="" className="h-16 w-16 rounded-xl" />
        ) : null}
        <div>
          <p className="text-sm text-ink-500">Recent form</p>
          <div className="mt-1 flex gap-1">
            {team.recentForm.length === 0 ? (
              <span className="text-sm text-ink-500">No matches yet</span>
            ) : (
              team.recentForm.map((f, i) => <FormBadge key={i} result={f.result} />)
            )}
          </div>
        </div>
      </div>

      {stats ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Record" value={`${stats.wins}-${stats.draws}-${stats.losses}`} hint="W-D-L" />
          <StatTile label="Goals" value={`${stats.goalsFor}:${stats.goalsAgainst}`} hint={`GD ${stats.goalDifference >= 0 ? "+" : ""}${stats.goalDifference}`} />
          <StatTile label="Win %" value={`${stats.winPercentage}%`} />
          <StatTile label="Played" value={stats.wins + stats.draws + stats.losses} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
            Win % over time
          </h2>
          {team.winPctOverTime.length === 0 ? (
            <EmptyState title="No match history" />
          ) : (
            <WinPctLineChart data={team.winPctOverTime} />
          )}
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
            Recent matches
          </h2>
          {team.recentMatches.length === 0 ? (
            <EmptyState title="No matches" />
          ) : (
            <div>
              {team.recentMatches.map((m) => (
                <MatchRow key={m.id} match={m} highlightTeamId={team.id} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
