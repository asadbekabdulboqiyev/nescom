'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';

interface MessageUser {
 id: string;
 name: string;
 avatar?: string | null;
}

interface Message {
 id: string;
 sender: MessageUser;
 receiver: MessageUser;
 content: string;
 createdAt: string;
 senderId: string;
 receiverId: string;
}

interface ChatWindowProps {
 messages: Message[];
 loading?: boolean;
}

function formatTime(dateStr: string) {
 const d = new Date(dateStr);
 const now = new Date();
 const diffMs = now.getTime() - d.getTime();
 const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

 const time = d.toLocaleTimeString([], {
 hour:'2-digit',
 minute:'2-digit',
 });

 if (diffDays === 0) return time;
 if (diffDays === 1) return `Yesterday ${time}`;
 if (diffDays < 7) return `${d.toLocaleDateString([], { weekday:'short'})} ${time}`;
 return `${d.toLocaleDateString([], {
 month:'short',
 day:'numeric',
 })} ${time}`;
}

export function ChatWindow({ messages, loading }: ChatWindowProps) {
 const { user } = useAuth();
 const bottomRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 bottomRef.current?.scrollIntoView({ behavior:'smooth'});
 }, [messages]);

 if (loading) {
 return (
 <div
 className="flex-1 flex items-center justify-center"
 role="status"
 aria-label="Loading messages"
 >
 <div
 className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
 aria-hidden="true"
 />
 <span className="sr-only">Loading messages...</span>
 </div>
 );
 }

 if (messages.length === 0) {
 return (
 <div
 className="flex-1 flex items-center justify-center text-slate-400 text-sm"
 role="status"
 >
 No messages yet. Say hello!
 </div>
 );
 }

 return (
 <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
 {messages.map((msg, idx) => {
 const isOwn = msg.senderId === user?.id;
 const msgDate = new Date(msg.createdAt).toLocaleDateString([], {
 weekday:'long',
 month:'short',
 day:'numeric',
 });
 const prevDate =
 idx > 0
 ? new Date(messages[idx - 1].createdAt).toLocaleDateString([], {
 weekday:'long',
 month:'short',
 day:'numeric',
 })
 :'';
 const showDate = msgDate !== prevDate;

 return (
 <div key={msg.id}>
 {showDate && (
 <div className="flex items-center justify-center my-3">
 <span className="text-[11px] text-slate-400 bg-slate-100 rounded-full px-3 py-1">
 {msgDate}
 </span>
 </div>
 )}
 <div className={`flex ${isOwn ?'justify-end':'justify-start'} mb-1`}>
 {!isOwn && (
 <Avatar
 src={msg.sender.avatar}
 alt={msg.sender.name}
 size="sm"
 className="mr-2 mt-1 shrink-0"
 />
 )}
 <div className={`max-w-[70%] ${isOwn ?'items-end':'items-start'} flex flex-col`}>
 {!isOwn && (
 <span className="text-[11px] font-medium text-slate-500 mb-0.5 ml-1">
 {msg.sender.name}
 </span>
 )}
 <div
 className={`px-3.5 py-2 text-[14px] leading-snug ${
 isOwn
 ?'bg-blue-600 text-white rounded-2xl rounded-br-md'
 :'bg-slate-100 text-slate-900 rounded-2xl rounded-bl-md'
 }`}
 >
 {msg.content}
 </div>
 <span
 className={`text-[10px] text-slate-400 mt-0.5 ${
 isOwn ?'mr-1':'ml-1'
 }`}
 >
 {formatTime(msg.createdAt)}
 </span>
 </div>
 </div>
 </div>
 );
 })}
 <div ref={bottomRef} />
 </div>
 );
}
