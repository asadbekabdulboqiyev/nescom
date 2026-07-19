'use client';

import { Search, Menu, LogOut, ChevronDown, User, Settings } from 'lucide-react';
import { Avatar } from './Avatar';
import { NotificationBell } from './NotificationBell';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && userMenuOpen) {
        setUserMenuOpen(false);
      }
    },
    [userMenuOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const roleLabel = user?.role?.replace('_', ' ') || 'Member';

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-6"
    >
      <button
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div
        className={`relative flex-1 max-w-md transition-all duration-200 ${searchFocused ? 'max-w-lg' : ''}`}
      >
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search employees, tasks..."
          aria-label="Search employees and tasks"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`w-full rounded-lg border bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
            searchFocused
              ? 'border-blue-500 shadow-md shadow-blue-500/10'
              : 'border-slate-200 focus:border-blue-500'
          }`}
        />
      </div>

      <div className="flex items-center gap-1">
        <NotificationBell />

        <div className="hidden sm:flex items-center gap-2 ml-2 border-l border-slate-200 pl-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 transition-all duration-200"
            >
              <Avatar src={null} alt={user?.name || 'User'} size="sm" />
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-scale-in"
              >
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email || ''}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Settings
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
