'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';
import { ChatWindow } from '@/components/ChatWindow';
import { ConversationList } from '@/components/ConversationList';
import { MessageInput } from '@/components/MessageInput';
import { MessageSquare, ArrowLeft } from 'lucide-react';

interface MessageUser {
  id: string;
  name: string;
  avatar: string | null;
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

interface Conversation {
  user: MessageUser;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

export default function MessagesPage() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [convLoading, setConvLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setConvLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = useCallback(
    async (userId: string) => {
      if (!token) return;
      setMsgLoading(true);
      try {
        const res = await fetch(`/api/messages?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setMsgLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, fetchMessages]);

  const handleSend = async (content: string) => {
    if (!selectedUserId || !token || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, receiverId: selectedUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
    setMobileShowChat(true);
    setConversations((prev) => prev.map((c) => (c.user.id === userId ? { ...c, unread: 0 } : c)));
  };

  const selectedConv = conversations.find((c) => c.user.id === selectedUserId);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Conversation List */}
      <div
        className={`w-full sm:w-80 sm:min-w-[320px] border-r border-slate-200 flex flex-col ${
          mobileShowChat ? 'hidden sm:flex' : 'flex'
        }`}
        role="region"
        aria-label="Conversations"
      >
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Messages</h2>
        </div>
        <ConversationList
          conversations={conversations}
          selectedId={selectedUserId}
          onSelect={handleSelectConversation}
          loading={convLoading}
        />
      </div>

      {/* Chat Panel */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${mobileShowChat ? 'flex' : 'hidden sm:flex'}`}
        role="region"
        aria-label="Chat"
      >
        {selectedUserId && selectedConv ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 shrink-0">
              <button
                onClick={() => setMobileShowChat(false)}
                aria-label="Back to conversations"
                className="sm:hidden p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <Avatar src={selectedConv.user.avatar} alt={selectedConv.user.name} size="sm" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedConv.user.name}</p>
              </div>
            </div>

            <ChatWindow messages={messages} loading={msgLoading} />

            <MessageInput onSend={handleSend} disabled={sending} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">Select a conversation</p>
              <p className="text-sm text-slate-400 mt-1">
                Choose a contact from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
