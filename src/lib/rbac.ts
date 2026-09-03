import { Role } from './roles';

export function canManageUsers(role: Role): boolean {
  return role === 'CEO' || role === 'MANAGER' || role === 'HR';
}

// Role hierarchy rank for privilege-escalation checks.
// Higher number = more privileged. CEO is top, PENDING is lowest.
const ROLE_RANK: Record<Role, number> = {
  CEO: 100,
  MANAGER: 90,
  ACCOUNTANT: 80,
  HR: 80,
  DEVELOPER: 70,
  DESIGNER: 70,
  MARKETER: 70,
  SALES: 70,
  SUPPORT: 70,
  INTERN: 60,
  PENDING: 0,
};

/**
 * Whether `actor` may assign `targetRole` to a user.
 *
 * Prevents privilege escalation: a MANAGER/HR who can edit users must not
 * be able to promote someone (or themselves) to CEO or another MANAGER.
 * Only the CEO can grant the CEO or MANAGER role. Non-CEO admins may only
 * assign roles strictly below their own rank.
 */
export function canAssignRole(actor: Role, targetRole: Role): boolean {
  if (actor === 'CEO') return true;

  // Non-CEO admins (MANAGER/HR) can only manage roles at or below their own
  // rank, and never another MANAGER.
  const actorRank = ROLE_RANK[actor];
  const targetRank = ROLE_RANK[targetRole];
  return targetRank < actorRank && targetRole !== 'MANAGER';
}

export function canManageTasks(role: Role): boolean {
  // All active users can create/manage tasks (except PENDING and INTERN)
  return role !== 'PENDING' && role !== 'INTERN';
}

export function canManageSalary(role: Role): boolean {
  return role === 'CEO' || role === 'ACCOUNTANT';
}

export function canViewSalary(role: Role): boolean {
  return role === 'CEO' || role === 'MANAGER' || role === 'ACCOUNTANT';
}

export function canSendMessage(_role: Role): boolean {
  return true;
}

export function canManageCompany(role: Role): boolean {
  return role === 'CEO';
}

export function canReviewJoinRequests(role: Role): boolean {
  return role === 'CEO' || role === 'MANAGER' || role === 'HR';
}
