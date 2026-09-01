'use client';

import { TaskCard } from '@/components/TaskCard';
import dynamic from 'next/dynamic';
import { Button } from '@/components/Button';
import { Plus, Loader2, CheckSquare, ListTodo } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const CreateTaskModal = dynamic(
  () => import('@/components/CreateTaskModal').then((mod) => mod.CreateTaskModal),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white p-6 shadow-xl">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: { id: string; name: string; avatar?: string | null };
  dueDate?: string | null;
}

const columns = ['TODO', 'ACCEPTED', 'IN_PROGRESS', 'READY', 'DONE'] as const;

const columnLabels: Record<string, string> = {
  TODO: 'To Do',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  READY: 'Ready',
  DONE: 'Done',
};

const columnColors: Record<string, string> = {
  TODO: 'bg-blue-500',
  ACCEPTED: 'bg-purple-500',
  IN_PROGRESS: 'bg-amber-500',
  READY: 'bg-cyan-500',
  DONE: 'bg-green-500',
};

export default function TasksPage() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeColumn, setActiveColumn] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/tasks', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const allTasks = Array.isArray(data) ? data : data.tasks || [];
        setTasks(allTasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: updated.status } : t))
        );
      } else {
        const err = await res.json();
        console.error('Status change failed:', err.error);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskCreated = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        role="status"
        aria-label="Loading tasks"
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
          aria-hidden="true"
        />
        <span className="sr-only">Loading tasks...</span>
      </div>
    );
  }

  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500">Manage your team&apos;s tasks</p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="task-column-filter" className="sr-only">
            Filter by column
          </label>
          <select
            id="task-column-filter"
            value={activeColumn}
            onChange={(e) => setActiveColumn(e.target.value)}
            aria-label="Filter tasks by column"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Columns</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {columnLabels[col]}
              </option>
            ))}
          </select>
          <Button onClick={() => setShowCreateModal(true)} aria-label="Create new task">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Task
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center animate-fade-in">
          <ListTodo className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No tasks yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first task to start tracking work. Click the &quot;New Task&quot; button
            above to get started.
          </p>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="h-5 w-5" />
            Create First Task
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            {columns.map((column) => {
              const columnTasks = tasks.filter(
                (t) => t.status === column && (activeColumn === 'all' || activeColumn === column)
              );
              return (
                <div key={column}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`h-2.5 w-2.5 rounded-full ${columnColors[column]}`} />
                    <h2 className="font-semibold text-slate-900">{columnLabels[column]}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        title={task.title}
                        status={task.status}
                        priority={
                          task.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'urgent'
                        }
                        assignee={
                          task.assignee
                            ? { name: task.assignee.name, avatar: task.assignee.avatar }
                            : { name: 'Unassigned', avatar: null }
                        }
                        assigneeId={task.assignee?.id}
                        dueDate={
                          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined
                        }
                        userRole={user?.role}
                        currentUserId={user?.id}
                        onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                      />
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                        <CheckSquare className="h-6 w-6 mx-auto mb-2 text-slate-300" />
                        <p>No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {blockedTasks.length > 0 && (activeColumn === 'all' || activeColumn === 'BLOCKED') && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <h2 className="font-semibold text-red-700">Blocked</h2>
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
                    priority={task.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'urgent'}
                    assignee={
                      task.assignee
                        ? { name: task.assignee.name, avatar: task.assignee.avatar }
                        : { name: 'Unassigned', avatar: null }
                    }
                    assigneeId={task.assignee?.id}
                    dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined}
                    userRole={user?.role}
                    currentUserId={user?.id}
                    onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
