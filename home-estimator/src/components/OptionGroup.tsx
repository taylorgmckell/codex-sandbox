// Reusable segmented option selector for small sets of mutually exclusive choices.
interface Option<T extends string> {
  value: T;
  label: string;
}

interface OptionGroupProps<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

export function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: OptionGroupProps<T>) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                isSelected
                  ? "border-ink bg-ink text-white shadow-lg shadow-ink/10"
                  : "border-slate-200 bg-white text-slate hover:border-slate-300 hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
