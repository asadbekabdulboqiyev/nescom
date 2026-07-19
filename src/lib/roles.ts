export type Role = 'CEO' | 'MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'MARKETER' | 'HR' | 'SALES' | 'INTERN' | 'ACCOUNTANT' | 'SUPPORT' | 'PENDING';

export interface RoleConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  permissions: string[];
}

export const ROLES: Record<Role, RoleConfig> = {
  CEO: {
    label: 'CEO',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'Crown',
    permissions: [
      'employees:read',
      'employees:write',
      'employees:delete',
      'tasks:read',
      'tasks:write',
      'tasks:delete',
      'tasks:assign',
      'salary:read',
      'salary:write',
      'messages:read',
      'messages:write',
      'settings:read',
      'settings:write',
      'company:manage',
      'join-requests:read',
      'join-requests:approve',
    ],
  },
  MANAGER: {
    label: 'Manager',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'Shield',
    permissions: [
      'employees:read',
      'tasks:read',
      'tasks:write',
      'tasks:assign',
      'salary:read',
      'messages:read',
      'messages:write',
      'join-requests:read',
      'join-requests:approve',
    ],
  },
  DEVELOPER: {
    label: 'Developer',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'Code',
    permissions: ['tasks:read', 'tasks:write', 'salary:read', 'messages:read', 'messages:write'],
  },
  DESIGNER: {
    label: 'Designer',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
    icon: 'Palette',
    permissions: ['tasks:read', 'tasks:write', 'salary:read', 'messages:read', 'messages:write'],
  },
  MARKETER: {
    label: 'Marketer',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: 'Megaphone',
    permissions: ['tasks:read', 'tasks:write', 'salary:read', 'messages:read', 'messages:write'],
  },
  HR: {
    label: 'HR',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100',
    icon: 'Users',
    permissions: [
      'employees:read',
      'tasks:read',
      'salary:read',
      'messages:read',
      'messages:write',
      'join-requests:read',
      'join-requests:approve',
    ],
  },
  SALES: {
    label: 'Sales',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: 'TrendingUp',
    permissions: ['tasks:read', 'tasks:write', 'salary:read', 'messages:read', 'messages:write'],
  },
  INTERN: {
    label: 'Intern',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'GraduationCap',
    permissions: ['tasks:read', 'messages:read', 'messages:write'],
  },
  ACCOUNTANT: {
    label: 'Accountant',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    icon: 'Calculator',
    permissions: [
      'tasks:read',
      'salary:read',
      'salary:write',
      'messages:read',
      'messages:write',
    ],
  },
  SUPPORT: {
    label: 'Support',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
    icon: 'Headphones',
    permissions: ['tasks:read', 'tasks:write', 'messages:read', 'messages:write'],
  },
  PENDING: {
    label: 'Pending',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: 'Clock',
    permissions: [],
  },
};

export const ALL_ROLES: Role[] = ['CEO', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'MARKETER', 'HR', 'SALES', 'INTERN', 'ACCOUNTANT', 'SUPPORT', 'PENDING'];

export function hasPermission(role: Role, permission: string): boolean {
  return ROLES[role]?.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
