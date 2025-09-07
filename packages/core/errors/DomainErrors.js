/**
 * Domain Errors - Typed errors for business rule violations
 */

export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidTransitionError extends DomainError {
  constructor(from, to, reason = '') {
    super(`Invalid transition from ${from} to ${to}${reason ? ': ' + reason : ''}`);
    this.from = from;
    this.to = to;
  }
}

export class ValidationError extends DomainError {
  constructor(field, value, reason) {
    super(`Invalid ${field}: ${value} - ${reason}`);
    this.field = field;
    this.value = value;
  }
}

export class BusinessRuleError extends DomainError {
  constructor(rule, reason) {
    super(`Business rule violation: ${rule} - ${reason}`);
    this.rule = rule;
  }
}
