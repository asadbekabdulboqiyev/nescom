'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
}

interface CreatedTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: { id: string; name: string; avatar?: string | null };
  dueDate?: string | null;
}

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: (task: CreatedTask) => void;
}

export function CreateTaskModal({ open, onClose, onTaskCreated }: CreateTaskModalProps) {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canAssignOthers = user?.role === 'CEO' || user?.role === 'MANAGER';

  useEffect(() => {
    if (!open) return;
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/users', { headers });
        if (res.ok) {
          const json = await res.json();
          const payload = json.data ?? json;
          setEmployees(Array.isArray(payload) ? payload : payload.users || []);
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [open, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setCreating(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const assigneeId = canAssignOthers ? form.assigneeId || undefined : user?.id;

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          priority: form.priority,
          assigneeId,
          dueDate: form.dueDate || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const payload = json.data ?? json;
        onTaskCreated(payload.task);
        setForm({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' });
        onClose();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 mb-1">
            Title *
          </label>
          <input
            id="task-title"
            type="text"
            required
            aria-required="true"
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            aria-invalid={!!errors.title}
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              setErrors((prev) => ({ ...prev, title: '' }));
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter task title"
          />
          {errors.title && (
            <p id="task-title-error" role="alert" className="mt-1 text-xs text-red-500">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="task-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
            placeholder="Optional description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="task-due-date"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {canAssignOthers ? (
          <div>
            <label
              htmlFor="task-assignee"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Assign To
            </label>
            {loadingEmployees ? (
              <div
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500"
                role="status"
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading employees...
              </div>
            ) : (
              <select
                id="task-assignee"
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.role}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-600">
              Task will be assigned to{' '}
              <span className="font-medium text-slate-900">{user?.name}</span>
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={creating} disabled={!form.title.trim()}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
