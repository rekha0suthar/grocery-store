/**
 * Fake Clock for testing time-dependent logic
 */
export class FakeClock {
  constructor(initialTime = new Date()) {
    this.currentTime = initialTime;
  }

  now() {
    return new Date(this.currentTime);
  }

  advance(milliseconds) {
    this.currentTime = new Date(this.currentTime.getTime() + milliseconds);
  }

  setTime(time) {
    this.currentTime = new Date(time);
  }
}
