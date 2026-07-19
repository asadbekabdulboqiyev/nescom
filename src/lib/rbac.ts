import { Role } from './roles';

export function canManageUsers(role: Role): boolean {
  return role === 'CEO' || role === 'MANAGER' || role === 'HR';
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
