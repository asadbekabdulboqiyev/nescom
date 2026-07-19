'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckSquare, Clock, TrendingUp } from 'lucide-react';

interface EmployeeStatsProps {
 tasksCompleted: number;
 tasksInProgress: number;
 tasksTotal: number;
 avgCompletionDays: number;
 monthlyActivity: { month: string; tasks: number }[];
}

export function EmployeeStats({
 tasksCompleted,
 tasksInProgress,
 tasksTotal,
 avgCompletionDays,
 monthlyActivity,
}: EmployeeStatsProps) {
 const completionRate = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

 return (
 <div className="space-y-4">
 <div className="grid gap-4 sm:grid-cols-3">
 <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
 <div className="flex items-center gap-3">
 <div className="rounded-lg bg-emerald-50 p-2">
 <CheckSquare className="h-4 w-4 text-emerald-600"/>
 </div>
 <div>
 <p className="text-xs text-slate-500">Completed</p>
 <p className="text-lg font-bold text-slate-900">{tasksCompleted}</p>
 </div>
 </div>
 <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
 <div
 className="h-full rounded-full bg-emerald-500 transition-all"
 style={{ width: `${completionRate}%` }}
 />
 </div>
 </div>

 <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
 <div className="flex items-center gap-3">
 <div className="rounded-lg bg-blue-50 p-2">
 <Clock className="h-4 w-4 text-blue-600"/>
 </div>
 <div>
 <p className="text-xs text-slate-500">In Progress</p>
 <p className="text-lg font-bold text-slate-900">{tasksInProgress}</p>
 </div>
 </div>
 </div>

 <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
 <div className="flex items-center gap-3">
 <div className="rounded-lg bg-amber-50 p-2">
 <TrendingUp className="h-4 w-4 text-amber-600"/>
 </div>
 <div>
 <p className="text-xs text-slate-500">Avg. Days</p>
 <p className="text-lg font-bold text-slate-900">
 {avgCompletionDays}
 </p>
 </div>
 </div>
 </div>
 </div>

 {monthlyActivity.length > 0 && (
 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
 <h3 className="mb-4 text-sm font-semibold text-slate-900">
 Monthly Activity
 </h3>
 <ResponsiveContainer width="100%" height={150}>
 <BarChart data={monthlyActivity}>
 <XAxis
 dataKey="month"
 tick={{ fontSize: 11, fill:'#94a3b8'}}
 axisLine={false}
 tickLine={false}
 />
 <YAxis tick={{ fontSize: 11, fill:'#94a3b8'}} axisLine={false} tickLine={false} />
 <Tooltip
 contentStyle={{
 backgroundColor:'white',
 border:'1px solid #e2e8f0',
 borderRadius:'8px',
 fontSize:'12px',
 }}
 />
 <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>
 );
}
