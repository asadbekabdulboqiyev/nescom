import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
 title: string;
 value: string | number;
 change?: string;
 changeType?:'positive'|'negative'|'neutral';
 icon: LucideIcon;
 className?: string;
}

export function StatsCard({
 title,
 value,
 change,
 changeType ='neutral',
 icon: Icon,
 className,
}: StatsCardProps) {
 const changeColors = {
 positive:'text-emerald-600',
 negative:'text-red-600',
 neutral:'text-slate-500',
 };

 return (
 <div
 className={cn(
'rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md',
 className
 )}
 role="region"
 aria-label={`${title}: ${value}`}
 >
 <div className="flex items-start justify-between">
 <div>
 <p className="text-sm font-medium text-slate-500">{title}</p>
 <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
 </div>
 <div className="rounded-lg bg-blue-50 p-3" aria-hidden="true">
 <Icon className="h-5 w-5 text-blue-600"/>
 </div>
 </div>
 {change && (
 <p className={cn('mt-3 text-xs font-medium', changeColors[changeType])}>{change}</p>
 )}
 </div>
 );
}
