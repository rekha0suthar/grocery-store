import { IClock } from '@grocery-store/core/interfaces/IClock.js';

/**
 * System Clock Implementation
 * 
 * Provides real system time operations for production use.
 * This implementation uses the actual system clock.
 */
export class SystemClock extends IClock {
  now() {
    return new Date();
  }

  timestamp() {
    return Date.now();
  }

  createDate(value) {
    return new Date(value);
  }

  addTime(date, milliseconds) {
    return new Date(date.getTime() + milliseconds);
  }

  isBefore(date1, date2) {
    return date1.getTime() < date2.getTime();
  }

  isAfter(date1, date2) {
    return date1.getTime() > date2.getTime();
  }
}
