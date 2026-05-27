interface NumberInputProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  placeholder?: string;
  helper?: string;
  disabled?: boolean;
}

export function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  placeholder,
  helper,
  disabled = false,
}: NumberInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-ember focus-within:ring-2 focus-within:ring-ember/20">
        {prefix ? <span className="text-sm font-medium text-slate">{prefix}</span> : null}
        <input
          className="w-full bg-transparent text-base text-ink outline-none placeholder:text-slate/60"
          type="number"
          min={min}
          step={step}
          disabled={disabled}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix ? <span className="text-sm font-medium text-slate">{suffix}</span> : null}
      </div>
      {helper ? <span className="mt-2 block text-xs text-slate">{helper}</span> : null}
    </label>
  );
}
