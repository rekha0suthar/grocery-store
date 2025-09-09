/**
 * Default Clock Implementation
 * 
 * A simple clock implementation that uses the system Date object.
 * This is used as a fallback when no clock is injected.
 * 
 * Note: This is in the adapters layer, not the core domain,
 * so it can use system dependencies like Date.
 */
export class DefaultClock {
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
