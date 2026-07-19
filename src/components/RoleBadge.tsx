import { Crown, Shield, Code, Palette, Megaphone, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLES, type Role } from '@/lib/roles';

const iconMap: Record<string, LucideIcon> = {
  Crown,
  Shield,
  Code,
  Palette,
  Megaphone,
};

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLES[role];
  const Icon = iconMap[config.icon];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
