import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  role?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

const sizePx = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({ src, alt, size = 'md', role, className }: AvatarProps) {
  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleColor: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
    'Software Engineer': 'info',
    'Product Manager': 'success',
    Designer: 'warning',
    'HR Manager': 'default',
    'DevOps Engineer': 'info',
  };

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={sizePx[size]}
          height={sizePx[size]}
          priority
          className={cn('rounded-full object-cover', sizeStyles[size])}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white',
            sizeStyles[size]
          )}
        >
          {initials}
        </div>
      )}
      {role && (
        <Badge
          variant={roleColor[role] ?? 'default'}
          className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0"
        >
          {role.split(' ')[0]}
        </Badge>
      )}
    </div>
  );
}
