'use client';

import { useState, useCallback } from 'react';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface Task {
 id: string;
 title: string;
 description?: string | null;
 status: string;
 priority: string;
 dueDate?: string | null;
 assignee?: { id: string; name: string; avatar?: string | null } | null;
 creator: { id: string; name: string; avatar?: string | null };
 createdAt: string;
}

interface TaskBoardProps {
 tasks: Task[];
 onStatusChange?: (taskId: string, newStatus: string) => void;
 onTaskClick?: (task: Task) => void;
 userRole?: string;
 currentUserId?: string;
}

const COLUMNS = ['TODO','ACCEPTED','IN_PROGRESS','READY','DONE'] as const;

const COLUMN_LABELS: Record<string, string> = {
 TODO:'To Do',
 ACCEPTED:'Accepted',
 IN_PROGRESS:'In Progress',
 READY:'Ready',
 DONE:'Done',
};

const COLUMN_COLORS: Record<string, string> = {
 TODO:'bg-blue-500',
 ACCEPTED:'bg-purple-500',
 IN_PROGRESS:'bg-amber-500',
 READY:'bg-cyan-500',
 DONE:'bg-green-500',
};

export function TaskBoard({ tasks, onStatusChange, onTaskClick, userRole, currentUserId }: TaskBoardProps) {
 const [draggedId, setDraggedId] = useState<string | null>(null);
 const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

 const blockedTasks = tasks.filter((t) => t.status ==='BLOCKED');

 const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
 setDraggedId(taskId);
 e.dataTransfer.effectAllowed ='move';
 }, []);

 const handleDragOver = useCallback((e: React.DragEvent, column: string) => {
 e.preventDefault();
 e.dataTransfer.dropEffect ='move';
 setDragOverColumn(column);
 }, []);

 const handleDragLeave = useCallback(() => {
 setDragOverColumn(null);
 }, []);

 const handleDrop = useCallback(
 (e: React.DragEvent, column: string) => {
 e.preventDefault();
 setDragOverColumn(null);
 if (draggedId) {
 onStatusChange?.(draggedId, column);
 setDraggedId(null);
 }
 },
 [draggedId, onStatusChange]
 );

 return (
 <div className="space-y-6">
 <div
 className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
 role="region"
 aria-label="Task board"
 >
 {COLUMNS.map((column) => {
 const columnTasks = tasks.filter((t) => t.status === column);
 return (
 <div
 key={column}
 onDragOver={(e) => handleDragOver(e, column)}
 onDragLeave={handleDragLeave}
 onDrop={(e) => handleDrop(e, column)}
 role="region"
 aria-label={`${COLUMN_LABELS[column]} column, ${columnTasks.length} tasks`}
 className={cn(
'rounded-xl transition-colors min-h-[200px]',
 dragOverColumn === column &&'bg-blue-50/50'
 )}
 >
 <div className="flex items-center gap-2 mb-4 px-1">
 <div
 className={cn('h-2.5 w-2.5 rounded-full', COLUMN_COLORS[column])}
 aria-hidden="true"
 />
 <h2 className="font-semibold text-slate-900">
 {COLUMN_LABELS[column]}
 </h2>
 <span
 className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
 aria-label={`${columnTasks.length} tasks`}
 >
 {columnTasks.length}
 </span>
 </div>
 <div className="space-y-3">
 {columnTasks.map((task) => (
 <div
 key={task.id}
 draggable
 onDragStart={(e) => handleDragStart(e, task.id)}
 className={cn(
'cursor-grab active:cursor-grabbing',
 draggedId === task.id &&'opacity-50'
 )}
 >
 <TaskCard
 title={task.title}
 status={task.status}
 priority={task.priority.toLowerCase() as'low'|'medium'|'high'|'urgent'}
 assignee={task.assignee || { name:'Unassigned', avatar: null }}
 assigneeId={task.assignee?.id}
 dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() :'No date'}
 userRole={userRole}
 currentUserId={currentUserId}
 onStatusChange={(newStatus) => onStatusChange?.(task.id, newStatus)}
 onClick={() => onTaskClick?.(task)}
 />
 </div>
 ))}
 {columnTasks.length === 0 && (
 <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
 No tasks
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>

 {blockedTasks.length > 0 && (
 <div className="rounded-xl border-2 border-red-300 bg-red-50/50 p-4">
 <div className="flex items-center gap-2 mb-4">
 <div className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true"/>
 <h2 className="font-semibold text-red-700">
 Blocked
 </h2>
 <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
 {blockedTasks.length}
 </span>
 </div>
 <div className="space-y-3">
 {blockedTasks.map((task) => (
 <TaskCard
 key={task.id}
 title={task.title}
 status={task.status}
 priority={task.priority.toLowerCase() as'low'|'medium'|'high'|'urgent'}
 assignee={task.assignee || { name:'Unassigned', avatar: null }}
 assigneeId={task.assignee?.id}
 dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() :'No date'}
 userRole={userRole}
 currentUserId={currentUserId}
 onStatusChange={(newStatus) => onStatusChange?.(task.id, newStatus)}
 onClick={() => onTaskClick?.(task)}
 />
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
