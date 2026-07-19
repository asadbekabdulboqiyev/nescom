import { Role } from '../roles';
import {
  canManageUsers,
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

  it('should return false for HR', () => {
    expect(canManageTasks('HR')).toBe(false);
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
    const roles: Role[] = ['CEO', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'MARKETER', 'HR', 'SALES', 'INTERN', 'ACCOUNTANT', 'SUPPORT'];
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
