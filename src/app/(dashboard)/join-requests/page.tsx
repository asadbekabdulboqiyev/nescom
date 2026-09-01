'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import {
  UserCheck,
  UserX,
  Clock,
  Mail,
  MessageSquare,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface JoinRequest {
  id: string;
  userId: string;
  companyId: string;
  status: string;
  message: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function JoinRequestsPage() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const canManage = user?.role === 'CEO' || user?.role === 'MANAGER' || user?.role === 'HR';

  const fetchRequests = useCallback(async () => {
    if (!token || !canManage) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/join-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch requests');
      }
      const data = await res.json();
      setRequests(data.joinRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [token, canManage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED', role?: string) => {
    if (!token) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/join-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to review request');
      }
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review request');
    } finally {
      setProcessingId(null);
    }
  };

  if (!canManage) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Join Requests</h1>
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">You don&apos;t have permission to view join requests.</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const reviewedRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Join Requests</h1>
          <p className="text-sm text-slate-500">Review and manage employee join requests</p>
        </div>
        <Button variant="ghost" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingRequests.length}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {requests.filter((r) => r.status === 'APPROVED').length}
              </p>
              <p className="text-xs text-slate-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {requests.filter((r) => r.status === 'REJECTED').length}
              </p>
              <p className="text-xs text-slate-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Pending Requests</h2>
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
                          {request.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{request.user.name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="h-3 w-3" />
                            {request.user.email}
                          </div>
                        </div>
                      </div>
                      {request.message && (
                        <div className="mt-2 flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                          <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          {request.message}
                        </div>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        Requested {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <select
                        id={`role-${request.id}`}
                        defaultValue="DEVELOPER"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="DEVELOPER">Developer</option>
                        <option value="DESIGNER">Designer</option>
                        <option value="MARKETER">Marketer</option>
                        <option value="HR">HR</option>
                        <option value="SALES">Sales</option>
                        <option value="INTERN">Intern</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        <option value="SUPPORT">Support</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const select = document.getElementById(
                              `role-${request.id}`
                            ) as HTMLSelectElement;
                            handleReview(request.id, 'APPROVED', select?.value);
                          }}
                          disabled={processingId === request.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleReview(request.id, 'REJECTED')}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reviewedRequests.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Reviewed Requests</h2>
              {reviewedRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
                        {request.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{request.user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="h-3 w-3" />
                          {request.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          request.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {request.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {request.reviewedAt
                          ? new Date(request.reviewedAt).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {requests.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Clock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600">No join requests yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
