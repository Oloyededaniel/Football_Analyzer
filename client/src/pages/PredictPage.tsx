import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAppContext } from "../context/AppContext";
import type { MatchPrediction, Team } from "../types";
import {
  Card,
  EmptyState,
  FormBadge,
  Loading,
  PageHeader,
  Select,
  StatTile,
} from "../components/ui";

function ProbBar({
  home,
  draw,
  away,
  homeLabel,
  awayLabel,
}: {
  home: number;
  draw: number;
  away: number;
  homeLabel: string;
  awayLabel: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-medium text-ink-600">
        <span>
          {homeLabel} {home}%
        </span>
        <span>Draw {draw}%</span>
        <span>
          {awayLabel} {away}%
        </span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full">
        <div className="bg-pitch-600" style={{ width: `${home}%` }} />
        <div className="bg-ink-300" style={{ width: `${draw}%` }} />
        <div className="bg-[#1e3a5f]" style={{ width: `${away}%` }} />
      </div>
    </div>
  );
}

function StatCompare({
  label,
  home,
  away,
}: {
  label: string;
  home: number;
  away: number;
}) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  return (
    <div className="py-2">
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-semibold text-ink-900">{home}</span>
        <span className="text-xs uppercase tracking-wide text-ink-500">{label}</span>
        <span className="font-semibold text-ink-900">{away}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-ink-100">
        <div className="bg-pitch-600" style={{ width: `${homePct}%` }} />
        <div className="bg-[#1e3a5f]" style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  );
}

export function PredictPage() {
  const { teamType } = useAppContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [homeId, setHomeId] = useState("");
  const [awayId, setAwayId] = useState("");
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingPred, setLoadingPred] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingTeams(true);
    setHomeId("");
    setAwayId("");
    setPrediction(null);
    api
      .getTeams({ type: teamType })
      .then((data) => setTeams(data as Team[]))
      .finally(() => setLoadingTeams(false));
  }, [teamType]);

  useEffect(() => {
    if (!homeId || !awayId || homeId === awayId) {
      setPrediction(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoadingPred(true);
    setError(null);
    api
      .predictMatch(homeId, awayId)
      .then((data) => {
        if (!cancelled) setPrediction(data as MatchPrediction);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setPrediction(null);
          setError(e.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPred(false);
      });
    return () => {
      cancelled = true;
    };
  }, [homeId, awayId]);

  const options = [...teams]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({
      value: t.id,
      label: t.name,
    }));

  return (
    <div>
      <PageHeader
        title="Match Predictor"
        subtitle="Poisson model from real attack/defence rates, form, H2H, and FIFA rank (nations)"
        actions={
          loadingTeams ? null : (
            <>
              <Select value={homeId} onChange={setHomeId} placeholder="Home team" options={options} />
              <Select
                value={awayId}
                onChange={setAwayId}
                placeholder="Away team"
                options={options.filter((o) => o.value !== homeId)}
              />
            </>
          )
        }
      />

      {loadingTeams ? <Loading label="Loading teams..." /> : null}
      {!homeId || !awayId ? (
        <EmptyState
          title="Select two teams"
          description={`Pick a home and away ${teamType === "CLUB" ? "club" : "national team"} to forecast score and match stats.`}
        />
      ) : null}
      {homeId && awayId && homeId === awayId ? (
        <EmptyState title="Pick different teams" />
      ) : null}
      {loadingPred ? <Loading label="Running prediction..." /> : null}
      {error ? <EmptyState title="Could not predict" description={error} /> : null}

      {prediction && !loadingPred ? (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-xs uppercase tracking-wide text-ink-500">Home</p>
                <p className="font-display text-xl font-bold text-ink-900">
                  {prediction.homeTeam.name}
                </p>
                {prediction.homeTeam.fifaRank != null ? (
                  <p className="text-xs text-ink-500">FIFA #{prediction.homeTeam.fifaRank}</p>
                ) : null}
                <div className="mt-2 flex justify-center gap-1 sm:justify-start">
                  {prediction.form.home.map((r, i) => (
                    <FormBadge key={i} result={r} />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs uppercase tracking-wide text-ink-500">Most likely score</p>
                <p className="font-display text-5xl font-extrabold tabular-nums text-pitch-800">
                  {prediction.predictedScore.home}
                  <span className="mx-2 text-ink-300">:</span>
                  {prediction.predictedScore.away}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  xG {prediction.expectedGoals.home} – {prediction.expectedGoals.away} · confidence{" "}
                  {prediction.confidence}%
                </p>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-xs uppercase tracking-wide text-ink-500">Away</p>
                <p className="font-display text-xl font-bold text-ink-900">
                  {prediction.awayTeam.name}
                </p>
                {prediction.awayTeam.fifaRank != null ? (
                  <p className="text-xs text-ink-500">FIFA #{prediction.awayTeam.fifaRank}</p>
                ) : null}
                <div className="mt-2 flex justify-center gap-1 sm:justify-end">
                  {prediction.form.away.map((r, i) => (
                    <FormBadge key={i} result={r} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <ProbBar
                home={prediction.probabilities.homeWin}
                draw={prediction.probabilities.draw}
                away={prediction.probabilities.awayWin}
                homeLabel={prediction.homeTeam.name}
                awayLabel={prediction.awayTeam.name}
              />
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile label="Over 2.5" value={`${prediction.probabilities.over25}%`} />
            <StatTile label="Under 2.5" value={`${prediction.probabilities.under25}%`} />
            <StatTile label="BTTS" value={`${prediction.probabilities.btts}%`} hint="Both teams to score" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
                Predicted match stats
              </h2>
              <p className="mb-3 text-center text-xs text-ink-500">
                {prediction.homeTeam.name} · {prediction.awayTeam.name}
              </p>
              <StatCompare
                label="Possession %"
                home={prediction.predictedStats.possession.home}
                away={prediction.predictedStats.possession.away}
              />
              <StatCompare
                label="Shots"
                home={prediction.predictedStats.shots.home}
                away={prediction.predictedStats.shots.away}
              />
              <StatCompare
                label="Shots on target"
                home={prediction.predictedStats.shotsOnTarget.home}
                away={prediction.predictedStats.shotsOnTarget.away}
              />
              <StatCompare
                label="Corners"
                home={prediction.predictedStats.corners.home}
                away={prediction.predictedStats.corners.away}
              />
              <StatCompare
                label="Fouls"
                home={prediction.predictedStats.fouls.home}
                away={prediction.predictedStats.fouls.away}
              />
            </Card>

            <Card>
              <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
                Top scorelines
              </h2>
              <ul className="divide-y divide-ink-100">
                {prediction.scoreMatrix.map((s) => (
                  <li
                    key={`${s.home}-${s.away}`}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="font-display font-bold tabular-nums text-ink-900">
                      {s.home}–{s.away}
                    </span>
                    <span className="text-ink-500">{s.probability}%</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
                <p>
                  H2H: {prediction.h2h.played} meetings · {prediction.h2h.homeWins}–
                  {prediction.h2h.draws}–{prediction.h2h.awayWins}
                  {prediction.h2h.played
                    ? ` · avg ${prediction.h2h.avgGoals} goals`
                    : ""}
                </p>
                <p className="mt-1 text-ink-500">{prediction.model}</p>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
