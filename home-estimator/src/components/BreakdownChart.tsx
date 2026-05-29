// SVG donut and bar chart for the monthly ownership cost breakdown.
import { formatCurrency } from "../lib/format";
import type { MonthlyBreakdownItem } from "../types";

interface BreakdownChartProps {
  items: MonthlyBreakdownItem[];
}

export function BreakdownChart({ items }: BreakdownChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px,1fr] lg:items-center">
      <div className="mx-auto">
        <svg viewBox="0 0 180 180" className="h-48 w-48">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="#e7edf4" strokeWidth="20" />
          {items.map((item) => {
            const length = total > 0 ? (item.value / total) * circumference : 0;
            const element = (
              <circle
                key={item.label}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 90 90)"
                strokeLinecap="round"
              />
            );
            offset += length;
            return element;
          })}
          <text x="90" y="84" textAnchor="middle" className="fill-slate text-[10px] font-semibold uppercase tracking-[0.18em]">
            Monthly Total
          </text>
          <text x="90" y="104" textAnchor="middle" className="fill-ink text-[18px] font-semibold">
            {formatCurrency(total)}
          </text>
        </svg>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={item.label} className="rounded-2xl bg-fog px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-ink">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-ink">{formatCurrency(item.value)}</span>
              </div>
              <div className="h-2 rounded-full bg-white">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
