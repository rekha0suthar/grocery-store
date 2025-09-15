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
