'use client';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ArrowLeft, Calendar, Send, MoreHorizontal, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TaskData {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  assignee?: { id: string; name: string; avatar?: string | null };
  creator?: { id: string; name: string; avatar?: string | null };
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`, { credentials: 'include' });
        if (res.status === 404) {
          setError('Task not found');
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch task');
        }
        const data = await res.json();
        setTask(data.data?.task ?? data);
      } catch (err) {
        console.error('Failed to fetch task:', err);
        setError('Failed to load task');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-7 w-64 bg-slate-200 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Link>
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">{error || 'Task not found'}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      task.priority === 'HIGH'
                        ? 'danger'
                        : task.priority === 'MEDIUM'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {task.priority.toLowerCase()}
                  </Badge>
                  <Badge
                    variant={
                      task.status === 'IN_PROGRESS'
                        ? 'info'
                        : task.status === 'DONE'
                          ? 'success'
                          : 'default'
                    }
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h1 className="text-xl font-bold text-slate-900">{task.title}</h1>
              </div>
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            {task.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Comment</h2>
            <div className="flex gap-3">
              <Avatar src={null} alt={user?.name || 'User'} size="sm" />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <Button size="sm">
                    <Send className="h-3 w-3" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Assignee</span>
                <div className="flex items-center gap-2">
                  {task.assignee ? (
                    <>
                      <Avatar src={task.assignee.avatar} alt={task.assignee.name} size="sm" />
                      <span className="text-sm font-medium text-slate-900">
                        {task.assignee.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">Unassigned</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Reporter</span>
                <div className="flex items-center gap-2">
                  {task.creator ? (
                    <>
                      <Avatar src={task.creator.avatar} alt={task.creator.name} size="sm" />
                      <span className="text-sm font-medium text-slate-900">
                        {task.creator.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">Unknown</span>
                  )}
                </div>
              </div>
              {task.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Due Date</span>
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Created</span>
                <span className="text-sm text-slate-600">{formatDate(task.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
