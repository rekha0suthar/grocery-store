import { AuthorizationPolicy } from '../../../services/AuthorizationPolicy';
import { User } from '../../../entities/User.js';

describe('AuthorizationPolicy - Application Policy', () => {
  let policy;

  beforeEach(() => {
    policy = new AuthorizationPolicy();
  });

  describe('Role-based Permissions', () => {
    test('admin has all permissions', () => {
      expect(policy.can('admin', 'manageUsers')).toBe(true);
      expect(policy.can('admin', 'manageProducts')).toBe(true);
      expect(policy.can('admin', 'manageCategories')).toBe(true);
      expect(policy.can('admin', 'approveStoreManagers')).toBe(true);
      expect(policy.can('admin', 'placeOrders')).toBe(true);
      expect(policy.can('admin', 'viewOrders')).toBe(true);
      expect(policy.can('admin', 'viewAllOrders')).toBe(true);
      expect(policy.can('admin', 'viewUserDetails')).toBe(true);
      expect(policy.can('admin', 'editUserDetails')).toBe(true);
    });

    test('store manager has limited permissions', () => {
      expect(policy.can('store_manager', 'manageUsers')).toBe(false);
      expect(policy.can('store_manager', 'manageProducts')).toBe(true);
      expect(policy.can('store_manager', 'manageCategories')).toBe(false);
      expect(policy.can('store_manager', 'approveStoreManagers')).toBe(false);
      expect(policy.can('store_manager', 'placeOrders')).toBe(true);
      expect(policy.can('store_manager', 'viewOrders')).toBe(true);
      expect(policy.can('store_manager', 'viewAllOrders')).toBe(true);
      expect(policy.can('store_manager', 'viewUserDetails')).toBe(true);
      expect(policy.can('store_manager', 'editUserDetails')).toBe(false);
    });

    test('customer has basic permissions', () => {
      expect(policy.can('customer', 'manageUsers')).toBe(false);
      expect(policy.can('customer', 'manageProducts')).toBe(false);
      expect(policy.can('customer', 'manageCategories')).toBe(false);
      expect(policy.can('customer', 'approveStoreManagers')).toBe(false);
      expect(policy.can('customer', 'placeOrders')).toBe(true);
      expect(policy.can('customer', 'viewOrders')).toBe(true);
      expect(policy.can('customer', 'viewAllOrders')).toBe(false);
      expect(policy.can('customer', 'viewUserDetails')).toBe(false);
      expect(policy.can('customer', 'editUserDetails')).toBe(false);
    });

    test('unknown role has no permissions', () => {
      expect(policy.can('unknown', 'manageUsers')).toBe(false);
      expect(policy.can('unknown', 'placeOrders')).toBe(false);
    });
  });

  describe('Permission Queries', () => {
    test('gets all permissions for a role', () => {
      const adminPermissions = policy.getPermissions('admin');
      expect(adminPermissions).toContain('manageUsers');
      expect(adminPermissions).toContain('manageProducts');
      expect(adminPermissions).toContain('placeOrders');
      expect(adminPermissions.length).toBeGreaterThan(5);

      const customerPermissions = policy.getPermissions('customer');
      expect(customerPermissions).toContain('placeOrders');
      expect(customerPermissions).toContain('viewOrders');
      expect(customerPermissions).not.toContain('manageUsers');
    });

    test('returns empty array for unknown role', () => {
      const permissions = policy.getPermissions('unknown');
      expect(permissions).toEqual([]);
    });
  });

  describe('User-specific Authorization', () => {
    test('allows viewing own user details', () => {
      const currentUser = new User({ id: 'user-1', role: 'customer' });
      const targetUser = new User({ id: 'user-1', role: 'customer' });
      
      expect(policy.canViewUserDetails(currentUser, targetUser)).toBe(true);
    });

    test('allows admins to view any user details', () => {
      const adminUser = new User({ id: 'admin-1', role: 'admin' });
      const targetUser = new User({ id: 'user-1', role: 'customer' });
      
      expect(policy.canViewUserDetails(adminUser, targetUser)).toBe(true);
    });

    test('prevents viewing other users details without permission', () => {
      const currentUser = new User({ id: 'user-1', role: 'customer' });
      const targetUser = new User({ id: 'user-2', role: 'customer' });
      
      expect(policy.canViewUserDetails(currentUser, targetUser)).toBe(false);
    });

    test('allows editing own user details', () => {
      const currentUser = new User({ id: 'user-1', role: 'customer' });
      const targetUser = new User({ id: 'user-1', role: 'customer' });
      
      expect(policy.canEditUserDetails(currentUser, targetUser)).toBe(true);
    });

    test('allows admins to edit any user details', () => {
      const adminUser = new User({ id: 'admin-1', role: 'admin' });
      const targetUser = new User({ id: 'user-1', role: 'customer' });
      
      expect(policy.canEditUserDetails(adminUser, targetUser)).toBe(true);
    });

    test('prevents non-admins from editing admin details', () => {
      const currentUser = new User({ id: 'user-1', role: 'customer' });
      const adminUser = new User({ id: 'admin-1', role: 'admin' });
      
      expect(policy.canEditUserDetails(currentUser, adminUser)).toBe(false);
    });

    test('prevents editing other users details without permission', () => {
      const currentUser = new User({ id: 'user-1', role: 'customer' });
      const targetUser = new User({ id: 'user-2', role: 'customer' });
      
      expect(policy.canEditUserDetails(currentUser, targetUser)).toBe(false);
    });
  });

  describe('Table-driven Permission Tests', () => {
    test.each`
      role             | permission              | expected
      ${'admin'}       | ${'manageUsers'}        | ${true}
      ${'admin'}       | ${'manageProducts'}     | ${true}
      ${'admin'}       | ${'placeOrders'}        | ${true}
      ${'store_manager'}| ${'manageUsers'}       | ${false}
      ${'store_manager'}| ${'manageProducts'}    | ${true}
      ${'store_manager'}| ${'placeOrders'}       | ${true}
      ${'customer'}    | ${'manageUsers'}        | ${false}
      ${'customer'}    | ${'manageProducts'}     | ${false}
      ${'customer'}    | ${'placeOrders'}        | ${true}
      ${'customer'}    | ${'viewAllOrders'}      | ${false}
    `('$role -> $permission = $expected', ({ role, permission, expected }) => {
      expect(policy.can(role, permission)).toBe(expected);
    });
  });
});
