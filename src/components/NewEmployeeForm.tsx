'use client';

import { Button } from '@/components/Button';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
/* using plain <a> tags for compatibility */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function NewEmployeeForm() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DEVELOPER',
    phone: '',
    salary: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...form,
          salary: form.salary ? parseFloat(form.salary) : undefined,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/employees'), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create employee');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm animate-fade-in">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Employee Created!
          </h2>
          <p className="text-sm text-slate-500">
            Redirecting to employees list...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <a
          href="/employees"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Employee</h1>
          <p className="text-sm text-slate-500">Invite a new team member</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="john@company.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="CEO">CEO</option>
              <option value="MANAGER">Manager</option>
              <option value="DEVELOPER">Developer</option>
              <option value="DESIGNER">Designer</option>
              <option value="MARKETER">Marketer</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="+1 555-0100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Annual Salary
            </label>
            <input
              type="number"
              min="0"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="80000"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <a href="/employees">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </a>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Add Employee'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
