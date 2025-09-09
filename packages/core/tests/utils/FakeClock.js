export class FakeClock {
  constructor(initialTime = new Date()) {
    this.currentTime = new Date(initialTime);
  }

  now() {
    return new Date(this.currentTime);
  }

  timestamp() {
    return this.currentTime.getTime();
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

  tick(milliseconds) {
    this.currentTime = new Date(this.currentTime.getTime() + milliseconds);
  }

  setTime(time) {
    this.currentTime = new Date(time);
  }

  advance(milliseconds) {
    this.tick(milliseconds);
  }
}