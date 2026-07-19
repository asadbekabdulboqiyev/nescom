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

export function SalaryOverview({ data }: { data: SalaryData[] }) {
 return (
 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
 <h3 className="mb-4 text-lg font-semibold text-slate-900">Salary Overview</h3>
 <ResponsiveContainer width="100%" height={250}>
 <BarChart data={data} barGap={4}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
 <XAxis
 dataKey="name"
 tick={{ fontSize: 11, fill:'#94a3b8'}}
 axisLine={{ stroke:'#e2e8f0'}}
 />
 <YAxis
 tick={{ fontSize: 11, fill:'#94a3b8'}}
 axisLine={{ stroke:'#e2e8f0'}}
 tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
 />
 <Tooltip
 content={
 <ChartTooltip formatter={(value) => [`$${Number(value).toLocaleString()}`,'']} />
 }
 />
 <Legend
 iconType="circle"
 iconSize={8}
 formatter={(value: string) => (
 <span className="text-xs text-slate-600">{value}</span>
 )}
 />
 <Bar dataKey="paid" fill="#10b981" radius={[4, 4, 0, 0]} name="Paid"/>
 <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending"/>
 </BarChart>
 </ResponsiveContainer>
 </div>
 );
}
