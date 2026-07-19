'use client';

import { Bell, CheckCheck, MessageSquare, CheckSquare, DollarSign } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn, formatTimeAgo } from '@/lib/utils';

interface Notification {
 id: string;
 title: string;
 message: string;
 type:'TASK'|'MESSAGE'|'SALARY';
 read: boolean;
 createdAt: string;
}

const typeIcon: Record<string, typeof Bell> = {
 TASK: CheckSquare,
 MESSAGE: MessageSquare,
 SALARY: DollarSign,
};

const typeColor: Record<string, string> = {
 TASK:'text-blue-600 bg-blue-50',
 MESSAGE:'text-emerald-600 bg-emerald-50',
 SALARY:'text-amber-600 bg-amber-50',
};

export function NotificationBell() {
 const [open, setOpen] = useState(false);
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const [animateBadge, setAnimateBadge] = useState(false);
 const ref = useRef<HTMLDivElement>(null);

 const fetchNotifications = useCallback(async () => {
 try {
 const res = await fetch('/api/notifications', { credentials:'include'});
 if (res.ok) {
 const data = await res.json();
 const newCount = data.unreadCount ?? 0;
 if (newCount > unreadCount) {
 setAnimateBadge(true);
 setTimeout(() => setAnimateBadge(false), 600);
 }
 setNotifications(data.notifications || []);
 setUnreadCount(newCount);
 }
 } catch {
 // silently fail
 }
 }, [unreadCount]);

 useEffect(() => {
 fetchNotifications();
 const interval = setInterval(fetchNotifications, 30000);
 return () => clearInterval(interval);
 }, [fetchNotifications]);

 useEffect(() => {
 function handleClickOutside(e: MouseEvent) {
 if (ref.current && !ref.current.contains(e.target as Node)) {
 setOpen(false);
 }
 }
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 useEffect(() => {
 function handleEscape(e: KeyboardEvent) {
 if (e.key ==='Escape'&& open) {
 setOpen(false);
 }
 }
 document.addEventListener('keydown', handleEscape);
 return () => document.removeEventListener('keydown', handleEscape);
 }, [open]);

 async function markAsRead(id: string) {
 try {
 await fetch('/api/notifications', {
 method:'PATCH',
 headers: {'Content-Type':'application/json'},
 credentials:'include',
 body: JSON.stringify({ action:'read', id }),
 });
 setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
 setUnreadCount((prev) => Math.max(0, prev - 1));
 } catch {
 // silently fail
 }
 }

 async function markAllRead() {
 try {
 await fetch('/api/notifications', {
 method:'PATCH',
 headers: {'Content-Type':'application/json'},
 credentials:'include',
 body: JSON.stringify({ action:'readAll'}),
 });
 setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
 setUnreadCount(0);
 } catch {
 // silently fail
 }
 }

 return (
 <div ref={ref} className="relative">
 <button
 onClick={() => setOpen(!open)}
 aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` :''}`}
 aria-expanded={open}
 aria-haspopup="true"
 className={cn(
'relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors',
 open &&'bg-slate-100'
 )}
 >
 <Bell className="h-5 w-5" aria-hidden="true"/>
 {unreadCount > 0 && (
 <span
 aria-hidden="true"
 className={cn(
'absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg transition-transform',
 animateBadge &&'animate-bounce'
 )}
 >
 {unreadCount > 99 ?'99+': unreadCount}
 </span>
 )}
 </button>

 {open && (
 <div
 role="region"
 aria-label="Notifications panel"
 className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-slate-200 bg-white shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
 >
 <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
 <div className="flex items-center gap-2">
 <h2 className="font-semibold text-slate-900">Notifications</h2>
 {unreadCount > 0 && (
 <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
 {unreadCount} new
 </span>
 )}
 </div>
 {unreadCount > 0 && (
 <button
 onClick={markAllRead}
 aria-label="Mark all notifications as read"
 className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
 >
 <CheckCheck className="h-3 w-3" aria-hidden="true"/>
 Mark all read
 </button>
 )}
 </div>
 <div className="max-h-96 overflow-y-auto" role="list">
 {notifications.length === 0 ? (
 <div className="px-4 py-12 text-center">
 <Bell
 className="h-10 w-10 mx-auto mb-3 text-slate-300"
 aria-hidden="true"
 />
 <p className="text-sm font-medium text-slate-500">
 No notifications yet
 </p>
 <p className="text-xs text-slate-400 mt-1">
 You&apos;re all caught up!
 </p>
 </div>
 ) : (
 notifications.map((n) => {
 const Icon = typeIcon[n.type] || Bell;
 return (
 <div
 key={n.id}
 role="listitem"
 onClick={() => !n.read && markAsRead(n.id)}
 onKeyDown={(e) => {
 if ((e.key ==='Enter'|| e.key ==='') && !n.read) {
 e.preventDefault();
 markAsRead(n.id);
 }
 }}
 tabIndex={0}
 aria-label={`${n.read ?'':'Unread'}${n.title}: ${n.message}`}
 className={cn(
'flex gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-slate-50 border-b border-slate-50 last:border-0',
 !n.read &&
'bg-blue-50/50 hover:bg-blue-50'
 )}
 >
 <div
 className={cn(
'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
 typeColor[n.type]
 )}
 aria-hidden="true"
 >
 <Icon className="h-4 w-4"/>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <p
 className={cn(
'text-sm truncate',
 n.read
 ?'text-slate-700'
 :'font-semibold text-slate-900'
 )}
 >
 {n.title}
 </p>
 {!n.read && (
 <span
 className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500"
 aria-label="Unread"
 />
 )}
 </div>
 <p className="text-xs text-slate-500 truncate mt-0.5">
 {n.message}
 </p>
 <p className="mt-1 text-[11px] text-slate-400">
 {formatTimeAgo(n.createdAt)}
 </p>
 </div>
 </div>
 );
 })
 )}
 </div>
 {notifications.length > 0 && (
 <div className="border-t border-slate-100 px-4 py-2.5">
 <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
 View all notifications
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 );
}
