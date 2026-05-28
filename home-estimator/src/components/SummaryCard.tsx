interface SummaryCardProps {
  label: string;
  value: string;
  tone?: "dark" | "warm" | "cool";
  sublabel?: string;
}

export function SummaryCard({
  label,
  value,
  tone = "dark",
  sublabel,
}: SummaryCardProps) {
  const toneClasses =
    tone === "warm"
      ? "bg-gradient-to-br from-cream to-white text-ink"
      : tone === "cool"
        ? "bg-gradient-to-br from-teal-50 to-sky-50 text-ink"
        : "bg-gradient-to-br from-ink to-slate-800 text-white";

  return (
    <div className={`rounded-[28px] p-5 shadow-panel ${toneClasses}`}>
      <p className={`text-sm ${tone === "dark" ? "text-white/70" : "text-slate"}`}>{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {sublabel ? (
        <p className={`mt-2 text-sm ${tone === "dark" ? "text-white/70" : "text-slate"}`}>
          {sublabel}
        </p>
      ) : null}
    </div>
  );
}
