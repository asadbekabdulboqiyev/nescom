'use client';

import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Legend,
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';

interface ActivityData {
 date: string;
 tasks: number;
 messages: number;
}

export function TeamActivity({ data }: { data: ActivityData[] }) {
 return (
 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
 <h3 className="mb-4 text-lg font-semibold text-slate-900">Team Activity</h3>
 <ResponsiveContainer width="100%" height={250}>
 <LineChart data={data}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
 <XAxis
 dataKey="date"
 tick={{ fontSize: 11, fill:'#94a3b8'}}
 axisLine={{ stroke:'#e2e8f0'}}
 />
 <YAxis tick={{ fontSize: 11, fill:'#94a3b8'}} axisLine={{ stroke:'#e2e8f0'}} />
 <Tooltip content={<ChartTooltip />} />
 <Legend
 iconType="circle"
 iconSize={8}
 formatter={(value: string) => (
 <span className="text-xs text-slate-600">{value}</span>
 )}
 />
 <Line
 type="monotone"
 dataKey="tasks"
 stroke="#3b82f6"
 strokeWidth={2}
 dot={{ r: 3 }}
 name="Tasks"
 />
 <Line
 type="monotone"
 dataKey="messages"
 stroke="#10b981"
 strokeWidth={2}
 dot={{ r: 3 }}
 name="Messages"
 />
 </LineChart>
 </ResponsiveContainer>
 </div>
 );
}
