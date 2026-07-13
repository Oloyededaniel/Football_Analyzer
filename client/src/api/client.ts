async function request<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getTeams: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const q = qs.toString();
    return request(`/api/teams${q ? `?${q}` : ""}`);
  },
  getTeamFilters: () =>
    request<{ leagues: string[]; countries: string[]; confederations: string[] }>(
      "/api/teams/filters"
    ),
  getTeam: (id: string) => request(`/api/teams/${id}`),
  getTeamMatches: (id: string) => request(`/api/teams/${id}/matches`),
  getPlayers: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const q = qs.toString();
    return request(`/api/players${q ? `?${q}` : ""}`);
  },
  getPlayer: (id: string) => request(`/api/players/${id}`),
  comparePlayers: (ids: string[]) =>
    request(`/api/players/compare?ids=${ids.map(encodeURIComponent).join(",")}`),
  getMatches: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const q = qs.toString();
    return request(`/api/matches${q ? `?${q}` : ""}`);
  },
  getH2H: (teamA: string, teamB: string) =>
    request(`/api/matches/h2h?teamA=${encodeURIComponent(teamA)}&teamB=${encodeURIComponent(teamB)}`),
  getTopScorers: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const q = qs.toString();
    return request(`/api/analytics/top-scorers${q ? `?${q}` : ""}`);
  },
  getBestWinPct: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const q = qs.toString();
    return request(`/api/analytics/best-win-pct${q ? `?${q}` : ""}`);
  },
  getTopPlayers: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const q = qs.toString();
    return request(`/api/analytics/top-players${q ? `?${q}` : ""}`);
  },
  predictMatch: (homeTeamId: string, awayTeamId: string) =>
    request(
      `/api/predictions?homeTeamId=${encodeURIComponent(homeTeamId)}&awayTeamId=${encodeURIComponent(awayTeamId)}`
    ),
};
