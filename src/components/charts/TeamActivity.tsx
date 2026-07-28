'use client';

import {
  AreaChart,
  Area,
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
  const totalTasks = data.reduce((sum, d) => sum + d.tasks, 0);
  const totalMessages = data.reduce((sum, d) => sum + d.messages, 0);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Team Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tasks and messages over time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Tasks</p>
            <p className="text-sm font-bold text-blue-600">{totalTasks}</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Messages</p>
            <p className="text-sm font-bold text-emerald-600">{totalMessages}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="tasks"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#tasksGradient)"
            dot={{ r: 4, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 3 }}
            name="Tasks"
            animationDuration={1200}
          />
          <Area
            type="monotone"
            dataKey="messages"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#messagesGradient)"
            dot={{ r: 4, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 3 }}
            name="Messages"
            animationDuration={1200}
            animationBegin={200}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Footer */}
      {data.length > 0 && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
          Last {data.length} data point{data.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
