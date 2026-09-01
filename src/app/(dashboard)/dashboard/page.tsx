'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { StatsCard } from '@/components/StatsCard';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import {
  Users,
  CheckSquare,
  DollarSign,
  Clock,
  Plus,
  UserPlus,
  FileText,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, User, Salary } from '@/types';
import Link from 'next/link';

const SalaryOverview = dynamic(
  () => import('@/components/charts/SalaryOverview').then((mod) => mod.SalaryOverview),
  {
    loading: () => (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-40 skeleton" />
        <div className="flex items-center justify-center h-[250px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    ),
  }
);

const TeamActivity = dynamic(
  () => import('@/components/charts/TeamActivity').then((mod) => mod.TeamActivity),
  {
    loading: () => (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-40 skeleton" />
        <div className="flex items-center justify-center h-[250px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    ),
  }
);

const TasksByStatus = dynamic(
  () => import('@/components/charts/TasksByStatus').then((mod) => mod.TasksByStatus),
  {
    loading: () => (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-40 skeleton" />
        <div className="flex items-center justify-center h-[250px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    ),
  }
);

interface DashboardStats {
  totalEmployees: number;
  activeTasks: number;
  pendingSalaries: number;
  completedTasks: number;
}

interface RecentActivity {
  id: string;
  type: 'task' | 'employee' | 'salary';
  message: string;
  time: string;
  icon: typeof Users;
}

const quickActions = [
  {
    label: 'Add Employee',
    icon: UserPlus,
    color: 'from-blue-500 to-blue-600',
    href: '/employees/new',
  },
  { label: 'New Task', icon: Plus, color: 'from-emerald-500 to-emerald-600', href: '/tasks' },
  {
    label: 'View Messages',
    icon: FileText,
    color: 'from-violet-500 to-violet-600',
    href: '/messages',
  },
];

const statusColor: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  IN_PROGRESS: 'warning',
  TODO: 'info',
  DONE: 'success',
  BLOCKED: 'default',
};

const priorityColor: Record<string, string> = {
  URGENT: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-blue-500',
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeTasks: 0,
    pendingSalaries: 0,
    completedTasks: 0,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [salaryData, setSalaryData] = useState<Salary[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [usersRes, tasksRes, salaryRes] = await Promise.all([
          fetch('/api/users', { headers }),
          fetch('/api/tasks', { headers }),
          fetch('/api/salary', { headers }),
        ]);

        let usersList: User[] = [];
        if (usersRes.ok) {
          const json = await usersRes.json();
          const payload = json.data ?? json;
          usersList = Array.isArray(payload) ? payload : payload.users || [];
          setUsers(usersList);
          setStats((prev) => ({ ...prev, totalEmployees: usersList.length }));
        }

        let allTasks: Task[] = [];
        if (tasksRes.ok) {
          const json = await tasksRes.json();
          const payload = json.data ?? json;
          allTasks = Array.isArray(payload) ? payload : payload.tasks || [];
          setTasks(allTasks.slice(0, 5));
          setStats((prev) => ({
            ...prev,
            activeTasks: allTasks.filter((t: Task) => t.status !== 'DONE').length,
            completedTasks: allTasks.filter((t: Task) => t.status === 'DONE').length,
          }));
        }

        let salaries: Salary[] = [];
        if (salaryRes.ok) {
          const json = await salaryRes.json();
          const payload = json.data ?? json;
          salaries = Array.isArray(payload) ? payload : payload.salaries || [];
          setSalaryData(salaries);
          setStats((prev) => ({
            ...prev,
            pendingSalaries: salaries.filter((s: Salary) => s.status === 'PENDING').length,
          }));
        }

        const activity: RecentActivity[] = [];
        allTasks.slice(0, 3).forEach((t) => {
          activity.push({
            id: `task-${t.id}`,
            type: 'task',
            message: `Task "${t.title}" ${t.status === 'DONE' ? 'completed' : 'created'}`,
            time: t.createdAt,
            icon: CheckSquare,
          });
        });
        usersList.slice(0, 2).forEach((u) => {
          activity.push({
            id: `emp-${u.id}`,
            type: 'employee',
            message: `${u.name} joined as ${u.role}`,
            time: new Date().toISOString(),
            icon: UserPlus,
          });
        });
        setRecentActivity(
          activity
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 5)
        );
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isEmpty = users.length === 0 && tasks.length === 0;

  const tasksByStatus = [
    { status: 'TODO', count: tasks.filter((t) => t.status === 'TODO').length },
    { status: 'IN_PROGRESS', count: tasks.filter((t) => t.status === 'IN_PROGRESS').length },
    { status: 'DONE', count: tasks.filter((t) => t.status === 'DONE').length },
    { status: 'BLOCKED', count: tasks.filter((t) => t.status === 'BLOCKED').length },
  ].filter((d) => d.count > 0) as { status: string; count: number }[];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-sm text-slate-500">
          Here&apos;s what&apos;s happening across your organization today.
        </p>
      </div>

      {isEmpty && (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center animate-fade-in">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Welcome to Nescom!</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Get started by adding your first team member. Once you have employees, you can create
            tasks, send messages, and manage salaries.
          </p>
          <Link
            href="/employees/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Your First Employee
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-in-up" style={{ animationDelay: '0ms' }}>
          <StatsCard
            title="Total Employees"
            value={stats.totalEmployees}
            change="Active team members"
            changeType="positive"
            icon={Users}
            gradient="blue"
            sparklineData={[
              stats.totalEmployees,
              stats.totalEmployees * 0.8,
              stats.totalEmployees * 0.9,
              stats.totalEmployees,
            ]}
          />
        </div>
        <div className="animate-slide-in-up" style={{ animationDelay: '50ms' }}>
          <StatsCard
            title="Active Tasks"
            value={stats.activeTasks}
            change="In progress"
            changeType="positive"
            icon={CheckSquare}
            gradient="emerald"
            sparklineData={[
              stats.activeTasks * 0.6,
              stats.activeTasks * 0.8,
              stats.activeTasks * 0.7,
              stats.activeTasks,
            ]}
          />
        </div>
        <div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Pending Salaries"
            value={stats.pendingSalaries}
            change="Due this month"
            changeType="negative"
            icon={DollarSign}
            gradient="amber"
            sparklineData={[
              stats.pendingSalaries * 1.2,
              stats.pendingSalaries * 1.1,
              stats.pendingSalaries,
              stats.pendingSalaries * 0.9,
            ]}
          />
        </div>
        <div className="animate-slide-in-up" style={{ animationDelay: '150ms' }}>
          <StatsCard
            title="Completed"
            value={stats.completedTasks}
            change="Tasks done"
            changeType="positive"
            icon={Clock}
            gradient="violet"
            sparklineData={[
              stats.completedTasks * 0.5,
              stats.completedTasks * 0.7,
              stats.completedTasks * 0.85,
              stats.completedTasks,
            ]}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action, index) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in"
            style={{ animationDelay: `${200 + index * 50}ms` }}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <TasksByStatus data={tasksByStatus} />
        <SalaryOverview
          data={salaryData.reduce(
            (acc, s) => {
              const name = s.user?.name || 'Unknown';
              const existing = acc.find((a) => a.name === name);
              if (existing) {
                if (s.status === 'PAID') existing.paid += s.amount;
                else existing.pending += s.amount;
              } else {
                acc.push({
                  name,
                  paid: s.status === 'PAID' ? s.amount : 0,
                  pending: s.status !== 'PAID' ? s.amount : 0,
                });
              }
              return acc;
            },
            [] as { name: string; paid: number; pending: number }[]
          )}
        />
        <TeamActivity
          data={recentActivity.map((item) => ({
            date: item.time.split('T')[0],
            tasks: item.type === 'task' ? 1 : 0,
            messages: item.type === 'employee' ? 1 : 0,
          }))}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
          <Link
            href="/tasks"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-6">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">No tasks yet</p>
              <Link
                href="/tasks"
                className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
              >
                Create your first task →
              </Link>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${priorityColor[task.priority] || 'bg-slate-400'}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.assignee?.name || 'Unassigned'}</p>
                  </div>
                </div>
                <Badge variant={statusColor[task.status] || 'default'}>
                  {task.status.replace('_', ' ').toLowerCase()}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
          <Link
            href="/employees"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {users.length === 0 ? (
            <div className="text-center py-8 col-span-3">
              <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No team members yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-3">
                Add your first employee to get started
              </p>
              <Link
                href="/employees/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-3 w-3" />
                Add First Employee
              </Link>
            </div>
          ) : (
            users.slice(0, 6).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-slate-50"
              >
                <Avatar src={member.avatar} alt={member.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{member.role.toLowerCase()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
