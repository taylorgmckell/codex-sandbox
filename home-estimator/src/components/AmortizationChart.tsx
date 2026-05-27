import { formatCurrency } from "../lib/format";
import type { AmortizationPoint } from "../types";

interface AmortizationChartProps {
  data: AmortizationPoint[];
}

export function AmortizationChart({ data }: AmortizationChartProps) {
  const width = 640;
  const height = 260;
  const padding = 24;
  const maxBalance = Math.max(...data.map((point) => point.balance), 1);

  const balancePath = data
    .map((point, index) => {
      const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
      const y = padding + (point.balance / maxBalance) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-8 rounded-full bg-ink" />
          Remaining balance
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-8 rounded-full bg-ember" />
          Principal paid
        </span>
      </div>
      <div className="overflow-x-auto rounded-3xl bg-fog p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[560px]">
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = padding + tick * (height - padding * 2);
            const value = maxBalance * (1 - tick);
            return (
              <g key={tick}>
                <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#d7dee7" strokeDasharray="4 6" />
                <text x={padding} y={y - 6} className="fill-slate text-[10px]">
                  {formatCurrency(value)}
                </text>
              </g>
            );
          })}
          {data.map((point, index) => {
            const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
            const barHeight = (point.principalPaid / maxBalance) * (height - padding * 2);
            return (
              <g key={point.year}>
                <rect
                  x={x - 7}
                  y={height - padding - barHeight}
                  width="14"
                  height={barHeight}
                  rx="7"
                  fill="#f97316"
                  opacity={index === 0 ? 0 : 0.7}
                />
                <text x={x} y={height - 4} textAnchor="middle" className="fill-slate text-[10px]">
                  {point.year}
                </text>
              </g>
            );
          })}
          <path d={balancePath} fill="none" stroke="#16181d" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
