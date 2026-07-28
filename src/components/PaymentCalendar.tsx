'use client';

import { ChevronLeft, ChevronRight, Calendar, Clock, DollarSign, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface PaymentCalendarProps {
  payments: Payment[];
  onPay?: (id: string) => void;
  onMarkPaid?: (id: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount}`;
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function PaymentCalendar({ payments, onPay, onMarkPaid }: PaymentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const paymentsByDay = useMemo(() => {
    const map: Record<number, Payment[]> = {};
    payments.forEach((p) => {
      const d = new Date(p.dueDate);
      const y = d.getFullYear();
      const m = d.getMonth();
      if (y === currentDate.getFullYear() && m === currentDate.getMonth()) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(p);
      }
    });
    return map;
  }, [payments, currentDate]);

  const today = new Date();

  const selectedDayPayments = selectedDay ? paymentsByDay[selectedDay] || [] : [];

  const totalPending = useMemo(() => {
    return payments
      .filter((p) => p.status !== 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const totalPaid = useMemo(() => {
    return payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const upcomingDue = useMemo(() => {
    return payments
      .filter((p) => {
        if (p.status === 'PAID') return false;
        const days = getDaysUntil(p.dueDate);
        return days >= 0 && days <= 3;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [payments]);

  const getDayStatus = (day: number) => {
    const dayPayments = paymentsByDay[day] || [];
    if (dayPayments.length === 0) return null;

    const hasOverdue = dayPayments.some((p) => {
      const days = getDaysUntil(p.dueDate);
      return days < 0 && p.status !== 'PAID';
    });

    const hasUpcoming = dayPayments.some((p) => {
      const days = getDaysUntil(p.dueDate);
      return days >= 0 && days <= 3 && p.status !== 'PAID';
    });

    const allPaid = dayPayments.every((p) => p.status === 'PAID');

    if (hasOverdue) return 'overdue';
    if (hasUpcoming) return 'upcoming';
    if (allPaid) return 'paid';
    return 'pending';
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta));
    setSelectedDay(null);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Payment Calendar</h3>
              <p className="text-sm text-slate-500">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              aria-label="Previous month"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth(1)}
              aria-label="Next month"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-white border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-slate-500">Pending</span>
            </div>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(totalPending)}</p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-500">Due Soon</span>
            </div>
            <p className="mt-1 text-lg font-bold text-slate-900">{upcomingDue.length}</p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-slate-500">Paid</span>
            </div>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {(isMobile ? WEEKDAYS_SHORT : WEEKDAYS).map((d, i) => (
            <div
              key={d + i}
              className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for first week offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 md:h-24 bg-slate-50/50 rounded-lg" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPayments = paymentsByDay[day] || [];
            const dayStatus = getDayStatus(day);
            const isToday =
              today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={cn(
                  'relative min-h-[5rem] md:min-h-[6rem] rounded-lg border p-1.5 md:p-2 text-left transition-all duration-150',
                  'hover:border-blue-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  isSelected && 'border-blue-500 ring-2 ring-blue-500 ring-offset-1 bg-blue-50/50',
                  !isSelected && dayStatus === 'overdue' && 'border-red-200 bg-red-50/50',
                  !isSelected && dayStatus === 'upcoming' && 'border-amber-200 bg-amber-50/30',
                  !isSelected && dayStatus === 'paid' && 'border-emerald-100 bg-emerald-50/20',
                  !isSelected && dayStatus === 'pending' && 'border-slate-200 bg-white',
                  !isSelected && !dayStatus && 'border-slate-100 bg-white',
                  isToday && !isSelected && 'border-blue-400 bg-blue-50/30'
                )}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      'text-xs md:text-sm font-medium',
                      isToday && 'rounded-full bg-blue-600 text-white px-1.5 py-0.5',
                      !isToday && dayStatus === 'overdue' && 'text-red-600',
                      !isToday && dayStatus === 'upcoming' && 'text-amber-600',
                      !isToday && dayStatus === 'paid' && 'text-emerald-600',
                      !isToday && !dayStatus && 'text-slate-600'
                    )}
                  >
                    {day}
                  </span>
                  {dayPayments.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayPayments.length}
                    </span>
                  )}
                </div>

                {dayPayments.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayPayments.slice(0, isMobile ? 1 : 2).map((p) => (
                      <div
                        key={p.id}
                        className={cn(
                          'w-full truncate rounded px-1 py-0.5 text-[10px] font-medium',
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : getDaysUntil(p.dueDate) < 0
                            ? 'bg-red-100 text-red-700'
                            : getDaysUntil(p.dueDate) <= 3
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {formatCurrency(p.amount)}
                      </div>
                    ))}
                    {dayPayments.length > (isMobile ? 1 : 2) && (
                      <span className="block text-[10px] text-slate-400">
                        +{dayPayments.length - (isMobile ? 1 : 2)} more
                      </span>
                    )}
                  </div>
                )}

                {/* Due date indicator */}
                {!dayStatus && dayPayments.length > 0 && (
                  <div className="absolute bottom-1 right-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDay && selectedDayPayments.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-900">
              {new Date(year, month, selectedDay).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              <span className="ml-2 text-slate-400 font-normal">
                ({selectedDayPayments.length} payment{selectedDayPayments.length !== 1 ? 's' : ''})
              </span>
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            {selectedDayPayments.map((p) => {
              const days = getDaysUntil(p.dueDate);
              const statusLabel =
                p.status === 'PAID'
                  ? 'Paid'
                  : days < 0
                  ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`
                  : days === 0
                  ? 'Due today'
                  : `${days} day${days !== 1 ? 's' : ''} left`;

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        p.status === 'PAID'
                          ? 'bg-emerald-500'
                          : days < 0
                          ? 'bg-red-500'
                          : days <= 3
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.userName}</p>
                      <p className="text-xs text-slate-500">{statusLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      ${p.amount.toLocaleString()}
                    </span>
                    {p.status !== 'PAID' && onMarkPaid && (
                      <button
                        onClick={() => onMarkPaid(p.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                      >
                        Pay
                      </button>
                    )}
                    {onPay && (
                      <button
                        onClick={() => onPay(p.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day total */}
          <div className="mt-3 flex items-center justify-between rounded-lg bg-white border border-slate-200 px-4 py-2">
            <span className="text-xs font-medium text-slate-500">Total for this day</span>
            <span className="text-sm font-bold text-slate-900">
              ${selectedDayPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Empty state for selected day with no payments */}
      {selectedDay && selectedDayPayments.length === 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-900">
              {new Date(year, month, selectedDay).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-slate-500">No payments scheduled for this day.</p>
        </div>
      )}

      {/* Legend */}
      <div className="border-t border-slate-200 px-6 py-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Overdue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Due soon (3 days)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Paid
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Today
          </span>
        </div>
      </div>
    </div>
  );
}
