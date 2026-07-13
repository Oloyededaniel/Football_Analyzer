import { useMemo, useState } from "react";
import type { Player } from "../types";
import { getTeamTactics } from "../data/teamFormations";
import {
  FORMATION_IDS,
  buildLineup,
  shortPitchName,
  type FormationId,
  type PlacedPlayer,
} from "../lib/formation";

type Props = {
  players: Player[];
  teamName: string;
  teamType: "CLUB" | "COUNTRY";
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function JerseyToken({
  placed,
  primary,
  secondary,
  active,
  onClick,
}: {
  placed: PlacedPlayer;
  primary: string;
  secondary: string;
  active: boolean;
  onClick: () => void;
}) {
  const { slot, player } = placed;
  const ovr = player.abilities?.overallRating;

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute z-10 flex w-[4.6rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 outline-none transition duration-200 hover:z-20 hover:scale-110 focus-visible:z-20 focus-visible:scale-110 sm:w-[5.25rem]"
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
      aria-label={`${player.name}, ${slot.role}`}
    >
      <div
        className={`relative flex h-10 w-9 items-center justify-center rounded-sm shadow-lg transition sm:h-11 sm:w-10 ${
          active ? "ring-2 ring-white ring-offset-2 ring-offset-pitch-800 scale-110" : ""
        }`}
        style={{
          background: `linear-gradient(160deg, ${primary} 0%, ${primary} 46%, ${secondary} 46%, ${secondary} 54%, ${primary} 54%)`,
          boxShadow: active
            ? "0 0 0 2px rgba(255,255,255,0.9), 0 8px 20px rgba(0,0,0,0.45)"
            : "0 6px 14px rgba(0,0,0,0.35)",
        }}
      >
        <span
          className="font-display text-[9px] font-bold tracking-wide sm:text-[10px]"
          style={{
            color: "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,0.65)",
          }}
        >
          {slot.role}
        </span>
        {ovr != null ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded bg-ink-900/90 px-0.5 text-[8px] font-bold text-white">
            {ovr}
          </span>
        ) : null}
      </div>
      <span className="max-w-full truncate rounded bg-black/55 px-1 py-0.5 text-center text-[8px] font-semibold uppercase tracking-wide text-white shadow sm:text-[9px]">
        {shortPitchName(player.name)}
      </span>
    </button>
  );
}

