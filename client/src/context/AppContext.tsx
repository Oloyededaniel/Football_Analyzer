import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TeamType } from "../types";

type AppContextValue = {
  teamType: TeamType;
  setTeamType: (t: TeamType) => void;
  comparePlayerIds: string[];
  toggleComparePlayer: (id: string) => void;
  clearComparePlayers: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [teamType, setTeamType] = useState<TeamType>("CLUB");
  const [comparePlayerIds, setComparePlayerIds] = useState<string[]>([]);

  const value = useMemo<AppContextValue>(
    () => ({
      teamType,
      setTeamType,
      comparePlayerIds,
      toggleComparePlayer: (id: string) => {
        setComparePlayerIds((prev) => {
          if (prev.includes(id)) return prev.filter((x) => x !== id);
          if (prev.length >= 4) return prev;
          return [...prev, id];
        });
      },
      clearComparePlayers: () => setComparePlayerIds([]),
    }),
    [teamType, comparePlayerIds]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
