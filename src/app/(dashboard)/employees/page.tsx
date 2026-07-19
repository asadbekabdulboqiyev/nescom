'use client';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Loader2,
  UserPlus,
  Users,
  Calendar,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
  salary?: number;
  startDate?: string;
}

const roleColors: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  CEO: 'danger',
  MANAGER: 'info',
  DEVELOPER: 'success',
  DESIGNER: 'warning',
  MARKETER: 'default',
};

export default function EmployeesPage() {
  const { user: currentUser, token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/users', { headers, credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const users = Array.isArray(data) ? data : data.users || [];
          setEmployees(users);
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [token]);

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || emp.role === filter;
    return matchSearch && matchFilter;
  });

  const roles = [...new Set(employees.map((e) => e.role))];

  const canDelete = currentUser?.role === 'CEO' || currentUser?.role === 'MANAGER';

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500">
            {employees.length} team member{employees.length !== 1 ? 's' : ''} in your organization
          </p>
        </div>
        <Link href="/employees/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center animate-fade-in">
          <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            No team members yet
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Start building your team by adding your first employee. You&apos;ll be able to create
            tasks, send messages, and manage salaries once you have team members.
          </p>
          <Link href="/employees/new">
            <Button size="lg">
              <UserPlus className="h-5 w-5" />
              Add First Employee
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search by name, role, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>
              Showing {filtered.length} of {employees.length} employees
            </span>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">No employees found</p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((emp) => (
                <div
                  key={emp.id}
                  className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 animate-fade-in"
                >
                  <Link href={`/employees/${emp.id}`} className="block">
                    <div className="flex items-start gap-4">
                      <Avatar src={emp.avatar} alt={emp.name} size="lg" role={emp.role} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {emp.name}
                        </h3>
                        <Badge variant={roleColors[emp.role] || 'default'} className="mt-1">
                          {emp.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {emp.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{emp.email}</span>
                        </div>
                      )}
                      {emp.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                      {emp.startDate && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>Joined {new Date(emp.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {emp.salary != null && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900">
                            ${emp.salary.toLocaleString()}/yr
                          </span>
                          <span className="text-xs text-slate-400">
                            $
                            {(emp.salary / 12).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                            /mo
                          </span>
                        </div>
                      </div>
                    )}
                  </Link>
                  {canDelete && currentUser?.id !== emp.id && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteTarget(emp);
                        setDeleteError(null);
                      }}
                      className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Remove Employee</h3>
                <p className="text-sm text-slate-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {deleteError}
              </div>
            )}

            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> from the team?
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
