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
    <div
      className="rounded-lg px-3 py-2 shadow-lg border text-xs bg-white border-slate-200 text-slate-900"
    >
      {label && (
        <p className="font-medium mb-1 text-slate-500">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      {payload.map((entry, i) => {
        const [displayValue, displayName] = formatter
          ? formatter(entry.value, entry.name)
          : [`$${entry.value.toLocaleString()}`, entry.name || ''];
        return (
          <div key={i} className="flex items-center gap-2 py-0.5">
            {entry.color && (
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
            )}
            <span className="text-slate-500">{displayName}</span>
            <span className="font-medium ml-auto text-slate-900">
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}
