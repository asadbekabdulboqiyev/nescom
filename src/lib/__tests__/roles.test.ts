import { ROLES, ALL_ROLES, hasPermission, hasAnyPermission, Role } from '../roles';

describe('ROLES', () => {
  it('should have all roles defined', () => {
    expect(Object.keys(ROLES)).toHaveLength(10);
    expect(ROLES.CEO).toBeDefined();
    expect(ROLES.MANAGER).toBeDefined();
    expect(ROLES.DEVELOPER).toBeDefined();
    expect(ROLES.DESIGNER).toBeDefined();
    expect(ROLES.MARKETER).toBeDefined();
    expect(ROLES.HR).toBeDefined();
    expect(ROLES.SALES).toBeDefined();
    expect(ROLES.INTERN).toBeDefined();
    expect(ROLES.ACCOUNTANT).toBeDefined();
    expect(ROLES.SUPPORT).toBeDefined();
  });

  it('should have correct labels', () => {
    expect(ROLES.CEO.label).toBe('CEO');
    expect(ROLES.MANAGER.label).toBe('Manager');
    expect(ROLES.DEVELOPER.label).toBe('Developer');
  });

  it('should have permissions array for each role', () => {
    Object.values(ROLES).forEach((role) => {
      expect(Array.isArray(role.permissions)).toBe(true);
      expect(role.permissions.length).toBeGreaterThan(0);
    });
  });

  it('CEO should have all permissions', () => {
    const allPermissions = [
      'employees:read', 'employees:write', 'employees:delete',
      'tasks:read', 'tasks:write', 'tasks:delete', 'tasks:assign',
      'salary:read', 'salary:write',
      'messages:read', 'messages:write',
      'settings:read', 'settings:write',
      'company:manage',
      'join-requests:read', 'join-requests:approve',
    ];
    allPermissions.forEach((perm) => {
      expect(ROLES.CEO.permissions).toContain(perm);
    });
  });
});

describe('ALL_ROLES', () => {
  it('should contain all 10 roles', () => {
    expect(ALL_ROLES).toHaveLength(10);
  });

  it('should include all role keys', () => {
    const expected: Role[] = ['CEO', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'MARKETER', 'HR', 'SALES', 'INTERN', 'ACCOUNTANT', 'SUPPORT'];
    expected.forEach((role) => {
      expect(ALL_ROLES).toContain(role);
    });
  });
});

describe('hasPermission', () => {
  it('should return true when role has permission', () => {
    expect(hasPermission('CEO', 'employees:read')).toBe(true);
    expect(hasPermission('CEO', 'company:manage')).toBe(true);
  });

  it('should return false when role lacks permission', () => {
    expect(hasPermission('INTERN', 'employees:write')).toBe(false);
    expect(hasPermission('DEVELOPER', 'company:manage')).toBe(false);
  });

  it('should handle non-existent permission', () => {
    expect(hasPermission('CEO', 'nonexistent:permission')).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  it('should return true if role has any of the permissions', () => {
    expect(hasAnyPermission('CEO', ['employees:read', 'company:manage'])).toBe(true);
    expect(hasAnyPermission('INTERN', ['tasks:read', 'employees:write'])).toBe(true);
  });

  it('should return false if role has none of the permissions', () => {
    expect(hasAnyPermission('INTERN', ['employees:write', 'company:manage'])).toBe(false);
  });

  it('should handle empty permissions array', () => {
    expect(hasAnyPermission('CEO', [])).toBe(false);
  });
});
