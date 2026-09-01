import { cn } from '@/lib/utils';
import { Avatar } from './Avatar';

interface MessageBubbleProps {
  sender: { name: string; avatar?: string | null };
  text: string;
  time: string;
  isOwn?: boolean;
  className?: string;
}

export function MessageBubble({
  sender,
  text,
  time,
  isOwn = false,
  className,
}: MessageBubbleProps) {
  return (
    <div
      className={cn('flex gap-3 max-w-[75%]', isOwn ? 'ml-auto flex-row-reverse' : '', className)}
      role="article"
      aria-label={`Message from ${sender.name} at ${time}`}
    >
      {!isOwn && <Avatar src={sender.avatar} alt={sender.name} size="sm" />}
      <div>
        {!isOwn && <p className="text-xs font-medium text-slate-700 mb-1">{sender.name}</p>}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-slate-100 text-slate-900 rounded-bl-md'
          )}
        >
          {text}
        </div>
        <p
          className={cn('text-[11px] text-slate-400 mt-1', isOwn ? 'text-right' : '')}
          aria-label={`Sent at ${time}`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
