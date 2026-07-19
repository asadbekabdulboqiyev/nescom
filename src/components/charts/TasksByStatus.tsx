'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

interface TaskData {
 status: string;
 count: number;
}

const COLORS = {
 TODO:'#3b82f6',
 IN_PROGRESS:'#f59e0b',
 DONE:'#10b981',
 BLOCKED:'#ef4444',
};

const LABELS: Record<string, string> = {
 TODO:'To Do',
 IN_PROGRESS:'In Progress',
 DONE:'Done',
 BLOCKED:'Blocked',
};

export function TasksByStatus({ data }: { data: TaskData[] }) {
 const chartData = data.map((d) => ({
 name: LABELS[d.status] || d.status,
 value: d.count,
 status: d.status,
 }));

 return (
 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
 <h3 className="mb-4 text-lg font-semibold text-slate-900">Tasks by Status</h3>
 <ResponsiveContainer width="100%" height={250}>
 <PieChart>
 <Pie
 data={chartData}
 cx="50%"
 cy="50%"
 innerRadius={50}
 outerRadius={80}
 paddingAngle={4}
 dataKey="value"
 >
 {chartData.map((entry) => (
 <Cell
 key={entry.status}
 fill={COLORS[entry.status as keyof typeof COLORS] ||'#94a3b8'}
 />
 ))}
 </Pie>
 <Tooltip content={<ChartTooltip />} />
 <Legend
 iconType="circle"
 iconSize={8}
 formatter={(value: string) => (
 <span className="text-xs text-slate-600">{value}</span>
 )}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 );
}
