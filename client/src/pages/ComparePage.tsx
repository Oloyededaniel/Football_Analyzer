import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAppContext } from "../context/AppContext";
import type { Player } from "../types";
import { AbilityRadar } from "../components/Charts";
import { Card, EmptyState, Loading, PageHeader } from "../components/ui";

const ABILITY_ROWS = [
  ["pace", "Pace"],
  ["shooting", "Shooting"],
  ["passing", "Passing"],
  ["dribbling", "Dribbling"],
  ["defending", "Defending"],
  ["physical", "Physical"],
  ["overallRating", "Overall"],
] as const;

export function ComparePage() {
  const { comparePlayerIds, clearComparePlayers, toggleComparePlayer } = useAppContext();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (comparePlayerIds.length < 2) {
      setPlayers([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .comparePlayers(comparePlayerIds)
      .then((data) => {
        if (!cancelled) setPlayers(data as Player[]);
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
  }, [comparePlayerIds]);

  return (
    <div>
      <PageHeader
        title="Player Comparison"
        subtitle="Overlay ability radars for 2–4 players selected from the Player Analyzer"
        actions={
          comparePlayerIds.length > 0 ? (
            <button
              type="button"
              onClick={clearComparePlayers}
              className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              Clear selection
            </button>
          ) : null
        }
      />

      {comparePlayerIds.length < 2 ? (
        <EmptyState
          title="Pick at least two players"
          description="Go to Players, tap Compare on two or more players, then return here."
        />
      ) : null}

      {comparePlayerIds.length >= 2 && loading ? <Loading label="Loading comparison..." /> : null}
      {error ? <EmptyState title="Comparison failed" description={error} /> : null}

      {players.length >= 2 && !loading ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleComparePlayer(p.id)}
                className="rounded-full border border-pitch-200 bg-pitch-50 px-3 py-1 text-xs font-semibold text-pitch-800"
              >
                {p.name} ×
              </button>
            ))}
          </div>

          <Card>
            <AbilityRadar
              series={players
                .filter((p) => p.abilities)
                .map((p) => ({ name: p.name, abilities: p.abilities! }))}
            />
          </Card>

          <Card className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                  <th className="py-2 pr-3 font-medium">Attribute</th>
                  {players.map((p) => (
                    <th key={p.id} className="py-2 px-2 font-medium text-ink-800">
                      <Link to={`/players?teamId=${p.teamId}`} className="hover:text-pitch-700">
                        {p.name}
                      </Link>
                      <p className="font-normal normal-case text-ink-500">
                        {p.position} · {p.team?.name}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ABILITY_ROWS.map(([key, label]) => (
                  <tr key={key} className="border-b border-ink-100">
                    <td className="py-2 pr-3 font-medium text-ink-700">{label}</td>
                    {players.map((p) => {
                      const val = p.abilities?.[key] ?? "—";
                      const nums = players
                        .map((x) => x.abilities?.[key])
                        .filter((n): n is number => typeof n === "number");
                      const max = nums.length ? Math.max(...nums) : null;
                      const isBest = typeof val === "number" && val === max;
                      return (
                        <td
                          key={p.id}
                          className={`py-2 px-2 ${isBest ? "font-bold text-pitch-700" : ""}`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
