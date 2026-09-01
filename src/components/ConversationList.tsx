'use client';

import { Avatar } from '@/components/Avatar';
import { Search, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface ConversationUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface Conversation {
  user: ConversationUser;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (userId: string) => void;
  loading?: boolean;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4" aria-label="Loading conversations" role="status">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full skeleton" aria-hidden="true" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 skeleton" aria-hidden="true" />
                <div className="h-2.5 w-40 skeleton" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-200">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search conversations..."
            aria-label="Search conversations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" role="list" aria-label="Conversations">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
            <p className="text-sm">
              {conversations.length === 0 ? 'No conversations yet' : 'No results found'}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.user.id}
              onClick={() => onSelect(conv.user.id)}
              role="listitem"
              aria-label={`Conversation with ${conv.user.name}${conv.unread > 0 ? `, ${conv.unread} unread messages` : ''}`}
              aria-current={selectedId === conv.user.id ? 'true' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all border-b border-slate-100 ${
                selectedId === conv.user.id ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar src={conv.user.avatar} alt={conv.user.name} size="md" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${
                      conv.unread > 0
                        ? 'font-semibold text-slate-900'
                        : 'font-medium text-slate-700'
                    }`}
                  >
                    {conv.user.name}
                  </p>
                  <span
                    className={`text-[10px] shrink-0 ml-2 ${
                      conv.unread > 0 ? 'text-blue-600 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p
                    className={`text-xs truncate ${
                      conv.unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {conv.lastMessage || 'Start a conversation'}
                  </p>
                  {conv.unread > 0 && (
                    <span
                      className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white px-1.5 shrink-0"
                      aria-label={`${conv.unread} unread`}
                    >
                      {conv.unread > 99 ? '99+' : conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
