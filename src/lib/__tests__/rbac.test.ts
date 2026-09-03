import { Role } from '../roles';
import {
  canManageUsers,
  canAssignRole,
  canManageTasks,
  canManageSalary,
  canViewSalary,
  canSendMessage,
  canManageCompany,
  canReviewJoinRequests,
} from '../rbac';

describe('canManageUsers', () => {
  it('should return true for CEO', () => {
    expect(canManageUsers('CEO')).toBe(true);
  });

  it('should return true for MANAGER', () => {
    expect(canManageUsers('MANAGER')).toBe(true);
  });

  it('should return true for HR', () => {
    expect(canManageUsers('HR')).toBe(true);
  });

  it('should return false for DEVELOPER', () => {
    expect(canManageUsers('DEVELOPER')).toBe(false);
  });

  it('should return false for INTERN', () => {
    expect(canManageUsers('INTERN')).toBe(false);
  });
});

describe('canManageTasks', () => {
  it('should return true for CEO', () => {
    expect(canManageTasks('CEO')).toBe(true);
  });

  it('should return true for MANAGER', () => {
    expect(canManageTasks('MANAGER')).toBe(true);
  });

  it('should return true for DEVELOPER', () => {
    expect(canManageTasks('DEVELOPER')).toBe(true);
  });

  it('should return true for HR', () => {
    expect(canManageTasks('HR')).toBe(true);
  });

  it('should return false for INTERN', () => {
    expect(canManageTasks('INTERN')).toBe(false);
  });
});

describe('canManageSalary', () => {
  it('should return true for CEO', () => {
    expect(canManageSalary('CEO')).toBe(true);
  });

  it('should return true for ACCOUNTANT', () => {
    expect(canManageSalary('ACCOUNTANT')).toBe(true);
  });

  it('should return false for MANAGER', () => {
    expect(canManageSalary('MANAGER')).toBe(false);
  });

  it('should return false for DEVELOPER', () => {
    expect(canManageSalary('DEVELOPER')).toBe(false);
  });
});

describe('canViewSalary', () => {
  it('should return true for CEO', () => {
    expect(canViewSalary('CEO')).toBe(true);
  });

  it('should return true for MANAGER', () => {
    expect(canViewSalary('MANAGER')).toBe(true);
  });

  it('should return true for ACCOUNTANT', () => {
    expect(canViewSalary('ACCOUNTANT')).toBe(true);
  });

  it('should return false for DEVELOPER', () => {
    expect(canViewSalary('DEVELOPER')).toBe(false);
  });

  it('should return false for INTERN', () => {
    expect(canViewSalary('INTERN')).toBe(false);
  });
});

describe('canSendMessage', () => {
  it('should return true for all roles', () => {
    const roles: Role[] = [
      'CEO',
      'MANAGER',
      'DEVELOPER',
      'DESIGNER',
      'MARKETER',
      'HR',
      'SALES',
      'INTERN',
      'ACCOUNTANT',
      'SUPPORT',
    ];
    roles.forEach((role) => {
      expect(canSendMessage(role)).toBe(true);
    });
  });
});

describe('canManageCompany', () => {
  it('should return true for CEO', () => {
    expect(canManageCompany('CEO')).toBe(true);
  });

  it('should return false for MANAGER', () => {
    expect(canManageCompany('MANAGER')).toBe(false);
  });

  it('should return false for HR', () => {
    expect(canManageCompany('HR')).toBe(false);
  });
});

describe('canAssignRole', () => {
  it('permits CEO to assign any role', () => {
    expect(canAssignRole('CEO', 'CEO')).toBe(true);
    expect(canAssignRole('CEO', 'MANAGER')).toBe(true);
    expect(canAssignRole('CEO', 'INTERN')).toBe(true);
  });

  it('prevents MANAGER from assigning or promoting to MANAGER', () => {
    expect(canAssignRole('MANAGER', 'MANAGER')).toBe(false);
  });

  it('prevents MANAGER from assigning to CEO', () => {
    expect(canAssignRole('MANAGER', 'CEO')).toBe(false);
  });

  it('prevents HR from assigning to MANAGER or CEO', () => {
    expect(canAssignRole('HR', 'MANAGER')).toBe(false);
    expect(canAssignRole('HR', 'CEO')).toBe(false);
  });

  it('permits MANAGER to assign a lower-ranked role', () => {
    expect(canAssignRole('MANAGER', 'DEVELOPER')).toBe(true);
    expect(canAssignRole('MANAGER', 'INTERN')).toBe(true);
  });

  it('permits HR to assign a lower-ranked role', () => {
    expect(canAssignRole('HR', 'DEVELOPER')).toBe(true);
    expect(canAssignRole('HR', 'INTERN')).toBe(true);
  });

  it('prevents equal-ranked non-CEO role assignment', () => {
    // HR cannot assign another HR (same rank)
    expect(canAssignRole('HR', 'HR')).toBe(false);
  });
});

describe('canReviewJoinRequests', () => {
  it('should return true for CEO', () => {
    expect(canReviewJoinRequests('CEO')).toBe(true);
  });

  it('should return true for MANAGER', () => {
    expect(canReviewJoinRequests('MANAGER')).toBe(true);
  });

  it('should return true for HR', () => {
    expect(canReviewJoinRequests('HR')).toBe(true);
  });

  it('should return false for DEVELOPER', () => {
    expect(canReviewJoinRequests('DEVELOPER')).toBe(false);
  });

  it('should return false for INTERN', () => {
    expect(canReviewJoinRequests('INTERN')).toBe(false);
  });
});
