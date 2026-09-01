'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageCircle,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/salary', label: 'Salary', icon: DollarSign },
  {
    href: '/join-requests',
    label: 'Join Requests',
    icon: UserPlus,
    roles: ['CEO', 'MANAGER', 'HR'] as string[],
  },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose?.();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileOpen, onMobileClose]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const roleLabel = user?.role?.replace('_', ' ') || 'Member';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleNavKeyDown = useCallback((e: React.KeyboardEvent) => {
    const nav = navRef.current;
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href]'));
    const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

    let nextIndex = -1;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = currentIndex < links.length - 1 ? currentIndex + 1 : 0;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = links.length - 1;
    }

    if (nextIndex >= 0 && links[nextIndex]) {
      links[nextIndex].focus();
    }
  }, []);

  const isParentActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-blue-500/25">
          <span className="text-base font-bold text-white" aria-hidden="true">
            N
          </span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <span className="text-lg font-bold text-slate-900">Nescom</span>
            {user?.companyId && (
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                ID: {user.companyId.slice(0, 8)}...
              </p>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto hidden rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600 lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav
        ref={navRef}
        role="navigation"
        aria-label="Main navigation"
        className="flex-1 space-y-1 overflow-y-auto p-3"
        onKeyDown={handleNavKeyDown}
      >
        {navItems.map((item, index) => {
          if (item.roles && user?.role && !item.roles.includes(user.role)) return null;
          const isActive = isParentActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-600 sidebar-active-indicator'
                  : 'text-slate-600 hover:scale-[1.02] hover:bg-slate-50 hover:text-slate-900'
              )}
              title={collapsed ? item.label : undefined}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-200',
                  isActive ? 'text-blue-600' : 'group-hover:scale-110'
                )}
                aria-hidden="true"
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2 transition-all duration-200 hover:bg-slate-50',
            collapsed && 'justify-center'
          )}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white shadow-md"
            aria-hidden="true"
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 animate-fade-in">
              <p className="truncate text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-slate-500">{roleLabel}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:flex',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl animate-slide-in-left">
            <button
              onClick={onMobileClose}
              aria-label="Close navigation menu"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
