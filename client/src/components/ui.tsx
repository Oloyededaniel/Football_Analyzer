export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-500">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-pitch-200 border-t-pitch-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-ink-800">{title}</p>
      {description ? <p className="mt-2 text-sm text-ink-500">{description}</p> : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-ink-200/80 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function FormBadge({ result }: { result: "W" | "D" | "L" }) {
  const styles =
    result === "W"
      ? "bg-pitch-600 text-white"
      : result === "D"
        ? "bg-ink-200 text-ink-700"
        : "bg-red-600 text-white";
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${styles}`}
      title={result === "W" ? "Win" : result === "D" ? "Draw" : "Loss"}
    >
      {result}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg bg-ink-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Search..."}
      className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none ring-pitch-500/30 placeholder:text-ink-500 focus:border-pitch-500 focus:ring-2 sm:w-64"
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-pitch-500 focus:ring-2 focus:ring-pitch-500/30"
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TypeToggle({
  value,
  onChange,
}: {
  value: "CLUB" | "COUNTRY";
  onChange: (v: "CLUB" | "COUNTRY") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-ink-200 bg-white p-1">
      {(["CLUB", "COUNTRY"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
            value === t ? "bg-pitch-700 text-white" : "text-ink-500 hover:text-ink-800"
          }`}
        >
          {t === "CLUB" ? "Club" : "Country"}
        </button>
      ))}
    </div>
  );
}
