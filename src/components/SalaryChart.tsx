'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartTooltip } from './charts/ChartTooltip';

interface SalaryData {
 name: string;
 amount: number;
}

const COLORS = [
'#3b82f6',
'#10b981',
'#f59e0b',
'#ef4444',
'#8b5cf6',
'#ec4899',
'#06b6d4',
'#84cc16',
];

export function SalaryChart({ data }: { data: SalaryData[] }) {
 const total = data.reduce((sum, d) => sum + d.amount, 0);

 return (
 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
 <h3 className="mb-4 text-lg font-semibold text-slate-900">
 Salary Distribution
 </h3>
 <ResponsiveContainer width="100%" height={280}>
 <PieChart>
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 outerRadius={90}
 innerRadius={55}
 paddingAngle={3}
 dataKey="amount"
 nameKey="name"
 >
 {data.map((_, i) => (
 <Cell key={i} fill={COLORS[i % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip
 content={
 <ChartTooltip
 formatter={(value, name) => [
 `$${Number(value).toLocaleString()} (${Math.round((Number(value) / total) * 100)}%)`,
 String(name),
 ]}
 />
 }
 />
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
