/**
 * Login Policy - Application-specific business rules for authentication
 * 
 * Handles login attempt tracking, lockout logic, and time-based policies.
 * Uses dependency injection for time to make it testable.
 */
export class LoginPolicy {
  constructor(config = {}, clock = null) {
    this.maxAttempts = config.maxAttempts || 5;
    this.lockoutDurationMs = config.lockoutDurationMs || (2 * 60 * 60 * 1000); // 2 hours
    this.clock = clock || { now: () => new Date() };
  }

  // Create initial login state
  createLoginState() {
    return {
      attempts: 0,
      lockedUntil: null
    };
  }

  // Record a failed login attempt
  recordFailure(loginState) {
    loginState.attempts += 1;
    
    if (this.shouldLockAccount(loginState)) {
      loginState.lockedUntil = new Date(this.clock.now().getTime() + this.lockoutDurationMs);
    }
    
    return loginState;
  }

  // Record a successful login
  recordSuccess(loginState) {
    loginState.attempts = 0;
    loginState.lockedUntil = null;
    return loginState;
  }

  // Check if account should be locked
  shouldLockAccount(loginState) {
    return loginState.attempts >= this.maxAttempts;
  }

  // Check if account is currently locked
  isLocked(loginState) {
    if (!loginState.lockedUntil) return false;
    return loginState.lockedUntil > this.clock.now();
  }

  // Get remaining lockout time in milliseconds
  getRemainingLockoutTime(loginState) {
    if (!this.isLocked(loginState)) return 0;
    return Math.max(0, loginState.lockedUntil.getTime() - this.clock.now().getTime());
  }
}
