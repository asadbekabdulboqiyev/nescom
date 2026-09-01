'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TaskData {
  status: string;
  count: number;
}

const GRADIENTS: Record<string, [string, string]> = {
  TODO: ['#60a5fa', '#3b82f6'],
  IN_PROGRESS: ['#fbbf24', '#f59e0b'],
  DONE: ['#34d399', '#10b981'],
  BLOCKED: ['#f87171', '#ef4444'],
  REVIEW: ['#a78bfa', '#8b5cf6'],
};

const LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  BLOCKED: 'Blocked',
  REVIEW: 'Review',
};

const STATUS_ICONS: Record<string, string> = {
  TODO: '📋',
  IN_PROGRESS: '⚡',
  DONE: '✅',
  BLOCKED: '🚫',
  REVIEW: '👀',
};

export function TasksByStatus({ data }: { data: TaskData[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const chartData = data.map((d) => ({
    name: LABELS[d.status] || d.status,
    value: d.count,
    status: d.status,
  }));

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Tasks by Status</h3>
          <p className="text-xs text-slate-500 mt-0.5">{total} total tasks across all statuses</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-1.5">
          <span className="text-sm font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500 ml-1">total</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <defs>
            {Object.entries(GRADIENTS).map(([status, [start, end]]) => (
              <linearGradient key={status} id={`gradient-${status}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={start} />
                <stop offset="100%" stopColor={end} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.status}
                fill={`url(#gradient-${entry.status})`}
                stroke="white"
                strokeWidth={2}
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
              />
            ))}
          </Pie>

          {/* Center label */}
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-900"
          >
            <tspan className="text-2xl font-bold">{total}</tspan>
          </text>
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-400"
          >
            <tspan className="text-xs">tasks</tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((entry) => {
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0';
          return (
            <div
              key={entry.status}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-slate-50"
            >
              <span className="text-sm">{STATUS_ICONS[entry.status] || '📌'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{entry.name}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900">{entry.value}</span>
                <span className="text-[10px] text-slate-400 ml-1">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
