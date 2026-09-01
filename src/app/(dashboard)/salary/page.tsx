'use client';

import { SalaryTable, type SalaryRecord } from '@/components/SalaryTable';
import { StatsCard } from '@/components/StatsCard';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Loader2,
  Receipt,
  CheckCircle,
  Plus,
  TrendingUp,
  CalendarClock,
  ArrowRight,
  Users,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CreateSalaryModal } from '@/components/CreateSalaryModal';

const SalaryChart = dynamic(
  () => import('@/components/SalaryChart').then((mod) => mod.SalaryChart),
  {
    loading: () => (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div className="flex items-center justify-center h-[280px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    ),
  }
);

export default function SalaryPage() {
  const { token, user } = useAuth();
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canManage = user?.role === 'CEO' || user?.role === 'MANAGER' || user?.role === 'ACCOUNTANT';

  const handleMarkPaid = async (id: string) => {
    if (!token) return;
    setMarkingId(id);
    try {
      const res = await fetch(`/api/salary/pay/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setSalaryData((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: 'paid' as const, paidAt: new Date().toISOString().split('T')[0] }
              : r
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark salary as paid:', error);
    } finally {
      setMarkingId(null);
    }
  };

  const fetchSalaries = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/salary', { headers, credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        const payload = json.data ?? json;
        const salaries = Array.isArray(payload) ? payload : payload.salaries || [];
        const records: SalaryRecord[] = salaries.map((s: Record<string, unknown>) => {
          const amount = (s.amount as number) || 0;
          const bonus = (s.bonus as number) || 0;
          const deductions = (s.deductions as number) || 0;
          return {
            id: s.id as string,
            name: (s.user as { name: string })?.name || 'Unknown',
            avatar: (s.user as { avatar?: string | null })?.avatar || null,
            role: 'Employee',
            baseSalary: amount,
            bonus,
            deductions,
            netPay: amount + bonus - deductions,
            status:
              ((s.status as string)?.toLowerCase() as 'paid' | 'pending' | 'overdue') || 'pending',
            dueDate: s.dueDate
              ? new Date(s.dueDate as string).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'N/A',
            paidAt: s.paidAt
              ? new Date(s.paidAt as string).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : undefined,
          };
        });
        setSalaryData(records);
      }
    } catch (error) {
      console.error('Failed to fetch salaries:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSalaryCreated = useCallback(
    (salary: {
      id: string;
      user: { name: string; avatar?: string | null };
      amount: number;
      bonus: number;
      deductions: number;
      dueDate: string;
      status: string;
    }) => {
      const amount = salary.amount || 0;
      const bonus = salary.bonus || 0;
      const deductions = salary.deductions || 0;
      const newRecord: SalaryRecord = {
        id: salary.id,
        name: salary.user?.name || 'Unknown',
        avatar: salary.user?.avatar || null,
        role: 'Employee',
        baseSalary: amount,
        bonus,
        deductions,
        netPay: amount + bonus - deductions,
        status: (salary.status?.toLowerCase() as 'paid' | 'pending' | 'overdue') || 'pending',
        dueDate: salary.dueDate
          ? new Date(salary.dueDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : 'N/A',
      };
      setSalaryData((prev) => [newRecord, ...prev]);
    },
    []
  );

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const filtered = salaryData.filter((r) => filter === 'all' || r.status === filter);

  const totalPaid = salaryData
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + r.netPay, 0);
  const totalPending = salaryData
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.netPay, 0);
  const overdueCount = salaryData.filter((r) => r.status === 'overdue').length;
  const totalCost = salaryData.reduce((sum, r) => sum + r.netPay, 0);
  const averageSalary = salaryData.length > 0 ? totalCost / salaryData.length : 0;

  const nextPayment = salaryData
    .filter((r) => r.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Salary Management</h1>
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">You don&apos;t have permission to view salary data.</p>
          <p className="text-sm text-slate-400 mt-1">
            Only CEO, Manager, and Accountant can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salary Management</h1>
          <p className="text-sm text-slate-500">Manage employee payments and compensation</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Salary
          </button>
        )}
      </div>

      {salaryData.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatsCard
            title="Total Cost"
            value={formatCurrency(totalCost)}
            change={`${salaryData.length} records`}
            changeType="neutral"
            icon={DollarSign}
          />
          <StatsCard
            title="Total Paid"
            value={formatCurrency(totalPaid)}
            change="This month"
            changeType="positive"
            icon={CheckCircle}
          />
          <StatsCard
            title="Pending"
            value={formatCurrency(totalPending)}
            change="Awaiting processing"
            changeType="neutral"
            icon={Clock}
          />
          <StatsCard
            title="Overdue"
            value={overdueCount}
            change="Requires attention"
            changeType="negative"
            icon={AlertTriangle}
          />
          <StatsCard
            title="Average Salary"
            value={formatCurrency(averageSalary)}
            change="Per employee"
            changeType="neutral"
            icon={TrendingUp}
          />
          <StatsCard
            title="Next Payment"
            value={nextPayment ? nextPayment.dueDate : 'None'}
            change={nextPayment ? `${nextPayment.name}` : 'All paid'}
            changeType={nextPayment ? 'negative' : 'positive'}
            icon={CalendarClock}
          />
        </div>
      )}

      {salaryData.length > 0 && (
        <SalaryChart
          data={salaryData.map((r) => ({
            name: r.name,
            amount: r.netPay,
          }))}
        />
      )}

      {salaryData.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center animate-fade-in">
          <Receipt className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No salary records yet</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Salary records will appear here once you create them for your employees.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm mb-8"
          >
            <Plus className="h-4 w-4" />
            Add your first salary record
          </button>

          <div className="max-w-md mx-auto text-left">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">How to get started</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  1
                </span>
                <p className="text-sm text-slate-600">
                  Add employees to your company first if you haven&apos;t already.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  2
                </span>
                <p className="text-sm text-slate-600">
                  Create salary records for each employee with their base salary, bonus, and
                  deductions.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  3
                </span>
                <p className="text-sm text-slate-600">
                  Mark payments as paid when transactions are completed. Export reports as CSV
                  anytime.
                </p>
              </div>
            </div>

            <Link
              href="/employees"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Users className="h-4 w-4" />
              View Employees
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All', count: salaryData.length },
              {
                key: 'paid',
                label: 'Paid',
                count: salaryData.filter((r) => r.status === 'paid').length,
              },
              {
                key: 'pending',
                label: 'Pending',
                count: salaryData.filter((r) => r.status === 'pending').length,
              },
              {
                key: 'overdue',
                label: 'Overdue',
                count: salaryData.filter((r) => r.status === 'overdue').length,
              },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
              <p className="text-slate-500">No salary records found for this filter</p>
            </div>
          ) : (
            <SalaryTable
              records={filtered}
              onMarkPaid={canManage ? handleMarkPaid : undefined}
              markingId={markingId}
              showFilteredExport={filter !== 'all'}
              filteredRecords={filter !== 'all' ? filtered : undefined}
            />
          )}
        </>
      )}

      <CreateSalaryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSalaryCreated={handleSalaryCreated}
      />
    </div>
  );
}
