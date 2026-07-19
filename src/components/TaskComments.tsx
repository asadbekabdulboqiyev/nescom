'use client';

import { useState } from 'react';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Send } from 'lucide-react';

interface Comment {
 id: string;
 content: string;
 author: { id: string; name: string; avatar?: string | null };
 createdAt: string;
}

interface TaskCommentsProps {
 taskId: string;
 comments?: Comment[];
 onAdd?: (content: string) => void;
}

function formatTime(dateStr: string) {
 const diff = Date.now() - new Date(dateStr).getTime();
 const minutes = Math.floor(diff / 60000);
 if (minutes < 1) return'Just now';
 if (minutes < 60) return `${minutes}m ago`;
 const hours = Math.floor(minutes / 60);
 if (hours < 24) return `${hours}h ago`;
 const days = Math.floor(hours / 24);
 return `${days}d ago`;
}

export function TaskComments({ taskId, comments = [], onAdd }: TaskCommentsProps) {
 const [text, setText] = useState('');

 function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!text.trim()) return;
 onAdd?.(text.trim());
 setText('');
 }

 return (
 <div className="space-y-4">
 <h3 className="text-sm font-semibold text-slate-900">
 Comments ({comments.length})
 </h3>

 <div className="space-y-3 max-h-60 overflow-y-auto" role="list" aria-label="Comments">
 {comments.length === 0 ? (
 <p className="text-sm text-slate-400">No comments yet</p>
 ) : (
 comments.map((c) => (
 <div key={c.id} className="flex gap-3" role="listitem">
 <Avatar src={c.author.avatar} alt={c.author.name} size="sm"/>
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-slate-900">
 {c.author.name}
 </span>
 <span className="text-[11px] text-slate-400">{formatTime(c.createdAt)}</span>
 </div>
 <p className="mt-0.5 text-sm text-slate-600">{c.content}</p>
 </div>
 </div>
 ))
 )}
 </div>

 <form onSubmit={handleSubmit} className="flex gap-2">
 <label htmlFor={`comment-input-${taskId}`} className="sr-only">
 Add a comment
 </label>
 <input
 id={`comment-input-${taskId}`}
 type="text"
 value={text}
 onChange={(e) => setText(e.target.value)}
 placeholder="Add a comment..."
 className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
 />
 <Button type="submit" size="sm" disabled={!text.trim()} aria-label="Submit comment">
 <Send className="h-4 w-4" aria-hidden="true"/>
 </Button>
 </form>
 </div>
 );
}