export function PitchFormation({
  players,
  teamName,
  teamType,
  selectedId,
  onSelect,
}: Props) {
  const tactics = getTeamTactics(teamName, teamType);
  const [formationOverride, setFormationOverride] = useState<FormationId | "">(
    ""
  );

  const lineup = useMemo(() => {
    const id = (formationOverride || tactics.formation) as FormationId;
    return buildLineup(players, id);
  }, [players, formationOverride, tactics.formation]);

  const [primary, secondary] = tactics.kit;
  const bench = lineup.bench.slice(0, 9);
  const extras = lineup.bench.slice(9);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pitch-700">
            Tactical pitch
          </p>
          <h2 className="font-display text-xl font-bold text-ink-900">
            {teamName} · {lineup.formation}
          </h2>
          <p className="text-sm text-ink-500">
            Best XI by overall · reserves on the bench
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          Formation
          <select
            value={formationOverride || tactics.formation}
            onChange={(e) =>
              setFormationOverride(e.target.value as FormationId)
            }
            className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-800 shadow-sm outline-none focus:border-pitch-500"
          >
            {FORMATION_IDS.map((id) => (
              <option key={id} value={id}>
                {id}
                {id === tactics.formation ? " (default)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10">
          {/* Pitch */}
          <div
            className="relative aspect-[2/3] w-full sm:aspect-[3/4]"
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  #1a7a3c 0px,
                  #1a7a3c 28px,
                  #176f36 28px,
                  #176f36 56px
                )
              `,
            }}
          >
            {/* Soft vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.28)_100%)]" />

            {/* Markings */}
            <svg
              className="pointer-events-none absolute inset-[3%] h-[94%] w-[94%]"
              viewBox="0 0 100 150"
              preserveAspectRatio="none"
              aria-hidden
            >
              <rect
                x="1"
                y="1"
                width="98"
                height="148"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.7"
              />
              <line
                x1="1"
                y1="75"
                x2="99"
                y2="75"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.55"
              />
              <circle
                cx="50"
                cy="75"
                r="12"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.55"
              />
              <circle cx="50" cy="75" r="0.9" fill="rgba(255,255,255,0.85)" />
              {/* Top box */}
              <rect
                x="22"
                y="1"
                width="56"
                height="22"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.55"
              />
              <rect
                x="35"
                y="1"
                width="30"
                height="10"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.55"
              />
              {/* Bottom box */}
              <rect
                x="22"
                y="127"
                width="56"
                height="22"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.55"
              />
              <rect
                x="35"
                y="139"
                width="30"
                height="10"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.55"
              />
              <path
                d="M 35 23 A 12 12 0 0 0 65 23"
                fill="none"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="0.55"
              />
              <path
                d="M 35 127 A 12 12 0 0 1 65 127"
                fill="none"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="0.55"
              />
            </svg>

            {/* Manager badge */}
            <div className="absolute left-3 top-3 z-20 rounded-md bg-ink-900/85 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm sm:text-xs">
              Manager: {tactics.manager}
            </div>

            {/* Formation chip */}
            <div className="absolute right-3 top-3 z-20 rounded-md bg-white/15 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow backdrop-blur-sm sm:text-xs">
              {lineup.formation}
            </div>

            {lineup.starters.map((placed) => (
              <JerseyToken
                key={placed.player.id}
                placed={placed}
                primary={primary}
                secondary={secondary}
                active={placed.player.id === selectedId}
                onClick={() => onSelect(placed.player.id)}
              />
            ))}
          </div>
        </div>

        {/* Coach / bench column */}
        <aside className="flex flex-col gap-3">
          <div className="rounded-xl border border-ink-200 bg-gradient-to-b from-ink-800 to-ink-900 p-3 text-white shadow-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Technical area
            </p>
            <p className="mt-1 font-display text-sm font-bold leading-tight">
              {tactics.manager}
            </p>
            <p className="mt-0.5 text-xs text-white/70">{teamName} coach</p>
            <div className="mt-3 flex items-center gap-2">
              <div
                className="flex h-9 w-8 items-center justify-center rounded-sm text-[9px] font-bold text-white shadow"
                style={{
                  background: `linear-gradient(160deg, ${primary}, ${secondary})`,
                }}
              >
                HC
              </div>
              <div className="text-[10px] leading-snug text-white/75">
                Beside the dugout · set piece board
              </div>
            </div>
          </div>

          <div className="flex-1 rounded-xl border border-ink-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                Bench
              </p>
              <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-700">
                {lineup.bench.length}
              </span>
            </div>
            {bench.length === 0 ? (
              <p className="text-xs text-ink-500">No reserves</p>
            ) : (
              <ul className="space-y-1.5">
                {bench.map((p) => {
                  const active = p.id === selectedId;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(p.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition ${
                          active
                            ? "bg-pitch-100 ring-1 ring-pitch-500"
                            : "hover:bg-ink-50"
                        }`}
                      >
                        <span
                          className="flex h-7 w-6 shrink-0 items-center justify-center rounded-[3px] text-[8px] font-bold text-white"
                          style={{ background: primary }}
                        >
                          {p.position}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-ink-900">
                            {shortPitchName(p.name)}
                          </span>
                          <span className="block text-[10px] text-ink-500">
                            OVR {p.abilities?.overallRating ?? "—"}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {extras.length > 0 ? (
              <p className="mt-2 text-[10px] text-ink-500">
                +{extras.length} more in squad
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
