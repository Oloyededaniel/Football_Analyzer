import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAppContext } from "../context/AppContext";
import type { Player, Team } from "../types";
import { AbilityRadar } from "../components/Charts";
import { PitchFormation } from "../components/PitchFormation";
import {
  Card,
  EmptyState,
  Loading,
  PageHeader,
  SearchInput,
  Select,
} from "../components/ui";

export function PlayersPage() {
  const { teamType, comparePlayerIds, toggleComparePlayer } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const teamIdParam = searchParams.get("teamId") ?? "";

  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [position, setPosition] = useState("");
  const [teamId, setTeamId] = useState(teamIdParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"pitch" | "list">("pitch");

  useEffect(() => {
    api.getTeams({ type: teamType }).then((data) => setTeams(data as Team[]));
  }, [teamType]);

  useEffect(() => {
    if (teamIdParam) {
      setTeamId(teamIdParam);
      setView("pitch");
    }
  }, [teamIdParam]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getPlayers({
        teamId: teamId || undefined,
        q: q || undefined,
        position: position || undefined,
        type: teamId ? undefined : teamType,
      })
      .then((data) => {
        if (cancelled) return;
        const list = data as Player[];
        setPlayers(list);
        setSelectedId((prev) => {
          if (prev && list.some((p) => p.id === prev)) return prev;
          return list[0]?.id ?? null;
        });
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
  }, [teamId, q, position, teamType]);

  const selected = players.find((p) => p.id === selectedId) ?? null;
  const selectedTeam = useMemo(() => {
    const fromList = teams.find((t) => t.id === teamId);
    if (fromList) return fromList;
    const fromPlayer = players.find((p) => p.teamId === teamId)?.team;
    if (fromPlayer && teamId) {
      return {
        id: fromPlayer.id,
        name: fromPlayer.name,
        type: fromPlayer.type ?? teamType,
        country: fromPlayer.country ?? "",
        league: null,
        logoUrl: fromPlayer.logoUrl,
      } satisfies Team;
    }
    return null;
  }, [teams, teamId, players, teamType]);

  const teamOptions = [...teams]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({
      value: t.id,
      label: t.name,
    }));

  const showPitch = Boolean(teamId && selectedTeam && view === "pitch" && !q && !position);

  return (
    <div>
      <PageHeader
        title="Player Analyzer"
        subtitle={
          showPitch && selectedTeam
            ? `${selectedTeam.name} lineup on the pitch · switch formation anytime`
            : "Full squads · overall ratings from current EA Sports FC data (when available)"
        }
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Search players..." />
            <Select
              value={teamId}
              onChange={(v) => {
                setTeamId(v);
                setSearchParams(v ? { teamId: v } : {});
                if (v) setView("pitch");
              }}
              placeholder="All teams"
              options={teamOptions}
            />
            {teamId ? (
              <div className="flex overflow-hidden rounded-lg border border-ink-200 bg-white text-sm font-semibold shadow-sm">
                <button
                  type="button"
                  onClick={() => setView("pitch")}
                  className={`px-3 py-2 ${
                    view === "pitch"
                      ? "bg-pitch-700 text-white"
                      : "text-ink-600 hover:bg-ink-50"
                  }`}
                >
                  Pitch
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`px-3 py-2 ${
                    view === "list"
                      ? "bg-pitch-700 text-white"
                      : "text-ink-600 hover:bg-ink-50"
                  }`}
                >
                  List
                </button>
              </div>
            ) : (
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
            )}
          </>
        }
      />

      {loading ? <Loading label="Loading players..." /> : null}
      {error ? <EmptyState title="Could not load players" description={error} /> : null}
      {!loading && !error && players.length === 0 ? (
        <EmptyState title="No players found" description="Adjust filters or pick another team." />
      ) : null}

      {!loading && !error && players.length > 0 && showPitch && selectedTeam ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]">
          <Card className="overflow-visible">
            <PitchFormation
              players={players}
              teamName={selectedTeam.name}
              teamType={selectedTeam.type}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </Card>

          <Card>
            {selected && selected.abilities ? (
              <PlayerDetail
                selected={selected}
                inCompare={comparePlayerIds.includes(selected.id)}
                onToggleCompare={() => toggleComparePlayer(selected.id)}
              />
            ) : (
              <EmptyState
                title="Select a player"
                description="Tap a jersey on the pitch or someone on the bench."
              />
            )}
          </Card>
        </div>
      ) : null}

      {!loading && !error && players.length > 0 && !showPitch ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Card className="max-h-[640px] overflow-auto p-0">
            <ul className="divide-y divide-ink-100">
              {players.map((p) => {
                const active = p.id === selectedId;
                const inCompare = comparePlayerIds.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                        active ? "bg-pitch-50" : "hover:bg-ink-50"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-pitch-800 text-white">
                        <span className="text-[9px] uppercase leading-none opacity-70">OVR</span>
                        <span className="text-sm font-bold leading-none">
                          {p.abilities?.overallRating ?? "—"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">{p.name}</p>
                        <p className="truncate text-xs text-ink-500">
                          {p.position} · {p.team?.name ?? "—"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComparePlayer(p.id);
                        }}
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          inCompare
                            ? "bg-pitch-700 text-white"
                            : "border border-ink-200 text-ink-600 hover:border-pitch-500"
                        }`}
                      >
                        {inCompare ? "Added" : "Compare"}
                      </button>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            {selected && selected.abilities ? (
              <PlayerDetail
                selected={selected}
                inCompare={comparePlayerIds.includes(selected.id)}
                onToggleCompare={() => toggleComparePlayer(selected.id)}
              />
            ) : (
              <EmptyState title="Select a player" description="Choose someone from the list." />
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function PlayerDetail({
  selected,
  inCompare,
  onToggleCompare,
}: {
  selected: Player;
  inCompare: boolean;
  onToggleCompare: () => void;
}) {
  if (!selected.abilities) return null;
  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">{selected.name}</h2>
          <p className="text-sm text-ink-500">
            {selected.preferredRole ?? selected.position} · Age {selected.age} ·{" "}
            {selected.nationality}
          </p>
          {selected.team ? (
            <Link
              to={`/teams/${selected.team.id}`}
              className="mt-1 inline-block text-sm font-medium text-pitch-700 hover:underline"
            >
              {selected.team.name}
            </Link>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-lg bg-pitch-700 px-3 py-2 text-center text-white">
            <p className="text-[10px] uppercase tracking-wide opacity-80">Overall</p>
            <p className="font-display text-2xl font-bold leading-none">
              {selected.abilities.overallRating}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleCompare}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
              inCompare
                ? "bg-pitch-700 text-white"
                : "border border-ink-200 text-ink-600 hover:border-pitch-500"
            }`}
          >
            {inCompare ? "In compare" : "Compare"}
          </button>
        </div>
      </div>
      <AbilityRadar series={[{ name: selected.name, abilities: selected.abilities }]} />
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs sm:grid-cols-6">
        {(
          [
            ["Pace", selected.abilities.pace],
            ["Shoot", selected.abilities.shooting],
            ["Pass", selected.abilities.passing],
            ["Dribble", selected.abilities.dribbling],
            ["Defend", selected.abilities.defending],
            ["Phys", selected.abilities.physical],
          ] as const
        ).map(([label, val]) => (
          <div key={label} className="rounded-md bg-ink-50 px-2 py-2">
            <p className="font-semibold text-ink-900">{val}</p>
            <p className="text-ink-500">{label}</p>
          </div>
        ))}
      </div>
    </>
  );
}
