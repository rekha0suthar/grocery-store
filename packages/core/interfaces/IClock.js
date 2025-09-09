/**
 * Clock Interface
 * 
 * Provides time-related operations for the core domain.
 * This interface allows for dependency injection of time operations,
 * making the core domain deterministic and testable.
 */
export class IClock {
  /**
   * Get the current date and time
   * @returns {Date} Current date and time
   */
  now() {
    throw new Error('IClock.now() must be implemented');
  }

  /**
   * Get the current timestamp in milliseconds
   * @returns {number} Current timestamp
   */
  timestamp() {
    throw new Error('IClock.timestamp() must be implemented');
  }

  /**
   * Create a new Date instance
   * @param {string|number|Date} value - Date value
   * @returns {Date} Date instance
   */
  createDate(value) {
    throw new Error('IClock.createDate() must be implemented');
  }

  /**
   * Add time to a date
   * @param {Date} date - Base date
   * @param {number} milliseconds - Milliseconds to add
   * @returns {Date} New date with time added
   */
  addTime(date, milliseconds) {
    throw new Error('IClock.addTime() must be implemented');
  }

  /**
   * Check if a date is before another date
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {boolean} True if date1 is before date2
   */
  isBefore(date1, date2) {
    throw new Error('IClock.isBefore() must be implemented');
  }

  /**
   * Check if a date is after another date
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {boolean} True if date1 is after date2
   */
  isAfter(date1, date2) {
    throw new Error('IClock.isAfter() must be implemented');
  }
}
