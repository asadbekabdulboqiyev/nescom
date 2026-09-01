'use client';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name?: string;
    color?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
  formatter?: (value: number, name?: string) => [string, string];
  labelFormatter?: (label: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 rounded-xl px-4 py-3 shadow-xl border bg-white/95 backdrop-blur-sm border-slate-200/80">
      {label && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, i) => {
          const [displayValue, displayName] = formatter
            ? formatter(entry.value, entry.name)
            : [`${entry.value.toLocaleString()}`, entry.name || ''];
          return (
            <div key={i} className="flex items-center gap-2.5">
              {entry.color && (
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="text-xs text-slate-500 flex-1">{displayName}</span>
              <span className="text-xs font-bold text-slate-900 tabular-nums">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
