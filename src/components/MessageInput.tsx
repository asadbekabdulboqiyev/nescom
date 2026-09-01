'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-slate-200">
      <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500 transition-colors">
        <label className="sr-only" htmlFor="message-input">
          Message
        </label>
        <textarea
          ref={inputRef}
          id="message-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label={placeholder}
          aria-describedby="message-hint"
          className="flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-1 max-h-32"
          style={{ minHeight: '24px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />
        <span id="message-hint" className="sr-only">
          Press Enter to send, Shift+Enter for new line
        </span>
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className="shrink-0 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
