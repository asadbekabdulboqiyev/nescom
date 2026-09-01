'use client';

import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Mail, Phone, MoreHorizontal, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface EmployeeCardProps {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  salary?: number;
  status: string;
  department?: string;
  onRemove?: (id: string) => void;
}

const statusVariant = {
  active: 'success' as const,
  away: 'warning' as const,
  inactive: 'danger' as const,
};

export function EmployeeCard({
  id,
  name,
  role,
  email,
  phone,
  avatar,
  salary,
  status,
  department,
  onRemove,
}: EmployeeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleRemove = async () => {
    setRemoving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      onRemove?.(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar src={avatar} alt={name} size="lg" role={role} />
          <div className="min-w-0">
            <Link
              href={`/employees/${id}`}
              className="font-semibold text-slate-900 hover:text-blue-600"
            >
              {name}
            </Link>
            <p className="text-sm text-slate-500">{role}</p>
            {department && <p className="text-xs text-slate-400">{department}</p>}
          </div>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <Link
                href={`/employees/${id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
              {confirmDelete ? (
                <div className="px-3 py-2">
                  {error && (
                    <p className="text-xs text-red-600 mb-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mb-2">Are you sure?</p>
                  <div className="flex gap-1">
                    <button
                      onClick={handleRemove}
                      disabled={removing}
                      className="flex-1 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {removing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDelete(false);
                        setError(null);
                      }}
                      className="flex-1 rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3" />
          <span className="truncate">{email}</span>
        </div>
        {phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{phone}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
        {salary != null && (
          <span className="text-sm font-semibold text-slate-900">${salary.toLocaleString()}</span>
        )}
        <Badge variant={statusVariant[status as keyof typeof statusVariant] || 'default'}>
          {status}
        </Badge>
      </div>
    </div>
  );
}
