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
}

interface CreatedSalary {
  id: string;
  userId: string;
  amount: number;
  bonus: number;
  deductions: number;
  dueDate: string;
  status: string;
  user: { id: string; name: string; avatar?: string | null };
}

interface CreateSalaryModalProps {
  open: boolean;
  onClose: () => void;
  onSalaryCreated: (salary: CreatedSalary) => void;
}

export function CreateSalaryModal({ open, onClose, onSalaryCreated }: CreateSalaryModalProps) {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    amount: '',
    dueDate: '',
    bonus: '',
    deductions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/users', { headers, credentials: 'include' });
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
    if (!form.userId) newErrors.userId = 'Employee is required';
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Amount must be positive';
    if (!form.dueDate) newErrors.dueDate = 'Due date is required';
    if (form.bonus && parseFloat(form.bonus) < 0) newErrors.bonus = 'Bonus must be non-negative';
    if (form.deductions && parseFloat(form.deductions) < 0)
      newErrors.deductions = 'Deductions must be non-negative';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setCreating(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body: Record<string, unknown> = {
        userId: form.userId,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate,
      };
      if (form.bonus) body.bonus = parseFloat(form.bonus);
      if (form.deductions) body.deductions = parseFloat(form.deductions);

      const res = await fetch('/api/salary', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        const payload = json.data ?? json;
        onSalaryCreated(payload.salary);
        setForm({ userId: '', amount: '', dueDate: '', bonus: '', deductions: '' });
        onClose();
      } else {
        const data = await res.json();
        setErrors({ submit: data.error || 'Failed to create salary record' });
      }
    } catch (error) {
      console.error('Failed to create salary:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Salary Record">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.submit && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="salary-employee"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Employee *
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
              id="salary-employee"
              value={form.userId}
              onChange={(e) => {
                setForm({ ...form, userId: e.target.value });
                setErrors((prev) => ({ ...prev, userId: '' }));
              }}
              aria-required="true"
              aria-describedby={errors.userId ? 'salary-employee-error' : undefined}
              aria-invalid={!!errors.userId}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.role}
                </option>
              ))}
            </select>
          )}
          {errors.userId && (
            <p id="salary-employee-error" role="alert" className="mt-1 text-xs text-red-500">
              {errors.userId}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="salary-amount"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Amount *
            </label>
            <input
              id="salary-amount"
              type="number"
              min="0"
              step="0.01"
              required
              aria-required="true"
              aria-describedby={errors.amount ? 'salary-amount-error' : undefined}
              aria-invalid={!!errors.amount}
              value={form.amount}
              onChange={(e) => {
                setForm({ ...form, amount: e.target.value });
                setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.amount && (
              <p id="salary-amount-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.amount}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="salary-due-date"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Due Date *
            </label>
            <input
              id="salary-due-date"
              type="date"
              required
              aria-required="true"
              aria-describedby={errors.dueDate ? 'salary-due-date-error' : undefined}
              aria-invalid={!!errors.dueDate}
              value={form.dueDate}
              onChange={(e) => {
                setForm({ ...form, dueDate: e.target.value });
                setErrors((prev) => ({ ...prev, dueDate: '' }));
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.dueDate && (
              <p id="salary-due-date-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.dueDate}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="salary-bonus" className="block text-sm font-medium text-slate-700 mb-1">
              Bonus
            </label>
            <input
              id="salary-bonus"
              type="number"
              min="0"
              step="0.01"
              aria-describedby={errors.bonus ? 'salary-bonus-error' : undefined}
              aria-invalid={!!errors.bonus}
              value={form.bonus}
              onChange={(e) => {
                setForm({ ...form, bonus: e.target.value });
                setErrors((prev) => ({ ...prev, bonus: '' }));
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.bonus && (
              <p id="salary-bonus-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.bonus}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="salary-deductions"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Deductions
            </label>
            <input
              id="salary-deductions"
              type="number"
              min="0"
              step="0.01"
              aria-describedby={errors.deductions ? 'salary-deductions-error' : undefined}
              aria-invalid={!!errors.deductions}
              value={form.deductions}
              onChange={(e) => {
                setForm({ ...form, deductions: e.target.value });
                setErrors((prev) => ({ ...prev, deductions: '' }));
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.deductions && (
              <p id="salary-deductions-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.deductions}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={creating}
            disabled={!form.userId || !form.amount || !form.dueDate}
          >
            Create Salary
          </Button>
        </div>
      </form>
    </Modal>
  );
}
