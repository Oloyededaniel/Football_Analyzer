import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import type { PlayerAbilities } from "../types";

const ABILITY_KEYS = [
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physical",
] as const;

const COLORS = ["#15803d", "#1e3a5f", "#b45309", "#7c3aed"];

export function AbilityRadar({
  series,
}: {
  series: { name: string; abilities: PlayerAbilities; color?: string }[];
}) {
  const data = ABILITY_KEYS.map((key) => {
    const row: Record<string, string | number> = {
      attribute: key.charAt(0).toUpperCase() + key.slice(1),
    };
    series.forEach((s) => {
      row[s.name] = s.abilities[key];
    });
    return row;
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="attribute" tick={{ fill: "#64748b", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
          {series.map((s, i) => (
            <Radar
              key={s.name}
              name={s.name}
              dataKey={s.name}
              stroke={s.color ?? COLORS[i % COLORS.length]}
              fill={s.color ?? COLORS[i % COLORS.length]}
              fillOpacity={series.length > 1 ? 0.2 : 0.35}
            />
          ))}
          {series.length > 1 ? <Legend /> : null}
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WinPctLineChart({
  data,
}: {
  data: { date: string; winPercentage: number; played: number }[];
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} unit="%" />
          <Tooltip formatter={(v) => [`${v}%`, "Win %"]} />
          <Line
            type="monotone"
            dataKey="winPercentage"
            stroke="#15803d"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBarChart({
  data,
  dataKey,
  nameKey,
  color = "#15803d",
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  nameKey: string;
  color?: string;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis
            type="category"
            dataKey={nameKey}
            width={110}
            tick={{ fontSize: 11, fill: "#334155" }}
          />
          <Tooltip />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
