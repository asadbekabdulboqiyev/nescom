import { cn } from '@/lib/utils';
import { Avatar } from './Avatar';
import { Calendar, Check, Loader2, Play, Send, Unlock } from 'lucide-react';

interface TaskCardProps {
  title: string;
  status?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: { name: string; avatar?: string | null };
  dueDate?: string;
  userRole?: string;
  currentUserId?: string;
  assigneeId?: string | null;
  onClick?: () => void;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

const priorityVariant = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string; icon: React.ReactNode | null }
> = {
  TODO: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    label: 'To Do',
    icon: null,
  },
  ACCEPTED: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    label: 'Accepted',
    icon: null,
  },
  IN_PROGRESS: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'In Progress',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  READY: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    label: 'Ready',
    icon: null,
  },
  DONE: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'Done',
    icon: <Check className="h-3 w-3" />,
  },
  BLOCKED: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: 'Blocked',
    icon: null,
  },
};

export function TaskCard({
  title,
  status,
  priority,
  assignee,
  dueDate,
  userRole,
  currentUserId,
  assigneeId,
  onClick,
  onStatusChange,
  className,
}: TaskCardProps) {
  const cfg = statusConfig[status || 'TODO'] || statusConfig.TODO;
  const isCEO = userRole === 'CEO';
  const isManager = userRole === 'MANAGER';
  const isManagerOrCEO = isCEO || isManager;
  const isAssignee = currentUserId != null && assigneeId != null && currentUserId === assigneeId;
  const canAct = isAssignee || isManagerOrCEO;

  const renderActionButton = () => {
    switch (status) {
      case 'TODO':
        if (!canAct) return null;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange?.('ACCEPTED');
            }}
            className="flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <Play className="h-3 w-3" />
            Accept
          </button>
        );
      case 'ACCEPTED':
        if (!canAct) return null;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange?.('IN_PROGRESS');
            }}
            className="flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
          >
            <Play className="h-3 w-3" />
            Start
          </button>
        );
      case 'IN_PROGRESS':
        if (!canAct) return null;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange?.('READY');
            }}
            className="flex items-center gap-1 rounded-lg bg-cyan-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-cyan-700 transition-colors"
          >
            <Send className="h-3 w-3" />
            Ready
          </button>
        );
      case 'READY':
        if (isManagerOrCEO) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange?.('DONE');
              }}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors"
            >
              <Check className="h-3 w-3" />
              Approve
            </button>
          );
        }
        return (
          <span className="flex items-center gap-1 rounded-lg bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-700">
            Pending review
          </span>
        );
      case 'DONE':
        return (
          <span className="flex items-center gap-1 rounded-lg bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            <Check className="h-3 w-3" />
            Done
          </span>
        );
      case 'BLOCKED':
        if (isManagerOrCEO) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange?.('TODO');
              }}
              className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              <Unlock className="h-3 w-3" />
              Unblock
            </button>
          );
        }
        return (
          <span className="flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
            Blocked
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === '') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${title}. Priority: ${priority}.${status ? ` Status: ${cfg.label}.` : ''} Assigned to: ${assignee.name}.${dueDate ? ` Due: ${dueDate}.` : ''}`}
      className={cn(
        'cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        status === 'BLOCKED' && 'border-red-300',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            priorityVariant[priority]
          )}
        >
          {priority === 'urgent' ? '!!' : ''}
          {priority}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            cfg.bg,
            cfg.text
          )}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>
      <h3 className="font-medium text-slate-900 mb-3">{title}</h3>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Avatar src={assignee.avatar} alt={assignee.name} size="sm" />
          <span className="text-xs text-slate-500">{assignee.name}</span>
        </div>
        {dueDate && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {dueDate}
          </span>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-slate-100">{renderActionButton()}</div>
    </div>
  );
}
