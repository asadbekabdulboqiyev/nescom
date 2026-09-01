'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  priority: string;
  onPriorityChange: (v: string) => void;
  assigneeId: string;
  onAssigneeChange: (v: string) => void;
  assignees?: { id: string; name: string }[];
  className?: string;
}

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'BLOCKED', label: 'Blocked' },
];

const PRIORITIES = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  assigneeId,
  onAssigneeChange,
  assignees = [],
  className,
}: TaskFiltersProps) {
  const hasFilters = status || priority || assigneeId || search;

  function clearAll() {
    onSearchChange('');
    onStatusChange('');
    onPriorityChange('');
    onAssigneeChange('');
  }

  return (
    <div
      className={cn('flex flex-col sm:flex-row gap-3', className)}
      role="search"
      aria-label="Task filters"
    >
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search tasks..."
          aria-label="Search tasks"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm"
        />
      </div>
      <label htmlFor="filter-status" className="sr-only">
        Filter by status
      </label>
      <select
        id="filter-status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by status"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <label htmlFor="filter-priority" className="sr-only">
        Filter by priority
      </label>
      <select
        id="filter-priority"
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        aria-label="Filter by priority"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {assignees.length > 0 && (
        <>
          <label htmlFor="filter-assignee" className="sr-only">
            Filter by assignee
          </label>
          <select
            id="filter-assignee"
            value={assigneeId}
            onChange={(e) => onAssigneeChange(e.target.value)}
            aria-label="Filter by assignee"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All Assignees</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </>
      )}
      {hasFilters && (
        <button
          onClick={clearAll}
          aria-label="Clear all filters"
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  );
}
