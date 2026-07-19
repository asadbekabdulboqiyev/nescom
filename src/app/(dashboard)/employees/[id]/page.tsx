'use client';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserData {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
  salary?: number;
  salaryDueDate?: string;
  startDate?: string;
  createdAt?: string;
}

interface TaskData {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
}

interface SalaryData {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string;
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user: currentUser, token } = useAuth();
  const [employee, setEmployee] = useState<UserData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [salaries, setSalaries] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  const fetchData = useCallback(
    async (id: string) => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [userRes, tasksRes, salaryRes] = await Promise.all([
          fetch(`/api/users/${id}`, { headers, credentials: 'include' }),
          fetch(`/api/tasks?assigneeId=${id}`, { headers, credentials: 'include' }),
          fetch(`/api/salary?userId=${id}`, { headers, credentials: 'include' }),
        ]);

        if (userRes.status === 404) {
          setError('Employee not found');
          return;
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setEmployee(userData.user || userData);
        }

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(Array.isArray(tasksData) ? tasksData : tasksData.tasks || []);
        }

        if (salaryRes.ok) {
          const salaryData = await salaryRes.json();
          setSalaries(Array.isArray(salaryData) ? salaryData : salaryData.salaries || []);
        }
      } catch (err) {
        console.error('Failed to fetch employee data:', err);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    params.then((p) => fetchData(p.id));
  }, [params, fetchData]);

  const openEdit = () => {
    if (!employee) return;
    setEditName(employee.name);
    setEditEmail(employee.email);
    setEditPhone(employee.phone || '');
    setEditRole(employee.role);
    setEditError(null);
    setEditSuccess(false);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!employee) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/users/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone || undefined,
          role: editRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }
      const updated = await res.json();
      setEmployee(updated);
      setEditSuccess(true);
      setTimeout(() => setEditOpen(false), 1000);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">
            {error || 'Employee not found'}
          </p>
        </div>
      </div>
    );
  }

  const canEdit = currentUser?.role === 'CEO' || currentUser?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar src={employee.avatar} alt={employee.name} size="lg" role={employee.role} />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
            </div>
            <p className="text-slate-500">{employee.role}</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {employee.email}
              </span>
              {employee.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {employee.phone}
                </span>
              )}
              {employee.startDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Joined{' '}
                  {new Date(employee.startDate).toLocaleDateString()}
                </span>
              )}
              {employee.salary != null && (
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> ${employee.salary.toLocaleString()}/year
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={openEdit}>
                Edit
              </Button>
            )}
            <Link href="/messages">
              <Button size="sm">Send Message</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No tasks assigned
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500">{task.priority}</p>
                  </div>
                  <Badge
                    variant={
                      task.status === 'DONE'
                        ? 'success'
                        : task.status === 'BLOCKED'
                          ? 'danger'
                          : 'info'
                    }
                  >
                    {task.status.replace('_', ' ').toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Salary History
          </h2>
          {salaries.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No salary records
            </p>
          ) : (
            <div className="space-y-2">
              {salaries.map((sal) => (
                <div
                  key={sal.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      ${sal.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      Due: {new Date(sal.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      sal.status === 'PAID'
                        ? 'success'
                        : sal.status === 'OVERDUE'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {sal.status.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Edit Employee
              </h2>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Employee updated successfully!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="CEO">CEO</option>
                  <option value="MANAGER">Manager</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="DESIGNER">Designer</option>
                  <option value="MARKETER">Marketer</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
