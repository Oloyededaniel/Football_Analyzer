import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAppContext } from "../context/AppContext";
import type { Player, TopScorer, WinPctLeader } from "../types";
import { SimpleBarChart } from "../components/Charts";
import {
  Card,
  EmptyState,
  Loading,
  PageHeader,
  Select,
} from "../components/ui";

export function AnalyticsPage() {
  const { teamType } = useAppContext();
  const [position, setPosition] = useState("");
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [winLeaders, setWinLeaders] = useState<WinPctLeader[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api.getTopScorers({ type: teamType, limit: "12" }),
      api.getBestWinPct({ type: teamType, limit: "10" }),
      api.getTopPlayers({
        type: teamType,
        position: position || undefined,
        limit: "12",
      }),
    ])
      .then(([s, w, p]) => {
        if (cancelled) return;
        setScorers(s as TopScorer[]);
        setWinLeaders(w as WinPctLeader[]);
        setTopPlayers(p as Player[]);
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
  }, [teamType, position]);

  return (
    <div>
      <PageHeader
        title="Analytics & Insights"
        subtitle={`Leaders across ${teamType === "CLUB" ? "club" : "national"} competitions`}
        actions={
          <Select
            value={position}
            onChange={setPosition}
            placeholder="All positions"
            options={[
              { value: "GK", label: "GK" },
              { value: "DEF", label: "DEF" },
              { value: "MID", label: "MID" },
              { value: "FWD", label: "FWD" },
            ]}
          />
        }
      />

      {loading ? <Loading label="Loading analytics..." /> : null}
      {error ? <EmptyState title="Could not load analytics" description={error} /> : null}

      {!loading && !error ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
                Best win %
              </h2>
              {winLeaders.length === 0 ? (
                <EmptyState title="No data" />
              ) : (
                <SimpleBarChart
                  data={winLeaders.map((t) => ({
                    name: t.name,
                    winPercentage: t.stats.winPercentage,
                  }))}
                  dataKey="winPercentage"
                  nameKey="name"
                  color="#15803d"
                />
              )}
            </Card>

            <Card>
              <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
                Top scorers
              </h2>
              {scorers.length === 0 ? (
                <EmptyState title="No scorers" />
              ) : (
                <SimpleBarChart
                  data={scorers.map((s) => ({
                    name: s.name,
                    goals: s.goals,
                  }))}
                  dataKey="goals"
                  nameKey="name"
                  color="#1e3a5f"
                />
              )}
            </Card>
          </div>

          <Card className="overflow-x-auto">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
              Highest-rated players{position ? ` · ${position}` : ""}
            </h2>
            {topPlayers.length === 0 ? (
              <EmptyState title="No players" />
            ) : (
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                    <th className="py-2 pr-3 font-medium">#</th>
                    <th className="py-2 pr-3 font-medium">Player</th>
                    <th className="py-2 pr-3 font-medium">Pos</th>
                    <th className="py-2 pr-3 font-medium">Team</th>
                    <th className="py-2 pr-3 font-medium">OVR</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.map((p, i) => (
                    <tr key={p.id} className="border-b border-ink-100">
                      <td className="py-2 pr-3 text-ink-500">{i + 1}</td>
                      <td className="py-2 pr-3 font-medium text-ink-900">{p.name}</td>
                      <td className="py-2 pr-3">{p.position}</td>
                      <td className="py-2 pr-3">
                        {p.team ? (
                          <Link
                            to={`/teams/${p.team.id}`}
                            className="text-pitch-700 hover:underline"
                          >
                            {p.team.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 pr-3 font-semibold text-pitch-700">
                        {p.abilities?.overallRating ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card className="overflow-x-auto">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
              Scorer table
            </h2>
            {scorers.length === 0 ? (
              <EmptyState title="No scorers" />
            ) : (
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                    <th className="py-2 pr-3 font-medium">#</th>
                    <th className="py-2 pr-3 font-medium">Player</th>
                    <th className="py-2 pr-3 font-medium">Team</th>
                    <th className="py-2 pr-3 font-medium">Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {scorers.map((s, i) => (
                    <tr key={s.playerId} className="border-b border-ink-100">
                      <td className="py-2 pr-3 text-ink-500">{i + 1}</td>
                      <td className="py-2 pr-3 font-medium text-ink-900">{s.name}</td>
                      <td className="py-2 pr-3">
                        <Link
                          to={`/teams/${s.team.id}`}
                          className="text-pitch-700 hover:underline"
                        >
                          {s.team.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 font-semibold">{s.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
