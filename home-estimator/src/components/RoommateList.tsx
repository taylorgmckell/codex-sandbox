import type { Roommate } from "../types";
import { NumberInput } from "./NumberInput";

interface RoommateListProps {
  roommates: Roommate[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Roommate, value: string | number | boolean) => void;
  vacancyRate: number;
  onVacancyRateChange: (value: number) => void;
}

export function RoommateList({
  roommates,
  onAdd,
  onRemove,
  onUpdate,
  vacancyRate,
  onVacancyRateChange,
}: RoommateListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl bg-fog p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Vacancy stress test</p>
          <p className="text-xs text-slate">
            Reduce collected roommate income to test turnover or a temporarily empty room.
          </p>
        </div>
        <div className="min-w-[220px]">
          <div className="mb-2 flex items-center justify-between text-sm text-slate">
            <span>Vacancy rate</span>
            <span className="font-semibold text-ink">{vacancyRate}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={vacancyRate}
            onChange={(event) => onVacancyRateChange(Number(event.target.value))}
            className="w-full accent-ember"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {roommates.map((roommate, index) => (
          <div
            key={roommate.id}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Roommate {index + 1}</p>
                <p className="text-xs text-slate">Turn off a roommate to simulate an empty room.</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(roommate.id)}
                className="rounded-full border border-rose-200 px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Name or label</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                  value={roommate.name}
                  placeholder="Basement room"
                  onChange={(event) => onUpdate(roommate.id, "name", event.target.value)}
                />
              </label>
              <NumberInput
                label="Monthly contribution"
                prefix="$"
                value={roommate.rent}
                onChange={(value) => onUpdate(roommate.id, "rent", value)}
              />
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-ink">Notes</span>
                <textarea
                  className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                  value={roommate.notes}
                  placeholder="Private bath, month-to-month, parking included..."
                  onChange={(event) => onUpdate(roommate.id, "notes", event.target.value)}
                />
              </label>
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={roommate.isActive}
                onChange={(event) => onUpdate(roommate.id, "isActive", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-ember focus:ring-ember"
              />
              Count this roommate as currently occupied
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-ember hover:text-ember"
      >
        + Add roommate
      </button>
    </div>
  );
}
