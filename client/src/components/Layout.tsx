import { NavLink, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { TypeToggle } from "./ui";

const links = [
  { to: "/", label: "Teams" },
  { to: "/players", label: "Players" },
  { to: "/compare", label: "Compare" },
  { to: "/matches", label: "Matches" },
  { to: "/predict", label: "Predict" },
  { to: "/analytics", label: "Analytics" },
];

export function Layout() {
  const { teamType, setTeamType, comparePlayerIds } = useAppContext();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-ink-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pitch-800 text-sm font-bold text-pitch-100">
              FA
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none text-ink-900">
                Football Analyzer
              </p>
              <p className="text-xs text-ink-500">Club & country performance</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-pitch-100 text-pitch-800"
                      : "text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                  }`
                }
              >
                {l.label}
                {l.to === "/compare" && comparePlayerIds.length > 0
                  ? ` (${comparePlayerIds.length})`
                  : ""}
              </NavLink>
            ))}
          </nav>
          <TypeToggle value={teamType} onChange={setTeamType} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
