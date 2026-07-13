import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAppContext } from "../context/AppContext";
import type { H2HResponse, Match, Team } from "../types";
import { MatchRow } from "../components/TeamCard";
import {
  Card,
  EmptyState,
  Loading,
  PageHeader,
  Select,
  StatTile,
} from "../components/ui";

export function MatchesPage() {
  const { teamType } = useAppContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamId, setTeamId] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [h2h, setH2h] = useState<H2HResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [h2hLoading, setH2hLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTeams({ type: teamType }).then((data) => {
      const list = data as Team[];
      setTeams(list);
      setTeamId("");
      setTeamA("");
      setTeamB("");
      setH2h(null);
    });
  }, [teamType]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getMatches({
        type: teamType,
        teamId: teamId || undefined,
      })
      .then((data) => {
        if (!cancelled) setMatches(data as Match[]);
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
  }, [teamType, teamId]);

  useEffect(() => {
    if (!teamA || !teamB || teamA === teamB) {
      setH2h(null);
      return;
    }
    let cancelled = false;
    setH2hLoading(true);
    api
      .getH2H(teamA, teamB)
      .then((data) => {
        if (!cancelled) setH2h(data as H2HResponse);
      })
      .catch(() => {
        if (!cancelled) setH2h(null);
      })
      .finally(() => {
        if (!cancelled) setH2hLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [teamA, teamB]);

  const teamOptions = [...teams]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({ value: t.id, label: t.name }));

  return (
    <div>
      <PageHeader
        title="Match Analysis"
        subtitle="Browse results and run head-to-head comparisons"
        actions={
          <Select
            value={teamId}
            onChange={setTeamId}
            placeholder="All teams"
            options={teamOptions}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
            Match list
          </h2>
          {loading ? <Loading label="Loading matches..." /> : null}
          {error ? <EmptyState title="Could not load matches" description={error} /> : null}
          {!loading && !error && matches.length === 0 ? (
            <EmptyState title="No matches" description="Try another team filter." />
          ) : null}
          {!loading &&
            !error &&
            matches.map((m) => (
              <MatchRow key={m.id} match={m} highlightTeamId={teamId || undefined} />
            ))}
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
              Head-to-head
            </h2>
            <div className="mb-4 flex flex-wrap gap-2">
              <Select
                value={teamA}
                onChange={setTeamA}
                placeholder="Team A"
                options={teamOptions}
              />
              <Select
                value={teamB}
                onChange={setTeamB}
                placeholder="Team B"
                options={teamOptions.filter((o) => o.value !== teamA)}
              />
            </div>
            {!teamA || !teamB ? (
              <EmptyState title="Select two teams" description="Compare historical meetings." />
            ) : null}
            {teamA && teamB && teamA === teamB ? (
              <EmptyState title="Pick different teams" />
            ) : null}
            {h2hLoading ? <Loading label="Loading H2H..." /> : null}
            {h2h && !h2hLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <StatTile label={`${h2h.teamA?.name ?? "A"} wins`} value={h2h.aggregate.teamAWins} />
                  <StatTile label="Draws" value={h2h.aggregate.draws} />
                  <StatTile label={`${h2h.teamB?.name ?? "B"} wins`} value={h2h.aggregate.teamBWins} />
                  <StatTile label="Played" value={h2h.aggregate.played} />
                  <StatTile label={`${h2h.teamA?.name ?? "A"} goals`} value={h2h.aggregate.teamAGoals} />
                  <StatTile label={`${h2h.teamB?.name ?? "B"} goals`} value={h2h.aggregate.teamBGoals} />
                </div>
                {h2h.matches.length === 0 ? (
                  <EmptyState title="No meetings found" />
                ) : (
                  <div>
                    {h2h.matches.map((m) => (
                      <MatchRow key={m.id} match={m} />
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
