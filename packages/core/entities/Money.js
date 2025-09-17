/**
 * Money Value Object - Represents monetary amounts with currency
 */
export class Money {
  constructor(amount, currency = 'USD') {
    if (typeof amount !== 'number') {
      throw new Error('Money.amount must be a number');
    }
    if (amount < 0) {
      throw new Error('Money.amount cannot be negative');
    }
    this.amount = amount;
    this.currency = currency;
  }

  add(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor) {
    return new Money(this.amount * factor, this.currency);
  }

  divide(factor) {
    if (factor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Money(this.amount / factor, this.currency);
  }

  equals(other) {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount > other.amount;
  }

  isLessThan(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount < other.amount;
  }

  toString() {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency
    };
  }
}
