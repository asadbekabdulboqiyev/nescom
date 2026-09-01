'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';

interface SalaryData {
  name: string;
  paid: number;
  pending: number;
}

const PAID_GRADIENT_ID = 'paidGradient';
const PENDING_GRADIENT_ID = 'pendingGradient';

export function SalaryOverview({ data }: { data: SalaryData[] }) {
  const totalPaid = data.reduce((sum, d) => sum + d.paid, 0);
  const totalPending = data.reduce((sum, d) => sum + d.pending, 0);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Salary Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Paid vs pending across team members</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Paid</p>
            <p className="text-sm font-bold text-emerald-600">${(totalPaid / 1000).toFixed(1)}k</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Pending
            </p>
            <p className="text-sm font-bold text-amber-600">${(totalPending / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barGap={6} barCategoryGap="25%">
          <defs>
            <linearGradient id={PAID_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id={PENDING_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={
              <ChartTooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
            }
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>}
          />
          <Bar
            dataKey="paid"
            fill={`url(#${PAID_GRADIENT_ID})`}
            radius={[6, 6, 0, 0]}
            name="Paid"
            animationDuration={1200}
          />
          <Bar
            dataKey="pending"
            fill={`url(#${PENDING_GRADIENT_ID})`}
            radius={[6, 6, 0, 0]}
            name="Pending"
            animationDuration={1200}
            animationBegin={200}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Footer summary */}
      {data.length > 0 && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
          {data.length} team member{data.length !== 1 ? 's' : ''} in overview
        </div>
      )}
    </div>
  );
}
