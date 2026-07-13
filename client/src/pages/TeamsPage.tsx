import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAppContext } from "../context/AppContext";
import type { Team } from "../types";
import { TeamCard } from "../components/TeamCard";
import { EmptyState, Loading, PageHeader, SearchInput, Select } from "../components/ui";

const LEAGUE_ORDER = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
];

const CONFED_META: Record<string, { title: string; blurb: string }> = {
  UEFA: {
    title: "UEFA",
    blurb: "Europe · UEFA Euro · Nations League · World Cup qualifiers",
  },
  CAF: {
    title: "CAF",
    blurb: "Africa · AFCON · World Cup qualifiers",
  },
  CONMEBOL: {
    title: "CONMEBOL",
    blurb: "South America · Copa América · World Cup qualifiers",
  },
  CONCACAF: {
    title: "CONCACAF",
    blurb: "N/C America & Caribbean · Gold Cup · Nations League",
  },
  AFC: {
    title: "AFC",
    blurb: "Asia · Asian Cup · World Cup qualifiers",
  },
  OFC: {
    title: "OFC",
    blurb: "Oceania · OFC Nations Cup · World Cup qualifiers",
  },
};

const CONFED_ORDER = ["UEFA", "CONMEBOL", "CAF", "CONCACAF", "AFC", "OFC"];

function groupClubs(teams: Team[]) {
  const map = new Map<string, Team[]>();
  for (const t of teams) {
    const key = t.league || "Other";
    const list = map.get(key) ?? [];
    list.push(t);
    map.set(key, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => (a.fifaRank ?? 9999) - (b.fifaRank ?? 9999) || a.name.localeCompare(b.name));
  }
  const keys = [
    ...LEAGUE_ORDER.filter((l) => map.has(l)),
    ...[...map.keys()].filter((k) => !LEAGUE_ORDER.includes(k)).sort(),
  ];
  return keys.map((key) => ({ key, title: key, blurb: "Domestic league clubs", teams: map.get(key)! }));
}

function groupNations(teams: Team[]) {
  const map = new Map<string, Team[]>();
  for (const t of teams) {
    const key = t.confederation || "Other";
    const list = map.get(key) ?? [];
    list.push(t);
    map.set(key, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => (a.fifaRank ?? 9999) - (b.fifaRank ?? 9999) || a.name.localeCompare(b.name));
  }
  const keys = [
    ...CONFED_ORDER.filter((c) => map.has(c)),
    ...[...map.keys()].filter((k) => !CONFED_ORDER.includes(k)).sort(),
  ];
  return keys.map((key) => {
    const meta = CONFED_META[key] ?? { title: key, blurb: "National teams" };
    return { key, title: meta.title, blurb: meta.blurb, teams: map.get(key)! };
  });
}

export function TeamsPage() {
  const { teamType } = useAppContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [confederations, setConfederations] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [league, setLeague] = useState("");
  const [country, setCountry] = useState("");
  const [confederation, setConfederation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTeamFilters().then((f) => {
      setLeagues(f.leagues);
      setCountries(f.countries);
      setConfederations(f.confederations ?? []);
    });
  }, []);

  useEffect(() => {
    setLeague("");
    setCountry("");
    setConfederation("");
  }, [teamType]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getTeams({
        type: teamType,
        q: q || undefined,
        league: teamType === "CLUB" ? league || undefined : undefined,
        country: teamType === "CLUB" ? country || undefined : undefined,
        confederation: teamType === "COUNTRY" ? confederation || undefined : undefined,
        sort: "grouped",
      })
      .then((data) => {
        if (!cancelled) setTeams(data as Team[]);
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
  }, [teamType, q, league, country, confederation]);

  const sections = useMemo(
    () => (teamType === "CLUB" ? groupClubs(teams) : groupNations(teams)),
    [teams, teamType]
  );

  return (
    <div>
      <PageHeader
        title={teamType === "CLUB" ? "Clubs by League" : "Nations by Confederation"}
        subtitle={
          teamType === "CLUB"
            ? "Grouped by league · FIFA club ranking on each card"
            : "UEFA · CAF (AFCON) · CONMEBOL · CONCACAF · AFC · OFC · FIFA world ranking"
        }
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Search teams..." />
            {teamType === "CLUB" ? (
              <>
                <Select
                  value={league}
                  onChange={setLeague}
                  placeholder="All leagues"
                  options={leagues.map((l) => ({ value: l, label: l }))}
                />
                <Select
                  value={country}
                  onChange={setCountry}
                  placeholder="All countries"
                  options={countries.map((c) => ({ value: c, label: c }))}
                />
              </>
            ) : (
              <Select
                value={confederation}
                onChange={setConfederation}
                placeholder="All confederations"
                options={confederations.map((c) => ({
                  value: c,
                  label: CONFED_META[c]?.title
                    ? `${CONFED_META[c].title}${c === "CAF" ? " (AFCON)" : c === "CONCACAF" ? " (Gold Cup)" : ""}`
                    : c,
                }))}
              />
            )}
          </>
        }
      />

      {loading ? <Loading label="Loading teams..." /> : null}
      {error ? <EmptyState title="Could not load teams" description={error} /> : null}
      {!loading && !error && teams.length === 0 ? (
        <EmptyState title="No teams found" description="Try a different search or filter." />
      ) : null}

      {!loading && !error && sections.length > 0 ? (
        <div className="space-y-10">
          <p className="text-xs text-ink-500">{teams.length} teams across {sections.length} groups</p>
          {sections.map((section) => (
            <section key={section.key}>
              <div className="mb-4 border-b border-ink-200 pb-3">
                <h2 className="font-display text-xl font-bold text-ink-900">{section.title}</h2>
                <p className="text-sm text-ink-500">
                  {section.blurb} · {section.teams.length} teams
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.teams.map((t) => (
                  <TeamCard key={t.id} team={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
