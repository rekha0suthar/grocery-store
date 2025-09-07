import { LoginPolicy } from '../../../services/LoginPolicy';
import { FakeClock } from '../../utils/FakeClock';

describe('LoginPolicy - Application Policy', () => {
  let clock;
  let policy;

  beforeEach(() => {
    clock = new FakeClock(new Date('2024-01-01T10:00:00Z'));
    policy = new LoginPolicy({ maxAttempts: 3, lockoutDurationMs: 60000 }, clock); // 1 minute lockout
  });

  describe('Login State Management', () => {
    test('creates initial login state', () => {
      const state = policy.createLoginState();
      
      expect(state.attempts).toBe(0);
      expect(state.lockedUntil).toBeNull();
    });

    test('records failed login attempts', () => {
      const state = policy.createLoginState();
      
      policy.recordFailure(state);
      expect(state.attempts).toBe(1);
      expect(policy.isLocked(state)).toBe(false);
      
      policy.recordFailure(state);
      expect(state.attempts).toBe(2);
      expect(policy.isLocked(state)).toBe(false);
    });

    test('locks account after max attempts', () => {
      const state = policy.createLoginState();
      
      // Record failures up to max attempts
      policy.recordFailure(state);
      policy.recordFailure(state);
      policy.recordFailure(state);
      
      expect(state.attempts).toBe(3);
      expect(policy.isLocked(state)).toBe(true);
      expect(state.lockedUntil).toBeInstanceOf(Date);
      expect(state.lockedUntil.getTime()).toBe(clock.now().getTime() + 60000);
    });

    test('resets attempts on successful login', () => {
      const state = policy.createLoginState();
      
      policy.recordFailure(state);
      policy.recordFailure(state);
      expect(state.attempts).toBe(2);
      
      policy.recordSuccess(state);
      expect(state.attempts).toBe(0);
      expect(state.lockedUntil).toBeNull();
    });
  });

  describe('Lockout Logic', () => {
    test('checks lockout status correctly', () => {
      const state = policy.createLoginState();
      
      expect(policy.isLocked(state)).toBe(false);
      
      // Lock the account
      state.lockedUntil = new Date(clock.now().getTime() + 60000);
      expect(policy.isLocked(state)).toBe(true);
      
      // Advance time past lockout
      clock.advance(61000);
      expect(policy.isLocked(state)).toBe(false);
    });

    test('calculates remaining lockout time', () => {
      const state = policy.createLoginState();
      state.lockedUntil = new Date(clock.now().getTime() + 30000);
      
      expect(policy.getRemainingLockoutTime(state)).toBe(30000);
      
      clock.advance(10000);
      expect(policy.getRemainingLockoutTime(state)).toBe(20000);
      
      clock.advance(25000);
      expect(policy.getRemainingLockoutTime(state)).toBe(0);
    });
  });

  describe('Configuration', () => {
    test('uses custom configuration', () => {
      const customPolicy = new LoginPolicy({ 
        maxAttempts: 5, 
        lockoutDurationMs: 120000 
      }, clock);
      
      const state = customPolicy.createLoginState();
      
      // Should not lock after 3 attempts with custom max of 5
      for (let i = 0; i < 3; i++) {
        customPolicy.recordFailure(state);
      }
      expect(customPolicy.isLocked(state)).toBe(false);
      
      // Should lock after 5 attempts
      customPolicy.recordFailure(state);
      customPolicy.recordFailure(state);
      expect(customPolicy.isLocked(state)).toBe(true);
      expect(state.lockedUntil.getTime()).toBe(clock.now().getTime() + 120000);
    });

    test('uses default configuration when none provided', () => {
      const defaultPolicy = new LoginPolicy({}, clock);
      const state = defaultPolicy.createLoginState();
      
      // Default max attempts is 5
      for (let i = 0; i < 5; i++) {
        defaultPolicy.recordFailure(state);
      }
      expect(defaultPolicy.isLocked(state)).toBe(true);
    });
  });
});
