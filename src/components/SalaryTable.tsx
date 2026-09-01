'use client';

import { cn } from '@/lib/utils';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { Download, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

export interface SalaryRecord {
  id: string;
  name: string;
  avatar?: string | null;
  role: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidAt?: string;
}

type SortField = 'name' | 'baseSalary' | 'bonus' | 'deductions' | 'netPay' | 'status' | 'dueDate';
type SortDir = 'asc' | 'desc';

interface SalaryTableProps {
  records: SalaryRecord[];
  onMarkPaid?: (id: string) => void;
  markingId?: string | null;
  className?: string;
  showFilteredExport?: boolean;
  filteredRecords?: SalaryRecord[];
}

const statusVariant = {
  paid: 'success' as const,
  pending: 'warning' as const,
  overdue: 'danger' as const,
};

const statusOrder: Record<SalaryRecord['status'], number> = {
  pending: 0,
  overdue: 1,
  paid: 2,
};

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function exportToCSV(records: SalaryRecord[], label: string) {
  const headers = [
    'Employee',
    'Role',
    'Base Salary',
    'Bonus',
    'Deductions',
    'Net Pay',
    'Status',
    'Due Date',
    'Paid At',
  ];
  const rows = records.map((r) => [
    r.name,
    r.role,
    formatNumber(r.baseSalary),
    formatNumber(r.bonus),
    formatNumber(r.deductions),
    formatNumber(r.netPay),
    r.status.charAt(0).toUpperCase() + r.status.slice(1),
    r.dueDate,
    r.paidAt || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `salary-report-${label}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function SalaryTable({
  records,
  onMarkPaid,
  markingId,
  className,
  showFilteredExport,
  filteredRecords,
}: SalaryTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...records].sort((a, b) => {
    if (sortField === 'status') {
      const diff = statusOrder[a.status] - statusOrder[b.status];
      return sortDir === 'asc' ? diff : -diff;
    }
    if (sortField === 'dueDate') {
      const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return sortDir === 'asc' ? diff : -diff;
    }
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    return sortDir === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const columns: { field: SortField; label: string }[] = [
    { field: 'name', label: 'Employee' },
    { field: 'baseSalary', label: 'Base' },
    { field: 'bonus', label: 'Bonus' },
    { field: 'deductions', label: 'Deductions' },
    { field: 'netPay', label: 'Net Pay' },
    { field: 'status', label: 'Status' },
    { field: 'dueDate', label: 'Due Date' },
  ];

  return (
    <div className={cn('overflow-hidden rounded-xl border border-slate-200', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="cursor-pointer px-4 py-3 text-left font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    <ArrowUpDown
                      className={cn(
                        'h-3 w-3 transition-transform',
                        sortField === field && sortDir === 'desc' && 'rotate-180'
                      )}
                    />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={record.avatar} alt={record.name} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900">{record.name}</p>
                      <p className="text-xs text-slate-500">{record.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">${formatNumber(record.baseSalary)}</td>
                <td className="px-4 py-3 text-emerald-600">+${formatNumber(record.bonus)}</td>
                <td className="px-4 py-3 text-red-600">-${formatNumber(record.deductions)}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  ${formatNumber(record.netPay)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[record.status]}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">{record.dueDate}</td>
                <td className="px-4 py-3">
                  {record.status === 'pending' && onMarkPaid ? (
                    <button
                      onClick={() => onMarkPaid(record.id)}
                      disabled={markingId === record.id}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {markingId === record.id ? 'Paying...' : 'Mark Paid'}
                    </button>
                  ) : record.status === 'paid' ? (
                    <span className="text-xs font-medium text-emerald-600">Paid</span>
                  ) : (
                    <button
                      onClick={() => exportToCSV([record], 'single')}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="Download CSV"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {records.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <span className="text-xs text-slate-500">
            {records.length} record{records.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            {showFilteredExport &&
              filteredRecords &&
              filteredRecords.length > 0 &&
              filteredRecords.length < records.length && (
                <button
                  onClick={() => exportToCSV(filteredRecords, 'filtered')}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export Filtered CSV
                </button>
              )}
            <button
              onClick={() => exportToCSV(records, 'all')}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export All CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
