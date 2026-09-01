'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
  sparklineData?: number[];
  gradient?: string;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 32;
  const width = 80;
  const padding = 2;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width={width} height={height} className="opacity-60">
      <defs>
        <linearGradient id={`sparkline-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sparkline-${color.replace('#', '')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const gradientMap: Record<string, string> = {
  blue: 'from-blue-500 to-indigo-600',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-600',
  red: 'from-red-500 to-rose-600',
  violet: 'from-violet-500 to-purple-600',
  cyan: 'from-cyan-500 to-sky-600',
};

const iconBgMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  violet: 'bg-violet-50 text-violet-600',
  cyan: 'bg-cyan-50 text-cyan-600',
};

const sparklineColorMap: Record<string, string> = {
  blue: '#3b82f6',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
};

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
  sparklineData,
  gradient = 'blue',
}: StatsCardProps) {
  const [mounted, setMounted] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof value === 'number' && mounted) {
      let start = 0;
      const end = value;
      const duration = 800;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(0);
    }
  }, [value, mounted]);

  const TrendIcon =
    changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : Minus;

  const trendColor =
    changeType === 'positive'
      ? 'text-emerald-500'
      : changeType === 'negative'
        ? 'text-red-500'
        : 'text-slate-400';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm',
        'transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5',
        'cursor-default',
        className
      )}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      {/* Gradient accent bar */}
      <div
        className={cn(
          'absolute top-0 left-0 h-1 w-full bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          gradientMap[gradient]
        )}
      />

      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 opacity-50 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 transition-colors group-hover:text-slate-600">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-slate-950">
            {typeof value === 'number' ? displayValue.toLocaleString() : value}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={cn(
              'rounded-xl p-3 transition-all duration-300 group-hover:scale-110',
              iconBgMap[gradient]
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>

          {sparklineData && (
            <MiniSparkline data={sparklineData} color={sparklineColorMap[gradient]} />
          )}
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-1.5">
          <TrendIcon className={cn('h-3.5 w-3.5', trendColor)} />
          <p className={cn('text-xs font-medium', trendColor)}>{change}</p>
        </div>
      )}

      {/* Hover glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none',
          `bg-gradient-to-br ${gradientMap[gradient]}`
        )}
        style={{
          opacity: 0,
          background: `linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(99,102,241,0.03) 100%)`,
        }}
      />
    </div>
  );
}
